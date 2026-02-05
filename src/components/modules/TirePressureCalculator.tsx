"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { calculateTirePressure, SurfaceType } from "@/lib/calculators/tirePressure";
import { Gauge, Info, CloudRain, Sun, Activity } from "lucide-react";

export function TirePressureCalculator() {
    const { user, bikes, activeBikeIndex } = useStore();
    const bike = bikes[activeBikeIndex];
    const activeWheelset = bike.wheelsets[bike.activeWheelsetIndex];

    const [surface, setSurface] = useState<SurfaceType>('normal');

    const pressure = useMemo(() => calculateTirePressure({
        riderWeight: user.weight,
        bikeWeight: bike.weight,
        tireWidth: activeWheelset.tireWidth,
        isTubeless: activeWheelset.isTubeless,
        surfaceType: surface
    }), [user.weight, bike.weight, activeWheelset.tireWidth, activeWheelset.isTubeless, surface]);

    const surfaceOptions = useMemo(() => [
        { id: 'perfect', label: '极佳 (赛道)', icon: <Sun size={12} /> },
        { id: 'normal', label: '常规 (柏油)', icon: <Activity size={12} /> },
        { id: 'rough', label: '粗糙 (颠簸)', icon: <Activity size={12} /> },
        { id: 'wet', label: '湿滑 (雨天)', icon: <CloudRain size={12} /> },
    ], []);

    return (
        <div className="pro-card space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest">胎压建议 / Pressure</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-tight">基于车辆负载与路况推演</p>
                </div>
                <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-500">
                    <Gauge size={20} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">前轮 (FRONT)</p>
                    <div className="flex flex-col">
                        <span className="text-3xl font-black italic tracking-tighter text-emerald-400">{pressure.front.psi}</span>
                        <span className="text-[10px] font-mono text-slate-500 mt-1 uppercase">{pressure.front.bar} BAR / PSI</span>
                    </div>
                </div>
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">后轮 (REAR)</p>
                    <div className="flex flex-col">
                        <span className="text-3xl font-black italic tracking-tighter text-emerald-400">{pressure.rear.psi}</span>
                        <span className="text-[10px] font-mono text-slate-500 mt-1 uppercase">{pressure.rear.bar} BAR / PSI</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase px-1">路面状况选择</p>
                <div className="grid grid-cols-2 gap-2">
                    {surfaceOptions.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setSurface(opt.id as SurfaceType)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[10px] font-bold transition-all ${surface === opt.id
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                                : 'bg-slate-900 border-slate-800 text-slate-500 grayscale'
                                }`}
                        >
                            {opt.icon}
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex gap-3">
                <Info size={14} className="text-slate-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 leading-normal">
                        系统已自动关联: <strong>{user.weight}kg</strong> 骑手 + <strong>{activeWheelset.tireWidth}mm</strong> {activeWheelset.isTubeless ? '真空' : '开口'}胎。
                    </p>
                    <p className="text-[10px] text-slate-600 leading-normal italic">
                        * 建议仅供参考，请勿超过轮组/外胎标称最大值。
                    </p>
                </div>
            </div>
        </div>
    );
}
