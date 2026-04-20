from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.session import get_db
from app.models import (
    BillingModel,
    Customer,
    Invoice,
    InvoiceStatus,
    Payment,
    Product,
    Role,
    Subscription,
    SubscriptionStatus,
    Tenant,
    UsageEvent,
    User,
)
from app.schemas.common import APIMessage, DailyCount, DashboardSummary, InvoiceOut, Token
from app.schemas.domain import (
    BillingRunRequest,
    BootstrapRequest,
    CustomerCreate,
    CustomerOut,
    LoginRequest,
    PaymentCreate,
    ProductCreate,
    ProductOut,
    SubscriptionCreate,
    SubscriptionOut,
    UsageEventCreate,
    UserMe,
)
from app.services.audit import write_audit
from app.services.billing import run_billing_cycle
from app.services.rating import rate_unrated_events
from app.services.seed import seed_demo_data

router = APIRouter()


def _as_float(value: Decimal | float | int | None) -> float:
    return float(value or 0)


@router.get("/health", response_model=APIMessage)
def health() -> APIMessage:
    return APIMessage(message="ok")


@router.post("/setup/bootstrap", response_model=APIMessage)
def bootstrap(payload: BootstrapRequest, db: Annotated[Session, Depends(get_db)]) -> APIMessage:
    existing_user = db.query(User).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Platform already bootstrapped")

    tenant = Tenant(name=payload.tenant_name, code=payload.tenant_code.upper())
    db.add(tenant)
    db.flush()

    admin = User(
        tenant_id=tenant.id,
        full_name=payload.admin_name,
        email=payload.admin_email.lower(),
        password_hash=get_password_hash(payload.admin_password),
        role=Role.TENANT_ADMIN,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    return APIMessage(message="Bootstrap completed. You can now login.")


@router.post("/auth/login", response_model=Token)
def login(payload: LoginRequest, db: Annotated[Session, Depends(get_db)]) -> Token:
    user = db.query(User).filter(User.email == payload.email.lower(), User.is_active.is_(True)).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(subject=user.id, tenant_id=user.tenant_id, role=user.role.value)
    return Token(access_token=token, tenant_id=user.tenant_id, role=user.role.value)


@router.get("/auth/me", response_model=UserMe)
def me(current_user: Annotated[User, Depends(get_current_user)]) -> UserMe:
    return UserMe.model_validate(current_user)


@router.post("/customers", response_model=CustomerOut)
def create_customer(
    payload: CustomerCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.SALES_REP, Role.BILLING_MANAGER))],
) -> CustomerOut:
    exists = (
        db.query(Customer)
        .filter(Customer.tenant_id == current_user.tenant_id, Customer.customer_code == payload.customer_code)
        .first()
    )
    if exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Customer code already exists")
    customer = Customer(tenant_id=current_user.tenant_id, **payload.model_dump())
    db.add(customer)
    write_audit(
        db,
        tenant_id=current_user.tenant_id,
        actor_user_id=current_user.id,
        action="customer_created",
        entity_type="customer",
        entity_id=customer.id,
        details={"customer_code": payload.customer_code},
    )
    db.commit()
    db.refresh(customer)
    return CustomerOut.model_validate(customer)


@router.get("/customers", response_model=list[CustomerOut])
def list_customers(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[CustomerOut]:
    rows = db.query(Customer).filter(Customer.tenant_id == current_user.tenant_id).order_by(Customer.created_at.desc()).all()
    return [CustomerOut.model_validate(x) for x in rows]


@router.post("/products", response_model=ProductOut)
def create_product(
    payload: ProductCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.BILLING_MANAGER))],
) -> ProductOut:
    exists = db.query(Product).filter(Product.tenant_id == current_user.tenant_id, Product.sku == payload.sku).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU already exists")

    try:
        billing_model = BillingModel(payload.billing_model)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid billing_model") from exc

    product = Product(
        tenant_id=current_user.tenant_id,
        sku=payload.sku,
        name=payload.name,
        billing_model=billing_model,
        recurring_fee=payload.recurring_fee,
        unit_rate=payload.unit_rate,
        pulse_seconds=payload.pulse_seconds,
    )
    db.add(product)
    write_audit(
        db,
        tenant_id=current_user.tenant_id,
        actor_user_id=current_user.id,
        action="product_created",
        entity_type="product",
        entity_id=product.id,
        details={"sku": payload.sku},
    )
    db.commit()
    db.refresh(product)
    return ProductOut.model_validate(product)


@router.get("/products", response_model=list[ProductOut])
def list_products(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[ProductOut]:
    rows = db.query(Product).filter(Product.tenant_id == current_user.tenant_id).order_by(Product.created_at.desc()).all()
    return [ProductOut.model_validate(x) for x in rows]


@router.post("/subscriptions", response_model=SubscriptionOut)
def create_subscription(
    payload: SubscriptionCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.SALES_REP, Role.BILLING_MANAGER))],
) -> SubscriptionOut:
    customer = db.query(Customer).filter(Customer.id == payload.customer_id, Customer.tenant_id == current_user.tenant_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    product = db.query(Product).filter(Product.id == payload.product_id, Product.tenant_id == current_user.tenant_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    try:
        sub_status = SubscriptionStatus(payload.status)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid status") from exc

    subscription = Subscription(tenant_id=current_user.tenant_id, status=sub_status, **payload.model_dump(exclude={"status"}))
    db.add(subscription)
    write_audit(
        db,
        tenant_id=current_user.tenant_id,
        actor_user_id=current_user.id,
        action="subscription_created",
        entity_type="subscription",
        entity_id=subscription.id,
        details={"customer_id": payload.customer_id, "product_id": payload.product_id},
    )
    db.commit()
    db.refresh(subscription)
    return SubscriptionOut.model_validate(subscription)


@router.get("/subscriptions", response_model=list[SubscriptionOut])
def list_subscriptions(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[SubscriptionOut]:
    rows = db.query(Subscription).filter(Subscription.tenant_id == current_user.tenant_id).order_by(Subscription.created_at.desc()).all()
    return [SubscriptionOut.model_validate(x) for x in rows]


@router.post("/usage-events/ingest", response_model=APIMessage)
def ingest_usage_events(
    payload: list[UsageEventCreate],
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.BILLING_MANAGER))],
) -> APIMessage:
    inserted = 0
    for item in payload:
        exists = db.query(UsageEvent).filter(UsageEvent.tenant_id == current_user.tenant_id, UsageEvent.event_ref == item.event_ref).first()
        if exists:
            continue
        db.add(UsageEvent(tenant_id=current_user.tenant_id, **item.model_dump()))
        inserted += 1
    write_audit(
        db,
        tenant_id=current_user.tenant_id,
        actor_user_id=current_user.id,
        action="usage_ingested",
        entity_type="usage_events",
        entity_id=current_user.tenant_id,
        details={"count": inserted},
    )
    db.commit()
    return APIMessage(message=f"{inserted} usage events ingested")


@router.post("/rating/run", response_model=APIMessage)
def run_rating(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.BILLING_MANAGER))],
) -> APIMessage:
    count = rate_unrated_events(db, current_user.tenant_id)
    write_audit(
        db,
        tenant_id=current_user.tenant_id,
        actor_user_id=current_user.id,
        action="rating_run",
        entity_type="rating",
        entity_id=current_user.tenant_id,
        details={"rated_events": count},
    )
    db.commit()
    return APIMessage(message=f"Rating completed for {count} events")


@router.post("/billing/run", response_model=APIMessage)
def run_billing(
    payload: BillingRunRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.BILLING_MANAGER))],
) -> APIMessage:
    if payload.cycle_end < payload.cycle_start:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid cycle range")
    count = run_billing_cycle(db, current_user.tenant_id, payload.cycle_start, payload.cycle_end)
    write_audit(
        db,
        tenant_id=current_user.tenant_id,
        actor_user_id=current_user.id,
        action="billing_run",
        entity_type="billing",
        entity_id=current_user.tenant_id,
        details={"cycle_start": str(payload.cycle_start), "cycle_end": str(payload.cycle_end), "invoice_count": count},
    )
    db.commit()
    return APIMessage(message=f"Billing cycle completed. {count} invoices generated")


@router.get("/invoices", response_model=list[InvoiceOut])
def list_invoices(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[InvoiceOut]:
    rows = (
        db.query(Invoice)
        .filter(Invoice.tenant_id == current_user.tenant_id)
        .order_by(Invoice.created_at.desc())
        .all()
    )
    return [InvoiceOut.model_validate(i) for i in rows]


@router.post("/payments", response_model=APIMessage)
def post_payment(
    payload: PaymentCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.BILLING_MANAGER))],
) -> APIMessage:
    invoice = db.query(Invoice).filter(Invoice.id == payload.invoice_id, Invoice.tenant_id == current_user.tenant_id).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

    payment = Payment(
        tenant_id=current_user.tenant_id,
        invoice_id=payload.invoice_id,
        amount=payload.amount,
        reference=payload.reference,
        method=payload.method,
    )
    db.add(payment)

    paid_total = (
        db.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(Payment.tenant_id == current_user.tenant_id, Payment.invoice_id == payload.invoice_id)
        .scalar()
    )
    if _as_float(paid_total) + payload.amount >= _as_float(invoice.total_amount):
        invoice.status = InvoiceStatus.PAID

    write_audit(
        db,
        tenant_id=current_user.tenant_id,
        actor_user_id=current_user.id,
        action="payment_posted",
        entity_type="payment",
        entity_id=payload.reference,
        details={"invoice_id": payload.invoice_id, "amount": payload.amount},
    )
    db.commit()
    return APIMessage(message="Payment posted and reconciled")


@router.get("/dashboard/summary", response_model=DashboardSummary)
def dashboard_summary(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> DashboardSummary:
    now = datetime.now(timezone.utc)
    first_day = date(now.year, now.month, 1)
    active_customers = (
        db.query(func.count(Customer.id))
        .filter(Customer.tenant_id == current_user.tenant_id)
        .scalar()
    )
    active_subscriptions = (
        db.query(func.count(Subscription.id))
        .filter(Subscription.tenant_id == current_user.tenant_id, Subscription.status == SubscriptionStatus.ACTIVE)
        .scalar()
    )
    month_invoice_total = (
        db.query(func.coalesce(func.sum(Invoice.total_amount), 0))
        .filter(Invoice.tenant_id == current_user.tenant_id, Invoice.cycle_start >= first_day)
        .scalar()
    )
    month_collections_total = (
        db.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(Payment.tenant_id == current_user.tenant_id, func.date(Payment.paid_at) >= first_day)
        .scalar()
    )
    return DashboardSummary(
        active_customers=int(active_customers or 0),
        active_subscriptions=int(active_subscriptions or 0),
        month_invoice_total=_as_float(month_invoice_total),
        month_collections_total=_as_float(month_collections_total),
    )


@router.get("/dashboard/piu-counts", response_model=list[DailyCount])
def dashboard_piu_counts(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[DailyCount]:
    now = datetime.now(timezone.utc)
    start = date(now.year, now.month, 1)
    if now.month == 12:
        next_month = date(now.year + 1, 1, 1)
    else:
        next_month = date(now.year, now.month + 1, 1)

    rows = (
        db.query(
            func.date(UsageEvent.event_time).label("day"),
            func.count(UsageEvent.id).label("count"),
        )
        .filter(
            UsageEvent.tenant_id == current_user.tenant_id,
            func.date(UsageEvent.event_time) >= start,
            func.date(UsageEvent.event_time) < next_month,
        )
        .group_by("day")
        .order_by("day")
        .all()
    )

    return [DailyCount(day=day, count=int(count or 0)) for day, count in rows]


@router.post("/setup/seed-demo", response_model=APIMessage)
def setup_seed_demo(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles(Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.BILLING_MANAGER))],
) -> APIMessage:
    counts = seed_demo_data(db, current_user.tenant_id)
    write_audit(
        db,
        tenant_id=current_user.tenant_id,
        actor_user_id=current_user.id,
        action="demo_seed_run",
        entity_type="system",
        entity_id=current_user.tenant_id,
        details=counts,
    )
    db.commit()
    return APIMessage(message=f"Demo data ready: {counts}")
