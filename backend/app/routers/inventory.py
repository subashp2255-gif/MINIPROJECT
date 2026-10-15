from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import InventoryBatch, InventoryTransaction, InventoryAlert
from ..schemas import (
    BatchCreate,
    BatchResponse,
    IntakeRequest,
    WithdrawalRequest,
    TransferRequest,
    AdjustmentRequest,
    TransactionResponse,
    InventoryAlertResponse,
)
from ..crud import (
    register_product_batch,
    record_stock_intake,
    record_stock_withdrawal,
    transfer_stock_locations,
    adjust_stock,
    archive_batch,
)

router = APIRouter(prefix="/api/inventory", tags=["Normal Inventory Management"])

@router.post("/batches", response_model=BatchResponse, status_code=status.HTTP_201_CREATED)
def create_batch(req: BatchCreate, db: Session = Depends(get_db)):
    """
    Independent batch registration.
    CRITICAL RULE: booking_id is strictly OPTIONAL. Works for walk-ins, suppliers, pre-existing stock.
    """
    try:
        return register_product_batch(db, req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/batches", response_model=List[BatchResponse])
def list_batches(
    facility_id: Optional[str] = None,
    chamber_id: Optional[str] = None,
    crop_name: Optional[str] = None,
    status: Optional[str] = None,
    condition: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(InventoryBatch)
    if facility_id:
        query = query.filter(InventoryBatch.facility_id == facility_id)
    if chamber_id:
        query = query.filter(InventoryBatch.chamber_id == chamber_id)
    if status:
        query = query.filter(InventoryBatch.status == status)
    if condition:
        query = query.filter(InventoryBatch.condition == condition)
    if crop_name:
        query = query.filter(InventoryBatch.crop_name.ilike(f"%{crop_name}%"))
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (InventoryBatch.batch_code.ilike(search_filter))
            | (InventoryBatch.crop_name.ilike(search_filter))
            | (InventoryBatch.farmer_name.ilike(search_filter))
        )
    return query.order_by(InventoryBatch.created_at.desc()).all()

@router.get("/batches/{batch_ref}", response_model=BatchResponse)
def get_batch(batch_ref: str, db: Session = Depends(get_db)):
    batch = (
        db.query(InventoryBatch)
        .filter((InventoryBatch.id == batch_ref) | (InventoryBatch.batch_code == batch_ref))
        .first()
    )
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch

@router.post("/intake", response_model=TransactionResponse)
def stock_intake(req: IntakeRequest, db: Session = Depends(get_db)):
    """
    Records physical stock intake into destination storage chamber.
    Booking reference is optional. Stock increases ONLY by actual physically received quantity.
    """
    try:
        return record_stock_intake(db, req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/withdrawal", response_model=TransactionResponse)
def stock_withdrawal(req: WithdrawalRequest, db: Session = Depends(get_db)):
    """
    Records physical stock withdrawal.
    Validates withdrawable quantity, strictly prevents negative stock.
    """
    try:
        return record_stock_withdrawal(db, req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/transfers", response_model=TransactionResponse)
def transfer_stock(req: TransferRequest, db: Session = Depends(get_db)):
    """
    Transfers stock between storage chambers within a facility.
    Preserves total facility stock.
    """
    try:
        return transfer_stock_locations(db, req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/adjustments", response_model=TransactionResponse)
def adjust_inventory_stock(req: AdjustmentRequest, db: Session = Depends(get_db)):
    """
    Adjusts stock for physical count discrepancy, damage, spoilage, loss with mandatory audit reason.
    """
    try:
        return adjust_stock(db, req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/batches/{batch_code}/archive", response_model=BatchResponse)
def archive_batch_endpoint(
    batch_code: str, authorized_by: str = Query("Manager"), db: Session = Depends(get_db)
):
    """
    Soft-deletes / archives eligible batch.
    Rejects if active physical stock remains.
    """
    try:
        return archive_batch(db, batch_code, authorized_by)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/transactions", response_model=List[TransactionResponse])
def list_transactions(
    facility_id: Optional[str] = None,
    batch_code: Optional[str] = None,
    transaction_type: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(InventoryTransaction)
    if facility_id:
        query = query.filter(InventoryTransaction.facility_id == facility_id)
    if batch_code:
        query = query.filter(InventoryTransaction.batch_code == batch_code)
    if transaction_type:
        query = query.filter(InventoryTransaction.transaction_type == transaction_type)
    return query.order_by(InventoryTransaction.timestamp.desc()).limit(limit).all()

@router.get("/alerts", response_model=List[InventoryAlertResponse])
def list_alerts(facility_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(InventoryAlert).filter(InventoryAlert.is_resolved == False)
    if facility_id:
        query = query.filter(InventoryAlert.facility_id == facility_id)
    return query.order_by(InventoryAlert.created_at.desc()).all()
