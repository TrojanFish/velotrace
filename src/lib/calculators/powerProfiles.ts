export interface MMPData {
    duration: number; // in seconds
    label: string;
    power: number; // in Watts
    wKg: number;   // Watts per kg
}

export type RiderCategory = "WorldTour" | "Pro" | "Cat1" | "Cat2" | "Cat3" | "Cat4" | "Cat5";

export interface StandardPower {
    duration: number; // e.g. 5, 60, 300, 1200
    [key: string]: number; // category -> wKg
}

// Simplified version of Coggan's Power Profile (W/kg)
export const COGGAN_STANDARDS: Record<RiderCategory, Record<number, number>> = {
    WorldTour: { 5: 23.0, 60: 10.5, 300: 7.2, 1200: 6.2 },
    Pro: { 5: 20.0, 60: 9.0, 300: 6.2, 1200: 5.4 },
    Cat1: { 5: 18.0, 60: 8.2, 300: 5.6, 1200: 4.8 },
    Cat2: { 5: 16.5, 60: 7.5, 300: 5.1, 1200: 4.3 },
    Cat3: { 5: 15.0, 60: 6.7, 300: 4.5, 1200: 3.8 },
    Cat4: { 5: 13.5, 60: 6.0, 300: 4.0, 1200: 3.3 },
    Cat5: { 5: 11.0, 60: 5.0, 300: 3.3, 1200: 2.8 },
};

export function getRank(wKg: number, duration: number): RiderCategory {
    const categories: RiderCategory[] = ["WorldTour", "Pro", "Cat1", "Cat2", "Cat3", "Cat4", "Cat5"];
    for (const cat of categories) {
        if (wKg >= COGGAN_STANDARDS[cat][duration]) return cat;
    }
    return "Cat5";
}
