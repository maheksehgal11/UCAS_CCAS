from datetime import date, datetime, timedelta, timezone
from random import Random

from sqlalchemy.orm import Session

from app.models import (
    BillingModel,
    Customer,
    Invoice,
    InvoiceStatus,
    Payment,
    Product,
    Subscription,
    SubscriptionStatus,
    UsageEvent,
)
from app.services.billing import run_billing_cycle
from app.services.rating import rate_unrated_events


def _first_day_of_month(today: date) -> date:
    return date(today.year, today.month, 1)


def _last_day_prev_month(today: date) -> date:
    return _first_day_of_month(today) - timedelta(days=1)


def _first_day_prev_month(today: date) -> date:
    end = _last_day_prev_month(today)
    return date(end.year, end.month, 1)


def seed_demo_data(db: Session, tenant_id: str) -> dict[str, int]:
    counts = {
        "customers": 0,
        "products": 0,
        "subscriptions": 0,
        "usage_events": 0,
        "rated_events": 0,
        "invoices": 0,
        "payments": 0,
    }
    today = datetime.now(timezone.utc).date()
    rng = Random(42)

    customer_rows = [
        ("ACC-TATA-HQ", "Tata Tele Business HQ", "billing@tata.example", "27AABCT1332L1ZN", "MH", 12000000),
        ("ACC-SW-DEL", "SoftwareOne India Delhi", "finops@softwareone.example", "07AAACS1234J1ZD", "DL", 7500000),
        ("ACC-RED-CHN", "Redington Chennai", "ap@redington.example", "33AAACR4422L1Z8", "TN", 5200000),
        ("ACC-NTT-BLR", "NTT Bengaluru", "billing@ntt.example", "29AACCN8892F1Z7", "KA", 4100000),
        ("ACC-ZOM-MUM", "Zomato India Mumbai", "ar@zomato.example", "27AAACZ9234L1Z0", "MH", 3800000),
        ("ACC-ICI-HYD", "ICICI Securities Hyderabad", "finance@icici.example", "36AAACI4432P1ZU", "TS", 4600000),
    ]
    customers: list[Customer] = []
    for code, legal_name, email, gstin, state_code, credit_limit in customer_rows:
        existing = db.query(Customer).filter(Customer.tenant_id == tenant_id, Customer.customer_code == code).first()
        if existing:
            customers.append(existing)
            continue
        customer = Customer(
            tenant_id=tenant_id,
            customer_code=code,
            legal_name=legal_name,
            email=email,
            gstin=gstin,
            state_code=state_code,
            credit_limit=credit_limit,
        )
        db.add(customer)
        customers.append(customer)
        counts["customers"] += 1

    product_rows = [
        ("UC-500", "uCaaS Business 500", BillingModel.HYBRID, 210000, 0.68, 60),
        ("CC-PRO", "CCaaS Pro Suite", BillingModel.HYBRID, 165000, 0.52, 60),
        ("ANL-PLUS", "Analytics Plus", BillingModel.RECURRING, 90000, 0.0, 60),
        ("WHATS-API", "WhatsApp API Usage", BillingModel.USAGE, 0, 0.35, 1),
    ]
    products: list[Product] = []
    for sku, name, model, recurring_fee, unit_rate, pulse in product_rows:
        existing = db.query(Product).filter(Product.tenant_id == tenant_id, Product.sku == sku).first()
        if existing:
            products.append(existing)
            continue
        product = Product(
            tenant_id=tenant_id,
            sku=sku,
            name=name,
            billing_model=model,
            recurring_fee=recurring_fee,
            unit_rate=unit_rate,
            pulse_seconds=pulse,
        )
        db.add(product)
        products.append(product)
        counts["products"] += 1

    db.flush()

    sub_start = _first_day_prev_month(today)
    for idx, customer in enumerate(customers):
        for product in products[:3]:
            existing = (
                db.query(Subscription)
                .filter(
                    Subscription.tenant_id == tenant_id,
                    Subscription.customer_id == customer.id,
                    Subscription.product_id == product.id,
                )
                .first()
            )
            if existing:
                continue
            subscription = Subscription(
                tenant_id=tenant_id,
                customer_id=customer.id,
                product_id=product.id,
                quantity=(idx % 4) + 1,
                start_date=sub_start,
                status=SubscriptionStatus.ACTIVE,
            )
            db.add(subscription)
            counts["subscriptions"] += 1

    db.flush()
    subscriptions = db.query(Subscription).filter(Subscription.tenant_id == tenant_id).all()
    if subscriptions:
        for i in range(140):
            subscription = subscriptions[i % len(subscriptions)]
            ref = f"CDR-{today:%Y%m}-{i:04d}"
            existing = db.query(UsageEvent).filter(UsageEvent.tenant_id == tenant_id, UsageEvent.event_ref == ref).first()
            if existing:
                continue
            event_time = datetime.now(timezone.utc) - timedelta(days=rng.randint(0, 28), minutes=rng.randint(1, 600))
            duration = rng.randint(45, 900)
            units = round(rng.uniform(1, 40), 2)
            db.add(
                UsageEvent(
                    tenant_id=tenant_id,
                    customer_id=subscription.customer_id,
                    subscription_id=subscription.id,
                    event_ref=ref,
                    duration_seconds=duration,
                    units=units,
                    event_time=event_time,
                    circle_code=rng.choice(["MH", "KA", "TN", "DL", "GJ"]),
                )
            )
            counts["usage_events"] += 1

    db.flush()
    counts["rated_events"] = rate_unrated_events(db, tenant_id)

    cycle_prev_start = _first_day_prev_month(today)
    cycle_prev_end = _last_day_prev_month(today)
    cycle_curr_start = _first_day_of_month(today)
    cycle_curr_end = today

    prev_cycle_exists = (
        db.query(Invoice.id)
        .filter(Invoice.tenant_id == tenant_id, Invoice.cycle_start == cycle_prev_start, Invoice.cycle_end == cycle_prev_end)
        .first()
    )
    curr_cycle_exists = (
        db.query(Invoice.id)
        .filter(Invoice.tenant_id == tenant_id, Invoice.cycle_start == cycle_curr_start, Invoice.cycle_end == cycle_curr_end)
        .first()
    )
    if not prev_cycle_exists:
        counts["invoices"] += run_billing_cycle(db, tenant_id, cycle_prev_start, cycle_prev_end)
    if not curr_cycle_exists:
        counts["invoices"] += run_billing_cycle(db, tenant_id, cycle_curr_start, cycle_curr_end)

    db.flush()
    invoices = db.query(Invoice).filter(Invoice.tenant_id == tenant_id).order_by(Invoice.created_at.asc()).all()
    for idx, invoice in enumerate(invoices[:6]):
        ref = f"PMT-DEMO-{idx+1:03d}"
        existing = db.query(Payment).filter(Payment.tenant_id == tenant_id, Payment.reference == ref).first()
        if existing:
            continue
        pay_ratio = 1.0 if idx % 2 == 0 else 0.5
        amount = round(float(invoice.total_amount) * pay_ratio, 2)
        db.add(
            Payment(
                tenant_id=tenant_id,
                invoice_id=invoice.id,
                amount=amount,
                reference=ref,
                method="net_banking" if idx % 2 == 0 else "razorpay",
            )
        )
        if pay_ratio >= 1.0:
            invoice.status = InvoiceStatus.PAID
        counts["payments"] += 1

    return counts
