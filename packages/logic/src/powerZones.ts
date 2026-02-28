/**
 * Coggan 7-Zone Power Training Model
 */

export interface PowerZone {
    level: number;
    name: string;
    description: string;
    range: [number, number]; // Percentage of FTP
    color: string;
}

export const POWER_ZONES_CONFIG: Omit<PowerZone, 'range'>[] = [
    { level: 1, name: 'Active Recovery', description: '', color: 'text-slate-400' },
    { level: 2, name: 'Endurance', description: '', color: 'text-emerald-400' },
    { level: 3, name: 'Tempo', description: '', color: 'text-yellow-400' },
    { level: 4, name: 'Lactate Threshold', description: '', color: 'text-orange-400' },
    { level: 5, name: 'VO2 Max', description: '', color: 'text-red-400' },
    { level: 6, name: 'Anaerobic Capacity', description: '', color: 'text-purple-400' },
    { level: 7, name: 'Neuromuscular Power', description: '', color: 'text-fuchsia-400' },
];

const ZONE_MULTIPLIERS: [number, number][] = [
    [0, 55],    // Z1
    [56, 75],   // Z2
    [76, 90],   // Z3
    [91, 105],  // Z4
    [106, 120], // Z5
    [121, 150], // Z6
    [151, 999], // Z7
];

export function calculatePowerZones(ftp: number): PowerZone[] {
    return POWER_ZONES_CONFIG.map((config, index) => {
        const [minMult, maxMult] = ZONE_MULTIPLIERS[index];
        return {
            ...config,
            range: [
                Math.round((ftp * minMult) / 100),
                maxMult === 999 ? Infinity : Math.round((ftp * maxMult) / 100)
            ]
        };
    });
}
