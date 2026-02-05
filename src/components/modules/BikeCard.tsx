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

const MAINTENANCE_CONFIG: Record<keyof MaintenanceState, { label: string; icon: any; target: number; color: string; colorClass: string }> = {
    chainLube: { label: "链条润滑", icon: Droplets, target: 300, color: "cyan", colorClass: "text-cyan-400" },
    chainWear: { label: "链条磨损", icon: History, target: 3000, color: "warning", colorClass: "text-orange-400" },
    tires: { label: "外胎寿命", icon: CircleDot, target: 4000, color: "success", colorClass: "text-emerald-400" },
    brakePads: { label: "刹车皮", icon: Disc, target: 2500, color: "danger", colorClass: "text-rose-400" },
    service: { label: "整车大保养", icon: Wrench, target: 5000, color: "purple", colorClass: "text-purple-400" }
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
        <div className="pro-card space-y-5 overflow-hidden">
            {/* Header with Switcher */}
            <div className="flex justify-between items-center">
                <div className="liquid-segment p-0.5">
                    <button
                        onClick={() => setView('pressure')}
                        className={`liquid-segment-button py-1.5 px-4 whitespace-nowrap ${view === 'pressure' ? 'active' : ''}`}
                    >
                        胎压策略
                    </button>
                    <button
                        onClick={() => setView('lifecycle')}
                        className={`liquid-segment-button py-1.5 px-4 whitespace-nowrap ${view === 'lifecycle' ? 'active' : ''}`}
                        style={view === 'lifecycle' ? {
                            background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.9) 0%, rgba(249, 115, 22, 0.8) 100%)',
                        } : {}}
                    >
                        生命周期
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-white/30 italic uppercase">SN: {bike.id.slice(-6)}</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
                </div>
            </div>

            {view === 'pressure' ? (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Wheelset Selection */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <div className="flex items-center gap-2">
                            <div className="liquid-icon p-1.5">
                                <Layers size={12} />
                            </div>
                            <span className="text-[10px] font-bold uppercase text-white/40">活动轮组</span>
                        </div>
                        <select
                            value={bike.activeWheelsetIndex}
                            onChange={(e) => setActiveWheelset(activeBikeIndex, parseInt(e.target.value))}
                            className="liquid-select bg-transparent"
                        >
                            {bike.wheelsets.map((ws, i) => (
                                <option key={ws.id} value={i}>{ws.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Pressure Display */}
                    <div className="flex justify-between items-end px-1">
                        <div className="space-y-1">
                            <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">{bike.name}</h2>
                            <div className="flex items-baseline gap-2">
                                <span className="liquid-stat-value text-4xl">{pressure.front.psi}/{pressure.rear.psi}</span>
                                <span className="text-[10px] text-white/30 font-bold uppercase italic">PSI (F/R)</span>
                            </div>
                        </div>
                        <div className="text-right space-y-0.5">
                            <p className="text-[9px] font-bold text-white/30 uppercase">当前配置</p>
                            <p className="text-xs font-bold text-white/70">{wheelset?.tireWidth}MM / {wheelset?.isTubeless ? 'TL' : 'CL'}</p>
                        </div>
                    </div>

                    {/* Condition Selector */}
                    <div className="liquid-segment">
                        {conditions.map((item) => (
                            <button
                                key={item.value}
                                onClick={() => setCondition(item.value)}
                                className={`liquid-segment-button ${condition === item.value ? 'active' : ''}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Alerts */}
                    {alerts.length > 0 && (
                        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-3">
                            <div className="liquid-icon warning p-2">
                                <AlertTriangle size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">警告: 器材亚健康</p>
                                <p className="text-[9px] font-medium text-orange-200/50 italic">共有 {alerts.length} 项维护任务接近临界值</p>
                            </div>
                            <button
                                onClick={() => setView('lifecycle')}
                                className="p-2 hover:bg-orange-500/20 rounded-lg transition-colors"
                            >
                                <ChevronRight size={14} className="text-orange-500" />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Maintenance Items */}
                    {(Object.entries(MAINTENANCE_CONFIG) as [keyof MaintenanceState, typeof MAINTENANCE_CONFIG['chainLube']][]).map(([key, config]) => {
                        const val = (maintenance as any)[key] || 0;
                        const percent = Math.min((val / config.target) * 100, 100);
                        const Icon = config.icon;
                        const isWarning = percent > 70;
                        const isDanger = percent > 90;

                        return (
                            <div key={key} className="space-y-2 group">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`liquid-icon ${config.color} p-1.5`}>
                                            <Icon size={12} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{config.label}</p>
                                            <p className="text-[8px] text-white/30 uppercase font-medium">{val.toFixed(0)}km / {config.target}km</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => resetMaintenance(activeBikeIndex, key)}
                                        className="text-[8px] font-bold uppercase text-white/20 hover:text-cyan-400 tracking-tighter transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        [ 重置 ]
                                    </button>
                                </div>
                                <div className="liquid-progress">
                                    <div
                                        className={`liquid-progress-bar ${isDanger ? 'danger' : isWarning ? 'warning' : ''}`}
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}

                    {/* Wheelset Mileage */}
                    <div className="liquid-divider" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layers size={12} className="text-white/30" />
                            <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">当前轮组损耗 ({wheelset?.name})</span>
                        </div>
                        <p className="text-xs font-bold text-gradient-cyan">{wheelset?.mileage.toFixed(0)} KM</p>
                    </div>
                </div>
            )}

            {/* Footer Meta */}
            <div className="liquid-divider" />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <History size={12} className="text-white/20" />
                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
                        最近同步: {mounted ? (user.lastSyncDate ? new Date(user.lastSyncDate).toLocaleDateString() : new Date().toLocaleDateString()) : "--"}
                    </span>
                </div>
                <div className="text-[8px] font-bold text-white/30 uppercase italic">ODO: {bike.totalDistance.toFixed(0)} KM</div>
            </div>
        </div>
    );
}
