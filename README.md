# AgriSync — AI-Based Rural Cold Storage Booking & Independent Inventory Management System

**AgriSync** is a production-minded web application designed for smallholder farmers and cold storage facility owners across rural Tamil Nadu agro-clusters (Oddanchatram, Dindigul, Palani, Madurai).

---

## 🏛️ Non-Negotiable Core Architectural Invariants

1. **Two Strictly Independent Workflows**:
   - **Cold Storage Booking Management**: Farmers discover cold chain facilities, query multi-interval capacity across booking dates, calculate cost estimates, perform atomic reservations, and obtain digital gate passes. **Creating a booking never creates an inventory record or alters physical stock.**
   - **Normal Inventory Management**: Facility owners independently register products and crop batches, record walk-in deliveries with **zero booking prerequisite**, verify gate scale intake, perform partial withdrawals, transfer stock between chambers, log damage/spoilage adjustments, and maintain an immutable movement audit ledger. An optional booking reference may be linked when booked goods physically arrive, but is never mandatory.
2. **Dual Independent Capacity Accounting**:
   - **Physical Occupancy Ledger**: Measures physical produce present in storage chambers (`kg` & crates).
   - **Reserved Capacity Ledger**: Measures capacity committed to active reservations over specific calendar windows.
   - These two metrics are displayed separately on owner dashboards and are never conflated.
3. **Strict Non-Autonomous AI Architecture**:
   - AI price arbitrage, mandi market forecasts, and predictive capacity alerts are purely advisory.
   - AI algorithms are **strictly forbidden** from automatically modifying booking dates, mutating stock balances, or adjusting financial records.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v20/v24)
- **Python**: v3.10+ (tested on Python 3.11)

### 2. Backend Setup (FastAPI + SQLAlchemy)

```bash
# Navigate to project root
cd "c:\FULL STACK DEVELOPMENT\MINI PROJECT"

# Install Python backend dependencies
pip install fastapi uvicorn sqlalchemy pydantic pytest httpx pandas scikit-learn

# Seed the database with Tamil Nadu cold chain facilities, chambers & test users
python -m backend.app.seed

# Start the unified FastAPI backend server (Runs on port 8000)
uvicorn backend.main:app --reload --port 8000
```
- API Docs (Swagger UI): `http://localhost:8000/docs`
- Interactive OpenAPI ReDoc: `http://localhost:8000/redoc`

### 3. Frontend Setup (React + Vite + Tailwind CSS + TypeScript)

```bash
# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```
The application will launch at `http://localhost:5173/`.

### 4. Running Acceptance Tests

Execute the 10 critical architectural and business logic separation acceptance tests:

```bash
pytest backend/tests/test_master_acceptance.py -v
```

All 10 tests will verify:
- **Test A**: Creating a booking alone does NOT create inventory batches.
- **Test B**: Normal inventory intake without booking succeeds.
- **Test C**: Physical withdrawal deducts stock correctly and prevents negative stock.
- **Test D**: Booking cancellation releases reserved capacity without deleting unrelated inventory.
- **Test E**: Intake with optional booking increases physical stock only by verified quantity.
- **Test F**: Simultaneous / conflicting reservations exceeding rated capacity are blocked atomically.
- **Test G**: Excessive withdrawals are rejected.
- **Test H**: Inter-chamber stock transfers conserve total facility stock.
- **Test I**: AI capacity warnings do not change quantities or mutate bookings.
- **Test J**: Batches with active physical stock cannot be prematurely archived.

---

## 🧩 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Canvas Confetti |
| **State Management** | React Context (`AppContext.tsx`), Typed REST Client (`src/lib/api.ts`) |
| **Backend** | Python FastAPI, Pydantic V2 (`ConfigDict`), Starlette CORS |
| **Persistence** | SQLAlchemy ORM, SQLite (`agrisync.db`) with instant Supabase/PostgreSQL compatibility |
| **AI & Forecasting** | Scikit-learn / Linear Econometric Price Arbitrage, Local Rule-based alert fallbacks, optional Ollama LLM |
| **Security & Auth** | Role-based Authorization (`farmer`, `owner`, `admin`), PIN Gate Pass authentication, Audit Logging |

---

## 📱 Role Navigation & Screen Architecture

### 1. Public & Authentication
- `/` — Public Landing Page (APMC mandi ticker, dual module overview, How It Works)
- `/login` — One-Click Persona Login (`Murugan S.` Farmer, `Arumugam P.` Owner, `Dr. Jayakumar IAS` Admin)
- `/register` — Role-based user onboarding

### 2. Farmer Experience (`/farmer/*`)
- `/farmer/home` — Farmer telemetry, active produce, temperature monitoring
- `/discovery` — Cold storage directory with location & crop filters
- `/facility/:id` — Facility details, chamber specs, live telemetry & reviews
- `/wizard` — Multi-step capacity selection, multi-interval availability check & pricing engine
- `/farmer/bookings` — My Bookings, Gate Pass QR code, PIN verification & cancellation
- `/capacity-conflict` — Space deficit notice with 4 farmer consent options
- `/ai-arbitrage` — Mandi crop price forecasting & cold storage profit simulator
- `/live-inspection/:code` — Virtual PTZ optical camera inspection booth
- `/feedback-revisit/:code` — Post-service star rating & dispute management

### 3. Storage Owner Experience (`/owner/*`)
- `/owner/dashboard` — Dual capacity ledger summary, quick actions, and alerts
- `/owner/bookings` — Booking management, status transitions, and gate check-in
- `/owner/inventory` — Independent Normal Inventory Dashboard with 10-operation menu
- `/owner/inventory/new` — **Operation 1**: Register New Crop Batch (no booking needed)
- `/owner/inventory/intake` — **Operation 2**: Physical Scale Intake (verified weight)
- `/owner/inventory/withdrawal` — **Operation 3**: Physical Withdrawal (non-negative enforcement)
- `/owner/inventory/transfer` — **Operation 4**: Inter-Chamber Transfer (total stock conserved)
- `/owner/inventory/adjust` — **Operation 5**: Damage / Spoilage Adjustment with mandatory reason
- `/owner/inventory/history` — **Operation 6**: Immutable Transaction Ledger with CSV export
- `/owner/locations` — **Operation 7**: Chamber management & maintenance locks
- `/owner/ai-insights` — **Operation 8**: Advisory AI Insights & predictive alerts
- `/profile` — Facility settings & vernacular language switch (English / தமிழ்)

### 4. Administrator Experience (`/admin/*`)
- `/admin/dashboard` — System-wide governance, facility approvals, capacity overviews
- `/admin/audit` — Immutable platform audit trail

---

## 📡 Backend REST API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register farmer, owner, or administrator
- `POST /api/auth/login` — Authenticate and receive session token
- `GET /api/auth/me` — Retrieve current authenticated profile

### Facilities & Capacity (`/api/facilities`)
- `GET /api/facilities` — List all cold storage hubs
- `GET /api/facilities/{facility_id}` — Get facility details and chamber telemetry
- `GET /api/facilities/{facility_id}/availability` — Multi-interval capacity calculation
- `POST /api/facilities` — Register new cold storage facility (Owner/Admin)

### Bookings (`/api/bookings`)
- `POST /api/bookings` — Atomic capacity reservation
- `GET /api/bookings` — List bookings filtered by user role
- `GET /api/bookings/{booking_id}` — Booking details & digital gate pass
- `POST /api/bookings/{booking_id}/cancel` — Cancel booking and release reserved capacity
- `POST /api/bookings/{booking_id}/reviews` — Submit farmer review or grievance

### Independent Inventory (`/api/inventory`)
- `POST /api/inventory/batches` — Register product/batch without booking
- `GET /api/inventory/batches` — List physical batches in storage
- `POST /api/inventory/intake` — Record physical scale intake
- `POST /api/inventory/withdrawal` — Record physical withdrawal
- `POST /api/inventory/transfers` — Transfer stock between chambers
- `POST /api/inventory/adjustments` — Stock adjustment (spoilage/count correction)
- `GET /api/inventory/transactions` — Immutable movement audit trail
- `GET /api/inventory/summary` — Physical occupancy metrics

### Dashboard & Advisory AI (`/api/dashboard`, `/api/ai`)
- `GET /api/dashboard/owner` — Unified metrics with separated capacity ledgers
- `GET /api/ai/insights` — Non-autonomous predictive alerts and demand forecasting
- `GET /api/ai/forecast` — Mandi crop price forecasting and arbitrage simulation

---

## 🛡️ Integrity & Verification Summary

| Check | Status | Verification Method |
|---|---|---|
| Frontend Build | ✅ PASS | `npm run build` (Vite v8.3.4, TypeScript strict compilation) |
| Backend Acceptance Suite | ✅ 10/10 PASS | `pytest backend/tests/test_master_acceptance.py` |
| Independent Inventory | ✅ VERIFIED | Batches registered without booking ID in backend & frontend |
| Dual Capacity Ledgers | ✅ VERIFIED | Physical occupancy and reserved capacity calculated on separate ledgers |
| Bilingual Support | ✅ VERIFIED | English & Tamil (தமிழ்) toggle operational across all components |
