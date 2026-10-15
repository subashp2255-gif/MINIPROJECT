from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas import (
    PriceForecastRequest,
    PriceForecastResponse,
    ArbitrageRequest,
    ArbitrageResponse,
    AIInsightItem,
)
from ..ai_engine import predict_crop_price, calculate_arbitrage, generate_ai_insights

router = APIRouter(prefix="/api/ai", tags=["AI & Advisory"])

@router.post("/forecast-price", response_model=PriceForecastResponse)
def get_price_forecast(req: PriceForecastRequest):
    return predict_crop_price(req)

@router.post("/arbitrage", response_model=ArbitrageResponse)
def get_arbitrage_gain(req: ArbitrageRequest):
    return calculate_arbitrage(req)

@router.get("/insights", response_model=List[AIInsightItem])
def get_facility_insights(
    facility_id: str = Query("fac-1"), db: Session = Depends(get_db)
):
    return generate_ai_insights(db, facility_id=facility_id)
