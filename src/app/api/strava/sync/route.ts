import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Timeout Controller
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch("https://www.strava.com/api/v3/athlete", {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
            signal: controller.signal
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            console.error("Strava API Error:", response.status, errorMsg);

            // If it's 401, the user needs to re-login
            if (response.status === 401) {
                return NextResponse.json({
                    error: "Strava session expired",
                    reauth: true
                }, { status: 401 });
            }

            return NextResponse.json({
                error: `Strava API returned ${response.status}`,
                details: errorMsg.slice(0, 100)
            }, { status: response.status });
        }

        const data = await response.json();

        // Safety check for critical data
        if (!data || typeof data !== 'object') {
            throw new Error("Invalid response from Strava");
        }

        // Sync gear: Combine bikes and shoes into a unified equipment list
        const bikes = (data.bikes || []).map((b: any) => ({
            id: b.id,
            name: b.name || "Unknown Bike",
            totalDistance: Math.round((b.distance || 0) / 1000),
            primary: !!b.primary,
        }));

        const shoes = (data.shoes || []).map((s: any) => ({
            id: s.id,
            name: s.name || "Unknown Shoes",
            totalDistance: Math.round((s.distance || 0) / 1000),
            primary: !!s.primary,
        }));

        return NextResponse.json({
            ftp: data.ftp || null,
            weight: data.weight || null,
            sex: data.sex === 'M' ? 'male' : data.sex === 'F' ? 'female' : 'other',
            bikes: [...bikes, ...shoes],
        });
    } catch (error: any) {
        const isTimeout = error.name === 'AbortError';
        console.error("Sync Catch Block:", error);

        return NextResponse.json({
            error: isTimeout ? "Sync timeout" : "Failed to sync with Strava",
            message: error.message
        }, { status: isTimeout ? 504 : 500 });
    } finally {
        clearTimeout(timeout);
    }
}
