"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useStore } from "@/store/useStore";
import { WeatherCard } from "@/components/modules/WeatherCard";
import { FuelCard } from "@/components/modules/FuelCard";
import { BikeCard } from "@/components/modules/BikeCard";
import { RouteWindForecastCard } from "@/components/modules/RouteWindForecastCard";
import { AIBriefingCard } from "@/components/modules/AIBriefingCard";
import { Bike, Maximize2, User } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Skeleton } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Image from "next/image";

// Lazy load heavy canvas component
const DynamicWindFieldMap = dynamic(
  () => import("@/components/modules/DynamicWindFieldMap").then(mod => ({ default: mod.DynamicWindFieldMap })),
  {
    loading: () => (
      <div className="pro-card p-0 h-[320px] flex items-center justify-center">
        <Skeleton className="w-full h-full rounded-3xl" />
      </div>
    ),
    ssr: false
  }
);

export default function Home() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  const today = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  const { addRideDistance } = useStore();
  const [isLogging, setIsLogging] = useState(false);
  const [distance, setDistance] = useState("40");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogRide = () => {
    const dist = parseFloat(distance);
    if (!isNaN(dist)) {
      addRideDistance(dist);
      setIsLogging(false);
      toast.success(`已记录 ${dist}km`, {
        description: "链条保养进度已更新"
      });
    }
  };

  return (
    <main className="space-y-8 pb-12">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gradient-aurora italic tracking-tighter leading-none pr-4">
            VELOTRACE
          </h1>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] ml-0.5">
            {mounted ? today : "--"}
          </p>
        </div>
        <Link
          href="/garage"
          className="relative group transition-transform hover:scale-105"
        >
          <div className="relative">
            {session?.user?.image ? (
              <div className="w-10 h-10 rounded-xl border-2 border-white/10 overflow-hidden">
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="liquid-icon p-2.5">
                <User size={18} />
              </div>
            )}
            {session && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-400 border-2 border-[#050810] rounded-full animate-status-blink" />
            )}
          </div>
        </Link>
      </header>

      {/* 0. 战术智脑 [AI BRIEFING] */}
      <AIBriefingCard />

      {/* 1. 环境感知 [ENVIRONMENT] */}
      <section className="space-y-5">
        <div className="section-header">
          <div className="section-indicator" />
          <h2 className="section-title">
            战术气象 / Environment
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5">
          <WeatherCard />
          <RouteWindForecastCard />
          <DynamicWindFieldMap />
        </div>
      </section>

      {/* 2. 战术准备 [TACTICAL] */}
      <section className="space-y-5">
        <div className="section-header">
          <div className="section-indicator orange" />
          <h2 className="section-title">
            准备就绪 / Prep
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5">
          <BikeCard />
          <FuelCard />
        </div>
      </section>


      {/* Logging Overlay */}
      {isLogging && (
        <div className="liquid-overlay">
          <div className="liquid-modal space-y-5">
            <div className="flex items-center gap-3">
              <div className="liquid-icon success p-2.5">
                <Bike size={20} />
              </div>
              <h3 className="text-lg font-bold">记录今日骑行</h3>
            </div>

            <div className="space-y-3">
              <label className="text-xs text-white/50 font-medium uppercase tracking-wider">
                骑行总里程 (km)
              </label>
              <input
                type="number"
                autoFocus
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="liquid-input text-2xl font-mono font-bold text-center"
              />
            </div>

            <div className="liquid-divider" />

            <div className="flex gap-3">
              <button
                onClick={() => setIsLogging(false)}
                className="flex-1 py-3 text-sm font-bold text-white/50 hover:text-white transition-colors rounded-xl hover:bg-white/5"
              >
                取消
              </button>
              <button
                onClick={handleLogRide}
                className="liquid-button-primary flex-1 py-3 text-sm font-bold rounded-xl"
              >
                确认记录
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button Section */}
      <div className="fixed bottom-32 right-6 z-50 flex flex-col gap-4">
        <Link
          href="/ride"
          className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_25px_rgba(0,212,255,0.4)] hover:scale-110 active:scale-95 transition-all border border-white/20"
        >
          <Maximize2 size={24} />
        </Link>
        <button
          onClick={() => setIsLogging(true)}
          className="liquid-fab w-14 h-14 flex items-center justify-center text-white"
        >
          <Bike size={24} />
        </button>
      </div>
    </main>
  );
}
