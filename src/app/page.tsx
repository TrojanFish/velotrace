"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { WeatherCard } from "@/components/modules/WeatherCard";
import { FuelCard } from "@/components/modules/FuelCard";
import { BikeCard } from "@/components/modules/BikeCard";
import { RouteWindForecastCard } from "@/components/modules/RouteWindForecastCard";
import { AIBriefingCard } from "@/components/modules/AIBriefingCard";
import { DynamicWindFieldMap } from "@/components/modules/DynamicWindFieldMap";
import { Settings, Zap, Bike, Navigation } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const today = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  const { addRideDistance } = useStore();
  const [isLogging, setIsLogging] = useState(false);
  const [distance, setDistance] = useState("40");

  const handleLogRide = () => {
    const dist = parseFloat(distance);
    if (!isNaN(dist)) {
      addRideDistance(dist);
      setIsLogging(false);
      alert(`已记录 ${dist}km，链条保养进度已更新。`);
    }
  };

  return (
    <main className="space-y-6 pb-12">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent italic tracking-tighter pb-1 pr-4 leading-none">
            VELOTRACE
          </h1>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">
            {today}
          </p>
        </div>
        <Link href="/garage" className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
          <Settings size={20} />
        </Link>
      </header>

      {/* 0. 战术智脑 [AI BRIEFING] */}
      <AIBriefingCard />

      {/* 1. 环境感知 [ENVIRONMENT] */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1 h-3 bg-cyan-400 rounded-full" />
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
            战术气象 / Environment
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <WeatherCard />
          <RouteWindForecastCard />
          <DynamicWindFieldMap />
        </div>
      </section>

      {/* 2. 战术准备 [TACTICAL] */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1 h-3 bg-orange-500 rounded-full" />
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
            准备就绪 / Prep
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <BikeCard />
          <FuelCard />
        </div>
      </section>


      {/* Logging Overlay */}
      {isLogging && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-6">
          <div className="pro-card w-full max-w-xs space-y-4 border-emerald-500/30">
            <h3 className="text-lg font-bold italic">记录今日骑行</h3>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">骑行总里程 (km)</p>
              <input
                type="number"
                autoFocus
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-xl font-mono focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsLogging(false)}
                className="flex-1 py-3 text-sm font-bold text-muted-foreground hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleLogRide}
                className="flex-1 py-3 bg-emerald-500 text-slate-950 rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/20"
              >
                确认记录
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action */}
      <div className="fixed bottom-24 right-6 z-50">
        <button
          onClick={() => setIsLogging(true)}
          className="w-14 h-14 bg-emerald-500 rounded-full shadow-2xl shadow-emerald-500/20 flex items-center justify-center text-slate-950 hover:scale-105 transition-transform active:scale-95"
        >
          <Bike size={24} />
        </button>
      </div>
    </main>
  );
}
