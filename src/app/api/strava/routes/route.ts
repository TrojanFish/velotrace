import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

interface StravaRoute {
    id_str: string;
    name: string;
    distance: number;
    elevation_gain: number;
    map?: {
        summary_polyline: string;
    };
    type: string;
}

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch athlete's routes from Strava
        const res = await fetch(`https://www.strava.com/api/v3/athletes/${session.user?.id || 'me'}/routes`, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!res.ok) {
            throw new Error(`Strava API returned ${res.status}`);
        }

        const routes = await res.json();

        if (routes.length === 0) {
            return NextResponse.json({ message: "No routes found", routes: [] });
        }

        // Standardize the response to include the full list
        const formattedRoutes = routes.map((r: StravaRoute) => ({
            id: r.id_str,
            name: r.name,
            distance: r.distance,
            elevation: r.elevation_gain,
            polyline: r.map?.summary_polyline,
            type: r.type,
        }));

        return NextResponse.json({ routes: formattedRoutes });
    } catch (error) {
        console.error("Failed to fetch Strava routes:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
