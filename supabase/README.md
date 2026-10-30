# Rural Agri Sync — Supabase Integration & Setup Guide

This guide walks you through setting up and connecting your real Supabase PostgreSQL database with **Rural Agri Sync**.

---

## 1. Supabase Project Setup

1. Go to [https://supabase.com](https://supabase.com) and create an account or sign in.
2. Click **New Project** and name it (e.g. `rural-agri-sync`).
3. Select your preferred database region (e.g., `ap-south-1` Mumbai for India / Tamil Nadu low latency).
4. Save your **Database Password** securely.

---

## 2. Run Database Migrations in SQL Editor

Open your Supabase Project Dashboard, navigate to the **SQL Editor** tab on the left menu, and execute the SQL scripts in this exact order:

### Step 2.1: Schema, Tables, RPCs & RLS Policies
Copy and paste the entire contents of [`supabase/schema.sql`](file:///c:/FULL%20STACK%20DEVELOPMENT/MINI%20PROJECT/supabase/schema.sql) (or [`supabase/migrations/20261028_001_initial_schema.sql`](file:///c:/FULL%20STACK%20DEVELOPMENT/MINI%20PROJECT/supabase/migrations/20261028_001_initial_schema.sql)) into the SQL Editor and click **RUN**.

This will create:
- **Extensions**: `uuid-ossp`, `pgcrypto`
- **Tables**:
  - `public.profiles`: Farmer, Owner, and Admin profiles linked directly to `auth.users(id)`.
  - `public.storage_facilities`: Cold storage warehouses and dry units with capacity constraints (`available_capacity_kg <= capacity_kg`).
  - `public.bookings`: Reservations with server-side date range, duration, and cost validation.
  - `public.crop_batches`: Authoritative stock batches independently manageable by storage owners without requiring a booking.
  - `public.inventory_transactions`: Immutable audit ledger for stock movements (`stock_in`, `stock_out`, `adjustment`).
- **Triggers**:
  - `handle_new_user()` on `auth.users` insert (auto-populates profiles, prevents public self-assignment to admin).
  - `prevent_role_escalation()` on `public.profiles` (blocks users from elevating their role).
  - `check_facility_owner_role()` (ensures only owners can create facilities).
  - `check_booking_farmer_role()` (ensures farmers create bookings).
  - `handle_updated_at()` auto-updating timestamps.
- **Atomic Stored Procedures / RPCs**:
  - `create_booking_atomic`: Exclusively locks the facility row with `FOR UPDATE`, verifies available capacity, calculates cost and duration server-side, and deducts capacity atomically to prevent race conditions and overselling.
  - `update_booking_status_atomic`: Validates caller permissions, legal transitions, and atomically restores facility capacity when a booking is cancelled or rejected.
  - `record_inventory_transaction_atomic`: Exclusively locks the crop batch with `FOR UPDATE`, adjusts stock, prevents negative inventory, and appends an immutable transaction ledger row.
- **Row Level Security (RLS)**:
  - Enabled on all 5 tables with explicit policies.

### Step 2.2: Demo Seed Data (Optional for Testing)
Copy and paste the contents of [`supabase/migrations/20261028_002_seed_data.sql`](file:///c:/FULL%20STACK%20DEVELOPMENT/MINI%20PROJECT/supabase/migrations/20261028_002_seed_data.sql) into the SQL Editor and click **RUN**.
- Seeds Tamil Nadu demo cold facilities (Oddanchatram, Dindigul, Batlagundu).
- Seeds initial crop batches and sample bookings for immediate dashboard visualization.

---

## 3. Environment Variables Configuration

Copy your Supabase Project URL and Anon Public Key from **Project Settings -> API**:
1. Duplicate `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure your keys:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Restart the dev server or configure directly within the application:
   - Navigate to the **Profile** screen (`/profile`) in the app.
   - Expand the **Developer Tools & Backend Data Mode** card.
   - Enter your **Supabase project URL** and **Supabase anonymous API key**.
   - Click **Save & Connect to Supabase**. The application tests the connection immediately and syncs live data!

---

## 4. Manual Testing & Verification Checklist

Use this repeatable checklist to verify all aspects of the integration:

| # | Feature / Test Case | Steps to Test | Expected Result | Verified |
|---|---------------------|---------------|-----------------|----------|
| 1 | **Sign Up as Farmer** | Navigate to `/register`, enter Name, Phone, select "Farmer", submit. | Account created in Supabase Auth, profile row inserted in `profiles` with role `'farmer'`, redirects to `/farmer/home`. | [x] |
| 2 | **Sign Up as Storage Owner** | Navigate to `/register`, enter Name, Phone, select "Storage Owner", submit. | Account created in Supabase Auth, profile row inserted with role `'owner'`, redirects to `/owner/dashboard`. | [x] |
| 3 | **Sign In & Verified Role Redirect** | Sign in with registered credentials. | User is redirected to their verified database dashboard (Farmer Home or Owner Dashboard). | [x] |
| 4 | **Browse Facilities** | Go to `/discovery`, filter by location (Dindigul) and crop. | Active facilities loaded from `storage_facilities` table with real available capacity. | [x] |
| 5 | **Atomic Capacity Booking** | Book 500 kg for 10 days in Facility Detail / Wizard. | `create_booking_atomic` RPC reserves 500 kg, `available_capacity_kg` decreases by 500 kg atomically, booking created with status `'pending'`. | [x] |
| 6 | **Overselling Prevention** | Attempt to book more quantity than `available_capacity_kg`. | Database transaction rejects booking with error: "Insufficient capacity". No overselling. | [x] |
| 7 | **Booking Cancellation & Capacity Release** | Farmer cancels pending booking in `/farmer/bookings`. | `update_booking_status_atomic` sets status to `'cancelled'` and restores `available_capacity_kg` in `storage_facilities`. | [x] |
| 8 | **Owner Approval & Rejection** | Storage owner views pending bookings in `/owner/bookings`, clicks "Approve" or "Reject". | `update_booking_status_atomic` updates status. If rejected, capacity is released back to facility. | [x] |
| 9 | **Independent Inventory Intake** | Storage owner goes to `/owner/inventory/new` and creates a batch without any prior booking. | Batch created in `crop_batches` table, initial stock-in transaction logged in `inventory_transactions`. | [x] |
| 10 | **Stock Transactions & Negative Prevention** | Storage owner records withdrawal on batch in `/owner/inventory/withdrawal`. | `record_inventory_transaction_atomic` deducts stock. Attempting to withdraw more than available stock fails with error. | [x] |
| 11 | **RLS Enforcement** | Authenticated farmer attempts to query another farmer's booking or update facility. | Blocked by PostgreSQL Row Level Security policies. | [x] |
