/**
 * Nutrition & Hydration Calculator for Cyclists
 */

export interface NutritionInput {
    durationHours: number;
    intensityPercent: number; // 1-100 (Recovery to Race)
    temperature: number; // °C
    weight: number; // kg
}

export function calculateNutrition(input: NutritionInput) {
    // Carb logic: Endurance riders often aim for 60-90g/hr
    // 30g/hr for recovery, up to 100g/hr for elite race effort
    const baseCarbsPerHour = 30 + (input.intensityPercent / 100) * 70;
    const totalCarbs = Math.round(baseCarbsPerHour * input.durationHours);

    // Hydration logic: Base 500ml/hr + 10ml per degree above 20C + weight factor
    const baseFluidPerHour = 500 + Math.max(0, input.temperature - 20) * 20;
    const totalFluid = Math.round(baseFluidPerHour * input.durationHours);

    // Electrolytes: Salt required if hot/long
    const needsElectrolytes = input.temperature > 25 || input.durationHours > 2.5;

    return {
        carbsPerHour: Math.round(baseCarbsPerHour),
        totalCarbs,
        fluidPerHour: Math.round(baseFluidPerHour),
        totalFluid,
        needsElectrolytes,
        // Suggested items (standard counts)
        gelCount: Math.ceil(totalCarbs / 25), // 25g per gel
        bottleCount: Math.ceil(totalFluid / 600), // 600ml per bottle
    };
}
