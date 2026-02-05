"use client";

import { useState } from "react";
import GpxParser from "gpxparser";
import { Upload, Map as MapIcon, Mountain, Info } from "lucide-react";
import dynamic from "next/dynamic";

const InteractiveRouteMap = dynamic(
    () => import("@/components/ui/InteractiveRouteMap"),
    { ssr: false, loading: () => <div className="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center text-xs text-slate-500">地图加载中...</div> }
);

export function RouteAnalyzer() {
    const [routeInfo, setRouteInfo] = useState<{
        name: string;
        distance: number;
        elevation: number;
        avgSlope: number;
        points: { lat: number; lon: number }[];
    } | null>(null);

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
                    name: track.name || "未命名路线",
                    distance: Math.round(track.distance.total / 100) / 10,
                    elevation: Math.round(track.elevation.pos),
                    avgSlope: Math.round((track.elevation.pos / track.distance.total) * 1000) / 10,
                    points: points
                });
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
                    <p className="text-sm font-bold text-slate-300">上传 GPX 路线文件</p>
                    <p className="text-[10px] text-muted-foreground uppercase mt-1">分析爬升、距离与难度</p>
                </label>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-bold text-cyan-400 italic uppercase">{routeInfo.name}</h3>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">路线分析报告</p>
                        </div>
                        <button onClick={() => setRouteInfo(null)} className="text-[10px] font-bold text-slate-500 hover:text-white uppercase">重新上传</button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <MapIcon size={12} className="text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">总里程</span>
                            </div>
                            <p className="text-sm font-bold text-slate-200">{routeInfo.distance} <span className="text-[10px] font-normal">km</span></p>
                        </div>
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <Mountain size={12} className="text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">总爬升</span>
                            </div>
                            <p className="text-sm font-bold text-slate-200">+{routeInfo.elevation} <span className="text-[10px] font-normal">m</span></p>
                        </div>
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <Mountain size={12} className="text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">平均坡度</span>
                            </div>
                            <p className="text-sm font-bold text-slate-200">{routeInfo.avgSlope} <span className="text-[10px] font-normal">%</span></p>
                        </div>
                    </div>

                    {/* Interactive Route Map */}
                    <div className="w-full aspect-[16/9] bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden group">
                        <InteractiveRouteMap points={routeInfo.points} />
                        <div className="absolute bottom-3 left-3 flex gap-2 z-[400]">
                            <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded text-[8px] font-bold text-slate-400 uppercase">Pro Map Engine</span>
                        </div>
                    </div>

                    <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-lg flex gap-3">
                        <Info size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-cyan-200/60 leading-normal">
                            当前已启用动态交互地图。你可以自由缩放、切换卫星或骑行专用图层。
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
