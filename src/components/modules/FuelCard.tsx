"use client";

import { useState, useMemo } from "react";
import { calculateFueling, Intensity } from "@/lib/calculators/fueling";
import { useStore } from "@/store/useStore";
import { Fuel, Droplet, Cookie } from "lucide-react";

export function FuelCard() {
    const { user } = useStore();
    const [duration, setDuration] = useState(2);
    const [intensity, setIntensity] = useState<Intensity>("tempo");

    const fuel = useMemo(() => calculateFueling({
        durationHours: duration,
        weight: user.weight,
        intensity: intensity
    }), [duration, user.weight, intensity]);

    const intensities: { value: Intensity; label: string; color: string }[] = useMemo(() => [
        { value: "social", label: "养生", color: "from-emerald-400 to-cyan-400" },
        { value: "tempo", label: "甜区", color: "from-cyan-400 to-blue-400" },
        { value: "threshold", label: "拉爆", color: "from-orange-400 to-red-400" },
        { value: "race", label: "竞赛", color: "from-purple-400 to-pink-400" },
    ], []);

    const currentIntensity = intensities.find(i => i.value === intensity);

    return (
        <div className="pro-card space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">补给建议 / Fueling</h2>
                    <div className="flex items-baseline gap-2">
                        <span className="liquid-stat-value text-3xl">{fuel.carbs}g</span>
                        <span className="text-xs font-bold text-white/30 uppercase">CHO</span>
                    </div>
                </div>
                <div className="liquid-icon success p-3">
                    <Fuel size={22} />
                </div>
            </div>

            {/* Duration Slider */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">骑行时长</span>
                    <span className="text-sm font-bold text-gradient-cyan">{duration} 小时</span>
                </div>
                <div className="relative">
                    <input
                        type="range"
                        min="0.5"
                        max="12"
                        step="0.5"
                        value={duration}
                        onChange={(e) => setDuration(parseFloat(e.target.value))}
                        className="w-full"
                    />
                    {/* Progress overlay */}
                    <div
                        className="absolute top-1/2 left-0 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 pointer-events-none -translate-y-1/2 opacity-60"
                        style={{ width: `${((duration - 0.5) / 11.5) * 100}%` }}
                    />
                </div>
            </div>

            {/* Intensity Selector */}
            <div className="space-y-3">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">计划强度</span>
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
                        {fuel.suggestedGels} 支能量胶
                    </div>
                    <div className="liquid-tag">
                        <Droplet size={10} />
                        {Math.round(fuel.water / 500)} 壶水
                    </div>
                </div>
            </div>
        </div>
    );
}
