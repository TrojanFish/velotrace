"use client";

import { useStore } from "@/store/useStore";
import { getRiderCategory, estimateVO2Max } from "@/lib/calculators/physiology";
import { ShieldCheck, Zap, Activity, TrendingUp, Info } from "lucide-react";

export function RiderLevelCard() {
    const { user } = useStore();

    const category = getRiderCategory(user.ftp, user.weight, user.sex as any);
    const maxHR = 208 - Math.round(0.7 * user.age);
    const vo2max = estimateVO2Max(maxHR, user.restingHR || 60);
    const wpkg = (user.ftp / user.weight).toFixed(1);

    return (
        <div className="pro-card relative overflow-hidden group">
            {/* Holographic background effect */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-cyan-500/10 blur-[60px] rounded-full group-hover:bg-cyan-500/20 transition-all duration-700" />

            <div className="relative space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck size={14} className="text-cyan-400" />
                            <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">生理画像 / BIOMETRIC DNA</h2>
                        </div>
                        <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">
                            {category}
                        </h3>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-1">
                            功重比
                        </p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black italic text-cyan-400">{wpkg}</span>
                            <span className="text-[8px] font-bold text-white/20 uppercase">W/kg</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-1">
                            最大摄氧量
                        </p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black italic text-purple-400">{vo2max}</span>
                            <span className="text-[8px] font-bold text-white/20 uppercase">ml/kg</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-1">
                            FTP 强度
                        </p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black italic text-orange-400">{user.ftp}</span>
                            <span className="text-[8px] font-bold text-white/20 uppercase">Watts</span>
                        </div>
                    </div>
                </div>

                {/* Level Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <span className="text-[9px] font-bold text-white/40 uppercase">等级进度 (Coggan Scale)</span>
                        <span className="text-[9px] font-bold text-cyan-400 uppercase italic">Next: Advanced (Cat 2)</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex p-0.5">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full shelf-glow"
                            style={{ width: `${Math.min(100, (parseFloat(wpkg) / 6.0) * 100)}%` }}
                        />
                    </div>
                </div>

                {/* Insight */}
                <div className="pt-2 flex gap-3 text-white/30 border-t border-white/5">
                    <Info size={12} className="shrink-0 mt-0.5" />
                    <p className="text-[9px] font-medium leading-relaxed italic">
                        该画像基于 Coggan 功率定义表计算。
                        您的当前功重比表明您在爬坡路段具有显著优势，建议维持当前的 CTL 指标以保护体能储备。
                    </p>
                </div>
            </div>
        </div>
    );
}
