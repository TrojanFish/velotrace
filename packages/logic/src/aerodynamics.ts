/**
 * Aerodynamics calculator for VeloTrace
 * Professional-grade CdA estimation accounting for wind vector and yaw.
 */

export interface CdAInput {
    power: number;          // Watts
    speed: number;          // m/s (Rider velocity relative to ground)
    riderWeight: number;    // kg
    bikeWeight: number;     // kg
    grade?: number;         // 0-1 (e.g. 0.01 for 1%)
    airDensity?: number;    // kg/m3 (default 1.225)
    windSpeed?: number;     // m/s (Environmental wind)
    windHeading?: number;   // degrees (0-360)
    riderHeading?: number;  // degrees (0-360)
    crr?: number;           // Rolling resistance (default 0.005)
}

/**
 * Calculates current estimated CdA.
 * Uses the equation: P_total = P_gravity + P_rolling + P_aero
 * Where P_aero = 0.5 * CdA * rho * V_air^2 * V_ground
 */
export function calculateCdA({
    power,
    speed,
    riderWeight,
    bikeWeight,
    grade = 0,
    airDensity = 1.225,
    windSpeed = 0,
    windHeading = 0,
    riderHeading = 0,
    crr = 0.005
}: CdAInput): number {
    if (speed <= 0) return 0;

    const gravity = 9.81;
    const drivetrainEfficiency = 0.97;
    const totalMass = riderWeight + bikeWeight;

    // 1. Calculate relative wind speed (Vector sum)
    // theta is the angle between wind and rider (0 = tailwind, 180 = headwind)
    const angleRad = ((windHeading - riderHeading + 180) % 360) * (Math.PI / 180);
    const headwindComponent = windSpeed * Math.cos(angleRad);
    // Air speed relative to rider
    const airSpeed = speed + headwindComponent;

    // Force components
    const fGravity = totalMass * gravity * grade;
    const fRolling = crr * totalMass * gravity;
    const fResistive = fGravity + fRolling;

    // Power delivered to wheels
    const pWheel = power * drivetrainEfficiency;

    // Power consumed by gravity and rolling
    const pResistive = fResistive * speed;

    // Power remaining for aerodynamics
    const pAero = pWheel - pResistive;

    if (pAero <= 0) return 0.28; // Standard road bike default

    // CdA = P_aero / (0.5 * rho * airSpeed^2 * groundSpeed)
    // Note: This is the more accurate power formula for wind
    const cda = pAero / (0.5 * airDensity * Math.pow(Math.abs(airSpeed), 2) * speed);

    // Clamp to realistic values (0.2 to 0.7 for most cyclists)
    return Math.max(0.18, Math.min(0.7, cda));
}

export function getCdARating(cda: number): string {
    if (cda < 0.24) return "Elite TT (Pro)";
    if (cda < 0.28) return "Aero Specialist";
    if (cda < 0.32) return "Efficient Road";
    if (cda < 0.38) return "Average Road";
    if (cda < 0.45) return "Upright/Gravel";
    return "High Drag";
}
