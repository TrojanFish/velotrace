/**
 * Activity Insight Logic
 * Calculates metabolism, intensity factors, and training load
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
 * Estimate metabolism based on intensity (RPE or % of FTP)
 * General Rule: Lower intensity (Z1/Z2) uses more fat, higher intensity (Z4+) uses almost purely carbs.
 */
export function calculateMetabolism(power: number, ftp: number, durationHours: number): MetabolismResult {
    const intensity = power / ftp;

    // Empirical estimation formula
    // At 50% FTP (~Z1), maybe 60-70% Fat
    // At 100% FTP (Threshold), maybe 10% Fat
    let fatPercent = 0;
    if (intensity < 0.5) fatPercent = 70;
    else if (intensity < 0.75) fatPercent = 70 - (intensity - 0.5) * 160; // 70% to 30%
    else if (intensity < 1.0) fatPercent = 30 - (intensity - 0.75) * 80;   // 30% to 10%
    else fatPercent = Math.max(5, 10 - (intensity - 1.0) * 10);            // Floor at 5%

    const carbPercent = 100 - fatPercent;

    // Total Energy in kcal (Strava usually provides this, but we can estimate)
    // Work (kJ) = AvgPower * seconds / 1000
    // Human efficiency is approx 20-25%, so kJ of work is roughly equal to kcal of food energy
    const totalKcal = (power * durationHours * 3600) / 1000;

    // 1g Fat = 9 kcal, 1g Carb = 4 kcal
    const fatKcal = (totalKcal * fatPercent) / 100;
    const carbKcal = (totalKcal * carbPercent) / 100;

    return {
        fatPercent: Math.round(fatPercent),
        carbPercent: Math.round(carbPercent),
        fatGrams: Math.round(fatKcal / 9 * 10) / 10,
        carbGrams: Math.round(carbKcal / 4)
    };
}

export function getRecoveryTime(intensity: number, durationHours: number): number {
    // Simple heuristic for recovery hours
    const load = intensity * intensity * durationHours * 10;
    if (load < 5) return 2;
    if (load < 15) return 12;
    if (load < 30) return 24;
    if (load < 50) return 36;
    return 48;
}

/**
 * Simulate power zone distribution based on activity stats
 * In a production app, this would come from activity streams.
 */
export function simulatePowerZones(avgPower: number, maxPower: number, ftp: number) {
    const intensity = avgPower / ftp;

    // Weights for different zones based on intensity
    let zones = [0, 0, 0, 0, 0, 0, 0];

    if (intensity < 0.6) {
        zones = [60, 30, 10, 0, 0, 0, 0]; // Z1 focus
    } else if (intensity < 0.8) {
        zones = [20, 50, 20, 10, 0, 0, 0]; // Tempo
    } else if (intensity < 0.95) {
        zones = [15, 20, 40, 20, 5, 0, 0]; // Sweet Spot
    } else {
        zones = [10, 15, 20, 30, 20, 5, 0]; // Race/High Intensity
    }

    // If max power is high, add some Z6/Z7 sprints
    if (maxPower > ftp * 1.5) {
        zones[5] = 5;
        zones[6] = 2;
        // Adjust lower zones to keep total 100
        zones[0] = Math.max(0, zones[0] - 7);
    }

    return zones;
}

/**
 * Estimate TSS (Training Stress Score)
 * TSS = [(sec * NP * IF) / (FTP * 3600)] * 100
 */
export function calculateTSS(weightedPower: number, avgPower: number, ftp: number, durationSec: number) {
    const np = weightedPower || avgPower;
    const intensity = np / ftp;
    const tss = ((durationSec * np * intensity) / (ftp * 3600)) * 100;
    return Math.round(tss);
}
