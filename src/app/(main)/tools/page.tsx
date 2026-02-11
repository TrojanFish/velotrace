"use client";

import { GearCalculator } from "@/components/modules/GearCalculator";
import { PowerZoneCard } from "@/components/modules/PowerZoneCard";
import { RouteAnalyzer } from "@/components/modules/RouteAnalyzer";
import { TirePressureCalculator } from "@/components/modules/TirePressureCalculator";
import { NutritionCalculator } from "@/components/modules/NutritionCalculator";
import { SweatRateCalculator } from "@/components/modules/SweatRateCalculator";
import { DrivetrainEfficiencyCalculator } from "@/components/modules/DrivetrainEfficiencyCalculator";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { Wrench, Info, Zap, Map, Gauge, Utensils, Sparkles, Droplets, Link2 } from "lucide-react";

export default function ToolsPage() {
    return (
        <main className="space-y-8 pb-12">
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-3xl font-black text-gradient-aurora italic tracking-tighter leading-none mb-1">
                    PRO TOOLBOX
                </h1>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] ml-0.5">
                    专业骑行计算工具
                </p>
            </header>

            <section className="space-y-6">
                <CollapsibleSection title="路线解析 (GPX)" icon={<Map size={14} className="text-cyan-400" />}>
                    <RouteAnalyzer />
                </CollapsibleSection>

                <CollapsibleSection title="智能胎压建议" icon={<Gauge size={14} className="text-emerald-400" />}>
                    <TirePressureCalculator />
                </CollapsibleSection>

                <CollapsibleSection title="补给战策规划" icon={<Utensils size={14} className="text-amber-400" />}>
                    <NutritionCalculator />
                </CollapsibleSection>

                <CollapsibleSection title="精准排汗率计算" icon={<Droplets size={14} className="text-blue-400" />}>
                    <SweatRateCalculator />
                </CollapsibleSection>

                <CollapsibleSection title="训练强度参考" icon={<Zap size={14} className="text-yellow-400" />}>
                    <PowerZoneCard />
                </CollapsibleSection>

                <CollapsibleSection title="传动效能与功率损耗" icon={<Link2 size={14} className="text-blue-500" />}>
                    <DrivetrainEfficiencyCalculator />
                </CollapsibleSection>

                <CollapsibleSection title="齿比选择与模拟" icon={<Wrench size={14} className="text-blue-400" />}>
                    <div className="space-y-4">
                        <GearCalculator />
                        <div className="pro-card overflow-hidden relative">
                            {/* Subtle Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-50" />
                            <div className="flex gap-3 relative z-10">
                                <div className="liquid-icon p-2 flex-shrink-0">
                                    <Info size={16} />
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-xs font-bold text-white/80">如何使用？</p>
                                    <p className="text-[10px] text-white/50 leading-relaxed">
                                        通过调整踏频滑块，你可以直观查看在当前齿比配置下，不同挡位的理论巡航速度。这对于选购新飞轮或盘片非常有参考价值。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>
            </section>
        </main>
    );
}
