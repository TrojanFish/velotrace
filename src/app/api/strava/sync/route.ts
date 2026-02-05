import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const response = await fetch("https://www.strava.com/api/v3/athlete", {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch athlete data");
        }

        const data = await response.json();

        // Extract bikes and shoes info
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
            bikes: [...bikes, ...shoes], // Combine as equipment
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to sync with Strava" }, { status: 500 });
    }
}
