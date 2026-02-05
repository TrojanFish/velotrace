"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart3, Wrench, UserCog } from "lucide-react";

export function Navigation() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "战术", icon: LayoutDashboard },
        { href: "/analytics", label: "数据", icon: BarChart3 },
        { href: "/tools", label: "工具", icon: Wrench },
        { href: "/garage", label: "车手", icon: UserCog },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50">
            <div className="max-w-md mx-auto bg-slate-950/80 backdrop-blur-xl border-t border-slate-800 px-6 py-3 pb-8 flex justify-between items-center">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex flex-col items-center gap-1 transition-all ${isActive ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
                                }`}
                        >
                            <div className={`p-1 rounded-xl transition-all ${isActive ? "bg-cyan-400/10" : ""}`}>
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-tight ${isActive ? "opacity-100" : "opacity-60"}`}>
                                {link.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
