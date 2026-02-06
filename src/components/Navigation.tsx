"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, BarChart3, Wrench, UserCog, Target, Activity } from "lucide-react";
import { useStore } from "@/store/useStore";

export function Navigation() {
    const router = useRouter();
    const { rideSession } = useStore();
    const pathname = usePathname();

    if (pathname === "/ride") return null;

    const isRideActive = rideSession?.isActive;

    const links = [
        { href: "/", label: "预览", icon: LayoutDashboard },
        { href: "/analytics", label: "记录", icon: BarChart3 },
        {
            href: isRideActive ? "/ride" : "/ride/setup",
            label: isRideActive ? "进行中" : "部署",
            icon: isRideActive ? Activity : Target,
            className: isRideActive ? "text-cyan-400 glow-cyan" : ""
        },
        { href: "/tools", label: "工具", icon: Wrench },
        { href: "/garage", label: "车手", icon: UserCog },
    ];

    return (
        <nav className="liquid-nav fixed bottom-0 left-0 right-0 z-[100] pb-[max(0.5rem,calc(env(safe-area-inset-bottom)-16px))]">
            <div className="max-w-md mx-auto px-6 py-1.5 flex justify-between items-center overflow-visible">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || (link.href === "/ride" && pathname === "/ride");

                    // Data Prediction: Prefetch on Hover or Touch Start
                    const handlePrefetch = () => {
                        router.prefetch(link.href);
                    };

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onMouseEnter={handlePrefetch}
                            onTouchStart={handlePrefetch}
                            className={`flex flex-col items-center gap-1.5 transition-all duration-300 group ${isActive ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
                                } ${link.className || ""}`}
                        >
                            <div className={`relative p-2 rounded-2xl transition-all duration-300 isolate transform-gpu ${isActive
                                ? "bg-gradient-to-br from-cyan-500/20 to-purple-500/10 shadow-[0_0_20px_rgba(0,212,255,0.3)]"
                                : "group-hover:bg-white/5"
                                }`}>
                                {/* Liquid Aura Glow for Active Ride */}
                                {isRideActive && link.href === (rideSession ? "/ride" : "/ride/setup") && (
                                    <div className="absolute inset-0 -z-10 animate-cyan-breathing">
                                        <div className="absolute inset-[-40%] bg-cyan-400/30 blur-2xl rounded-full" />
                                    </div>
                                )}
                                {/* Glow effect for active tab route */}
                                {isActive && (
                                    <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 blur-xl animate-pulse -z-10" />
                                )}
                                <Icon
                                    size={22}
                                    strokeWidth={isActive ? 2.5 : 1.5}
                                    className="relative z-10"
                                />
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${isActive ? "opacity-100" : "opacity-50 group-hover:opacity-80"
                                }`}>
                                {link.label}
                            </span>
                            {/* Active indicator dot */}
                            {isActive && (
                                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
