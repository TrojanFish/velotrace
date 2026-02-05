"use client";

import { useState } from "react";
import { calculateSpeed, COMMON_GEARS } from "@/lib/calculators/gearRatio";
import { ChevronRight, Gauge } from "lucide-react";

export function GearCalculator() {
    const [front, setFront] = useState<number[]>([52, 36]);
    const [rear, setRear] = useState<number[]>([11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30]);
    const [cadence, setCadence] = useState(90);

    const speeds = rear.map(cog => ({
        cog,
        big: calculateSpeed(front[0], cog, cadence),
        small: front[1] ? calculateSpeed(front[1], cog, cadence) : null
    }));

    return (
        <div className="pro-card space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">齿比与速度分布</h2>
                    <p className="text-2xl font-bold">{cadence} <span className="text-sm font-normal text-muted-foreground">RPM</span></p>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-full text-blue-400">
                    <Gauge size={24} />
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground uppercase">
                        <span>踏频设定</span>
                        <span>{cadence} RPM</span>
                    </div>
                    <input
                        type="range"
                        min="60"
                        max="120"
                        step="5"
                        value={cadence}
                        onChange={(e) => setCadence(parseInt(e.target.value))}
                        className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-muted-foreground uppercase font-bold">
                            <tr>
                                <th className="px-4 py-3">飞轮齿数</th>
                                <th className="px-4 py-3 text-right">大盘 ({front[0]}T)</th>
                                {front[1] && <th className="px-4 py-3 text-right">小盘 ({front[1]}T)</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {speeds.sort((a, b) => a.cog - b.cog).map((item) => (
                                <tr key={item.cog} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-slate-400">{item.cog}T</td>
                                    <td className="px-4 py-3 text-right font-bold text-cyan-400">{item.big} <span className="text-[10px] font-normal text-slate-500">km/h</span></td>
                                    {item.small !== null && (
                                        <td className="px-4 py-3 text-right font-bold text-emerald-400">{item.small} <span className="text-[10px] font-normal text-slate-500">km/h</span></td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
                * 基于 700x28c (2111mm) 周长计算
            </p>
        </div>
    );
}
