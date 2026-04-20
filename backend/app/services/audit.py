import json

from sqlalchemy.orm import Session

from app.models import AuditEvent


def write_audit(
    db: Session,
    tenant_id: str,
    actor_user_id: str,
    action: str,
    entity_type: str,
    entity_id: str,
    details: dict,
) -> None:
    event = AuditEvent(
        tenant_id=tenant_id,
        actor_user_id=actor_user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=json.dumps(details),
    )
    db.add(event)

