"use client";

import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { calculatePowerZones } from "@/lib/calculators/powerZones";
import { Zap, Info } from "lucide-react";

export function PowerZoneCard() {
    const { user } = useStore();
    const zones = useMemo(() => calculatePowerZones(user.ftp), [user.ftp]);

    return (
        <div className="pro-card space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">功率分区 (Coggan 7-Zone)</h2>
                    <p className="text-2xl font-bold">{user.ftp} <span className="text-sm font-normal text-muted-foreground">W (FTP)</span></p>
                </div>
                <div className="p-2 bg-yellow-500/10 rounded-full text-yellow-500">
                    <Zap size={24} />
                </div>
            </div>

            <div className="space-y-2">
                {zones.map((zone) => (
                    <div key={zone.level} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                        <div className={`w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-black ${zone.color.replace('text-', 'bg-').replace('400', '400/20')} ${zone.color}`}>
                            Z{zone.level}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                                <span className="text-xs font-bold text-slate-200 truncate">{zone.name}</span>
                                <span className="text-xs font-mono font-bold text-slate-400">
                                    {zone.range[0]} - {zone.range[1] === Infinity ? 'MAX' : zone.range[1]} W
                                </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate leading-none">
                                {zone.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex gap-3">
                <Info size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-normal">
                    所有的骑行强度建议都基于你的 <strong>FTP ({user.ftp}W)</strong> 自动计算。如需更改，请前往“车库”设置。
                </p>
            </div>
        </div>
    );
}
