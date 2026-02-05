"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { calculateNutrition } from "@/lib/calculators/nutrition";
import { Utensils, Droplets, Zap, Clock, Thermometer, Info } from "lucide-react";

export function NutritionCalculator() {
    const { user } = useStore();

    const [duration, setDuration] = useState(2);
    const [intensity, setIntensity] = useState(60); // %
    const [temp, setTemp] = useState(22);

    const result = useMemo(() => calculateNutrition({
        durationHours: duration,
        intensityPercent: intensity,
        temperature: temp,
        weight: user.weight
    }), [duration, intensity, temp, user.weight]);

    return (
        <div className="pro-card space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">补给战策 (GLYCOTANK)</h2>
                    <p className="text-[10px] text-muted-foreground uppercase mt-1">根据骑行时长与强度规划</p>
                </div>
                <div className="p-2 bg-yellow-500/10 rounded-full text-yellow-500">
                    <Utensils size={20} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-yellow-500">
                        <Zap size={14} />
                        <span className="text-[10px] font-bold uppercase">碳水需求量</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black italic tracking-tighter text-slate-100">{result.totalCarbs}</span>
                        <span className="text-xs font-normal text-muted-foreground not-italic uppercase">g</span>
                    </div>
                    <p className="text-[10px] text-slate-500">约 {result.gelCount} 支能量胶</p>
                </div>
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-blue-400">
                        <Droplets size={14} />
                        <span className="text-[10px] font-bold uppercase">水分需求量</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black italic tracking-tighter text-slate-100">{result.totalFluid}</span>
                        <span className="text-xs font-normal text-muted-foreground not-italic uppercase">ml</span>
                    </div>
                    <p className="text-[10px] text-slate-500">约 {result.bottleCount} standard 支水壶</p>
                </div>
            </div>

            <div className="space-y-5 px-1">
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <div className="flex items-center gap-1"><Clock size={10} /> 骑行时长</div>
                        <span>{duration} 小时</span>
                    </div>
                    <input
                        type="range" min="1" max="8" step="0.5"
                        value={duration} onChange={(e) => setDuration(parseFloat(e.target.value))}
                        className="w-full accent-yellow-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <div className="flex items-center gap-1"><Zap size={10} /> 强度 (RPE)</div>
                        <span>{intensity}% (Z{Math.ceil(intensity / 20)})</span>
                    </div>
                    <input
                        type="range" min="20" max="100" step="5"
                        value={intensity} onChange={(e) => setIntensity(parseInt(e.target.value))}
                        className="w-full accent-yellow-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <div className="flex items-center gap-1"><Thermometer size={10} /> 环境温度</div>
                        <span>{temp} °C</span>
                    </div>
                    <input
                        type="range" min="0" max="40" step="1"
                        value={temp} onChange={(e) => setTemp(parseInt(e.target.value))}
                        className="w-full accent-yellow-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
                    />
                </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex gap-3">
                <Info size={14} className="text-slate-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-normal">
                    {result.needsElectrolytes
                        ? "💧 关键建议：环境炎热或时长过半，建议在水壶中加入电解质片以防抽筋。"
                        : "✅ 本次骑行负荷适中，常规饮水及碳水摄入即可通过。"}
                </p>
            </div>
        </div>
    );
}
