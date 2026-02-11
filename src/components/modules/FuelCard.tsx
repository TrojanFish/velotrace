"use client";

import { useState, useMemo } from "react";
import { calculateFueling, Intensity } from "@/lib/calculators/fueling";
import { useStore } from "@/store/useStore";
import { Fuel, Droplet, Cookie } from "lucide-react";
import { useTranslations } from 'next-intl';

export function FuelCard() {
    const t = useTranslations('Fuel');
    const { user } = useStore();
    const [duration, setDuration] = useState(2);
    const [intensity, setIntensity] = useState<Intensity>("tempo");

    const fuel = useMemo(() => calculateFueling({
        durationHours: duration,
        weight: user.weight,
        intensity: intensity
    }), [duration, user.weight, intensity]);

    const intensities: { value: Intensity; label: string; color: string }[] = useMemo(() => [
        { value: "social", label: t('intensities.social'), color: "from-emerald-400 to-cyan-400" },
        { value: "tempo", label: t('intensities.tempo'), color: "from-cyan-400 to-blue-400" },
        { value: "threshold", label: t('intensities.threshold'), color: "from-orange-400 to-red-400" },
        { value: "race", label: t('intensities.race'), color: "from-purple-400 to-pink-400" },
    ], [t]);

    const currentIntensity = intensities.find(i => i.value === intensity);

    return (
        <div className="pro-card space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">{t('title')}</h2>
                    <div className="flex items-baseline gap-2">
                        <span className="liquid-stat-value text-3xl">{fuel.carbs}g</span>
                        <span className="text-xs font-bold text-white/30 uppercase">{t('carbs')}</span>
                    </div>
                </div>
                <div className="liquid-icon success p-3">
                    <Fuel size={22} />
                </div>
            </div>

            {/* Duration Slider */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{t('duration')}</span>
                    <span className="text-sm font-bold text-gradient-cyan">{t('hours', { duration })}</span>
                </div>
                <div className="relative h-6 flex items-center">
                    <input
                        type="range"
                        min="0.5"
                        max="12"
                        step="0.5"
                        value={duration}
                        onChange={(e) => setDuration(parseFloat(e.target.value))}
                        className="w-full relative z-10"
                    />
                    {/* Progress overlay */}
                    <div
                        className="absolute left-0 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 pointer-events-none opacity-60 transition-all"
                        style={{ width: `${((duration - 0.5) / 11.5) * 100}%` }}
                    />
                </div>
            </div>

            {/* Intensity Selector */}
            <div className="space-y-3">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{t('intensity')}</span>
                <div className="liquid-segment">
                    {intensities.map((item) => (
                        <button
                            key={item.value}
                            onClick={() => setIntensity(item.value)}
                            className={`liquid-segment-button ${intensity === item.value ? 'active' : ''}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Footer */}
            <div className="liquid-divider" />
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <div className="liquid-tag success">
                        <Cookie size={10} />
                        {t('gels', { count: fuel.suggestedGels })}
                    </div>
                    <div className="liquid-tag">
                        <Droplet size={10} />
                        {t('water', { amount: Math.ceil(fuel.water / 500) })}
                    </div>
                </div>
            </div>
        </div>
    );
}
