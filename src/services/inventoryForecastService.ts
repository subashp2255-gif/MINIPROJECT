import type { DryProduct, DryInventoryTransaction } from '../types';

export interface ProductInventoryForecast {
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  unit: string;
  lowStockThreshold: number;
  dailyBurnRate: number;
  projectedStock7d: number;
  projectedStock14d: number;
  projectedStock30d: number;
  daysUntilLowStock: number | null; // null if stock is stable/increasing or already zero
  estimatedLowStockDate: string | null;
  suggestedReorderQuantity: number;
  isSufficientData: boolean;
  status: 'safe' | 'low_stock_soon' | 'critical_stockout' | 'insufficient_history';
  advisoryNoteEn: string;
  advisoryNoteTa: string;
}

export interface InventoryAnomaly {
  anomalyId: string;
  productId: string;
  productName: string;
  transactionId: string;
  type: 'excessive_withdrawal' | 'sudden_depletion' | 'rapid_frequency';
  severity: 'moderate' | 'high';
  observedValue: number;
  expectedRange: string;
  reasonEn: string;
  reasonTa: string;
  timestamp: string;
  reviewAction: string;
  reviewActionTa: string;
}

export interface InventoryAnalysisResult {
  generatedAt: string;
  forecasts: ProductInventoryForecast[];
  anomalies: InventoryAnomaly[];
  totalActiveProducts: number;
  criticalStockoutCount: number;
  moderateAlertCount: number;
}

export const inventoryForecastService = {
  /**
   * Forecasts future inventory levels and detects statistical anomalies.
   * Strictly decision support — never modifies official balances.
   */
  analyzeInventory(
    products: DryProduct[],
    allTransactions?: DryInventoryTransaction[]
  ): InventoryAnalysisResult {
    const generatedAt = new Date().toISOString();
    const activeProducts = products.filter((p) => !p.isArchived);

    const forecasts: ProductInventoryForecast[] = [];
    const anomalies: InventoryAnomaly[] = [];

    for (const product of activeProducts) {
      const currentStock = Number(product.quantity ?? 0);
      const productName = product.name || 'Harvest Item';

      // Gather transactions: from product.transactions or from allTransactions
      const pTxList = (allTransactions && allTransactions.length > 0)
        ? allTransactions.filter((t) => t.productId === product.id)
        : (product.transactions || []);

      const productTx = [...pTxList].sort((a, b) => {
        const timeA = new Date(a.date || (a as unknown as { timestamp?: string }).timestamp || 0).getTime();
        const timeB = new Date(b.date || (b as unknown as { timestamp?: string }).timestamp || 0).getTime();
        return timeA - timeB;
      });

      // Filter withdrawal events: 'remove' or 'transfer' or negative 'adjust'
      const withdrawalEvents = productTx.filter(
        (t) => t.type === 'remove' || t.type === 'transfer' || (t.type === 'adjust' && t.quantity < 0)
      );

      const withdrawalAmounts = withdrawalEvents.map((t) => Math.abs(t.quantity));

      // 1. ANOMALY DETECTION on withdrawals
      if (withdrawalAmounts.length >= 3) {
        const mean = withdrawalAmounts.reduce((a, b) => a + b, 0) / withdrawalAmounts.length;
        const variance =
          withdrawalAmounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / withdrawalAmounts.length;
        const stdDev = Math.sqrt(variance);

        withdrawalEvents.forEach((tx) => {
          const qty = Math.abs(tx.quantity);
          const zScore = stdDev > 0 ? (qty - mean) / stdDev : 0;
          const ratioOfCurrentStock = currentStock > 0 ? qty / (currentStock + qty) : 0;

          if (zScore > 2.2 || ratioOfCurrentStock > 0.4) {
            anomalies.push({
              anomalyId: `anom-${tx.id}`,
              productId: product.id,
              productName,
              transactionId: tx.id,
              type: ratioOfCurrentStock > 0.4 ? 'sudden_depletion' : 'excessive_withdrawal',
              severity: ratioOfCurrentStock > 0.6 || zScore > 3.0 ? 'high' : 'moderate',
              observedValue: qty,
              expectedRange: `0 - ${Math.round(mean + 1.5 * stdDev)} ${product.unit}`,
              reasonEn: `Withdrawal of ${qty} ${product.unit} is significantly higher than historical average (${Math.round(mean)} ${product.unit}).`,
              reasonTa: `${qty} ${product.unit} வெளியீடு முந்தைய சராசரியை (${Math.round(mean)} ${product.unit}) விட மிக அதிகம்.`,
              timestamp: tx.date || new Date().toISOString(),
              reviewAction: 'Verify physical stock register and dispatch challan.',
              reviewActionTa: 'கையிருப்பு பதிவேடு மற்றும் ரசீதை சரிபார்க்கவும்.',
            });
          }
        });
      }

      // Check frequency anomaly: multiple removals within 24h
      for (let i = 1; i < withdrawalEvents.length; i++) {
        const prevDateStr = withdrawalEvents[i - 1].date || (withdrawalEvents[i - 1] as unknown as { timestamp?: string }).timestamp;
        const currDateStr = withdrawalEvents[i].date || (withdrawalEvents[i] as unknown as { timestamp?: string }).timestamp;
        const prevTime = new Date(prevDateStr || 0).getTime();
        const currTime = new Date(currDateStr || 0).getTime();
        const diffHours = (currTime - prevTime) / (1000 * 60 * 60);

        if (diffHours > 0 && diffHours < 12) {
          const currTx = withdrawalEvents[i];
          if (!anomalies.some((a) => a.transactionId === currTx.id)) {
            anomalies.push({
              anomalyId: `anom-freq-${currTx.id}`,
              productId: product.id,
              productName,
              transactionId: currTx.id,
              type: 'rapid_frequency',
              severity: 'moderate',
              observedValue: Math.abs(currTx.quantity),
              expectedRange: 'Interval > 24 hours',
              reasonEn: `Multiple stock withdrawals recorded within ${Math.round(diffHours)} hours.`,
              reasonTa: `${Math.round(diffHours)} மணி நேரத்திற்குள் பல வெளியீடுகள் பதிவு செய்யப்பட்டுள்ளன.`,
              timestamp: currTx.date || new Date().toISOString(),
              reviewAction: 'Ensure double-entry did not occur during dispatch recording.',
              reviewActionTa: 'இரட்டைப் பதிவு செய்யப்படவில்லை என்பதை உறுதிப்படுத்தவும்.',
            });
          }
        }
      }

      // 2. INVENTORY FORECASTING (Burn-down rate & Low-stock projection)
      if (withdrawalAmounts.length < 2) {
        forecasts.push({
          productId: product.id,
          productName,
          category: product.category,
          currentStock,
          unit: product.unit,
          lowStockThreshold: product.lowStockThreshold,
          dailyBurnRate: 0,
          projectedStock7d: currentStock,
          projectedStock14d: currentStock,
          projectedStock30d: currentStock,
          daysUntilLowStock: null,
          estimatedLowStockDate: null,
          suggestedReorderQuantity: 0,
          isSufficientData: false,
          status: currentStock <= product.lowStockThreshold ? 'low_stock_soon' : 'insufficient_history',
          advisoryNoteEn: 'Insufficient dispatch history. Need at least 2 movements to project burn rate.',
          advisoryNoteTa: 'போதுமான வரலாற்று தரவுகள் இல்லை. பயன்பாட்டு வீதத்தைக் கணிக்க குறைந்தது 2 பரிவர்த்தனைகள் தேவை.',
        });
        continue;
      }

      const firstDateStr = withdrawalEvents[0].date || (withdrawalEvents[0] as unknown as { timestamp?: string }).timestamp;
      const lastDateStr = withdrawalEvents[withdrawalEvents.length - 1].date || (withdrawalEvents[withdrawalEvents.length - 1] as unknown as { timestamp?: string }).timestamp;
      const firstTxDate = new Date(firstDateStr || 0).getTime();
      const lastTxDate = new Date(lastDateStr || 0).getTime();
      const spanDays = Math.max(3, (lastTxDate - firstTxDate) / (1000 * 60 * 60 * 24));
      const totalConsumed = withdrawalAmounts.reduce((a, b) => a + b, 0);
      const rawDailyBurn = totalConsumed / spanDays;
      const dailyBurnRate = Math.round(rawDailyBurn * 10) / 10;

      const projectedStock7d = Math.max(0, Math.round(currentStock - dailyBurnRate * 7));
      const projectedStock14d = Math.max(0, Math.round(currentStock - dailyBurnRate * 14));
      const projectedStock30d = Math.max(0, Math.round(currentStock - dailyBurnRate * 30));

      let daysUntilLowStock: number | null = null;
      let estimatedLowStockDate: string | null = null;
      let status: ProductInventoryForecast['status'] = 'safe';
      let advisoryNoteEn = `Current consumption rate: ~${dailyBurnRate} ${product.unit}/day. Stock is stable.`;
      let advisoryNoteTa = `தினசரி பயன்பாடு: ~${dailyBurnRate} ${product.unit}/நாள். கையிருப்பு போதுமானது.`;

      if (dailyBurnRate > 0) {
        const remainingToThreshold = currentStock - product.lowStockThreshold;
        if (remainingToThreshold <= 0) {
          daysUntilLowStock = 0;
          status = 'critical_stockout';
          advisoryNoteEn = `Already below safety threshold of ${product.lowStockThreshold} ${product.unit}! Restock recommended immediately.`;
          advisoryNoteTa = `பாதுகாப்பு வரம்பான ${product.lowStockThreshold} ${product.unit}-ஐ விட குறைந்துள்ளது! உடனே நிரப்பவும்.`;
        } else {
          daysUntilLowStock = Math.floor(remainingToThreshold / dailyBurnRate);
          const targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + daysUntilLowStock);
          estimatedLowStockDate = targetDate.toISOString().slice(0, 10);

          if (daysUntilLowStock <= 7) {
            status = 'critical_stockout';
            advisoryNoteEn = `Projected to hit low-stock threshold in ${daysUntilLowStock} days (by ${estimatedLowStockDate}). Replenishment needed urgently.`;
            advisoryNoteTa = `இன்னும் ${daysUntilLowStock} நாட்களில் (${estimatedLowStockDate}) வரம்பை அடையும். விரைந்து நிரப்பவும்.`;
          } else if (daysUntilLowStock <= 14) {
            status = 'low_stock_soon';
            advisoryNoteEn = `Projected to reach threshold in ${daysUntilLowStock} days. Plan harvest or restocking.`;
            advisoryNoteTa = `இன்னும் ${daysUntilLowStock} நாட்களில் வரம்பை எட்டும். திட்டமிட்டு கையிருப்பை அதிகரிக்கவும்.`;
          }
        }
      }

      const suggestedReorderQuantity =
        dailyBurnRate > 0 ? Math.round(dailyBurnRate * 30 + product.lowStockThreshold) : product.lowStockThreshold * 2;

      forecasts.push({
        productId: product.id,
        productName,
        category: product.category,
        currentStock,
        unit: product.unit,
        lowStockThreshold: product.lowStockThreshold,
        dailyBurnRate,
        projectedStock7d,
        projectedStock14d,
        projectedStock30d,
        daysUntilLowStock,
        estimatedLowStockDate,
        suggestedReorderQuantity,
        isSufficientData: true,
        status,
        advisoryNoteEn,
        advisoryNoteTa,
      });
    }

    const criticalStockoutCount = forecasts.filter((f) => f.status === 'critical_stockout').length;
    const moderateAlertCount = forecasts.filter((f) => f.status === 'low_stock_soon').length;

    return {
      generatedAt,
      forecasts,
      anomalies,
      totalActiveProducts: activeProducts.length,
      criticalStockoutCount,
      moderateAlertCount,
    };
  },
};
