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
import { useTranslations } from 'next-intl';

export default function ToolsPage() {
    const t = useTranslations('Tools');
    return (
        <main className="space-y-8 pb-12">
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-3xl font-black text-gradient-aurora italic tracking-tighter leading-none mb-1">
                    {t('title')}
                </h1>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] ml-0.5">
                    {t('subtitle')}
                </p>
            </header>

            <section className="space-y-6">
                <CollapsibleSection title={t('routeAnalyzer')} icon={<Map size={14} className="text-cyan-400" />}>
                    <RouteAnalyzer />
                </CollapsibleSection>

                <CollapsibleSection title={t('tirePressure')} icon={<Gauge size={14} className="text-emerald-400" />}>
                    <TirePressureCalculator />
                </CollapsibleSection>

                <CollapsibleSection title={t('nutrition')} icon={<Utensils size={14} className="text-amber-400" />}>
                    <NutritionCalculator />
                </CollapsibleSection>

                <CollapsibleSection title={t('sweatRate')} icon={<Droplets size={14} className="text-blue-400" />}>
                    <SweatRateCalculator />
                </CollapsibleSection>

                <CollapsibleSection title={t('powerZones')} icon={<Zap size={14} className="text-yellow-400" />}>
                    <PowerZoneCard />
                </CollapsibleSection>

                <CollapsibleSection title={t('drivetrain')} icon={<Link2 size={14} className="text-blue-500" />}>
                    <DrivetrainEfficiencyCalculator />
                </CollapsibleSection>

                <CollapsibleSection title={t('gears')} icon={<Wrench size={14} className="text-blue-400" />}>
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
                                    <p className="text-xs font-bold text-white/80">{t('howToUse')}</p>
                                    <p className="text-[10px] text-white/50 leading-relaxed">
                                        {t('gearAdvice')}
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
