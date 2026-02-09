import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // Slightly longer for batch

    try {
        // 1. Prepare shared headers
        const headers = { Authorization: `Bearer ${session.accessToken}` };

        // 2. Determine Monday for weekly stats
        const now = new Date();
        const day = now.getDay() || 7;
        const monday = new Date(now.setDate(now.getDate() - day + 1));
        monday.setHours(0, 0, 0, 0);
        const after = Math.floor(monday.getTime() / 1000);

        // 3. Batch Fetch using Promise.all
        const [athleteRes, statsRes, routesRes] = await Promise.all([
            fetch("https://www.strava.com/api/v3/athlete", { headers, signal: controller.signal }),
            fetch(`https://www.strava.com/api/v3/athlete/activities?after=${after}`, { headers, signal: controller.signal }),
            fetch("https://www.strava.com/api/v3/athlete/routes", { headers, signal: controller.signal })
        ]);

        // Error checking for each
        if (!athleteRes.ok) throw new Error(`Athlete API Error: ${athleteRes.status}`);

        const athleteData = await athleteRes.json();

        // Parse Stats
        let statsData = { distance: 0, elevation: 0, count: 0 };
        if (statsRes.ok) {
            const activities = await statsRes.json();
            statsData = {
                distance: Math.round(activities.reduce((acc: number, act: { distance?: number }) => acc + (act.distance || 0), 0) / 100) / 10,
                elevation: Math.round(activities.reduce((acc: number, act: { total_elevation_gain?: number }) => acc + (act.total_elevation_gain || 0), 0)),
                count: activities.length
            };
        }

        // Parse Routes
        let routesData = [];
        if (routesRes.ok) {
            const rawRoutes = await routesRes.json();
            routesData = (rawRoutes || []).map((r: { id: string; name?: string; distance?: number; elevation?: number; map?: { summary_polyline?: string } }) => ({
                id: r.id,
                name: r.name || "Unknown Route",
                distance: Math.round((r.distance || 0) / 100) / 10,
                elevation: Math.round(r.elevation || 0),
                polyline: r.map?.summary_polyline || ""
            }));
        }

        // Parse Gear
        const bikes = (athleteData.bikes || []).map((b: { id: string; name?: string; distance?: number; primary?: boolean }) => ({
            id: b.id,
            name: b.name || "Unknown Bike",
            totalDistance: Math.round((b.distance || 0) / 1000),
            primary: !!b.primary,
        }));
        const shoes = (athleteData.shoes || []).map((s: { id: string; name?: string; distance?: number; primary?: boolean }) => ({
            id: s.id,
            name: s.name || "Unknown Shoes",
            totalDistance: Math.round((s.distance || 0) / 1000),
            primary: !!s.primary,
        }));

        return NextResponse.json({
            timestamp: Date.now(),
            athlete: {
                id: athleteData.id,
                username: athleteData.username,
                ftp: athleteData.ftp || null,
                weight: athleteData.weight || null,
                sex: athleteData.sex === 'M' ? 'male' : athleteData.sex === 'F' ? 'female' : 'other',
                bikes: [...bikes, ...shoes],
            },
            stats: statsData,
            routes: routesData
        });

    } catch (error: unknown) {
        const err = error as any;
        const isTimeout = err.name === 'AbortError';
        return NextResponse.json({
            error: isTimeout ? "Batch sync timeout" : "Failed to sync dashboard",
            message: err.message
        }, { status: isTimeout ? 504 : 500 });
    } finally {
        clearTimeout(timeout);
    }
}
