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
import { useTranslations } from 'next-intl';
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
    const t = useTranslations('RideInsight');
    const { data: session } = useSession();
    const { user } = useStore();
    const [activity, setActivity] = useState<ActivityInsight | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (session) {
            setLoading(true);
            setError(null);
            fetch("/api/strava/latest-activity")
                .then(res => {
                    if (res.status === 401) return { error: "Session expired" };
                    return res.json();
                })
                .then(data => {
                    if (!data.error) {
                        setActivity(data);
                    } else if (data.count === 0) {
                        setActivity(null);
                    } else {
                        setError(data.error);
                        setActivity(null);
                    }
                })
                .catch(err => setError("Network error"))
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
        const cda = calculateCdA({
            power: activity.averagePower,
            speed: activity.averageSpeed,
            riderWeight: user.weight,
            bikeWeight: 8.5
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
        return (
            <div className="pro-card border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${error ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-800 text-slate-600'}`}>
                    <Activity size={24} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-300">{error ? t('empty.error') : t('empty.title')}</h3>
                    <p className="text-[10px] text-slate-500 uppercase mt-1">
                        {error ? t('empty.errorDetail', { error }) : t('empty.desc')}
                    </p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                    {t('empty.retry')}
                </button>
            </div>
        );
    }

    const trainingStatus = {
        fitness: user.ctl || 0,
        fatigue: user.atl || 0,
        form: user.tsb || 0
    };
    const zoneColors = ['bg-slate-500', 'bg-blue-500', 'bg-emerald-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-purple-600'];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="w-1 h-3 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
                <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t('title')}</h2>
            </div>

            <div
                className="pro-card border-purple-500/20 bg-purple-500/5 overflow-hidden relative group p-6"
            >
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />

                <div className="relative space-y-5">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center px-1">
                        <div className="flex gap-4">
                            <div className="flex flex-col">
                                <span className="text-[7px] text-slate-500 uppercase font-black tracking-widest">{t('fitness')}</span>
                                <span className="text-xs font-black italic text-purple-400">{trainingStatus.fitness}</span>
                            </div>
                            <div className="flex flex-col border-l border-slate-800 pl-4">
                                <span className="text-[7px] text-slate-500 uppercase font-black tracking-widest">{t('fatigue')}</span>
                                <span className="text-xs font-black italic text-orange-400">{trainingStatus.fatigue}</span>
                            </div>
                            <div className="flex flex-col border-l border-slate-800 pl-4">
                                <span className="text-[7px] text-slate-500 uppercase font-black tracking-widest">{t('balance')}</span>
                                <span className="text-xs font-black italic text-emerald-400">{(trainingStatus.form > 0 ? '+' : '') + trainingStatus.form}</span>
                            </div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between items-start border-t border-slate-800/50 pt-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Dna size={14} className="text-purple-400" />
                                <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest">{t('engineTitle')}</h2>
                            </div>
                            <h3 className="text-sm font-black italic uppercase text-slate-100 truncate max-w-[180px]">
                                {activity.name}
                            </h3>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-[10px] font-black italic text-purple-400">
                                RP {activity.hasPower ? Math.round((activity.weightedAveragePower || activity.averagePower) / user.ftp * 100) : '--'}
                            </div>
                            <span className="text-[8px] text-slate-500 uppercase mt-1">{t('ifLabel')}: {activity.hasPower ? ((activity.weightedAveragePower || activity.averagePower) / user.ftp).toFixed(2) : '--'}</span>
                        </div>
                    </div>

                    {/* Peak Power Row */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center justify-center p-2 bg-slate-900/40 rounded-lg border border-slate-800/40">
                            <span className="text-[8px] font-bold text-slate-500 uppercase">{t('peak15s')}</span>
                            <span className="text-xs font-black italic text-slate-200">{activity.maxPower ? Math.round(activity.maxPower * 0.9) : '--'}w</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 bg-slate-900/40 rounded-lg border border-slate-800/40">
                            <span className="text-[8px] font-bold text-slate-500 uppercase">{t('peak1m')}</span>
                            <span className="text-xs font-black italic text-slate-200">{activity.averagePower ? Math.round(activity.averagePower * 1.25) : '--'}w</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 bg-slate-900/40 rounded-lg border border-slate-800/40">
                            <span className="text-[8px] font-bold text-slate-500 uppercase">{t('load')}</span>
                            <span className="text-xs font-black italic text-cyan-400">{tss || '--'}</span>
                        </div>
                    </div>

                    {/* Power Zones Bar */}
                    {powerDistribution && (
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <BarChart3 size={12} className="text-slate-500" />
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{t('zonesLabel')}</span>
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
                                        <span className="text-[8px] font-black text-slate-300 uppercase italic">{t('fuelSystem')}</span>
                                    </div>
                                </div>
                                <div className="flex h-1.5 w-full rounded-full bg-slate-900 overflow-hidden p-0.5">
                                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${metabolism.fatPercent}%` }} />
                                    <div className="h-full bg-cyan-500 rounded-full ml-0.5" style={{ width: `${metabolism.carbPercent}%` }} />
                                </div>
                                <div className="flex justify-between text-[7px] font-bold uppercase mt-1">
                                    <span className="text-orange-500">{t('fat')} {metabolism.fatPercent}%</span>
                                    <span className="text-cyan-400">{t('carb')} {metabolism.carbPercent}%</span>
                                </div>
                            </div>
                        )}

                        {cdaData && (
                            <div className="space-y-2 p-3 bg-slate-950/40 rounded-xl border border-slate-800/40">
                                <div className="flex justify-between items-end mb-1">
                                    <div className="flex items-center gap-1.5">
                                        <Zap size={12} className="text-cyan-400" />
                                        <span className="text-[8px] font-black text-slate-300 uppercase italic">{t('vCda')}</span>
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
                                <p className="text-[8px] font-bold text-slate-500 uppercase">{t('recoveryTitle')}</p>
                                <p className="text-xs font-black italic text-slate-100">{t('hours', { count: recoveryTime })}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <TrendingUp size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[8px] font-bold text-slate-500 uppercase">{t('nextTitle')}</p>
                                <p className="text-[10px] font-bold text-slate-300 leading-tight">
                                    {recoveryTime > 24 ? t('nextAdvice.recovery') : t('nextAdvice.interval')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-50" />

            </div>
        </div>
    );
}
