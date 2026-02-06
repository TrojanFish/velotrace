"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";

export function RideTimerManager() {
    const { rideSession, setRideSession } = useStore();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (rideSession?.isActive) {
            if (timerRef.current) clearInterval(timerRef.current);

            timerRef.current = setInterval(() => {
                // We don't necessarily need to update the store every second
                // but we can if we want reactivity across pages.
                // However, the RidePage is the only one showing the timer.
                // If the user navigates away, we just need the clock to keep "running" logically.
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [rideSession?.isActive]);

    return null;
}
