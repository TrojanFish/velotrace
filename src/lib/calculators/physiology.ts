/**
 * Physiological Calculators
 * Heart Rate Zones (Karvonen), BMR (Mifflin-St Jeor), and Age-based Recovery Factors
 */

export interface HRZone {
    level: number;
    name: string;
    range: [number, number];
    description: string;
    color: string;
}

/**
 * Calculate Heart Rate Zones using Karvonen Formula
 * TargetHR = ((MaxHR - RestingHR) * %Intensity) + RestingHR
 */
export function calculateHRZones(age: number, restingHR: number): HRZone[] {
    // Tanaka formula: 208 - 0.7 * age (more accurate for fit individuals)
    const maxHR = 208 - Math.round(0.7 * age);
    const hrReserve = maxHR - restingHR;

    const zones: { name: string; range: [number, number]; desc: string; color: string }[] = [
        { name: "热身 / Warm Up", range: [0.5, 0.6], desc: "极低强度，促进代谢循环", color: "text-slate-400" },
        { name: "有氧燃脂 / Fat Burn", range: [0.6, 0.7], desc: "基础耐力，最大化脂肪利用", color: "text-emerald-400" },
        { name: "有氧耐力 / Aerobic", range: [0.7, 0.8], desc: "提升心肺效率，马拉松核心区间", color: "text-blue-400" },
        { name: "乳酸阈值 / Threshold", range: [0.8, 0.9], desc: "抗乳酸训练，提升巡航速度", color: "text-orange-400" },
        { name: "无氧极限 / Anaerobic", range: [0.9, 1.0], desc: "短时爆发，提升最大摄氧量", color: "text-rose-500" },
    ];

    return zones.map((z, i) => ({
        level: i + 1,
        name: z.name,
        range: [
            Math.round(hrReserve * z.range[0] + restingHR),
            Math.round(hrReserve * z.range[1] + restingHR)
        ],
        description: z.desc,
        color: z.color
    }));
}

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 */
export function calculateBMR(weight: number, height: number, age: number, sex: 'male' | 'female' | 'other'): number {
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (sex === 'male') bmr += 5;
    else bmr -= 161;
    return Math.round(bmr);
}

/**
 * Get Recovery Modifier based on Age and TSB
 * Returns a factor for recovery time (1.0 = normal)
 */
export function getAgeRecoveryModifier(age: number): number {
    if (age < 30) return 0.9;  // Faster recovery
    if (age < 45) return 1.0;  // Standard
    if (age < 60) return 1.25; // Slower
    return 1.5;               // Significant recovery required
}
