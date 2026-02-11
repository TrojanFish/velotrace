"use client";

import { useStore, BikeFit } from "@/store/useStore";
import { Ruler, CheckCircle2, Save, Layers, Activity } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from 'next-intl';

export function BikeFitManager() {
    const t = useTranslations('BikeFit');
    const { bikes, activeBikeIndex, updateBike } = useStore();
    const bike = bikes[activeBikeIndex];

    const [tempFit, setTempFit] = useState<BikeFit>(bike.fit || {
        stack: 0,
        reach: 0,
        saddleHeight: 0,
        saddleOffset: 0,
        handlebarWidth: 0,
        crankLength: 0,
        stemLength: 0
    });

    const handleSave = () => {
        updateBike(activeBikeIndex, { fit: tempFit });
        toast.success(t('success'), {
            description: t('successDesc')
        });
    };

    const handleChange = (field: keyof BikeFit, value: number) => {
        setTempFit(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest">{t('title')} / GEOMETRY</h3>
                    <p className="text-[10px] text-white/30 font-medium">{t('subtitle')}</p>
                </div>
                <button
                    onClick={handleSave}
                    className="liquid-button-primary py-2 px-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                >
                    <Save size={12} /> {t('save')}
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Stack & Reach */}
                <div className="pro-card p-4 space-y-3 border-dashed border-white/10">
                    <div className="flex items-center gap-2 text-cyan-400">
                        <Ruler size={14} />
                        <span className="text-[10px] font-black uppercase tracking-wider">{t('core')} / Core</span>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-white/20 uppercase">{t('stack')}</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={tempFit.stack || ""}
                                    onChange={(e) => handleChange('stack', parseInt(e.target.value))}
                                    className="liquid-input h-9 text-xs text-center font-mono"
                                />
                                <span className="text-[8px] font-bold text-white/10">MM</span>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-white/20 uppercase">{t('reach')}</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={tempFit.reach || ""}
                                    onChange={(e) => handleChange('reach', parseInt(e.target.value))}
                                    className="liquid-input h-9 text-xs text-center font-mono"
                                />
                                <span className="text-[8px] font-bold text-white/10">MM</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cockpit */}
                <div className="pro-card p-4 space-y-3 border-dashed border-white/10">
                    <div className="flex items-center gap-2 text-purple-400">
                        <Layers size={14} />
                        <span className="text-[10px] font-black uppercase tracking-wider">{t('cockpit')} / Cockpit</span>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-white/20 uppercase">{t('saddleHeight')}</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={tempFit.saddleHeight || ""}
                                    onChange={(e) => handleChange('saddleHeight', parseInt(e.target.value))}
                                    className="liquid-input h-9 text-xs text-center font-mono text-purple-400"
                                />
                                <span className="text-[8px] font-bold text-white/10">MM</span>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-white/20 uppercase">{t('saddleOffset')}</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={tempFit.saddleOffset || ""}
                                    onChange={(e) => handleChange('saddleOffset', parseInt(e.target.value))}
                                    className="liquid-input h-9 text-xs text-center font-mono"
                                />
                                <span className="text-[8px] font-bold text-white/10">MM</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Handlebar & Crank */}
                <div className="pro-card p-4 space-y-3 border-dashed border-white/10">
                    <div className="flex items-center gap-2 text-emerald-400">
                        <Activity size={14} />
                        <span className="text-[10px] font-black uppercase tracking-wider">{t('touch')} / Touch</span>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-white/20 uppercase">{t('barWidth')}</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={tempFit.handlebarWidth || ""}
                                    onChange={(e) => handleChange('handlebarWidth', parseInt(e.target.value))}
                                    className="liquid-input h-9 text-xs text-center font-mono"
                                />
                                <span className="text-[8px] font-bold text-white/10">MM</span>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-white/20 uppercase">{t('crank')}</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    step="0.5"
                                    value={tempFit.crankLength || ""}
                                    onChange={(e) => handleChange('crankLength', parseFloat(e.target.value))}
                                    className="liquid-input h-9 text-xs text-center font-mono"
                                />
                                <span className="text-[8px] font-bold text-white/10">MM</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-[9px] text-white/20 font-medium italic leading-relaxed px-2">
                {t('notice')}
            </p>
        </div>
    );
}
