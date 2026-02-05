import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { calculateTSS } from "@/lib/calculators/activityInsight";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch athlete's FTP first (if available in profile)
        // Note: Strava V3 doesn't explicitly give current FTP in profile easily for all users,
        // We might need to assume a default or use the one from our store via query params,
        // but for PMC we need to calculate TSS for 200+ activities.

        // Let's get the weight to help with power estimation if needed
        const athleteRes = await fetch("https://www.strava.com/api/v3/athlete", {
            headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        const athlete = await athleteRes.json();
        const weight = athlete.weight || 70;

        // Fetch activities from the last 90 days (approx 3 months of history for CTL)
        const ninetyDaysAgo = Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60);

        const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${ninetyDaysAgo}&per_page=200`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch history");
        }

        const activities = await response.json();

        // Calculate TSS for each activity
        // We'll use a heuristic for activities without power (based on suffer_score if available, or just intensity)
        const dailyLoads = activities.map((act: any) => {
            let tss = 0;
            const date = act.start_date_local.split('T')[0];

            if (act.device_watts && act.average_watts) {
                // Use power-based TSS estimation
                // For history we use weighted_average_watts if available
                const weightedPower = act.weighted_average_watts || act.average_watts;
                // Note: We don't have the user's past FTP history, so we use current FTP
                // This is a common limitation of simple analytics
                tss = calculateTSS(weightedPower, act.average_watts, 200, act.moving_time);
            } else if (act.suffer_score) {
                // Suffer Score is Strava's heart-rate based load
                // Approx 1 point of Suffer Score ≈ 1 TSS (very rough heuristic)
                tss = act.suffer_score;
            } else {
                // Fallback to time/distance based estimation
                // ~50 TSS per hour for moderate effort
                tss = (act.moving_time / 3600) * 50;
            }

            return { date, tss };
        });

        return NextResponse.json({
            dailyLoads,
            weight
        });
    } catch (error: any) {
        return NextResponse.json({ error: "History sync failed", details: error.message }, { status: 500 });
    }
}
