"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { useStore } from "@/store/useStore";
import { toPng } from "html-to-image";
import {
    Zap,
    Flame,
    Clock,
    Activity,
    TrendingUp,
    ChevronRight,
    Trophy,
    Heart,
    Dna,
    ShieldCheck,
    BarChart3,
    Share2,
    Download
} from "lucide-react";
import { calculateMetabolism, getRecoveryTime, simulatePowerZones, calculateTSS } from "@/lib/calculators/activityInsight";
import { calculateCdA, getCdARating } from "@/lib/calculators/aerodynamics";
import { Skeleton } from "@/lib/utils";

interface ActivityInsight {
    id: number;
    name: string;
    startTime: string;
    distance: number;
    movingTime: number;
    elapsedTime: number;
    totalElevationGain: number;
    averagePower: number;
    maxPower: number;
    weightedAveragePower: number;
    kilojoules: number;
    averageHeartrate: number;
    maxHeartrate: number;
    calories: number;
    type: string;
    averageSpeed: number;
    hasPower: boolean;
}

export function RideInsightCard() {
    const { data: session } = useSession();
    const { user } = useStore();
    const [activity, setActivity] = useState<ActivityInsight | null>(null);
    const [loading, setLoading] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleShare = async () => {
        if (!cardRef.current) return;
        setIsSharing(true);
        try {
            // Give it a tiny bit of time for any transition to settle
            await new Promise(r => setTimeout(r, 100));

            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                backgroundColor: '#0f172a', // Match theme background
                style: {
                    borderRadius: '0' // Cards usually don't want rounded corners when shared as full image
                }
            });

            const link = document.createElement('a');
            link.download = `VeloTrace-Insight-${activity?.id || 'Ride'}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Failed to share:', err);
            alert('战报预览生成失败，请稍后重试');
        } finally {
            setIsSharing(false);
        }
    };

    useEffect(() => {
        if (session) {
            setLoading(true);
            fetch("/api/strava/latest-activity")
                .then(res => {
                    if (res.status === 401) {
                        // Handle session expiry
                        return { error: "Session expired" };
                    }
                    return res.json();
                })
                .then(data => {
                    if (!data.error) setActivity(data);
                    else if (data.count === 0) setActivity(null); // Explicitly empty
                })
                .finally(() => setLoading(false));
        }
    }, [session]);

    const metabolism = useMemo(() => {
        if (!activity || !user.ftp) return null;
        const avgPower = activity.weightedAveragePower || activity.averagePower || (user.ftp * 0.6);
        return calculateMetabolism(avgPower, user.ftp, activity.movingTime / 3600);
    }, [activity, user.ftp]);

    const recoveryTime = useMemo(() => {
        if (!activity || !user.ftp) return 1;
        const intensity = (activity.weightedAveragePower || activity.averagePower) / user.ftp;
        return getRecoveryTime(intensity || 0.6, activity.movingTime / 3600);
    }, [activity, user.ftp]);

    const tss = useMemo(() => {
        if (!activity || !user.ftp) return 0;
        return calculateTSS(activity.weightedAveragePower, activity.averagePower, user.ftp, activity.movingTime);
    }, [activity, user.ftp]);

    const powerDistribution = useMemo(() => {
        if (!activity || !user.ftp) return null;
        return simulatePowerZones(activity.averagePower, activity.maxPower, user.ftp);
    }, [activity, user.ftp]);

    const cdaData = useMemo(() => {
        if (!activity || !activity.averagePower || !activity.averageSpeed) return null;
        const bike = user.ftp > 0 ? (user as any).activeBike : null; // Rough fallback
        const bikeWeight = 8.5; // Default if not found

        const cda = calculateCdA({
            power: activity.averagePower,
            speed: activity.averageSpeed,
            riderWeight: user.weight,
            bikeWeight: bikeWeight
        });
        const rating = getCdARating(cda);
        return { value: cda, rating };
    }, [activity, user]);

    if (!session) return null;

    if (loading && !activity) {
        return <div className="pro-card min-h-[300px] space-y-4">
            <Skeleton className="w-1/2 h-4" />
            <Skeleton className="w-full h-32" />
            <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
            </div>
        </div>;
    }

    if (!activity) {
        if (loading) return (
            <div className="pro-card min-h-[200px] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            </div>
        );

        return (
            <div className="pro-card border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-600">
                    <Activity size={24} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-300">暂无骑行数据</h3>
                    <p className="text-[10px] text-slate-500 uppercase mt-1">请完成首次运动同步或检查 Strava 连接</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                    点击重试
                </button>
            </div>
        );
    }

    const formattedDate = new Date(activity.startTime).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
    });

    // Mocking training status
    const trainingStatus = { fitness: 42, fatigue: 28, form: 14 };
    const zoneColors = ['bg-slate-500', 'bg-blue-500', 'bg-emerald-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-purple-600'];

    return (
        <div className="space-y-2">
            <div className="flex justify-end px-1">
                <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                >
                    {isSharing ? (
                        <div className="w-3 h-3 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                    ) : (
                        <Share2 size={12} />
                    )}
                    {isSharing ? '生成中...' : '分享战报'}
                </button>
            </div>

            <div
                ref={cardRef}
                className="pro-card border-purple-500/20 bg-purple-500/5 overflow-hidden relative group p-6"
            >
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />

                <div className="relative space-y-5">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center px-1">
                        <div className="flex gap-4">
                            <div className="flex flex-col">
                                <span className="text-[7px] text-slate-500 uppercase font-black tracking-widest">Fitness (CTL)</span>
                                <span className="text-xs font-black italic text-purple-400">{trainingStatus.fitness}</span>
                            </div>
                            <div className="flex flex-col border-l border-slate-800 pl-4">
                                <span className="text-[7px] text-slate-500 uppercase font-black tracking-widest">Fatigue (ATL)</span>
                                <span className="text-xs font-black italic text-orange-400">{trainingStatus.fatigue}</span>
                            </div>
                            <div className="flex flex-col border-l border-slate-800 pl-4">
                                <span className="text-[7px] text-slate-500 uppercase font-black tracking-widest">Balance (TSB)</span>
                                <span className="text-xs font-black italic text-emerald-400">+{trainingStatus.form}</span>
                            </div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between items-start border-t border-slate-800/50 pt-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Dna size={14} className="text-purple-400" />
                                <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">物理引擎复盘</h2>
                            </div>
                            <h3 className="text-sm font-black italic uppercase text-slate-100 truncate max-w-[180px]">
                                {activity.name}
                            </h3>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-[10px] font-black italic text-purple-400">
                                RP {activity.hasPower ? Math.round((activity.weightedAveragePower || activity.averagePower) / user.ftp * 100) : '--'}
                            </div>
                            <span className="text-[8px] text-slate-500 uppercase mt-1">强度系数 IF: {activity.hasPower ? ((activity.weightedAveragePower || activity.averagePower) / user.ftp).toFixed(2) : '--'}</span>
                        </div>
                    </div>

                    {/* Peak Power Row */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center justify-center p-2 bg-slate-900/40 rounded-lg border border-slate-800/40">
                            <span className="text-[8px] font-bold text-slate-500 uppercase">⚡ 15s Peak</span>
                            <span className="text-xs font-black italic text-slate-200">{activity.maxPower ? Math.round(activity.maxPower * 0.9) : '--'}w</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 bg-slate-900/40 rounded-lg border border-slate-800/40">
                            <span className="text-[8px] font-bold text-slate-500 uppercase">⚡ 1min Peak</span>
                            <span className="text-xs font-black italic text-slate-200">{activity.averagePower ? Math.round(activity.averagePower * 1.25) : '--'}w</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 bg-slate-900/40 rounded-lg border border-slate-800/40">
                            <span className="text-[8px] font-bold text-slate-500 uppercase">📊 Load (TSS)</span>
                            <span className="text-xs font-black italic text-cyan-400">{tss || '--'}</span>
                        </div>
                    </div>

                    {/* Power Zones Bar */}
                    {powerDistribution && (
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <BarChart3 size={12} className="text-slate-500" />
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">功率分区分布 (Zones)</span>
                            </div>
                            <div className="flex h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                                {powerDistribution.map((percent, i) => (
                                    <div key={i} className={`${zoneColors[i]} h-full transition-all duration-1000`} style={{ width: `${percent}%` }} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Metabolism & Aero Row */}
                    <div className="grid grid-cols-2 gap-3">
                        {metabolism && (
                            <div className="space-y-2 p-3 bg-slate-950/40 rounded-xl border border-slate-800/40">
                                <div className="flex justify-between items-end mb-1">
                                    <div className="flex items-center gap-1.5">
                                        <Flame size={12} className="text-orange-500" />
                                        <span className="text-[8px] font-black text-slate-300 uppercase italic">Fuel System</span>
                                    </div>
                                </div>
                                <div className="flex h-1.5 w-full rounded-full bg-slate-900 overflow-hidden p-0.5">
                                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${metabolism.fatPercent}%` }} />
                                    <div className="h-full bg-cyan-500 rounded-full ml-0.5" style={{ width: `${metabolism.carbPercent}%` }} />
                                </div>
                                <div className="flex justify-between text-[7px] font-bold uppercase mt-1">
                                    <span className="text-orange-500">FAT {metabolism.fatPercent}%</span>
                                    <span className="text-cyan-400">CARB {metabolism.carbPercent}%</span>
                                </div>
                            </div>
                        )}

                        {cdaData && (
                            <div className="space-y-2 p-3 bg-slate-950/40 rounded-xl border border-slate-800/40">
                                <div className="flex justify-between items-end mb-1">
                                    <div className="flex items-center gap-1.5">
                                        <Zap size={12} className="text-cyan-400" />
                                        <span className="text-[8px] font-black text-slate-300 uppercase italic">Virtual CdA</span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black italic text-cyan-400">{cdaData.value.toFixed(3)}</span>
                                    <span className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter">{cdaData.rating}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-2">
                            <Clock size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[8px] font-bold text-slate-500 uppercase">恢复建议</p>
                                <p className="text-xs font-black italic text-slate-100">{recoveryTime} 小时</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <TrendingUp size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[8px] font-bold text-slate-500 uppercase">下次建议</p>
                                <p className="text-[10px] font-bold text-slate-300 leading-tight">
                                    {recoveryTime > 24 ? "低强度恢复骑行" : "冲击 Z3/Z4 间歇"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-50" />

                {/* Watermark for sharing */}
                <div className="mt-6 pt-4 border-t border-slate-800/50 flex justify-between items-center opacity-70">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                            <Zap size={10} className="text-white fill-white" />
                        </div>
                        <span className="text-[10px] font-black italic tracking-tighter text-slate-200">VELOTRACE PRO</span>
                    </div>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Powered by VeloTrace Insight Engine</span>
                </div>
            </div>
        </div>
    );
}
