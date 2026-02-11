"use client";

import { useStore } from "@/store/useStore";
import { useWeather } from "@/hooks/useWeather";
import { Brain, Sparkles, ChevronRight, Loader2, ThermometerSun, Wind, Zap, X, Quote } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getKitRecommendation } from "@/lib/calculators/kitAdvisor";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations, useLocale } from 'next-intl';

const getTSBHeadingKey = (tsb: number) => {
    if (tsb > 20) return "stoked";
    if (tsb > 5) return "peak";
    if (tsb > -5) return "neutral";
    if (tsb > -20) return "fatigue";
    return "damaged";
};

export function AIBriefingCard() {
    const t = useTranslations('AIBriefing');
    const locale = useLocale();
    const { user, bikes, activeBikeIndex, aiBriefingCache, setAIBriefingCache } = useStore();
    const { data: weather, loading: weatherLoading } = useWeather();
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const bike = bikes[activeBikeIndex];
    const [showDetails, setShowDetails] = useState(false);

    const structuredData = aiBriefingCache?.data;
    const tsbKey = getTSBHeadingKey(user.tsb ?? 0);
    const tsbHeading = {
        title: t(`tsbHeading.${tsbKey}`),
        color: tsbKey === 'stoked' ? 'text-emerald-400' :
            tsbKey === 'peak' ? 'text-cyan-400' :
                tsbKey === 'neutral' ? 'text-white/60' :
                    tsbKey === 'fatigue' ? 'text-amber-400' : 'text-rose-500 animate-pulse'
    };

    const kit = weather ? getKitRecommendation({
        apparentTemp: weather.apparentTemp,
        isRainy: weather.isRainy,
        isColdRunner: user.isColdRunner
    }) : null;

    const handleExport = async () => {
        const { toPng } = await import('html-to-image');
        const element = document.getElementById('tactical-report-capture');
        if (!element) return;

        setIsExporting(true);
        try {
            // Wait a frame for UI to be ready
            await new Promise(r => setTimeout(r, 200));
            const dataUrl = await toPng(element, {
                pixelRatio: 3,
                backgroundColor: '#050810',
                cacheBust: true,
            });
            const link = document.createElement('a');
            link.download = `VeloTrace-Report-${new Date().toISOString().split('T')[0]}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Export failed:", err);
        } finally {
            setIsExporting(false);
        }
    };

    const generateBriefing = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/ai/briefing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user,
                    weather,
                    bike: bike,
                    tsb: user.tsb ?? 0,
                    locale
                })
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            if (data) {
                setAIBriefingCache({
                    data,
                    timestamp: Date.now()
                });
            }
        } catch (e) {
            setAIBriefingCache({
                data: {
                    session: t('offline.session'),
                    intensity: "Z2 Endurance",
                    goal: "生理基础维护",
                    advice: t('offline.advice'),
                    logic: t('offline.logic')
                },
                timestamp: Date.now()
            });
        } finally {
            setIsLoading(false);
        }
    }, [user, weather, bike, setAIBriefingCache]);

    useEffect(() => {
        // Auto-refresh if data is older than 2 hours or doesn't exist
        const isExpired = !aiBriefingCache || (Date.now() - aiBriefingCache.timestamp > 2 * 60 * 60 * 1000);
        if (isExpired && !weatherLoading && weather) {
            generateBriefing();
        }
    }, [weatherLoading, weather, aiBriefingCache, generateBriefing]);

    const [simulatedHour, setSimulatedHour] = useState(0);

    const getSimulatedWeather = () => {
        if (!weather || !weather.hourly || simulatedHour === 0) return weather;

        // Find current hour index
        const now = new Date();
        now.setMinutes(0, 0, 0);
        const nowISO = now.toISOString().split(':')[0] + ':00';

        let currentIndex = weather.hourly.time.findIndex(t => t.startsWith(nowISO));
        if (currentIndex === -1) currentIndex = 0;

        const targetIndex = currentIndex + simulatedHour;
        if (targetIndex >= weather.hourly.time.length) return weather;

        return {
            ...weather,
            temp: weather.hourly.temp[targetIndex],
            windSpeed: weather.hourly.windSpeed[targetIndex],
            isSimulating: true,
            simTime: new Date(weather.hourly.time[targetIndex]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    };

    const displayWeather = getSimulatedWeather();

    const handleBottomSheetClose = () => {
        setShowDetails(false);
        setSimulatedHour(0);
        if (pathname !== "/") {
            router.push("/");
        }
    };

    return (
        <>
            {/* Hidden Capture Element for Export (F1 Style) */}
            <div className="fixed -left-[1000vw] -top-[1000vh]">
                <div
                    id="tactical-report-capture"
                    className="w-[450px] bg-[#050810] p-10 font-sans relative overflow-hidden"
                >
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/10 blur-[100px] rounded-full" />

                    {/* F1 Style Header */}
                    <div className="flex justify-between items-end mb-12 border-b-4 border-white pb-6">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black italic tracking-tighter text-white">VELOTRACE</h1>
                            <p className="text-[10px] font-bold text-white/50 tracking-[0.4em] uppercase">{t('export.title')}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{new Date().toLocaleDateString(locale as string, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                    </div>

                    {/* Main TSB Metric - Huge */}
                    <div className="mb-12 relative">
                        <div className="absolute -left-10 top-0 bottom-0 w-2 bg-gradient-to-b from-cyan-500 to-purple-600" />
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">{t('export.formStatus')}</p>
                        <div className="flex items-baseline gap-4">
                            <span className="text-8xl font-black italic tracking-tighter text-white">
                                {(user.tsb ?? 0) > 0 ? '+' : ''}{user.tsb ?? 0}
                            </span>
                            <div className="space-y-1">
                                <p className={`text-xl font-black uppercase tracking-tight ${tsbHeading.color}`}>
                                    {tsbHeading.title}
                                </p>
                                <p className="text-[10px] font-bold text-white/30 uppercase">{t('export.scoreDesc')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Briefing Section */}
                    <div className="grid grid-cols-1 gap-10 mb-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-1 bg-purple-600 text-white text-[8px] font-black uppercase tracking-widest italic">{t('export.logic')}</span>
                                <h3 className="text-sm font-black text-white/90 uppercase italic tracking-widest">{t('labels.session')}</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="p-6 bg-white/[0.03] border border-white/[0.1] rounded-2xl">
                                    <p className="text-base font-bold text-white/90 leading-relaxed italic">
                                        "{structuredData?.advice || "保持节奏，每一瓦特的输出都是对未来的投资。"}"
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                                        <p className="text-[8px] font-black text-white/30 uppercase mb-2">Target intensity</p>
                                        <p className="text-sm font-black text-cyan-400 italic">{structuredData?.intensity || "Z2 Endurance"}</p>
                                    </div>
                                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                                        <p className="text-[8px] font-black text-white/30 uppercase mb-2">Strategic goal</p>
                                        <p className="text-sm font-black text-purple-400 italic">{structuredData?.goal || "Base Maintenance"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Environment & Gear */}
                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Wind size={12} className="text-white/40" />
                                <h4 className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">Environment</h4>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[10px] font-bold text-white/30 uppercase">Temperature</span>
                                    <span className="text-lg font-black text-white">{weather?.temp}°C</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[10px] font-bold text-white/30 uppercase">Wind Gusts</span>
                                    <span className="text-lg font-black text-white">{weather?.windSpeed} kmh</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Zap size={12} className="text-white/40" />
                                <h4 className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">Kit Config</h4>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black text-cyan-400 uppercase italic truncate">{kit?.jersey || "短袖车衣"}</p>
                                <p className="text-[9px] font-bold text-white/50 uppercase truncate">+{kit?.baseLayer || "排汗内衣"}</p>
                                <p className="text-[9px] font-bold text-white/30 uppercase truncate">{kit?.accessories?.[0] || "标准配件"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Branding */}
                    <div className="mt-16 flex justify-between items-center opacity-20">
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1.5 h-1.5 bg-white rotate-45" />)}
                        </div>
                        <p className="text-[7px] font-bold text-white tracking-[0.5em] uppercase">VeloTrace Pro Performance Engine v0.1</p>
                    </div>
                </div>
            </div>

            <div className="pro-card overflow-hidden relative group">
                {/* Aurora Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-transparent to-pink-500/10 opacity-60" />

                {/* Animated Glow Ring */}
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl animate-breathe" />

                {/* Background Decorative Element */}
                <div className="absolute top-0 right-0 p-4 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500">
                    <Brain size={100} className="text-purple-400" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-2.5">
                        <div className="liquid-icon purple p-2">
                            <Sparkles size={14} className="animate-pulse" />
                        </div>
                        <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                            {t('title')}
                        </h2>
                    </div>
                    {isLoading && <Loader2 size={14} className="animate-spin text-purple-400" />}
                </div>

                {/* Catchy Status Headline */}
                <div className="relative z-10 mb-6 px-1">
                    <p className={`text-2xl font-black italic uppercase tracking-tighter leading-none ${tsbHeading.color}`}>
                        {tsbHeading.title}
                    </p>
                    <p className="text-[8px] font-bold text-white/30 uppercase mt-1 tracking-widest leading-none">
                        {t('statusHeadline')} / Bio-Dynamic Status
                    </p>
                </div>

                {/* Main Actionable Area */}

                <div className="space-y-3 relative z-10 mb-6 min-h-[90px]">
                    {isLoading && !structuredData ? (
                        <div className="space-y-3 py-2">
                            <div className="liquid-skeleton h-6 w-full" />
                            <div className="liquid-skeleton h-6 w-4/5" />
                            <div className="liquid-skeleton h-6 w-3/5" />
                        </div>
                    ) : structuredData ? (
                        <div className="space-y-3">
                            {/* Session */}
                            <div className="flex items-center gap-4 group/row">
                                <div className="liquid-tag purple w-16 justify-center text-[8px] py-1">
                                    Session
                                </div>
                                <span className="flex-1 text-sm font-bold text-white/90 tracking-tight truncate pr-4 group-hover/row:text-purple-300 transition-colors uppercase">
                                    {structuredData.session}
                                </span>
                            </div>
                            {/* Target */}
                            <div className="flex items-center gap-4 group/row">
                                <div className="liquid-tag success w-16 justify-center text-[8px] py-1">
                                    Target
                                </div>
                                <span className="flex-1 text-sm font-mono font-bold text-white/70 tracking-tighter truncate pr-4">
                                    {structuredData.intensity}
                                </span>
                            </div>
                            {/* Focus */}
                            <div className="flex items-center gap-4 group/row">
                                <div className="liquid-tag w-16 justify-center text-[8px] py-1">
                                    Focus
                                </div>
                                <span className="flex-1 text-sm font-medium text-white/50 tracking-tight italic uppercase truncate pr-4">
                                    {structuredData.goal}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="py-6 text-center">
                            <button
                                onClick={generateBriefing}
                                className="liquid-button text-[10px] uppercase tracking-widest"
                            >
                                <Sparkles size={12} className="mr-2" />
                                点击推演今日战术
                            </button>
                        </div>
                    )}
                </div>

                {/* Sub Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/[0.06] relative z-10">
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
                        <span className="block text-[9px] text-white/30 uppercase font-bold mb-1 tracking-widest">{t('metrics.form')}</span>
                        <span className={`text-xs font-bold ${(user.tsb ?? 0) > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{(user.tsb ?? 0) > 0 ? '+' : ''}{user.tsb ?? 0} TSB</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
                        <span className="block text-[9px] text-white/30 uppercase font-bold mb-1 tracking-widest">{t('metrics.feel')}</span>
                        <span className="text-xs text-gradient-sunset font-bold">{weather?.temp || '--'}°C</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
                        <span className="block text-[9px] text-white/30 uppercase font-bold mb-1 tracking-widest">{t('metrics.wind')}</span>
                        <span className="text-xs font-bold text-blue-400">{(weather?.windSpeed || 0).toFixed(0)} KM/H</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-5 pt-4 border-t border-purple-500/10 flex justify-between items-center relative z-10">
                    <button
                        disabled={isExporting}
                        onClick={handleExport}
                        className="text-[9px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-all"
                    >
                        {isExporting ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                        {t('actions.export')}
                    </button>
                    <button
                        onClick={() => setShowDetails(true)}
                        className="flex items-center gap-1 text-[9px] font-bold text-white/40 hover:text-purple-400 transition-all hover:gap-2"
                    >
                        {t('actions.details')} <ChevronRight size={12} />
                    </button>
                </div>
            </div>



            {/* Tactical intelligence Detail Overlay - REDESIGNED as Pilot HUD */}
            <AnimatePresence>
                {showDetails && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black flex flex-col overflow-hidden transform-gpu"
                    >
                        {/* 1. Immersive Topographic Background */}
                        <div className="absolute inset-0 pointer-events-none opacity-20">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                            <div className="absolute top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-purple-500/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-cyan-500/20 to-transparent" />

                            {/* Scanning Line Effect */}
                            <motion.div
                                animate={{ y: ['0%', '100%'] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-[1px] bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                            />
                        </div>

                        {/* Top HUD Bar */}
                        <div className="relative z-10 flex justify-between items-start p-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-2">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${displayWeather?.isSimulating ? 'bg-cyan-500 scale-125' : 'bg-emerald-500'} animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)] transition-all`} />
                                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${displayWeather?.isSimulating ? 'text-cyan-400' : 'text-white/40'}`}>
                                        {displayWeather?.isSimulating ? t('hud.simulation', { time: displayWeather.simTime || '--:--' }) : t('hud.live')}
                                    </span>
                                </div>
                                <h3 className="text-3xl font-black italic text-white tracking-tighter uppercase leading-none">
                                    {t('hud.title')}
                                </h3>
                            </div>
                            <button
                                onClick={handleBottomSheetClose}
                                className="group relative liquid-icon p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all overflow-hidden"
                            >
                                <X size={20} className="relative z-10" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-cyan-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                            </button>
                        </div>

                        {/* Scrolling System Logs (New) */}
                        <div className="relative z-10 px-6 overflow-hidden h-4 flex items-center gap-4">
                            <div className="text-[7px] font-mono text-cyan-400/40 uppercase tracking-[0.2em] whitespace-nowrap animate-infinite-scroll">
                                INITIALIZING TACTICAL OVERLAY... SYNCING BIO-SENSORS... FETCHING ATMOSPHERIC DATA... GPS LOCK: 39.9042° N, 116.4074° E... ENGINE STATUS: OPTIMAL...
                            </div>
                        </div>

                        {/* 2. Central Tactical Orbit */}
                        <div className="relative flex-1 flex flex-col items-center justify-center min-h-[350px]">
                            {/* Decorative Background HUD Brackets */}
                            <div className="absolute inset-x-8 top-10 bottom-10 border-x border-white/5 pointer-events-none">
                                <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-white/5 to-transparent" />
                                <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-white/5 to-transparent" />
                            </div>

                            <div className="relative w-80 h-80 flex items-center justify-center">
                                {/* Outer Sensor Ring (New) */}
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                                    className="absolute -inset-10 border border-white/[0.03] rounded-full"
                                >
                                    {[0, 90, 180, 270].map(deg => (
                                        <div
                                            key={deg}
                                            style={{ transform: `rotate(${deg}deg) translateY(-100%)` }}
                                            className="absolute top-1/2 left-1/2 w-1 h-3 bg-cyan-500/20 -translate-x-1/2"
                                        />
                                    ))}
                                </motion.div>

                                {/* Rotating Rings */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-[0.5px] border-dashed border-white/10 rounded-full"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-6 border-[0.5px] border-white/5 rounded-full"
                                />

                                {/* The Central Visualization */}
                                <div className="relative z-10 text-center space-y-2">
                                    <div className="relative">
                                        <motion.div
                                            animate={{ scale: displayWeather?.isSimulating ? [1, 1.1, 1] : [1, 1.05, 1] }}
                                            transition={{ duration: displayWeather?.isSimulating ? 1 : 4, repeat: Infinity }}
                                            className={`text-7xl font-black italic tracking-tighter ${tsbHeading.color} drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]`}
                                        >
                                            {(user.tsb ?? 0) > 0 ? '+' : ''}{user.tsb ?? 0}
                                        </motion.div>
                                        <div className="absolute -top-4 -right-10">
                                            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] border border-white/10 px-2 py-0.5 rounded backdrop-blur-md">FORM</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <p className="text-[11px] font-black text-white/60 uppercase tracking-[0.5em] px-4 py-1.5 bg-white/5 rounded backdrop-blur-xl border border-white/10">
                                            {t('hud.physioStatus')}
                                        </p>
                                        {/* Status Subtext Indicator */}
                                        <motion.div
                                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="text-[7px] font-mono text-cyan-400 mt-2 tracking-widest uppercase"
                                        >
                                            &gt;&gt; Live Telemetry Feed &lt;&lt;
                                        </motion.div>
                                    </div>
                                </div>

                                {/* HUD Corner Indicators */}
                                <div className="absolute top-0 left-0 p-4 font-mono text-[10px] text-cyan-400/80 flex flex-col">
                                    <span className="border-l-2 border-t-2 border-cyan-400/40 pl-3 pt-2 uppercase tracking-tighter opacity-50">Wind Speed</span>
                                    <span className={`pl-3 font-black mt-1 transition-all text-sm ${displayWeather?.isSimulating ? 'text-cyan-400 scale-110' : 'text-white'}`}>
                                        {displayWeather?.windSpeed || '--'} <span className="text-[8px] opacity-40">km/h</span>
                                    </span>
                                </div>
                                <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-purple-400/80 flex flex-col items-end text-right">
                                    <span className="border-r-2 border-t-2 border-purple-400/40 pr-3 pt-2 uppercase tracking-tighter opacity-50">Temperature</span>
                                    <span className={`pr-3 font-black mt-1 transition-all text-sm ${displayWeather?.isSimulating ? 'text-purple-400 scale-110' : 'text-white'}`}>
                                        {displayWeather?.temp || '--'}<span className="text-[8px] opacity-40">°C</span>
                                    </span>
                                </div>
                                <div className="absolute bottom-0 left-0 p-4 font-mono text-[10px] text-emerald-400/80 flex flex-col">
                                    <span className="border-l-2 border-b-2 border-emerald-400/40 pl-3 pb-2 uppercase tracking-tighter opacity-50">Engine FTP</span>
                                    <span className="pl-3 font-black text-white mt-1 text-sm">{user.ftp}<span className="text-[8px] opacity-40">W</span></span>
                                </div>
                                <div className="absolute bottom-0 right-0 p-4 font-mono text-[10px] text-amber-400/80 flex flex-col items-end text-right">
                                    <span className="border-r-2 border-b-2 border-amber-400/40 pr-3 pb-2 uppercase tracking-tighter opacity-50">Mass Class</span>
                                    <span className="pr-3 font-black text-white mt-1 text-sm">{user.weight}<span className="text-[8px] opacity-40">kg</span></span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Radio Comms Briefing */}
                        <div className="relative z-10 px-6 pb-6 space-y-4">
                            {/* Decorative HUD Separator (New) */}
                            <div className="flex items-center gap-2 opacity-10">
                                <div className="h-[1px] flex-1 bg-white" />
                                <div className="w-1 h-1 bg-white rotate-45" />
                                <div className="h-[1px] w-12 bg-white" />
                                <div className="w-1 h-1 bg-white rotate-45" />
                                <div className="h-[1px] flex-1 bg-white" />
                            </div>

                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative bg-[#050810]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6  space-y-4 shadow-2xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="liquid-icon purple p-1.5 rounded-lg border border-purple-500/20">
                                                <Brain size={12} className="text-purple-400" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] italic">{t('hud.comms')}</span>
                                                <span className="text-white/20 text-[6px] font-mono uppercase tracking-[0.3em]">Encrypted-Auth-Link</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5 items-end h-6">
                                            {[1, 2, 3, 4, 5, 2, 1].map((i, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    animate={{ height: displayWeather?.isSimulating ? [6, 16, 6] : [4, i * 3, 4] }}
                                                    transition={{ duration: 0.4, repeat: Infinity, delay: idx * 0.05 }}
                                                    className={`w-0.5 rounded-full ${displayWeather?.isSimulating ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'bg-purple-500/40'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Quote size={24} className="absolute -top-2 -left-3 text-white/[0.03] rotate-12" />
                                            <p className="relative z-10 text-sm font-bold text-white/90 leading-relaxed italic border-l-2 border-purple-500/40 pl-4 py-1">
                                                {isLoading ? t('actions.details') : `"${structuredData?.advice || "Keep it up."}"`}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-1">
                                            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                                                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Target Mode</span>
                                                <span className="block text-xs font-black text-cyan-400 italic leading-none">{structuredData?.intensity || "Loading..."}</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                                                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Logic Stream</span>
                                                <span className="block text-[10px] font-medium text-white/50 italic leading-snug line-clamp-1 truncate">{structuredData?.logic || "AI 推演成功"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Simulation Scrubber */}
                            <div className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl space-y-4 shadow-xl">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                                    <div className="flex items-center gap-2">
                                        <Zap size={10} className={simulatedHour > 0 ? 'text-cyan-400' : ''} />
                                        <span>{t('hud.tacticalSimulation')}</span>
                                    </div>
                                    <span className={`${simulatedHour > 0 ? 'text-cyan-400 animate-pulse' : 'text-white/20'}`}>
                                        {simulatedHour > 0 ? t('hud.forecast', { hour: simulatedHour }) : t('hud.now')}
                                    </span>
                                </div>
                                <div className="relative group px-1">
                                    <input
                                        type="range"
                                        min="0"
                                        max="8"
                                        value={simulatedHour}
                                        onChange={(e) => setSimulatedHour(parseInt(e.target.value))}
                                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all"
                                    />
                                    <div className="flex justify-between mt-2 font-mono text-[8px] text-white/30 uppercase tracking-tighter">
                                        <span className={simulatedHour === 0 ? 'text-cyan-400 font-black' : ''}>Now</span>
                                        <span className={simulatedHour === 4 ? 'text-cyan-400 font-black' : ''}>+4H</span>
                                        <span className={simulatedHour === 8 ? 'text-cyan-400 font-black' : ''}>+8H</span>
                                    </div>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center gap-4 pt-1 pb-2 opacity-30"
                            >
                                <div className="flex-1 h-[0.5px] bg-gradient-to-r from-transparent via-white to-transparent" />
                                <div className="text-[8px] font-black italic text-white uppercase tracking-[0.5em] shrink-0">
                                    VeloTrace Tactical Engine Pro
                                </div>
                                <div className="flex-1 h-[0.5px] bg-gradient-to-r from-transparent via-white to-transparent" />
                            </motion.div>
                        </div>

                        {/* Safe Area Spacer */}
                        <div className="h-[env(safe-area-inset-bottom,24px)] shrink-0" />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
