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
    { level: 1, name: 'Active Recovery', description: '轻松骑行，促进血液循环，不产生疲劳。', color: 'text-slate-400' },
    { level: 2, name: 'Endurance', description: '基础耐力，可以持续数小时，能够边骑边聊天。', color: 'text-emerald-400' },
    { level: 3, name: 'Tempo', description: '有氧节奏，呼吸变得深沉，需要一定的专注度。', color: 'text-yellow-400' },
    { level: 4, name: 'Lactate Threshold', description: '乳酸阈值，感到“灼烧感”，是提升能力的黄金区间。', color: 'text-orange-400' },
    { level: 5, name: 'VO2 Max', description: '最大摄氧量，极度痛苦，通常只能维持 3-8 分钟。', color: 'text-red-400' },
    { level: 6, name: 'Anaerobic Capacity', description: '无氧耐力，短时间高强度冲刺，产生大量乳酸。', color: 'text-purple-400' },
    { level: 7, name: 'Neuromuscular Power', description: '神经肌肉爆发力，纯粹的爆发，持续时间少于 15 秒。', color: 'text-fuchsia-400' },
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
