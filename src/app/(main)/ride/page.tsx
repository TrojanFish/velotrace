"use client";

import { useStore } from "@/store/useStore";
import { useWeather } from "@/hooks/useWeather";
import {
    Zap,
    Activity,
    Wind,
    Clock,
    Timer,
    Droplets,
    Navigation as NavIcon,
    ChevronLeft,
    AlertTriangle,
    Waves,
    TrendingUp
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { converters } from "@/lib/converters";

export default function RideHUDPage() {
    const { user, bikes, activeBikeIndex } = useStore();
    const { data: weather } = useWeather();
    const [elapsed, setElapsed] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [speed, setSpeed] = useState(0);
    const [power, setPower] = useState(0);
    const [heartRate, setHeartRate] = useState(0);

    const bike = bikes[activeBikeIndex];
    const unit = user.unitSystem;

    // Simulate Telemetry
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive) {
            interval = setInterval(() => {
                setElapsed(prev => prev + 1);
                // Simple random walk for simulation
                setSpeed(s => Math.max(25, Math.min(45, s + (Math.random() - 0.5) * 2)));
                setPower(p => Math.max(150, Math.min(350, p + (Math.random() - 0.5) * 20)));
                setHeartRate(h => Math.max(130, Math.min(175, h + (Math.random() - 0.5) * 5)));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Calculate Wind Threat
    const windThreat = useMemo(() => {
        if (!weather) return { level: 'low', angle: 0 };
        const windSpeed = weather.windSpeed;
        const windDir = weather.windDirection;
        // Assume rider heading is roughly constant for simulation or use a state
        const riderHeading = 0; // North
        const relativeAngle = Math.abs(windDir - riderHeading) % 180;
        const isCrosswind = relativeAngle > 45 && relativeAngle < 135;

        if (windSpeed > 30 && isCrosswind) return { level: 'high', angle: relativeAngle };
        if (windSpeed > 15 && isCrosswind) return { level: 'medium', angle: relativeAngle };
        return { level: 'low', angle: relativeAngle };
    }, [weather]);

    // Fueling Timer (Next event in 45m cycle)
    const nextFueling = 2700 - (elapsed % 2700);

    return (
        <div className="fixed inset-0 bg-[#050810] z-[150] flex flex-col p-6 safe-area-inset overflow-hidden font-sans">
            {/* HUD Header */}
            <div className="flex justify-between items-center mb-8">
                <Link href="/" className="liquid-icon p-2.5">
                    <ChevronLeft size={20} />
                </Link>
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-0.5">
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                            {isActive ? 'Live Telemetry' : 'Standby Mode'}
                        </span>
                    </div>
                    <p className="text-2xl font-black italic tracking-tighter text-white tabular-nums">
                        {formatTime(elapsed)}
                    </p>
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Primary Metrics Group */}
            <div className="flex-1 flex flex-col justify-center space-y-12">
                {/* Speed Hero */}
                <div className="text-center relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/5 rounded-full scale-125 pointer-events-none" />
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] mb-2">Current Speed</p>
                    <div className="flex items-baseline justify-center gap-2">
                        <h1 className="text-[120px] leading-none font-black italic tracking-tighter text-white tabular-nums drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                            {isActive ? speed.toFixed(1) : '0.0'}
                        </h1>
                        <span className="text-xl font-black italic text-white/20 uppercase">{unit === 'metric' ? 'km/h' : 'mph'}</span>
                    </div>
                </div>

                {/* Secondary Metrics Bar */}
                <div className="grid grid-cols-2 gap-8 px-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-cyan-400">
                            <Zap size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Power</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black italic text-white tabular-nums">
                                {isActive ? Math.round(power) : '---'}
                            </span>
                            <span className="text-xs font-bold text-white/20 uppercase">Watts</span>
                        </div>
                        {/* Power Bar */}
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                                style={{ width: `${isActive ? (power / 500) * 100 : 0}%` }}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-rose-500">
                            <Activity size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Heart Rate</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black italic text-white tabular-nums">
                                {isActive ? Math.round(heartRate) : '---'}
                            </span>
                            <span className="text-xs font-bold text-white/20 uppercase">Bpm</span>
                        </div>
                        {/* HR Bar */}
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-rose-500 transition-all duration-500"
                                style={{ width: `${isActive ? ((heartRate - 60) / 130) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tactical Grid */}
            <div className="grid grid-cols-2 gap-4 mt-8 pb-12">
                {/* Wind Alert Card */}
                <div className={`p-4 rounded-3xl border transition-all ${windThreat.level === 'high' ? 'bg-red-500/10 border-red-500/40' :
                        windThreat.level === 'medium' ? 'bg-amber-500/10 border-amber-500/40' :
                            'bg-white/[0.03] border-white/5'
                    }`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Wind size={14} className={windThreat.level !== 'low' ? 'text-white' : 'text-cyan-400'} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Wind Vector</span>
                        </div>
                        {windThreat.level !== 'low' && <AlertTriangle size={12} className="text-white animate-pulse" />}
                    </div>
                    <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                            <p className="text-lg font-black italic text-white">
                                {weather ? converters.formatSpeed(weather.windSpeed, unit) : '---'}
                            </p>
                            <p className="text-[8px] font-bold text-white/40 uppercase">
                                {windThreat.level === 'high' ? 'Extreme Crosswind' : 'Stable Flow'}
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center relative">
                            <NavIcon
                                size={12}
                                className="text-white transform transition-transform"
                                style={{ transform: `rotate(${weather?.windDirection || 0}deg)` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Fueling Countdown Card */}
                <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <Droplets size={14} className="text-amber-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Next Fuel</span>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-lg font-black italic text-white">
                            {formatTime(nextFueling)}
                        </p>
                        <p className="text-[8px] font-bold text-white/40 uppercase">Gels / Hydration</p>
                    </div>
                </div>
            </div>

            {/* HUD Footer Actions */}
            <div className="mt-auto flex gap-4">
                <button
                    onClick={() => setIsActive(!isActive)}
                    className={`flex-1 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm transition-all shadow-2xl ${isActive
                            ? 'bg-slate-800 text-white/50 border border-white/10'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/20'
                        }`}
                >
                    {isActive ? 'Pause Mission' : 'Commence Ride'}
                </button>
            </div>

            {/* Background Decorative Data Stream */}
            <div className="absolute bottom-0 right-0 p-8 opacity-5 pointer-events-none overflow-hidden h-64">
                <div className="text-[8px] font-mono text-white whitespace-pre space-y-1 animate-scroll-up">
                    {`SYS_LINK_STABLE: 100%
TELEM_FREQ: 15Hz
RIDER_UUID: ${user.age}${user.height}${user.weight}
BIKE_ASSET: ${bike?.name.toUpperCase().replace(/\s/g, '_')}
PHYSIO_MODEL: COGGAN_V2.1
AERO_SIM: ACTIVE
${elapsed > 0 ? `SESSION_TSS: ${Math.round(elapsed / 60)}` : ''}`}
                </div>
            </div>

            <style jsx>{`
                @keyframes scroll-up {
                    from { transform: translateY(0); }
                    to { transform: translateY(-50%); }
                }
                .animate-scroll-up {
                    animation: scroll-up 20s linear infinite;
                }
            `}</style>
        </div>
    );
}
