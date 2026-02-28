/**
 * Road Cycling Gear Ratio Calculator
 */

export interface GearOption {
    front: number[];
    rear: number[];
}

export const COMMON_GEARS: Record<string, GearOption> = {
    'compact': {
        front: [50, 34],
        rear: [11, 12, 13, 14, 15, 17, 19, 21, 24, 28, 32] // 11s 11-32
    },
    'semi-compact': {
        front: [52, 36],
        rear: [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30] // 11s 11-30
    },
    'standard': {
        front: [53, 39],
        rear: [11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 23] // 11s 11-23
    }
};

export function calculateSpeed(chainring: number, cog: number, cadence: number, tireCircumferenceMm: number = 2111) {
    // Speed (km/h) = (Cadence * 60 * Gear Ratio * Circumference) / 1,000,000
    const ratio = chainring / cog;
    const speedKmh = (cadence * 60 * ratio * tireCircumferenceMm) / 1000000;
    return Math.round(speedKmh * 10) / 10;
}

export function getAllRatios(front: number[], rear: number[]) {
    const table: { front: number; cog: number; ratio: number }[] = [];

    front.forEach(f => {
        rear.forEach(r => {
            table.push({
                front: f,
                cog: r,
                ratio: Math.round((f / r) * 100) / 100
            });
        });
    });

    return table.sort((a, b) => b.ratio - a.ratio);
}
