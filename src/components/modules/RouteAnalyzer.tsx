"use client";

import { useState, useEffect } from "react";
import GpxParser from "gpxparser";
import { Upload, Map as MapIcon, Mountain, Info, Wind } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from 'next-intl';

const InteractiveRouteMap = dynamic(
    () => import("@/components/ui/InteractiveRouteMap"),
    { ssr: false, loading: () => <div className="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center text-xs text-slate-500">Loading...</div> }
);

export function RouteAnalyzer() {
    const t = useTranslations('RouteAnalyzer');
    const [routeInfo, setRouteInfo] = useState<{
        name: string;
        distance: number;
        elevation: number;
        avgSlope: number;
        points: { lat: number; lon: number }[];
    } | null>(null);

    const [wind, setWind] = useState<{ speed: number; deg: number } | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const gpx = new GpxParser();
            gpx.parse(event.target?.result as string);

            const track = gpx.tracks[0];
            if (track) {
                const points = track.points.map(p => ({ lat: p.lat, lon: p.lon }));
                setRouteInfo({
                    name: track.name || t('unnamed'),
                    distance: Math.round(track.distance.total / 100) / 10,
                    elevation: Math.round(track.elevation.pos),
                    avgSlope: Math.round((track.elevation.pos / track.distance.total) * 1000) / 10,
                    points: points
                });

                // Fetch wind for track start point
                fetch(`https://api.open-meteo.com/v1/forecast?latitude=${points[0].lat}&longitude=${points[0].lon}&current_weather=true`)
                    .then(res => res.json())
                    .then(data => {
                        setWind({
                            speed: data.current_weather.windspeed,
                            deg: data.current_weather.winddirection
                        });
                    })
                    .catch(() => setWind({ speed: 15, deg: 240 })); // Fallback
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="pro-card space-y-6">
            {!routeInfo ? (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl p-8 cursor-pointer hover:border-cyan-500/50 transition-colors group">
                    <input type="file" accept=".gpx" className="hidden" onChange={handleFileUpload} />
                    <Upload className="text-slate-500 group-hover:text-cyan-400 mb-2 transition-colors" size={32} />
                    <p className="text-sm font-bold text-slate-300">{t('upload')}</p>
                    <p className="text-[10px] text-muted-foreground uppercase mt-1">{t('uploadDesc')}</p>
                </label>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-bold text-cyan-400 italic uppercase">{routeInfo.name}</h3>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{t('report')}</p>
                        </div>
                        <button onClick={() => { setRouteInfo(null); setWind(null); }} className="text-[10px] font-bold text-slate-500 hover:text-white uppercase transition-colors">{t('reupload')}</button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <MapIcon size={12} className="text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">{t('distance')}</span>
                            </div>
                            <p className="text-sm font-bold text-slate-200">{routeInfo.distance} <span className="text-[10px] font-normal text-white/30">KM</span></p>
                        </div>
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <Mountain size={12} className="text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">{t('elevation')}</span>
                            </div>
                            <p className="text-sm font-bold text-slate-200">+{routeInfo.elevation} <span className="text-[10px] font-normal text-white/30">M</span></p>
                        </div>
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <Mountain size={12} className="text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">{t('slope')}</span>
                            </div>
                            <p className="text-sm font-bold text-slate-200">{routeInfo.avgSlope} <span className="text-[10px] font-normal text-white/30">%</span></p>
                        </div>
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:rotate-12 transition-transform">
                                <Wind size={24} className="text-cyan-400" />
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                                <Wind size={12} className="text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">{t('wind')}</span>
                            </div>
                            <p className="text-sm font-bold text-cyan-400">{wind?.speed || '--'} <span className="text-[10px] font-normal text-white/30">KM/H</span></p>
                        </div>
                    </div>

                    {/* Interactive Route Map */}
                    <div className="w-full aspect-video bg-slate-950 rounded-2xl border border-white/5 relative overflow-hidden group shadow-2xl">
                        <InteractiveRouteMap points={routeInfo.points} windSpeed={wind?.speed} windDeg={wind?.deg} />
                        <div className="absolute bottom-4 left-4 flex gap-2 z-[400]">
                            <span className="px-2 py-1 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded text-[8px] font-black text-white/40 uppercase tracking-widest shadow-lg">DYNAMIC WIND ENGINE v2.0</span>
                        </div>
                    </div>

                    <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl flex items-start gap-4">
                        <div className="p-2 bg-cyan-500/10 rounded-xl flex-shrink-0">
                            <Info size={16} className="text-cyan-400" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-cyan-400">{t('adviceTitle')}</p>
                            <p className="text-[10px] text-white/40 leading-relaxed font-medium">
                                {t.rich('advice', {
                                    span: (chunks) => <span className="text-cyan-400/80">{chunks}</span>
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
