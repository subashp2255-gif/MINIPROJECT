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
  toasts: ToastAlert[];

  showToast: (message: string, type?: ToastAlert['type']) => void;
  dismissToast: (id: string) => void;
  createBooking: (newBookingData: Omit<Booking, 'id' | 'bookingCode' | 'createdAt' | 'status' | 'batchPin'>) => Booking;
  resolveConflict: (choice: ConflictNotice['selectedOption']) => void;
  verifyIntake: (bookingCode: string, verifiedKg: number, verifiedCrates: number, chamberName: string) => void;
  performPartialWithdrawal: (batchCode: string, withdrawKg: number, withdrawCrates: number, reason: string) => boolean;
  scheduleInspection: (batchCode: string, cropName: string, facilityId: string, date: string, time: string) => void;
  submitReview: (bookingCode: string, rating: number, comment: string, isComplaint?: boolean, complaintCat?: string) => void;
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
  const [movements, setMovements] = useState<InventoryMovement[]>(INITIAL_MOVEMENTS);
  const [conflictNotice, setConflictNotice] = useState<ConflictNotice>(INITIAL_CONFLICT_NOTICE);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [inspections, setInspections] = useState<InspectionRequest[]>(MOCK_INSPECTIONS);
  const [reviews, setReviews] = useState<FeedbackReview[]>(MOCK_REVIEWS);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

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

    setBookings((prev) => [newBooking, ...prev]);

    // Also deduct facility chamber capacity
    setFacilities((prevFacs) =>
      prevFacs.map((fac) => {
        if (fac.id === newBooking.facilityId) {
          return {
            ...fac,
            chambers: fac.chambers.map((cham) => {
              if (cham.id === newBooking.chamberId) {
                return {
                  ...cham,
                  availableCapacityCrates: Math.max(0, cham.availableCapacityCrates - newBooking.bookedCrates),
                  availableCapacityKg: Math.max(0, cham.availableCapacityKg - newBooking.bookedKg),
                };
              }
              return cham;
            }),
          };
        }
        return fac;
      })
    );

    // Create a notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Booking Confirmed ${newBooking.bookingCode}`,
      titleTa: `முன்பதிவு உறுதி செய்யப்பட்டது ${newBooking.bookingCode}`,
      message: `Chamber slot allocated for ${newBooking.cropName}. Show Gate Pass PIN ${pin} at inbound gate.`,
      messageTa: `${newBooking.cropName}-ற்கு இடம் ஒதுக்கப்பட்டது. வாயிலில் PIN ${pin}-ஐ காட்டவும்.`,
      timestamp: 'Just now',
      type: 'booking',
      read: false,
      linkUrl: `/booking/${newBooking.bookingCode.replace('#', '')}/confirmation`,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`Chamber reserved successfully! Booking ID: ${newBooking.bookingCode}`, 'success');
    return newBooking;
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

  const verifyIntake = (
    bookingCode: string,
    verifiedKg: number,
    verifiedCrates: number,
    chamberName: string
  ) => {
    const booking = bookings.find((b) => b.bookingCode === bookingCode);
    if (!booking) return;

    const batchCode = `#TN-BAT-${Math.floor(100 + Math.random() * 900)}`;

    const newBatch: InventoryBatch = {
      id: `bat-${Date.now()}`,
      batchCode,
      bookingId: booking.id,
      farmerId: booking.farmerId,
      farmerName: booking.farmerName,
      facilityId: booking.facilityId,
      facilityName: booking.facilityName,
      chamberName: chamberName || booking.chamberName,
      cropName: booking.cropName,
      cropNameTa: booking.cropNameTa,
      grade: booking.grade,
      cropImageUrl: booking.cropImageUrl,
      currentStockKg: verifiedKg,
      currentStockCrates: verifiedCrates,
      initialStockKg: verifiedKg,
      withdrawnKg: 0,
      dayCurrent: 1,
      dayTotal: booking.durationDays,
      intakeDate: new Date().toISOString().split('T')[0],
      targetCollectDate: booking.endDate,
      currentTemp: 2.8,
      currentHumidity: 89,
      status: 'in_storage',
      qualityScore: 99,
      notes: `Verified at gate weighing bridge. Weighed ${verifiedKg} kg in ${verifiedCrates} crates.`,
    };

    setBatches((prev) => [newBatch, ...prev]);

    setBookings((prev) =>
      prev.map((b) =>
        b.bookingCode === bookingCode
          ? {
              ...b,
              status: 'in_storage',
              verifiedKg,
              verifiedCrates,
            }
          : b
      )
    );

    const movement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      batchId: newBatch.id,
      batchCode,
      timestamp: new Date().toISOString(),
      type: 'intake',
      quantityKg: verifiedKg,
      quantityCrates: verifiedCrates,
      authorizedBy: `${user.name} (Scale Operator)`,
      reason: `Gate Inbound Verification & Chamber Allocation`,
      receiptNumber: `#REC-INT-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setMovements((prev) => [movement, ...prev]);

    showToast(`Produce intake verified: Batch ${batchCode} slotted in ${chamberName}!`, 'success');
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
      showToast(`Withdrawal exceeds current stock of ${targetBatch.currentStockKg} kg!`, 'error');
      return false;
    }

    const remainingKg = targetBatch.currentStockKg - withdrawKg;
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
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
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
        toasts,
        showToast,
        dismissToast,
        createBooking,
        resolveConflict,
        verifyIntake,
        performPartialWithdrawal,
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
