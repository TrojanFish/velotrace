/**
 * Activity Insight Logic 2.0
 * Advanced analytics for ride intensity and physiological cost.
 */

export interface ActivityData {
    distance: number; // meters
    movingTime: number; // seconds
    elapsedTime: number;
    totalElevationGain: number; // meters
    averagePower: number;
    maxPower: number;
    averageHeartrate?: number;
    maxHeartrate?: number;
    calories: number;
    intensityScore?: number; // 0-1
}

export interface MetabolismResult {
    fatPercent: number;
    carbPercent: number;
    fatGrams: number;
    carbGrams: number;
}

/**
 * Estimate metabolism based on intensity using a sigmoidal crossover model.
 * At lower intensities, fat oxidation is dominant. 
 * The 'Crossover Point' is typically around 65-75% of VO2Max or FTP.
 */
export function calculateMetabolism(power: number, ftp: number, durationHours: number): MetabolismResult {
    const intensity = power / ftp;

    // Crossover Model: Use a sigmoid-like function to model fat percentage
    // fat% = 100 / (1 + exp(k * (intensity - crossover)))
    const crossover = 0.65; // 65% FTP
    const k = 12; // Steepness of the crossover

    let fatPercent = 100 / (1 + Math.exp(k * (intensity - crossover)));

    // Clamp values for realism
    fatPercent = Math.min(85, Math.max(5, fatPercent));
    const carbPercent = 100 - fatPercent;

    // Total Energy in kcal
    // Human efficiency is approx 22% (0.22)
    // kcal = (Power * Time_sec) / (4.184 * 0.22 * 1000) ≈ (Power * Time_sec) / 920
    const totalKcal = (power * durationHours * 3600) / 920;

    const fatKcal = (totalKcal * fatPercent) / 100;
    const carbKcal = (totalKcal * carbPercent) / 100;

    return {
        fatPercent: Math.round(fatPercent),
        carbPercent: Math.round(carbPercent),
        fatGrams: Math.round(fatKcal / 9 * 10) / 10,
        carbGrams: Math.round(carbKcal / 4)
    };
}

/**
 * Normalized Power (NP) Estimation (Simple 30s rolling average proxy)
 * In theory: NP = (avg(power^4))^(1/4)
 */
export function estimateNP(avgPower: number, maxPower: number): number {
    // Heuristic: NP is usually 5-15% higher than AP depending on variability
    const variability = maxPower / avgPower;
    const factor = Math.min(1.2, 1.0 + (variability - 1.2) * 0.2);
    return Math.round(avgPower * factor);
}

export function getRecoveryTime(intensity: number, durationHours: number): number {
    // Exponential recovery cost scaling
    // load = (IntensityFactor^2) * hours
    const load = Math.pow(intensity, 2.5) * durationHours * 15;

    if (load < 5) return 4;
    if (load < 15) return 12;
    if (load < 35) return 24;
    if (load < 60) return 48;
    return 72; // Deep fatigue
}

/**
 * Simulate power zone distribution 2.0
 */
export function simulatePowerZones(avgPower: number, maxPower: number, ftp: number) {
    const intensity = avgPower / ftp;
    let zones = [0, 0, 0, 0, 0, 0, 0];

    if (intensity < 0.55) {
        zones = [75, 20, 5, 0, 0, 0, 0];
    } else if (intensity < 0.75) {
        zones = [25, 55, 15, 5, 0, 0, 0];
    } else if (intensity < 0.90) {
        zones = [10, 20, 50, 15, 5, 0, 0];
    } else if (intensity < 1.05) {
        zones = [5, 10, 20, 45, 15, 5, 0];
    } else {
        zones = [5, 5, 10, 20, 35, 20, 5];
    }

    return zones;
}

/**
 * Estimate TSS (Training Stress Score)
 * TSS = [(sec * NP * IF) / (FTP * 3600)] * 100
 */
export function calculateTSS(weightedPower: number, avgPower: number, ftp: number, durationSec: number) {
    const np = weightedPower || estimateNP(avgPower, avgPower * 1.5);
    const if_factor = np / ftp;
    const tss = ((durationSec * np * if_factor) / (ftp * 3600)) * 100;
    return Math.round(tss);
}
