-- ========================================================================
-- SMART RURAL STORAGE: POSTGRESQL SCHEMA WITH RLS & ATOMIC RESERVATIONS
-- ========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Farmers, Warehouse Owners, Platform Admins)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('farmer', 'owner', 'admin')),
    location TEXT NOT NULL,
    farmer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Cold Storage Facilities Table
CREATE TABLE IF NOT EXISTS public.facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    name_ta TEXT NOT NULL,
    location TEXT NOT NULL,
    district TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    rating NUMERIC(2,1) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_solar_powered BOOLEAN DEFAULT TRUE,
    price_per_crate_day NUMERIC(10,2) NOT NULL DEFAULT 2.90,
    price_per_kg_day NUMERIC(10,2) NOT NULL DEFAULT 0.12,
    operating_hours TEXT DEFAULT '06:00 AM - 10:00 PM',
    contact_phone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Storage Units / Chambers
CREATE TABLE IF NOT EXISTS public.storage_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    chamber_type TEXT NOT NULL CHECK (chamber_type IN ('chilled', 'cool', 'controlled_atmosphere', 'dry_ventilated')),
    temp_min NUMERIC(4,1) NOT NULL,
    temp_max NUMERIC(4,1) NOT NULL,
    current_temp NUMERIC(4,1) NOT NULL,
    humidity INT NOT NULL,
    total_capacity_crates INT NOT NULL,
    available_capacity_crates INT NOT NULL,
    total_capacity_kg NUMERIC(12,2) NOT NULL,
    available_capacity_kg NUMERIC(12,2) NOT NULL,
    is_maintenance BOOLEAN DEFAULT FALSE,
    maintenance_reason TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_code TEXT UNIQUE NOT NULL,
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE RESTRICT,
    chamber_id UUID NOT NULL REFERENCES public.storage_units(id) ON DELETE RESTRICT,
    crop_name TEXT NOT NULL,
    crop_name_ta TEXT,
    variety TEXT,
    grade TEXT DEFAULT 'Grade A',
    booked_crates INT NOT NULL CHECK (booked_crates > 0),
    booked_kg NUMERIC(10,2) NOT NULL CHECK (booked_kg > 0),
    verified_kg NUMERIC(10,2),
    verified_crates INT,
    start_date DATE NOT NULL,
    duration_days INT NOT NULL CHECK (duration_days > 0),
    end_date DATE NOT NULL,
    daily_rate_crate NUMERIC(10,2) NOT NULL,
    total_estimated_cost NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'en_route', 'gate_arrived', 'verified_intake', 'in_storage', 'partially_collected', 'completed', 'cancelled', 'needs_resolution')) DEFAULT 'confirmed',
    batch_pin TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Authoritative Inventory Batches
CREATE TABLE IF NOT EXISTS public.inventory_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_code TEXT UNIQUE NOT NULL,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE RESTRICT,
    chamber_id UUID NOT NULL REFERENCES public.storage_units(id) ON DELETE RESTRICT,
    crop_name TEXT NOT NULL,
    grade TEXT DEFAULT 'Grade A',
    initial_stock_kg NUMERIC(10,2) NOT NULL,
    current_stock_kg NUMERIC(10,2) NOT NULL CHECK (current_stock_kg >= 0),
    current_stock_crates INT NOT NULL CHECK (current_stock_crates >= 0),
    withdrawn_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
    intake_date DATE NOT NULL,
    target_collect_date DATE NOT NULL,
    quality_score INT DEFAULT 98,
    status TEXT NOT NULL CHECK (status IN ('in_storage', 'in_transit', 'ready_to_collect', 'withdrawn')) DEFAULT 'in_storage',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Stock Movements Audit Ledger
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES public.inventory_batches(id) ON DELETE CASCADE,
    batch_code TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    movement_type TEXT NOT NULL CHECK (movement_type IN ('intake', 'partial_withdrawal', 'full_dispatch', 'spoilage_writeoff', 'chamber_relocation')),
    quantity_kg NUMERIC(10,2) NOT NULL,
    quantity_crates INT NOT NULL,
    authorized_by TEXT NOT NULL,
    reason TEXT NOT NULL,
    receipt_number TEXT UNIQUE NOT NULL
);

-- 7. Verified Reviews and Feedback
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_complaint BOOLEAN DEFAULT FALSE,
    complaint_category TEXT,
    complaint_status TEXT CHECK (complaint_status IN ('open', 'under_review', 'resolved', 'disputed')),
    owner_response TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    title_ta TEXT,
    message TEXT NOT NULL,
    message_ta TEXT,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('booking', 'pickup', 'conflict', 'temperature', 'inspection', 'system')),
    is_read BOOLEAN DEFAULT FALSE,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================================
-- ATOMIC CAPACITY RESERVATION FUNCTION (PREVENTS OVERBOOKING RACE CONDITIONS)
-- ========================================================================
CREATE OR REPLACE FUNCTION public.reserve_cold_storage_capacity(
    p_farmer_id UUID,
    p_facility_id UUID,
    p_chamber_id UUID,
    p_crop_name TEXT,
    p_variety TEXT,
    p_booked_crates INT,
    p_duration_days INT,
    p_start_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_unit RECORD;
    v_daily_rate NUMERIC(10,2);
    v_total_cost NUMERIC(10,2);
    v_booking_code TEXT;
    v_batch_pin TEXT;
    v_new_booking_id UUID;
    v_booked_kg NUMERIC(10,2);
    v_end_date DATE;
BEGIN
    -- 1. Lock the storage unit row exclusively to prevent concurrent double-booking
    SELECT * INTO v_unit
    FROM public.storage_units
    WHERE id = p_chamber_id AND facility_id = p_facility_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Chamber unit not found');
    END IF;

    -- 2. Check maintenance block
    IF v_unit.is_maintenance THEN
        RETURN jsonb_build_object('success', false, 'error', 'Chamber is currently blocked for maintenance: ' || COALESCE(v_unit.maintenance_reason, ''));
    END IF;

    -- 3. Check capacity availability
    IF v_unit.available_capacity_crates < p_booked_crates THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient capacity: only ' || v_unit.available_capacity_crates || ' crates available');
    END IF;

    -- 4. Calculate cost
    SELECT price_per_crate_day INTO v_daily_rate
    FROM public.facilities
    WHERE id = p_facility_id;

    v_booked_kg := p_booked_crates * 25.0;
    v_total_cost := (p_booked_crates * v_daily_rate * p_duration_days) + (p_booked_crates * 2.0);
    v_end_date := p_start_date + (p_duration_days || ' days')::INTERVAL;
    v_booking_code := '#SRS-TN-' || floor(1000 + random() * 9000)::TEXT;
    v_batch_pin := floor(1000 + random() * 9000)::TEXT;

    -- 5. Atomically deduct capacity
    UPDATE public.storage_units
    SET available_capacity_crates = available_capacity_crates - p_booked_crates,
        available_capacity_kg = available_capacity_kg - v_booked_kg,
        updated_at = NOW()
    WHERE id = p_chamber_id;

    -- 6. Insert confirmed booking record
    INSERT INTO public.bookings (
        booking_code,
        farmer_id,
        facility_id,
        chamber_id,
        crop_name,
        variety,
        booked_crates,
        booked_kg,
        start_date,
        duration_days,
        end_date,
        daily_rate_crate,
        total_estimated_cost,
        status,
        batch_pin
    ) VALUES (
        v_booking_code,
        p_farmer_id,
        p_facility_id,
        p_chamber_id,
        p_crop_name,
        p_variety,
        p_booked_crates,
        v_booked_kg,
        p_start_date,
        p_duration_days,
        v_end_date,
        v_daily_rate,
        v_total_cost,
        'confirmed',
        v_batch_pin
    ) RETURNING id INTO v_new_booking_id;

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_new_booking_id,
        'booking_code', v_booking_code,
        'batch_pin', v_batch_pin,
        'total_cost', v_total_cost
    );
END;
$$;

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Facilities & Chambers are viewable by all authenticated & public users
CREATE POLICY "Facilities are viewable by all" ON public.facilities FOR SELECT USING (true);
CREATE POLICY "Storage units are viewable by all" ON public.storage_units FOR SELECT USING (true);

-- Farmers see only their own bookings
CREATE POLICY "Farmers can see own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = farmer_id);

-- Facility owners can see bookings belonging to their facility
CREATE POLICY "Owners can see their facility bookings" ON public.bookings
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.facilities f WHERE f.id = bookings.facility_id AND f.owner_id = auth.uid())
    );

-- Farmers can see own inventory batches
CREATE POLICY "Farmers can see own batches" ON public.inventory_batches
    FOR SELECT USING (auth.uid() = farmer_id);

-- Owners can see and update facility batches
CREATE POLICY "Owners can manage facility batches" ON public.inventory_batches
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.facilities f WHERE f.id = inventory_batches.facility_id AND f.owner_id = auth.uid())
    );
