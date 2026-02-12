"use client";

import { useStore, MaintenanceLog } from "@/store/useStore";
import { History, Plus, Trash2, Calendar, FileText, Activity } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from 'next-intl';

export function MaintenanceLogManager() {
    const t = useTranslations('MaintenanceLog');
    const tCommon = useTranslations('Common');
    const { bikes, activeBikeIndex, addMaintenanceLog, removeMaintenanceLog } = useStore();
    const bike = bikes[activeBikeIndex];

    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");

    const handleAdd = () => {
        if (!title) return;
        const newLog: MaintenanceLog = {
            id: `log-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            title: title,
            description: desc,
            mileage: Math.round(bike.totalDistance)
        };
        addMaintenanceLog(activeBikeIndex, newLog);
        setIsAdding(false);
        setTitle("");
        setDesc("");
        toast.success(t('success'));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="section-header mb-0">
                    <div className="section-indicator orange" />
                    <h2 className="section-title">{t('title', { count: bike?.maintenanceLogs?.length || 0 })}</h2>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="liquid-tag cursor-pointer hover:scale-105 transition-transform"
                >
                    <Plus size={10} /> {t('add')}
                </button>
            </div>

            {isAdding && (
                <div className="pro-card p-4 border-orange-500/50 space-y-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{t('placeholderTitle')}</label>
                            <input
                                placeholder={t('inputTitle')}
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="liquid-input text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{t('inputDesc')}</label>
                            <textarea
                                placeholder={t('placeholderDesc')}
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                                className="liquid-input text-xs min-h-[100px] py-3 leading-relaxed"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsAdding(false)} className="flex-1 py-2 text-[10px] font-bold text-white/30 hover:text-white transition-colors">
                            {tCommon('cancel')}
                        </button>
                        <button onClick={handleAdd} className="flex-1 liquid-button-primary py-2 text-[10px] font-bold">{t('save')}</button>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {bike?.maintenanceLogs?.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-white/5 rounded-3xl group">
                        <History size={32} className="mx-auto text-white/5 mb-3 group-hover:text-orange-500/20 transition-colors" />
                        <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">{t('empty')}</p>
                    </div>
                ) : (
                    bike?.maintenanceLogs.map((log) => (
                        <div key={log.id} className="pro-card p-0 overflow-hidden group">
                            <div className="p-3 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="liquid-icon warning p-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                        <Activity size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-white/90 uppercase tracking-tight">{log.title}</p>
                                        <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest">{log.date} @ {log.mileage} KM</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeMaintenanceLog(activeBikeIndex, log.id)}
                                    className="p-2 rounded-xl bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/20"
                                >
                                    <Trash2 size={12} className="text-rose-500" />
                                </button>
                            </div>
                            {log.description && (
                                <div className="p-3">
                                    <p className="text-[10px] text-white/50 leading-relaxed italic">{log.description}</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
