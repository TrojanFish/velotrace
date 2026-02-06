"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Timer,
    Wind,
    Utensils,
    Pause,
    Play,
    RotateCcw,
    Droplets,
    Settings2,
} from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";
import { Intensity } from "@/lib/calculators/fueling";
import { getCardinalDirection } from "@/lib/weatherUtils";

export default function ActiveRidePage() {
    const router = useRouter();
    const { data: weather } = useWeather();
    const { user, rideSession, setRideSession } = useStore();

    // UI state
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const lastTimeRef = useRef<number>(0);

    // Add session persistence for timer
    useEffect(() => {
        if (!rideSession) {
            router.replace('/ride/setup');
            return;
        }

        const updateTimer = () => {
            if (rideSession.isActive && rideSession.startTime) {
                const now = Date.now();
                const diff = Math.floor((now - rideSession.startTime) / 1000);
                const nextTime = rideSession.accumulatedTime + diff;
                setElapsedTime(nextTime);

                // Reminders logic - Trigger only once per second
                if (nextTime > 0 && lastTimeRef.current !== nextTime) {
                    if (nextTime % rideSession.fuelInterval === 0) triggerReminder('fuel');
                    if (nextTime % rideSession.waterInterval === 0) triggerReminder('water');
                }
                lastTimeRef.current = nextTime;
            } else {
                setElapsedTime(rideSession.accumulatedTime);
            }
        };

        updateTimer();
        setIsReady(true);

        let interval: NodeJS.Timeout | null = null;
        if (rideSession.isActive) {
            interval = setInterval(updateTimer, 1000);
        }

        return () => { if (interval) clearInterval(interval); };
    }, [rideSession, router]);

    const wakeLockRef = useRef<any>(null);

    // Prefetch Home for smoother exit
    useEffect(() => {
        router.prefetch('/');
    }, [router]);

    // Reminder States
    const [showReminder, setShowReminder] = useState<'fuel' | 'water' | null>(null);

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

    // 4. Vibration, Voice & Auto-dismiss Alerts
    const autoDismissRef = useRef<NodeJS.Timeout | null>(null);

    const triggerReminder = (type: 'fuel' | 'water') => {
        if (!rideSession) return;
        // Clear any pending auto-dismiss
        if (autoDismissRef.current) clearTimeout(autoDismissRef.current);

        setShowReminder(type);

        // 🔊 1. Voice Synthesis (TTS) - Crucial for "Back-pocket" racing
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const message = type === 'fuel'
                ? "战术提醒：补给时间到，请摄入碳水化合物或能量胶。"
                : "骑行提醒：请补充水分，保持体液平衡。"
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
        if (!rideSession) return;

        if (!rideSession.isActive) {
            setRideSession({
                ...rideSession,
                isActive: true,
                startTime: Date.now(),
            });
            requestWakeLock();
        } else {
            const now = Date.now();
            const diff = Math.floor((now - (rideSession.startTime || now)) / 1000);
            setRideSession({
                ...rideSession,
                isActive: false,
                startTime: undefined,
                accumulatedTime: rideSession.accumulatedTime + diff
            });
            releaseWakeLock();
        }
    };

    // Long Press Reset Logic
    const [holdProgress, setHoldProgress] = useState(0);
    const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

    const startHold = () => {
        if (holdTimerRef.current || !rideSession) return;
        setHoldProgress(0);
        const startTime = Date.now();
        const duration = 1500; // 1.5 seconds to reset

        holdTimerRef.current = setInterval(() => {
            const now = Date.now();
            const p = Math.min(((now - startTime) / duration) * 100, 100);
            setHoldProgress(p);

            if (p >= 100) {
                stopHold();
                setRideSession({
                    ...rideSession,
                    isActive: false,
                    startTime: undefined,
                    accumulatedTime: 0
                });
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

    const isHeadwind = weather && weather.windSpeed > 15;

    if (!isReady || !rideSession) {
        return (
            <div className="fixed inset-0 bg-[#050810] z-[1000] flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden font-sans">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[150px] rounded-full animate-pulse" />
                </div>
            </div>
        );
    }

    const { isActive, fuelInterval } = rideSession;

    return (
        <div className="fixed inset-0 bg-[#050810] z-[1000] flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden font-sans">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[150px] rounded-full animate-pulse" />
            </div>

            {/* Active Ride Display - Responsive Landscape/Portrait */}
            <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col landscape:flex-row items-center justify-center space-y-8 landscape:space-y-0 landscape:gap-12 z-10">
                {/* Primary Clock Section */}
                <div className="flex flex-col items-center justify-center space-y-2 landscape:w-1/2">

                    {/* Mission Context Pill */}
                    <div className="flex items-center gap-3 mb-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                            {rideSession.targetDistance}KM
                        </span>
                        <div className="w-1 h-3 bg-white/10 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                            {rideSession.intensity}
                        </span>
                    </div>

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
                            {formatTime(fuelInterval - (elapsedTime % fuelInterval))}
                        </p>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                            <div
                                className="h-full bg-amber-500 transition-all duration-1000"
                                style={{ width: `${(1 - (elapsedTime % fuelInterval) / fuelInterval) * 100}%` }}
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
                                <span className="text-[8px] font-black uppercase italic">
                                    {weather?.windDirection}° {getCardinalDirection(weather?.windDirection || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Global Controls - Bottom Optimized */}
            <div className="w-full max-w-md mx-auto flex items-center justify-between px-8 pt-4 pb-[env(safe-area-inset-bottom,2rem)] z-10 landscape:pb-4 landscape:pt-2">
                <button
                    onMouseDown={startHold}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    onTouchStart={(e) => {
                        e.preventDefault();
                        startHold();
                    }}
                    onTouchEnd={stopHold}
                    onContextMenu={(e) => e.preventDefault()}
                    className="relative p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 text-white/20 hover:text-white transition-all transform active:scale-95 group overflow-hidden select-none touch-none"
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
                    className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-2xl ${isActive
                        ? 'bg-rose-500/20 text-rose-500 border-2 border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.4)]'
                        : 'bg-emerald-500/20 text-emerald-500 border-2 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)]'
                        }`}
                >
                    {isActive ? <Pause size={44} strokeWidth={3} /> : <Play size={44} strokeWidth={3} fill="currentColor" />}
                </button>

                <button
                    onClick={() => router.push('/ride/setup')}
                    className="p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 text-white/20 hover:text-cyan-400 transition-all select-none"
                >
                    <Settings2 size={28} />
                </button>
            </div>

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
                                            ? `建议摄入 ${rideSession.intensity === 'race' ? '60-80g' : '30-40g'} 碳水化合物`
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
