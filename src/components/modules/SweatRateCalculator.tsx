"use client";

import { useState, useMemo } from "react";
import { calculateSweatRate, SweatRateInput } from "@/lib/calculators/sweatRate";
import { Droplets, Info, AlertTriangle, CheckCircle2, Scale, Clock, Beer } from "lucide-react";
import { useTranslations } from 'next-intl';

export function SweatRateCalculator() {
    const t = useTranslations('SweatRate');
    const [preWeight, setPreWeight] = useState<number>(70);
    const [postWeight, setPostWeight] = useState<number>(69.2);
    const [fluidIntake, setFluidIntake] = useState<number>(0.75); // L
    const [urineLoss, setUrineLoss] = useState<number>(0); // L
    const [duration, setDuration] = useState<number>(120); // min

    const result = useMemo(() => {
        return calculateSweatRate({
            preWeight,
            postWeight,
            fluidIntake,
            urineLoss,
            durationMinutes: duration
        });
    }, [preWeight, postWeight, fluidIntake, urineLoss, duration]);

    const getIntensityColor = (intensity: string) => {
        switch (intensity) {
            case 'low': return 'text-emerald-400';
            case 'moderate': return 'text-cyan-400';
            case 'high': return 'text-orange-400';
            case 'extreme': return 'text-rose-500';
            default: return 'text-white';
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                {/* Inputs */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[8px] font-bold text-white/30 uppercase tracking-widest">
                            <Scale size={10} /> {t('labels.preWeight')}
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={preWeight}
                            onChange={(e) => setPreWeight(parseFloat(e.target.value) || 0)}
                            className="liquid-input h-10 text-sm font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[8px] font-bold text-white/30 uppercase tracking-widest">
                            <Scale size={10} /> {t('labels.postWeight')}
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={postWeight}
                            onChange={(e) => setPostWeight(parseFloat(e.target.value) || 0)}
                            className="liquid-input h-10 text-sm font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[8px] font-bold text-white/30 uppercase tracking-widest">
                            <Clock size={10} /> {t('labels.duration')}
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min="30"
                                max="480"
                                step="15"
                                value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value))}
                                className="range-slider flex-1"
                            />
                            <span className="text-xs font-mono font-bold text-cyan-400 w-12 text-right">{duration}m</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[8px] font-bold text-white/30 uppercase tracking-widest">
                            <Beer size={10} /> {t('labels.fluidIntake')}
                        </label>
                        <input
                            type="number"
                            step="0.05"
                            value={fluidIntake}
                            onChange={(e) => setFluidIntake(parseFloat(e.target.value) || 0)}
                            className="liquid-input h-10 text-sm font-mono text-cyan-400"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[8px] font-bold text-white/30 uppercase tracking-widest">
                            <Droplets size={10} /> {t('labels.urineLoss')}
                        </label>
                        <input
                            type="number"
                            step="0.05"
                            value={urineLoss}
                            onChange={(e) => setUrineLoss(parseFloat(e.target.value) || 0)}
                            className="liquid-input h-10 text-sm font-mono opacity-60 focus:opacity-100"
                        />
                    </div>
                    <div className="pro-card bg-white/5 py-4 flex flex-col items-center justify-center border-dashed">
                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">{t('dehydration')}</p>
                        <p className={`text-xl font-mono font-black ${result.dehydrationPercent > 2 ? 'text-rose-500' : 'text-emerald-400'}`}>
                            {result.dehydrationPercent}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Results Display */}
            <div className="pro-card p-0 overflow-hidden bg-gradient-to-br from-white/[0.05] to-transparent">
                <div className="p-5 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className={`liquid-icon p-2 ${getIntensityColor(result.intensity).replace('text-', '')}`}>
                            <Droplets size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{t('analytics')}</p>
                            <p className="text-sm font-bold text-white/90">{t('indicator')}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={`text-2xl font-black italic tracking-tighter ${getIntensityColor(result.intensity)}`}>
                            {result.sweatRate} <span className="text-[10px] uppercase not-italic opacity-40">L/Hour</span>
                        </p>
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    <div className="flex gap-3">
                        <div className="mt-1">
                            {result.dehydrationPercent > 2 ? (
                                <AlertTriangle size={14} className="text-rose-500" />
                            ) : (
                                <CheckCircle2 size={14} className="text-emerald-400" />
                            )}
                        </div>
                        <p className="text-[10px] text-white/60 leading-relaxed font-medium">
                            {t(`recommendations.${result.recommendation}`)}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5">
                            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">{t('totalLoss')}</p>
                            <p className="text-sm font-mono font-bold text-white/80">{result.totalLoss} L</p>
                        </div>
                        <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5">
                            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mb-1">{t('intensityEvaluation')}</p>
                            <p className={`text-sm font-bold uppercase tracking-widest ${getIntensityColor(result.intensity)}`}>
                                {t(`intensities.${result.intensity}`)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scientific Tip */}
            <div className="flex gap-3 px-1">
                <Info size={14} className="text-cyan-500 flex-shrink-0 mt-0.5" />
                <p className="text-[9px] text-white/30 leading-tight italic">
                    {t('tip')}
                </p>
            </div>
        </div>
    );
}
