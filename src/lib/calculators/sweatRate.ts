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
        recommendation = "脱水严重 (>2%)。这会导致功率大幅下降和核心水温显著升高。建议在未来的骑行中增加每小时 200-400ml 的补给量。";
    } else if (dehydrationPercent < 0) {
        recommendation = "补给过量（体重增加）。注意低钠血症风险，建议减少非口渴状态下的强制性饮水。";
    } else if (sweatRate > 1.2) {
        recommendation = "高排汗率。即使体重下降在 2% 以内，也建议强制添加电解质（钠离子）以维持血浆渗透压。";
    } else {
        recommendation = "补给策略良好。目前的方案能有效维持你的体液平衡。";
    }

    return {
        sweatRate: Number(sweatRate.toFixed(2)),
        totalLoss: Number(totalSweatLoss.toFixed(2)),
        dehydrationPercent: Number(dehydrationPercent.toFixed(2)),
        recommendation,
        intensity
    };
}
