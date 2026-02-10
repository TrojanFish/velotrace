"use client";

import { useStore, MaintenanceState } from "@/store/useStore";
import { ShieldAlert, Zap, Clock, RefreshCw, ChevronRight } from "lucide-react";
import { useMemo } from "react";

export function MaintenancePredictor() {
    const { bikes, activeBikeIndex, updateBike, resetMaintenance } = useStore();
    const bike = bikes[activeBikeIndex];
    if (!bike) return null;

    const maintenance = bike.maintenance;
    const powerFactor = bike.powerFactor || 1.0;

    // Maintenance Thresholds (km)
    const THRESHOLDS: Record<keyof MaintenanceState, number> = {
        chainLube: 300,
        chainWear: 3000,
        tires: 4000,
        brakePads: 2500,
        service: 5000
    };

    const getStatusInfo = (key: keyof MaintenanceState, value: number) => {
        const threshold = THRESHOLDS[key];
        const percent = Math.min(100, (value / threshold) * 100);
        const remaining = Math.max(0, threshold - value);

        let color = "text-emerald-400";
        let statusText = "良好 / Optimal";
        if (percent > 60) { color = "text-amber-400"; statusText = "注意 / Caution"; }
        if (percent > 90) { color = "text-rose-500"; statusText = "警告 / Urgent"; }

        return { percent, remaining, color, statusText };
    };

    const stats = useMemo(() => {
        return Object.keys(THRESHOLDS).map((key) => {
            const k = key as keyof MaintenanceState;
            return {
                key: k,
                label: k === 'chainLube' ? '链条润滑' :
                    k === 'chainWear' ? '链条伸长' :
                        k === 'tires' ? '外胎磨损' :
                            k === 'brakePads' ? '刹车片' : '整车大保养',
                ...getStatusInfo(k, maintenance[k])
            };
        });
    }, [maintenance, powerFactor]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest">预防性维护预测 / MAINTENANCE AI</h3>
                    <p className="text-[10px] text-white/30 font-medium">基于当前输出功耗权重推演硬件磨损寿命</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <Zap size={10} className="text-orange-400" />
                    <span className="text-[9px] font-black text-orange-400 uppercase">Power Factor: {powerFactor.toFixed(1)}x</span>
                </div>
            </div>

            {/* Power Input Integration */}
            <div className="pro-card p-4 flex items-center justify-between bg-white/[0.02] border border-white/5">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-white/50 uppercase">磨损权重修正 / Wear Factor</p>
                    <p className="text-[9px] text-white/20 italic">高扭力/爬坡手建议调高至 1.2x 以获得更准确的预警</p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="range"
                        min="0.8"
                        max="1.5"
                        step="0.1"
                        value={powerFactor}
                        onChange={(e) => updateBike(activeBikeIndex, { powerFactor: parseFloat(e.target.value) })}
                        className="w-24 h-1.5 bg-white/10 rounded-full appearance-none accent-orange-400"
                    />
                    <span className="text-xs font-mono text-white/70 w-8">{powerFactor.toFixed(1)}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.map((s) => (
                    <div key={s.key} className="pro-card p-4 space-y-4 relative overflow-hidden group">
                        {/* Wear Progress Bar Background */}
                        <div className="absolute bottom-0 left-0 h-0.5 bg-white/5 w-full" />
                        <div
                            className={`absolute bottom-0 left-0 h-0.5 transition-all duration-1000 ${s.color.replace('text-', 'bg-')}`}
                            style={{ width: `${s.percent}%` }}
                        />

                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{s.key}</p>
                                <p className="text-sm font-black text-white">{s.label}</p>
                            </div>
                            <button
                                onClick={() => resetMaintenance(activeBikeIndex, s.key)}
                                className="p-2 rounded-lg bg-white/5 border border-white/5 text-white/20 hover:text-white/80 hover:bg-white/10 transition-all"
                            >
                                <RefreshCw size={12} />
                            </button>
                        </div>

                        <div className="flex items-end justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-mono font-bold text-white/90">
                                    {Math.round(s.remaining)} <span className="text-[8px] text-white/30">KM REMAINING</span>
                                </p>
                                <p className={`text-[9px] font-black uppercase tracking-tighter ${s.color}`}>
                                    {s.statusText}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] font-bold text-white/20 uppercase">Lifespan Used</p>
                                <p className="text-lg font-black italic text-white/40">{Math.round(s.percent)}%</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 flex gap-3">
                <ShieldAlert size={16} className="text-cyan-400 shrink-0" />
                <p className="text-[10px] text-cyan-400/80 leading-relaxed italic">
                    AI 提示：当前的维护周期已根据你的 Power Factor ({powerFactor}x) 进行加权计算。这意味着当你在进行大功率间歇或爬坡训练时，系统会加速模拟器材的损耗进度，确保在极端赛况下设备依然稳定可靠。
                </p>
            </div>
        </div>
    );
}
