from datetime import date, timedelta
from typing import Optional, List, Tuple, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from .models import Facility, StorageLocation, Booking, InventoryBatch
from .schemas import AvailabilityCheckResponse, AlternativeOption, CapacityLedgerResponse

def calculate_facility_capacity_ledger(
    db: Session, facility_id: str, query_date: Optional[date] = None
) -> CapacityLedgerResponse:
    """
    Computes BOTH capacity ledgers independently:
    1. Physical Occupancy: actual physical batches present in storage.
    2. Reserved Capacity: capacity committed to active bookings for query_date.
    """
    if query_date is None:
        query_date = date.today()

    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise ValueError(f"Facility {facility_id} not found")

    chambers = db.query(StorageLocation).filter(StorageLocation.facility_id == facility_id).all()

    total_rated_crates = sum(c.total_capacity_crates for c in chambers)
    total_rated_kg = sum(c.total_capacity_kg for c in chambers)

    # 1. Physical occupancy (derived ONLY from physical batches currently in storage)
    physical_batches = (
        db.query(InventoryBatch)
        .filter(
            InventoryBatch.facility_id == facility_id,
            InventoryBatch.status == "in_storage",
            InventoryBatch.current_stock_kg > 0,
        )
        .all()
    )
    current_physical_kg = sum(b.current_stock_kg for b in physical_batches)
    current_physical_crates = sum(b.current_stock_crates for b in physical_batches)

    # Maintenance blocked
    maint_chambers = [c for c in chambers if c.is_maintenance]
    maint_blocked_crates = sum(c.total_capacity_crates for c in maint_chambers)
    maint_blocked_kg = sum(c.total_capacity_kg for c in maint_chambers)

    # Available Physical Capacity
    avail_phys_crates = max(0, total_rated_crates - current_physical_crates - maint_blocked_crates)
    avail_phys_kg = max(0.0, total_rated_kg - current_physical_kg - maint_blocked_kg)

    # 2. Reserved Capacity (derived ONLY from valid bookings overlapping query_date)
    active_bookings = (
        db.query(Booking)
        .filter(
            Booking.facility_id == facility_id,
            Booking.status.in_(["confirmed", "in_storage", "pending"]),
            Booking.start_date <= query_date,
            Booking.end_date >= query_date,
        )
        .all()
    )
    reserved_crates_today = sum(b.booked_crates for b in active_bookings)
    reserved_kg_today = sum(b.booked_kg for b in active_bookings)

    util_phys = round((current_physical_kg / max(1.0, total_rated_kg)) * 100, 1)
    util_res = round((reserved_kg_today / max(1.0, total_rated_kg)) * 100, 1)

    return CapacityLedgerResponse(
        facility_id=facility.id,
        facility_name=facility.name,
        total_rated_capacity_kg=total_rated_kg,
        total_rated_capacity_crates=total_rated_crates,
        current_physical_occupancy_kg=current_physical_kg,
        current_physical_occupancy_crates=current_physical_crates,
        available_physical_capacity_kg=avail_phys_kg,
        available_physical_capacity_crates=avail_phys_crates,
        reserved_capacity_kg_today=reserved_kg_today,
        reserved_capacity_crates_today=reserved_crates_today,
        maintenance_blocked_kg=maint_blocked_kg,
        maintenance_blocked_crates=maint_blocked_crates,
        utilization_physical_percentage=util_phys,
        utilization_reserved_percentage=util_res,
    )

def check_capacity_availability(
    db: Session,
    facility_id: str,
    chamber_id: Optional[str],
    start_date: date,
    duration_days: int,
    requested_crates: int,
    requested_kg: Optional[float] = None,
) -> AvailabilityCheckResponse:
    """
    Evaluates capacity availability for the entire requested interval [start_date, end_date].
    Uses consistent capacity ledger:
    Remaining capacity at time t = Rated capacity - Active reservations at time t - Maintenance
    """
    if requested_kg is None:
        requested_kg = requested_crates * 25.0

    end_date = start_date + timedelta(days=duration_days)

    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise ValueError(f"Facility {facility_id} not found")

    target_chamber = None
    if chamber_id:
        target_chamber = (
            db.query(StorageLocation)
            .filter(StorageLocation.id == chamber_id, StorageLocation.facility_id == facility_id)
            .first()
        )
    if not target_chamber:
        # Default to first non-maintenance chamber with highest capacity
        target_chamber = (
            db.query(StorageLocation)
            .filter(StorageLocation.facility_id == facility_id, StorageLocation.is_maintenance == False)
            .first()
        )
    if not target_chamber:
        target_chamber = (
            db.query(StorageLocation).filter(StorageLocation.facility_id == facility_id).first()
        )

    # 1. Maintenance Check
    if target_chamber.is_maintenance:
        alternatives = find_alternatives(
            db, facility_id, target_chamber.id, start_date, duration_days, requested_crates
        )
        return AvailabilityCheckResponse(
            is_available=False,
            facility_id=facility.id,
            chamber_id=target_chamber.id,
            chamber_name=target_chamber.name,
            requested_crates=requested_crates,
            requested_kg=requested_kg,
            start_date=start_date,
            end_date=end_date,
            duration_days=duration_days,
            min_available_crates_in_period=0,
            min_available_kg_in_period=0.0,
            deficit_crates=requested_crates,
            estimated_cost=0.0,
            message=f"{target_chamber.name} is currently blocked for maintenance: {target_chamber.maintenance_reason or 'Compressor calibration'}.",
            alternatives=alternatives,
        )

    # 2. Multi-Day Interval Capacity Check
    chamber_rated_crates = target_chamber.total_capacity_crates
    min_avail_crates = chamber_rated_crates

    # Fetch all overlapping active bookings for this chamber
    overlapping_bookings = (
        db.query(Booking)
        .filter(
            Booking.chamber_id == target_chamber.id,
            Booking.status.in_(["confirmed", "in_storage", "pending"]),
            Booking.start_date <= end_date,
            Booking.end_date >= start_date,
        )
        .all()
    )

    for day_offset in range(duration_days):
        current_day = start_date + timedelta(days=day_offset)
        # Sum reservations on this day
        day_reserved = sum(
            b.booked_crates
            for b in overlapping_bookings
            if b.start_date <= current_day <= b.end_date
        )
        day_available = max(0, chamber_rated_crates - day_reserved)
        if day_available < min_avail_crates:
            min_avail_crates = day_available

    is_available = min_avail_crates >= requested_crates
    deficit_crates = max(0, requested_crates - min_avail_crates)

    # Transparent Cost Estimation
    daily_rate = facility.price_per_crate_day
    base_cost = requested_crates * daily_rate * duration_days
    handling_fee = requested_crates * 2.0  # ₹2 / crate intake handling
    solar_fee = (requested_crates * 0.5 * duration_days) if facility.is_solar_powered else 0.0
    estimated_total = round(base_cost + handling_fee + solar_fee, 2)

    alternatives = []
    if not is_available:
        alternatives = find_alternatives(
            db, facility_id, target_chamber.id, start_date, duration_days, requested_crates
        )
        message = (
            f"Capacity deficit: {target_chamber.name} only has {min_avail_crates} crates available "
            f"during the requested period (requested {requested_crates} crates)."
        )
    else:
        message = (
            f"Capacity confirmed! {min_avail_crates} crates available in {target_chamber.name} "
            f"for all {duration_days} days."
        )

    return AvailabilityCheckResponse(
        is_available=is_available,
        facility_id=facility.id,
        chamber_id=target_chamber.id,
        chamber_name=target_chamber.name,
        requested_crates=requested_crates,
        requested_kg=requested_kg,
        start_date=start_date,
        end_date=end_date,
        duration_days=duration_days,
        min_available_crates_in_period=min_avail_crates,
        min_available_kg_in_period=min_avail_crates * 25.0,
        deficit_crates=deficit_crates,
        estimated_cost=estimated_total,
        message=message,
        alternatives=alternatives,
    )

def find_alternatives(
    db: Session,
    current_facility_id: str,
    current_chamber_id: str,
    start_date: date,
    duration_days: int,
    requested_crates: int,
) -> List[AlternativeOption]:
    """Finds alternative chambers in the same facility or sister facilities with sufficient space."""
    alternatives: List[AlternativeOption] = []
    end_date = start_date + timedelta(days=duration_days)

    # 1. Other chambers in the same facility
    sister_chambers = (
        db.query(StorageLocation)
        .filter(
            StorageLocation.facility_id == current_facility_id,
            StorageLocation.id != current_chamber_id,
            StorageLocation.is_maintenance == False,
        )
        .all()
    )

    for cham in sister_chambers:
        bookings = (
            db.query(Booking)
            .filter(
                Booking.chamber_id == cham.id,
                Booking.status.in_(["confirmed", "in_storage", "pending"]),
                Booking.start_date <= end_date,
                Booking.end_date >= start_date,
            )
            .all()
        )
        min_avail = cham.total_capacity_crates
        for d in range(duration_days):
            day = start_date + timedelta(days=d)
            res = sum(b.booked_crates for b in bookings if b.start_date <= day <= b.end_date)
            min_avail = min(min_avail, max(0, cham.total_capacity_crates - res))

        if min_avail >= requested_crates:
            facility = db.query(Facility).filter(Facility.id == current_facility_id).first()
            alternatives.append(
                AlternativeOption(
                    facility_id=current_facility_id,
                    facility_name=facility.name,
                    chamber_id=cham.id,
                    chamber_name=cham.name,
                    available_crates=min_avail,
                    available_kg=min_avail * 25.0,
                    suggested_start_date=start_date,
                    reason=f"Instant space available in sister chamber {cham.name} ({cham.chamber_type})",
                )
            )

    # 2. Other facilities
    other_facilities = (
        db.query(Facility).filter(Facility.id != current_facility_id).limit(2).all()
    )
    for other_fac in other_facilities:
        chambers = (
            db.query(StorageLocation)
            .filter(
                StorageLocation.facility_id == other_fac.id,
                StorageLocation.is_maintenance == False,
            )
            .all()
        )
        for cham in chambers:
            if cham.total_capacity_crates >= requested_crates:
                alternatives.append(
                    AlternativeOption(
                        facility_id=other_fac.id,
                        facility_name=other_fac.name,
                        chamber_id=cham.id,
                        chamber_name=cham.name,
                        available_crates=cham.total_capacity_crates,
                        available_kg=cham.total_capacity_kg,
                        suggested_start_date=start_date,
                        reason=f"Nearby partner facility ({other_fac.district}) with guaranteed chamber slot",
                    )
                )
                break

    return alternatives
