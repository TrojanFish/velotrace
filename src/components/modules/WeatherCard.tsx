"use client";

import { useWeather } from "@/hooks/useWeather";
import { getKitRecommendation } from "@/lib/calculators/kitAdvisor";
import { useStore } from "@/store/useStore";
import { Skeleton } from "@/lib/utils";
import { CloudRain, Wind, Thermometer, Shirt } from "lucide-react";

export function WeatherCard() {
    const { data, loading, error } = useWeather();
    const { user } = useStore();

    if (loading) {
        return (
            <div className="pro-card space-y-6 min-h-[220px]">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <Skeleton className="w-16 h-3" />
                        <Skeleton className="w-24 h-8" />
                    </div>
                    <Skeleton className="w-10 h-10 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="w-full h-12 rounded-lg" />
                    <Skeleton className="w-full h-12 rounded-lg" />
                </div>
                <div className="pt-4 border-t border-slate-800 space-y-2">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-full h-8" />
                </div>
            </div>
        );
    }

    if (error || !data) return <div className="pro-card text-red-500 border-red-500/20 bg-red-500/5 py-8 text-center text-xs font-bold uppercase">定位失败，请检查浏览器权限。</div>;

    const kit = getKitRecommendation({
        temp: data.temp,
        apparentTemp: data.apparentTemp,
        isRainy: data.isRainy,
        isColdRunner: user.isColdRunner
    });

    // Calculate wind strategy
    const windDir = data.windDirection; // 0-360
    let windAdvice = "侧风";
    if (windDir > 315 || windDir < 45) windAdvice = "北风 (考虑向南骑行)";
    else if (windDir >= 45 && windDir <= 135) windAdvice = "东风 (考虑向西骑行)";
    else if (windDir > 135 && windDir <= 225) windAdvice = "南风 (考虑向北骑行)";
    else windAdvice = "西风 (考虑向东骑行)";

    return (
        <div className="pro-card space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">今日预警</h2>
                    <p className="text-2xl font-bold flex items-center gap-2">
                        {data.temp}°C
                        <span className="text-sm font-normal text-muted-foreground">(体感 {data.apparentTemp}°)</span>
                    </p>
                </div>
                <div className="p-2 bg-cyan-500/10 rounded-full text-cyan-400">
                    <Thermometer size={24} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg text-blue-400">
                        <Wind size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">风向策略</p>
                        <p className="text-sm font-medium">{windAdvice}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg text-emerald-400">
                        <CloudRain size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">降水概率</p>
                        <p className="text-sm font-medium">{data.isRainy ? "有雨" : "干爽"}</p>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                    <Shirt size={16} className="text-cyan-400" />
                    <h3 className="text-sm font-semibold uppercase tracking-tight">建议穿戴</h3>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">内层</span>
                        <span>{kit.baseLayer}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">车衣</span>
                        <span>{kit.jersey}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                        {kit.accessories.map((acc, i) => (
                            <span key={i} className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-md text-[10px] font-bold uppercase">
                                {acc}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
