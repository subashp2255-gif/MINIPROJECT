import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  UserProfile,
  UserRole,
  Language,
  ServiceMode,
  Facility,
  Booking,
  InventoryBatch,
  InventoryMovement,
  ConflictNotice,
  InspectionRequest,
  FeedbackReview,
  NotificationItem,
  CapacityLedger,
  AIInsight,
  InventoryAlert,
  DryProduct,
  DryInventoryTransaction,
  DryCropCategory,
  DryCropUnit,
  PickupRequest,
} from '../types';
import {
  INITIAL_FACILITIES,
  INITIAL_BOOKINGS,
  INITIAL_BATCHES,
  INITIAL_MOVEMENTS,
  INITIAL_CONFLICT_NOTICE,
  INITIAL_NOTIFICATIONS,
  MOCK_INSPECTIONS,
  MOCK_REVIEWS,
  INITIAL_DRY_PRODUCTS,
  INITIAL_PICKUP_REQUESTS,
} from '../lib/mockData';
import { translations } from '../lib/translations';

export interface ToastAlert {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  user: UserProfile;
  role: UserRole;
  setRole: (role: UserRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  serviceMode: ServiceMode;
  setServiceMode: (mode: ServiceMode) => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  t: (key: keyof typeof translations.en) => string;

  facilities: Facility[];
  bookings: Booking[];
  batches: InventoryBatch[];
  movements: InventoryMovement[];
  conflictNotice: ConflictNotice;
  notifications: NotificationItem[];
  inspections: InspectionRequest[];
  reviews: FeedbackReview[];
  alerts: InventoryAlert[];
  toasts: ToastAlert[];
  dryProducts: DryProduct[];
  pickupRequests: PickupRequest[];

  showToast: (message: string, type?: ToastAlert['type']) => void;
  dismissToast: (id: string) => void;

  // Booking Module
  createBooking: (newBookingData: Omit<Booking, 'id' | 'bookingCode' | 'createdAt' | 'status' | 'batchPin'>) => Booking;
  cancelBooking: (bookingCode: string, reason: string) => boolean;
  resolveConflict: (choice: ConflictNotice['selectedOption']) => void;
  scheduleInspection: (batchCode: string, cropName: string, facilityId: string, date: string, time: string) => void;
  submitReview: (bookingCode: string, rating: number, comment: string, isComplaint?: boolean, complaintCat?: string) => void;
  confirmWeightVerification: (bookingCode: string) => void;
  reportWeightDiscrepancy: (bookingCode: string, reason: string, observedKg?: number) => void;

  // Pickup Requests (CS13 to CS15)
  requestPickup: (params: {
    batchCode: string;
    requestedKg: number;
    requestedCrates: number;
    collectionDate: string;
    collectionTime: string;
    notes?: string;
  }) => PickupRequest | null;
  approvePickupRequest: (requestId: string) => boolean;
  rejectPickupRequest: (requestId: string, reason: string) => boolean;
  completePickupWithdrawal: (requestId: string, actualKg: number, actualCrates: number, recipientName?: string) => boolean;

  // Independent Inventory Module (NO booking required)
  registerBatch: (batchData: {
    facilityId: string;
    chamberName: string;
    cropName: string;
    cropNameTa?: string;
    grade?: string;
    initialStockKg: number;
    initialStockCrates: number;
    farmerName?: string;
    supplierName?: string;
    condition?: string;
    expiryDate?: string;
    expectedStorageEnd?: string;
    notes?: string;
    bookingId?: string;
  }) => InventoryBatch;

  recordIntake: (intakeData: {
    batchCode?: string;
    facilityId: string;
    chamberName: string;
    cropName: string;
    quantityKg: number;
    quantityCrates: number;
    source?: string;
    bookingCode?: string;
    reason?: string;
  }) => boolean;

  performPartialWithdrawal: (batchCode: string, withdrawKg: number, withdrawCrates: number, reason: string) => boolean;
  transferStock: (batchCode: string, sourceChamber: string, destChamber: string, quantityKg: number, crates: number, reason: string) => boolean;
  adjustStock: (batchCode: string, adjustedKg: number, adjustedCrates: number, reason: string, condition?: string) => boolean;
  archiveBatch: (batchCode: string) => boolean;
  verifyIntake: (bookingCode: string, verifiedKg: number, verifiedCrates: number, chamberName: string) => void;

  // Enhanced Dry-Goods Inventory Module (INV1 to INV14 - Rice, Wheat, Pulses, Grains)
  addDryProduct: (productData: {
    name: string;
    nameTa?: string;
    category: DryCropCategory;
    variety?: string;
    quantity: number;
    unit: DryCropUnit;
    storageLocation: string;
    batchLotId?: string;
    harvestDate?: string;
    expiryDate?: string;
    supplier?: string;
    unitCost?: number;
    lowStockThreshold?: number;
    notes?: string;
    imageUrl?: string;
  }) => DryProduct;
  addStockDryProduct: (productId: string, quantity: number, unit: DryCropUnit, reason: string, notes?: string) => boolean;
  removeStockDryProduct: (productId: string, quantity: number, reason: string, notes?: string) => boolean;
  adjustStockDryProduct: (productId: string, verifiedQuantity: number, reason: string) => boolean;
  transferDryProduct: (productId: string, quantity: number, destinationLocation: string, reason?: string) => boolean;
  archiveDryProduct: (productId: string, force?: boolean) => boolean;
  restoreDryProduct: (productId: string) => boolean;
  updateDryProductThreshold: (productId: string, threshold: number) => boolean;

  // Capacity & Analytics
  calculateCapacityLedger: (facilityId?: string) => CapacityLedger;
  getAIInsights: (facilityId?: string) => AIInsight[];

  // Auth & Notifications
  login: (phone: string, role?: UserRole) => boolean;
  registerUser: (name: string, phone: string, role: UserRole, location: string) => boolean;
  markNotificationAsRead: (id: string) => void;
  refreshTelemetry: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const USER_PROFILES: Record<UserRole, UserProfile> = {
  farmer: {
    id: 'far-1',
    name: 'Murugan S.',
    role: 'farmer',
    phone: '+91 98421 77301',
    location: 'Oddanchatram, Dindigul',
    farmerId: '#OD-4091',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80',
  },
  owner: {
    id: 'own-1',
    name: 'Arumugam P.',
    role: 'owner',
    phone: '+91 94431 82910',
    location: 'Oddanchatram Rural Bypass',
    facilityId: 'fac-1',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  admin: {
    id: 'adm-1',
    name: 'Dr. K. Jayakumar IAS',
    role: 'admin',
    phone: '+91 94440 00122',
    location: 'TN Agri Marketing Board, Chennai',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('srs_role') as UserRole) || 'farmer';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('srs_lang') as Language) || 'en';
  });

  const [serviceMode, setServiceModeState] = useState<ServiceMode>(() => {
    return (localStorage.getItem('srs_service') as ServiceMode) || 'cold';
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [facilities, setFacilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('srs_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });
  const [batches, setBatches] = useState<InventoryBatch[]>(() => {
    const saved = localStorage.getItem('srs_batches');
    return saved ? JSON.parse(saved) : INITIAL_BATCHES;
  });
  const [movements, setMovements] = useState<InventoryMovement[]>(() => {
    const saved = localStorage.getItem('srs_movements');
    return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
  });
  const [conflictNotice, setConflictNotice] = useState<ConflictNotice>(INITIAL_CONFLICT_NOTICE);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [inspections, setInspections] = useState<InspectionRequest[]>(MOCK_INSPECTIONS);
  const [reviews, setReviews] = useState<FeedbackReview[]>(MOCK_REVIEWS);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);
  const [dryProducts, setDryProducts] = useState<DryProduct[]>(() => {
    const saved = localStorage.getItem('srs_dry_products');
    return saved ? JSON.parse(saved) : INITIAL_DRY_PRODUCTS;
  });
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>(() => {
    const saved = localStorage.getItem('srs_pickup_requests');
    return saved ? JSON.parse(saved) : INITIAL_PICKUP_REQUESTS;
  });

  const [alerts] = useState<InventoryAlert[]>([
    {
      id: 'alt-1',
      facilityId: 'fac-1',
      alertType: 'capacity_warning',
      title: 'Chamber 2 Maintenance Notice',
      message: 'Chamber 2 is undergoing compressor recalibration. Active reservations have been safely rerouted.',
      severity: 'warning',
      isResolved: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'alt-2',
      facilityId: 'fac-1',
      alertType: 'near_expiry',
      title: 'Batch #TN-DDG-088 Peak Shelf-Life Approaching',
      message: 'Tomato batch will reach target maturity envelope in 6 days. Recommended Mandi liquidation window.',
      severity: 'info',
      isResolved: false,
      createdAt: new Date().toISOString(),
    },
  ]);

  useEffect(() => {
    localStorage.setItem('srs_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('srs_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('srs_service', serviceMode);
  }, [serviceMode]);

  useEffect(() => {
    localStorage.setItem('srs_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('srs_batches', JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem('srs_movements', JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem('srs_dry_products', JSON.stringify(dryProducts));
  }, [dryProducts]);

  useEffect(() => {
    localStorage.setItem('srs_pickup_requests', JSON.stringify(pickupRequests));
  }, [pickupRequests]);

  const user = USER_PROFILES[role];

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    showToast(`Switched profile to ${USER_PROFILES[newRole].name} (${newRole.toUpperCase()})`, 'info');
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'ta' : 'en'));
  };

  const setServiceMode = (mode: ServiceMode) => {
    setServiceModeState(mode);
  };

  const t = (key: keyof typeof translations.en): string => {
    const currentDict = translations[language] || translations.en;
    return (currentDict as Record<string, string>)[key] || translations.en[key] || (key as string);
  };

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastAlert['type'] = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  }, [dismissToast]);

  // =========================================================================
  // AUTHENTICATION
  // =========================================================================

  const login = (_phone: string, preferredRole: UserRole = 'farmer'): boolean => {
    setRoleState(preferredRole);
    showToast(`Logged in successfully as ${USER_PROFILES[preferredRole].name}`, 'success');
    return true;
  };

  const registerUser = (name: string, phone: string, userRole: UserRole, location: string): boolean => {
    USER_PROFILES[userRole].name = name;
    USER_PROFILES[userRole].phone = phone;
    USER_PROFILES[userRole].location = location;
    setRoleState(userRole);
    showToast(`Account registered successfully! Welcome to AgriSync, ${name}`, 'success');
    return true;
  };

  // =========================================================================
  // DUAL CAPACITY LEDGER CALCULATION (CRITICAL ARCHITECTURAL SEPARATION)
  // =========================================================================

  const calculateCapacityLedger = (facilityId: string = 'fac-1'): CapacityLedger => {
    const fac = facilities.find((f) => f.id === facilityId) || facilities[0];
    const totalRatedKg = fac.chambers.reduce((acc, c) => acc + c.totalCapacityKg, 0);
    const totalRatedCrates = fac.chambers.reduce((acc, c) => acc + c.totalCapacityCrates, 0);

    // 1. Physical occupancy (strictly derived from batches physically in storage)
    const activeBatches = batches.filter(
      (b) => b.facilityId === fac.id && b.status === 'in_storage' && b.currentStockKg > 0
    );
    const physicalOccupancyKg = activeBatches.reduce((acc, b) => acc + b.currentStockKg, 0);
    const physicalOccupancyCrates = activeBatches.reduce((acc, b) => acc + b.currentStockCrates, 0);

    // Maintenance blocked
    const maintChambers = fac.chambers.filter((c) => c.isMaintenance);
    const maintKg = maintChambers.reduce((acc, c) => acc + c.totalCapacityKg, 0);
    const maintCrates = maintChambers.reduce((acc, c) => acc + c.totalCapacityCrates, 0);

    const availPhysKg = Math.max(0, totalRatedKg - physicalOccupancyKg - maintKg);
    const availPhysCrates = Math.max(0, totalRatedCrates - physicalOccupancyCrates - maintCrates);

    // 2. Reserved capacity (strictly derived from active bookings)
    const activeBookings = bookings.filter(
      (b) => b.facilityId === fac.id && (b.status === 'confirmed' || b.status === 'in_storage')
    );
    const reservedKg = activeBookings.reduce((acc, b) => acc + b.bookedKg, 0);
    const reservedCrates = activeBookings.reduce((acc, b) => acc + b.bookedCrates, 0);

    return {
      facilityId: fac.id,
      facilityName: fac.name,
      totalRatedCapacityKg: totalRatedKg,
      totalRatedCapacityCrates: totalRatedCrates,
      currentPhysicalOccupancyKg: physicalOccupancyKg,
      currentPhysicalOccupancyCrates: physicalOccupancyCrates,
      availablePhysicalCapacityKg: availPhysKg,
      availablePhysicalCapacityCrates: availPhysCrates,
      reservedCapacityKgToday: reservedKg,
      reservedCapacityCratesToday: reservedCrates,
      maintenanceBlockedKg: maintKg,
      maintenanceBlockedCrates: maintCrates,
      utilizationPhysicalPercentage: Math.round((physicalOccupancyKg / Math.max(1, totalRatedKg)) * 100),
      utilizationReservedPercentage: Math.round((reservedKg / Math.max(1, totalRatedKg)) * 100),
    };
  };

  // =========================================================================
  // COLD STORAGE BOOKING MANAGEMENT
  // =========================================================================

  const createBooking = (
    newBookingData: Omit<Booking, 'id' | 'bookingCode' | 'createdAt' | 'status' | 'batchPin'>
  ): Booking => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const codeNum = Math.floor(1000 + Math.random() * 9000).toString();
    const newBooking: Booking = {
      ...newBookingData,
      id: `book-${Date.now()}`,
      bookingCode: `#SRS-TN-${codeNum}`,
      batchPin: pin,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    };

    // CRITICAL ARCHITECTURAL INVARIANT:
    // Adding booking ONLY updates the reservation ledger.
    // It NEVER creates an InventoryBatch or alters physical inventory!
    setBookings((prev) => [newBooking, ...prev]);

    // Create notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Booking Confirmed ${newBooking.bookingCode}`,
      titleTa: `முன்பதிவு உறுதி செய்யப்பட்டது ${newBooking.bookingCode}`,
      message: `Chamber slot reserved for ${newBooking.cropName}. Show Gate Pass PIN ${pin} at inbound weighing gate.`,
      messageTa: `${newBooking.cropName}-ற்கு இடம் ஒதுக்கப்பட்டது. வாயிலில் PIN ${pin}-ஐ காட்டவும்.`,
      timestamp: 'Just now',
      type: 'booking',
      read: false,
      linkUrl: `/booking/${newBooking.bookingCode.replace('#', '')}/confirmation`,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`Chamber capacity reserved successfully! Booking ID: ${newBooking.bookingCode}`, 'success');
    return newBooking;
  };

  const cancelBooking = (bookingCode: string, reason: string): boolean => {
    const target = bookings.find((b) => b.bookingCode === bookingCode);
    if (!target) {
      showToast('Booking not found', 'error');
      return false;
    }

    setBookings((prev) =>
      prev.map((b) => (b.bookingCode === bookingCode ? { ...b, status: 'cancelled' } : b))
    );

    // CRITICAL INVARIANT: Releasing reservation does not delete physical inventory!
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Booking Cancelled ${bookingCode}`,
      titleTa: `முன்பதிவு ரத்து செய்யப்பட்டது ${bookingCode}`,
      message: `Booking ${bookingCode} cancelled. Reserved capacity released. Reason: ${reason}`,
      messageTa: `${bookingCode} ரத்து செய்யப்பட்டது. காரணம்: ${reason}`,
      timestamp: 'Just now',
      type: 'booking',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast(`Booking ${bookingCode} cancelled. Reserved capacity released.`, 'info');
    return true;
  };

  // =========================================================================
  // NORMAL INDEPENDENT INVENTORY MANAGEMENT (NO MANDATORY BOOKING)
  // =========================================================================

  const registerBatch = (batchData: {
    facilityId: string;
    chamberName: string;
    cropName: string;
    cropNameTa?: string;
    grade?: string;
    initialStockKg: number;
    initialStockCrates: number;
    farmerName?: string;
    supplierName?: string;
    condition?: string;
    expiryDate?: string;
    expectedStorageEnd?: string;
    notes?: string;
    bookingId?: string;
  }): InventoryBatch => {
    const batchCode = `#TN-BAT-${Math.floor(100 + Math.random() * 900)}`;
    const fac = facilities.find((f) => f.id === batchData.facilityId) || facilities[0];

    const newBatch: InventoryBatch = {
      id: `bat-${Date.now()}`,
      batchCode,
      bookingId: batchData.bookingId || '',
      farmerId: user.id,
      farmerName: batchData.farmerName || batchData.supplierName || 'Walk-in Producer',
      facilityId: batchData.facilityId,
      facilityName: fac.name,
      chamberName: batchData.chamberName,
      cropName: batchData.cropName,
      cropNameTa: batchData.cropNameTa || batchData.cropName,
      grade: batchData.grade || 'Grade A',
      cropImageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
      currentStockKg: batchData.initialStockKg,
      currentStockCrates: batchData.initialStockCrates,
      initialStockKg: batchData.initialStockKg,
      withdrawnKg: 0,
      dayCurrent: 1,
      dayTotal: 14,
      intakeDate: new Date().toISOString().split('T')[0],
      targetCollectDate: batchData.expectedStorageEnd || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      currentTemp: 2.8,
      currentHumidity: 89,
      status: 'in_storage',
      qualityScore: 98,
      notes: batchData.notes || 'Normal inventory intake registered.',
    };

    setBatches((prev) => [newBatch, ...prev]);

    if (batchData.initialStockKg > 0) {
      const movement: InventoryMovement = {
        id: `mov-${Date.now()}`,
        batchId: newBatch.id,
        batchCode,
        timestamp: new Date().toISOString(),
        type: 'intake',
        quantityKg: batchData.initialStockKg,
        quantityCrates: batchData.initialStockCrates,
        authorizedBy: `${user.name} (Operator)`,
        reason: 'Initial Batch Registration & Physical Stock Intake',
        receiptNumber: `#REC-INT-${Math.floor(1000 + Math.random() * 9000)}`,
      };
      setMovements((prev) => [movement, ...prev]);
    }

    showToast(`Batch ${batchCode} registered successfully in ${batchData.chamberName}!`, 'success');
    return newBatch;
  };

  const recordIntake = (intakeData: {
    batchCode?: string;
    facilityId: string;
    chamberName: string;
    cropName: string;
    quantityKg: number;
    quantityCrates: number;
    source?: string;
    bookingCode?: string;
    reason?: string;
  }): boolean => {
    // If existing batch:
    if (intakeData.batchCode) {
      const target = batches.find((b) => b.batchCode === intakeData.batchCode);
      if (target) {
        setBatches((prev) =>
          prev.map((b) =>
            b.batchCode === intakeData.batchCode
              ? {
                  ...b,
                  currentStockKg: b.currentStockKg + intakeData.quantityKg,
                  currentStockCrates: b.currentStockCrates + intakeData.quantityCrates,
                }
              : b
          )
        );
      }
    } else {
      registerBatch({
        facilityId: intakeData.facilityId,
        chamberName: intakeData.chamberName,
        cropName: intakeData.cropName,
        initialStockKg: intakeData.quantityKg,
        initialStockCrates: intakeData.quantityCrates,
        notes: `Intake from ${intakeData.source || 'Farm Gate Walk-in'}`,
      });
    }

    showToast(`Physical intake verified: ${intakeData.quantityKg} kg added to stock!`, 'success');
    return true;
  };

  const performPartialWithdrawal = (
    batchCode: string,
    withdrawKg: number,
    withdrawCrates: number,
    reason: string
  ): boolean => {
    const targetBatch = batches.find((b) => b.batchCode === batchCode);
    if (!targetBatch) {
      showToast(`Batch not found.`, 'error');
      return false;
    }

    if (withdrawKg > targetBatch.currentStockKg) {
      showToast(`Withdrawal exceeds available physical stock of ${targetBatch.currentStockKg} kg!`, 'error');
      return false;
    }

    const remainingKg = Math.max(0, targetBatch.currentStockKg - withdrawKg);
    const remainingCrates = Math.max(0, targetBatch.currentStockCrates - withdrawCrates);

    setBatches((prev) =>
      prev.map((b) =>
        b.batchCode === batchCode
          ? {
              ...b,
              currentStockKg: remainingKg,
              currentStockCrates: remainingCrates,
              withdrawnKg: b.withdrawnKg + withdrawKg,
              status: remainingKg === 0 ? 'withdrawn' : b.status,
            }
          : b
      )
    );

    const movement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      batchId: targetBatch.id,
      batchCode,
      timestamp: new Date().toISOString(),
      type: remainingKg === 0 ? 'full_dispatch' : 'partial_withdrawal',
      quantityKg: withdrawKg,
      quantityCrates: withdrawCrates,
      authorizedBy: `${user.name}`,
      reason: reason || 'Farmer withdrawal for Mandi dispatch',
      receiptNumber: `#REC-WD-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setMovements((prev) => [movement, ...prev]);

    showToast(`Withdrawn ${withdrawKg} kg from ${batchCode}. Remaining: ${remainingKg} kg`, 'success');
    return true;
  };

  const transferStock = (
    batchCode: string,
    sourceChamber: string,
    destChamber: string,
    quantityKg: number,
    crates: number,
    reason: string
  ): boolean => {
    const target = batches.find((b) => b.batchCode === batchCode);
    if (!target) {
      showToast('Batch not found', 'error');
      return false;
    }

    if (quantityKg > target.currentStockKg) {
      showToast('Transfer quantity exceeds available stock', 'error');
      return false;
    }

    // Update chamber location
    if (quantityKg === target.currentStockKg) {
      setBatches((prev) =>
        prev.map((b) => (b.batchCode === batchCode ? { ...b, chamberName: destChamber } : b))
      );
    } else {
      // Split batch
      setBatches((prev) =>
        prev.map((b) =>
          b.batchCode === batchCode
            ? {
                ...b,
                currentStockKg: b.currentStockKg - quantityKg,
                currentStockCrates: Math.max(0, b.currentStockCrates - crates),
              }
            : b
        )
      );
      registerBatch({
        facilityId: target.facilityId,
        chamberName: destChamber,
        cropName: target.cropName,
        initialStockKg: quantityKg,
        initialStockCrates: crates,
        farmerName: target.farmerName,
        notes: `Transferred from ${batchCode} (${sourceChamber})`,
      });
    }

    const tx: InventoryMovement = {
      id: `mov-${Date.now()}`,
      batchId: target.id,
      batchCode,
      timestamp: new Date().toISOString(),
      type: 'chamber_relocation',
      quantityKg,
      quantityCrates: crates,
      authorizedBy: user.name,
      reason: reason || `Relocated from ${sourceChamber} to ${destChamber}`,
      receiptNumber: `#REC-TRF-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setMovements((prev) => [tx, ...prev]);

    showToast(`Transferred ${quantityKg} kg from ${sourceChamber} to ${destChamber}. Total facility stock preserved.`, 'success');
    return true;
  };

  const adjustStock = (
    batchCode: string,
    adjustedKg: number,
    adjustedCrates: number,
    reason: string,
    condition?: string
  ): boolean => {
    const target = batches.find((b) => b.batchCode === batchCode);
    if (!target) {
      showToast('Batch not found', 'error');
      return false;
    }

    const prevKg = target.currentStockKg;
    setBatches((prev) =>
      prev.map((b) =>
        b.batchCode === batchCode
          ? {
              ...b,
              currentStockKg: adjustedKg,
              currentStockCrates: adjustedCrates,
              condition: condition || b.condition,
              status: adjustedKg === 0 ? 'withdrawn' : b.status,
            }
          : b
      )
    );

    const tx: InventoryMovement = {
      id: `mov-${Date.now()}`,
      batchId: target.id,
      batchCode,
      timestamp: new Date().toISOString(),
      type: 'spoilage_writeoff',
      quantityKg: Math.abs(adjustedKg - prevKg),
      quantityCrates: Math.abs(adjustedCrates - target.currentStockCrates),
      authorizedBy: `${user.name} (Auditor)`,
      reason: reason || 'Physical count audit & damage adjustment',
      receiptNumber: `#REC-ADJ-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setMovements((prev) => [tx, ...prev]);

    showToast(`Stock adjusted from ${prevKg} kg to ${adjustedKg} kg. Reason logged: ${reason}`, 'info');
    return true;
  };

  const archiveBatch = (batchCode: string): boolean => {
    const target = batches.find((b) => b.batchCode === batchCode);
    if (!target) {
      showToast('Batch not found', 'error');
      return false;
    }

    if (target.currentStockKg > 0) {
      showToast(`Cannot archive batch: ${target.currentStockKg} kg physical stock remains!`, 'error');
      return false;
    }

    setBatches((prev) =>
      prev.map((b) => (b.batchCode === batchCode ? { ...b, status: 'withdrawn' } : b))
    );
    showToast(`Batch ${batchCode} archived successfully.`, 'success');
    return true;
  };

  const verifyIntake = (
    bookingCode: string,
    verifiedKg: number,
    verifiedCrates: number,
    chamberName: string
  ) => {
    const booking = bookings.find((b) => b.bookingCode === bookingCode);
    if (!booking) return;

    registerBatch({
      facilityId: booking.facilityId,
      chamberName: chamberName || booking.chamberName,
      cropName: booking.cropName,
      cropNameTa: booking.cropNameTa,
      initialStockKg: verifiedKg,
      initialStockCrates: verifiedCrates,
      farmerName: booking.farmerName,
      bookingId: booking.id,
      notes: `Verified at gate weighing bridge. Weighed ${verifiedKg} kg in ${verifiedCrates} crates.`,
    });

    setBookings((prev) =>
      prev.map((b) =>
        b.bookingCode === bookingCode ? { ...b, status: 'in_storage', verifiedKg, verifiedCrates } : b
      )
    );
  };

  const resolveConflict = (choice: ConflictNotice['selectedOption']) => {
    setConflictNotice((prev) => ({
      ...prev,
      resolved: true,
      selectedOption: choice,
      resolutionTimestamp: new Date().toISOString(),
    }));

    setBookings((prev) =>
      prev.map((b) => {
        if (b.bookingCode === conflictNotice.bookingCode) {
          if (choice === 'accept_partial') {
            return {
              ...b,
              bookedKg: conflictNotice.availableKg,
              bookedCrates: Math.round(conflictNotice.availableKg / 25),
              status: 'confirmed',
              hasConflict: false,
            };
          } else if (choice === 'cancel_refund') {
            return { ...b, status: 'cancelled', hasConflict: false };
          } else {
            return { ...b, status: 'confirmed', hasConflict: false };
          }
        }
        return b;
      })
    );

    showToast(`Conflict resolution recorded: Option accepted. Updated terms synced.`, 'success');
  };

  const scheduleInspection = (
    batchCode: string,
    cropName: string,
    facilityId: string,
    date: string,
    time: string
  ) => {
    const fac = facilities.find((f) => f.id === facilityId) || facilities[0];
    const newInsp: InspectionRequest = {
      id: `insp-${Date.now()}`,
      batchCode,
      cropName,
      farmerId: user.id,
      farmerName: user.name,
      facilityId,
      facilityName: fac.name,
      chamberName: 'Chamber 1',
      scheduledDate: date,
      scheduledTime: time,
      status: 'approved',
      notes: 'Automated chamber optical inspection slot granted.',
    };

    setInspections((prev) => [newInsp, ...prev]);
    showToast(`Live inspection scheduled for ${date} at ${time}!`, 'success');
  };

  const submitReview = (
    bookingCode: string,
    rating: number,
    comment: string,
    isComplaint: boolean = false,
    complaintCat?: string
  ) => {
    const newRev: FeedbackReview = {
      id: `rev-${Date.now()}`,
      bookingCode,
      facilityId: 'fac-1',
      facilityName: 'Uzhavar Solar Hub #14',
      farmerName: user.name,
      rating,
      comment,
      createdAt: new Date().toISOString().split('T')[0],
      isComplaint,
      complaintCategory: complaintCat,
      complaintStatus: isComplaint ? 'open' : undefined,
    };
    setReviews((prev) => [newRev, ...prev]);
    showToast(isComplaint ? 'Complaint ticket logged. Owner notified.' : 'Thank you for your rating!', 'success');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const getAIInsights = (facilityId: string = 'fac-1'): AIInsight[] => {
    const ledger = calculateCapacityLedger(facilityId);
    const insights: AIInsight[] = [];

    // Capacity pressure
    if (ledger.utilizationPhysicalPercentage >= 80) {
      insights.push({
        id: 'ins-cap-high',
        category: 'capacity_warning',
        title: `High Physical Occupancy (${ledger.utilizationPhysicalPercentage}%) in ${ledger.facilityName}`,
        description: `${ledger.currentPhysicalOccupancyKg} kg of physical inventory present. Walk-in buffer is constrained.`,
        severity: 'warning',
        confidence: 0.98,
        dataSource: 'Live Physical Capacity Ledger',
        recommendedAction: 'Trigger priority Mandi dispatch reminders for mature lots.',
      });
    }

    // Near expiry
    const nearExpiry = batches.filter((b) => b.dayCurrent >= b.dayTotal - 3 && b.status === 'in_storage');
    for (const b of nearExpiry) {
      insights.push({
        id: `ins-exp-${b.id}`,
        category: 'near_expiry',
        title: `Near Expiry: Batch ${b.batchCode} (${b.cropName})`,
        description: `Lot has completed ${b.dayCurrent} of ${b.dayTotal} permitted cold storage days. Optimal commercial firmness at risk.`,
        severity: 'warning',
        confidence: 0.95,
        dataSource: 'Shelf-Life Monitor',
        recommendedAction: 'Contact owner/farmer to release Gate Out pass.',
      });
    }

    // Fallback baseline
    insights.push({
      id: 'ins-base',
      category: 'demand_forecast',
      title: 'Tamil Nadu APMC Price Arbitrage Window Active',
      description: 'Oddanchatram wholesale vegetable arrivals tapering; holding produce in solar chambers yields ~₹18-24 net gain per crate.',
      severity: 'info',
      confidence: 0.92,
      dataSource: 'Calibrated Mandi Econometric Model',
      recommendedAction: 'Maintain current chamber temperatures for optimal price realization.',
    });

    return insights;
  };

  const confirmWeightVerification = (bookingCode: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.bookingCode === bookingCode ? { ...b, status: 'in_storage' } : b
      )
    );
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Weight Verified & Crop Stored',
      titleTa: 'எடை உறுதிசெய்யப்பட்டது • பயிர் சேமிக்கப்பட்டது',
      message: `Booking ${bookingCode} weight confirmed by farmer. Crop transferred to active stored lot.`,
      messageTa: `${bookingCode} முன்பதிவின் எடை உறுதிசெய்யப்பட்டு செயலில் உள்ள சேமிப்பில் சேர்க்கப்பட்டது.`,
      timestamp: 'Just now',
      type: 'booking',
      read: false,
      linkUrl: '/farmer/bookings',
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast(language === 'ta' ? 'எடை சரிபார்ப்பு உறுதி செய்யப்பட்டது!' : 'Intake weight verified successfully!', 'success');
  };

  const reportWeightDiscrepancy = (bookingCode: string, reason: string, observedKg?: number) => {
    const detail = observedKg !== undefined ? ` (Scale Weight: ${observedKg} kg)` : '';
    setBookings((prev) =>
      prev.map((b) =>
        b.bookingCode === bookingCode
          ? { ...b, status: 'needs_resolution', notes: `Weight discrepancy flagged: ${reason}${detail}` }
          : b
      )
    );
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Weight Discrepancy Case Raised',
      titleTa: 'எடை வேறுபாடு வழக்கு பதிவு செய்யப்பட்டது',
      message: `Discrepancy reported for ${bookingCode}: "${reason}"${detail}. Facility manager notified for joint inspection.`,
      messageTa: `${bookingCode} க்கான எடை வேறுபாடு பதிவு செய்யப்பட்டது: "${reason}"${detail}. மேலாளர் விசாரணைக்கு அனுப்பப்பட்டது.`,
      timestamp: 'Just now',
      type: 'conflict',
      read: false,
      linkUrl: '/farmer/bookings',
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast(language === 'ta' ? 'எடை முரண்பாடு விசாரணைக்கு அனுப்பப்பட்டது.' : 'Discrepancy reported. Case under review by manager.', 'warning');
  };

  const requestPickup = (params: {
    batchCode: string;
    requestedKg: number;
    requestedCrates: number;
    collectionDate: string;
    collectionTime: string;
    notes?: string;
  }): PickupRequest | null => {
    const batch = batches.find((b) => b.batchCode === params.batchCode);
    if (!batch) {
      showToast('Batch not found', 'error');
      return null;
    }
    if (params.requestedKg <= 0) {
      showToast('Requested pickup quantity must be positive', 'error');
      return null;
    }
    if (params.requestedKg > batch.currentStockKg) {
      showToast(`Cannot request ${params.requestedKg} kg: only ${batch.currentStockKg} kg available in storage!`, 'error');
      return null;
    }

    const newReq: PickupRequest = {
      id: `pk-req-${Date.now()}`,
      requestCode: `#REQ-PK-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingCode: batch.bookingId || `#SRS-REF-${Math.floor(1000 + Math.random() * 9000)}`,
      batchCode: params.batchCode,
      cropName: batch.cropName,
      farmerName: user.name,
      facilityId: batch.facilityId,
      facilityName: batch.facilityName,
      requestedKg: params.requestedKg,
      requestedCrates: params.requestedCrates,
      collectionDate: params.collectionDate,
      collectionTime: params.collectionTime,
      status: 'pending',
      notes: params.notes,
      createdAt: new Date().toISOString(),
    };

    setPickupRequests((prev) => [newReq, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Pickup Request Submitted',
      titleTa: 'பயிர் மீட்பு கோரிக்கை சமர்ப்பிக்கப்பட்டது',
      message: `Pickup request ${newReq.requestCode} for ${params.requestedKg} kg ${batch.cropName} awaiting owner schedule confirmation.`,
      messageTa: `${params.requestedKg} கிலோ ${batch.cropName} மீட்பு கோரிக்கை ${newReq.requestCode} உரிமையாளர் ஒப்புதலுக்கு அனுப்பப்பட்டது.`,
      timestamp: 'Just now',
      type: 'pickup',
      read: false,
      linkUrl: '/farmer/inventory',
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast(language === 'ta' ? 'மீட்பு கோரிக்கை அனுப்பப்பட்டது!' : 'Pickup request submitted successfully!', 'success');
    return newReq;
  };

  const approvePickupRequest = (requestId: string): boolean => {
    setPickupRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' } : r))
    );
    const req = pickupRequests.find((r) => r.id === requestId);
    if (req) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Pickup Approved • Ready for Gate Inbound',
        titleTa: 'மீட்பு அங்கீகரிக்கப்பட்டது • வாயில் வருகை தயார்',
        message: `Pickup request ${req.requestCode} (${req.requestedKg} kg) approved. Show gate pass at collection terminal.`,
        messageTa: `${req.requestCode} (${req.requestedKg} கிலோ) மீட்பு அனுமதிக்கப்பட்டது. முனையத்தில் வாயில் பாஸ் காட்டவும்.`,
        timestamp: 'Just now',
        type: 'pickup',
        read: false,
        linkUrl: '/farmer/inventory',
      };
      setNotifications((prev) => [notif, ...prev]);
    }
    showToast('Pickup request approved! Gate pass dispatch code activated.', 'success');
    return true;
  };

  const rejectPickupRequest = (requestId: string, reason: string): boolean => {
    setPickupRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected', rejectionReason: reason } : r))
    );
    showToast(`Pickup rejected: ${reason}`, 'info');
    return true;
  };

  const completePickupWithdrawal = (
    requestId: string,
    actualKg: number,
    actualCrates: number,
    recipientName?: string
  ): boolean => {
    const req = pickupRequests.find((r) => r.id === requestId);
    if (!req) return false;

    const ok = performPartialWithdrawal(
      req.batchCode,
      actualKg,
      actualCrates,
      `Physical Gate Release against ${req.requestCode} (Recipient: ${recipientName || req.farmerName})`
    );

    if (ok) {
      setPickupRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'completed' } : r))
      );
      showToast(`Physical withdrawal completed for ${actualKg} kg. Completion receipt generated!`, 'success');
      return true;
    }
    return false;
  };

  const addDryProduct = (productData: {
    name: string;
    nameTa?: string;
    category: DryCropCategory;
    variety?: string;
    quantity: number;
    unit: DryCropUnit;
    storageLocation: string;
    batchLotId?: string;
    harvestDate?: string;
    expiryDate?: string;
    supplier?: string;
    unitCost?: number;
    lowStockThreshold?: number;
    notes?: string;
    imageUrl?: string;
  }): DryProduct => {
    const id = `dry-${Date.now()}`;
    const productCode = `#DRY-TN-${Math.floor(100 + Math.random() * 900)}`;
    const lowThresh = productData.lowStockThreshold ?? (productData.unit === 'kg' ? 100 : 5);
    const initialQty = Number(productData.quantity) || 0;
    const isLow = initialQty <= lowThresh;

    const newProd: DryProduct = {
      id,
      productCode,
      name: productData.name,
      nameTa: productData.nameTa || productData.name,
      category: productData.category,
      variety: productData.variety,
      quantity: initialQty,
      unit: productData.unit,
      storageLocation: productData.storageLocation,
      batchLotId: productData.batchLotId || `#LOT-${Math.floor(1000 + Math.random() * 9000)}`,
      harvestDate: productData.harvestDate,
      expiryDate: productData.expiryDate,
      supplier: productData.supplier,
      unitCost: productData.unitCost,
      totalValue: productData.unitCost ? productData.unitCost * initialQty : undefined,
      lowStockThreshold: lowThresh,
      isArchived: false,
      status: isLow ? 'low_stock' : 'in_stock',
      notes: productData.notes,
      imageUrl: productData.imageUrl || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      transactions: [
        {
          id: `dry-tx-${Date.now()}`,
          productId: id,
          type: 'initial',
          quantity: initialQty,
          unit: productData.unit,
          previousBalance: 0,
          newBalance: initialQty,
          reason: 'Initial Product Registration & Stock Intake',
          date: new Date().toISOString().split('T')[0],
          authorizedBy: user.name,
          receiptNumber: `#DRY-REC-${Math.floor(1000 + Math.random() * 9000)}`,
        },
      ],
    };

    setDryProducts((prev) => [newProd, ...prev]);

    if (isLow) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `Low Stock Alert: ${newProd.name}`,
        titleTa: `குறைந்த இருப்பு எச்சரிக்கை: ${newProd.nameTa}`,
        message: `${newProd.name} stock (${initialQty} ${newProd.unit}) is at or below threshold (${lowThresh} ${newProd.unit}).`,
        messageTa: `${newProd.nameTa} இருப்பு (${initialQty} ${newProd.unit}) அனுமதிக்கப்பட்ட அளவை விட குறைவாக உள்ளது.`,
        timestamp: 'Just now',
        type: 'system',
        read: false,
        linkUrl: '/farmer/dry-inventory',
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    showToast(language === 'ta' ? `${newProd.nameTa} பதிவு செய்யப்பட்டு சேமிக்கப்பட்டது!` : `${newProd.name} registered with ${initialQty} ${newProd.unit}!`, 'success');
    return newProd;
  };

  const addStockDryProduct = (
    productId: string,
    quantity: number,
    unit: DryCropUnit,
    reason: string,
    notes?: string
  ): boolean => {
    const prod = dryProducts.find((p) => p.id === productId);
    if (!prod) {
      showToast('Product not found', 'error');
      return false;
    }
    if (quantity <= 0) {
      showToast('Quantity added must be greater than zero', 'error');
      return false;
    }

    const prevBal = prod.quantity;
    const newBal = prevBal + quantity;
    const isStillLow = newBal <= prod.lowStockThreshold;

    const tx: DryInventoryTransaction = {
      id: `dry-tx-${Date.now()}`,
      productId,
      type: 'add',
      quantity,
      unit,
      previousBalance: prevBal,
      newBalance: newBal,
      reason: reason || 'Stock addition (Harvest / Purchase)',
      date: new Date().toISOString().split('T')[0],
      authorizedBy: user.name,
      receiptNumber: `#DRY-ADD-${Math.floor(1000 + Math.random() * 9000)}`,
      notes,
    };

    setDryProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              quantity: newBal,
              status: isStillLow ? 'low_stock' : 'in_stock',
              totalValue: p.unitCost ? p.unitCost * newBal : p.totalValue,
              updatedAt: new Date().toISOString(),
              transactions: [tx, ...p.transactions],
            }
          : p
      )
    );

    showToast(`Added ${quantity} ${unit} to ${prod.name}. New balance: ${newBal} ${unit}`, 'success');
    return true;
  };

  const removeStockDryProduct = (
    productId: string,
    quantity: number,
    reason: string,
    notes?: string
  ): boolean => {
    const prod = dryProducts.find((p) => p.id === productId);
    if (!prod) {
      showToast('Product not found', 'error');
      return false;
    }
    if (quantity <= 0) {
      showToast('Quantity to remove must be greater than zero', 'error');
      return false;
    }
    if (quantity > prod.quantity) {
      showToast(`Cannot remove ${quantity} ${prod.unit}: only ${prod.quantity} ${prod.unit} available in stock!`, 'error');
      return false;
    }

    const prevBal = prod.quantity;
    const newBal = prevBal - quantity;
    const isLow = newBal <= prod.lowStockThreshold && newBal > 0;
    const isDepleted = newBal === 0;

    const tx: DryInventoryTransaction = {
      id: `dry-tx-${Date.now()}`,
      productId,
      type: 'remove',
      quantity,
      unit: prod.unit,
      previousBalance: prevBal,
      newBalance: newBal,
      reason: reason || 'Dispatch / Mandi Sale / Usage',
      date: new Date().toISOString().split('T')[0],
      authorizedBy: user.name,
      receiptNumber: `#DRY-REM-${Math.floor(1000 + Math.random() * 9000)}`,
      notes,
    };

    setDryProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              quantity: newBal,
              status: isDepleted ? 'depleted' : isLow ? 'low_stock' : 'in_stock',
              totalValue: p.unitCost ? p.unitCost * newBal : p.totalValue,
              updatedAt: new Date().toISOString(),
              transactions: [tx, ...p.transactions],
            }
          : p
      )
    );

    if (isLow && prevBal > prod.lowStockThreshold) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `Low Stock Threshold Crossed: ${prod.name}`,
        titleTa: `குறைந்த இருப்பு வரம்பு தாண்டியது: ${prod.nameTa}`,
        message: `${prod.name} has reached ${newBal} ${prod.unit} (Threshold: ${prod.lowStockThreshold} ${prod.unit}). Restock recommended.`,
        messageTa: `${prod.nameTa} இருப்பு ${newBal} ${prod.unit}-ஆக குறைந்துள்ளது. மறுஇருப்பு தேவை.`,
        timestamp: 'Just now',
        type: 'system',
        read: false,
        linkUrl: '/farmer/dry-inventory',
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    showToast(`Removed ${quantity} ${prod.unit} from ${prod.name}. Remaining: ${newBal} ${prod.unit}`, 'success');
    return true;
  };

  const adjustStockDryProduct = (
    productId: string,
    verifiedQuantity: number,
    reason: string
  ): boolean => {
    const prod = dryProducts.find((p) => p.id === productId);
    if (!prod) return false;
    if (verifiedQuantity < 0) {
      showToast('Verified balance cannot be negative', 'error');
      return false;
    }

    const prevBal = prod.quantity;
    const diff = verifiedQuantity - prevBal;
    const isLow = verifiedQuantity <= prod.lowStockThreshold && verifiedQuantity > 0;
    const isDepleted = verifiedQuantity === 0;

    const tx: DryInventoryTransaction = {
      id: `dry-tx-${Date.now()}`,
      productId,
      type: 'adjust',
      quantity: Math.abs(diff),
      unit: prod.unit,
      previousBalance: prevBal,
      newBalance: verifiedQuantity,
      reason: reason || 'Physical count verification adjustment',
      date: new Date().toISOString().split('T')[0],
      authorizedBy: user.name,
      receiptNumber: `#DRY-ADJ-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setDryProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              quantity: verifiedQuantity,
              status: isDepleted ? 'depleted' : isLow ? 'low_stock' : 'in_stock',
              totalValue: p.unitCost ? p.unitCost * verifiedQuantity : p.totalValue,
              updatedAt: new Date().toISOString(),
              transactions: [tx, ...p.transactions],
            }
          : p
      )
    );

    showToast(`Adjusted ${prod.name} balance from ${prevBal} to ${verifiedQuantity} ${prod.unit}. Reason: ${reason}`, 'info');
    return true;
  };

  const transferDryProduct = (
    productId: string,
    quantity: number,
    destinationLocation: string,
    reason?: string
  ): boolean => {
    const prod = dryProducts.find((p) => p.id === productId);
    if (!prod) return false;
    if (quantity <= 0 || quantity > prod.quantity) {
      showToast('Invalid transfer quantity', 'error');
      return false;
    }

    const sourceLoc = prod.storageLocation;

    if (quantity === prod.quantity) {
      const tx: DryInventoryTransaction = {
        id: `dry-tx-${Date.now()}`,
        productId,
        type: 'transfer',
        quantity,
        unit: prod.unit,
        previousBalance: prod.quantity,
        newBalance: prod.quantity,
        sourceLocation: sourceLoc,
        destinationLocation,
        reason: reason || `Relocation from ${sourceLoc} to ${destinationLocation}`,
        date: new Date().toISOString().split('T')[0],
        authorizedBy: user.name,
        receiptNumber: `#DRY-TRF-${Math.floor(1000 + Math.random() * 9000)}`,
      };

      setDryProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                storageLocation: destinationLocation,
                updatedAt: new Date().toISOString(),
                transactions: [tx, ...p.transactions],
              }
            : p
        )
      );
    } else {
      const prevBal = prod.quantity;
      const remainingBal = prevBal - quantity;

      const txSource: DryInventoryTransaction = {
        id: `dry-tx-${Date.now()}`,
        productId,
        type: 'transfer',
        quantity,
        unit: prod.unit,
        previousBalance: prevBal,
        newBalance: remainingBal,
        sourceLocation: sourceLoc,
        destinationLocation,
        reason: reason || `Partial transfer to ${destinationLocation}`,
        date: new Date().toISOString().split('T')[0],
        authorizedBy: user.name,
        receiptNumber: `#DRY-TRF-${Math.floor(1000 + Math.random() * 9000)}`,
      };

      setDryProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                quantity: remainingBal,
                updatedAt: new Date().toISOString(),
                transactions: [txSource, ...p.transactions],
              }
            : p
        )
      );

      addDryProduct({
        name: prod.name,
        nameTa: prod.nameTa,
        category: prod.category,
        variety: prod.variety,
        quantity,
        unit: prod.unit,
        storageLocation: destinationLocation,
        batchLotId: `${prod.batchLotId}-B`,
        harvestDate: prod.harvestDate,
        expiryDate: prod.expiryDate,
        supplier: prod.supplier,
        unitCost: prod.unitCost,
        lowStockThreshold: prod.lowStockThreshold,
        notes: `Transferred from ${sourceLoc}`,
        imageUrl: prod.imageUrl,
      });
    }

    showToast(`Transferred ${quantity} ${prod.unit} to ${destinationLocation}. Total stock preserved.`, 'success');
    return true;
  };

  const archiveDryProduct = (productId: string, force: boolean = false): boolean => {
    const prod = dryProducts.find((p) => p.id === productId);
    if (!prod) return false;

    if (prod.quantity > 0 && !force) {
      showToast(`Warning: Product has ${prod.quantity} ${prod.unit} active stock! Confirm archive if deliberate.`, 'warning');
      return false;
    }

    setDryProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, isArchived: true, status: 'archived', updatedAt: new Date().toISOString() }
          : p
      )
    );
    showToast(`Archived ${prod.name}. Item preserved in historical records.`, 'info');
    return true;
  };

  const restoreDryProduct = (productId: string): boolean => {
    const prod = dryProducts.find((p) => p.id === productId);
    if (!prod) return false;

    setDryProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              isArchived: false,
              status: p.quantity === 0 ? 'depleted' : p.quantity <= p.lowStockThreshold ? 'low_stock' : 'in_stock',
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
    showToast(`Restored ${prod.name} to active inventory list.`, 'success');
    return true;
  };

  const updateDryProductThreshold = (productId: string, threshold: number): boolean => {
    if (threshold < 0) return false;
    setDryProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const isLow = p.quantity <= threshold && p.quantity > 0;
          return {
            ...p,
            lowStockThreshold: threshold,
            status: p.quantity === 0 ? 'depleted' : isLow ? 'low_stock' : 'in_stock',
          };
        }
        return p;
      })
    );
    showToast(`Low-stock alert threshold set to ${threshold}`, 'info');
    return true;
  };

  const refreshTelemetry = () => {
    setFacilities((prev) =>
      prev.map((f) => ({
        ...f,
        lastUpdatedMinutesAgo: 0,
        chambers: f.chambers.map((c) => ({
          ...c,
          currentTemp: Number((c.tempMin + Math.random() * (c.tempMax - c.tempMin)).toFixed(1)),
          humidity: Math.floor(84 + Math.random() * 8),
        })),
      }))
    );
    showToast('IoT Telemetry synced with TN-Agri Grid sensors.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        role,
        setRole,
        language,
        setLanguage,
        toggleLanguage,
        serviceMode,
        setServiceMode,
        isDemoMode,
        setIsDemoMode,
        t,
        facilities,
        bookings,
        batches,
        movements,
        conflictNotice,
        notifications,
        inspections,
        reviews,
        alerts,
        toasts,
        dryProducts,
        pickupRequests,
        showToast,
        dismissToast,
        createBooking,
        cancelBooking,
        resolveConflict,
        verifyIntake,
        confirmWeightVerification,
        reportWeightDiscrepancy,
        requestPickup,
        approvePickupRequest,
        rejectPickupRequest,
        completePickupWithdrawal,
        registerBatch,
        recordIntake,
        performPartialWithdrawal,
        transferStock,
        adjustStock,
        archiveBatch,
        addDryProduct,
        addStockDryProduct,
        removeStockDryProduct,
        adjustStockDryProduct,
        transferDryProduct,
        archiveDryProduct,
        restoreDryProduct,
        updateDryProductThreshold,
        calculateCapacityLedger,
        getAIInsights,
        login,
        registerUser,
        scheduleInspection,
        submitReview,
        markNotificationAsRead,
        refreshTelemetry,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
