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
    Settings2,
    CloudSun,
    AlertTriangle
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

    // Ride State - Persistent
    const [isActive, setIsActive] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [fuelingInterval, setFuelingInterval] = useState(45 * 60); // seconds
    const [hydrationInterval, setHydrationInterval] = useState(20 * 60); // seconds

    // Add session persistence for timer
    useEffect(() => {
        const saved = localStorage.getItem('velotrace_ride_session');
        if (saved) {
            const { time, active, fuel, water, distance, level } = JSON.parse(saved);
            setElapsedTime(time);
            setIsActive(active);
            setFuelingInterval(fuel);
            setHydrationInterval(water);
            setTargetDistance(distance);
            setIntensity(level);
            if (active) setIsSetup(false);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('velotrace_ride_session', JSON.stringify({
            time: elapsedTime,
            active: isActive,
            fuel: fuelingInterval,
            water: hydrationInterval,
            distance: targetDistance,
            level: intensity
        }));
    }, [elapsedTime, isActive, fuelingInterval, hydrationInterval, targetDistance, intensity]);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const wakeLockRef = useRef<any>(null);

    // Prefetch Home for smoother exit
    useEffect(() => {
        router.prefetch('/');
    }, [router]);

    // Reminder States
    const [showReminder, setShowReminder] = useState<'fuel' | 'water' | null>(null);

    // 1. Tactical Strategy Calculation (Personalized + Weather Optimized)
    const suggestedStrategy = useMemo(() => {
        const weight = user?.weight || 70;

        // --- Weather Compensation Factors ---
        const temp = weather?.apparentTemp || 20;
        const windSpeed = weather?.windSpeed || 0;
        const humidity = weather?.humidity || 50;

        // 🌡️ Heat Factor: Hydration needs spike above 25°C apparent temp
        const heatFactor = 1 + Math.max(0, (temp - 22) * 0.05); // 5% increase per degree above 22°C

        // 💧 Humidity Factor: Affects sweat evaporation efficiency
        const humidityFactor = 1 + Math.max(0, (humidity - 60) * 0.005);

        // 💨 Aerodynamic Resistance Factor (Simple Heuristic)
        // High winds (>20km/h) increase energy expenditure and duration
        const windPenalty = windSpeed > 20 ? 0.88 : (windSpeed > 10 ? 0.95 : 1.0);

        // Expected speeds (km/h) with wind compensation
        const baseSpeeds: Record<Intensity, number> = {
            social: 22,
            tempo: 30,
            threshold: 35,
            race: 40
        };
        const currentSpeed = baseSpeeds[intensity] * windPenalty;
        const durationHours = targetDistance / currentSpeed;

        /**
         * Personalized Carb Strategy (g/kg/hr):
         * Heavily affected by intensity and ambient temperature (energy for cooling)
         */
        const carbRates: Record<Intensity, number> = {
            social: 0.6,
            tempo: 0.9,
            threshold: 1.2,
            race: 1.5
        };

        const hourlyCarbs = carbRates[intensity] * weight;
        const totalCarbs = Math.round(hourlyCarbs * durationHours);

        // Water base: 8-12ml per kg per hour, scaled by weather
        const baseWaterRate = (intensity === 'race' ? 12 : 8) * weight;
        const weatherAdjustedWaterRate = baseWaterRate * heatFactor * humidityFactor;
        const totalWater = Math.round(weatherAdjustedWaterRate * durationHours);

        // Suggested intervals (Scaled by weather intensity)
        // If it's hot, we shorten the hydration interval
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

    // Apply suggested intervals to state when setup is active or intensity changes
    useEffect(() => {
        if (isSetup) {
            setFuelingInterval(suggestedStrategy.fuelInterval * 60);
            setHydrationInterval(suggestedStrategy.waterInterval * 60);
        }
    }, [intensity, isSetup, suggestedStrategy.fuelInterval, suggestedStrategy.waterInterval]);

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
        if (holdTimerRef.current) stopHold();
        if (wakeLockRef.current) {
            wakeLockRef.current.release();
            wakeLockRef.current = null;
        }
    };

    // 4. Vibration, Voice & Auto-dismiss Alerts
    const autoDismissRef = useRef<NodeJS.Timeout | null>(null);

    const triggerReminder = (type: 'fuel' | 'water') => {
        // Clear any pending auto-dismiss
        if (autoDismissRef.current) clearTimeout(autoDismissRef.current);

        setShowReminder(type);

        // 🔊 1. Voice Synthesis (TTS) - Crucial for "Back-pocket" racing
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const message = type === 'fuel'
                ? "战术提醒：补给时间到，请摄入碳水化合物或能量胶。"
                : "骑行提醒：请补充水分，保持体液平衡。";
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.lang = 'zh-CN';
            utterance.rate = 1.0;
            window.speechSynthesis.speak(utterance);
        }

        // 📳 2. Vibration
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 500, 100, 200, 100, 500]);
        }

        // 🎵 3. Audio Fallback (Beep)
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
                oscillator.stop(audioCtx.currentTime + 0.8);
            }
        }

        // 🕒 4. Auto-dismiss Logic - Prevents UI from getting stuck in pocket
        autoDismissRef.current = setTimeout(() => {
            setShowReminder(null);
        }, 20000); // Auto-close after 20 seconds
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
            toast.error("骑行已暂停", { position: "bottom-center" });
        }
    };

    const handleExit = () => {
        if (isActive && !confirm("骑行正在进行中，确认要退出吗？数据将会暂停。")) {
            return;
        }
        // Use prefetch or direct push to make it smoother
        router.push('/');
    };

    const handleCommitStrategy = () => {
        if (!isActive) {
            handleStartStop();
        } else {
            setIsSetup(false);
            toast.success("战术节奏已更新", {
                icon: <Zap size={16} />,
                position: "bottom-center"
            });
        }
    };

    // Long Press Reset Logic
    const [holdProgress, setHoldProgress] = useState(0);
    const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

    const startHold = () => {
        if (holdTimerRef.current) return;
        setHoldProgress(0);
        const startTime = Date.now();
        const duration = 1500; // 1.5 seconds to reset

        holdTimerRef.current = setInterval(() => {
            const now = Date.now();
            const p = Math.min(((now - startTime) / duration) * 100, 100);
            setHoldProgress(p);

            if (p >= 100) {
                stopHold();
                setElapsedTime(0);
                toast.success("数据已清零", { position: "bottom-center" });
                if ('vibrate' in navigator) navigator.vibrate(100);
            }
        }, 16);
    };

    const stopHold = () => {
        if (holdTimerRef.current) {
            clearInterval(holdTimerRef.current);
            holdTimerRef.current = null;
        }
        setHoldProgress(0);
    };

    const windAlignment = weather?.windDirection || 0;
    const isHeadwind = weather && weather.windSpeed > 15;

    return (
        <div className="fixed inset-0 bg-[#050810] z-[1000] flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden font-sans">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[150px] rounded-full animate-pulse" />
            </div>

            {/* Tactical Setup Overlay (Before Ride/Pause) */}
            <AnimatePresence mode="wait">
                {isSetup && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed inset-0 z-[1100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-start p-6 pt-[env(safe-area-inset-top,5rem)] overflow-y-auto"
                    >
                        <div className="w-full max-w-xl flex-1 flex flex-col gap-10 pb-10">
                            <div className="text-center space-y-3 mt-4">
                                <div className="flex items-center justify-center gap-2 text-cyan-400">
                                    <Target size={20} />
                                    <span className="text-xs font-black uppercase tracking-[0.4em]">Tactical Prep</span>
                                </div>
                                <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">部署骑行战术</h1>
                                <div className="flex items-center justify-center gap-4 mt-2">
                                    <p className="text-[10px] text-white/30 uppercase font-black tracking-widest leading-relaxed">
                                        基于 {user?.weight}kg 体重
                                    </p>
                                    <div className="w-1 h-1 rounded-full bg-white/20" />
                                    <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                        <CloudSun size={12} />
                                        当日天气已对齐
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
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

                                {/* Summary Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`pro-card bg-white/5 border p-4 space-y-1 ${suggestedStrategy.windImpact ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/10'}`}>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">预计耗时</span>
                                            {suggestedStrategy.windImpact && <Wind size={10} className="text-amber-500" />}
                                        </div>
                                        <p className="text-lg font-black italic text-white">
                                            {suggestedStrategy.durationHours.toFixed(1)} <span className="text-[10px] opacity-40">HRS</span>
                                        </p>
                                    </div>
                                    <div className={`pro-card bg-white/5 border p-4 space-y-1 ${suggestedStrategy.tempImpact ? 'border-orange-500/30 bg-orange-500/5' : 'border-white/10'}`}>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">气象调节补给</span>
                                            {suggestedStrategy.tempImpact && <AlertTriangle size={10} className="text-orange-500" />}
                                        </div>
                                        <p className="text-lg font-black italic text-white">
                                            {suggestedStrategy.totalWater > 1000 ? (suggestedStrategy.totalWater / 1000).toFixed(1) : suggestedStrategy.totalWater}
                                            <span className="text-[10px] opacity-40"> {suggestedStrategy.totalWater > 1000 ? 'L' : 'ML'} H2O</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Manual Fine-tuning */}
                                <div className="pro-card bg-cyan-500/5 border-cyan-500/20 p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-cyan-400">
                                            <Settings2 size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">环境优化后的补给节奏</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-[9px] text-white/40 uppercase tracking-tighter">能量提醒</span>
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
                                                <span className="text-[9px] text-white/40 uppercase tracking-tighter">水分提醒</span>
                                                <span className="text-xs font-bold text-white text-cyan-400">{hydrationInterval / 60}m</span>
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

                            <div className="mt-auto pt-8 flex flex-col gap-4">
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleExit}
                                        className="flex-1 py-6 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-black uppercase tracking-widest active:scale-95 transition-transform"
                                    >
                                        取消并退出
                                    </button>
                                    <button
                                        onClick={handleCommitStrategy}
                                        className="flex-[1.5] py-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(6,182,212,0.3)] active:scale-95 transition-transform"
                                    >
                                        <Play size={20} fill="white" />
                                        {isActive ? "确认更改" : "进入骑行模式"}
                                    </button>
                                </div>
                                <p className="text-center text-[8px] font-black text-white/20 uppercase tracking-[0.5em] mt-2 animate-pulse">
                                    VeloTrace Tactical System v3.0
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. Active Ride Display - Responsive Landscape/Portrait */}
            {!isSetup && (
                <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col landscape:flex-row items-center justify-center space-y-8 landscape:space-y-0 landscape:gap-12 z-10">
                    {/* Primary Clock Section */}
                    <div className="flex flex-col items-center justify-center space-y-2 landscape:w-1/2">
                        <div className="flex items-center gap-3 text-cyan-400/80 mb-2">
                            <Timer size={24} className={isActive ? "animate-spin-slow" : ""} />
                            <span className="text-xs md:text-sm font-black uppercase tracking-[0.5em]">Session Live</span>
                        </div>
                        <h1 className="text-[6.5rem] md:text-[8rem] lg:text-[12rem] landscape:text-[8rem] font-black italic tracking-tighter text-white tabular-nums leading-[0.85] drop-shadow-[0_0_60px_rgba(255,255,255,0.05)]">
                            {formatTime(elapsedTime)}
                        </h1>
                    </div>

                    {/* Stats Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4 md:gap-6 w-full max-w-2xl px-4 landscape:w-1/2">
                        {/* Next Fuel */}
                        <div className="pro-card bg-white/[0.03] border-white/5 p-6 md:p-8 flex flex-col items-center justify-center space-y-3 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-5">
                                <Utensils size={40} />
                            </div>
                            <div className="flex items-center gap-2 text-amber-500">
                                <Utensils size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Next Fuel</span>
                            </div>
                            <p className="text-4xl md:text-5xl font-black italic text-white tabular-nums">
                                {formatTime(fuelingInterval - (elapsedTime % fuelingInterval))}
                            </p>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                                <div
                                    className="h-full bg-amber-500 transition-all duration-1000"
                                    style={{ width: `${(1 - (elapsedTime % fuelingInterval) / fuelingInterval) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Wind Impact */}
                        <div className={`pro-card p-6 md:p-8 flex flex-col items-center justify-center space-y-3 transition-all ${isHeadwind ? 'border-rose-500/40 bg-rose-500/5' : 'border-white/5 bg-white/[0.03]'}`}>
                            <div className={`flex items-center gap-2 ${isHeadwind ? 'text-rose-500' : 'text-cyan-400'}`}>
                                <Wind size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Current Wind</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <p className="text-4xl md:text-5xl font-black italic text-white tabular-nums">
                                    {weather?.windSpeed?.toFixed(0) || '--'}
                                    <span className="text-[10px] uppercase opacity-40 ml-1">KMH</span>
                                </p>
                                <div className="flex items-center gap-1.5 mt-1 opacity-50">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                    <span className="text-[8px] font-black uppercase italic">{weather?.windDirection}° NW</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Global Controls - Bottom Optimized */}
            {!isSetup && (
                <div className="w-full max-w-sm mx-auto flex items-center justify-between px-10 pt-4 pb-[env(safe-area-inset-bottom,2rem)] z-10 landscape:pb-4 landscape:pt-2">
                    <button
                        onMouseDown={startHold}
                        onMouseUp={stopHold}
                        onMouseLeave={stopHold}
                        onTouchStart={startHold}
                        onTouchEnd={stopHold}
                        className="relative p-6 md:p-7 rounded-2xl bg-white/5 border border-white/10 text-white/20 hover:text-white transition-all transform active:scale-95 group overflow-hidden"
                    >
                        {/* Progress fill background */}
                        <div
                            className="absolute bottom-0 left-0 h-1 bg-rose-500 transition-all duration-[30ms]"
                            style={{ width: `${holdProgress}%` }}
                        />
                        <RotateCcw size={28} className={holdProgress > 0 ? "animate-spin-fast text-rose-500" : ""} />
                        {holdProgress > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-rose-500/10 backdrop-blur-sm">
                                <span className="text-[10px] font-black text-rose-500 uppercase">Hold</span>
                            </div>
                        )}
                    </button>

                    <button
                        onClick={handleStartStop}
                        className={`w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-2xl ${isActive
                            ? 'bg-rose-500/20 text-rose-500 border-2 border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.3)]'
                            : 'bg-emerald-500/20 text-emerald-500 border-2 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)]'
                            }`}
                    >
                        {isActive ? <Pause size={44} strokeWidth={3} /> : <Play size={44} strokeWidth={3} fill="currentColor" />}
                    </button>

                    <button
                        onClick={() => setIsSetup(true)}
                        className="p-6 md:p-7 rounded-2xl bg-white/5 border border-white/10 text-white/20 hover:text-cyan-400 transition-all"
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
                        onClick={() => {
                            if (autoDismissRef.current) clearTimeout(autoDismissRef.current);
                            setShowReminder(null);
                        }}
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
                                            : `基于当前高温，请饮入 ${Math.round(250 * (weather?.apparentTemp && weather.apparentTemp > 30 ? 1.4 : 1))}ml 电解质水`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <button className="px-16 py-8 rounded-full bg-white text-black font-black uppercase text-2xl shadow-2xl active:scale-90 transition-transform">
                                    进入下一阶段
                                </button>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest animate-pulse">
                                    20秒后自动关闭以继续计时
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
