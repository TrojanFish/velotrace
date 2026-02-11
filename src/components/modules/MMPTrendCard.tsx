"use client";

import { useStore } from "@/store/useStore";
import { COGGAN_STANDARDS, getRank } from "@/lib/calculators/powerProfiles";
import {
    ResponsiveContainer,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
} from "recharts";
import { Trophy, TrendingUp, Info, Edit3, Check, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from 'next-intl';

export function MMPTrendCard() {
    const t = useTranslations('MMP');
    const { user, updateUser } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const [tempMmp, setTempMmp] = useState(user?.mmp || { "5s": 0, "1m": 0, "5m": 0, "20m": 0 });

    const mmpData = useMemo(() => {
        // Fallback for missing MMP record in persisted store
        const mmp = user?.mmp || { "5s": 0, "1m": 0, "5m": 0, "20m": 0 };
        return [
            { key: "5s", label: t('labels.sprint'), power: mmp["5s"] },
            { key: "1m", label: t('labels.anaerobic'), power: mmp["1m"] },
            { key: "5m", label: t('labels.vo2'), power: mmp["5m"] },
            { key: "20m", label: t('labels.ftp'), power: mmp["20m"] },
        ].map(d => {
            const dur = d.key === "5s" ? 5 : d.key === "1m" ? 60 : d.key === "5m" ? 300 : 1200;
            const weight = user?.weight || 70;
            const wKg = parseFloat((d.power / weight).toFixed(2));
            return {
                ...d,
                duration: dur,
                wKg,
                rank: getRank(wKg, dur)
            };
        });
    }, [user?.mmp, user?.weight]);

    if (!user) return <div className="pro-card flex items-center justify-center py-12"><Loader2 className="animate-spin text-orange-500" /></div>;

    const radarData = mmpData.map(d => ({
        subject: d.key,
        A: (d.wKg / COGGAN_STANDARDS.WorldTour[d.duration]) * 100,
        fullMark: 100,
    }));

    const handleSave = () => {
        updateUser({ mmp: tempMmp });
        setIsEditing(false);
    };

    return (
        <div className="pro-card border-slate-800/40 bg-slate-900/20 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-500/20 rounded-lg border border-orange-500/30">
                        <Trophy size={14} className="text-orange-500" />
                    </div>
                    <h2 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">
                        {t('title')}
                    </h2>
                </div>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                    {isEditing ? <Check size={14} className="text-emerald-400" /> : <Edit3 size={14} />}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[220px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="#1e293b" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                            <Radar
                                name="Rider"
                                dataKey="A"
                                stroke="#f97316"
                                fill="#f97316"
                                fillOpacity={0.4}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                    {mmpData.map((d) => (
                        <div key={d.key} className="flex items-center justify-between p-3 bg-slate-950/40 rounded-2xl border border-slate-800/50 transition-all hover:border-slate-700">
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-slate-500 uppercase">{d.label}</p>
                                {isEditing ? (
                                    <div className="flex items-center gap-1 mt-1">
                                        <input
                                            type="number"
                                            className="w-16 bg-slate-900 border border-slate-700 rounded px-1 text-xs font-black text-orange-400"
                                            value={tempMmp[d.key as keyof typeof tempMmp]}
                                            onChange={(e) => setTempMmp({ ...tempMmp, [d.key]: parseInt(e.target.value) || 0 })}
                                        />
                                        <span className="text-[10px] font-black text-slate-600">W</span>
                                    </div>
                                ) : (
                                    <p className="text-sm font-black italic text-slate-200">{d.power}W</p>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-slate-400 leading-none">{d.wKg} <span className="text-[8px] text-slate-600">W/KG</span></p>
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter mt-1 inline-block ${d.rank === 'WorldTour' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                    d.rank === 'Pro' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                                        'bg-slate-800 text-slate-400'
                                    }`}>
                                    {t(`ranks.${d.rank}`)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-slate-800/50">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={12} className="text-emerald-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('analysis')}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400 italic">
                    {mmpData.some(d => d.rank === 'WorldTour' || d.rank === 'Pro')
                        ? t('insights.pro')
                        : t('insights.improving')}
                </p>
            </div>
        </div>
    );
}
