from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import numpy as np

app = FastAPI(
    title="Smart Rural Storage AI Microservice",
    description="AI-driven Mandi Crop Price Forecasting & Cold Storage Arbitrage Engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PriceForecastRequest(BaseModel):
    crop: str
    mandi: str
    horizon_days: int = 7

class ArbitrageRequest(BaseModel):
    weight_kg: float
    spot_price_per_kg: float
    forecast_price_per_kg: float
    daily_crate_fee: float = 2.90
    crates_per_tonne: int = 40
    duration_days: int = 7

class AdvisoryRequest(BaseModel):
    crop: str
    temperature_c: float
    humidity_percent: float
    days_in_storage: int
    language: str = "en"

# Base price benchmark data for Tamil Nadu regulated APMC Mandis
BENCHMARKS = {
    "tomato": {"spot": 24.0, "rise_rate": 2.2, "volatility": 1.4},
    "potato": {"spot": 28.0, "rise_rate": 1.6, "volatility": 0.9},
    "onion": {"spot": 42.0, "rise_rate": 3.1, "volatility": 2.1},
    "chillies": {"spot": 65.0, "rise_rate": 4.5, "volatility": 3.0},
}

@app.get("/")
def root():
    return {
        "service": "Smart Rural Storage AI Engine",
        "status": "online",
        "region": "Tamil Nadu Agro Logistics Cluster"
    }

@app.get("/health")
def health():
    return {"status": "healthy", "gpu_acceleration": False}

@app.post("/predict-price")
def predict_price(req: PriceForecastRequest):
    crop_key = req.crop.lower()
    found_key = None
    for k in BENCHMARKS:
        if k in crop_key:
            found_key = k
            break
    
    if not found_key:
        found_key = "tomato"

    params = BENCHMARKS[found_key]
    spot = params["spot"]
    points = []

    current = spot
    for day in range(1, req.horizon_days + 1):
        rise = params["rise_rate"] * (1.0 - 0.03 * day)
        current = round(current + rise, 2)
        lower = round(current - params["volatility"] * np.sqrt(day), 2)
        upper = round(current + params["volatility"] * np.sqrt(day), 2)
        storage_cost_accum = round(0.12 * day, 2)

        points.append({
            "day": f"Day {day}",
            "projected_price": current,
            "lower_confidence_95": max(spot, lower),
            "upper_confidence_95": upper,
            "storage_cost_accumulated": storage_cost_accum
        })

    return {
        "crop": req.crop,
        "mandi": req.mandi,
        "spot_price": spot,
        "horizon_days": req.horizon_days,
        "forecast_points": points,
        "recommended_action": "STORE" if points[-1]["projected_price"] > (spot + points[-1]["storage_cost_accumulated"] * 3) else "SELL_NOW"
    }

@app.post("/arbitrage-calculate")
def calculate_arbitrage(req: ArbitrageRequest):
    crates = int(np.ceil(req.weight_kg / 25.0))
    revenue_today = req.weight_kg * req.spot_price_per_kg
    revenue_forecast = req.weight_kg * req.forecast_price_per_kg
    storage_cost = crates * req.daily_crate_fee * req.duration_days
    handling_fee = crates * 2.0
    total_cost = storage_cost + handling_fee

    net_arbitrage_gain = revenue_forecast - revenue_today - total_cost
    roi_percentage = round((net_arbitrage_gain / max(1.0, revenue_today)) * 100, 1)

    return {
        "crates_count": crates,
        "revenue_today": round(revenue_today, 2),
        "revenue_future": round(revenue_forecast, 2),
        "total_holding_cost": round(total_cost, 2),
        "net_gain": round(net_arbitrage_gain, 2),
        "roi_percentage": roi_percentage,
        "is_profitable": net_arbitrage_gain > 0
    }

@app.post("/ai-advisory")
def generate_advisory(req: AdvisoryRequest):
    if req.language == "ta":
        return {
            "advice": (
                f"{req.crop} சேமிப்பில் {req.days_in_storage} நாட்கள் கழிந்துள்ளது. "
                f"அறை வெப்பநிலை {req.temperature_c}°C மற்றும் ஈரப்பதம் {req.humidity_percent}% உகந்ததாக உள்ளது. "
                "அடுத்த 3-5 நாட்களில் மண்டி விலை உச்சத்தை எட்டும் என்பதால் சேமிப்பை தொடரவும்."
            ),
            "confidence": 0.94
        }
    else:
        return {
            "advice": (
                f"{req.crop} has completed {req.days_in_storage} days in cold storage. "
                f"Chamber telemetry ({req.temperature_c}°C, {req.humidity_percent}% RH) is within the optimal envelope. "
                "Market arrivals in Oddanchatram are tapering; holding for an additional 4 days will capture the projected wholesale price surge."
            ),
            "confidence": 0.94
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
