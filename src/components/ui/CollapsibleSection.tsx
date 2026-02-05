"use client";

import { useState, ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CollapsibleSectionProps {
    title: string;
    icon: ReactNode;
    children: ReactNode;
}

export function CollapsibleSection({ title, icon, children }: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="space-y-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] group hover:bg-white/[0.04] hover:border-white/[0.08] transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className="liquid-icon p-1.5 group-hover:scale-105 transition-transform">
                        {icon}
                    </div>
                    <h2 className="text-[10px] font-bold text-white/50 uppercase tracking-widest group-hover:text-white/80 transition-colors">
                        {title}
                    </h2>
                </div>
                <div className={`p-1.5 rounded-lg bg-white/[0.03] text-white/30 group-hover:text-white/60 transition-all ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={14} />
                </div>
            </button>

            {isOpen && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 pl-2">
                    {children}
                </div>
            )}
        </div>
    );
}
