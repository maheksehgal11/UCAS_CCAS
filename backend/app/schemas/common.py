from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class APIMessage(BaseModel):
    message: str


class Token(BaseModel):
    access_token: str
    tenant_id: str
    role: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str
    tenant_id: str
    role: str
    exp: int


class DashboardSummary(BaseModel):
    active_customers: int
    active_subscriptions: int
    month_invoice_total: float
    month_collections_total: float


class DailyCount(BaseModel):
    day: date
    count: int


class InvoiceLineOut(BaseModel):
    line_type: str
    description: str
    quantity: float
    unit_price: float
    line_amount: float

    model_config = ConfigDict(from_attributes=True)


class InvoiceOut(BaseModel):
    id: str
    invoice_number: str
    customer_id: str
    cycle_start: date
    cycle_end: date
    subtotal: float
    cgst_amount: float
    sgst_amount: float
    igst_amount: float
    total_amount: float
    status: str
    created_at: datetime
    lines: list[InvoiceLineOut]

    model_config = ConfigDict(from_attributes=True)
