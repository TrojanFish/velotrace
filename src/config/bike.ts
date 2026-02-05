import { LucideIcon, Droplets, History, CircleDot, Disc, Wrench } from "lucide-react";
import type { MaintenanceState } from "@/store/useStore";

/**
 * Maintenance component configuration
 * Centralized configuration for bike maintenance tracking
 */
export interface MaintenanceConfig {
    label: string;
    icon: LucideIcon;
    target: number;
    color: 'cyan' | 'warning' | 'success' | 'danger' | 'purple';
    colorClass: string;
}

export const MAINTENANCE_CONFIG: Record<keyof MaintenanceState, MaintenanceConfig> = {
    chainLube: {
        label: "链条润滑",
        icon: Droplets,
        target: 300,
        color: "cyan",
        colorClass: "text-cyan-400"
    },
    chainWear: {
        label: "链条磨损",
        icon: History,
        target: 3000,
        color: "warning",
        colorClass: "text-orange-400"
    },
    tires: {
        label: "外胎寿命",
        icon: CircleDot,
        target: 4000,
        color: "success",
        colorClass: "text-emerald-400"
    },
    brakePads: {
        label: "刹车皮",
        icon: Disc,
        target: 2500,
        color: "danger",
        colorClass: "text-rose-400"
    },
    service: {
        label: "整车大保养",
        icon: Wrench,
        target: 5000,
        color: "purple",
        colorClass: "text-purple-400"
    }
} as const;

/**
 * Surface condition options for tire pressure calculation
 */
export const SURFACE_CONDITIONS = [
    { value: "perfect" as const, label: "赛道" },
    { value: "normal" as const, label: "干路" },
    { value: "rough" as const, label: "湿滑" },
    { value: "gravel" as const, label: "砂石" },
] as const;

/**
 * Default maintenance state for new bikes
 */
export const DEFAULT_MAINTENANCE: MaintenanceState = {
    chainLube: 0,
    chainWear: 0,
    tires: 0,
    brakePads: 0,
    service: 0
} as const;
