"use client";

import { GearCalculator } from "@/components/modules/GearCalculator";
import { PowerZoneCard } from "@/components/modules/PowerZoneCard";
import { RouteAnalyzer } from "@/components/modules/RouteAnalyzer";
import { TirePressureCalculator } from "@/components/modules/TirePressureCalculator";
import { NutritionCalculator } from "@/components/modules/NutritionCalculator";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { Wrench, Info, Zap, Map, Gauge, Utensils } from "lucide-react";

export default function ToolsPage() {
    return (
        <main className="space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent italic tracking-tighter pb-1 pr-4 leading-none">
                    PRO TOOLBOX
                </h1>
                <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-1">
                    专业骑行计算工具
                </p>
            </header>

            <section className="space-y-8">
                <CollapsibleSection title="路线解析 (GPX)" icon={<Map size={14} className="text-cyan-400" />}>
                    <RouteAnalyzer />
                </CollapsibleSection>

                <CollapsibleSection title="智能胎压建议" icon={<Gauge size={14} className="text-emerald-500" />}>
                    <TirePressureCalculator />
                </CollapsibleSection>

                <CollapsibleSection title="补给战策规划" icon={<Utensils size={14} className="text-yellow-500" />}>
                    <NutritionCalculator />
                </CollapsibleSection>

                <CollapsibleSection title="训练强度参考" icon={<Zap size={14} className="text-yellow-500" />}>
                    <PowerZoneCard />
                </CollapsibleSection>

                <CollapsibleSection title="齿比选择与模拟" icon={<Wrench size={14} className="text-blue-400" />}>
                    <div className="space-y-4">
                        <GearCalculator />
                        <div className="pro-card bg-blue-500/5 border-blue-500/10">
                            <div className="flex gap-3">
                                <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-blue-200">如何使用？</p>
                                    <p className="text-[10px] text-blue-300/80 leading-relaxed">
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
