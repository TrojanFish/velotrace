import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { calculateTSS } from "@velotrace/logic";

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
        const afterParam = searchParams.get('after');

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

        // Fetch activities: use provided 'after' or default to 90 days ago
        let afterTimestamp = Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60);
        if (afterParam) {
            afterTimestamp = parseInt(afterParam);
        }

        let allActivities: any[] = [];
        let page = 1;
        const perPage = 200;

        while (true) {
            const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${afterTimestamp}&per_page=${perPage}&page=${page}`, {
                headers: { Authorization: `Bearer ${session.accessToken}` },
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`Activities fetch failed with status ${response.status}`);
            }

            const pageActivities = await response.json();
            if (!pageActivities || pageActivities.length === 0) break;

            allActivities = [...allActivities, ...pageActivities];
            if (pageActivities.length < perPage) break;
            page++;

            // Safety break to prevent infinite loops in case of API issues
            if (page > 10) break;
        }

        // Calculate TSS for each activity using dynamic user FTP
        const dailyLoads = allActivities.map((act: any) => {
            let tss = 0;
            const date = act.start_date_local.split('T')[0];

            if (act.device_watts && act.average_watts) {
                const weightedPower = act.weighted_average_watts || act.average_watts;
                tss = calculateTSS(weightedPower, act.average_watts, currentFtp, act.moving_time);
            } else if (act.suffer_score) {
                // Strava Suffer Score is usually higher than TSS for slow endurance 
                // and lower for short intervals. A 0.85 multiplier is a safer "conservative" 
                // estimate to prevent the "abnormal peaks" mentioned by the user.
                tss = Math.round(act.suffer_score * 0.85);
            } else {
                // Heuristic: ~45 TSS per hour for moderate effort (conservative)
                tss = Math.round((act.moving_time / 3600) * 45);
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
