"use client";

import { useState, useMemo } from "react";
import { calculateFueling, Intensity } from "@/lib/calculators/fueling";
import { useStore } from "@/store/useStore";
import { Fuel, Clock, Gauge } from "lucide-react";

export function FuelCard() {
    const { user } = useStore();
    const [duration, setDuration] = useState(2);
    const [intensity, setIntensity] = useState<Intensity>("tempo");

    const fuel = useMemo(() => calculateFueling({
        durationHours: duration,
        weight: user.weight,
        intensity: intensity
    }), [duration, user.weight, intensity]);

    const intensities: { value: Intensity; label: string }[] = useMemo(() => [
        { value: "social", label: "养生" },
        { value: "tempo", label: "甜区" },
        { value: "threshold", label: "拉爆" },
        { value: "race", label: "竞赛" },
    ], []);

    return (
        <div className="pro-card space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest">补给建议 / Fueling</h2>
                    <p className="text-2xl font-black italic text-slate-100">{fuel.carbs}g <span className="text-sm font-normal text-muted-foreground not-italic">CHO</span></p>
                </div>
                <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-400">
                    <Fuel size={24} />
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground uppercase">
                        <span>骑行时长</span>
                        <span>{duration} 小时</span>
                    </div>
                    <input
                        type="range"
                        min="0.5"
                        max="12"
                        step="0.5"
                        value={duration}
                        onChange={(e) => setDuration(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase">计划强度</p>
                    <div className="flex bg-slate-800 p-1 rounded-lg">
                        {intensities.map((item) => (
                            <button
                                key={item.value}
                                onClick={() => setIntensity(item.value)}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${intensity === item.value
                                    ? "bg-emerald-500 text-white shadow-lg"
                                    : "text-muted-foreground hover:text-white"
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <div className="flex gap-2">
                    <div className="px-3 py-1 bg-slate-800 rounded-full text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {fuel.suggestedGels} 支能量胶
                    </div>
                    <div className="px-3 py-1 bg-slate-800 rounded-full text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {Math.round(fuel.water / 500)} 壶水
                    </div>
                </div>
            </div>
        </div>
    );
}
