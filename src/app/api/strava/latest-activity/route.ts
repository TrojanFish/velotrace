import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. Get the very latest activity
        const actRes = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=1", {
            headers: { Authorization: `Bearer ${session.accessToken}` },
        });

        if (!actRes.ok) {
            const err = await actRes.json();
            console.error("Strava API error:", err);
            return NextResponse.json({ error: "Strava API error", details: err }, { status: actRes.status });
        }

        const activities = await actRes.json();

        if (!activities || !activities.length) {
            return NextResponse.json({ error: "No activities found", count: 0 }, { status: 200 }); // Return 200 with empty state
        }

        const latest = activities[0];

        // 2. Fetch full details (for power/hr peaks if available)
        const detailRes = await fetch(`https://www.strava.com/api/v3/activities/${latest.id}`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
        });

        if (!detailRes.ok) {
            return NextResponse.json({ error: "Failed to fetch activity details" }, { status: detailRes.status });
        }

        const detail = await detailRes.json();

        // 3. Construct the insight data
        return NextResponse.json({
            id: detail.id,
            name: detail.name,
            startTime: detail.start_date_local,
            distance: detail.distance, // meters
            movingTime: detail.moving_time, // seconds
            elapsedTime: detail.elapsed_time,
            totalElevationGain: detail.total_elevation_gain,
            averagePower: detail.device_watts ? detail.average_watts : 0,
            maxPower: detail.device_watts ? detail.max_watts : 0,
            weightedAveragePower: detail.weighted_average_watts || 0,
            kilojoules: detail.kilojoules || 0,
            averageHeartrate: detail.average_heartrate || 0,
            maxHeartrate: detail.max_heartrate || 0,
            calories: detail.calories || 0,
            type: detail.type,
            averageSpeed: detail.average_speed,
            maxSpeed: detail.max_speed,
            hasPower: detail.device_watts || false,
        });
    } catch (error: unknown) {
        console.error("Latest activity API internal error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: "Failed to fetch latest activity", details: message }, { status: 500 });
    }
}
