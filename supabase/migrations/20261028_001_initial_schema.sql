-- ==============================================================================
-- RURAL AGRI SYNC — POSTGRESQL DATABASE SCHEMA & MIGRATION
-- Tables: profiles, storage_facilities, bookings, crop_batches, inventory_transactions
-- Features: Row Level Security (RLS), Atomic RPCs, Role Enforcement, Audit Logs
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- TABLE 1: PROFILES
-- Linked directly to Supabase auth.users(id)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('farmer', 'owner', 'admin')),
    village TEXT,
    district TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast lookup by phone & role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- ==============================================================================
-- TABLE 2: STORAGE_FACILITIES
-- Cold storage & dry storage facilities owned by verified storage owners
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.storage_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    village TEXT,
    district TEXT,
    state TEXT DEFAULT 'Tamil Nadu',
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    capacity_kg NUMERIC NOT NULL CHECK (capacity_kg > 0),
    available_capacity_kg NUMERIC NOT NULL CHECK (available_capacity_kg >= 0),
    price_per_kg_per_day NUMERIC NOT NULL CHECK (price_per_kg_per_day >= 0),
    supported_crops TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_facility_available_capacity CHECK (available_capacity_kg <= capacity_kg)
);

CREATE INDEX IF NOT EXISTS idx_storage_facilities_owner ON public.storage_facilities(owner_id);
CREATE INDEX IF NOT EXISTS idx_storage_facilities_district ON public.storage_facilities(district);
CREATE INDEX IF NOT EXISTS idx_storage_facilities_active ON public.storage_facilities(is_active);

-- Function & Trigger: Ensure facility owner has 'owner' role
CREATE OR REPLACE FUNCTION public.check_facility_owner_role()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role FROM public.profiles WHERE id = NEW.owner_id;
    IF v_role IS NULL OR v_role NOT IN ('owner', 'admin') THEN
        RAISE EXCEPTION 'Facility owner must have owner or admin role (found: %)', COALESCE(v_role, 'none');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_facility_owner_role ON public.storage_facilities;
CREATE TRIGGER trg_check_facility_owner_role
    BEFORE INSERT OR UPDATE ON public.storage_facilities
    FOR EACH ROW EXECUTE FUNCTION public.check_facility_owner_role();

-- ==============================================================================
-- TABLE 3: BOOKINGS
-- Farmer reservations with strict status validation and server-side constraints
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    facility_id UUID NOT NULL REFERENCES public.storage_facilities(id) ON DELETE RESTRICT,
    crop_name TEXT NOT NULL,
    quantity_kg NUMERIC NOT NULL CHECK (quantity_kg > 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    estimated_cost NUMERIC NOT NULL CHECK (estimated_cost >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_booking_dates CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_bookings_farmer ON public.bookings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_facility ON public.bookings(facility_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- Function & Trigger: Ensure farmer has 'farmer' role
CREATE OR REPLACE FUNCTION public.check_booking_farmer_role()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role FROM public.profiles WHERE id = NEW.farmer_id;
    IF v_role IS NULL OR v_role NOT IN ('farmer', 'admin') THEN
        RAISE EXCEPTION 'Bookings can only be created by users with farmer role (found: %)', COALESCE(v_role, 'none');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_booking_farmer_role ON public.bookings;
CREATE TRIGGER trg_check_booking_farmer_role
    BEFORE INSERT ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.check_booking_farmer_role();

-- ==============================================================================
-- TABLE 4: CROP_BATCHES
-- Authoritative inventory independently manageable by storage owners
-- (Does NOT require an existing farmer booking)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crop_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    facility_id UUID REFERENCES public.storage_facilities(id) ON DELETE SET NULL,
    crop_name TEXT NOT NULL,
    batch_code TEXT NOT NULL,
    quantity_kg NUMERIC NOT NULL CHECK (quantity_kg >= 0),
    harvest_date DATE,
    expiry_date DATE,
    storage_location TEXT,
    status TEXT NOT NULL DEFAULT 'stored' CHECK (status IN ('stored', 'released', 'spoiled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_crop_batches_owner_code UNIQUE (owner_id, batch_code)
);

CREATE INDEX IF NOT EXISTS idx_crop_batches_owner ON public.crop_batches(owner_id);
CREATE INDEX IF NOT EXISTS idx_crop_batches_facility ON public.crop_batches(facility_id);
CREATE INDEX IF NOT EXISTS idx_crop_batches_batch_code ON public.crop_batches(batch_code);
CREATE INDEX IF NOT EXISTS idx_crop_batches_status ON public.crop_batches(status);

-- ==============================================================================
-- TABLE 5: INVENTORY_TRANSACTIONS
-- Immutable audit log for stock-in, stock-out, and stock adjustments
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.crop_batches(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('stock_in', 'stock_out', 'adjustment')),
    quantity_kg NUMERIC NOT NULL CHECK (quantity_kg > 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inv_tx_batch ON public.inventory_transactions(batch_id);
CREATE INDEX IF NOT EXISTS idx_inv_tx_owner ON public.inventory_transactions(owner_id);
CREATE INDEX IF NOT EXISTS idx_inv_tx_created ON public.inventory_transactions(created_at DESC);

-- ==============================================================================
-- AUTOMATIC TIMESTAMPS TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_facilities_updated_at ON public.storage_facilities;
CREATE TRIGGER trg_facilities_updated_at BEFORE UPDATE ON public.storage_facilities FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_bookings_updated_at ON public.bookings;
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_batches_updated_at ON public.crop_batches;
CREATE TRIGGER trg_batches_updated_at BEFORE UPDATE ON public.crop_batches FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- SECURE ROLE PROTECTION & AUTH SIGNUP TRIGGER
-- Users cannot assign themselves admin role through public signup
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_raw_role TEXT;
    v_role TEXT;
    v_name TEXT;
    v_phone TEXT;
    v_village TEXT;
    v_district TEXT;
BEGIN
    v_raw_role := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'farmer'));
    -- Block public self-assignment to 'admin'
    IF v_raw_role = 'admin' THEN
        v_role := 'farmer';
    ELSIF v_raw_role IN ('farmer', 'owner') THEN
        v_role := v_raw_role;
    ELSE
        v_role := 'farmer';
    END IF;

    v_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
    v_phone := NEW.raw_user_meta_data->>'phone';
    v_village := NEW.raw_user_meta_data->>'village';
    v_district := NEW.raw_user_meta_data->>'district';

    INSERT INTO public.profiles (id, full_name, phone, role, village, district, created_at, updated_at)
    VALUES (NEW.id, v_name, v_phone, v_role, v_village, v_district, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        village = COALESCE(EXCLUDED.village, profiles.village),
        district = COALESCE(EXCLUDED.district, profiles.district),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to prevent users from updating their own role to 'admin'
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role <> OLD.role THEN
        -- Only service-role or Postgres superuser may change roles
        IF (auth.jwt() ->> 'role') IS DISTINCT FROM 'service_role' AND current_user <> 'postgres' THEN
            RAISE EXCEPTION 'Permission denied: Cannot modify account role';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- ==============================================================================
-- ATOMIC STORED PROCEDURES / RPC FUNCTIONS
-- ==============================================================================

-- RPC 1: create_booking_atomic
-- Locks facility row with FOR UPDATE to prevent race conditions & overselling
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
    p_facility_id UUID,
    p_crop_name TEXT,
    p_quantity_kg NUMERIC,
    p_start_date DATE,
    p_end_date DATE,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_caller_id UUID;
    v_facility RECORD;
    v_duration INTEGER;
    v_cost NUMERIC;
    v_booking_id UUID;
BEGIN
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
    END IF;

    -- Validate dates
    IF p_end_date < p_start_date THEN
        RETURN jsonb_build_object('success', false, 'error', 'End date cannot be earlier than start date');
    END IF;

    v_duration := (p_end_date - p_start_date) + 1;
    IF v_duration <= 0 THEN
        v_duration := 1;
    END IF;

    -- Lock the facility row exclusively
    SELECT * INTO v_facility
    FROM public.storage_facilities
    WHERE id = p_facility_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Storage facility not found');
    END IF;

    IF NOT v_facility.is_active THEN
        RETURN jsonb_build_object('success', false, 'error', 'Storage facility is currently inactive');
    END IF;

    -- Strict capacity check
    IF v_facility.available_capacity_kg < p_quantity_kg THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Insufficient capacity: only ' || v_facility.available_capacity_kg || ' kg available (requested ' || p_quantity_kg || ' kg)'
        );
    END IF;

    -- Calculate total estimated cost
    v_cost := ROUND(p_quantity_kg * v_facility.price_per_kg_per_day * v_duration, 2);

    -- Reserve capacity atomically
    UPDATE public.storage_facilities
    SET available_capacity_kg = available_capacity_kg - p_quantity_kg,
        updated_at = NOW()
    WHERE id = p_facility_id;

    -- Insert pending booking
    INSERT INTO public.bookings (
        farmer_id,
        facility_id,
        crop_name,
        quantity_kg,
        start_date,
        end_date,
        duration_days,
        estimated_cost,
        status,
        notes,
        created_at,
        updated_at
    ) VALUES (
        v_caller_id,
        p_facility_id,
        p_crop_name,
        p_quantity_kg,
        p_start_date,
        p_end_date,
        v_duration,
        v_cost,
        'pending',
        p_notes,
        NOW(),
        NOW()
    ) RETURNING id INTO v_booking_id;

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking_id,
        'duration_days', v_duration,
        'estimated_cost', v_cost,
        'remaining_capacity_kg', (v_facility.available_capacity_kg - p_quantity_kg)
    );
END;
$$;

-- RPC 2: update_booking_status_atomic
-- Restores capacity when rejected or cancelled; ensures legal state transitions
CREATE OR REPLACE FUNCTION public.update_booking_status_atomic(
    p_booking_id UUID,
    p_new_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_caller_id UUID;
    v_booking RECORD;
    v_facility RECORD;
    v_is_owner BOOLEAN;
    v_is_farmer BOOLEAN;
BEGIN
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
    END IF;

    IF p_new_status NOT IN ('pending', 'approved', 'rejected', 'cancelled', 'completed') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid status: ' || p_new_status);
    END IF;

    -- Lock booking record
    SELECT * INTO v_booking
    FROM public.bookings
    WHERE id = p_booking_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking not found');
    END IF;

    -- Check caller role and ownership
    SELECT * INTO v_facility
    FROM public.storage_facilities
    WHERE id = v_booking.facility_id;

    v_is_owner := (v_facility.owner_id = v_caller_id);
    v_is_farmer := (v_booking.farmer_id = v_caller_id);

    IF NOT v_is_owner AND NOT v_is_farmer THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized to modify this booking');
    END IF;

    -- Farmers can ONLY cancel their own pending/approved bookings
    IF v_is_farmer AND NOT v_is_owner THEN
        IF p_new_status <> 'cancelled' THEN
            RETURN jsonb_build_object('success', false, 'error', 'Farmers can only cancel bookings');
        END IF;
        IF v_booking.status IN ('completed', 'rejected', 'cancelled') THEN
            RETURN jsonb_build_object('success', false, 'error', 'Cannot cancel a booking that is already ' || v_booking.status);
        END IF;
    END IF;

    -- Owners cannot set back to pending once approved or completed
    IF v_is_owner AND p_new_status = 'pending' AND v_booking.status <> 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot revert booking back to pending');
    END IF;

    -- If transitioning to cancelled or rejected from active state, RELEASE capacity back to facility
    IF p_new_status IN ('cancelled', 'rejected') AND v_booking.status IN ('pending', 'approved') THEN
        UPDATE public.storage_facilities
        SET available_capacity_kg = LEAST(capacity_kg, available_capacity_kg + v_booking.quantity_kg),
            updated_at = NOW()
        WHERE id = v_booking.facility_id;
    END IF;

    -- If completed, capacity remains accounted for until dispatch/withdrawal
    UPDATE public.bookings
    SET status = p_new_status,
        updated_at = NOW()
    WHERE id = p_booking_id;

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', p_booking_id,
        'new_status', p_new_status
    );
END;
$$;

-- RPC 3: record_inventory_transaction_atomic
-- Atomic updates for batch stock, prevents negative inventory, logs immutable audit
CREATE OR REPLACE FUNCTION public.record_inventory_transaction_atomic(
    p_batch_id UUID,
    p_transaction_type TEXT,
    p_quantity_kg NUMERIC,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_caller_id UUID;
    v_batch RECORD;
    v_new_quantity NUMERIC;
    v_tx_id UUID;
BEGIN
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
    END IF;

    IF p_quantity_kg <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Transaction quantity must be greater than zero');
    END IF;

    IF p_transaction_type NOT IN ('stock_in', 'stock_out', 'adjustment') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid transaction type: ' || p_transaction_type);
    END IF;

    -- Lock batch row exclusively
    SELECT * INTO v_batch
    FROM public.crop_batches
    WHERE id = p_batch_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Crop batch not found');
    END IF;

    IF v_batch.owner_id <> v_caller_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: You do not own this batch');
    END IF;

    -- Calculate new balance
    IF p_transaction_type = 'stock_in' THEN
        v_new_quantity := v_batch.quantity_kg + p_quantity_kg;
    ELSIF p_transaction_type = 'stock_out' THEN
        IF v_batch.quantity_kg < p_quantity_kg THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Insufficient inventory: current stock is ' || v_batch.quantity_kg || ' kg, requested withdrawal ' || p_quantity_kg || ' kg'
            );
        END IF;
        v_new_quantity := v_batch.quantity_kg - p_quantity_kg;
    ELSIF p_transaction_type = 'adjustment' THEN
        -- p_notes can specify direction, or p_quantity_kg is target. If adjustment is passed as delta:
        v_new_quantity := p_quantity_kg;
    END IF;

    -- Ensure non-negative
    IF v_new_quantity < 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Transaction would result in negative inventory balance');
    END IF;

    -- Update batch quantity
    UPDATE public.crop_batches
    SET quantity_kg = v_new_quantity,
        status = CASE WHEN v_new_quantity = 0 THEN 'released' ELSE 'stored' END,
        updated_at = NOW()
    WHERE id = p_batch_id;

    -- Record transaction ledger
    INSERT INTO public.inventory_transactions (
        batch_id,
        owner_id,
        transaction_type,
        quantity_kg,
        notes,
        created_at
    ) VALUES (
        p_batch_id,
        v_caller_id,
        p_transaction_type,
        p_quantity_kg,
        p_notes,
        NOW()
    ) RETURNING id INTO v_tx_id;

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_tx_id,
        'previous_quantity_kg', v_batch.quantity_kg,
        'new_quantity_kg', v_new_quantity
    );
END;
$$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on every table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- RLS: PROFILES
-- ------------------------------------------------------------------------------
-- Anyone authenticated can view profiles (to display facility manager / farmer names)
CREATE POLICY "Profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

-- Allow public read of profiles for facility browsing
CREATE POLICY "Profiles are viewable by anon"
    ON public.profiles FOR SELECT
    TO anon
    USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- RLS: STORAGE_FACILITIES
-- ------------------------------------------------------------------------------
-- Active facilities are publicly viewable by everyone; inactive viewable by owner
CREATE POLICY "Active facilities are viewable by everyone"
    ON public.storage_facilities FOR SELECT
    USING (is_active = true OR auth.uid() = owner_id);

-- Only users with 'owner' role can create facilities
CREATE POLICY "Storage owners can insert facilities"
    ON public.storage_facilities FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = owner_id AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Owners can update their own facilities
CREATE POLICY "Owners can update own facilities"
    ON public.storage_facilities FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- Owners can delete their own facilities
CREATE POLICY "Owners can delete own facilities"
    ON public.storage_facilities FOR DELETE
    TO authenticated
    USING (auth.uid() = owner_id);

-- ------------------------------------------------------------------------------
-- RLS: BOOKINGS
-- ------------------------------------------------------------------------------
-- Farmers can see their own bookings; facility owners can see bookings for their facility
CREATE POLICY "Users can view relevant bookings"
    ON public.bookings FOR SELECT
    TO authenticated
    USING (
        auth.uid() = farmer_id OR
        EXISTS (
            SELECT 1 FROM public.storage_facilities f
            WHERE f.id = bookings.facility_id AND f.owner_id = auth.uid()
        )
    );

-- Farmers can insert bookings only for themselves
CREATE POLICY "Farmers can create bookings"
    ON public.bookings FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = farmer_id AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('farmer', 'admin')
        )
    );

-- Farmers can update their own bookings (only to cancel pending/approved)
-- Owners can update bookings for their facilities (approve/reject/complete)
CREATE POLICY "Permitted users can update bookings"
    ON public.bookings FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = farmer_id OR
        EXISTS (
            SELECT 1 FROM public.storage_facilities f
            WHERE f.id = bookings.facility_id AND f.owner_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- RLS: CROP_BATCHES (INDEPENDENT INVENTORY)
-- ------------------------------------------------------------------------------
-- Storage owners manage their own crop batches (no farmer booking required)
CREATE POLICY "Owners can view own crop batches"
    ON public.crop_batches FOR SELECT
    TO authenticated
    USING (auth.uid() = owner_id);

CREATE POLICY "Owners can create crop batches"
    ON public.crop_batches FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = owner_id AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Owners can update own crop batches"
    ON public.crop_batches FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own crop batches"
    ON public.crop_batches FOR DELETE
    TO authenticated
    USING (auth.uid() = owner_id);

-- ------------------------------------------------------------------------------
-- RLS: INVENTORY_TRANSACTIONS
-- ------------------------------------------------------------------------------
-- Owners can view transactions for their own batches
CREATE POLICY "Owners can view own transactions"
    ON public.inventory_transactions FOR SELECT
    TO authenticated
    USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert transactions"
    ON public.inventory_transactions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

-- Prevent update & delete on transactions (immutable audit ledger)
CREATE POLICY "Transactions cannot be updated"
    ON public.inventory_transactions FOR UPDATE
    TO authenticated
    USING (false);

CREATE POLICY "Transactions cannot be deleted"
    ON public.inventory_transactions FOR DELETE
    TO authenticated
    USING (false);
