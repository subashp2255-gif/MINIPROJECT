import type { Booking, Facility } from '../types';

export interface DemandDataPoint {
  date: string;
  quantityKg: number;
  cropName: string;
  facilityId: string;
}

export interface ModelEvaluation {
  mae: number;
  rmse: number;
  baselineMae: number;
  baselineRmse: number;
  sampleSize: number;
  trainSize: number;
  testSize: number;
  modelBetterThanBaseline: boolean;
}

export interface CropDemandForecast {
  cropName: string;
  projectedKg7d: number;
  projectedKg14d: number;
  projectedKg30d: number;
  confidenceLowerKg: number;
  confidenceUpperKg: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface FacilityCapacityPressure {
  facilityId: string;
  facilityName: string;
  totalCapacityKg: number;
  availableCapacityKg: number;
  projectedDemandKg14d: number;
  projectedOccupancyPercent: number;
  pressureLevel: 'safe' | 'moderate' | 'critical';
  advisoryMessage: string;
  advisoryMessageTa: string;
}

export interface DemandForecastResult {
  hasSufficientData: boolean;
  sampleCount: number;
  minimumRequired: number;
  generatedAt: string;
  modelVersion: string;
  forecastHorizonDays: number;
  evaluation?: ModelEvaluation;
  facilityPressures: FacilityCapacityPressure[];
  cropForecasts: CropDemandForecast[];
  historicalDailySummary: { date: string; totalKg: number }[];
  farmerAdvisory: {
    messageEn: string;
    messageTa: string;
    highlightFacility?: string;
  };
  limitations: string[];
}

function getFacilityCapacities(f: Facility): { totalCapacityKg: number; availableCapacityKg: number } {
  if (f.chambers && f.chambers.length > 0) {
    const total = f.chambers.reduce((sum, c) => sum + (c.totalCapacityKg || 0), 0);
    const avail = f.chambers.reduce((sum, c) => sum + (c.availableCapacityKg || 0), 0);
    return { totalCapacityKg: total || 50000, availableCapacityKg: avail || 35000 };
  }
  return { totalCapacityKg: 50000, availableCapacityKg: 35000 };
}

/**
 * Validates, sorts and aggregates historical bookings by day.
 */
function extractHistoricalDailyDemand(bookings: Booking[], facilityId?: string): { date: string; totalKg: number; cropName: string }[] {
  const filtered = bookings.filter((b) => {
    const validStatus = b.status !== 'cancelled' && b.status !== 'rejected';
    const facilityMatch = facilityId ? b.facilityId === facilityId : true;
    const qty = (b as unknown as { quantityKg?: number }).quantityKg ?? b.bookedKg ?? 0;
    return validStatus && facilityMatch && qty > 0 && b.startDate;
  });

  // Sort chronologically
  filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // Aggregate by start date
  const dateMap = new Map<string, { totalKg: number; cropName: string }>();
  for (const b of filtered) {
    const d = b.startDate.slice(0, 10);
    const qty = (b as unknown as { quantityKg?: number }).quantityKg ?? b.bookedKg ?? 0;
    const existing = dateMap.get(d) || { totalKg: 0, cropName: b.cropName };
    existing.totalKg += Number(qty);
    existing.cropName = b.cropName;
    dateMap.set(d, existing);
  }

  return Array.from(dateMap.entries()).map(([date, val]) => ({
    date,
    totalKg: val.totalKg,
    cropName: val.cropName,
  }));
}

/**
 * Calculates Double Exponential Smoothing (Holt's Linear Trend) with dampening.
 */
function calculateHoltSmoothing(
  data: number[],
  alpha = 0.4,
  beta = 0.2,
  horizon = 14
): { fitted: number[]; future: number[] } {
  if (data.length < 2) {
    return {
      fitted: data,
      future: Array(horizon).fill(data[0] || 0),
    };
  }

  let level = data[0];
  let trend = data[1] - data[0];
  const fitted: number[] = [level];

  for (let i = 1; i < data.length; i++) {
    const val = data[i];
    const prevLevel = level;
    level = alpha * val + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    fitted.push(Math.max(0, Math.round(level + trend)));
  }

  const future: number[] = [];
  for (let h = 1; h <= horizon; h++) {
    const damping = Math.pow(0.95, h);
    const forecastVal = Math.max(0, Math.round(level + h * trend * damping));
    future.push(forecastVal);
  }

  return { fitted, future };
}

/**
 * Performs chronological time-series train/test evaluation (older 70% train vs newer 30% test).
 */
function evaluateTimeSeriesSplit(series: number[]): ModelEvaluation {
  const n = series.length;
  const trainSize = Math.max(3, Math.floor(n * 0.7));
  const testSize = n - trainSize;

  const train = series.slice(0, trainSize);
  const test = series.slice(trainSize);

  const { future: modelPredictions } = calculateHoltSmoothing(train, 0.4, 0.2, testSize);
  const baselineVal = train.reduce((a, b) => a + b, 0) / train.length;

  let modelErrorSum = 0;
  let modelSqErrorSum = 0;
  let baseErrorSum = 0;
  let baseSqErrorSum = 0;

  for (let i = 0; i < testSize; i++) {
    const actual = test[i];
    const mPred = modelPredictions[i] ?? baselineVal;

    modelErrorSum += Math.abs(actual - mPred);
    modelSqErrorSum += Math.pow(actual - mPred, 2);

    baseErrorSum += Math.abs(actual - baselineVal);
    baseSqErrorSum += Math.pow(actual - baselineVal, 2);
  }

  const mae = Math.round((modelErrorSum / testSize) * 10) / 10;
  const rmse = Math.round(Math.sqrt(modelSqErrorSum / testSize) * 10) / 10;
  const baselineMae = Math.round((baseErrorSum / testSize) * 10) / 10;
  const baselineRmse = Math.round(Math.sqrt(baseSqErrorSum / testSize) * 10) / 10;

  return {
    mae,
    rmse,
    baselineMae,
    baselineRmse,
    sampleSize: n,
    trainSize,
    testSize,
    modelBetterThanBaseline: mae <= baselineMae,
  };
}

export const demandForecastService = {
  /**
   * Generates facility cold storage demand forecast.
   * If bookings < 5, returns transparent insufficientData response with historical summary.
   */
  generateDemandForecast(bookings: Booking[], facilities: Facility[]): DemandForecastResult {
    const MIN_SAMPLE_THRESHOLD = 5;
    const historicalPoints = extractHistoricalDailyDemand(bookings);
    const sampleCount = historicalPoints.length;
    const generatedAt = new Date().toISOString();
    const modelVersion = 'DES-Holt-v1.2 (Chronological Validation)';

    const limitations = [
      'Demand forecasts are strictly advisory decision support and never mutate database bookings or lock capacities.',
      'Small sample sizes reflect recent cold chain pilot deployment and will improve with cumulative harvest cycles.',
      'Extreme microclimate events (sudden monsoons, heatwaves) may cause short-term variance not captured in booking history.',
    ];

    // Check data sufficiency
    if (sampleCount < MIN_SAMPLE_THRESHOLD) {
      const facilityPressures: FacilityCapacityPressure[] = facilities.map((f) => {
        const { totalCapacityKg, availableCapacityKg } = getFacilityCapacities(f);
        const usedKg = Math.max(0, totalCapacityKg - availableCapacityKg);
        const currentPct = Math.round((usedKg / totalCapacityKg) * 100);
        return {
          facilityId: f.id,
          facilityName: f.name,
          totalCapacityKg,
          availableCapacityKg,
          projectedDemandKg14d: 0,
          projectedOccupancyPercent: currentPct,
          pressureLevel: currentPct > 85 ? 'critical' : currentPct > 65 ? 'moderate' : 'safe',
          advisoryMessage: `Current facility occupancy is at ${currentPct}%. More booking history needed for predictive trend.`,
          advisoryMessageTa: `தற்போது கொள்ளளவு பயன்பாடு ${currentPct}%. துல்லியமான கணிப்புக்கு கூடுதல் வரலாறு தேவை.`,
        };
      });

      return {
        hasSufficientData: false,
        sampleCount,
        minimumRequired: MIN_SAMPLE_THRESHOLD,
        generatedAt,
        modelVersion,
        forecastHorizonDays: 14,
        facilityPressures,
        cropForecasts: [],
        historicalDailySummary: historicalPoints.map((p) => ({ date: p.date, totalKg: p.totalKg })),
        farmerAdvisory: {
          messageEn: 'Cold storage facilities are currently accepting bookings. Early reservations recommended during harvest periods.',
          messageTa: 'குளிர்பதனக் கிடங்குகளில் முன்பதிவுகள் திறக்கப்பட்டுள்ளன. அறுவடை காலங்களில் முன்கூட்டியே பதிவு செய்யவும்.',
        },
        limitations,
      };
    }

    // When sample points >= MIN_SAMPLE_THRESHOLD
    const series = historicalPoints.map((p) => p.totalKg);
    const evaluation = evaluateTimeSeriesSplit(series);
    const { future } = calculateHoltSmoothing(series, 0.4, 0.2, 30);

    const sum7d = future.slice(0, 7).reduce((a, b) => a + b, 0);
    const sum14d = future.slice(0, 14).reduce((a, b) => a + b, 0);
    const sum30d = future.slice(0, 30).reduce((a, b) => a + b, 0);

    // Group historical demand by crop
    const cropGroups = new Map<string, number>();
    for (const b of bookings) {
      if (b.status !== 'cancelled' && b.status !== 'rejected') {
        const qty = (b as unknown as { quantityKg?: number }).quantityKg ?? b.bookedKg ?? 0;
        const current = cropGroups.get(b.cropName) || 0;
        cropGroups.set(b.cropName, current + Number(qty));
      }
    }
    const totalHistoricalKg = Array.from(cropGroups.values()).reduce((a, b) => a + b, 0) || 1;

    const cropForecasts: CropDemandForecast[] = Array.from(cropGroups.entries()).map(([cropName, totalKg]) => {
      const share = totalKg / totalHistoricalKg;
      const crop7d = Math.round(sum7d * share);
      const crop14d = Math.round(sum14d * share);
      const crop30d = Math.round(sum30d * share);

      const errorMargin = evaluation.mae * Math.sqrt(14) * share;
      const confidenceLowerKg = Math.max(0, Math.round(crop14d - 1.645 * errorMargin));
      const confidenceUpperKg = Math.round(crop14d + 1.645 * errorMargin);

      const trend: 'increasing' | 'stable' | 'decreasing' =
        crop14d > crop7d * 2.1 ? 'increasing' : crop14d < crop7d * 1.8 ? 'decreasing' : 'stable';

      return {
        cropName,
        projectedKg7d: crop7d,
        projectedKg14d: crop14d,
        projectedKg30d: crop30d,
        confidenceLowerKg,
        confidenceUpperKg,
        trend,
      };
    });

    // Facility capacity pressures
    const facilityPressures: FacilityCapacityPressure[] = facilities.map((f) => {
      const { totalCapacityKg, availableCapacityKg } = getFacilityCapacities(f);
      const currentUsed = Math.max(0, totalCapacityKg - availableCapacityKg);
      const totalNetworkCap = facilities.reduce((sum, item) => sum + getFacilityCapacities(item).totalCapacityKg, 0) || 1;
      const facilityShare = totalCapacityKg / totalNetworkCap;
      const projectedIncomingKg = Math.round(sum14d * facilityShare);
      const totalProjectedOccupancyKg = currentUsed + projectedIncomingKg;
      const projectedOccupancyPercent = Math.min(100, Math.round((totalProjectedOccupancyKg / totalCapacityKg) * 100));

      let pressureLevel: 'safe' | 'moderate' | 'critical' = 'safe';
      let advisoryMessage = `Projected 14-day utilization: ${projectedOccupancyPercent}%. Capacity is ample.`;
      let advisoryMessageTa = `அடுத்த 14 நாட்களில் எதிர்பார்க்கப்படும் பயன்பாடு: ${projectedOccupancyPercent}%. போதுமான இடமுள்ளது.`;

      if (projectedOccupancyPercent >= 85) {
        pressureLevel = 'critical';
        advisoryMessage = `High capacity pressure expected (${projectedOccupancyPercent}%). Prepare secondary bays and review pickup schedules.`;
        advisoryMessageTa = `அதிக கொள்ளளவு அழுத்தம் எதிர்பார்க்கப்படுகிறது (${projectedOccupancyPercent}%). கூடுதல் அறைகளைத் தயார் செய்யவும்.`;
      } else if (projectedOccupancyPercent >= 65) {
        pressureLevel = 'moderate';
        advisoryMessage = `Moderate intake surge expected (${projectedOccupancyPercent}%). Monitor crate intake flow.`;
        advisoryMessageTa = `மிதமான வரத்து எதிர்பார்க்கப்படுகிறது (${projectedOccupancyPercent}%). வருகைக் கூடுகளைக் கண்காணிக்கவும்.`;
      }

      return {
        facilityId: f.id,
        facilityName: f.name,
        totalCapacityKg,
        availableCapacityKg,
        projectedDemandKg14d: projectedIncomingKg,
        projectedOccupancyPercent,
        pressureLevel,
        advisoryMessage,
        advisoryMessageTa,
      };
    });

    const criticalFacility = facilityPressures.find((p) => p.pressureLevel === 'critical');
    let farmerAdvisory = {
      messageEn: 'Cold storage space is currently stable across Tamil Nadu centers.',
      messageTa: 'தமிழ்நாடு குளிர்பதன மையங்களில் சேமிப்பு இடம் தற்போது சீராக உள்ளது.',
      highlightFacility: undefined as string | undefined,
    };

    if (criticalFacility) {
      farmerAdvisory = {
        messageEn: `High intake demand forecasted at ${criticalFacility.facilityName} over the next 14 days. Book early to secure perishable crop space.`,
        messageTa: `${criticalFacility.facilityName} மையத்தில் அடுத்த 14 நாட்களில் அதிக வரத்து எதிர்பார்க்கப்படுகிறது. அழுகும் பயிர்களுக்கு முன்கூட்டியே பதிவு செய்யவும்.`,
        highlightFacility: criticalFacility.facilityId,
      };
    }

    return {
      hasSufficientData: true,
      sampleCount,
      minimumRequired: MIN_SAMPLE_THRESHOLD,
      generatedAt,
      modelVersion,
      forecastHorizonDays: 14,
      evaluation,
      facilityPressures,
      cropForecasts,
      historicalDailySummary: historicalPoints.map((p) => ({ date: p.date, totalKg: p.totalKg })),
      farmerAdvisory,
      limitations,
    };
  },
};
