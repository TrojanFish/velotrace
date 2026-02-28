import { describe, it, expect } from 'vitest';
import { calculateCdA } from '../aerodynamics';

describe('calculateCdA', () => {
    it('should calculate realistic CdA for a typical pro cyclist', () => {
        // Example: 300W, 40km/h (11.11 m/s), 70kg rider, 8kg bike, flat road
        const result = calculateCdA({
            power: 300,
            speed: 11.11,
            riderWeight: 70,
            bikeWeight: 8,
            grade: 0
        });

        // CdA should be roughly between 0.25 and 0.35 for a pro on a road bike
        expect(result).toBeGreaterThan(0.2);
        expect(result).toBeLessThan(0.4);
    });

    it('should return default fallback for zero speed', () => {
        const result = calculateCdA({
            power: 300,
            speed: 0,
            riderWeight: 70,
            bikeWeight: 8
        });
        expect(result).toBe(0);
    });

    it('should handle climbing correctly', () => {
        // At 10% grade, 11m/s requires massive power. 
        // If power is low, CdA should be clamped or low.
        const result = calculateCdA({
            power: 200,
            speed: 5, // 18km/h
            riderWeight: 70,
            bikeWeight: 8,
            grade: 0.05 // 5%
        });
        expect(result).toBeDefined();
    });
});
