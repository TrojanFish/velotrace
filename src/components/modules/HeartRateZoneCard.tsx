"use client";

import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { calculateHRZones } from "@velotrace/logic";
import { Activity, Info, Heart } from "lucide-react";
import { useTranslations } from 'next-intl';

export function HeartRateZoneCard() {
    const t = useTranslations('HeartRateZones');
    const { user } = useStore();
    const zones = useMemo(() => calculateHRZones(user.age, user.restingHR), [user.age, user.restingHR]);

    return (
        <div className="pro-card border-rose-500/20 bg-rose-500/5 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Heart size={14} className="text-rose-500 fill-rose-500/20" />
                        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{t('title')}</h2>
                    </div>
                    <p className="text-2xl font-black italic text-slate-100">
                        {user.restingHR} <span className="text-xs font-normal text-slate-500 not-italic uppercase">{t('rhrLabel')}</span>
                    </p>
                </div>
                <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
                    <Activity size={20} className="text-rose-500" />
                </div>
            </div>

            <div className="space-y-2">
                {zones.map((zone) => (
                    <div key={zone.level} className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-xl border border-slate-800/40 hover:border-rose-500/30 transition-all group">
                        <div className={`w-10 h-10 rounded-lg bg-slate-950 flex flex-col items-center justify-center border border-slate-800 group-hover:border-rose-500/50 transition-colors`}>
                            <span className={`text-[10px] font-black ${zone.color}`}>Z{zone.level}</span>
                            <div className={`w-4 h-0.5 rounded-full ${zone.color.replace('text-', 'bg-')} opacity-50`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                                <span className="text-xs font-black text-slate-200 truncate uppercase tracking-tight">{t(`zones.z${zone.level}.name`)}</span>
                                <span className="text-sm font-mono font-black text-rose-400">
                                    {zone.range[0]}<span className="text-[10px] text-slate-600 mx-0.5">-</span>{zone.range[1]}
                                </span>
                            </div>
                            <p className="text-[9px] text-slate-500 font-medium truncate leading-none uppercase tracking-tighter">
                                {t(`zones.z${zone.level}.description`)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-4 border-t border-slate-800/50 flex gap-3">
                <Info size={14} className="text-slate-500 shrink-0 mt-0.5" />
                <p className="text-[9px] text-slate-500 leading-normal uppercase font-medium">
                    {t('info')}
                </p>
            </div>
        </div>
    );
}
