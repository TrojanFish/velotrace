"use client";

import { useWeather } from "@/hooks/useWeather";
import { getKitRecommendation } from "@/lib/calculators/kitAdvisor";
import { useStore } from "@/store/useStore";
import { Skeleton } from "@/lib/utils";
import { CloudRain, Wind, Thermometer, Shirt, Droplets } from "lucide-react";

export function WeatherCard() {
    const { data, loading, error } = useWeather();
    const { user } = useStore();

    if (loading) {
        return (
            <div className="pro-card space-y-6 min-h-[240px]">
                <div className="flex justify-between items-start">
                    <div className="space-y-3">
                        <div className="liquid-skeleton w-20 h-3" />
                        <div className="liquid-skeleton w-28 h-8" />
                    </div>
                    <div className="liquid-skeleton w-12 h-12 rounded-2xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="liquid-skeleton w-full h-14 rounded-xl" />
                    <div className="liquid-skeleton w-full h-14 rounded-xl" />
                </div>
                <div className="liquid-divider" />
                <div className="space-y-3">
                    <div className="liquid-skeleton w-24 h-4" />
                    <div className="liquid-skeleton w-full h-10 rounded-xl" />
                </div>
            </div>
        );
    }

    if (error && !data) return (
        <div className="pro-card border-red-500/20 bg-red-500/5 py-10 text-center">
            <div className="liquid-icon danger mx-auto mb-3">
                <CloudRain size={20} />
            </div>
            <p className="text-xs font-bold uppercase text-red-400/80">定位失败，请检查浏览器权限</p>
        </div>
    );
    if (!data) return null;

    const kit = getKitRecommendation({
        temp: data.temp,
        apparentTemp: data.apparentTemp,
        isRainy: data.isRainy,
        isColdRunner: user.isColdRunner
    });

    // Calculate wind strategy
    const windDir = data.windDirection;
    let windAdvice = "侧风";
    if (windDir > 315 || windDir < 45) windAdvice = "北风 (考虑向南骑行)";
    else if (windDir >= 45 && windDir <= 135) windAdvice = "东风 (考虑向西骑行)";
    else if (windDir > 135 && windDir <= 225) windAdvice = "南风 (考虑向北骑行)";
    else windAdvice = "西风 (考虑向东骑行)";

    return (
        <div className="pro-card space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">
                            今日预警
                        </h2>
                        {error && (
                            <span className="liquid-tag warning text-[8px] py-0.5 px-2">
                                DEFAULT
                            </span>
                        )}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="liquid-stat-value text-3xl pr-2">{data.temp}°C</p>
                        <span className="text-sm font-medium text-white/40">体感 {data.apparentTemp}°</span>
                    </div>
                </div>
                <div className="liquid-icon p-3">
                    <Thermometer size={22} />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="liquid-icon p-2">
                        <Wind size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] text-white/40 font-medium">风向策略</p>
                        <p className="text-xs font-semibold text-white/90">{windAdvice}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="liquid-icon success p-2">
                        <Droplets size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] text-white/40 font-medium">降水概率</p>
                        <p className="text-xs font-semibold text-white/90">{data.isRainy ? "有雨 💧" : "干爽 ☀️"}</p>
                    </div>
                </div>
            </div>

            {/* Kit Recommendation */}
            <div className="liquid-divider" />
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="liquid-icon purple p-1.5">
                        <Shirt size={14} />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">建议穿戴</h3>
                </div>

                <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-white/40 font-medium">内层</span>
                        <span className="text-white/90 font-medium">{kit.baseLayer}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-white/40 font-medium">车衣</span>
                        <span className="text-white/90 font-medium">{kit.jersey}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {kit.accessories.map((acc, i) => (
                            <span key={i} className="liquid-tag text-[9px]">
                                {acc}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
