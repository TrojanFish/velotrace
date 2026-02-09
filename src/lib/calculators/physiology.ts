/**
 * Physiological Calculators 2.0
 * Advanced metrics for pro-cycling performance analysis.
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
 * Updated to use Tanaka formula for maxHR by default.
 */
export function calculateHRZones(age: number, restingHR: number): HRZone[] {
    const maxHR = 208 - Math.round(0.7 * age);
    const hrReserve = maxHR - restingHR;

    const zones: { name: string; range: [number, number]; desc: string; color: string }[] = [
        { name: "动态恢复 / Active Recovery", range: [0.5, 0.6], desc: "极低强度，促进代谢产物清除", color: "text-slate-400" },
        { name: "基础耐力 / Endurance", range: [0.6, 0.7], desc: "有氧基础建设，最大化脂肪氧化", color: "text-emerald-400" },
        { name: "节奏区间 / Tempo", range: [0.7, 0.8], desc: "提升糖原储备，中等强度耐力", color: "text-blue-400" },
        { name: "乳酸阈值 / Threshold", range: [0.8, 0.9], desc: "抗乳酸训练，提升巡航输出能力", color: "text-orange-400" },
        { name: "无氧极限 / Anaerobic", range: [0.9, 1.0], desc: "提升VO2 Max，核心高强度区间", color: "text-rose-500" },
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
 * Estimate VO2 Max using the Uth–Sørensen–Overgaard–Pugh formula
 * VO2 Max = 15.3 * (MaxHR / RestingHR)
 */
export function estimateVO2Max(maxHR: number, restingHR: number): number {
    if (restingHR <= 0) return 0;
    return Math.round(15.3 * (maxHR / restingHR) * 10) / 10;
}

/**
 * Categorize Rider based on Power-to-Weight Ratio (W/Kg)
 * Reference: Coggan's Power Profiling Table (FTP for 1 Hour)
 */
export function getRiderCategory(ftp: number, weight: number, sex: 'male' | 'female' | 'other'): string {
    const wpkg = ftp / weight;

    if (sex === 'male') {
        if (wpkg >= 6.0) return "World Tour / Pro";
        if (wpkg >= 5.0) return "Domestic Elite (Cat 1)";
        if (wpkg >= 4.1) return "Advanced (Cat 2)";
        if (wpkg >= 3.2) return "Intermediate (Cat 3)";
        if (wpkg >= 2.3) return "Novice (Cat 4)";
        return "Recreational";
    } else {
        if (wpkg >= 5.2) return "World Tour / Pro";
        if (wpkg >= 4.3) return "Domestic Elite (Cat 1)";
        if (wpkg >= 3.5) return "Advanced (Cat 2)";
        if (wpkg >= 2.7) return "Intermediate (Cat 3)";
        if (wpkg >= 1.9) return "Novice (Cat 4)";
        return "Recreational";
    }
}

/**
 * Calculate Racing Ideal Weight
 * Based on height, sex, and a target performance body fat percentage (e.g., 6-10% for men).
 */
export function calculateIdealRacingWeight(heightCm: number, sex: 'male' | 'female' | 'other'): {
    min: number,
    max: number,
    status: string
} {
    // Hamwi Formula as a baseline for cyclists
    let base = sex === 'male' ? 48 : 45.5;
    const additionalH = Math.max(0, (heightCm - 152.4) / 2.54);
    const weightBase = base + (additionalH * 2.7);

    return {
        min: Math.round(weightBase * 0.95), // Elite lean
        max: Math.round(weightBase * 1.05), // Healthy athletic
        status: "基于Hamwi竞赛模型推演"
    };
}

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 */
export function calculateBMR(weight: number, heightCm: number, age: number, sex: 'male' | 'female' | 'other'): number {
    let bmr = (10 * weight) + (6.25 * heightCm) - (5 * age);
    if (sex === 'male') bmr += 5;
    else bmr -= 161;
    return Math.round(bmr);
}

/**
 * Get Recovery Modifier based on Age and TSB
 */
export function getAgeRecoveryModifier(age: number): number {
    if (age < 30) return 0.9;
    if (age < 45) return 1.0;
    if (age < 60) return 1.25;
    return 1.5;
}
