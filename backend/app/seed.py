from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from .database import Base, engine, SessionLocal
from .models import (
    User,
    Facility,
    StorageLocation,
    Booking,
    BookingStatusHistory,
    InventoryProduct,
    InventoryBatch,
    InventoryTransaction,
    InventoryAlert,
    Review,
    Notification,
)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Check if already seeded
    if db.query(User).first():
        print("Database already contains data. Skipping re-seed.")
        db.close()
        return

    print("Seeding AgriSync database...")

    # 1. Users
    farmer = User(
        id="far-1",
        name="Murugan S.",
        phone="+91 98421 77301",
        email="murugan@uzhavar.in",
        role="farmer",
        location="Oddanchatram, Dindigul",
        avatar_url="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80",
    )
    owner = User(
        id="own-1",
        name="Arumugam P.",
        phone="+91 94431 82910",
        email="arumugam@solarcold.in",
        role="owner",
        location="Oddanchatram Rural Bypass",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    )
    admin = User(
        id="adm-1",
        name="Dr. K. Jayakumar IAS",
        phone="+91 94440 00122",
        email="jayakumar@tn.gov.in",
        role="admin",
        location="TN Agri Marketing Board, Chennai",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    )
    db.add_all([farmer, owner, admin])
    db.flush()

    # 2. Facilities
    fac1 = Facility(
        id="fac-1",
        owner_id=owner.id,
        name="Uzhavar Solar Hub #14",
        name_ta="உழவர் சூரிய மின் குளிர்சாதன மையம் #14",
        location="Oddanchatram Rural Bypass",
        location_ta="ஒட்டன்சத்திரம் கிராமப்புற புறவழிச்சாலை",
        district="Dindigul",
        latitude=10.4851,
        longitude=77.7471,
        rating=4.9,
        review_count=128,
        is_verified=True,
        is_solar_powered=True,
        price_per_crate_day=2.90,
        price_per_kg_day=0.12,
        operating_hours="06:00 AM - 10:00 PM",
        contact_phone="+91 94431 82910",
        manager_name="Arumugam P.",
        manager_image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    )
    fac2 = Facility(
        id="fac-2",
        owner_id=owner.id,
        name="Palani Cold Logistics Hub",
        name_ta="பழனி குளிர்பதன தளவாட மையம்",
        location="Dindigul Main Road, Palani",
        location_ta="திண்டுக்கல் முதன்மை சாலை, பழனி",
        district="Dindigul",
        latitude=10.4500,
        longitude=77.5200,
        rating=4.7,
        review_count=84,
        is_verified=True,
        is_solar_powered=True,
        price_per_crate_day=3.10,
        price_per_kg_day=0.13,
        operating_hours="24 Hours",
        contact_phone="+91 94432 99120",
        manager_name="Senthil Nathan",
    )
    fac3 = Facility(
        id="fac-3",
        owner_id=owner.id,
        name="Dindigul Central Agro Freezers",
        name_ta="திண்டுக்கல் மத்திய வேளாண் குளிர்பதன கிடங்கு",
        location="APMC Market Yard, Dindigul",
        location_ta="வேளாண் விற்பனை வளாகம், திண்டுக்கல்",
        district="Dindigul",
        latitude=10.3673,
        longitude=77.9803,
        rating=4.8,
        review_count=96,
        is_verified=True,
        is_solar_powered=False,
        price_per_crate_day=2.75,
        price_per_kg_day=0.11,
        operating_hours="05:00 AM - 11:00 PM",
        contact_phone="+91 98421 11204",
        manager_name="M. Selvaraj",
    )
    db.add_all([fac1, fac2, fac3])
    db.flush()

    # 3. Storage Locations / Chambers
    cham1 = StorageLocation(
        id="cham-1",
        facility_id=fac1.id,
        name="Chamber 1 (Chilled)",
        chamber_type="chilled",
        temp_min=2.0,
        temp_max=4.0,
        current_temp=2.8,
        humidity=89,
        total_capacity_crates=400,
        total_capacity_kg=10000.0,
        is_maintenance=False,
    )
    cham2 = StorageLocation(
        id="cham-2",
        facility_id=fac1.id,
        name="Chamber 2 (Cool)",
        chamber_type="cool",
        temp_min=8.0,
        temp_max=12.0,
        current_temp=9.5,
        humidity=82,
        total_capacity_crates=400,
        total_capacity_kg=10000.0,
        is_maintenance=True,
        maintenance_reason="Sub-cooling sensor calibration and compressor descaling",
    )
    cham3 = StorageLocation(
        id="cham-3",
        facility_id=fac1.id,
        name="Chamber 3 (Controlled Atmosphere)",
        chamber_type="controlled_atmosphere",
        temp_min=0.0,
        temp_max=2.0,
        current_temp=1.2,
        humidity=92,
        total_capacity_crates=400,
        total_capacity_kg=10000.0,
        is_maintenance=False,
    )
    cham4 = StorageLocation(
        id="cham-4",
        facility_id=fac2.id,
        name="Bay A - Ventilated",
        chamber_type="dry_ventilated",
        temp_min=15.0,
        temp_max=20.0,
        current_temp=18.0,
        humidity=75,
        total_capacity_crates=600,
        total_capacity_kg=15000.0,
        is_maintenance=False,
    )
    db.add_all([cham1, cham2, cham3, cham4])
    db.flush()

    # 4. Bookings (Representing reserved capacity over time intervals)
    today = date.today()
    book1 = Booking(
        id="book-1",
        booking_code="#SRS-TN-8492",
        farmer_id=farmer.id,
        facility_id=fac1.id,
        chamber_id=cham1.id,
        crop_name="Fresh Tomato (Hybrid)",
        crop_name_ta="நவீன தக்காளி வகை",
        variety="Shivam Hybrid",
        grade="Grade A",
        booked_crates=50,
        booked_kg=1250.0,
        start_date=today - timedelta(days=2),
        duration_days=10,
        end_date=today + timedelta(days=8),
        daily_rate_crate=2.90,
        total_estimated_cost=1550.0,
        status="confirmed",
        batch_pin="4892",
        crop_image_url="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80",
    )
    book2 = Booking(
        id="book-2",
        booking_code="#SRS-TN-9104",
        farmer_id=farmer.id,
        facility_id=fac1.id,
        chamber_id=cham1.id,
        crop_name="Green Bell Pepper",
        crop_name_ta="குடைமிளகாய்",
        variety="Indra Capsicum",
        grade="Grade A",
        booked_crates=20,
        booked_kg=500.0,
        start_date=today - timedelta(days=1),
        duration_days=7,
        end_date=today + timedelta(days=6),
        daily_rate_crate=2.90,
        total_estimated_cost=446.0,
        status="confirmed",
        batch_pin="7721",
        crop_image_url="https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=400&q=80",
    )
    db.add_all([book1, book2])
    db.flush()

    # 5. Independent Inventory Batches
    # Batch 1: Murugan's produce physically intake at gate
    batch1 = InventoryBatch(
        id="bat-1",
        batch_code="#TN-DDG-088",
        facility_id=fac1.id,
        chamber_id=cham1.id,
        booking_id=book1.id,
        farmer_id=farmer.id,
        farmer_name="Murugan S.",
        crop_name="Fresh Tomato",
        crop_name_ta="தக்காளி",
        grade="Grade A",
        initial_stock_kg=500.0,
        initial_stock_crates=20,
        current_stock_kg=420.0,
        current_stock_crates=17,
        withdrawn_kg=80.0,
        intake_date=today - timedelta(days=4),
        expiry_date=today + timedelta(days=6),
        condition="good",
        quality_score=98,
        status="in_storage",
        crop_image_url="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80",
        notes="Weighed at gate scale. Optimal firmness and color index.",
    )

    # Batch 2: WALK-IN BATCH WITH NO BOOKING ID! (Proves strict architectural independence)
    batch2 = InventoryBatch(
        id="bat-2",
        batch_code="#TN-WALK-501",
        facility_id=fac1.id,
        chamber_id=cham1.id,
        booking_id=None,  # No booking! Pure walk-in intake.
        farmer_name="Ramasamy G.",
        supplier_name="Oddanchatram Local Mandi Trader",
        crop_name="Kufri Jyoti Potato",
        crop_name_ta="உருளைக்கிழங்கு",
        grade="Grade A",
        initial_stock_kg=250.0,
        initial_stock_crates=10,
        current_stock_kg=250.0,
        current_stock_crates=10,
        withdrawn_kg=0.0,
        intake_date=today - timedelta(days=1),
        expiry_date=today + timedelta(days=25),
        condition="good",
        quality_score=99,
        status="in_storage",
        crop_image_url="https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80",
        notes="Walk-in delivery directly from field truck. Direct cash receipt issued.",
    )

    # Batch 3: Chillies in Controlled Atmosphere
    batch3 = InventoryBatch(
        id="bat-3",
        batch_code="#TN-DDG-102",
        facility_id=fac1.id,
        chamber_id=cham3.id,
        booking_id=None,
        farmer_name="Chinnasamy V.",
        crop_name="Guntur Sannam Chillies",
        crop_name_ta="பச்சை மிளகாய்",
        grade="Standard",
        initial_stock_kg=350.0,
        initial_stock_crates=14,
        current_stock_kg=310.0,
        current_stock_crates=12,
        withdrawn_kg=40.0,
        intake_date=today - timedelta(days=3),
        expiry_date=today + timedelta(days=12),
        condition="good",
        quality_score=95,
        status="in_storage",
        crop_image_url="https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=400&q=80",
        notes="High pungent variety, moisture 11.2%.",
    )
    db.add_all([batch1, batch2, batch3])
    db.flush()

    # 6. Inventory Transactions (Audit ledger)
    tx1 = InventoryTransaction(
        batch_id=batch1.id,
        batch_code=batch1.batch_code,
        facility_id=fac1.id,
        transaction_type="intake",
        quantity_kg=500.0,
        quantity_crates=20,
        previous_balance_kg=0.0,
        new_balance_kg=500.0,
        destination_location_id=cham1.id,
        authorized_by="Arumugam P. (Scale Operator)",
        reason="Gate Inbound Scale Verification",
        receipt_number="#REC-INT-8102",
        booking_id=book1.id,
        timestamp=datetime.utcnow() - timedelta(days=4),
    )
    tx2 = InventoryTransaction(
        batch_id=batch1.id,
        batch_code=batch1.batch_code,
        facility_id=fac1.id,
        transaction_type="withdrawal",
        quantity_kg=80.0,
        quantity_crates=3,
        previous_balance_kg=500.0,
        new_balance_kg=420.0,
        source_location_id=cham1.id,
        authorized_by="Murugan S.",
        reason="Farmer withdrawal for morning APMC Mandi auction",
        receipt_number="#REC-WD-2940",
        timestamp=datetime.utcnow() - timedelta(days=1),
    )
    tx3 = InventoryTransaction(
        batch_id=batch2.id,
        batch_code=batch2.batch_code,
        facility_id=fac1.id,
        transaction_type="intake",
        quantity_kg=250.0,
        quantity_crates=10,
        previous_balance_kg=0.0,
        new_balance_kg=250.0,
        destination_location_id=cham1.id,
        authorized_by="Arumugam P. (Owner)",
        reason="Walk-in crop batch intake without prior booking",
        receipt_number="#REC-INT-4890",
        timestamp=datetime.utcnow() - timedelta(days=1),
    )
    db.add_all([tx1, tx2, tx3])

    # 7. Inventory Alerts
    alert1 = InventoryAlert(
        facility_id=fac1.id,
        alert_type="capacity_warning",
        title="Chamber 2 Maintenance Notice",
        message="Chamber 2 is undergoing compressor recalibration. Active reservations have been safely rerouted.",
        severity="warning",
        is_resolved=False,
    )
    alert2 = InventoryAlert(
        facility_id=fac1.id,
        alert_type="near_expiry",
        title="Batch #TN-DDG-088 Approaching 6-Day Optimal Window",
        message="Tomato batch has reached peak quality envelope. Recommended to plan Mandi liquidation.",
        severity="info",
        is_resolved=False,
    )
    db.add_all([alert1, alert2])

    # 8. Reviews
    rev1 = Review(
        booking_id=book1.id,
        facility_id=fac1.id,
        farmer_id=farmer.id,
        farmer_name="Murugan S.",
        rating=5,
        comment="Solar backup worked uninterrupted during rural grid outages. Weight bridge digital verification was swift and transparent.",
        would_revisit=True,
    )
    db.add(rev1)

    # 9. Notifications
    notif1 = Notification(
        user_id=farmer.id,
        title="Active Chamber Telemetry Optimal",
        title_ta="குளிர்சாதன அறை வெப்பநிலை சீராக உள்ளது",
        message="Chamber 1 temperature stabilized at 2.8°C with 89% relative humidity.",
        message_ta="அறை 1 வெப்பநிலை 2.8°C மற்றும் 89% ஈரப்பதத்துடன் உகந்த நிலையில் உள்ளது.",
        notification_type="temperature",
    )
    db.add(notif1)

    db.commit()
    print("AgriSync database seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()
