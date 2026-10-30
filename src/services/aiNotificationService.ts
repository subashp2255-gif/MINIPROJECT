import type { NotificationItem, Facility, Booking, DryProduct, DryInventoryTransaction } from '../types';
import { demandForecastService } from './demandForecastService';
import { inventoryForecastService } from './inventoryForecastService';

export const aiNotificationService = {
  /**
   * Scans forecasts and anomalies to generate deduplicated actionable alerts.
   */
  generateDeduplicatedAlerts(
    facilities: Facility[],
    bookings: Booking[],
    dryProducts: DryProduct[],
    dryTransactions: DryInventoryTransaction[],
    existingNotifications: NotificationItem[]
  ): NotificationItem[] {
    const newAlerts: NotificationItem[] = [];
    const existingIds = new Set(existingNotifications.map((n) => n.id));
    const todayKey = new Date().toISOString().slice(0, 10);

    // 1. Check Demand Forecast Pressures
    const demandResult = demandForecastService.generateDemandForecast(bookings, facilities);
    for (const pressure of demandResult.facilityPressures) {
      if (pressure.pressureLevel === 'critical') {
        const notifId = `ai-press-${pressure.facilityId}-${todayKey}`;
        if (!existingIds.has(notifId)) {
          newAlerts.push({
            id: notifId,
            title: `Capacity Surge Alert: ${pressure.facilityName}`,
            titleTa: `கொள்ளளவு எச்சரிக்கை: ${pressure.facilityName}`,
            message: `Projected 14-day occupancy is ${pressure.projectedOccupancyPercent}%. Prepare overflow bays.`,
            messageTa: `அடுத்த 14 நாட்களில் எதிர்பார்க்கப்படும் கொள்ளளவு ${pressure.projectedOccupancyPercent}%. கூடுதல் அறைகளைத் தயார் செய்க.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'conflict',
            read: false,
            linkUrl: '/owner/dashboard',
          });
          existingIds.add(notifId);
        }
      }
    }

    // 2. Check Dry Goods Inventory Stockouts & Anomalies
    const inventoryResult = inventoryForecastService.analyzeInventory(dryProducts, dryTransactions);

    // Low stock / Stockout forecast
    for (const forecast of inventoryResult.forecasts) {
      if (forecast.status === 'critical_stockout') {
        const notifId = `ai-stockout-${forecast.productId}-${todayKey}`;
        if (!existingIds.has(notifId)) {
          const daysText = forecast.daysUntilLowStock !== null ? `${forecast.daysUntilLowStock} days` : 'now';
          newAlerts.push({
            id: notifId,
            title: `Critical Low Stock Forecast: ${forecast.productName}`,
            titleTa: `தானியக் குறைவு முன்னறிவிப்பு: ${forecast.productName}`,
            message: `${forecast.productName} is projected to hit low threshold in ${daysText}. Recommended reorder: ${forecast.suggestedReorderQuantity} ${forecast.unit}.`,
            messageTa: `${forecast.productName} இன்னும் ${daysText}-ல் பாதுகாப்புக் கீழ்நிலையை அடையும். பரிந்துரைக்கப்படும் அளவு: ${forecast.suggestedReorderQuantity} ${forecast.unit}.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'system',
            read: false,
            linkUrl: '/farmer/dry-inventory',
          });
          existingIds.add(notifId);
        }
      }
    }

    // Anomaly review notifications
    for (const anom of inventoryResult.anomalies) {
      const notifId = `ai-anomaly-${anom.anomalyId}`;
      if (!existingIds.has(notifId)) {
        newAlerts.push({
          id: notifId,
          title: `Stock Anomaly Review: ${anom.productName}`,
          titleTa: `பரிவர்த்தனை ஆய்வு தேவை: ${anom.productName}`,
          message: `${anom.reasonEn} ${anom.reviewAction}`,
          messageTa: `${anom.reasonTa} ${anom.reviewActionTa}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'system',
          read: false,
          linkUrl: '/farmer/dry-inventory',
        });
        existingIds.add(notifId);
      }
    }

    return newAlerts;
  },
};

