import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { calculateTSS } from "@/lib/calculators/activityInsight";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Timeout Controller for external requests
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
        const searchParams = req.nextUrl.searchParams;
        const requestedFtp = Number(searchParams.get('ftp'));

        // Fetch athlete to get current context (weight, and Strava's FTP if available)
        const athleteRes = await fetch("https://www.strava.com/api/v3/athlete", {
            headers: { Authorization: `Bearer ${session.accessToken}` },
            signal: controller.signal
        });

        if (!athleteRes.ok) throw new Error("Athlete fetch failed");

        const athlete = await athleteRes.json();
        const weight = athlete.weight || 70;
        // Use requested FTP (from store), then Strava FTP, then fallback
        const currentFtp = requestedFtp || athlete.ftp || 200;

        // Fetch activities from the last 90 days for CTL calculation
        const ninetyDaysAgo = Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60);

        const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${ninetyDaysAgo}&per_page=200`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error("Activities fetch failed");
        }

        const activities = await response.json();

        // Calculate TSS for each activity using dynamic user FTP
        const dailyLoads = activities.map((act: any) => {
            let tss = 0;
            const date = act.start_date_local.split('T')[0];

            if (act.device_watts && act.average_watts) {
                const weightedPower = act.weighted_average_watts || act.average_watts;
                // VITAL FIX: Use the actual current user FTP instead of hardcoded 200
                tss = calculateTSS(weightedPower, act.average_watts, currentFtp, act.moving_time);
            } else if (act.suffer_score) {
                tss = act.suffer_score;
            } else {
                // Heuristic: ~50 TSS per hour for moderate effort
                tss = (act.moving_time / 3600) * 50;
            }

            return { date, tss };
        });

        return NextResponse.json({
            dailyLoads,
            weight,
            usedFtp: currentFtp
        });
    } catch (error: any) {
        const isTimeout = error.name === 'AbortError';
        return NextResponse.json({
            error: isTimeout ? "Request timeout" : "History sync failed",
            status: isTimeout ? 504 : 500
        }, { status: isTimeout ? 504 : 500 });
    } finally {
        clearTimeout(timeout);
    }
}
