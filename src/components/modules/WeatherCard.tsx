"use client";

import { useWeather } from "@/hooks/useWeather";
import { getKitRecommendation } from "@/lib/calculators/kitAdvisor";
import { useStore } from "@/store/useStore";
import { Skeleton } from "@/lib/utils";
import { converters } from "@/lib/converters";
import { useTranslations } from 'next-intl';
import {
    CloudRain,
    Wind,
    Thermometer,
    Shirt,
    Droplets,
    Sunrise,
    Sunset,
    Zap,
    Sun,
    Waves
} from "lucide-react";

export function WeatherCard() {
    const t = useTranslations('Weather');
    const kitT = useTranslations('Kit');
    const { data, loading, error, refresh } = useWeather();
    const { user } = useStore();
    const unit = user.unitSystem;

    if (loading && !data) {
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
        <div className="pro-card border-red-500/20 bg-red-500/5 py-10 text-center space-y-4">
            <div className="liquid-icon danger mx-auto mb-3">
                <CloudRain size={20} />
            </div>
            <div>
                <p className="text-xs font-bold uppercase text-red-400/80">{t('locationError')}</p>
                <p className="text-[10px] text-white/30 uppercase mt-1">{t('locationRetry')}</p>
            </div>
            <button
                onClick={() => refresh()}
                className="liquid-button-primary py-2 px-6 text-[10px]"
            >
                {t('manualLocation')}
            </button>
        </div>
    );

    if (!data) return null;

    const kit = getKitRecommendation({
        apparentTemp: data.apparentTemp,
        isRainy: data.isRainy,
        isColdRunner: user.isColdRunner
    });

    // UV Index interpretation
    let uvAdvice = t('uv.low');
    let uvColor = "text-emerald-400";
    if (data.uvIndex >= 8) { uvAdvice = t('uv.extreme'); uvColor = "text-purple-400"; }
    else if (data.uvIndex >= 6) { uvAdvice = t('uv.high'); uvColor = "text-red-400"; }
    else if (data.uvIndex >= 3) { uvAdvice = t('uv.medium'); uvColor = "text-amber-400"; }

    return (
        <div className="pro-card space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">
                            {t('title')}
                        </h2>
                        {error && (
                            <span className="liquid-tag warning text-[8px] py-0.5 px-2">
                                DEFAULT
                            </span>
                        )}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="liquid-stat-value text-3xl pr-2">
                            {converters.formatTemp(data.temp, unit)}
                        </p>
                        <span className="text-sm font-medium text-white/40">{t('feelsLike', { temp: converters.formatTemp(data.apparentTemp, unit) })}</span>
                    </div>

                    {/* Meta Row: Sunrise, Sunset, Wind Gusts */}
                    <div className="flex gap-2.5 mt-3 flex-wrap">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                            <Sunrise size={12} className="text-amber-400" />
                            <div className="flex flex-col -space-y-0.5">
                                <span className="text-[6px] font-black text-white/30 uppercase tracking-tighter">Sunrise</span>
                                <span className="text-[11px] font-mono font-black text-white/90">{data.sunrise || "--:--"}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                            <Sunset size={12} className="text-orange-500" />
                            <div className="flex flex-col -space-y-0.5">
                                <span className="text-[6px] font-black text-white/30 uppercase tracking-tighter">Sunset</span>
                                <span className="text-[11px] font-mono font-black text-white/90">{data.sunset || "--:--"}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                            <Zap size={12} className="text-cyan-400" />
                            <div className="flex flex-col -space-y-0.5">
                                <span className="text-[6px] font-black text-white/30 uppercase tracking-tighter">{t('maxGust')}</span>
                                <span className="text-[11px] font-mono font-black text-white/90">
                                    {converters.formatSpeed(data.windGusts, unit)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="liquid-icon p-3">
                    <Thermometer size={22} />
                </div>
            </div>

            {/* Tactical Grid (2x2) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="liquid-icon p-2">
                        <Wind size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] text-white/40 font-medium tracking-tight">{t('windSpeed')}</p>
                        <p className="text-xs font-semibold text-white/90 truncate">
                            {converters.formatSpeed(data.windSpeed, unit)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="liquid-icon success p-2">
                        <Droplets size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] text-white/40 font-medium tracking-tight">{t('precipitation')}</p>
                        <p className="text-xs font-semibold text-white/90">{data.isRainy ? `${t('rainStatus.rainy')} 💧` : `${t('rainStatus.dry')} ☀️`}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="liquid-icon warning p-2">
                        <Sun size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] text-white/40 font-medium tracking-tight">{t('uvIndex')}</p>
                        <p className="text-xs font-semibold text-white/90">
                            {data.uvIndex.toFixed(1)} <span className={`text-[9px] font-black ${uvColor} uppercase ml-1`}>{uvAdvice}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="liquid-icon purple p-2">
                        <Waves size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] text-white/40 font-medium tracking-tight">{t('humidity')}</p>
                        <p className="text-xs font-semibold text-white/90">{data.humidity}% <span className="text-[9px] font-black text-white/30 uppercase ml-1">{data.humidity > 70 ? t('humidityStatus.humid') : t('humidityStatus.comfortable')}</span></p>
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
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">{t('kitSuggestion')}</h3>
                </div>

                <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-white/40 font-medium">{t('baseLayer')}</span>
                        <span className="text-white/90 font-medium">{kitT(kit.baseLayer)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-white/40 font-medium">{t('jersey')}</span>
                        <span className="text-white/90 font-medium">{kitT(kit.jersey)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {kit.accessories.map((acc, i) => (
                            <span key={i} className="liquid-tag text-[9px]">
                                {kitT(acc)}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
