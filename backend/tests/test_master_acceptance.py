import pytest
from datetime import date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.database import Base
from backend.app.models import (
    User,
    Facility,
    StorageLocation,
    Booking,
    InventoryBatch,
    InventoryTransaction,
)
from backend.app.schemas import (
    BookingCreate,
    BatchCreate,
    IntakeRequest,
    WithdrawalRequest,
    TransferRequest,
)
from backend.app.crud import (
    create_booking,
    cancel_booking,
    register_product_batch,
    record_stock_intake,
    record_stock_withdrawal,
    transfer_stock_locations,
)
from backend.app.capacity_engine import (
    calculate_facility_capacity_ledger,
    check_capacity_availability,
)
from backend.app.ai_engine import generate_ai_insights

# Use in-memory SQLite database for isolated test execution
TEST_DB_URL = "sqlite:///:memory:"

@pytest.fixture(scope="function")
def db_session():
    engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()

    # Setup base facility & users
    owner = User(
        id="test-own-1",
        name="Test Owner",
        phone="+91 99999 00001",
        role="owner",
        location="Oddanchatram",
    )
    farmer = User(
        id="test-far-1",
        name="Test Farmer",
        phone="+91 99999 00002",
        role="farmer",
        location="Dindigul",
    )
    db.add_all([owner, farmer])
    db.flush()

    fac = Facility(
        id="test-fac-1",
        owner_id=owner.id,
        name="Test Solar Hub",
        district="Dindigul",
        location="Oddanchatram Rural",
        latitude=10.48,
        longitude=77.74,
        price_per_crate_day=2.90,
        price_per_kg_day=0.12,
        contact_phone="+91 99999 00001",
    )
    db.add(fac)
    db.flush()

    cham1 = StorageLocation(
        id="test-cham-1",
        facility_id=fac.id,
        name="Chamber 1",
        chamber_type="chilled",
        temp_min=2.0,
        temp_max=4.0,
        current_temp=2.8,
        humidity=89,
        total_capacity_crates=100,  # 100 crates = 2500 kg
        total_capacity_kg=2500.0,
        is_maintenance=False,
    )
    cham2 = StorageLocation(
        id="test-cham-2",
        facility_id=fac.id,
        name="Chamber 2",
        chamber_type="cool",
        temp_min=8.0,
        temp_max=12.0,
        current_temp=9.0,
        humidity=85,
        total_capacity_crates=100,
        total_capacity_kg=2500.0,
        is_maintenance=False,
    )
    db.add_all([cham1, cham2])
    db.commit()

    yield db

    db.close()
    Base.metadata.drop_all(bind=engine)


def test_separation_test_a(db_session):
    """
    Test A: Create a booking for 100 kg (4 crates).
    Confirm that NO inventory batch or physical stock record is created.
    """
    db = db_session
    booking_req = BookingCreate(
        farmer_id="test-far-1",
        facility_id="test-fac-1",
        chamber_id="test-cham-1",
        crop_name="Tomato",
        booked_crates=4,
        booked_kg=100.0,
        start_date=date.today(),
        duration_days=7,
    )

    booking = create_booking(db, booking_req)
    assert booking.id is not None
    assert booking.booked_kg == 100.0

    # Verify no inventory batches exist
    batches = db.query(InventoryBatch).all()
    assert len(batches) == 0, "Architectural invariant failed: Booking must never create an inventory batch!"

    # Verify physical occupancy remains 0
    ledger = calculate_facility_capacity_ledger(db, "test-fac-1")
    assert ledger.current_physical_occupancy_kg == 0.0
    assert ledger.reserved_capacity_kg_today == 100.0


def test_separation_test_b(db_session):
    """
    Test B: Register 250 kg of potatoes through normal inventory intake without creating any booking.
    Confirm that stock is recorded successfully.
    """
    db = db_session
    batch_req = BatchCreate(
        facility_id="test-fac-1",
        chamber_id="test-cham-1",
        crop_name="Potato",
        initial_stock_kg=250.0,
        initial_stock_crates=10,
        intake_date=date.today(),
        booking_id=None,  # No booking! Pure normal inventory intake
        farmer_name="Walk-in Farmer",
    )

    batch = register_product_batch(db, batch_req)
    assert batch.id is not None
    assert batch.current_stock_kg == 250.0
    assert batch.booking_id is None

    # Check transaction ledger
    txs = db.query(InventoryTransaction).filter(InventoryTransaction.batch_id == batch.id).all()
    assert len(txs) == 1
    assert txs[0].transaction_type == "intake"
    assert txs[0].quantity_kg == 250.0

    # Verify physical occupancy is updated
    ledger = calculate_facility_capacity_ledger(db, "test-fac-1")
    assert ledger.current_physical_occupancy_kg == 250.0
    assert ledger.reserved_capacity_kg_today == 0.0


def test_separation_test_c(db_session):
    """
    Test C: Withdraw 50 kg from that batch.
    Confirm that remaining stock is 200 kg and the withdrawal is recorded.
    """
    db = db_session
    batch_req = BatchCreate(
        facility_id="test-fac-1",
        chamber_id="test-cham-1",
        crop_name="Potato",
        initial_stock_kg=250.0,
        initial_stock_crates=10,
        intake_date=date.today(),
    )
    batch = register_product_batch(db, batch_req)

    wd_req = WithdrawalRequest(
        batch_code=batch.batch_code,
        quantity_kg=50.0,
        quantity_crates=2,
        reason="Mandi dispatch",
    )
    tx = record_stock_withdrawal(db, wd_req)

    assert tx.transaction_type == "withdrawal"
    assert tx.new_balance_kg == 200.0

    # Reload batch from DB
    db.refresh(batch)
    assert batch.current_stock_kg == 200.0
    assert batch.withdrawn_kg == 50.0


def test_separation_test_d(db_session):
    """
    Test D: Cancel a booking.
    Confirm that cancellation updates reserved capacity according to booking rules
    without deleting or modifying unrelated inventory.
    """
    db = db_session
    # 1. Existing inventory batch
    batch_req = BatchCreate(
        facility_id="test-fac-1",
        chamber_id="test-cham-1",
        crop_name="Onion",
        initial_stock_kg=300.0,
        initial_stock_crates=12,
    )
    batch = register_product_batch(db, batch_req)

    # 2. Separate booking
    booking = create_booking(
        db,
        BookingCreate(
            farmer_id="test-far-1",
            facility_id="test-fac-1",
            chamber_id="test-cham-1",
            crop_name="Tomato",
            booked_crates=10,
            booked_kg=250.0,
            start_date=date.today(),
            duration_days=5,
        ),
    )

    ledger_before = calculate_facility_capacity_ledger(db, "test-fac-1")
    assert ledger_before.reserved_capacity_kg_today == 250.0
    assert ledger_before.current_physical_occupancy_kg == 300.0

    # 3. Cancel booking
    cancel_booking(db, booking.id, "Harvest delayed by monsoon", "test-far-1")

    ledger_after = calculate_facility_capacity_ledger(db, "test-fac-1")
    assert ledger_after.reserved_capacity_kg_today == 0.0, "Reserved capacity must be released on cancellation!"
    assert ledger_after.current_physical_occupancy_kg == 300.0, "Physical inventory must remain completely intact!"

    db.refresh(batch)
    assert batch.current_stock_kg == 300.0


def test_separation_test_e(db_session):
    """
    Test E: Associate an optional booking with a real intake.
    Confirm that physical stock increases only by the quantity actually received.
    """
    db = db_session
    # Farmer booked 500 kg (20 crates)
    booking = create_booking(
        db,
        BookingCreate(
            farmer_id="test-far-1",
            facility_id="test-fac-1",
            chamber_id="test-cham-1",
            crop_name="Carrots",
            booked_crates=20,
            booked_kg=500.0,
            start_date=date.today(),
            duration_days=7,
        ),
    )

    # Only 300 kg arrived at the weighing gate
    intake_tx = record_stock_intake(
        db,
        IntakeRequest(
            facility_id="test-fac-1",
            chamber_id="test-cham-1",
            crop_name="Carrots",
            quantity_kg=300.0,
            quantity_crates=12,
            booking_id=booking.id,
            source="Farmer Gate Delivery",
        ),
    )

    assert intake_tx.quantity_kg == 300.0
    ledger = calculate_facility_capacity_ledger(db, "test-fac-1")
    # Physical stock increases ONLY by 300 kg, not the booked 500 kg!
    assert ledger.current_physical_occupancy_kg == 300.0


def test_separation_test_f(db_session):
    """
    Test F: Attempt simultaneous bookings for capacity that is insufficient to satisfy both.
    Confirm that conflicting reservations are prevented.
    """
    db = db_session
    # Chamber 1 has 100 crates rated capacity
    # Booking 1 takes 70 crates
    b1 = create_booking(
        db,
        BookingCreate(
            farmer_id="test-far-1",
            facility_id="test-fac-1",
            chamber_id="test-cham-1",
            crop_name="Tomato",
            booked_crates=70,
            start_date=date.today(),
            duration_days=5,
        ),
    )
    assert b1.id is not None

    # Booking 2 tries to take 40 crates (70 + 40 = 110 > 100 max)
    with pytest.raises(ValueError, match="Capacity deficit"):
        create_booking(
            db,
            BookingCreate(
                farmer_id="test-far-1",
                facility_id="test-fac-1",
                chamber_id="test-cham-1",
                crop_name="Chillies",
                booked_crates=40,
                start_date=date.today(),
                duration_days=5,
            ),
        )


def test_separation_test_g(db_session):
    """
    Test G: Attempt concurrent withdrawals whose quantity exceeds available stock.
    Confirm that withdrawals exceeding stock fail.
    """
    db = db_session
    batch = register_product_batch(
        db,
        BatchCreate(
            facility_id="test-fac-1",
            chamber_id="test-cham-1",
            crop_name="Tomato",
            initial_stock_kg=100.0,
            initial_stock_crates=4,
        ),
    )

    # Attempt to withdraw 120 kg (exceeds 100 kg)
    with pytest.raises(ValueError, match="exceeds current available stock"):
        record_stock_withdrawal(
            db,
            WithdrawalRequest(
                batch_code=batch.batch_code,
                quantity_kg=120.0,
                quantity_crates=5,
                reason="Invalid excessive withdrawal",
            ),
        )

    # Valid withdrawal of 60 kg succeeds
    tx = record_stock_withdrawal(
        db,
        WithdrawalRequest(
            batch_code=batch.batch_code,
            quantity_kg=60.0,
            quantity_crates=2,
            reason="Partial sale",
        ),
    )
    assert tx.new_balance_kg == 40.0


def test_separation_test_h(db_session):
    """
    Test H: Transfer stock between two locations in the same facility.
    Confirm that total facility stock remains unchanged and each location balance is correct.
    """
    db = db_session
    batch = register_product_batch(
        db,
        BatchCreate(
            facility_id="test-fac-1",
            chamber_id="test-cham-1",
            crop_name="Apples",
            initial_stock_kg=500.0,
            initial_stock_crates=20,
        ),
    )

    total_stock_before = (
        calculate_facility_capacity_ledger(db, "test-fac-1").current_physical_occupancy_kg
    )
    assert total_stock_before == 500.0

    # Transfer 200 kg from Chamber 1 to Chamber 2
    tx = transfer_stock_locations(
        db,
        TransferRequest(
            batch_code=batch.batch_code,
            source_chamber_id="test-cham-1",
            destination_chamber_id="test-cham-2",
            quantity_kg=200.0,
            quantity_crates=8,
            reason="Relocating to cool chamber",
        ),
    )
    assert tx.transaction_type == "transfer"

    # Facility total stock MUST remain exactly 500 kg
    total_stock_after = (
        calculate_facility_capacity_ledger(db, "test-fac-1").current_physical_occupancy_kg
    )
    assert total_stock_after == 500.0

    # Chamber 1 must have 300 kg, Chamber 2 must have 200 kg
    cham1_batches = db.query(InventoryBatch).filter(InventoryBatch.chamber_id == "test-cham-1").all()
    cham2_batches = db.query(InventoryBatch).filter(InventoryBatch.chamber_id == "test-cham-2").all()
    assert sum(b.current_stock_kg for b in cham1_batches) == 300.0
    assert sum(b.current_stock_kg for b in cham2_batches) == 200.0


def test_separation_test_i(db_session):
    """
    Test I: Generate an AI capacity warning.
    Confirm that no booking or stock quantity changes automatically.
    """
    db = db_session
    batch = register_product_batch(
        db,
        BatchCreate(
            facility_id="test-fac-1",
            chamber_id="test-cham-1",
            crop_name="Tomato",
            initial_stock_kg=2400.0,  # 96% of 2500 kg -> triggers high utilization warning
            initial_stock_crates=96,
        ),
    )

    # Generate insights
    insights = generate_ai_insights(db, "test-fac-1")
    assert len(insights) > 0
    cap_warnings = [ins for ins in insights if ins.category == "capacity_warning"]
    assert len(cap_warnings) > 0

    # Verify no stock was silently changed
    db.refresh(batch)
    assert batch.current_stock_kg == 2400.0
    ledger = calculate_facility_capacity_ledger(db, "test-fac-1")
    assert ledger.current_physical_occupancy_kg == 2400.0


def test_separation_test_j(db_session):
    """
    Test J: Attempt to archive a batch that still has active stock.
    Confirm that the backend rejects this operation to protect data integrity.
    """
    db = db_session
    from backend.app.crud import archive_batch

    batch = register_product_batch(
        db,
        BatchCreate(
            facility_id="test-fac-1",
            chamber_id="test-cham-1",
            crop_name="Grapes",
            initial_stock_kg=150.0,
            initial_stock_crates=6,
        ),
    )

    with pytest.raises(ValueError, match="Cannot archive batch"):
        archive_batch(db, batch.batch_code, "test-own-1")

    # If withdrawn to zero, archival is allowed
    record_stock_withdrawal(
        db,
        WithdrawalRequest(
            batch_code=batch.batch_code,
            quantity_kg=150.0,
            quantity_crates=6,
            reason="Full liquidation",
        ),
    )
    archived = archive_batch(db, batch.batch_code, "test-own-1")
    assert archived.status == "archived"
