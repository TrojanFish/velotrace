"use client";

import { useState, useCallback } from "react";
import { useStore, BikeProfile } from "@/store/useStore";
import { DEFAULT_MAINTENANCE } from "@/config/bike";

interface StravaSyncResult {
    success: boolean;
    error?: string;
}

interface UseStravaSyncReturn {
    isSyncing: boolean;
    syncSuccess: boolean;
    syncError: boolean;
    sync: () => Promise<StravaSyncResult>;
}

interface StravaRoute {
    id: string;
    name: string;
    distance: number;
    elevation: number;
    polyline: string;
}

interface StravaBike {
    id: string;
    name: string;
    totalDistance: number;
    primary: boolean;
}

/**
 * Custom hook for Strava data synchronization
 * Encapsulates all sync logic and state management
 */
export function useStravaSync(): UseStravaSyncReturn {
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncSuccess, setSyncSuccess] = useState(false);
    const [syncError, setSyncError] = useState(false);

    const { user, bikes, updateUser, setBikes, setActiveBikeIndex, setStravaStatsCache, setStravaRoutesCache } = useStore();

    const sync = useCallback(async (): Promise<StravaSyncResult> => {
        setIsSyncing(true);
        setSyncSuccess(false);
        setSyncError(false);

        try {
            const res = await fetch('/api/strava/dashboard');
            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            const { athlete, stats, routes, timestamp } = data;

            // 1. Update user profile data
            updateUser({
                ftp: athlete.ftp || user.ftp,
                weight: athlete.weight || user.weight,
                sex: athlete.sex || user.sex,
                lastSyncDate: new Date(timestamp).toISOString()
            });

            // 2. Update stats and routes caches immediately
            setStravaStatsCache({ data: stats, timestamp });
            setStravaRoutesCache({
                data: routes.map((r: StravaRoute) => ({
                    id: r.id,
                    name: r.name,
                    distance: r.distance,
                    elevation: r.elevation,
                    map: { summary_polyline: r.polyline }
                })),
                timestamp
            });

            // 3. Sync bikes
            if (athlete.bikes && athlete.bikes.length > 0) {
                const syncedBikes: BikeProfile[] = athlete.bikes.map((b: StravaBike) => {
                    const existing = bikes.find(eb => eb.stravaGearId === b.id);
                    return {
                        id: b.id,
                        name: b.name,
                        totalDistance: b.totalDistance,
                        stravaGearId: b.id,
                        weight: existing?.weight || 8.5,
                        activeWheelsetIndex: existing?.activeWheelsetIndex || 0,
                        wheelsets: existing?.wheelsets || [
                            {
                                id: `ws-${b.id}-default`,
                                name: "默认轮组",
                                tireWidth: 28,
                                isTubeless: false,
                                mileage: b.totalDistance,
                                lastLubeMileage: 0
                            }
                        ],
                        maintenance: existing?.maintenance || { ...DEFAULT_MAINTENANCE },
                        torqueSettings: existing?.torqueSettings || [],
                        maintenanceLogs: existing?.maintenanceLogs || []
                    };
                });

                setBikes(syncedBikes);

                const primaryIndex = syncedBikes.findIndex((sb) =>
                    athlete.bikes.find((db: StravaBike) => db.id === sb.id && db.primary)
                );
                if (primaryIndex !== -1) {
                    setActiveBikeIndex(primaryIndex);
                }
            }

            setSyncSuccess(true);
            setTimeout(() => setSyncSuccess(false), 3000);

            return { success: true };
        } catch (e) {
            console.error("Strava batch sync error:", e);
            setSyncError(true);
            setTimeout(() => setSyncError(false), 3000);

            return {
                success: false,
                error: e instanceof Error ? e.message : "未知同步错误"
            };
        } finally {
            setIsSyncing(false);
        }
    }, [user, bikes, updateUser, setBikes, setActiveBikeIndex, setStravaStatsCache, setStravaRoutesCache]);

    return {
        isSyncing,
        syncSuccess,
        syncError,
        sync
    };
}
