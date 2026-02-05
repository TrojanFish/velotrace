"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { BarChart3, Map, Mountain, Trophy } from "lucide-react";
import { Skeleton } from "@/lib/utils";

interface WeeklyStats {
    distance: number;
    elevation: number;
    count: number;
}

export function WeeklyStatsCard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<WeeklyStats | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (session) {
            setLoading(true);
            fetch("/api/strava/stats")
                .then((res) => {
                    if (res.status === 401) return { error: "Expired" };
                    return res.json();
                })
                .then((data) => {
                    if (!data.error) setStats(data);
                })
                .finally(() => setLoading(false));
        }
    }, [session]);

    if (!session) return null;

    if (loading && !stats) {
        return (
            <div className="pro-card bg-orange-500/5 border-orange-500/10 space-y-4 min-h-[140px]">
                <div className="flex justify-between items-center">
                    <Skeleton className="w-24 h-3" />
                    <Skeleton className="w-16 h-4 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Skeleton className="w-12 h-2" />
                        <Skeleton className="w-20 h-8" />
                    </div>
                    <div className="space-y-2 flex flex-col items-end">
                        <Skeleton className="w-12 h-2" />
                        <Skeleton className="w-20 h-8" />
                    </div>
                </div>
                <Skeleton className="w-full h-1 mt-4" />
            </div>
        );
    }

    return (
        <div className="pro-card bg-orange-500/5 border-orange-500/10 space-y-4 min-h-[140px]">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <BarChart3 size={14} className="text-orange-500" />
                    <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">本周训练进度</h2>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/10 rounded-full text-orange-400">
                    <Trophy size={10} />
                    <span className="text-[8px] font-bold uppercase tracking-tighter">{stats?.count || 0} 次骑行</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Map size={12} />
                        <span className="text-[10px] uppercase font-bold tracking-wider">本周里程</span>
                    </div>
                    <div className="text-2xl font-black italic tracking-tighter text-slate-100">
                        {stats?.distance || 0}
                        <span className="text-xs font-normal text-muted-foreground not-italic ml-1 uppercase">km</span>
                    </div>
                </div>
                <div className="space-y-1 text-right">
                    <div className="flex items-center gap-1.5 text-muted-foreground justify-end">
                        <Mountain size={12} />
                        <span className="text-[10px] uppercase font-bold tracking-wider">累计爬升</span>
                    </div>
                    <div className="text-2xl font-black italic tracking-tighter text-slate-100">
                        {stats?.elevation || 0}
                        <span className="text-xs font-normal text-muted-foreground not-italic ml-1 uppercase">m</span>
                    </div>
                </div>
            </div>

            {/* Progress Bar (Target 200km) */}
            <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span>周目标完成度</span>
                    <span>{Math.round(((stats?.distance || 0) / 200) * 100)}%</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-1000"
                        style={{ width: `${Math.min(((stats?.distance || 0) / 200) * 100, 100)}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
