import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const response = await fetch("https://www.strava.com/api/v3/athlete/routes", {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!response.ok) {
            // Fallback or log error
            return NextResponse.json({ error: "Failed to fetch routes" }, { status: response.status });
        }

        const routes = await response.json();

        const formattedRoutes = routes.map((r: any) => ({
            id: r.id,
            name: r.name,
            distance: Math.round(r.distance / 100) / 10,
            elevation: Math.round(r.elevation_gain),
            map: r.map, // Contains summary_polyline
        }));

        return NextResponse.json(formattedRoutes);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch Strava routes" }, { status: 500 });
    }
}
