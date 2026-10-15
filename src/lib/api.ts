const API_BASE_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    let errorDetail = 'API Request failed';
    try {
      const errorJson = await res.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(phone: string, password?: string) {
    return fetchJSON<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
  },
  async register(data: { name: string; phone: string; role: string; location: string }) {
    return fetchJSON<any>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Facilities
  async getFacilities(district?: string) {
    const url = district ? `/api/facilities?district=${encodeURIComponent(district)}` : '/api/facilities';
    return fetchJSON<any[]>(url);
  },
  async getFacility(id: string) {
    return fetchJSON<any>(`/api/facilities/${id}`);
  },
  async checkAvailability(params: {
    facilityId: string;
    chamberId?: string;
    startDate: string;
    durationDays: number;
    crates: number;
  }) {
    const q = new URLSearchParams({
      start_date: params.startDate,
      duration_days: params.durationDays.toString(),
      crates: params.crates.toString(),
    });
    if (params.chamberId) q.append('chamber_id', params.chamberId);
    return fetchJSON<any>(`/api/facilities/${params.facilityId}/availability?${q.toString()}`);
  },
  async getCapacityLedger(facilityId: string) {
    return fetchJSON<any>(`/api/facilities/${facilityId}/ledger`);
  },

  // Bookings
  async createBooking(data: any) {
    return fetchJSON<any>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async getBookings(params?: { farmerId?: string; facilityId?: string; status?: string }) {
    const q = new URLSearchParams();
    if (params?.farmerId) q.append('farmer_id', params.farmerId);
    if (params?.facilityId) q.append('facility_id', params.facilityId);
    if (params?.status) q.append('status', params.status);
    const qs = q.toString();
    return fetchJSON<any[]>(`/api/bookings${qs ? `?${qs}` : ''}`);
  },
  async getBooking(bookingRef: string) {
    return fetchJSON<any>(`/api/bookings/${bookingRef}`);
  },
  async cancelBooking(bookingRef: string, reason: string, cancelledBy = 'farmer') {
    return fetchJSON<any>(`/api/bookings/${bookingRef}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason, cancelled_by: cancelledBy }),
    });
  },
  async submitReview(bookingRef: string, data: any) {
    return fetchJSON<any>(`/api/bookings/${bookingRef}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Independent Inventory Management
  async getBatches(params?: { facilityId?: string; chamberId?: string; search?: string }) {
    const q = new URLSearchParams();
    if (params?.facilityId) q.append('facility_id', params.facilityId);
    if (params?.chamberId) q.append('chamber_id', params.chamberId);
    if (params?.search) q.append('search', params.search);
    const qs = q.toString();
    return fetchJSON<any[]>(`/api/inventory/batches${qs ? `?${qs}` : ''}`);
  },
  async createBatch(data: any) {
    return fetchJSON<any>('/api/inventory/batches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async stockIntake(data: any) {
    return fetchJSON<any>('/api/inventory/intake', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async stockWithdrawal(data: any) {
    return fetchJSON<any>('/api/inventory/withdrawal', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async stockTransfer(data: any) {
    return fetchJSON<any>('/api/inventory/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async stockAdjustment(data: any) {
    return fetchJSON<any>('/api/inventory/adjustments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async archiveBatch(batchCode: string) {
    return fetchJSON<any>(`/api/inventory/batches/${batchCode}/archive`, {
      method: 'POST',
    });
  },
  async getTransactions(params?: { facilityId?: string; batchCode?: string }) {
    const q = new URLSearchParams();
    if (params?.facilityId) q.append('facility_id', params.facilityId);
    if (params?.batchCode) q.append('batch_code', params.batchCode);
    const qs = q.toString();
    return fetchJSON<any[]>(`/api/inventory/transactions${qs ? `?${qs}` : ''}`);
  },
  async getAlerts(facilityId?: string) {
    const q = facilityId ? `?facility_id=${facilityId}` : '';
    return fetchJSON<any[]>(`/api/inventory/alerts${q}`);
  },

  // Dashboard & Analytics
  async getOwnerDashboard(facilityId = 'fac-1') {
    return fetchJSON<any>(`/api/dashboard/owner?facility_id=${facilityId}`);
  },

  // AI & Advisory
  async getPriceForecast(crop: string, mandi = 'Oddanchatram APMC', horizonDays = 7) {
    return fetchJSON<any>('/api/ai/forecast-price', {
      method: 'POST',
      body: JSON.stringify({ crop, mandi, horizon_days: horizonDays }),
    });
  },
  async calculateArbitrage(data: any) {
    return fetchJSON<any>('/api/ai/arbitrage', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async getAIInsights(facilityId = 'fac-1') {
    return fetchJSON<any[]>(`/api/ai/insights?facility_id=${facilityId}`);
  },

  // Notifications
  async getNotifications(userId = 'far-1') {
    return fetchJSON<any[]>(`/api/notifications?user_id=${userId}`);
  },
  async markNotificationRead(notifId: string) {
    return fetchJSON<any>(`/api/notifications/${notifId}/read`, {
      method: 'POST',
    });
  },
};
