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
            console.error("Strava Sync Error:", response.status, errorMsg);
            throw new Error(`Failed to fetch athlete data: ${response.status}`);
        }

        const data = await response.json();

        // Sync gear: Combine bikes and shoes into a unified equipment list
        const bikes = data.bikes?.map((b: any) => ({
            id: b.id,
            name: b.name,
            totalDistance: Math.round(b.distance / 1000),
            primary: b.primary,
        })) || [];

        const shoes = data.shoes?.map((s: any) => ({
            id: s.id,
            name: s.name,
            totalDistance: Math.round(s.distance / 1000),
            primary: s.primary,
        })) || [];

        return NextResponse.json({
            ftp: data.ftp,
            weight: data.weight,
            sex: data.sex === 'M' ? 'male' : data.sex === 'F' ? 'female' : 'other',
            bikes: [...bikes, ...shoes],
        });
    } catch (error: any) {
        const isTimeout = error.name === 'AbortError';
        return NextResponse.json({
            error: isTimeout ? "Sync timeout" : "Failed to sync with Strava"
        }, { status: isTimeout ? 504 : 500 });
    } finally {
        clearTimeout(timeout);
    }
}
