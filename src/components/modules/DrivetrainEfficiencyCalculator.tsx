"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { Zap, Wrench, AlertTriangle, Info, Gauge } from "lucide-react";
import { useTranslations } from 'next-intl';

interface DrivetrainEfficiencyResult {
    efficiency: number; // 0-1
    lossWatts: number;
    advice: string;
}

export function DrivetrainEfficiencyCalculator() {
    const t = useTranslations('PowerEffecter');
    const { bikes, activeBikeIndex } = useStore();
    const [inputPower, setInputPower] = useState(250);
    const [lubeType, setLubeType] = useState<'dry' | 'wet' | 'wax'>('dry');
    const [chainCondition, setChainCondition] = useState<'new' | 'worn' | 'bad'>('new');
    const [alignment, setAlignment] = useState<'straight' | 'moderate' | 'cross'>('straight');

    const result = useMemo((): DrivetrainEfficiencyResult => {
        let efficiency = 0.985; // Baseline high-end drivetrain (~1.5% loss)

        // Lube Impact
        const lubeLoss = {
            wax: 0.001,  // Wax is most efficient
            dry: 0.003,
            wet: 0.005   // Wet is slightly more viscous
        };
        efficiency -= lubeLoss[lubeType];

        // Chain Condition Impact (Based on friction increase)
        const conditionLoss = {
            new: 0,
            worn: 0.015, // ~1.5% extra loss at 0.5% wear
            bad: 0.035   // ~3.5% extra loss at 0.75%+ wear
        };
        efficiency -= conditionLoss[chainCondition];

        // Alignment (Cross-chaining)
        const alignmentLoss = {
            straight: 0,
            moderate: 0.008,
            cross: 0.025 // Cross-chaining can lose relative ~2.5% 
        };
        efficiency -= alignmentLoss[alignment];

        const lossWatts = inputPower * (1 - efficiency);

        let advice = t('advice.perfect');
        if (efficiency < 0.95) advice = t('advice.worn');
        if (alignment === 'cross') advice = t('advice.cross');

        return { efficiency, lossWatts, advice };
    }, [inputPower, lubeType, chainCondition, alignment, t]);

    return (
        <div className="pro-card space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('title')}</h2>
                    <p className="text-[10px] text-muted-foreground uppercase mt-1">{t('subtitle')}</p>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-full text-blue-500">
                    <Wrench size={20} />
                </div>
            </div>

            {/* Input Controls */}
            <div className="space-y-6">
                {/* Power Input */}
                <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                        <div className="flex items-center gap-1"><Zap size={10} /> {t('inputPower')} (Watts)</div>
                        <span className="text-blue-400">{inputPower}W</span>
                    </div>
                    <input
                        type="range" min="100" max="1000" step="10"
                        value={inputPower} onChange={(e) => setInputPower(parseInt(e.target.value))}
                        className="w-full h-1.5"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Lube Type */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">{t('lubeType')}</label>
                        <select
                            value={lubeType}
                            onChange={(e) => setLubeType(e.target.value as any)}
                            className="w-full liquid-select text-xs"
                        >
                            <option value="wax">{t('lubes.wax')}</option>
                            <option value="dry">{t('lubes.dry')}</option>
                            <option value="wet">{t('lubes.wet')}</option>
                        </select>
                    </div>

                    {/* Chain Condition */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">{t('chainCondition')}</label>
                        <select
                            value={chainCondition}
                            onChange={(e) => setChainCondition(e.target.value as any)}
                            className="w-full liquid-select text-xs"
                        >
                            <option value="new">{t('conditions.new')}</option>
                            <option value="worn">{t('conditions.worn')}</option>
                            <option value="bad">{t('conditions.bad')}</option>
                        </select>
                    </div>

                    {/* Alignment */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">{t('alignment')}</label>
                        <select
                            value={alignment}
                            onChange={(e) => setAlignment(e.target.value as any)}
                            className="w-full liquid-select text-xs"
                        >
                            <option value="straight">{t('alignments.straight')}</option>
                            <option value="moderate">{t('alignments.moderate')}</option>
                            <option value="cross">{t('alignments.cross')}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Result Display */}
            <div className="flex gap-4">
                <div className="flex-1 p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform">
                        <Gauge size={40} className="text-blue-500" />
                    </div>
                    <div className="flex items-center gap-2 text-blue-500">
                        <Zap size={14} />
                        <span className="text-[10px] font-black uppercase">{t('loss')}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black italic tracking-tighter text-white pr-2">-{result.lossWatts.toFixed(1)}</span>
                        <span className="text-xs font-bold text-white/30 uppercase">Watts</span>
                    </div>
                </div>
                <div className="flex-1 p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform">
                        <Info size={40} className="text-cyan-400" />
                    </div>
                    <div className="flex items-center gap-2 text-cyan-400">
                        <Info size={14} />
                        <span className="text-[10px] font-black uppercase">{t('efficiency')}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black italic tracking-tighter text-white pr-2">{(result.efficiency * 100).toFixed(1)}</span>
                        <span className="text-xs font-bold text-white/30 uppercase">%</span>
                    </div>
                </div>
            </div>

            {/* Advice Box */}
            <div className={`p-4 rounded-2xl border transition-all flex gap-4 ${result.efficiency < 0.95 ? 'bg-orange-500/5 border-orange-500/20' : 'bg-blue-500/5 border-blue-500/10'
                }`}>
                <div className={`liquid-icon p-1.5 h-fit ${result.efficiency < 0.95 ? 'warning' : 'blue'}`}>
                    {result.efficiency < 0.95 ? <AlertTriangle size={14} /> : <Info size={14} />}
                </div>
                <div>
                    <p className={`text-xs font-bold mb-1 ${result.efficiency < 0.95 ? 'text-orange-400' : 'text-blue-400'}`}>
                        {result.efficiency < 0.95 ? t('adviceWarning') : t('adviceTitle')}
                    </p>
                    <p className="text-[10px] text-white/50 leading-relaxed font-medium">
                        {result.advice}{t('advice.footer')}
                    </p>
                </div>
            </div>
        </div>
    );
}
