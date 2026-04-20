from collections import defaultdict
from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import (
    BillingModel,
    Customer,
    Invoice,
    InvoiceLine,
    Product,
    RatedEvent,
    Subscription,
    SubscriptionStatus,
)


def _overlap_days(start_a: date, end_a: date, start_b: date, end_b: date) -> int:
    start = max(start_a, start_b)
    end = min(end_a, end_b)
    if end < start:
        return 0
    return (end - start).days + 1


def _invoice_prefix(cycle_end: date) -> str:
    return cycle_end.strftime("%Y%m")


def _existing_invoice_count(db: Session, tenant_id: str, prefix: str) -> int:
    count = (
        db.query(func.count(Invoice.id))
        .filter(
            Invoice.tenant_id == tenant_id,
            func.strftime("%Y%m", Invoice.cycle_end) == prefix if settings.database_url.startswith("sqlite") else func.to_char(Invoice.cycle_end, "YYYYMM") == prefix,
        )
        .scalar()
    )
    return int(count or 0)


def _compute_tax(customer_state_code: str, subtotal: float) -> tuple[float, float, float]:
    if customer_state_code.upper() == settings.supplier_state_code.upper():
        cgst = round(subtotal * 0.09, 2)
        sgst = round(subtotal * 0.09, 2)
        igst = 0.0
    else:
        cgst = 0.0
        sgst = 0.0
        igst = round(subtotal * 0.18, 2)
    return cgst, sgst, igst


def run_billing_cycle(db: Session, tenant_id: str, cycle_start: date, cycle_end: date) -> int:
    subscriptions = (
        db.query(Subscription)
        .filter(
            Subscription.tenant_id == tenant_id,
            Subscription.status == SubscriptionStatus.ACTIVE,
            Subscription.start_date <= cycle_end,
            (Subscription.end_date.is_(None) | (Subscription.end_date >= cycle_start)),
        )
        .all()
    )
    if not subscriptions:
        return 0

    days_in_cycle = max((cycle_end - cycle_start).days + 1, 1)
    invoice_buckets: dict[str, list[InvoiceLine]] = defaultdict(list)

    usage_charge_map = dict(
        db.query(Subscription.customer_id, func.sum(RatedEvent.rated_amount))
        .join(Subscription, Subscription.id == RatedEvent.subscription_id)
        .filter(
            RatedEvent.tenant_id == tenant_id,
            func.date(RatedEvent.rated_at) >= cycle_start,
            func.date(RatedEvent.rated_at) <= cycle_end,
        )
        .group_by(Subscription.customer_id)
        .all()
    )

    for sub in subscriptions:
        product = db.query(Product).filter(Product.id == sub.product_id, Product.tenant_id == tenant_id).first()
        if not product:
            continue
        sub_end = sub.end_date or cycle_end
        active_days = _overlap_days(sub.start_date, sub_end, cycle_start, cycle_end)
        if active_days == 0:
            continue

        if product.billing_model in {BillingModel.RECURRING, BillingModel.HYBRID}:
            prorated = (float(product.recurring_fee) * sub.quantity * active_days) / days_in_cycle
            invoice_buckets[sub.customer_id].append(
                InvoiceLine(
                    line_type="recurring",
                    description=f"{product.name} recurring charge ({active_days}/{days_in_cycle} days)",
                    quantity=sub.quantity,
                    unit_price=round(float(product.recurring_fee), 4),
                    line_amount=round(prorated, 2),
                )
            )

    for customer_id, usage_total in usage_charge_map.items():
        if usage_total and float(usage_total) > 0:
            invoice_buckets[customer_id].append(
                InvoiceLine(
                    line_type="usage",
                    description="Usage-based charge from rated events",
                    quantity=1,
                    unit_price=round(float(usage_total), 4),
                    line_amount=round(float(usage_total), 2),
                )
            )

    invoice_count = 0
    prefix = _invoice_prefix(cycle_end)
    current_seq = _existing_invoice_count(db, tenant_id, prefix)
    for customer_id, lines in invoice_buckets.items():
        subtotal = round(sum(float(line.line_amount) for line in lines), 2)
        if subtotal <= 0:
            continue
        customer = db.query(Customer).filter(Customer.id == customer_id, Customer.tenant_id == tenant_id).first()
        if not customer:
            continue
        cgst, sgst, igst = _compute_tax(customer.state_code, subtotal)
        current_seq += 1
        invoice = Invoice(
            tenant_id=tenant_id,
            customer_id=customer_id,
            invoice_number=f"INV-{prefix}-{current_seq:05d}",
            cycle_start=cycle_start,
            cycle_end=cycle_end,
            subtotal=subtotal,
            cgst_amount=cgst,
            sgst_amount=sgst,
            igst_amount=igst,
            total_amount=round(subtotal + cgst + sgst + igst, 2),
            lines=lines,
        )
        db.add(invoice)
        invoice_count += 1

    return invoice_count
