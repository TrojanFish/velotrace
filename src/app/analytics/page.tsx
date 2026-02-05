"use client";

import { WeeklyStatsCard } from "@/components/modules/WeeklyStatsCard";
import { RideInsightCard } from "@/components/modules/RideInsightCard";
import { PMCTrendCard } from "@/components/modules/PMCTrendCard";
import { SegmentChallengeCard } from "@/components/modules/SegmentChallengeCard";
import { MMPTrendCard } from "@/components/modules/MMPTrendCard";
import { HeartRateZoneCard } from "@/components/modules/HeartRateZoneCard";
import { BarChart3, TrendingUp, History, Zap, Activity } from "lucide-react";

export default function AnalyticsPage() {
    return (
        <main className="space-y-6 pb-12">
            <header className="mb-8">
                <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent italic tracking-tighter pb-1 pr-4 leading-none">
                    DATA HUB
                </h1>
                <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-1">
                    生理洞察与长周期分析
                </p>
            </header>

            {/* 1. 训练负荷 [TRAINING LOAD] - Highest Frequency */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <div className="w-1 h-3 bg-purple-500 rounded-full" />
                    <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                        训练负荷 / Training Load
                    </h2>
                </div>
                <PMCTrendCard />
                <WeeklyStatsCard />
            </section>

            {/* 2. 复盘与挑战 [RECAP & GOALS] - Medium Frequency */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <div className="w-1 h-3 bg-pink-500 rounded-full" />
                    <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                        活动复盘 / Activity Insights
                    </h2>
                </div>
                <div className="space-y-4">
                    <RideInsightCard />
                    <SegmentChallengeCard />
                </div>
            </section>

            {/* 3. 生理引擎 [PHYSIOLOGICAL ENGINE] - Reference */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Activity size={16} className="text-rose-500" />
                    <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                        生理引擎 / Physiological Engine
                    </h2>
                </div>
                <HeartRateZoneCard />
            </section>

            {/* 4. 战力解构 [POWER PROFILE] - Periodic Review */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <TrendingUp size={16} className="text-orange-500" />
                    <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                        战力解构 / Power Profile
                    </h2>
                </div>
                <MMPTrendCard />
            </section>

        </main>
    );
}
