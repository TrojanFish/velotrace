import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for combining tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Simple Skeleton component for loading states
 */
export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={cn("animate-pulse bg-slate-800/50 rounded-md", className)} />
    );
}
