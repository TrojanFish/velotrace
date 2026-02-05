"use client";

import { WeeklyStatsCard } from "@/components/modules/WeeklyStatsCard";
import { RideInsightCard } from "@/components/modules/RideInsightCard";
import { PMCTrendCard } from "@/components/modules/PMCTrendCard";
import { SegmentChallengeCard } from "@/components/modules/SegmentChallengeCard";
import { BarChart3, TrendingUp, Target } from "lucide-react";

export default function AnalyticsPage() {
    return (
        <main className="space-y-6 pb-12">
            <header className="mb-8">
                <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent italic tracking-tighter pb-1 leading-none">
                    DATA HUB
                </h1>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">
                    生理洞察与长周期分析
                </p>
            </header>

            {/* 1. 体能趋势 [TRAINING LOAD] */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <div className="w-1 h-3 bg-purple-500 rounded-full" />
                    <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                        训练负荷 / Training Load
                    </h2>
                </div>
                <PMCTrendCard />
                <WeeklyStatsCard />
            </section>

            {/* 2. 复盘与挑战 [RECAP & GOALS] */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <div className="w-1 h-3 bg-pink-500 rounded-full" />
                    <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                        活动复盘 / Activity Insights
                    </h2>
                </div>
                <div className="space-y-4">
                    <RideInsightCard />
                    <SegmentChallengeCard />
                </div>
            </section>

            <footer className="pt-8 text-center">
                <p className="text-[10px] text-slate-600 font-medium uppercase tracking-widest">
                    VeloTrace Intelligence Engine • Analytics Center
                </p>
            </footer>
        </main>
    );
}
