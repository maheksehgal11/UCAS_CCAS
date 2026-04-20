import json
import math
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import BillingModel, Product, RatedEvent, Subscription, UsageEvent


def rate_unrated_events(db: Session, tenant_id: str) -> int:
    usage_events = (
        db.query(UsageEvent)
        .filter(UsageEvent.tenant_id == tenant_id, UsageEvent.is_rated.is_(False))
        .order_by(UsageEvent.event_time.asc())
        .all()
    )
    rated_count = 0
    for event in usage_events:
        subscription = db.query(Subscription).filter(Subscription.id == event.subscription_id, Subscription.tenant_id == tenant_id).first()
        if not subscription:
            continue
        product = db.query(Product).filter(Product.id == subscription.product_id, Product.tenant_id == tenant_id).first()
        if not product:
            continue

        amount = 0.0
        if product.billing_model in {BillingModel.USAGE, BillingModel.HYBRID}:
            if event.duration_seconds > 0:
                pulse = max(product.pulse_seconds, 1)
                pulse_count = math.ceil(event.duration_seconds / pulse)
                amount = float(pulse_count) * float(product.unit_rate) * subscription.quantity
            else:
                amount = float(event.units) * float(product.unit_rate) * subscription.quantity

        tariff_snapshot = {
            "model": product.billing_model.value,
            "unit_rate": float(product.unit_rate),
            "pulse_seconds": product.pulse_seconds,
            "rated_at": datetime.now(timezone.utc).isoformat(),
        }
        db.add(
            RatedEvent(
                tenant_id=tenant_id,
                usage_event_id=event.id,
                subscription_id=event.subscription_id,
                rated_amount=round(amount, 4),
                tariff_snapshot=json.dumps(tariff_snapshot),
            )
        )
        event.is_rated = True
        rated_count += 1

    return rated_count

