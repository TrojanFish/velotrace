"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { Wind, Map, Navigation, ChevronLeft, ChevronRight, Gauge, Shield } from "lucide-react";
import { Skeleton } from "@/lib/utils";
import { decodePolyline, calculateBearing, scoreWindAlignment } from "@/lib/calculators/routeIntel";

interface StravaRoute {
    id: number;
    name: string;
    distance: number;
    elevation: number;
    map: {
        summary_polyline: string;
    };
}

export function RouteWindForecastCard() {
    const { data: session } = useSession();
    const [routes, setRoutes] = useState<StravaRoute[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [windInfo, setWindInfo] = useState<{ speed: number; deg: number; label: string } | null>(null);

    useEffect(() => {
        if (session) {
            setLoading(true);
            fetch("/api/strava/routes")
                .then(res => res.json())
                .then(data => {
                    if (!data.error) setRoutes(data);
                })
                .finally(() => setLoading(false));
        }
    }, [session]);

    useEffect(() => {
        if (routes.length > 0) {
            // 1. Decode polyline to get the starting coordinates of the route
            const decoded = decodePolyline(routes[activeIndex].map.summary_polyline);
            const startPoint = decoded[0] || { lat: 31.23, lng: 121.47 }; // Fallback to SH if no points

            // 2. Fetch real weather for the route's specific location
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${startPoint.lat}&longitude=${startPoint.lng}&current_weather=true`)
                .then(res => res.json())
                .then(data => {
                    const wind = data.current_weather;
                    setWindInfo({
                        speed: wind.windspeed,
                        deg: wind.winddirection,
                        label: getWindDirectionLabel(wind.winddirection)
                    });
                });
        }
    }, [routes, activeIndex]);

    const getWindDirectionLabel = (deg: number) => {
        const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
        return directions[Math.round(deg / 45) % 8];
    };

    const routeAnalysis = useMemo(() => {
        if (!routes.length || !windInfo) return null;
        const current = routes[activeIndex];
        const points = decodePolyline(current.map.summary_polyline);
        if (points.length < 2) return null;

        // Use first and mid point to get general outbound direction
        // Simple heuristic for "outbound" vs "loop"
        const start = points[0];
        const mid = points[Math.floor(points.length / 2)];
        const bearing = calculateBearing(start, mid);

        const alignment = scoreWindAlignment(bearing, windInfo.deg);

        return {
            bearing,
            alignment, // -1 to 1
            percent: Math.round(((alignment + 1) / 2) * 100)
        };
    }, [routes, activeIndex, windInfo]);

    const getAdvice = (score: number, windSpeed: number) => {
        if (windSpeed < 10) return "无风环境：稳定输出节奏，适合长距离耐力训练。";
        if (score > 0.5) return "完美顺风：去程有显著气动增益，回程注意体力分配。";
        if (score > 0) return "微弱顺风：环境舒适，建议保持 30km/h 以上巡航。";
        if (score > -0.5) return "侧风袭扰：注意横风对车身的操控影响，保持重心稳定。";
        return "硬核逆风：战术拉扯期。建议压低身姿，寻找破风编队。";
    };

    if (!session) return null;

    if (loading && routes.length === 0) {
        return (
            <div className="pro-card border-slate-800 bg-slate-900/50 space-y-4 min-h-[160px]">
                <div className="flex justify-between items-center">
                    <Skeleton className="w-32 h-3" />
                    <Skeleton className="w-16 h-4" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="w-48 h-4" />
                    <Skeleton className="w-24 h-2" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="w-full h-16 rounded-xl" />
                    <Skeleton className="w-full h-16 rounded-xl" />
                </div>
            </div>
        );
    }

    if (routes.length === 0) return null;

    const currentRoute = routes[activeIndex];
    if (!currentRoute) return null;

    return (
        <div className="pro-card border-cyan-500/20 bg-cyan-500/5 space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Navigation size={14} className="text-cyan-400" />
                    <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">明日路线巡检</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        disabled={activeIndex === 0}
                        onClick={() => setActiveIndex(i => i - 1)}
                        className="p-1 hover:bg-slate-800 rounded-md disabled:opacity-30"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-[10px] font-mono font-bold">{activeIndex + 1}/{routes.length}</span>
                    <button
                        disabled={activeIndex === routes.length - 1}
                        onClick={() => setActiveIndex(i => i + 1)}
                        className="p-1 hover:bg-slate-800 rounded-md disabled:opacity-30"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="text-sm font-black italic uppercase text-slate-100 truncate">{currentRoute.name}</h3>
                <div className="flex gap-3 text-[10px] text-muted-foreground font-bold uppercase">
                    <span>{currentRoute.distance} KM</span>
                    <span>+{currentRoute.elevation} M爬升</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <Wind size={12} className="text-cyan-400" />
                            <span className="text-[8px] font-bold text-muted-foreground uppercase">气流环境</span>
                        </div>
                        {routeAnalysis && (
                            <div className={`px-1.5 py-0.5 rounded text-[8px] font-black italic ${routeAnalysis.alignment > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                MATCH {routeAnalysis.percent}%
                            </div>
                        )}
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black italic">{windInfo?.label}风</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{windInfo?.speed}km/h</span>
                    </div>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <Shield size={10} className="text-cyan-500" />
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">战术建议</span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-300 leading-[1.3] uppercase italic">
                        {windInfo && getAdvice(routeAnalysis?.alignment || 0, windInfo.speed)}
                    </p>
                </div>
            </div>
        </div>
    );
}
