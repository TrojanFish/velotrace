/**
 * Aerodynamics calculator for VeloTrace
 * Estimated CdA based on power, speed, and weight.
 */

interface CdAInput {
    power: number;      // Watts
    speed: number;      // m/s
    riderWeight: number;// kg
    bikeWeight: number; // kg
    grade?: number;     // 0-1 (e.g. 0.01 for 1%)
    airDensity?: number;// kg/m3 (default 1.225)
}

export function calculateCdA({
    power,
    speed,
    riderWeight,
    bikeWeight,
    grade = 0,
    airDensity = 1.225
}: CdAInput): number {
    if (speed <= 0) return 0;

    const gravity = 9.81;
    const crr = 0.005; // Rolling resistance coefficient
    const drivetrainEfficiency = 0.97;
    const totalMass = riderWeight + bikeWeight;

    // Power delivered to wheels
    const pWheel = power * drivetrainEfficiency;

    // Power lost to rolling resistance
    const pRolling = crr * totalMass * gravity * speed;

    // Power lost to gravity (climbing)
    const pGravity = totalMass * gravity * speed * grade;

    // Power remaining for aerodynamics
    const pAero = pWheel - pRolling - pGravity;

    if (pAero <= 0) return 0.25; // Default fallback for extremely low speeds/powers

    // CdA = P_aero / (0.5 * rho * v^3)
    const cda = pAero / (0.5 * airDensity * Math.pow(speed, 3));

    // Clamp to realistic values (0.2 to 0.7 for most cyclists)
    return Math.max(0.2, Math.min(0.7, cda));
}

export function getCdARating(cda: number): string {
    if (cda < 0.28) return "World Class (TT)";
    if (cda < 0.32) return "Pro Aesthetic (Road)";
    if (cda < 0.38) return "Efficient";
    if (cda < 0.45) return "Average";
    return "High Drag";
}
