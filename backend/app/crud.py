import uuid
import random
from datetime import date, datetime, timedelta
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func

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
    AuditLog,
)
from .schemas import (
    BookingCreate,
    BatchCreate,
    IntakeRequest,
    WithdrawalRequest,
    TransferRequest,
    AdjustmentRequest,
    ReviewCreate,
)
from .capacity_engine import check_capacity_availability

def generate_booking_code() -> str:
    return f"#SRS-TN-{random.randint(1000, 9999)}"

def generate_batch_code() -> str:
    return f"#TN-BAT-{random.randint(100, 999)}"

def generate_receipt_number(prefix: str = "REC") -> str:
    return f"#{prefix}-{random.randint(1000, 9999)}"

# =========================================================================
# BOOKING MANAGEMENT CRUD
# =========================================================================

def create_booking(db: Session, booking_in: BookingCreate) -> Booking:
    """
    Atomically checks multi-day capacity availability and reserves capacity.
    CRITICAL ARCHITECTURAL RULE:
    Creating a booking ONLY reserves capacity on the reservation ledger.
    It MUST NEVER create an InventoryBatch or alter physical inventory!
    """
    # 1. Capacity check
    avail = check_capacity_availability(
        db=db,
        facility_id=booking_in.facility_id,
        chamber_id=booking_in.chamber_id,
        start_date=booking_in.start_date,
        duration_days=booking_in.duration_days,
        requested_crates=booking_in.booked_crates,
        requested_kg=booking_in.booked_kg,
    )

    if not avail.is_available:
        raise ValueError(avail.message)

    facility = db.query(Facility).filter(Facility.id == booking_in.facility_id).first()
    booked_kg = booking_in.booked_kg or (booking_in.booked_crates * 25.0)
    end_date = booking_in.start_date + timedelta(days=booking_in.duration_days)
    pin = str(random.randint(1000, 9999))

    booking = Booking(
        booking_code=generate_booking_code(),
        farmer_id=booking_in.farmer_id,
        facility_id=booking_in.facility_id,
        chamber_id=booking_in.chamber_id,
        crop_name=booking_in.crop_name,
        crop_name_ta=booking_in.crop_name_ta,
        variety=booking_in.variety,
        grade=booking_in.grade,
        booked_crates=booking_in.booked_crates,
        booked_kg=booked_kg,
        start_date=booking_in.start_date,
        duration_days=booking_in.duration_days,
        end_date=end_date,
        daily_rate_crate=facility.price_per_crate_day,
        total_estimated_cost=avail.estimated_cost,
        status="confirmed",
        batch_pin=pin,
        crop_image_url="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80",
        notes=booking_in.notes,
    )
    db.add(booking)
    db.flush()

    # Record initial status history
    status_entry = BookingStatusHistory(
        booking_id=booking.id,
        previous_status="none",
        new_status="confirmed",
        reason="Atomic capacity reservation confirmed by farmer",
        changed_by=booking_in.farmer_id,
    )
    db.add(status_entry)

    # In-app notification for farmer
    notif = Notification(
        user_id=booking_in.farmer_id,
        title=f"Booking Confirmed {booking.booking_code}",
        title_ta=f"முன்பதிவு உறுதி செய்யப்பட்டது {booking.booking_code}",
        message=f"Chamber slot allocated for {booking.crop_name}. Show Gate Pass PIN {pin} at inbound gate.",
        message_ta=f"{booking.crop_name}-ற்கு இடம் ஒதுக்கப்பட்டது. வாயிலில் PIN {pin}-ஐ காட்டவும்.",
        notification_type="booking",
        link_url=f"/booking/{booking.booking_code.replace('#', '')}/confirmation",
    )
    db.add(notif)

    # Audit log
    audit = AuditLog(
        user_id=booking_in.farmer_id,
        user_role="farmer",
        action="BOOKING_CREATED",
        resource_type="booking",
        resource_id=booking.id,
        details=f"Reserved {booking.booked_crates} crates in chamber {booking.chamber_id} for {booking.duration_days} days.",
    )
    db.add(audit)

    db.commit()
    db.refresh(booking)
    return booking

def cancel_booking(db: Session, booking_id: str, reason: str, cancelled_by: str) -> Booking:
    """
    Cancels a booking and releases reserved capacity.
    CRITICAL RULE: Releasing reservation must NEVER modify physical inventory batches!
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        booking = db.query(Booking).filter(Booking.booking_code == booking_id).first()
    if not booking:
        raise ValueError(f"Booking {booking_id} not found")

    if booking.status in ["cancelled", "completed"]:
        raise ValueError(f"Booking is already {booking.status}")

    prev_status = booking.status
    booking.status = "cancelled"

    history = BookingStatusHistory(
        booking_id=booking.id,
        previous_status=prev_status,
        new_status="cancelled",
        reason=reason,
        changed_by=cancelled_by,
    )
    db.add(history)

    # Notification
    notif = Notification(
        user_id=booking.farmer_id,
        title=f"Booking Cancelled {booking.booking_code}",
        title_ta=f"முன்பதிவு ரத்து செய்யப்பட்டது {booking.booking_code}",
        message=f"Booking reservation {booking.booking_code} has been cancelled. Reserved capacity released.",
        message_ta=f"{booking.booking_code} ரத்து செய்யப்பட்டது. ஒதுக்கப்பட்ட இடம் விடுவிக்கப்பட்டது.",
        notification_type="booking",
    )
    db.add(notif)

    audit = AuditLog(
        user_id=cancelled_by,
        action="BOOKING_CANCELLED",
        resource_type="booking",
        resource_id=booking.id,
        details=f"Reason: {reason}",
    )
    db.add(audit)

    db.commit()
    db.refresh(booking)
    return booking

# =========================================================================
# NORMAL INDEPENDENT INVENTORY MANAGEMENT CRUD
# =========================================================================

def register_product_batch(db: Session, batch_in: BatchCreate) -> InventoryBatch:
    """
    Registers an independent product or batch in a storage location.
    CRITICAL ARCHITECTURAL RULES:
    1. A booking ID is NEVER mandatory. Works for walk-ins, suppliers, pre-existing stock.
    2. If initial quantity > 0, verifies destination chamber physical capacity,
       records an initial intake transaction, and updates physical occupancy.
    """
    chamber = db.query(StorageLocation).filter(StorageLocation.id == batch_in.chamber_id).first()
    if not chamber:
        raise ValueError(f"Storage location {batch_in.chamber_id} not found")

    # Check physical capacity if adding initial stock
    if batch_in.initial_stock_kg > 0:
        existing_batches = (
            db.query(InventoryBatch)
            .filter(
                InventoryBatch.chamber_id == batch_in.chamber_id,
                InventoryBatch.status == "in_storage",
            )
            .all()
        )
        current_chamber_kg = sum(b.current_stock_kg for b in existing_batches)
        if current_chamber_kg + batch_in.initial_stock_kg > chamber.total_capacity_kg:
            avail_kg = max(0.0, chamber.total_capacity_kg - current_chamber_kg)
            raise ValueError(
                f"Destination chamber {chamber.name} has only {avail_kg:.1f} kg physical capacity available "
                f"(requested {batch_in.initial_stock_kg} kg)."
            )

    batch_code = generate_batch_code()
    intake_date = batch_in.intake_date or date.today()

    batch = InventoryBatch(
        batch_code=batch_code,
        facility_id=batch_in.facility_id,
        chamber_id=batch_in.chamber_id,
        booking_id=batch_in.booking_id,  # Optional!
        farmer_id=batch_in.farmer_id,
        farmer_name=batch_in.farmer_name or "Walk-in Farmer",
        supplier_name=batch_in.supplier_name,
        crop_name=batch_in.crop_name,
        crop_name_ta=batch_in.crop_name_ta,
        grade=batch_in.grade or "Grade A",
        initial_stock_kg=batch_in.initial_stock_kg,
        initial_stock_crates=batch_in.initial_stock_crates,
        current_stock_kg=batch_in.initial_stock_kg,
        current_stock_crates=batch_in.initial_stock_crates,
        withdrawn_kg=0.0,
        intake_date=intake_date,
        expiry_date=batch_in.expiry_date,
        expected_storage_end=batch_in.expected_storage_end,
        condition=batch_in.condition or "good",
        status="in_storage",
        notes=batch_in.notes,
        crop_image_url="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80",
    )
    db.add(batch)
    db.flush()

    # Record initial intake transaction if quantity > 0
    if batch_in.initial_stock_kg > 0:
        tx = InventoryTransaction(
            batch_id=batch.id,
            batch_code=batch.batch_code,
            facility_id=batch.facility_id,
            transaction_type="intake",
            quantity_kg=batch_in.initial_stock_kg,
            quantity_crates=batch_in.initial_stock_crates,
            previous_balance_kg=0.0,
            new_balance_kg=batch_in.initial_stock_kg,
            destination_location_id=chamber.id,
            authorized_by=batch_in.authorized_by,
            reason="Initial Batch Registration & Physical Intake",
            receipt_number=generate_receipt_number("INT"),
            booking_id=batch_in.booking_id,
        )
        db.add(tx)

    audit = AuditLog(
        user_id=batch_in.authorized_by,
        user_role="owner",
        action="BATCH_REGISTERED",
        resource_type="inventory_batch",
        resource_id=batch.id,
        details=f"Registered batch {batch.batch_code} ({batch.crop_name}) with {batch.current_stock_kg} kg.",
    )
    db.add(audit)

    db.commit()
    db.refresh(batch)
    return batch

def record_stock_intake(db: Session, intake_in: IntakeRequest) -> InventoryTransaction:
    """
    Records physical intake into a storage chamber.
    If booking_id is provided, verifies it belongs to the facility,
    but stock increases ONLY by actual physically received quantity!
    """
    chamber = db.query(StorageLocation).filter(StorageLocation.id == intake_in.chamber_id).first()
    if not chamber:
        raise ValueError(f"Storage location {intake_in.chamber_id} not found")

    # Check chamber physical capacity
    existing_batches = (
        db.query(InventoryBatch)
        .filter(
            InventoryBatch.chamber_id == intake_in.chamber_id,
            InventoryBatch.status == "in_storage",
        )
        .all()
    )
    current_occupancy_kg = sum(b.current_stock_kg for b in existing_batches)
    if current_occupancy_kg + intake_in.quantity_kg > chamber.total_capacity_kg:
        avail = max(0.0, chamber.total_capacity_kg - current_occupancy_kg)
        raise ValueError(
            f"Physical capacity exceeded: {chamber.name} can only accept {avail:.1f} kg "
            f"(intake requested {intake_in.quantity_kg} kg)."
        )

    # Find or create batch
    batch = None
    if intake_in.batch_id:
        batch = db.query(InventoryBatch).filter(InventoryBatch.id == intake_in.batch_id).first()
    elif intake_in.batch_code:
        batch = db.query(InventoryBatch).filter(InventoryBatch.batch_code == intake_in.batch_code).first()

    if not batch:
        # Create a new batch for this intake
        batch = register_product_batch(
            db=db,
            batch_in=BatchCreate(
                facility_id=intake_in.facility_id,
                chamber_id=intake_in.chamber_id,
                crop_name=intake_in.crop_name or "Assorted Produce",
                initial_stock_kg=intake_in.quantity_kg,
                initial_stock_crates=intake_in.quantity_crates,
                intake_date=date.today(),
                booking_id=intake_in.booking_id,
                authorized_by=intake_in.authorized_by,
                notes=f"Intake from {intake_in.source}",
            ),
        )
        tx = (
            db.query(InventoryTransaction)
            .filter(InventoryTransaction.batch_id == batch.id)
            .first()
        )
        return tx

    # If updating an existing batch:
    prev_kg = batch.current_stock_kg
    new_kg = prev_kg + intake_in.quantity_kg
    batch.current_stock_kg = new_kg
    batch.current_stock_crates += intake_in.quantity_crates

    tx = InventoryTransaction(
        batch_id=batch.id,
        batch_code=batch.batch_code,
        facility_id=intake_in.facility_id,
        transaction_type="intake",
        quantity_kg=intake_in.quantity_kg,
        quantity_crates=intake_in.quantity_crates,
        previous_balance_kg=prev_kg,
        new_balance_kg=new_kg,
        destination_location_id=chamber.id,
        authorized_by=intake_in.authorized_by,
        reason=intake_in.reason or "Stock Intake",
        receipt_number=generate_receipt_number("INT"),
        booking_id=intake_in.booking_id,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx

def record_stock_withdrawal(db: Session, wd_in: WithdrawalRequest) -> InventoryTransaction:
    """
    Records stock withdrawal.
    CRITICAL INVARIANTS:
    - Never allow withdrawal exceeding available stock.
    - Never allow negative stock.
    - Updates batch balance and marks empty if balance == 0.
    """
    batch = (
        db.query(InventoryBatch)
        .filter(InventoryBatch.batch_code == wd_in.batch_code)
        .with_for_update()  # Database-level row lock against concurrent withdrawal
        .first()
    )
    if not batch:
        raise ValueError(f"Batch {wd_in.batch_code} not found")

    if wd_in.quantity_kg > batch.current_stock_kg:
        raise ValueError(
            f"Withdrawal quantity ({wd_in.quantity_kg} kg) exceeds current available stock "
            f"({batch.current_stock_kg} kg) in batch {batch.batch_code}."
        )

    prev_kg = batch.current_stock_kg
    new_kg = round(prev_kg - wd_in.quantity_kg, 2)
    new_crates = max(0, batch.current_stock_crates - wd_in.quantity_crates)

    batch.current_stock_kg = new_kg
    batch.current_stock_crates = new_crates
    batch.withdrawn_kg = round(batch.withdrawn_kg + wd_in.quantity_kg, 2)

    if new_kg == 0:
        batch.status = "withdrawn"

    tx = InventoryTransaction(
        batch_id=batch.id,
        batch_code=batch.batch_code,
        facility_id=batch.facility_id,
        transaction_type="withdrawal",
        quantity_kg=wd_in.quantity_kg,
        quantity_crates=wd_in.quantity_crates,
        previous_balance_kg=prev_kg,
        new_balance_kg=new_kg,
        source_location_id=batch.chamber_id,
        authorized_by=wd_in.authorized_by,
        reason=wd_in.reason,
        receipt_number=generate_receipt_number("WD"),
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx

def transfer_stock_locations(db: Session, tf_in: TransferRequest) -> InventoryTransaction:
    """
    Transfers stock between two chambers in the same facility.
    CRITICAL INVARIANTS:
    - Validates source stock is sufficient.
    - Validates destination chamber physical capacity.
    - Preserves total facility stock without duplication or loss.
    """
    batch = (
        db.query(InventoryBatch)
        .filter(InventoryBatch.batch_code == tf_in.batch_code)
        .with_for_update()
        .first()
    )
    if not batch:
        raise ValueError(f"Batch {tf_in.batch_code} not found")

    if tf_in.quantity_kg > batch.current_stock_kg:
        raise ValueError(
            f"Transfer quantity ({tf_in.quantity_kg} kg) exceeds batch stock ({batch.current_stock_kg} kg)."
        )

    dest_chamber = (
        db.query(StorageLocation)
        .filter(StorageLocation.id == tf_in.destination_chamber_id)
        .first()
    )
    if not dest_chamber:
        raise ValueError(f"Destination chamber {tf_in.destination_chamber_id} not found")

    if dest_chamber.is_maintenance:
        raise ValueError(f"Destination chamber {dest_chamber.name} is blocked for maintenance.")

    # Check destination capacity
    dest_batches = (
        db.query(InventoryBatch)
        .filter(
            InventoryBatch.chamber_id == dest_chamber.id,
            InventoryBatch.status == "in_storage",
        )
        .all()
    )
    dest_occupancy = sum(b.current_stock_kg for b in dest_batches)
    if dest_occupancy + tf_in.quantity_kg > dest_chamber.total_capacity_kg:
        avail = max(0.0, dest_chamber.total_capacity_kg - dest_occupancy)
        raise ValueError(
            f"Destination chamber {dest_chamber.name} has only {avail:.1f} kg available space."
        )

    prev_kg = batch.current_stock_kg

    # If entire batch transferred, update chamber_id
    if tf_in.quantity_kg == batch.current_stock_kg:
        batch.chamber_id = dest_chamber.id
    else:
        # Partial transfer: deduct from source batch, create destination batch
        batch.current_stock_kg = round(batch.current_stock_kg - tf_in.quantity_kg, 2)
        batch.current_stock_crates = max(0, batch.current_stock_crates - tf_in.quantity_crates)

        new_dest_batch = InventoryBatch(
            batch_code=generate_batch_code(),
            facility_id=batch.facility_id,
            chamber_id=dest_chamber.id,
            crop_name=batch.crop_name,
            crop_name_ta=batch.crop_name_ta,
            grade=batch.grade,
            initial_stock_kg=tf_in.quantity_kg,
            initial_stock_crates=tf_in.quantity_crates,
            current_stock_kg=tf_in.quantity_kg,
            current_stock_crates=tf_in.quantity_crates,
            withdrawn_kg=0.0,
            intake_date=batch.intake_date,
            condition=batch.condition,
            status="in_storage",
            notes=f"Transferred from batch {batch.batch_code}",
        )
        db.add(new_dest_batch)

    tx = InventoryTransaction(
        batch_id=batch.id,
        batch_code=batch.batch_code,
        facility_id=batch.facility_id,
        transaction_type="transfer",
        quantity_kg=tf_in.quantity_kg,
        quantity_crates=tf_in.quantity_crates,
        previous_balance_kg=prev_kg,
        new_balance_kg=batch.current_stock_kg,
        source_location_id=tf_in.source_chamber_id,
        destination_location_id=dest_chamber.id,
        authorized_by=tf_in.authorized_by,
        reason=tf_in.reason,
        receipt_number=generate_receipt_number("TRF"),
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx

def adjust_stock(db: Session, adj_in: AdjustmentRequest) -> InventoryTransaction:
    """
    Performs audited stock adjustment for physical-count discrepancy, damage, spoilage, loss.
    Mandatory reason required.
    """
    batch = (
        db.query(InventoryBatch)
        .filter(InventoryBatch.batch_code == adj_in.batch_code)
        .with_for_update()
        .first()
    )
    if not batch:
        raise ValueError(f"Batch {adj_in.batch_code} not found")

    prev_kg = batch.current_stock_kg
    diff_kg = adj_in.adjusted_stock_kg - prev_kg
    diff_crates = adj_in.adjusted_stock_crates - batch.current_stock_crates

    # If increasing, check chamber capacity
    if diff_kg > 0:
        chamber = db.query(StorageLocation).filter(StorageLocation.id == batch.chamber_id).first()
        batches = (
            db.query(InventoryBatch)
            .filter(InventoryBatch.chamber_id == batch.chamber_id, InventoryBatch.status == "in_storage")
            .all()
        )
        total_occupancy = sum(b.current_stock_kg for b in batches)
        if total_occupancy + diff_kg > chamber.total_capacity_kg:
            raise ValueError(
                f"Adjustment exceeds chamber capacity of {chamber.total_capacity_kg} kg."
            )

    batch.current_stock_kg = adj_in.adjusted_stock_kg
    batch.current_stock_crates = adj_in.adjusted_stock_crates
    if adj_in.condition:
        batch.condition = adj_in.condition
    if adj_in.adjusted_stock_kg == 0:
        batch.status = "withdrawn"

    tx = InventoryTransaction(
        batch_id=batch.id,
        batch_code=batch.batch_code,
        facility_id=batch.facility_id,
        transaction_type="adjustment",
        quantity_kg=abs(diff_kg),
        quantity_crates=abs(diff_crates),
        previous_balance_kg=prev_kg,
        new_balance_kg=adj_in.adjusted_stock_kg,
        source_location_id=batch.chamber_id,
        authorized_by=adj_in.authorized_by,
        reason=adj_in.reason,
        receipt_number=generate_receipt_number("ADJ"),
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx

def archive_batch(db: Session, batch_code: str, authorized_by: str) -> InventoryBatch:
    """
    Soft-deletes/archives an eligible batch.
    CRITICAL RULE: Prevents archival if active physical stock remains!
    """
    batch = db.query(InventoryBatch).filter(InventoryBatch.batch_code == batch_code).first()
    if not batch:
        raise ValueError(f"Batch {batch_code} not found")

    if batch.current_stock_kg > 0:
        raise ValueError(
            f"Cannot archive batch {batch_code}: {batch.current_stock_kg} kg active stock remains. "
            "Perform stock withdrawal or adjustment to zero before archiving."
        )

    batch.status = "archived"
    audit = AuditLog(
        user_id=authorized_by,
        action="BATCH_ARCHIVED",
        resource_type="inventory_batch",
        resource_id=batch.id,
        details=f"Batch {batch.batch_code} archived.",
    )
    db.add(audit)
    db.commit()
    db.refresh(batch)
    return batch
