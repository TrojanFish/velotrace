import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Get stats for the current week (from Monday)
        const now = new Date();
        const day = now.getDay() || 7; // Monday is 1, Sunday is 7
        const monday = new Date(now.setDate(now.getDate() - day + 1));
        monday.setHours(0, 0, 0, 0);
        const after = Math.floor(monday.getTime() / 1000);

        const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${after}`, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!response.ok) {
            const err = await response.json();
            return NextResponse.json({ error: "Strava API error", details: err }, { status: response.status });
        }

        const activities = await response.json();

        const weeklyDistance = activities.reduce((acc: number, act: any) => acc + (act.distance || 0), 0);
        const weeklyElevation = activities.reduce((acc: number, act: any) => acc + (act.total_elevation_gain || 0), 0);
        const weeklyCount = activities.length;

        return NextResponse.json({
            distance: Math.round(weeklyDistance / 100) / 10, // km
            elevation: Math.round(weeklyElevation), // m
            count: weeklyCount,
        });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fetch Strava stats", details: error.message }, { status: 500 });
    }
}
