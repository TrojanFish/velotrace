"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart3, Wrench, UserCog, Target } from "lucide-react";

export function Navigation() {
    const pathname = usePathname();

    if (pathname === "/ride") return null;

    const links = [
        { href: "/", label: "预览", icon: LayoutDashboard },
        { href: "/analytics", label: "记录", icon: BarChart3 },
        { href: "/ride/setup", label: "部署", icon: Target },
        { href: "/tools", label: "工具", icon: Wrench },
        { href: "/garage", label: "车手", icon: UserCog },
    ];

    return (
        <nav className="liquid-nav fixed bottom-0 left-0 right-0 z-[100] pb-[max(0.5rem,calc(env(safe-area-inset-bottom)-16px))]">
            <div className="max-w-md mx-auto px-6 py-1.5 flex justify-between items-center">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex flex-col items-center gap-1.5 transition-all duration-300 group ${isActive ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
                                }`}
                        >
                            <div className={`relative p-2 rounded-2xl transition-all duration-300 ${isActive
                                ? "bg-gradient-to-br from-cyan-500/20 to-purple-500/10 shadow-[0_0_20px_rgba(0,212,255,0.3)]"
                                : "group-hover:bg-white/5"
                                }`}>
                                {/* Glow effect for active state */}
                                {isActive && (
                                    <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 blur-xl animate-pulse" />
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
