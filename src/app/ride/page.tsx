"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Timer,
    Wind,
    Utensils,
    X,
    Maximize2,
    Vibrate,
    Pause,
    Play,
    RotateCcw,
    Droplets,
    Trophy,
    Target,
    Zap,
    ChevronRight,
    Settings2
} from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";
import { Intensity } from "@/lib/calculators/fueling";

export default function ActiveRidePage() {
    const router = useRouter();
    const { data: weather } = useWeather();
    const { user } = useStore();

    // Strategy Planning State
    const [isSetup, setIsSetup] = useState(true);
    const [targetDistance, setTargetDistance] = useState(100);
    const [intensity, setIntensity] = useState<Intensity>("tempo");

    // Ride State
    const [isActive, setIsActive] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [fuelingInterval, setFuelingInterval] = useState(45 * 60); // seconds
    const [hydrationInterval, setHydrationInterval] = useState(20 * 60); // seconds

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const wakeLockRef = useRef<any>(null);

    // Reminder States
    const [showReminder, setShowReminder] = useState<'fuel' | 'water' | null>(null);

    // 1. Tactical Strategy Calculation
    const suggestedStrategy = useMemo(() => {
        // Expected speeds for calculation (km/h)
        const speeds: Record<Intensity, number> = {
            social: 22,
            tempo: 30,
            threshold: 35,
            race: 40
        };

        const durationHours = targetDistance / (speeds[intensity] || 30);

        // Carb rates based on user weight and intensity
        const carbRates: Record<Intensity, number> = {
            social: 30,
            tempo: 60,
            threshold: 80,
            race: 95
        };

        const totalCarbs = Math.round(carbRates[intensity] * durationHours);
        const totalWater = Math.round((intensity === 'race' ? 1000 : 600) * durationHours);

        // Suggested intervals in minutes
        const intervals: Record<Intensity, { fuel: number; water: number }> = {
            social: { fuel: 60, water: 30 },
            tempo: { fuel: 45, water: 20 },
            threshold: { fuel: 35, water: 15 },
            race: { fuel: 30, water: 10 }
        };

        return {
            durationHours,
            totalCarbs,
            totalWater,
            fuelInterval: intervals[intensity].fuel,
            waterInterval: intervals[intensity].water
        };
    }, [targetDistance, intensity]);

    // Apply suggested intervals to state when setup is active or intensity changes
    useEffect(() => {
        if (!isActive) {
            setFuelingInterval(suggestedStrategy.fuelInterval * 60);
            setHydrationInterval(suggestedStrategy.waterInterval * 60);
        }
    }, [intensity, isActive, suggestedStrategy]);

    // 2. Timer Logic
    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => {
                    const next = prev + 1;
                    if (next > 0 && next % fuelingInterval === 0) triggerReminder('fuel');
                    if (next > 0 && next % hydrationInterval === 0) triggerReminder('water');
                    return next;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isActive, fuelingInterval, hydrationInterval]);

    // 3. Screen Wake Lock
    const requestWakeLock = async () => {
        try {
            if ('wakeLock' in navigator) {
                wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
            }
        } catch (err) {
            console.error("Wake Lock failed:", err);
        }
    };

    const releaseWakeLock = () => {
        if (wakeLockRef.current) {
            wakeLockRef.current.release();
            wakeLockRef.current = null;
        }
    };

    // 4. Vibration & Alerts
    const triggerReminder = (type: 'fuel' | 'water') => {
        setShowReminder(type);
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 500, 100, 200]);
        }
        if (typeof window !== 'undefined') {
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
            if (AudioContextClass) {
                const audioCtx = new AudioContextClass();
                const oscillator = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                oscillator.connect(gain);
                gain.connect(audioCtx.destination);
                oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
                gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.5);
            }
        }
    };

    const formatTime = (s: number) => {
        const hrs = Math.floor(s / 3600);
        const mins = Math.floor((s % 3600) / 60);
        const secs = s % 60;
        return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartStop = () => {
        if (!isActive) {
            setIsActive(true);
            setIsSetup(false);
            requestWakeLock();
            toast.success("战略部署完毕，骑行开始", {
                icon: <Zap size={16} />,
                position: "bottom-center",
            });
        } else {
            setIsActive(false);
            releaseWakeLock();
        }
    };

    const windAlignment = weather?.windDirection || 0;
    const isHeadwind = weather && weather.windSpeed > 15;

    return (
        <div className="fixed inset-0 bg-[#050810] z-[1000] flex flex-col items-center justify-between p-8 landscape:flex-row overflow-hidden font-sans">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[150px] rounded-full animate-pulse" />
            </div>

            {/* Exit Button */}
            {!isActive && (
                <button
                    onClick={() => router.back()}
                    className="absolute top-12 left-6 p-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all z-50 group"
                >
                    <X size={24} className="group-hover:rotate-90 transition-transform" />
                </button>
            )}

            {/* 1. Tactical Setup Overlay (Before Ride) */}
            <AnimatePresence mode="wait">
                {isSetup && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed inset-0 z-[1100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6"
                    >
                        <div className="w-full max-w-xl space-y-10">
                            <div className="text-center space-y-2">
                                <div className="flex items-center justify-center gap-2 text-cyan-400">
                                    <Target size={20} />
                                    <span className="text-xs font-black uppercase tracking-[0.4em]">Tactical Prep</span>
                                </div>
                                <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">部署骑行战术</h1>
                                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest leading-relaxed">基于 200KM+ 长距离实战方案优化</p>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                {/* Distance Slider */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">目标里程</span>
                                        <span className="text-2xl font-black italic text-cyan-400">{targetDistance} <span className="text-xs">KM</span></span>
                                    </div>
                                    <input
                                        type="range" min="10" max="300" step="5"
                                        value={targetDistance}
                                        onChange={(e) => setTargetDistance(parseInt(e.target.value))}
                                        className="w-full accent-cyan-500"
                                    />
                                </div>

                                {/* Intensity Multi-selector */}
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">作战强度</span>
                                    <div className="grid grid-cols-4 gap-2">
                                        {(['social', 'tempo', 'threshold', 'race'] as Intensity[]).map((i) => (
                                            <button
                                                key={i}
                                                onClick={() => setIntensity(i)}
                                                className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${intensity === i
                                                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                                                        : 'bg-white/5 border-white/5 text-white/40'
                                                    }`}
                                            >
                                                {i === 'social' ? '养生' : i === 'tempo' ? '甜区' : i === 'threshold' ? '拉爆' : '竞赛'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Summary & Fine-tune */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                                        <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">预计耗时</span>
                                        <p className="text-lg font-black italic text-white">{suggestedStrategy.durationHours.toFixed(1)} <span className="text-[10px] opacity-40">HRS</span></p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                                        <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">能量缺口</span>
                                        <p className="text-lg font-black italic text-white">{suggestedStrategy.totalCarbs} <span className="text-[10px] opacity-40">g CHO</span></p>
                                    </div>
                                </div>

                                {/* Manual Fine-tuning */}
                                <div className="pro-card bg-cyan-500/5 border-cyan-500/20 p-5 space-y-4">
                                    <div className="flex items-center gap-2 text-cyan-400">
                                        <Settings2 size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">补给节奏微调</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-[9px] text-white/40 uppercase">能量提醒</span>
                                                <span className="text-xs font-bold text-white">{fuelingInterval / 60}m</span>
                                            </div>
                                            <input
                                                type="range" min="15" max="90" step="5"
                                                value={fuelingInterval / 60}
                                                onChange={(e) => setFuelingInterval(parseInt(e.target.value) * 60)}
                                                className="w-full accent-amber-500 h-1"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-[9px] text-white/40 uppercase">水分提醒</span>
                                                <span className="text-xs font-bold text-white">{hydrationInterval / 60}m</span>
                                            </div>
                                            <input
                                                type="range" min="5" max="45" step="5"
                                                value={hydrationInterval / 60}
                                                onChange={(e) => setHydrationInterval(parseInt(e.target.value) * 60)}
                                                className="w-full accent-blue-500 h-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleStartStop}
                                className="w-full py-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-cyan-500/20 active:scale-95 transition-transform"
                            >
                                <Play size={24} fill="white" />
                                立即进入骑行模式
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. Active Ride Display */}
            {!isSetup && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-12 landscape:space-y-0 landscape:space-x-20 z-10 w-full max-w-6xl mx-auto">
                    {/* Primary Clock */}
                    <div className="text-center space-y-4 relative">
                        <div className="flex items-center justify-center gap-3 text-cyan-400/80">
                            <Timer size={24} className={isActive ? "animate-spin-slow" : ""} />
                            <span className="text-sm font-black uppercase tracking-[0.5em]">Session Live</span>
                        </div>
                        <h1 className="text-[7rem] md:text-[14rem] font-black italic tracking-tighter text-white tabular-nums leading-none drop-shadow-[0_0_60px_rgba(255,255,255,0.05)]">
                            {formatTime(elapsedTime)}
                        </h1>
                    </div>

                    {/* Stats Metrics Grid */}
                    <div className="grid grid-cols-2 gap-6 w-full max-w-2xl px-4">
                        {/* Next Fuel */}
                        <div className="pro-card bg-white/[0.03] border-white/5 p-8 flex flex-col items-center justify-center space-y-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <Utensils size={40} />
                            </div>
                            <div className="flex items-center gap-2 text-amber-500">
                                <Utensils size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Next Fueling</span>
                            </div>
                            <p className="text-5xl font-black italic text-white tabular-nums">
                                {formatTime(fuelingInterval - (elapsedTime % fuelingInterval))}
                            </p>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                                <div
                                    className="h-full bg-amber-500 transition-all duration-1000"
                                    style={{ width: `${(1 - (elapsedTime % fuelingInterval) / fuelingInterval) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Wind Impact */}
                        <div className={`pro-card p-8 flex flex-col items-center justify-center space-y-4 transition-all ${isHeadwind ? 'border-rose-500/40 bg-rose-500/5' : 'border-white/5 bg-white/[0.03]'}`}>
                            <div className={`flex items-center gap-2 ${isHeadwind ? 'text-rose-500' : 'text-cyan-400'}`}>
                                <Wind size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Current Wind</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <p className="text-5xl font-black italic text-white tabular-nums">{weather?.windSpeed?.toFixed(0) || '--'} <span className="text-xs uppercase opacity-40">KMH</span></p>
                                <div className="flex items-center gap-2 mt-2 opacity-50">
                                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase italic">{weather?.windDirection}° NW</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Global Controls */}
            {!isSetup && (
                <div className="w-full max-w-sm mx-auto flex items-center justify-between px-10 py-10 z-10">
                    <button
                        onClick={() => {
                            if (confirm("确定要重置当前计时吗？")) setElapsedTime(0);
                        }}
                        className="p-6 rounded-2xl bg-white/5 border border-white/10 text-white/20 hover:text-white transition-all transform active:scale-90"
                    >
                        <RotateCcw size={28} />
                    </button>

                    <button
                        onClick={handleStartStop}
                        className={`w-28 h-28 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-2xl ${isActive
                            ? 'bg-rose-500/20 text-rose-500 border-2 border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.3)]'
                            : 'bg-emerald-500/20 text-emerald-500 border-2 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)]'
                            }`}
                    >
                        {isActive ? <Pause size={44} strokeWidth={3} /> : <Play size={44} strokeWidth={3} fill="currentColor" />}
                    </button>

                    <button
                        onClick={() => setIsSetup(true)}
                        className="p-6 rounded-2xl bg-white/5 border border-white/10 text-white/20 hover:text-cyan-400 transition-all"
                    >
                        <Settings2 size={28} />
                    </button>
                </div>
            )}

            {/* 4. Full-Screen Reminder Overlays */}
            <AnimatePresence>
                {showReminder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] flex items-center justify-center p-8 bg-black/98 backdrop-blur-3xl"
                        onClick={() => setShowReminder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 40 }}
                            animate={{ scale: 1, y: 0 }}
                            className="flex flex-col items-center text-center space-y-12"
                        >
                            <div className={`w-64 h-64 rounded-full flex items-center justify-center animate-bounce shadow-2xl ${showReminder === 'fuel'
                                    ? 'bg-amber-500/20 text-amber-500 border-4 border-amber-500'
                                    : 'bg-blue-500/20 text-blue-400 border-4 border-blue-400'
                                }`}>
                                {showReminder === 'fuel' ? <Utensils size={100} /> : <Droplets size={100} />}
                            </div>

                            <div className="space-y-6">
                                <h1 className="text-8xl font-black italic text-white uppercase tracking-tighter leading-none">
                                    {showReminder === 'fuel' ? 'TIME TO FUEL!' : 'HYDRATE NOW!'}
                                </h1>
                                <div className="space-y-2">
                                    <p className="text-2xl font-black text-white/50 uppercase tracking-[0.3em]">补给窗口已开启</p>
                                    <div className="h-0.5 w-24 bg-cyan-500 mx-auto rounded-full" />
                                    <p className="text-xl font-bold text-white/80 py-4">
                                        {showReminder === 'fuel'
                                            ? `建议摄入 ${intensity === 'race' ? '60-80g' : '30-40g'} 碳水化合物`
                                            : '建议饮入 200-300ml 电解质水'}
                                    </p>
                                </div>
                            </div>

                            <button className="px-16 py-8 rounded-full bg-white text-black font-black uppercase text-2xl shadow-2xl active:scale-90 transition-transform">
                                进入下一阶段
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
