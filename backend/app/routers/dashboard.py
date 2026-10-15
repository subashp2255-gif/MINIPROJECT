from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from ..database import get_db
from ..models import Facility, Booking, InventoryBatch, InventoryTransaction, InventoryAlert
from ..schemas import OwnerDashboardAnalyticsResponse
from ..capacity_engine import calculate_facility_capacity_ledger

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard Analytics"])

@router.get("/owner", response_model=OwnerDashboardAnalyticsResponse)
def get_owner_dashboard(facility_id: str, db: Session = Depends(get_db)):
    """
    Computes owner analytics distinguishing physical occupancy vs reserved capacity.
    """
    try:
        ledger = calculate_facility_capacity_ledger(db, facility_id=facility_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    active_bookings_count = (
        db.query(Booking)
        .filter(Booking.facility_id == facility_id, Booking.status.in_(["confirmed", "in_storage"]))
        .count()
    )

    batches = (
        db.query(InventoryBatch)
        .filter(
            InventoryBatch.facility_id == facility_id,
            InventoryBatch.status == "in_storage",
            InventoryBatch.current_stock_kg > 0,
        )
        .all()
    )
    active_batches_count = len(batches)

    # Movements today
    today_start = date.today()
    movements_today = (
        db.query(InventoryTransaction)
        .filter(InventoryTransaction.facility_id == facility_id)
        .count()
    )

    recent_txs = (
        db.query(InventoryTransaction)
        .filter(InventoryTransaction.facility_id == facility_id)
        .order_by(InventoryTransaction.timestamp.desc())
        .limit(10)
        .all()
    )

    alerts = (
        db.query(InventoryAlert)
        .filter(InventoryAlert.facility_id == facility_id, InventoryAlert.is_resolved == False)
        .all()
    )

    low_stock = sum(1 for b in batches if b.current_stock_crates <= 5)
    near_expiry = sum(
        1 for b in batches if b.expiry_date and (b.expiry_date - date.today()).days <= 7
    )
    damaged_kg = sum(
        b.current_stock_kg for b in batches if b.condition in ["damaged", "spoiled"]
    )

    return OwnerDashboardAnalyticsResponse(
        capacity_ledger=ledger,
        total_active_bookings=active_bookings_count,
        total_active_batches=active_batches_count,
        total_stock_movements_today=movements_today,
        recent_transactions=recent_txs,
        active_alerts=alerts,
        low_stock_count=low_stock,
        near_expiry_count=near_expiry,
        damaged_stock_kg=damaged_kg,
    )
