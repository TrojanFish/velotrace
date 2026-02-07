"use client";

import { useStore } from "@/store/useStore";
import { useWeather } from "@/hooks/useWeather";
import { Brain, Sparkles, ChevronRight, Loader2, ThermometerSun, Wind, Zap, X } from "lucide-react";
import { useState, useEffect } from "react";
import { getKitRecommendation } from "@/lib/calculators/kitAdvisor";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";

const getTSBHeading = (tsb: number) => {
    if (tsb > 20) return { title: "极度渴望战斗", color: "text-emerald-400", hex: "#34d399" };
    if (tsb > 5) return { title: "竞技巅峰期", color: "text-cyan-400", hex: "#22d3ee" };
    if (tsb > -5) return { title: "中性维持期", color: "text-white/60", hex: "#94a3b8" };
    if (tsb > -20) return { title: "疲劳累积中", color: "text-amber-400", hex: "#fbbf24" };
    return { title: "战损状态", color: "text-rose-500 animate-pulse", hex: "#f43f5e" };
};

export function AIBriefingCard() {
    const { user, bikes, activeBikeIndex, aiBriefingCache, setAIBriefingCache, dailyLoads } = useStore();
    const { data: weather, loading: weatherLoading } = useWeather();
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const bike = bikes[activeBikeIndex];
    const [showDetails, setShowDetails] = useState(false);

    const structuredData = aiBriefingCache?.data;
    const tsbHeading = getTSBHeading(user.tsb ?? 0);

    const kit = weather ? getKitRecommendation({
        temp: weather.temp,
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

    const generateBriefing = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/ai/briefing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user,
                    weather,
                    bike: bike,
                    tsb: user.tsb ?? 0
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
                    session: "OFFLINE MODE",
                    intensity: "Z2 Endurance",
                    goal: "生理基础维护",
                    advice: `⚠️ 智脑连接超时。基于当前 TSB (${user.tsb || 15})，系统已启用离线基准策略。`,
                    logic: "网络链路中断，自动调用本地缓存模型。"
                },
                timestamp: Date.now()
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Auto-refresh if data is older than 2 hours or doesn't exist
        const isExpired = !aiBriefingCache || (Date.now() - aiBriefingCache.timestamp > 2 * 60 * 60 * 1000);
        if (isExpired && !weatherLoading) {
            generateBriefing();
        }
    }, [weatherLoading]);

    const handleBottomSheetClose = () => {
        setShowDetails(false);
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
                            <p className="text-[10px] font-bold text-white/50 tracking-[0.4em] uppercase">Tactical Intelligence Report</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                    </div>

                    {/* Main TSB Metric - Huge */}
                    <div className="mb-12 relative">
                        <div className="absolute -left-10 top-0 bottom-0 w-2 bg-gradient-to-b from-cyan-500 to-purple-600" />
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Current Form / TSB Status</p>
                        <div className="flex items-baseline gap-4">
                            <span className="text-8xl font-black italic tracking-tighter text-white">
                                {(user.tsb ?? 0) > 0 ? '+' : ''}{user.tsb ?? 0}
                            </span>
                            <div className="space-y-1">
                                <p className={`text-xl font-black uppercase tracking-tight ${tsbHeading.color}`}>
                                    {tsbHeading.title}
                                </p>
                                <p className="text-[10px] font-bold text-white/30 uppercase">Score derived via EWMA analytics</p>
                            </div>
                        </div>
                    </div>

                    {/* Briefing Section */}
                    <div className="grid grid-cols-1 gap-10 mb-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-1 bg-purple-600 text-white text-[8px] font-black uppercase tracking-widest italic">Race Logic</span>
                                <h3 className="text-sm font-black text-white/90 uppercase italic tracking-widest">推演建议</h3>
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
                            AI 战术简报
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
                        Current Physiological State / Bio-Dynamic Status
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
                        <span className="block text-[9px] text-white/30 uppercase font-bold mb-1 tracking-widest">形态</span>
                        <span className={`text-xs font-bold ${(user.tsb ?? 0) > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{(user.tsb ?? 0) > 0 ? '+' : ''}{user.tsb ?? 0} TSB</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
                        <span className="block text-[9px] text-white/30 uppercase font-bold mb-1 tracking-widest">体感</span>
                        <span className="text-xs text-gradient-sunset font-bold">{weather?.temp || '--'}°C</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
                        <span className="block text-[9px] text-white/30 uppercase font-bold mb-1 tracking-widest">风阻</span>
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
                        导出战报卡
                    </button>
                    <button
                        onClick={() => setShowDetails(true)}
                        className="flex items-center gap-1 text-[9px] font-bold text-white/40 hover:text-purple-400 transition-all hover:gap-2"
                    >
                        详情建议 <ChevronRight size={12} />
                    </button>
                </div>
            </div>



            {/* Tactical intelligence Detail Overlay */}
            <AnimatePresence>
                {showDetails && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 backdrop-blur-xl"
                        onClick={handleBottomSheetClose}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            drag="y"
                            dragConstraints={{ top: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(_, info) => {
                                if (info.offset.y > 100) {
                                    handleBottomSheetClose();
                                }
                            }}
                            className="w-full liquid-modal rounded-t-[2.5rem] p-6 pb-12 space-y-6 shadow-[0_-20px_100px_-12px_rgba(168,85,247,0.4)] flex flex-col max-h-[92vh] overflow-hidden touch-none"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Grab Bar */}
                            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-2 shrink-0" />

                            <div className="overflow-y-auto space-y-6 pr-1 custom-scrollbar">
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black italic text-gradient-aurora tracking-tighter">战术推演详情报告</h3>
                                        <p className="text-[10px] text-purple-400/60 font-bold uppercase tracking-[0.25em]">Tactical Intelligence Deep-Dive</p>
                                    </div>
                                    <button
                                        onClick={handleBottomSheetClose}
                                        className="liquid-icon p-2 hover:scale-110 transition-transform bg-white/5 rounded-full"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Raw Metrics Section */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
                                        <h4 className="text-[10px] font-black text-white/40 uppercase flex items-center gap-2 tracking-[0.2em]">
                                            <span className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]" /> 骑手档案
                                        </h4>
                                        <div className="space-y-2.5 font-mono">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-white/30 uppercase tracking-tighter">FTP</span>
                                                <span className="text-white font-black">{user.ftp}W</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-white/30 uppercase tracking-tighter">Weight</span>
                                                <span className="text-white font-black">{user.weight}kg</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-white/30 uppercase tracking-tighter">TSB</span>
                                                <span className={`font-black ${(user.tsb ?? 0) > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{(user.tsb ?? 0) > 0 ? '+' : ''}{user.tsb ?? 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
                                        <h4 className="text-[10px] font-black text-white/40 uppercase flex items-center gap-2 tracking-[0.2em]">
                                            <span className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)]" /> 环境参数
                                        </h4>
                                        <div className="space-y-2.5 font-mono">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-white/30 uppercase tracking-tighter">Temp</span>
                                                <span className="text-white font-black">{weather?.temp}°C</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-white/30 uppercase tracking-tighter">Wind</span>
                                                <span className="text-white font-black">{weather?.windSpeed}km/h</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-white/30 uppercase tracking-tighter">Gst</span>
                                                <span className="text-blue-400 font-black">{weather?.windGusts || '--'}km/h</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Content */}
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="liquid-icon purple p-2">
                                                <Zap size={14} className="text-purple-400" />
                                            </div>
                                            <h4 className="text-xs font-black text-white/70 uppercase tracking-widest italic">核心战术推演</h4>
                                        </div>
                                        <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 text-sm text-white/80 leading-relaxed font-bold italic shadow-inner">
                                            {isLoading ? (
                                                <div className="space-y-3">
                                                    <div className="liquid-skeleton h-4 w-full" />
                                                    <div className="liquid-skeleton h-4 w-5/6" />
                                                    <div className="liquid-skeleton h-4 w-4/6" />
                                                </div>
                                            ) : (
                                                `"${structuredData?.advice || "数据解析中，建议维持高踏频有氧耐力输出。"}"`
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="liquid-icon p-2 bg-white/5 border border-white/10">
                                                <Brain size={14} className="text-white/40" />
                                            </div>
                                            <h4 className="text-xs font-black text-white/40 uppercase tracking-widest italic">系统判定逻辑</h4>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-[11px] text-white/40 font-medium italic leading-relaxed">
                                            {isLoading ? (
                                                <div className="liquid-skeleton h-12 w-full" />
                                            ) : (
                                                structuredData?.logic || "基于 TSB 生理模型与实时大气环境，由 VeloTrace AI 引擎计算得出。"
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Info */}
                                <div className="flex items-center gap-4 pt-4 opacity-20">
                                    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
                                    <div className="text-[8px] font-black italic text-white uppercase tracking-[0.5em]">
                                        VT-INTELLIGENCE PRO v0.1
                                    </div>
                                    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
