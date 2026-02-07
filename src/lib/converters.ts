/**
 * Unit Conversion Library
 * VeloTrace Professional Engine
 */

export const converters = {
    // Distance
    kmToMiles: (km: number) => km * 0.621371,
    milesToKm: (miles: number) => miles / 0.621371,

    // Weight
    kgToLbs: (kg: number) => kg * 2.20462,
    lbsToKg: (lbs: number) => lbs / 2.20462,

    // Temperature
    celsiusToFahrenheit: (c: number) => (c * 9) / 5 + 32,
    fahrenheitToCelsius: (f: number) => ((f - 32) * 5) / 9,

    // Formatters
    formatDistance: (km: number, unit: 'metric' | 'imperial', decimals = 1) => {
        if (unit === 'imperial') {
            return `${(km * 0.621371).toFixed(decimals)} mi`;
        }
        return `${km.toFixed(decimals)} km`;
    },

    formatWeight: (kg: number, unit: 'metric' | 'imperial', decimals = 1) => {
        if (unit === 'imperial') {
            return `${(kg * 2.20462).toFixed(decimals)} lbs`;
        }
        return `${kg.toFixed(decimals)} kg`;
    },

    formatTemp: (c: number, unit: 'metric' | 'imperial', decimals = 0) => {
        if (unit === 'imperial') {
            return `${((c * 9) / 5 + 32).toFixed(decimals)}°F`;
        }
        return `${c.toFixed(decimals)}°C`;
    },

    formatSpeed: (kmh: number, unit: 'metric' | 'imperial', decimals = 1) => {
        if (unit === 'imperial') {
            return `${(kmh * 0.621371).toFixed(decimals)} mph`;
        }
        return `${kmh.toFixed(decimals)} km/h`;
    }
};
