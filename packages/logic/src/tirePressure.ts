/**
 * Advanced Tire Pressure Calculator logic
 */

export type SurfaceType = 'perfect' | 'normal' | 'rough' | 'wet' | 'gravel';

export interface TirePressureInput {
    riderWeight: number; // kg
    bikeWeight: number; // kg
    tireWidth: number; // mm
    isTubeless: boolean;
    surfaceType: SurfaceType;
}

export function calculateTirePressure(input: TirePressureInput) {
    const totalWeight = input.riderWeight + input.bikeWeight;

    // Base pressure for 28mm tire at ~75kg total weight on normal tarmac
    // 28mm base ~ 75 psi
    // We use the formula: Pressure = Base * (BaseWidth / InputWidth)^2 * (InputWeight / BaseWeight)
    const baseWidth = 28;
    const baseWeight = 75;
    const basePressure = 75;

    let pressure = basePressure * Math.pow(baseWidth / input.tireWidth, 1.5) * (totalWeight / baseWeight);

    // Surface adjustments
    if (input.surfaceType === 'perfect') pressure *= 1.05;
    if (input.surfaceType === 'rough') pressure *= 0.90;
    if (input.surfaceType === 'wet') pressure *= 0.85;
    if (input.surfaceType === 'gravel') pressure *= 0.75;

    // Tubeless adjustment
    if (input.isTubeless) pressure *= 0.88;

    // Split into Front/Rear (Rear usually 5% higher)
    const rear = Math.round(pressure * 1.02);
    const front = Math.round(pressure * 0.98);

    return {
        front: { psi: front, bar: Math.round((front / 14.504) * 10) / 10 },
        rear: { psi: rear, bar: Math.round((rear / 14.504) * 10) / 10 }
    };
}
