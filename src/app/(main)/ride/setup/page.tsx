"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Target,
    Wind,
    Settings2,
    CloudSun,
    AlertTriangle,
    Play,
    Timer,
    ChevronRight
} from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Intensity } from "@/lib/calculators/fueling";

export default function TacticalSetupPage() {
    const router = useRouter();
    const { data: weather } = useWeather();
    const { user } = useStore();

    // Strategy Planning State
    const [targetDistance, setTargetDistance] = useState(100);
    const [intensity, setIntensity] = useState<Intensity>("tempo");
    const [fuelingInterval, setFuelingInterval] = useState(45 * 60);
    const [hydrationInterval, setHydrationInterval] = useState(20 * 60);

    // Load session if exists to sync settings
    useEffect(() => {
        const saved = localStorage.getItem('velotrace_ride_session');
        if (saved) {
            const { fuel, water, distance, level } = JSON.parse(saved);
            setFuelingInterval(fuel);
            setHydrationInterval(water);
            setTargetDistance(distance);
            setIntensity(level);
        }
    }, []);

    // 1. Tactical Strategy Calculation (Personalized + Weather Optimized)
    const suggestedStrategy = useMemo(() => {
        const weight = user?.weight || 70;
        const temp = weather?.apparentTemp || 20;
        const windSpeed = weather?.windSpeed || 0;
        const humidity = weather?.humidity || 50;

        const heatFactor = 1 + Math.max(0, (temp - 22) * 0.05);
        const humidityFactor = 1 + Math.max(0, (humidity - 60) * 0.005);
        const windPenalty = windSpeed > 20 ? 0.88 : (windSpeed > 10 ? 0.95 : 1.0);

        const baseSpeeds: Record<Intensity, number> = {
            social: 22,
            tempo: 30,
            threshold: 35,
            race: 40
        };
        const currentSpeed = baseSpeeds[intensity] * windPenalty;
        const durationHours = targetDistance / currentSpeed;

        const carbRates: Record<Intensity, number> = {
            social: 0.6,
            tempo: 0.9,
            threshold: 1.2,
            race: 1.5
        };

        const hourlyCarbs = carbRates[intensity] * weight;
        const totalCarbs = Math.round(hourlyCarbs * durationHours);

        const baseWaterRate = (intensity === 'race' ? 12 : 8) * weight;
        const weatherAdjustedWaterRate = baseWaterRate * heatFactor * humidityFactor;
        const totalWater = Math.round(weatherAdjustedWaterRate * durationHours);

        const baseIntervals: Record<Intensity, { fuel: number; water: number }> = {
            social: { fuel: 60, water: 30 },
            tempo: { fuel: 45, water: 20 },
            threshold: { fuel: 35, water: 15 },
            race: { fuel: 30, water: 10 }
        };

        const weatherWaterInterval = Math.max(8, Math.round(baseIntervals[intensity].water / (heatFactor * humidityFactor)));

        return {
            durationHours,
            totalCarbs,
            totalWater,
            hourlyCarbs,
            fuelInterval: baseIntervals[intensity].fuel,
            waterInterval: weatherWaterInterval,
            tempImpact: heatFactor > 1.1,
            windImpact: windPenalty < 1.0
        };
    }, [targetDistance, intensity, user?.weight, weather]);

    useEffect(() => {
        setFuelingInterval(suggestedStrategy.fuelInterval * 60);
        setHydrationInterval(suggestedStrategy.waterInterval * 60);
    }, [intensity, suggestedStrategy.fuelInterval, suggestedStrategy.waterInterval]);

    const handleCommitAndStart = () => {
        // Save to session
        const session = localStorage.getItem('velotrace_ride_session');
        let currentTime = 0;
        if (session) {
            const parsed = JSON.parse(session);
            currentTime = parsed.time || 0;
        }

        localStorage.setItem('velotrace_ride_session', JSON.stringify({
            time: currentTime,
            active: true,
            fuel: fuelingInterval,
            water: hydrationInterval,
            distance: targetDistance,
            level: intensity
        }));

        router.push('/ride');
    };

    const handleCancel = () => {
        router.push('/');
    };

    return (
        <main className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-3">
                <div className="flex items-center gap-2 text-cyan-400">
                    <Target size={20} />
                    <span className="text-xs font-black uppercase tracking-[0.4em]">Tactical Prep</span>
                </div>
                <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">部署骑行战术</h1>
                <div className="flex items-center gap-4 mt-2">
                    <p className="text-[10px] text-white/30 uppercase font-black tracking-widest leading-relaxed">
                        基于 {user?.weight}kg 体重
                    </p>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                        <CloudSun size={12} />
                        当日天气已对齐
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8">
                {/* Distance Slider */}
                <div className="pro-card space-y-5 bg-white/[0.02] border-white/5 p-6">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">目标里程</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black italic text-white">{targetDistance}</span>
                                <span className="text-xs font-bold text-white/40 uppercase">KM</span>
                            </div>
                        </div>
                    </div>
                    <input
                        type="range" min="10" max="300" step="5"
                        value={targetDistance}
                        onChange={(e) => setTargetDistance(parseInt(e.target.value))}
                        className="w-full accent-cyan-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                </div>

                {/* Intensity Selection */}
                <div className="pro-card space-y-5 bg-white/[0.02] border-white/5 p-6">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">作战强度 / Intensity</span>
                    <div className="grid grid-cols-2 gap-3">
                        {(['social', 'tempo', 'threshold', 'race'] as Intensity[]).map((i) => (
                            <button
                                key={i}
                                onClick={() => setIntensity(i)}
                                className={`py-4 rounded-2xl text-xs font-black uppercase transition-all border-2 flex flex-col items-center gap-2 ${intensity === i
                                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.15)]'
                                    : 'bg-white/5 border-transparent text-white/30'
                                    }`}
                            >
                                <span className="tracking-widest">{i === 'social' ? '养生' : i === 'tempo' ? '甜区' : i === 'threshold' ? '拉爆' : '竞赛'}</span>
                                <span className="text-[8px] opacity-60 italic">{i}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Strategy Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className={`pro-card bg-white/[0.02] border p-5 flex flex-col justify-between h-32 ${suggestedStrategy.windImpact ? 'border-amber-500/30' : 'border-white/5'}`}>
                        <div className="flex justify-between items-start">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">预计耗时</span>
                            <Timer size={14} className="text-white/20" />
                        </div>
                        <p className="text-3xl font-black italic text-white">
                            {suggestedStrategy.durationHours.toFixed(1)}<span className="text-xs ml-1 opacity-40">H</span>
                        </p>
                    </div>
                    <div className={`pro-card bg-white/[0.02] border p-5 flex flex-col justify-between h-32 ${suggestedStrategy.tempImpact ? 'border-orange-500/30' : 'border-white/5'}`}>
                        <div className="flex justify-between items-start">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">水分补给</span>
                            <AlertTriangle size={14} className="text-white/20" />
                        </div>
                        <p className="text-3xl font-black italic text-white">
                            {suggestedStrategy.totalWater > 1000 ? (suggestedStrategy.totalWater / 1000).toFixed(1) : suggestedStrategy.totalWater}
                            <span className="text-xs ml-1 opacity-40">{suggestedStrategy.totalWater > 1000 ? 'L' : 'ML'}</span>
                        </p>
                    </div>
                </div>

                {/* Fine-tuning */}
                <div className="pro-card bg-gradient-to-br from-white/[0.04] to-transparent border-white/10 p-6 space-y-6">
                    <div className="flex items-center gap-2 text-cyan-400/80">
                        <Settings2 size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">战术补给细节微调</span>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-white/40 uppercase tracking-widest">能量摄入频率</span>
                                <span className="text-sm font-black text-white tabular-nums">{fuelingInterval / 60}m</span>
                            </div>
                            <input
                                type="range" min="15" max="90" step="5"
                                value={fuelingInterval / 60}
                                onChange={(e) => setFuelingInterval(parseInt(e.target.value) * 60)}
                                className="w-full accent-amber-500 h-1 bg-white/5 rounded-full appearance-none"
                            />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-white/40 uppercase tracking-widest">水分摄入频率</span>
                                <span className="text-sm font-black text-cyan-400 tabular-nums">{hydrationInterval / 60}m</span>
                            </div>
                            <input
                                type="range" min="5" max="45" step="5"
                                value={hydrationInterval / 60}
                                onChange={(e) => setHydrationInterval(parseInt(e.target.value) * 60)}
                                className="w-full accent-blue-500 h-1 bg-white/5 rounded-full appearance-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 pb-12 flex gap-4">
                <button
                    onClick={handleCancel}
                    className="flex-1 py-5 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-black uppercase tracking-widest active:scale-95 transition-all text-sm"
                >
                    取消
                </button>
                <button
                    onClick={handleCommitAndStart}
                    className="flex-[2] py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(6,182,212,0.3)] active:scale-95 transition-all text-sm"
                >
                    <Play size={20} fill="white" />
                    立即进入骑行
                </button>
            </div>

            <p className="text-center text-[8px] font-black text-white/10 uppercase tracking-[1em] animate-pulse">
                VELOTRACE TACTICAL CORE v3.1
            </p>
        </main>
    );
}
