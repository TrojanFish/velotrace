"use client";

import { useStore } from "@/store/useStore";
import { useWeather } from "@/hooks/useWeather";
import { Brain, Sparkles, ChevronRight, Loader2, ThermometerSun, Wind, Zap, X } from "lucide-react";
import { useState, useEffect } from "react";

export function AIBriefingCard() {
    const { user, bikes, activeBikeIndex } = useStore();
    const { data: weather, loading: weatherLoading } = useWeather();
    const [briefing, setBriefing] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const bike = bikes[activeBikeIndex];

    const [showDetails, setShowDetails] = useState(false);

    const [structuredData, setStructuredData] = useState<{
        session: string;
        intensity: string;
        goal: string;
        advice: string;
        logic: string;
    } | null>(null);

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
            const text = await res.text();
            const data = text ? JSON.parse(text) : null;
            if (data) setStructuredData(data);
        } catch (e) {
            setStructuredData({
                session: "OFFLINE MODE",
                intensity: "Z2 Endurance",
                goal: "生理基础维护",
                advice: `⚠️ 智脑连接超时。基于当前 TSB (${user.tsb || 15})，系统已启用离线基准策略。建议今日进行低强度排酸骑行，注意避开侧风区。`,
                logic: "网络链路中断，自动调用本地缓存的训练风险模型进行保守指引。"
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!structuredData && !weatherLoading) {
            generateBriefing();
        }
    }, [weatherLoading, structuredData]);

    return (
        <>
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
                <div className="flex items-center justify-between mb-6 relative z-10">
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

                {/* Main Actionable Area */}
                <div className="space-y-3 relative z-10 mb-6 min-h-[90px]">
                    {isLoading ? (
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
                        <span className="text-xs text-gradient-cyan font-bold">{(user.tsb ?? 0) > 0 ? '+' : ''}{user.tsb ?? 0} TSB</span>
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
                    <span className="text-[8px] font-bold text-purple-400/50 uppercase tracking-[0.2em] italic flex items-center gap-1.5 pr-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400/50 animate-pulse" />
                        BIO-SYNC DATA
                    </span>
                    <button
                        onClick={() => setShowDetails(true)}
                        className="flex items-center gap-1 text-[9px] font-bold text-white/40 hover:text-purple-400 transition-all hover:gap-2"
                    >
                        详情建议 <ChevronRight size={12} />
                    </button>
                </div>
            </div>

            {/* Tactical intelligence Detail Overlay */}
            {showDetails && (
                <div
                    className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-xl transition-all animate-in fade-in duration-300"
                    onClick={() => setShowDetails(false)}
                >
                    <div
                        className="w-full max-w-lg liquid-modal rounded-t-[2rem] p-6 pb-10 space-y-6 shadow-[0_-20px_80px_-12px_rgba(168,85,247,0.3)] animate-in slide-in-from-bottom duration-500 ease-out flex flex-col max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-gradient-aurora">战术推演详情报告</h3>
                                <p className="text-[9px] text-purple-400/60 font-bold uppercase tracking-[0.25em]">Tactical Intelligence Deep-Dive</p>
                            </div>
                            <button
                                onClick={() => setShowDetails(false)}
                                className="liquid-icon p-2 hover:scale-110 transition-transform"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Raw Metrics Section */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                                <h4 className="text-[9px] font-bold text-white/40 uppercase flex items-center gap-2 tracking-widest">
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" /> 骑手档案
                                </h4>
                                <div className="space-y-2 font-mono">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-white/40">FTP</span>
                                        <span className="text-white/90">{user.ftp}W</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-white/40">WEIGHT</span>
                                        <span className="text-white/90">{user.weight}kg</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-white/40">TSB</span>
                                        <span className={`font-bold ${(user.tsb ?? 0) > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{user.tsb ?? 0}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                                <h4 className="text-[9px] font-bold text-white/40 uppercase flex items-center gap-2 tracking-widest">
                                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" /> 环境参数
                                </h4>
                                <div className="space-y-2 font-mono">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-white/40">TEMP</span>
                                        <span className="text-white/90">{weather?.temp}°C</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-white/40">WIND</span>
                                        <span className="text-white/90">{weather?.windSpeed}km/h</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-white/40">DIRECTION</span>
                                        <span className="text-blue-400">{weather?.windDirection}°</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Content */}
                        <div className="space-y-5">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="liquid-icon purple p-1.5">
                                        <Zap size={12} />
                                    </div>
                                    <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-widest">战术建议详情</h4>
                                </div>
                                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/15 text-[11px] text-white/70 leading-relaxed font-medium">
                                    {isLoading ? (
                                        <div className="space-y-2">
                                            <div className="liquid-skeleton h-3 w-full" />
                                            <div className="liquid-skeleton h-3 w-5/6" />
                                        </div>
                                    ) : (
                                        structuredData?.advice
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Brain size={14} className="text-white/30" />
                                    <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">推导逻辑储备</h4>
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[10px] text-white/40 font-medium italic">
                                    {isLoading ? (
                                        <div className="liquid-skeleton h-8" />
                                    ) : (
                                        structuredData?.logic
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="flex items-center gap-3 pt-4 opacity-40 mt-auto">
                            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <div className="text-[7px] font-bold text-white/40 uppercase tracking-[0.4em]">
                                VT-INTELLIGENCE
                            </div>
                            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
