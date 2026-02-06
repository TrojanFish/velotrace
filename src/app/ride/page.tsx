"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Timer,
    Wind,
    Utensils,
    AlertTriangle,
    X,
    Maximize2,
    Vibrate,
    Bell,
    Pause,
    Play,
    RotateCcw,
    Droplets
} from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ActiveRidePage() {
    const router = useRouter();
    const { data: weather } = useWeather();

    // Ride State
    const [isActive, setIsActive] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [fuelingInterval] = useState(45 * 60); // 45 minutes in seconds
    const [hydrationInterval] = useState(20 * 60); // 20 minutes in seconds

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const wakeLockRef = useRef<any>(null);

    // Reminder States
    const [showReminder, setShowReminder] = useState<'fuel' | 'water' | null>(null);

    // 1. Timer Logic
    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => {
                    const next = prev + 1;
                    // Check reminders
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

    // 2. Screen Wake Lock (Crucial for riding)
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

    // 3. Vibration & Alerts
    const triggerReminder = (type: 'fuel' | 'water') => {
        setShowReminder(type);

        // Vibration pattern: Short-Long-Short
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 500, 100, 200]);
        }

        // Web Audio fallback/extra
        if (typeof window !== 'undefined') {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            oscillator.connect(gain);
            gain.connect(audioCtx.destination);
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
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
            requestWakeLock();
            toast.success("骑行开始，屏幕已常亮", {
                icon: <Maximize2 size={16} />
            });
        } else {
            setIsActive(false);
            releaseWakeLock();
        }
    };

    // Wind Logic
    const windAlignment = weather?.windDirection || 0;
    const isHeadwind = weather && weather.windSpeed > 15; // Simple heuristic

    return (
        <div className="fixed inset-0 bg-black z-[1000] flex flex-col items-center justify-between p-8 landscape:flex-row overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full animate-pulse" />
            </div>

            {/* Exit Button */}
            <button
                onClick={() => router.back()}
                className="absolute top-6 left-6 p-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all z-50"
            >
                <X size={24} />
            </button>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 landscape:space-y-0 landscape:space-x-12 z-10 w-full max-w-6xl mx-auto">

                {/* 1. Primary Clock */}
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-3 text-cyan-400 opacity-60">
                        <Timer size={20} className={isActive ? "animate-spin-slow" : ""} />
                        <span className="text-xs font-black uppercase tracking-[0.4em]">Ride Duration</span>
                    </div>
                    <h1 className="text-8xl md:text-[12rem] font-black italic tracking-tighter text-white tabular-nums drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] pr-8 mr-[-2rem]">
                        {formatTime(elapsedTime)}
                    </h1>
                </div>

                {/* 2. Side Metrics (Landscape) / Bottom Metrics (Portrait) */}
                <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
                    {/* Next Fuel */}
                    <div className="pro-card bg-white/[0.03] border-white/5 p-6 flex flex-col items-center justify-center space-y-4">
                        <div className="flex items-center gap-2 text-amber-500">
                            <Utensils size={24} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Next Fuel</span>
                        </div>
                        <p className="text-4xl font-black italic text-white pr-4">
                            {formatTime(fuelingInterval - (elapsedTime % fuelingInterval))}
                        </p>
                    </div>

                    {/* Wind Impact */}
                    <div className={`pro-card p-6 flex flex-col items-center justify-center space-y-4 transition-colors ${isHeadwind ? 'border-rose-500/30 bg-rose-500/5' : 'border-white/5 bg-white/[0.03]'}`}>
                        <div className={`flex items-center gap-2 ${isHeadwind ? 'text-rose-500' : 'text-cyan-400'}`}>
                            <Wind size={24} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Wind Data</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-4xl font-black italic text-white pr-4">{weather?.windSpeed || '--'} <span className="text-sm">KM/H</span></p>
                            <div className="flex items-center gap-2 mt-2 opacity-40">
                                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                                <span className="text-[8px] font-bold uppercase">{weather?.windDirection}° DIRECTION</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Controls */}
            <div className="w-full max-w-md mx-auto flex items-center justify-center gap-8 py-8 z-10">
                <button
                    onClick={() => setElapsedTime(0)}
                    className="p-6 rounded-full bg-white/5 border border-white/10 text-white/20 hover:text-white transition-all transform active:scale-90"
                >
                    <RotateCcw size={32} />
                </button>

                <button
                    onClick={handleStartStop}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-2xl ${isActive
                        ? 'bg-rose-500/20 text-rose-500 border-2 border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.3)]'
                        : 'bg-emerald-500/20 text-emerald-500 border-2 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]'
                        }`}
                >
                    {isActive ? <Pause size={40} strokeWidth={3} /> : <Play size={40} strokeWidth={3} fill="currentColor" />}
                </button>

                <div className="p-6 rounded-full bg-white/5 border border-white/10 text-white/20">
                    <Vibrate size={32} />
                </div>
            </div>

            {/* 4. Full-Screen Reminder Overlays */}
            <AnimatePresence>
                {showReminder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1100] flex items-center justify-center p-8 bg-black/95 backdrop-blur-3xl"
                        onClick={() => setShowReminder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, rotate: -5 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="flex flex-col items-center text-center space-y-8"
                        >
                            <div className={`w-48 h-48 rounded-full flex items-center justify-center animate-bounce ${showReminder === 'fuel' ? 'bg-amber-500/20 text-amber-500 border-4 border-amber-500 shadow-[0_0_80px_rgba(245,158,11,0.4)]' : 'bg-blue-500/20 text-blue-400 border-4 border-blue-400 shadow-[0_0_80px_rgba(59,130,246,0.4)]'
                                }`}>
                                {showReminder === 'fuel' ? <Utensils size={80} /> : <Droplets size={80} />}
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-6xl font-black italic text-white uppercase tracking-tighter">
                                    {showReminder === 'fuel' ? 'Time to Fuel!' : 'Hydrate Now!'}
                                </h2>
                                <p className="text-xl font-bold text-white/40 uppercase tracking-[0.2em]">
                                    {showReminder === 'fuel' ? '补给提醒：请摄入碳水 30-40g' : '水分提醒：摄入 150-200ml'}
                                </p>
                            </div>

                            <button className="px-12 py-6 rounded-2xl bg-white text-black font-black uppercase text-xl mt-8">
                                Got it
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

