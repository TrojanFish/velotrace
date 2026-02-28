/**
 * Precision Sweat Rate Calculator
 * 
 * Formula:
 * Sweat Rate (L/h) = (Pre-ride Weight - Post-ride Weight + Fluid Intake - Urine Loss) / Ride Duration (hours)
 */

export interface SweatRateInput {
    preWeight: number;      // kg
    postWeight: number;     // kg
    fluidIntake: number;    // L
    urineLoss: number;      // L (optional, default 0)
    durationMinutes: number; // min
}

export interface SweatRateResult {
    sweatRate: number;      // L/h
    totalLoss: number;      // L
    dehydrationPercent: number; // %
    recommendation: string;
    intensity: 'low' | 'moderate' | 'high' | 'extreme';
}

export function calculateSweatRate(input: SweatRateInput): SweatRateResult {
    const durationHours = input.durationMinutes / 60;
    const weightLoss = input.preWeight - input.postWeight;
    const totalSweatLoss = weightLoss + input.fluidIntake - (input.urineLoss || 0);
    const sweatRate = totalSweatLoss / durationHours;

    const dehydrationPercent = (weightLoss / input.preWeight) * 100;

    let intensity: SweatRateResult['intensity'] = 'moderate';
    if (sweatRate < 0.5) intensity = 'low';
    else if (sweatRate > 1.5) intensity = 'high';
    else if (sweatRate > 2.5) intensity = 'extreme';

    let recommendation = "";
    if (dehydrationPercent > 2) {
        recommendation = "dehydrated";
    } else if (dehydrationPercent < 0) {
        recommendation = "overhydrated";
    } else if (sweatRate > 1.2) {
        recommendation = "highRate";
    } else {
        recommendation = "good";
    }

    return {
        sweatRate: Number(sweatRate.toFixed(2)),
        totalLoss: Number(totalSweatLoss.toFixed(2)),
        dehydrationPercent: Number(dehydrationPercent.toFixed(2)),
        recommendation,
        intensity
    };
}
