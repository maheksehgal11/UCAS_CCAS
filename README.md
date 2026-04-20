# UCaaS + CCaaS Unified Billing Platform

Enterprise-grade implementation starter based on your architecture blueprint, covering:

- Multi-tenant platform with strict tenant isolation
- JWT auth + RBAC controls
- Customer, Product Catalog, Subscription lifecycle APIs
- Usage ingestion -> Rating engine -> Billing run -> Invoice generation
- GST-compliant tax split (CGST/SGST or IGST)
- Payments and reconciliation status updates
- Immutable audit event trail
- Operations UI for billing teams
- One-click demo seeding for all core entities

## Project Structure

- `backend`: FastAPI service with billing core logic and API contracts
- `frontend`: React + TypeScript operations console
- `docker-compose.yml`: One-command local deployment

## Local Run

### 1) Backend

```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`  
API docs: `http://localhost:8000/docs`

## Docker Run

```bash
docker compose up --build
```

Frontend (nginx): `http://localhost:5173`  
Backend: `http://localhost:8000`

## Bootstrap and First Login

1. Call `POST /api/v1/setup/bootstrap` once:

```json
{
  "tenant_name": "Tata Tele",
  "tenant_code": "TATATELE",
  "admin_name": "Platform Admin",
  "admin_email": "admin@tatatele.example",
  "admin_password": "StrongPass#123"
}
```

2. Login with `POST /api/v1/auth/login` using admin email/password.
3. Read `tenant_id` from the login response.
4. Use this `X-Tenant-Id` value in all subsequent protected requests.

## Mapped Architecture Domains in This Implementation

- Channel/UI Layer: React operations console
- Orchestration Layer: API workflows for onboarding, rating, billing
- BSS Core: product catalog, usage mediation input, rating, billing and invoicing
- Finance Layer: payments and invoice status reconciliation
- Governance Layer: RBAC, audit events, tenant boundaries

## Demo Data

After login, use the Dashboard button **Load Demo Data** (or call `POST /api/v1/setup/seed-demo`) to auto-populate:

- Customers
- Product catalog
- Subscriptions
- Usage events
- Rated events
- Invoices
- Payments

## Next Enterprise Enhancements

1. Move from SQLite to PostgreSQL + read replicas.
2. Add Kafka event streams for real mediation/rating pipelines.
3. Introduce workflow orchestration (Camunda) for CLM journeys.
4. Add CI/CD, observability (OpenTelemetry, Prometheus, Grafana), and security scans.
5. Add SAP GL adapters, payment gateway connectors, and GSTN integration.
