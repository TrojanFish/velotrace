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
                className="flex items-center justify-between w-full px-1 group"
            >
                <div className="flex items-center gap-2">
                    <div className="text-muted-foreground group-hover:text-white transition-colors">
                        {icon}
                    </div>
                    <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                        {title}
                    </h2>
                </div>
                <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
            </button>

            {isOpen && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
}
