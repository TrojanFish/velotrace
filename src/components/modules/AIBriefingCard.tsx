"use client";

import { useStore } from "@/store/useStore";
import { useWeather } from "@/hooks/useWeather";
import { Brain, Sparkles, ChevronRight, Loader2, ThermometerSun, Wind, Zap } from "lucide-react";
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
            const data = await res.json();
            setStructuredData(data);
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
        if (!structuredData && !weatherLoading && weather) {
            generateBriefing();
        }
    }, [weatherLoading, weather]);

    return (
        <>
            <div className="pro-card border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-slate-900/40 to-slate-900/20 overflow-hidden relative group">
                {/* Background Decorative Element */}
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Brain size={80} className="text-purple-400" />
                </div>

                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-purple-500/20 rounded-lg border border-purple-500/30">
                            <Sparkles size={14} className="text-purple-400 animate-pulse" />
                        </div>
                        <h2 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">
                            AI 战术简报 / Tactical Briefing
                        </h2>
                    </div>
                    {isLoading && <Loader2 size={14} className="animate-spin text-purple-400" />}
                </div>

                {/* Main Actionable Area - Redesigned for At-a-Glance readability */}
                <div className="space-y-3 relative z-10 mb-6 min-h-[90px]">
                    {isLoading ? (
                        <div className="space-y-3 py-2">
                            <div className="h-5 w-full bg-slate-800 animate-pulse rounded-lg" />
                            <div className="h-5 w-4/5 bg-slate-800 animate-pulse rounded-lg" />
                            <div className="h-5 w-3/5 bg-slate-800 animate-pulse rounded-lg" />
                        </div>
                    ) : structuredData ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-4 group/row">
                                <div className="w-16 p-1 bg-purple-500/10 border border-purple-500/20 rounded-md text-[9px] font-black text-purple-400 text-center uppercase tracking-tighter">Session</div>
                                <span className="flex-1 text-sm font-black text-slate-100 italic tracking-tight truncate pr-4 group-hover/row:text-purple-300 transition-colors uppercase">
                                    {structuredData.session}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 group/row">
                                <div className="w-16 p-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[9px] font-black text-emerald-400 text-center uppercase tracking-tighter">Target</div>
                                <span className="flex-1 text-sm font-mono font-black text-slate-300 tracking-tighter truncate pr-4">
                                    {structuredData.intensity}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 group/row">
                                <div className="w-16 p-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md text-[9px] font-black text-cyan-400 text-center uppercase tracking-tighter">Focus</div>
                                <span className="flex-1 text-sm font-bold text-slate-400 tracking-tight italic uppercase truncate pr-4">
                                    {structuredData.goal}
                                </span>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Sub Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/50">
                    <div className="bg-slate-950/40 rounded-lg p-2 text-center">
                        <span className="block text-[7px] text-slate-600 uppercase font-black mb-0.5">形态 / Form</span>
                        <span className="text-[10px] text-cyan-400 font-black italic">{(user.tsb ?? 0) > 0 ? '+' : ''}{user.tsb ?? 0} TSB</span>
                    </div>
                    <div className="bg-slate-950/40 rounded-lg p-2 text-center">
                        <span className="block text-[7px] text-slate-600 uppercase font-black mb-0.5">体感 / Feeling</span>
                        <span className="text-[10px] text-orange-400 font-black italic">{weather?.temp || '--'}°C</span>
                    </div>
                    <div className="bg-slate-950/40 rounded-lg p-2 text-center">
                        <span className="block text-[7px] text-slate-600 uppercase font-black mb-0.5">风阻 / Aero</span>
                        <span className="text-[10px] text-blue-400 font-black italic">{(weather?.windSpeed || 0).toFixed(0)} KM/H</span>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-purple-500/20 flex justify-between items-center relative z-10">
                    <span className="text-[8px] font-bold text-purple-400/60 uppercase tracking-[0.2em] italic flex items-center gap-1">
                        BIO-SYNC DATA
                    </span>
                    <button
                        onClick={() => setShowDetails(true)}
                        className="flex items-center gap-1 text-[9px] font-black text-slate-400 hover:text-purple-400 transition-all hover:gap-2"
                    >
                        详情建议 <ChevronRight size={12} />
                    </button>
                </div>
            </div>

            {/* Tactical intelligence Detail Overlay */}
            {showDetails && (
                <div
                    className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/80 backdrop-blur-md transition-all animate-in fade-in duration-300"
                    onClick={() => setShowDetails(false)}
                >
                    <div
                        className="w-full max-w-lg bg-slate-900 border-t border-purple-500/30 rounded-t-[2.5rem] p-8 pb-12 space-y-8 shadow-[0_-20px_50px_-12px_rgba(168,85,247,0.2)] animate-in slide-in-from-bottom duration-500 ease-out flex flex-col max-h-[90vh] overflow-y-auto scrollbar-hide"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">战术推演详情报告</h3>
                                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-[0.3em]">Tactical Intelligence Deep-Dive</p>
                            </div>
                            <button
                                onClick={() => setShowDetails(false)}
                                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Raw Metrics Section */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-3">
                                <h4 className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2 tracking-widest">
                                    <span className="w-1 h-1 bg-cyan-400 rounded-full" /> 骑手档案 / Profile
                                </h4>
                                <div className="space-y-2 font-mono">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-500">FTP</span>
                                        <span className="text-white">{user.ftp}W</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-500">WEIGHT</span>
                                        <span className="text-white">{user.weight}kg</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-500">TSB</span>
                                        <span className={`font-black ${(user.tsb ?? 0) > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{user.tsb ?? 0}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-3">
                                <h4 className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2 tracking-widest">
                                    <span className="w-1 h-1 bg-orange-500 rounded-full" /> 环境参数 / Environment
                                </h4>
                                <div className="space-y-2 font-mono">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-500">TEMP</span>
                                        <span className="text-white">{weather?.temp}°C</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-500">WIND</span>
                                        <span className="text-white">{weather?.windSpeed}km/h</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-500">DIRECTION</span>
                                        <span className="text-blue-400">{weather?.windDirection}°</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Content */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Zap size={14} className="text-purple-400" />
                                    <h4 className="text-[10px] font-black text-slate-200 uppercase tracking-widest">战术建议详情 / Strategic Advice</h4>
                                </div>
                                <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-5 text-[11px] text-slate-300 leading-relaxed font-medium italic">
                                    {isLoading ? (
                                        <div className="animate-pulse space-y-2">
                                            <div className="h-2 w-full bg-slate-800 rounded" />
                                            <div className="h-2 w-5/6 bg-slate-800 rounded" />
                                        </div>
                                    ) : (
                                        structuredData?.advice
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Brain size={14} className="text-slate-500" />
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">推导逻辑储备 / Logical Context</h4>
                                </div>
                                <div className="bg-slate-800/20 border border-slate-800/40 rounded-2xl p-4 text-[10px] text-slate-500 font-medium italic">
                                    {isLoading ? (
                                        <div className="animate-pulse h-8 bg-slate-800 rounded" />
                                    ) : (
                                        structuredData?.logic
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="flex items-center gap-3 py-4 opacity-50 mt-auto">
                            <div className="flex-1 h-[1px] bg-slate-800" />
                            <div className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.5em]">
                                VT-INTELLIGENCE-REPORT
                            </div>
                            <div className="flex-1 h-[1px] bg-slate-800" />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
