/**
 * Road Cycling Kit Advisor
 */

interface KitInput {
    apparentTemp: number; // °C (RealFeel/WindChill)
    isRainy: boolean;
    isColdRunner: boolean;
}

export function getKitRecommendation({
    apparentTemp,
    isRainy,
    isColdRunner
}: KitInput) {
    // Use apparent temp as the primary driver for wind-chill consideration
    const effectiveTemp = isColdRunner ? apparentTemp - 3 : apparentTemp;

    let baseLayer = "noBase";
    let jersey = "shortJersey";
    let accessories: string[] = [];

    if (effectiveTemp > 25) {
        baseLayer = "ultraThin";
        jersey = "lightJersey";
    } else if (effectiveTemp > 18) {
        baseLayer = "sleeveless";
        accessories = ["descendVest"];
    } else if (effectiveTemp > 12) {
        baseLayer = "shortSleeve";
        jersey = "longJersey";
        accessories = ["vest"];
    } else if (effectiveTemp > 7) {
        baseLayer = "longSleeve";
        jersey = "fleeceJersey";
        accessories = ["vest", "gloves", "warmers"];
    } else {
        baseLayer = "thickBase";
        jersey = "winterJacket";
        accessories = ["winterGloves", "shoeCovers", "neckWarmer"];
    }

    if (isRainy) {
        accessories.push("rainLayer");
    }

    return {
        baseLayer,
        jersey,
        accessories,
        level: effectiveTemp > 20 ? 'warm' : effectiveTemp > 10 ? 'cool' : 'cold'
    };
}
