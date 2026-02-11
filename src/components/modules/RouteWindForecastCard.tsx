"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Wind, Navigation, ChevronLeft, ChevronRight, Shield, MapPin } from "lucide-react";
import { Skeleton } from "@/lib/utils";
import { decodePolyline, calculateBearing, scoreWindAlignment } from "@/lib/calculators/routeIntel";
import { useStore } from "@/store/useStore";
import { useTranslations } from 'next-intl';

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
    const t = useTranslations('RouteWind');
    const { data: session } = useSession();
    const { stravaRoutesCache, setStravaRoutesCache } = useStore();
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(!stravaRoutesCache);
    const [windInfo, setWindInfo] = useState<{ speed: number; deg: number; label: string } | null>(null);

    const routes = (stravaRoutesCache?.data || []) as StravaRoute[];

    const getWindDirectionLabel = useCallback((deg: number) => {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const key = directions[Math.round(deg / 45) % 8];
        return t(`directions.${key}`);
    }, [t]);

    useEffect(() => {
        if (session) {
            // Cache logic: 1 hour fresh
            const isFresh = stravaRoutesCache && (Date.now() - stravaRoutesCache.timestamp < 60 * 60 * 1000);
            if (isFresh) {
                setLoading(false);
                return;
            }

            setLoading(true);
            fetch("/api/strava/routes")
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    return res.text().then(text => text ? JSON.parse(text) : { routes: [] });
                })
                .then(data => {
                    if (data.routes && Array.isArray(data.routes)) {
                        const mappedRoutes = data.routes.map((r: any) => ({
                            id: r.id,
                            name: r.name,
                            distance: Math.round(r.distance / 100) / 10,
                            elevation: Math.round(r.elevation),
                            map: {
                                summary_polyline: r.polyline || ""
                            }
                        }));

                        setStravaRoutesCache({
                            data: mappedRoutes,
                            timestamp: Date.now()
                        });
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch routes:", err);
                })
                .finally(() => setLoading(false));
        }
    }, [session, stravaRoutesCache, setStravaRoutesCache]);

    useEffect(() => {
        if (routes.length > 0) {
            const decoded = decodePolyline(routes[activeIndex].map.summary_polyline);
            const startPoint = decoded[0] || { lat: 31.23, lng: 121.47 };

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
    }, [routes, activeIndex, getWindDirectionLabel]);

    const routeAnalysis = useMemo(() => {
        if (!routes.length || !windInfo) return null;
        const current = routes[activeIndex];
        const points = decodePolyline(current.map.summary_polyline);
        if (points.length < 2) return null;

        const start = points[0];
        const mid = points[Math.floor(points.length / 2)];
        const bearing = calculateBearing(start, mid);

        const alignment = scoreWindAlignment(bearing, windInfo.deg);

        return {
            bearing,
            alignment,
            percent: Math.round(((alignment + 1) / 2) * 100)
        };
    }, [routes, activeIndex, windInfo]);

    const getAdvice = (score: number, windSpeed: number) => {
        if (windSpeed < 10) return t('advice.calm');
        if (score > 0.5) return t('advice.tailwind');
        if (score > 0) return t('advice.lightTailwind');
        if (score > -0.5) return t('advice.crosswind');
        return t('advice.headwind');
    };

    if (!session) return null;

    if (loading && routes.length === 0) {
        return (
            <div className="pro-card space-y-4 min-h-[180px]">
                <div className="flex justify-between items-center">
                    <div className="liquid-skeleton w-32 h-4" />
                    <div className="liquid-skeleton w-16 h-5" />
                </div>
                <div className="space-y-2">
                    <div className="liquid-skeleton w-48 h-5" />
                    <div className="liquid-skeleton w-24 h-3" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="liquid-skeleton w-full h-20 rounded-xl" />
                    <div className="liquid-skeleton w-full h-20 rounded-xl" />
                </div>
            </div>
        );
    }

    if (routes.length === 0) return null;

    const currentRoute = routes[activeIndex];
    if (!currentRoute) return null;

    return (
        <div className="pro-card space-y-5 overflow-hidden relative">
            {/* Subtle Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 opacity-60" />

            {/* Header */}
            <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                    <div className="liquid-icon p-1.5">
                        <Navigation size={12} />
                    </div>
                    <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t('title')}</h2>
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        disabled={activeIndex === 0}
                        onClick={() => setActiveIndex(i => i - 1)}
                        className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors"
                    >
                        <ChevronLeft size={14} className="text-white/60" />
                    </button>
                    <span className="text-[10px] font-mono font-bold text-white/50 min-w-[2.5rem] text-center">{activeIndex + 1}/{routes.length}</span>
                    <button
                        disabled={activeIndex === routes.length - 1}
                        onClick={() => setActiveIndex(i => i + 1)}
                        className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors"
                    >
                        <ChevronRight size={14} className="text-white/60" />
                    </button>
                </div>
            </div>

            {/* Route Info */}
            <div className="space-y-2 relative z-10">
                <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                    <h3 className="text-sm font-bold text-white/90 uppercase truncate leading-tight">{currentRoute.name}</h3>
                </div>
                <div className="flex gap-3 text-[10px] text-white/40 font-bold uppercase ml-5">
                    <span className="liquid-tag text-[8px] py-0.5">{currentRoute.distance} KM</span>
                    <span className="liquid-tag success text-[8px] py-0.5">+{currentRoute.elevation} M</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2 relative z-10">
                {/* Wind Card */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <div className="liquid-icon p-1.5">
                                <Wind size={12} />
                            </div>
                            <span className="text-[8px] font-bold text-white/40 uppercase">{t('env')}</span>
                        </div>
                        {routeAnalysis && (
                            <div className={`liquid-tag ${routeAnalysis.alignment > 0 ? 'success' : 'danger'} text-[7px] py-0.5 px-1.5`}>
                                {t('match', { percent: routeAnalysis.percent })}
                            </div>
                        )}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gradient-cyan">{windInfo?.label}</span>
                        <span className="text-[10px] font-mono text-white/40">{windInfo?.speed}km/h</span>
                    </div>
                </div>

                {/* Advice Card */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col">
                    <div className="flex items-center gap-1.5 mb-2">
                        <div className="liquid-icon success p-1">
                            <Shield size={10} />
                        </div>
                        <span className="text-[8px] font-bold text-white/40 uppercase">{t('tactical')}</span>
                    </div>
                    <p className="text-[9px] font-medium text-white/60 leading-relaxed flex-1">
                        {windInfo && getAdvice(routeAnalysis?.alignment || 0, windInfo.speed)}
                    </p>
                </div>
            </div>
        </div>
    );
}
