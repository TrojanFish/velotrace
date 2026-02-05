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
 * Liquid Glass Skeleton component for loading states
 */
export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={cn("liquid-skeleton", className)} />
    );
}
