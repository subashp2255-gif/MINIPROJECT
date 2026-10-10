# Smart Rural Storage (SRS)
### AI-Based Rural Cold Storage Booking & Inventory Management

> **Source of Truth Visual Specification**: Recreated faithfully from Google Stitch design specifications with Plus Jakarta Sans & Noto Sans typography, Deep Harvest Foliage (`#1E5E3A`) & Fresh Sprout Emerald (`#006C49`) color palettes, dual Tamil & English vernacular toggle, and field-ready responsive cards.

---

## 🌾 Overview & Core Value Proposition

**Smart Rural Storage** connects smallholder farmers in Tamil Nadu (Oddanchatram, Dindigul, Palani, Madurai) with decentralized solar-backed cold chain storage hubs. The platform eliminates distress selling during mandi harvest gluts through:

1. **AI Price Forecasting & Arbitrage**: Computes price trajectory vs. cold chamber daily rental fee, demonstrating net profit arbitrage before booking.
2. **Atomic Capacity Reservation**: Locks physical chamber crates atomically to eliminate double-booking and concurrent capacity conflicts.
3. **Field-Ready Digital Gate Pass**: Procedurally rendered SVG QR code with 4-digit PIN for rapid truck weighing and chamber slotting.
4. **Authoritative Batch Inventory**: Tracks booked vs. verified intake vs. partial withdrawals with timestamped movement audit trails.
5. **Capacity Conflict Resolution**: When chamber capacity drops due to mandatory compressor maintenance, farmers receive visual notice with 4 actionable choices (Accept partial, Reroute, Reschedule, or Instant Refund).
6. **Optical Live Inspection**: Virtual camera booth with PTZ zoom controls to monitor condensation and crop freshness without opening doors.
7. **Bilingual Native Experience**: Seamless instantaneous toggle between **English** and **தமிழ் (Tamil)** across every screen.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **Python**: v3.10+ (for optional AI microservice)

### 2. Frontend Setup (React + Vite + Tailwind CSS)
```bash
# Clone and enter directory
cd "MINI PROJECT"

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```
The application will launch at `http://localhost:5173/`.

### 3. Build & Production Preview
```bash
# Verify TypeScript & compile production bundle
npm run build

# Preview production build locally
npm run preview
```

### 4. Optional: Python FastAPI AI Microservice
```bash
# Navigate to AI service folder
cd ai-service

# Install python dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload --port 8000
```
API documentation will be available at `http://localhost:8000/docs`.

---

## 🗄️ Database Setup (Supabase PostgreSQL)

1. Create a project in [Supabase](https://supabase.com).
2. Open the **SQL Editor** in the Supabase dashboard.
3. Copy and run the contents of [`supabase/schema.sql`](./supabase/schema.sql).
4. The schema includes:
   - Normalized tables: `profiles`, `facilities`, `storage_units`, `bookings`, `inventory_batches`, `inventory_movements`, `reviews`, `notifications`.
   - Row Level Security (RLS) policies protecting farmer records and facility owner operations.
   - Atomic database procedure: `reserve_cold_storage_capacity` with row-level locks (`FOR UPDATE`).
5. Set your `.env` variables from `.env.example`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_AI_API_URL=http://localhost:8000
```

---

## 📱 Implemented Screen Checklist

| Screen | Route | Stitch Design Reference | Functionality |
|---|---|---|---|
| **Service Selection** | `/service-selection` | Entry Point | Choice between Cold Storage & Central Inventory |
| **Farmer Home** | `/farmer/home` | `farmer_home_active_storage_hub` | Active lot telemetry, Spoilage variance gauge, Mandi forecast preview, Nearby hubs |
| **Chamber Discovery** | `/discovery` | Regional GIS Hubs | Search by village, crop filter, interactive map & list views |
| **Facility Details** | `/facility/:id` | Unit Telemetry | Chamber specs, live temperature, manager details, reviews |
| **Booking Wizard** | `/wizard` | Booking Flow | Multi-step capacity selection, transparent billing breakdown, atomic reservation |
| **Gate Pass & Timeline** | `/booking/:code/confirmation` | `booking_receipt_gate_pass_timeline` | Confetti delight burst, SVG QR Code, PIN 4892, 5-stage gate pass lifecycle |
| **Crop Batch Inventory** | `/farmer/inventory` | `farmer_inventory_crop_batch_hub` | Batches, stored weight vs booked, progress bars, partial withdrawal modal |
| **Conflict Resolution** | `/capacity-conflict` | `capacity_conflict_resolution` | Space deficit meter (-40%), manager voice log, 4 farmer consent options |
| **AI Price Arbitrage** | `/ai-arbitrage` | `ai_crop_price_forecast_storage_arbitrage` | 7/14/30d horizons, interactive Recharts confidence intervals, profit simulator |
| **Live Inspection** | `/live-inspection/:code` | Virtual Camera Booth | Simulated chamber PTZ feed, zoom controls, discrepancy incident reporting |
| **Feedback & Revisit** | `/feedback-revisit/:code` | Trust & Repeat Booking | 1-5 star review, quick rebook flow or trackable complaint ticket (`#DISP-88`) |
| **Owner Dashboard** | `/owner/dashboard` | Facility Console | Capacity utilization, live chamber telemetry, gate weighing scale station |
| **Central Inventory** | `/central/inventory` | Enterprise Ledger | All warehouse batches, movement audit logs, CSV ledger export |
| **Activity & Alerts** | `/activity` | Notification Center | Pickup alerts, gate pass notices, chamber temperature alerts |
| **Profile Settings** | `/profile` | User Settings | Switch farmer/owner/admin persona, English/Tamil toggle, Supabase config |

---

## 🎨 Design System & Accessibility

- **Font Pairing**: `Plus Jakarta Sans` for headers and action surfaces + `Noto Sans` for vernacular structural readability (English + Tamil script).
- **Light Theme Only**: Specifically built in high-contrast light mode (`#f4fbf3` surface) to guarantee zero glare under direct midday field sunlight.
- **Touch Targets**: Minimum 48px to 52px interactive button heights for effortless operation with weathered hands or farming gloves.
