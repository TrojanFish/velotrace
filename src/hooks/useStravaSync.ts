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

/**
 * Custom hook for Strava data synchronization
 * Encapsulates all sync logic and state management
 */
export function useStravaSync(): UseStravaSyncReturn {
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncSuccess, setSyncSuccess] = useState(false);
    const [syncError, setSyncError] = useState(false);

    const { user, bikes, updateUser, setBikes, setActiveBikeIndex } = useStore();

    const sync = useCallback(async (): Promise<StravaSyncResult> => {
        setIsSyncing(true);
        setSyncSuccess(false);
        setSyncError(false);

        try {
            const res = await fetch('/api/strava/sync');
            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Update user profile data
            updateUser({
                ftp: data.ftp || user.ftp,
                weight: data.weight || user.weight,
                sex: data.sex || user.sex,
                lastSyncDate: new Date().toISOString()
            });

            // Sync bikes if available
            if (data.bikes && data.bikes.length > 0) {
                const syncedBikes: BikeProfile[] = data.bikes.map((b: {
                    id: string;
                    name: string;
                    totalDistance: number;
                    primary?: boolean;
                }) => {
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
                        maintenance: existing?.maintenance || { ...DEFAULT_MAINTENANCE }
                    };
                });

                setBikes(syncedBikes);

                // Set primary bike as active
                const primaryIndex = syncedBikes.findIndex((sb) =>
                    data.bikes.find((db: { id: string; primary?: boolean }) =>
                        db.id === sb.id && db.primary
                    )
                );
                if (primaryIndex !== -1) {
                    setActiveBikeIndex(primaryIndex);
                }
            }

            setSyncSuccess(true);
            setTimeout(() => setSyncSuccess(false), 3000);

            return { success: true };
        } catch (e) {
            console.error("Strava sync error:", e);
            setSyncError(true);
            setTimeout(() => setSyncError(false), 3000);

            return {
                success: false,
                error: e instanceof Error ? e.message : "Unknown error"
            };
        } finally {
            setIsSyncing(false);
        }
    }, [user, bikes, updateUser, setBikes, setActiveBikeIndex]);

    return {
        isSyncing,
        syncSuccess,
        syncError,
        sync
    };
}
