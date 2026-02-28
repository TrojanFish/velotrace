/**
 * Road Cycling Fueling Calculator
 */

export type Intensity = 'social' | 'tempo' | 'threshold' | 'race';

interface FuelInput {
    durationHours: number;
    weight: number;
    intensity: Intensity;
}

export function calculateFueling({
    durationHours,
    intensity
}: FuelInput) {
    // Carbs per hour based on intensity
    const carbRates: Record<Intensity, number> = {
        social: 30,    // g/hr
        tempo: 60,     // g/hr
        threshold: 80, // g/hr
        race: 95       // g/hr
    };

    // Water per hour (mL)
    const waterRates: Record<Intensity, number> = {
        social: 400,
        tempo: 600,
        threshold: 800,
        race: 1000
    };

    const totalCarbs = Math.round(carbRates[intensity] * durationHours);
    const totalWater = Math.round(waterRates[intensity] * durationHours);

    // Suggested items
    // Assuming a standard gel is 25g and a bottle of mix is 40g
    const gelsNeeded = Math.ceil(totalCarbs / 30);

    return {
        carbs: totalCarbs,
        water: totalWater,
        suggestedGels: gelsNeeded,
        summary: `${totalCarbs}g 碳水 / ${Math.ceil(totalWater / 500)} 瓶 水分`
    };
}
