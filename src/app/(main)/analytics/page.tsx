"use client";

import { WeeklyStatsCard } from "@/components/modules/WeeklyStatsCard";
import { RideInsightCard } from "@/components/modules/RideInsightCard";
import { PMCTrendCard } from "@/components/modules/PMCTrendCard";
import { SegmentChallengeCard } from "@/components/modules/SegmentChallengeCard";
import { MMPTrendCard } from "@/components/modules/MMPTrendCard";
import { HeartRateZoneCard } from "@/components/modules/HeartRateZoneCard";
import { RiderLevelCard } from "@/components/modules/RiderLevelCard";
import { BarChart3, TrendingUp, Activity, Sparkles } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function AnalyticsPage() {
    const t = useTranslations('Analytics');

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

            {/* 1. 训练负荷 [TRAINING LOAD] */}
            <section className="space-y-5">
                <div className="section-header">
                    <div className="section-indicator purple" />
                    <h2 className="section-title">{t('sections.load')}</h2>
                </div>
                <PMCTrendCard />
                <WeeklyStatsCard />
            </section>

            {/* 2. 复盘与挑战 [RECAP & GOALS] */}
            <section className="space-y-5">
                <RideInsightCard />
                <div className="section-header">
                    <div className="section-indicator pink" />
                    <h2 className="section-title">{t('sections.segments')}</h2>
                </div>
                <SegmentChallengeCard />
            </section>

            {/* 3. 生理引擎 [PHYSIOLOGICAL ENGINE] */}
            <section className="space-y-5">
                <div className="section-header">
                    <div className="liquid-icon danger p-1.5">
                        <Activity size={12} />
                    </div>
                    <h2 className="section-title">{t('sections.engine')}</h2>
                </div>
                <RiderLevelCard />
                <HeartRateZoneCard />
            </section>

            {/* 4. 战力解构 [POWER PROFILE] */}
            <section className="space-y-5">
                <div className="section-header">
                    <div className="liquid-icon warning p-1.5">
                        <TrendingUp size={12} />
                    </div>
                    <h2 className="section-title">{t('sections.power')}</h2>
                </div>
                <MMPTrendCard />
            </section>

        </main>
    );
}
