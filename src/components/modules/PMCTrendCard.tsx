"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { useStore, DailyLoad, PMCData } from "@/store/useStore";
import { calculatePMC } from "@/lib/calculators/pmc";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    ReferenceLine
} from "recharts";
import { TrendingUp, Activity, Info, RefreshCw, BarChart } from "lucide-react";

export function PMCTrendCard() {
    const { data: session } = useSession();
    const { dailyLoads, setDailyLoads } = useStore();
    const [isSyncing, setIsSyncing] = useState(false);

    const pmcData = useMemo(() => calculatePMC(dailyLoads), [dailyLoads]);
    const latest = pmcData.length > 0 ? pmcData[pmcData.length - 1] : null;

    // Last 30 days for the chart to keep it clean on mobile
    const chartData = useMemo(() => pmcData.slice(-30), [pmcData]);

    const syncHistory = async () => {
        if (!session) return;
        setIsSyncing(true);
        try {
            const res = await fetch("/api/strava/history");
            const data = await res.json();
            if (data.dailyLoads) {
                setDailyLoads(data.dailyLoads);
            }
        } catch (err) {
            console.error("Sync history failed:", err);
        } finally {
            setIsSyncing(false);
        }
    };

    if (!session) return null;

    return (
        <div className="pro-card border-emerald-500/20 bg-emerald-500/5 space-y-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-emerald-500/5 blur-3xl rounded-full" />

            {/* Header */}
            <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-400" />
                    <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">体能管理动态 (PMC)</h2>
                </div>
                <button
                    onClick={syncHistory}
                    disabled={isSyncing}
                    className="p-1 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded text-[9px] font-black uppercase text-emerald-400 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={10} className={isSyncing ? "animate-spin" : ""} />
                    {isSyncing ? "同步中" : "同步历史"}
                </button>
            </div>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-3 gap-3 relative z-10">
                <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/40 text-center">
                    <p className="text-[7px] text-slate-500 font-black uppercase tracking-widest mb-1">Fitness (CTL)</p>
                    <p className="text-xl font-black italic text-purple-400">{latest?.ctl || '--'}</p>
                </div>
                <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/40 text-center">
                    <p className="text-[7px] text-slate-500 font-black uppercase tracking-widest mb-1">Fatigue (ATL)</p>
                    <p className="text-xl font-black italic text-orange-400">{latest?.atl || '--'}</p>
                </div>
                <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/40 text-center">
                    <p className="text-[7px] text-slate-500 font-black uppercase tracking-widest mb-1">Form (TSB)</p>
                    <p className={`text-xl font-black italic ${latest && latest.tsb > 5 ? 'text-emerald-400' : latest && latest.tsb < -10 ? 'text-rose-500' : 'text-slate-200'}`}>
                        {latest ? (latest.tsb > 0 ? `+${latest.tsb}` : latest.tsb) : '--'}
                    </p>
                </div>
            </div>

            {/* Chart Area */}
            <div className="h-[180px] w-full mt-4 -mx-2 relative z-10">
                {dailyLoads.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCtl" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 8, fill: '#475569' }}
                                tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                hide
                                domain={['dataMin - 5', 'dataMax + 5']}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderColor: '#1e293b',
                                    fontSize: '10px',
                                    borderRadius: '8px',
                                    fontWeight: 'bold'
                                }}
                                itemStyle={{ padding: '0px' }}
                            />
                            {/* ATL Line - Fatigue (More volatile) */}
                            <Area
                                type="monotone"
                                dataKey="atl"
                                stroke="#f97316"
                                strokeWidth={1}
                                strokeDasharray="4 4"
                                fill="transparent"
                                dot={false}
                            />
                            {/* CTL Area - Fitness (Long term trend) */}
                            <Area
                                type="monotone"
                                dataKey="ctl"
                                stroke="#a855f7"
                                strokeWidth={3}
                                strokeOpacity={1}
                                fillOpacity={1}
                                fill="url(#colorCtl)"
                                dot={false}
                            />
                            {/* TSB - Form (Zero line indicator) */}
                            <ReferenceLine y={0} stroke="#475569" strokeWidth={0.5} strokeDasharray="3 3" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                        <BarChart size={32} className="text-slate-700 mb-2" />
                        <p className="text-[10px] text-slate-500 uppercase font-black">同步历史数据以生成趋势图</p>
                    </div>
                )}
            </div>

            {/* Status Guide */}
            <div className="pt-4 border-t border-slate-800/60 flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-slate-500">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-0.5 bg-purple-500" />
                        <span>Fitness</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-0.5 bg-orange-500 dashed border-t border-dashed" />
                        <span>Fatigue</span>
                    </div>
                </div>
                <div className="text-emerald-500/80 italic font-black">
                    {latest && latest.tsb > 5 ? "状态极佳: 适合比赛" : latest && latest.tsb < -20 ? "过度疲劳: 注意恢复" : "体能建设期"}
                </div>
            </div>
        </div>
    );
}
