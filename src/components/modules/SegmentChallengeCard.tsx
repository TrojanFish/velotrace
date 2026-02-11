"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Trophy, ChevronRight, Activity } from "lucide-react";
import { Skeleton } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { useTranslations } from 'next-intl';

interface SegmentEffort {
    name: string;
    rank: number | string;
    time: number;
    distance: number;
}

export function SegmentChallengeCard() {
    const t = useTranslations('Segments');
    const { data: session } = useSession();
    const { stravaSegmentsCache, setStravaSegmentsCache } = useStore();
    const [loading, setLoading] = useState(!stravaSegmentsCache);

    const segments = (stravaSegmentsCache?.data || []) as SegmentEffort[];

    useEffect(() => {
        if (session) {
            // Cache logic: 15 minutes fresh
            const isFresh = stravaSegmentsCache && (Date.now() - stravaSegmentsCache.timestamp < 15 * 60 * 1000);
            if (isFresh) {
                setLoading(false);
                return;
            }

            setLoading(true);
            fetch("/api/strava/segments")
                .then(res => res.json())
                .then(data => {
                    if (!data.error) {
                        setStravaSegmentsCache({
                            data,
                            timestamp: Date.now()
                        });
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [session, stravaSegmentsCache, setStravaSegmentsCache]);

    if (!session) return null;

    if (loading && segments.length === 0) {
        return (
            <div className="pro-card space-y-4 min-h-[140px]">
                <div className="flex justify-between items-center">
                    <Skeleton className="w-24 h-3" />
                    <Skeleton className="w-16 h-2" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex justify-between items-center">
                            <div className="space-y-2">
                                <Skeleton className="w-32 h-4" />
                                <Skeleton className="w-20 h-2" />
                            </div>
                            <Skeleton className="w-12 h-6 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (segments.length === 0) return null;

    return (
        <div className="pro-card space-y-4 min-h-[140px]">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Activity size={14} className="text-purple-400" />
                    <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{t('title')}</h2>
                </div>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{t('subtitle')}</span>
            </div>

            <div className="divide-y divide-slate-800/50">
                {segments.map((s, i) => (
                    <div key={i} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between group">
                        <div className="flex-1 min-w-0 pr-4">
                            <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-purple-400 transition-colors">{s.name}</h4>
                            <p className="text-[10px] text-muted-foreground font-mono">{s.distance}km • {t('time', { min: Math.floor(s.time / 60), sec: s.time % 60 })}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {s.rank !== "-" && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                                    <Trophy size={10} className="text-yellow-500" />
                                    <span className="text-[10px] font-black text-yellow-500 italic">#{s.rank}</span>
                                </div>
                            )}
                            <ChevronRight size={14} className="text-slate-700" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
