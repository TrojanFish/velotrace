"use client";

import { useStore, TorqueSetting } from "@/store/useStore";
import { COMMON_TORQUES } from "@/lib/calculators/torqueStandards";
import { Wrench, Plus, Trash2, ShieldCheck, ChevronDown, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from 'next-intl';

export function TorqueManager() {
    const t = useTranslations('Torque');
    const { bikes, activeBikeIndex, addTorqueSetting, removeTorqueSetting } = useStore();
    const bike = bikes[activeBikeIndex];

    const [isAdding, setIsAdding] = useState(false);
    const [component, setComponent] = useState("");
    const [value, setValue] = useState("");

    const handleQuickAdd = (comp: string, val: string) => {
        const newSetting: TorqueSetting = {
            id: `trq-${Date.now()}`,
            component: comp,
            value: val
        };
        addTorqueSetting(activeBikeIndex, newSetting);
        toast.success(t('success'));
    };

    const handleCustomAdd = () => {
        if (!component || !value) return;
        handleQuickAdd(component, value);
        setIsAdding(false);
        setComponent("");
        setValue("");
    };

    return (
        <div className="space-y-4">
            {/* Header / Standard References */}
            <div className="pro-card p-3 border-cyan-500/20 bg-cyan-500/5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="liquid-icon info p-1.5">
                        <ShieldCheck size={14} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">{t('title')}</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {COMMON_TORQUES.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between group">
                            <span className="text-[10px] text-white/40">{item.component}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold text-cyan-400">{item.standard}</span>
                                <button
                                    onClick={() => handleQuickAdd(item.component, item.standard)}
                                    className="p-1 rounded bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Plus size={10} className="text-white/60" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* User Custom Settings */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="section-header mb-0">
                        <div className="section-indicator purple" />
                        <h2 className="section-title">{t('settingsTitle', { count: bike?.torqueSettings?.length || 0 })}</h2>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="liquid-tag cursor-pointer hover:scale-105 transition-transform"
                    >
                        <Plus size={10} /> {t('add')}
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    {bike?.torqueSettings?.length === 0 ? (
                        <div className="py-8 text-center border border-dashed border-white/5 rounded-2xl">
                            <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">{t('empty')}</p>
                        </div>
                    ) : (
                        bike?.torqueSettings.map((s) => (
                            <div key={s.id} className="pro-card p-3 flex items-center justify-between group">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-white/80 uppercase">{s.component}</p>
                                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-none">{t('specified')}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-mono font-black text-gradient-cyan italic">{s.value}</span>
                                    <button
                                        onClick={() => removeTorqueSetting(activeBikeIndex, s.id)}
                                        className="p-2 rounded-xl bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/20"
                                    >
                                        <Trash2 size={12} className="text-rose-500" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Custom Add Modal-like (Simulated) */}
            {isAdding && (
                <div className="pro-card p-4 border-cyan-500/50 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            placeholder={t('placeholderComponent')}
                            value={component}
                            onChange={e => setComponent(e.target.value)}
                            className="liquid-input text-xs"
                        />
                        <input
                            placeholder={t('placeholderValue')}
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            className="liquid-input text-xs"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsAdding(false)} className="flex-1 py-2 text-[10px] font-bold text-white/30 hover:text-white transition-colors">
                            {useTranslations('Common')('cancel')}
                        </button>
                        <button onClick={handleCustomAdd} className="flex-1 liquid-button-primary py-2 text-[10px] font-bold">{t('save')}</button>
                    </div>
                </div>
            )}
        </div>
    );
}
