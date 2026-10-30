-- ==============================================================================
-- RURAL AGRI SYNC — SEED DATA SCRIPT
-- Uses clearly identified synthetic/sample data for Tamil Nadu demo facilities
-- ==============================================================================

-- Clean up any existing demo records if re-running
DELETE FROM public.inventory_transactions WHERE notes LIKE '%[DEMO]%';
DELETE FROM public.crop_batches WHERE notes LIKE '%[DEMO]%';
DELETE FROM public.bookings WHERE notes LIKE '%[DEMO]%';
DELETE FROM public.storage_facilities WHERE description LIKE '%[DEMO]%';

-- 1. Create or upsert demo profiles (Using deterministic UUIDs for seed demo)
-- Note: In production Supabase Auth, profiles are created via signup triggers.
INSERT INTO public.profiles (id, full_name, phone, role, village, district, created_at, updated_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Murugan S. (Farmer)', '+91 98421 77301', 'farmer', 'Oddanchatram', 'Dindigul', NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', 'Arumugam P. (Owner)', '+91 94431 82910', 'owner', 'Oddanchatram Bypass', 'Dindigul', NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333', 'Kandasamy R. (Owner)', '+91 94422 11029', 'owner', 'Batlagundu', 'Dindigul', NOW(), NOW()),
    ('44444444-4444-4444-4444-444444444444', 'Dr. K. Jayakumar IAS (Admin)', '+91 94440 00122', 'admin', 'Guindy', 'Chennai', NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    village = EXCLUDED.village,
    district = EXCLUDED.district;

-- 2. Insert Demo Storage Facilities
INSERT INTO public.storage_facilities (
    id, owner_id, name, description, village, district, state, address,
    latitude, longitude, capacity_kg, available_capacity_kg, price_per_kg_per_day,
    supported_crops, is_active, created_at, updated_at
) VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'Uzhavar Cold Hub #14 (Oddanchatram)',
    '[DEMO] Multi-chamber solar cold chain facility with dedicated chilled and controlled atmosphere rooms.',
    'Oddanchatram',
    'Dindigul',
    'Tamil Nadu',
    'NH 83 Palani-Dindigul Highway, Oddanchatram APMC Market Gate 2',
    10.4851,
    77.7472,
    15000.0,
    11500.0,
    0.12,
    ARRAY['Tomato', 'Chilli', 'Banana', 'Carrot', 'Potato'],
    TRUE,
    NOW(),
    NOW()
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'Dindigul Central Solar Agro Store',
    '[DEMO] Eco-friendly cold warehouse with pre-cooling tunnels and precision humidity monitors.',
    'Reddiarchatram',
    'Dindigul',
    'Tamil Nadu',
    'Near Tamil Nadu Agricultural University Research Sub-Station',
    10.4285,
    77.9150,
    25000.0,
    22000.0,
    0.10,
    ARRAY['Shallot (Small Onion)', 'Potato', 'Garlic', 'Drumstick'],
    TRUE,
    NOW(),
    NOW()
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '33333333-3333-3333-3333-333333333333',
    'Batlagundu Fresh Vault & Grain Silo',
    '[DEMO] Combined ventilated dry store & cool chamber for fruits and dry grains.',
    'Batlagundu',
    'Dindigul',
    'Tamil Nadu',
    'Kodaikanal Ghat Road, Batlagundu',
    10.1601,
    77.7610,
    10000.0,
    8500.0,
    0.09,
    ARRAY['Paddy', 'Maize', 'Banana', 'Guava'],
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Demo Bookings
INSERT INTO public.bookings (
    id, farmer_id, facility_id, crop_name, quantity_kg, start_date, end_date,
    duration_days, estimated_cost, status, notes, created_at, updated_at
) VALUES
(
    '10101010-1010-1010-1010-101010101010',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Fresh Tomato (Hybrid Shivam)',
    1250.0,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '10 days',
    10,
    1500.00,
    'approved',
    '[DEMO] Oddanchatram APMC produce intake with QR pass.',
    NOW(),
    NOW()
),
(
    '20202020-2020-2020-2020-202020202020',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Green Chilli (G4 Variety)',
    500.0,
    CURRENT_DATE - INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '12 days',
    15,
    900.00,
    'pending',
    '[DEMO] Pending inspection by warehouse supervisor.',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Demo Crop Batches (Independent Inventory Management by Owner)
INSERT INTO public.crop_batches (
    id, owner_id, facility_id, crop_name, batch_code, quantity_kg,
    harvest_date, expiry_date, storage_location, status, notes, created_at, updated_at
) VALUES
(
    '50505050-5050-5050-5050-505050505050',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Fresh Hybrid Tomato',
    'BATCH-TN-ODD-001',
    1250.0,
    CURRENT_DATE - INTERVAL '2 days',
    CURRENT_DATE + INTERVAL '18 days',
    'Chamber 1 (Chilled Rack A-04)',
    'stored',
    '[DEMO] High-grade tomato batch stored at 9°C, 90% RH.',
    NOW(),
    NOW()
),
(
    '60606060-6060-6060-6060-606060606060',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Kufri Jyoti Potato',
    'BATCH-TN-ODD-002',
    2000.0,
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '45 days',
    'Chamber 2 (Cool Vault Pallet B-12)',
    'stored',
    '[DEMO] Walk-in farmer batch registered directly without booking.',
    NOW(),
    NOW()
),
(
    '70707070-7070-7070-7070-707070707070',
    '22222222-2222-2222-2222-222222222222',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Small Onion (CO-5 Shallot)',
    'BATCH-TN-RED-003',
    3000.0,
    CURRENT_DATE - INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '60 days',
    'Ventilated Dry Chamber 1',
    'stored',
    '[DEMO] Cured small onion batch with forced air circulation.',
    NOW(),
    NOW()
)
ON CONFLICT (owner_id, batch_code) DO NOTHING;

-- 5. Insert Demo Inventory Transactions
INSERT INTO public.inventory_transactions (
    id, batch_id, owner_id, transaction_type, quantity_kg, notes, created_at
) VALUES
(
    '80808080-8080-8080-8080-808080808080',
    '50505050-5050-5050-5050-505050505050',
    '22222222-2222-2222-2222-222222222222',
    'stock_in',
    1250.0,
    '[DEMO] Initial intake verified at gate scale #1',
    NOW() - INTERVAL '2 days'
),
(
    '90909090-9090-9090-9090-909090909090',
    '60606060-6060-6060-6060-606060606060',
    '22222222-2222-2222-2222-222222222222',
    'stock_in',
    2000.0,
    '[DEMO] Walk-in produce arrival intake',
    NOW() - INTERVAL '5 days'
)
ON CONFLICT (id) DO NOTHING;
