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
        // Fetch athlete's routes from Strava - using standard current athlete endpoint
        const res = await fetch(`https://www.strava.com/api/v3/athlete/routes`, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Strava API Error (${res.status}):`, errorText);
            return NextResponse.json({
                error: "Strava API Error",
                status: res.status,
                details: errorText
            }, { status: res.status });
        }

        const routes = await res.json();

        // Defensive check: Strava might return a single object or an error message in body
        if (!Array.isArray(routes)) {
            console.error("Strava returned non-array response:", routes);
            return NextResponse.json({ error: "Invalid data format from Strava", data: routes }, { status: 502 });
        }

        if (routes.length === 0) {
            return NextResponse.json({ routes: [] });
        }

        // Standardize the response to include the full list
        const formattedRoutes = routes.map((r: StravaRoute) => ({
            id: r.id_str,
            name: r.name,
            distance: r.distance,
            elevation: r.elevation_gain,
            polyline: r.map?.summary_polyline || "",
            type: r.type,
        }));

        return NextResponse.json({ routes: formattedRoutes });
    } catch (error: any) {
        console.error("Failed to fetch Strava routes:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            message: error.message
        }, { status: 500 });
    }
}
