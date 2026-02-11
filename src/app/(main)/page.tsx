"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { WeatherCard } from "@/components/modules/WeatherCard";
import { FuelCard } from "@/components/modules/FuelCard";
import { BikeCard } from "@/components/modules/BikeCard";
import { RouteWindForecastCard } from "@/components/modules/RouteWindForecastCard";
import { AIBriefingCard } from "@/components/modules/AIBriefingCard";
import { Maximize2, User } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useTranslations, useLocale } from 'next-intl';

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
  const t = useTranslations('Dashboard');
  const locale = useLocale();

  const today = new Date().toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

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
          href="/pilot-office"
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
            {t('sections.environment')}
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
            {t('sections.prep')}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5">
          <BikeCard />
          <FuelCard />
        </div>
      </section>


    </main>
  );
}
