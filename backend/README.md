# Backend - UCaaS + CCaaS Unified Billing Core

FastAPI service implementing a multi-tenant enterprise billing platform core:

- JWT auth + tenant isolation via `X-Tenant-Id`
- RBAC (`super_admin`, `tenant_admin`, `billing_manager`, `sales_rep`, `read_only`)
- Customer/Product/Subscription management
- Usage ingestion, rating engine, billing cycle invoice generation
- GST split logic (CGST/SGST or IGST)
- Payment posting + invoice reconciliation
- Immutable audit events

## Run

```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## First-time bootstrap

1. `POST /api/v1/setup/bootstrap`
2. `POST /api/v1/auth/login`
3. Use returned Bearer token and set `X-Tenant-Id` header on all protected APIs.

Swagger UI: `http://localhost:8000/docs`

