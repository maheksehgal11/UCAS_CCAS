from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models import Role, User
from app.schemas.common import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_prefix}/auth/login")


def get_tenant_header(x_tenant_id: Annotated[str | None, Header()] = None) -> str | None:
    return x_tenant_id


def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    token: Annotated[str, Depends(oauth2_scheme)] = None,
    tenant_header: Annotated[str | None, Depends(get_tenant_header)] = None,
) -> User:
    # Open access: always return the first user (or create a dummy if none exists)
    user = db.query(User).first()
    if not user:
        # Create a dummy user if none exists
        from app.models import Role, User as UserModel
        user = UserModel(
            id="open-access",
            tenant_id="open-tenant",
            full_name="Open Access",
            email="open@access",
            password_hash="",
            role=Role.SUPER_ADMIN,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def require_roles(*allowed: Role):
    # Open access: no-op, always allow
    def role_guard(current_user: Annotated[User, Depends(get_current_user)]) -> User:
        return current_user
    return role_guard
