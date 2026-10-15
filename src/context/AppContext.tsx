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

  showToast: (message: string, type?: ToastAlert['type']) => void;
  dismissToast: (id: string) => void;

  // Booking Module
  createBooking: (newBookingData: Omit<Booking, 'id' | 'bookingCode' | 'createdAt' | 'status' | 'batchPin'>) => Booking;
  cancelBooking: (bookingCode: string, reason: string) => boolean;
  resolveConflict: (choice: ConflictNotice['selectedOption']) => void;
  scheduleInspection: (batchCode: string, cropName: string, facilityId: string, date: string, time: string) => void;
  submitReview: (bookingCode: string, rating: number, comment: string, isComplaint?: boolean, complaintCat?: string) => void;

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
        showToast,
        dismissToast,
        createBooking,
        cancelBooking,
        resolveConflict,
        verifyIntake,
        registerBatch,
        recordIntake,
        performPartialWithdrawal,
        transferStock,
        adjustStock,
        archiveBatch,
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
