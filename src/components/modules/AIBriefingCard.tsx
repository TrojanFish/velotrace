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
    const tKit = useTranslations('Kit');
    const tCommon = useTranslations('Common');
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
                    intensity: t('offline.intensity'),
                    goal: t('offline.goal'),
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
                                        "{structuredData?.advice || t('offline.defaultAdvice')}"
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                                        <p className="text-[8px] font-black text-white/30 uppercase mb-2">{t('labels.target')}</p>
                                        <p className="text-sm font-black text-cyan-400 italic">{structuredData?.intensity || t('offline.intensity')}</p>
                                    </div>
                                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                                        <p className="text-[8px] font-black text-white/30 uppercase mb-2">{t('labels.focus')}</p>
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
                                <h4 className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">{t('hud.environment')}</h4>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[10px] font-bold text-white/30 uppercase">{t('hud.temp')}</span>
                                    <span className="text-lg font-black text-white">{weather?.temp}°C</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[10px] font-bold text-white/30 uppercase">{t('hud.windGusts')}</span>
                                    <span className="text-lg font-black text-white">{weather?.windSpeed} kmh</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Zap size={12} className="text-white/40" />
                                <h4 className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">{t('hud.kit')}</h4>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black text-cyan-400 uppercase italic truncate">{kit?.jersey ? tKit(kit.jersey) : tKit('shortJersey')}</p>
                                <p className="text-[9px] font-bold text-white/50 uppercase truncate">+{kit?.baseLayer ? tKit(kit.baseLayer) : tKit('sleeveless')}</p>
                                <p className="text-[9px] font-bold text-white/30 uppercase truncate">{kit?.accessories?.[0] ? tKit(kit.accessories[0]) : tCommon('active')}</p>
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
                        {t('statusHeadline')}
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
                                    {t('labels.session')}
                                </div>
                                <span className="flex-1 text-sm font-bold text-white/90 tracking-tight truncate pr-4 group-hover/row:text-purple-300 transition-colors uppercase">
                                    {structuredData.session}
                                </span>
                            </div>
                            {/* Target */}
                            <div className="flex items-center gap-4 group/row">
                                <div className="liquid-tag success w-16 justify-center text-[8px] py-1">
                                    {t('labels.target')}
                                </div>
                                <span className="flex-1 text-sm font-mono font-bold text-white/70 tracking-tighter truncate pr-4">
                                    {structuredData.intensity}
                                </span>
                            </div>
                            {/* Focus */}
                            <div className="flex items-center gap-4 group/row">
                                <div className="liquid-tag w-16 justify-center text-[8px] py-1">
                                    {t('labels.focus')}
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
                                {t('actions.generate')}
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
                        {/* 1. Minimal Background */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-3xl" />
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



                        {/* 2. Tactical Content Stack */}
                        <div className="relative z-10 flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-hide">
                            {/* Key Performance Indicators */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 pro-card bg-white/[0.03] space-y-2">
                                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">{t('metrics.form')}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-4xl font-black italic ${(user.tsb ?? 0) > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {(user.tsb ?? 0) > 0 ? '+' : ''}{user.tsb ?? 0}
                                        </span>
                                        <span className="text-xs font-bold text-white/20">TSB</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">{t('hud.physioStatus')}</p>
                                </div>
                                <div className="grid grid-rows-2 gap-4">
                                    <div className="p-4 pro-card bg-white/[0.03] flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <ThermometerSun size={14} className="text-amber-400" />
                                            <span className="text-[10px] font-bold text-white/40 uppercase">{t('metrics.feel')}</span>
                                        </div>
                                        <span className="text-lg font-black text-white">{displayWeather?.temp || '--'}°C</span>
                                    </div>
                                    <div className="p-4 pro-card bg-white/[0.03] flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Wind size={14} className="text-blue-400" />
                                            <span className="text-[10px] font-bold text-white/40 uppercase">{t('metrics.wind')}</span>
                                        </div>
                                        <span className="text-lg font-black text-white">{displayWeather?.windSpeed || '--'}<span className="text-[10px] ml-1 opacity-30">KMH</span></span>
                                    </div>
                                </div>
                            </div>

                            <div className="pro-card bg-white/[0.03] p-6 space-y-6">
                                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                    <div className="liquid-icon purple p-2">
                                        <Brain size={16} />
                                    </div>
                                    <span className="text-xs font-black text-white/90 uppercase tracking-widest italic">{t('hud.comms')}</span>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-lg font-bold text-white/90 leading-relaxed italic border-l-2 border-purple-500/40 pl-4">
                                        {isLoading ? t('actions.details') : `"${structuredData?.advice || "..."}"`}
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{t('hud.targetMode')}</span>
                                            <p className="text-sm font-black text-cyan-400 italic">{structuredData?.intensity || tCommon('loading')}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{t('hud.logicStream')}</span>
                                            <p className="text-[10px] font-medium text-white/50 italic">{structuredData?.logic || t('hud.logicStable')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Simulation Scrubber */}
                            <div className="pro-card bg-white/[0.03] p-6 space-y-6">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <ThermometerSun size={14} className={simulatedHour > 0 ? 'text-cyan-400' : 'text-white/30'} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{t('hud.tacticalSimulation')}</span>
                                    </div>
                                    <span className={`text-[10px] font-black ${simulatedHour > 0 ? 'text-cyan-400' : 'text-white/20'}`}>
                                        {simulatedHour > 0 ? t('hud.forecast', { hour: simulatedHour }) : t('hud.now')}
                                    </span>
                                </div>
                                <input
                                    type="range" min="0" max="8"
                                    value={simulatedHour}
                                    onChange={(e) => setSimulatedHour(parseInt(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Safe Area Spacer */}
                        <div className="h-[env(safe-area-inset-bottom,24px)] shrink-0" />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
