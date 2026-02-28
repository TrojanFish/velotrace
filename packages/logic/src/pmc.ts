import { DailyLoad, PMCData } from "@/store/useStore";

/**
 * Performance Management Chart (PMC) Algorithm
 * CTL = Chronic Training Load (Fitness) - 42 day exponentially weighted moving average
 * ATL = Acute Training Load (Fatigue) - 7 day exponentially weighted moving average
 * TSB = Training Stress Balance (Form) = CTL - ATL
 */
export function calculatePMC(loads: DailyLoad[]): PMCData[] {
    if (loads.length === 0) return [];

    // 1. Sort loads by date
    const sortedLoads = [...loads].sort((a, b) => a.date.localeCompare(b.date));

    // 2. Fill gaps with 0 TSS to ensure continuous timeline
    const startDate = new Date(sortedLoads[0].date);
    const endDate = new Date();
    const timeline: Record<string, number> = {};

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        timeline[dateStr] = 0;
    }

    sortedLoads.forEach(l => {
        timeline[l.date] = (timeline[l.date] || 0) + l.tss;
    });

    const dates = Object.keys(timeline).sort();
    const pmc: PMCData[] = [];

    let currentCTL = 0;
    let currentATL = 0;

    const ctlLambda = 2 / (42 + 1);
    const atlLambda = 2 / (7 + 1);

    dates.forEach(date => {
        const tss = timeline[date];

        // Use exponentially weighted moving average formula
        // NewValue = OldValue + (TSS - OldValue) * Lambda
        currentCTL = currentCTL + (tss - currentCTL) * ctlLambda;
        currentATL = currentATL + (tss - currentATL) * atlLambda;

        pmc.push({
            date,
            ctl: Math.round(currentCTL * 10) / 10,
            atl: Math.round(currentATL * 10) / 10,
            tsb: Math.round((currentCTL - currentATL) * 10) / 10
        });
    });

    return pmc;
}
