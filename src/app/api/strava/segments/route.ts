import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. Get last 3 activities
        const actRes = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=3", {
            headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        const activities = await actRes.json();

        if (!activities.length) return NextResponse.json([]);

        // 2. Fetch details for the most recent one to get segments
        const detailRes = await fetch(`https://www.strava.com/api/v3/activities/${activities[0].id}`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        const detail = await detailRes.json();

        const segments = detail.segment_efforts?.slice(0, 5).map((s: any) => ({
            name: s.name,
            rank: s.kom_rank || s.pr_rank || "-",
            time: s.elapsed_time,
            distance: Math.round(s.distance / 100) / 10,
        })) || [];

        return NextResponse.json(segments);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch segments" }, { status: 500 });
    }
}
