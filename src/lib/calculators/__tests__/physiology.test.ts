import { describe, it, expect } from 'vitest';
import {
    calculateHRZones,
    estimateVO2Max,
    getRiderCategory,
    calculateIdealRacingWeight
} from '../physiology';

describe('Physiology 2.0 Calculators', () => {
    describe('calculateHRZones', () => {
        it('should calculate zones correctly for a 30-year-old with 60bpm resting HR', () => {
            const zones = calculateHRZones(30, 60);
            const maxHR = 208 - Math.round(0.7 * 30); // 187
            const reserve = 187 - 60; // 127

            // Zone 1: [60 + 0.5*127, 60 + 0.6*127] -> [124, 136]
            expect(zones[0].range[0]).toBe(Math.round(60 + 0.5 * reserve));
            expect(zones[4].range[1]).toBe(maxHR);
        });
    });

    describe('estimateVO2Max', () => {
        it('should estimate realistic VO2 Max', () => {
            // MaxHR=190, RestingHR=50 -> 15.3 * (190/50) = 58.14
            const result = estimateVO2Max(190, 50);
            expect(result).toBe(58.1);
        });
    });

    describe('getRiderCategory', () => {
        it('should classify a pro rider correctly', () => {
            // 400W / 65kg = 6.15 W/kg
            expect(getRiderCategory(400, 65, 'male')).toBe('World Tour / Pro');
        });

        it('should classify a novice rider correctly', () => {
            // 150W / 75kg = 2.0 W/kg
            expect(getRiderCategory(150, 75, 'male')).toBe('Recreational');
        });
    });

    describe('calculateIdealRacingWeight', () => {
        it('should return a valid range for 180cm male', () => {
            const result = calculateIdealRacingWeight(180, 'male');
            expect(result.min).toBeGreaterThan(60);
            expect(result.max).toBeLessThan(85);
            expect(result.status).toContain('Hamwi');
        });
    });
});
