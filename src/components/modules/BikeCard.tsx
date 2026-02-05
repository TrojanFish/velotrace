"use client";

import { useStore, MaintenanceState, Wheelset } from "@/store/useStore";
import { calculateTirePressure, SurfaceType } from "@/lib/calculators/tirePressure";
import {
    Bike,
    CircleDot,
    AlertTriangle,
    Droplets,
    Gauge,
    Disc,
    Wrench,
    ChevronRight,
    History,
    Layers
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";

const MAINTENANCE_CONFIG: Record<keyof MaintenanceState, { label: string; icon: any; target: number; color: string }> = {
    chainLube: { label: "链条润滑", icon: Droplets, target: 300, color: "text-cyan-400" },
    chainWear: { label: "链条磨损", icon: History, target: 3000, color: "text-orange-400" },
    tires: { label: "外胎寿命", icon: CircleDot, target: 4000, color: "text-emerald-400" },
    brakePads: { label: "刹车皮", icon: Disc, target: 2500, color: "text-rose-400" },
    service: { label: "整车大保养", icon: Wrench, target: 5000, color: "text-purple-400" }
};

export function BikeCard() {
    const { bikes, activeBikeIndex, user, resetMaintenance, setActiveWheelset } = useStore();
    const [condition, setCondition] = useState<SurfaceType>("normal");
    const [view, setView] = useState<'pressure' | 'lifecycle'>('pressure');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const bike = bikes[activeBikeIndex];
    const wheelset = bike?.wheelsets?.[bike.activeWheelsetIndex] || bike?.wheelsets?.[0];

    // Safety check for maintenance object
    const maintenance = bike?.maintenance || {
        chainLube: 0,
        chainWear: 0,
        tires: 0,
        brakePads: 0,
        service: 0
    };

    const pressure = calculateTirePressure({
        riderWeight: user.weight,
        bikeWeight: bike?.weight || 8.5,
        tireWidth: wheelset?.tireWidth || 28,
        isTubeless: wheelset?.isTubeless || false,
        surfaceType: condition
    });

    const conditions: { value: SurfaceType; label: string }[] = [
        { value: "perfect", label: "赛道" },
        { value: "normal", label: "干路" },
        { value: "rough", label: "湿滑" },
        { value: "gravel", label: "砂石" },
    ];

    const alerts = useMemo(() => {
        return Object.entries(MAINTENANCE_CONFIG).filter(([key, config]) => {
            const val = (maintenance as any)[key];
            return val > (config as any).target * 0.8;
        });
    }, [maintenance]);

    if (!bike) return null;

    return (
        <div className="pro-card border-slate-800/40 bg-slate-900/20 space-y-5 overflow-hidden">
            {/* Header with Switcher */}
            <div className="flex justify-between items-center">
                <div className="flex gap-2 p-1 bg-slate-950/50 rounded-lg border border-slate-800/50">
                    <button
                        onClick={() => setView('pressure')}
                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${view === 'pressure' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500'}`}
                    >
                        胎压策略
                    </button>
                    <button
                        onClick={() => setView('lifecycle')}
                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${view === 'lifecycle' ? 'bg-orange-500 text-slate-950' : 'text-slate-500'}`}
                    >
                        全生命周期
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 italic uppercase">SN: {bike.id.slice(-6)}</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
            </div>

            {view === 'pressure' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Wheelset Selection Selector */}
                    <div className="flex items-center justify-between p-2 bg-slate-950/40 rounded-xl border border-slate-800/50">
                        <div className="flex items-center gap-2">
                            <Layers size={14} className="text-cyan-400" />
                            <span className="text-[10px] font-black uppercase text-slate-400">活动轮组</span>
                        </div>
                        <select
                            value={bike.activeWheelsetIndex}
                            onChange={(e) => setActiveWheelset(activeBikeIndex, parseInt(e.target.value))}
                            className="bg-transparent text-[10px] font-black uppercase text-cyan-400 focus:outline-none cursor-pointer"
                        >
                            {bike.wheelsets.map((ws, i) => (
                                <option key={ws.id} value={i} className="bg-slate-900">{ws.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-between items-end px-1">
                        <div className="space-y-1">
                            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{bike.name}</h2>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-black italic text-cyan-400">{pressure.front.psi}/{pressure.rear.psi}</p>
                                <span className="text-[10px] text-slate-500 font-black uppercase italic">PSI (F/R)</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-500 uppercase">当前配置</p>
                            <p className="text-xs font-black italic text-slate-300">{wheelset?.tireWidth}MM / {wheelset?.isTubeless ? 'TL' : 'CL'}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex bg-slate-950/40 p-1 rounded-xl border border-slate-800/50">
                            {conditions.map((item) => (
                                <button
                                    key={item.value}
                                    onClick={() => setCondition(item.value)}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${condition === item.value
                                        ? "bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950"
                                        : "text-slate-500 hover:text-slate-300"
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {alerts.length > 0 && (
                        <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                                <AlertTriangle size={16} className="text-orange-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">警告: 器材亚健康</p>
                                <p className="text-[9px] font-medium text-orange-200/60 uppercase italic">共有 {alerts.length} 项维护任务接近临界值</p>
                            </div>
                            <button onClick={() => setView('lifecycle')} className="p-1.5 hover:bg-orange-500/20 rounded-md transition-colors">
                                <ChevronRight size={14} className="text-orange-500" />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 gap-4">
                        {(Object.entries(MAINTENANCE_CONFIG) as [keyof MaintenanceState, typeof MAINTENANCE_CONFIG['chainLube']][]).map(([key, config]) => {
                            const val = (maintenance as any)[key] || 0;
                            const percent = Math.min((val / config.target) * 100, 100);
                            const Icon = config.icon;

                            return (
                                <div key={key} className="space-y-2 group">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-lg bg-slate-950 border border-slate-800 ${config.color}`}>
                                                <Icon size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{config.label}</p>
                                                <p className="text-[8px] text-slate-500 uppercase font-medium">{val.toFixed(0)}km / {config.target}km</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => resetMaintenance(activeBikeIndex, key)}
                                            className="text-[8px] font-black uppercase text-slate-600 hover:text-cyan-400 tracking-tighter transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            [ 重置 ]
                                        </button>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                                        <div
                                            className={`h-full transition-all duration-1000 ${percent > 90 ? 'bg-rose-500 ring-4 ring-rose-500/20' : percent > 70 ? 'bg-orange-500' : 'bg-cyan-500'}`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        {/* Wheelset specific mileage in lifecycle view */}
                        <div className="mt-2 pt-4 border-t border-slate-800/50">
                            <div className="flex items-center gap-2 mb-2">
                                <Layers size={12} className="text-slate-500" />
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">当前轮组损耗 ({wheelset?.name})</span>
                            </div>
                            <p className="text-xs font-black italic text-slate-200">{wheelset?.mileage.toFixed(0)} KM</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Simple Footer Meta */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                <div className="flex items-center gap-1.5">
                    <History size={12} className="text-slate-500" />
                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                        最近同步: {mounted ? (user.lastSyncDate ? new Date(user.lastSyncDate).toLocaleDateString() : new Date().toLocaleDateString()) : "--"}
                    </span>
                </div>
                <div className="text-[8px] font-bold text-slate-700 uppercase italic">ODO: {bike.totalDistance.toFixed(0)} KM</div>
            </div>
        </div>
    );
}
