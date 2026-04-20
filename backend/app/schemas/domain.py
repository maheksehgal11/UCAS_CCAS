from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class BootstrapRequest(BaseModel):
    tenant_name: str = Field(min_length=2, max_length=200)
    tenant_code: str = Field(min_length=2, max_length=50)
    admin_name: str = Field(min_length=2, max_length=200)
    admin_email: EmailStr
    admin_password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserMe(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: str
    tenant_id: str

    model_config = ConfigDict(from_attributes=True)


class CustomerCreate(BaseModel):
    customer_code: str
    legal_name: str
    email: EmailStr | None = None
    gstin: str | None = None
    state_code: str = "MH"
    credit_limit: float = 0


class CustomerOut(CustomerCreate):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductCreate(BaseModel):
    sku: str
    name: str
    billing_model: str
    recurring_fee: float = 0
    unit_rate: float = 0
    pulse_seconds: int = 60


class ProductOut(ProductCreate):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SubscriptionCreate(BaseModel):
    customer_id: str
    product_id: str
    quantity: int = 1
    start_date: date
    end_date: date | None = None
    status: str = "active"


class SubscriptionOut(SubscriptionCreate):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UsageEventCreate(BaseModel):
    customer_id: str
    subscription_id: str
    event_ref: str
    duration_seconds: int = 0
    units: float = 0
    event_time: datetime
    circle_code: str | None = None


class BillingRunRequest(BaseModel):
    cycle_start: date
    cycle_end: date


class PaymentCreate(BaseModel):
    invoice_id: str
    amount: float
    reference: str
    method: str = "bank_transfer"

