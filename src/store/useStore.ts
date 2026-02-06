import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { Intensity } from '@/lib/calculators/fueling';

// Custom IndexedDB storage for local-first architecture
const idbStorage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        return (await get(name)) || null;
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await set(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
        await del(name);
    },
};

export interface Wheelset {
    id: string;
    name: string;
    tireWidth: number;
    isTubeless: boolean;
    mileage: number;
    lastLubeMileage: number; // For specific wheelset components if needed
}

export interface MaintenanceState {
    chainLube: number;      // km since last lube (Target: 300km)
    chainWear: number;      // km since last replacement (Target: 3000km)
    tires: number;          // km since last replacement (Target: 4000km)
    brakePads: number;      // km since last replacement (Target: 2500km)
    service: number;        // km since last deep service (Target: 5000km)
}

export interface DailyLoad {
    date: string; // YYYY-MM-DD
    tss: number;
}

export interface PMCData {
    date: string;
    ctl: number;
    atl: number;
    tsb: number;
}

export interface WeatherCache {
    data: any;
    timestamp: number;
}

export interface AIBriefingCache {
    data: any;
    timestamp: number;
}

export interface StravaCache {
    data: any;
    timestamp: number;
}

export interface RideSession {
    startTime?: number; // timestamp when timer started
    accumulatedTime: number; // seconds accumulated before last start
    isActive: boolean;
    fuelInterval: number;
    waterInterval: number;
    targetDistance: number;
    intensity: Intensity;
}

export interface TorqueSetting {
    id: string;
    component: string;
    value: string; // e.g., "5-6 Nm"
}

export interface MaintenanceLog {
    id: string;
    date: string;
    title: string;
    description: string;
    mileage: number;
}

export interface BikeProfile {
    id: string;
    name: string;
    weight: number;
    totalDistance: number;
    stravaGearId?: string;
    maintenance: MaintenanceState;
    wheelsets: Wheelset[];
    activeWheelsetIndex: number;
    torqueSettings: TorqueSetting[];
    maintenanceLogs: MaintenanceLog[];
}

interface UserSettings {
    weight: number;
    ftp: number;
    isColdRunner: boolean;
    stravaConnected: boolean;
    age: number;
    sex: 'male' | 'female' | 'other';
    height: number;
    restingHR: number;
    lastSyncDate?: string;
    ctl?: number;
    atl?: number;
    tsb?: number;
    mmp: {
        "5s": number;
        "1m": number;
        "5m": number;
        "20m": number;
    };
}

interface VeloState {
    user: UserSettings;
    bikes: BikeProfile[];
    activeBikeIndex: number;
    dailyLoads: DailyLoad[];

    // Global Data Caches to prevent flickering
    weatherCache: WeatherCache | null;
    aiBriefingCache: AIBriefingCache | null;
    stravaStatsCache: StravaCache | null;
    stravaSegmentsCache: StravaCache | null;
    stravaRoutesCache: StravaCache | null;

    // Ride Session
    rideSession: RideSession | null;

    // Actions
    updateUser: (user: Partial<UserSettings>) => void;
    updateBike: (index: number, bike: Partial<BikeProfile>) => void;
    setBikes: (bikes: BikeProfile[]) => void;
    setActiveBikeIndex: (index: number) => void;
    addBike: (bike: BikeProfile) => void;
    addRideDistance: (distance: number) => void;
    connectStrava: (status: boolean) => void;
    resetMaintenance: (bikeIndex: number, component: keyof MaintenanceState) => void;
    setDailyLoads: (loads: DailyLoad[]) => void;

    // Wheelset Actions
    setActiveWheelset: (bikeIndex: number, wheelsetIndex: number) => void;
    addWheelset: (bikeIndex: number, wheelset: Wheelset) => void;

    // Torque & Maintenance Actions
    addTorqueSetting: (bikeIndex: number, setting: TorqueSetting) => void;
    removeTorqueSetting: (bikeIndex: number, id: string) => void;
    addMaintenanceLog: (bikeIndex: number, log: MaintenanceLog) => void;
    removeMaintenanceLog: (bikeIndex: number, id: string) => void;

    // Cache Actions
    setWeatherCache: (cache: WeatherCache | null) => void;
    setAIBriefingCache: (cache: AIBriefingCache | null) => void;
    setStravaStatsCache: (cache: StravaCache | null) => void;
    setStravaSegmentsCache: (cache: StravaCache | null) => void;
    setStravaRoutesCache: (cache: StravaCache | null) => void;
    setRideSession: (session: RideSession | null) => void;
}

// Type for persisted state during migration
interface PersistedState {
    user?: Partial<UserSettings> & { mmp?: UserSettings['mmp'] };
    bikes?: Array<Partial<BikeProfile> & {
        tireWidth?: number;
        isTubeless?: boolean;
        torqueSettings?: TorqueSetting[];
        maintenanceLogs?: MaintenanceLog[];
    }>;
    activeBikeIndex?: number;
    dailyLoads?: DailyLoad[];
}

const DEFAULT_MAINTENANCE: MaintenanceState = {
    chainLube: 0,
    chainWear: 0,
    tires: 0,
    brakePads: 0,
    service: 0
};

export const useStore = create<VeloState>()(
    persist(
        (set) => ({
            user: {
                weight: 70,
                ftp: 200,
                isColdRunner: false,
                stravaConnected: false,
                age: 30,
                sex: 'male',
                height: 175,
                restingHR: 60,
                ctl: 45,
                atl: 30,
                tsb: 15,
                mmp: {
                    "5s": 800,
                    "1m": 400,
                    "5m": 300,
                    "20m": 240
                }
            },
            bikes: [
                {
                    id: 'default-bike',
                    name: "My Road Bike",
                    weight: 8.5,
                    totalDistance: 0,
                    maintenance: { ...DEFAULT_MAINTENANCE },
                    activeWheelsetIndex: 0,
                    wheelsets: [
                        {
                            id: 'wh-1',
                            name: "Training Wheels (Allroad)",
                            tireWidth: 28,
                            isTubeless: true,
                            mileage: 0,
                            lastLubeMileage: 0
                        }
                    ],
                    torqueSettings: [],
                    maintenanceLogs: []
                }
            ],
            activeBikeIndex: 0,
            dailyLoads: [],
            weatherCache: null,
            aiBriefingCache: null,
            stravaStatsCache: null,
            stravaSegmentsCache: null,
            stravaRoutesCache: null,
            rideSession: null,

            updateUser: (newUser) => set((state) => ({ user: { ...state.user, ...newUser } })),
            updateBike: (index, newBike) => set((state) => {
                const newBikes = [...state.bikes];
                newBikes[index] = { ...newBikes[index], ...newBike };
                return { bikes: newBikes };
            }),
            setBikes: (bikes) => set({ bikes }),
            setActiveBikeIndex: (index) => set({ activeBikeIndex: index }),
            addBike: (bike) => set((state) => ({ bikes: [...state.bikes, bike] })),
            addRideDistance: (distance) => set((state) => {
                const newBikes = [...state.bikes];
                const bike = newBikes[state.activeBikeIndex];

                if (!bike.maintenance) {
                    bike.maintenance = { ...DEFAULT_MAINTENANCE };
                }

                bike.totalDistance += distance;

                // Update active wheelset mileage
                if (bike.wheelsets && bike.wheelsets[bike.activeWheelsetIndex]) {
                    bike.wheelsets[bike.activeWheelsetIndex].mileage += distance;
                }

                bike.maintenance.chainLube += distance;
                bike.maintenance.chainWear += distance;
                bike.maintenance.tires += distance;
                bike.maintenance.brakePads += distance;
                bike.maintenance.service += distance;

                return { bikes: newBikes };
            }),
            connectStrava: (status) => set((state) => ({
                user: { ...state.user, stravaConnected: status, lastSyncDate: status ? new Date().toISOString() : undefined }
            })),
            resetMaintenance: (bikeIndex, component) => set((state) => {
                const newBikes = [...state.bikes];
                if (newBikes[bikeIndex].maintenance) {
                    newBikes[bikeIndex].maintenance[component] = 0;
                }
                return { bikes: newBikes };
            }),
            setDailyLoads: (loads) => set({ dailyLoads: loads }),

            setActiveWheelset: (bikeIndex, wheelsetIndex) => set((state) => {
                const newBikes = [...state.bikes];
                newBikes[bikeIndex].activeWheelsetIndex = wheelsetIndex;
                return { bikes: newBikes };
            }),
            addWheelset: (bikeIndex, wheelset) => set((state) => {
                const newBikes = [...state.bikes];
                newBikes[bikeIndex].wheelsets.push(wheelset);
                return { bikes: newBikes };
            }),

            addTorqueSetting: (bikeIndex, setting) => set((state) => {
                const newBikes = [...state.bikes];
                newBikes[bikeIndex].torqueSettings = [...(newBikes[bikeIndex].torqueSettings || []), setting];
                return { bikes: newBikes };
            }),
            removeTorqueSetting: (bikeIndex, id) => set((state) => {
                const newBikes = [...state.bikes];
                newBikes[bikeIndex].torqueSettings = newBikes[bikeIndex].torqueSettings.filter(s => s.id !== id);
                return { bikes: newBikes };
            }),
            addMaintenanceLog: (bikeIndex, log) => set((state) => {
                const newBikes = [...state.bikes];
                newBikes[bikeIndex].maintenanceLogs = [log, ...(newBikes[bikeIndex].maintenanceLogs || [])];
                return { bikes: newBikes };
            }),
            removeMaintenanceLog: (bikeIndex, id) => set((state) => {
                const newBikes = [...state.bikes];
                newBikes[bikeIndex].maintenanceLogs = newBikes[bikeIndex].maintenanceLogs.filter(l => l.id !== id);
                return { bikes: newBikes };
            }),

            setWeatherCache: (weatherCache) => set({ weatherCache }),
            setAIBriefingCache: (aiBriefingCache) => set({ aiBriefingCache }),
            setStravaStatsCache: (stravaStatsCache) => set({ stravaStatsCache }),
            setStravaSegmentsCache: (stravaSegmentsCache) => set({ stravaSegmentsCache }),
            setStravaRoutesCache: (stravaRoutesCache) => set({ stravaRoutesCache }),
            setRideSession: (rideSession) => set({ rideSession }),
        }),
        {
            name: 'velotrace-storage-v4', // Internal migration
            storage: createJSONStorage(() => idbStorage),
            version: 4,
            migrate: (persistedState: unknown, version: number) => {
                const state = persistedState as PersistedState;
                if (version < 3) {
                    // Logic already in v3 migration
                    if (state.user && !state.user.mmp) {
                        state.user.mmp = { "5s": 800, "1m": 400, "5m": 300, "20m": 240 };
                    }
                    if (state.bikes) {
                        state.bikes = state.bikes.map((b) => ({
                            ...b,
                            activeWheelsetIndex: b.activeWheelsetIndex ?? 0,
                            wheelsets: b.wheelsets || [
                                {
                                    id: 'wh-migrated',
                                    name: "Default Wheelset",
                                    tireWidth: b.tireWidth || 28,
                                    isTubeless: b.isTubeless || false,
                                    mileage: b.totalDistance || 0,
                                    lastLubeMileage: 0
                                }
                            ]
                        }));
                    }
                }

                if (version < 4) {
                    if (state.bikes) {
                        state.bikes = state.bikes.map((b) => ({
                            ...b,
                            torqueSettings: b.torqueSettings || [],
                            maintenanceLogs: b.maintenanceLogs || []
                        }));
                    }
                }

                return state as VeloState;
            }
        }
    )
);
