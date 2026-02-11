"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { calculateNutrition } from "@/lib/calculators/nutrition";
import { FUEL_PRODUCTS, FuelProduct } from "@/config/nutrition";
import { Utensils, Droplets, Zap, Clock, Thermometer, Info, Package, Check } from "lucide-react";
import { useTranslations } from 'next-intl';

export function NutritionCalculator() {
    const t = useTranslations('NutritionCalculator');
    const { user } = useStore();

    const [duration, setDuration] = useState(2);
    const [intensity, setIntensity] = useState(60); // %
    const [temp, setTemp] = useState(22);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>(['maurten-100', 'drink-mix-40', 'salt-pill']);

    const result = useMemo(() => calculateNutrition({
        durationHours: duration,
        intensityPercent: intensity,
        temperature: temp,
        weight: user.weight
    }), [duration, intensity, temp, user.weight]);

    const toggleProduct = (id: string) => {
        setSelectedProductIds(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const fuelingPlan = useMemo(() => {
        const selected = FUEL_PRODUCTS.filter(p => selectedProductIds.includes(p.id));
        const drink = selected.find(p => p.type === 'drink');
        const gels = selected.filter(p => p.type === 'gel');
        const salts = selected.filter(p => p.type === 'salt-pill');

        let remainingCarbs = result.totalCarbs;
        const plan: { product: FuelProduct; count: number }[] = [];

        // 1. Allocate Drink Mix (Cap at 1-2 bottles depending on duration)
        if (drink) {
            const maxBottles = Math.max(1, Math.round(duration));
            const count = Math.min(maxBottles, Math.ceil(remainingCarbs / drink.carbs));
            if (count > 0) {
                plan.push({ product: drink, count });
                remainingCarbs -= count * drink.carbs;
            }
        }

        // 2. Allocate Gels (Distribute remaining carbs)
        if (gels.length > 0 && remainingCarbs > 0) {
            const primaryGel = gels[0]; // Take the first selected gel as primary
            const count = Math.ceil(remainingCarbs / primaryGel.carbs);
            if (count > 0) {
                plan.push({ product: primaryGel, count });
            }
        }

        // 3. Salt Pills (Based on heat/duration)
        if (salts.length > 0 && result.needsElectrolytes) {
            const count = Math.ceil(duration); // 1 pill per hour as rule of thumb
            plan.push({ product: salts[0], count });
        }

        return plan;
    }, [result, selectedProductIds, duration]);

    return (
        <div className="pro-card space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('title')}</h2>
                    <p className="text-[10px] text-muted-foreground uppercase mt-1">{t('subtitle')}</p>
                </div>
                <div className="p-2 bg-amber-500/10 rounded-full text-amber-500">
                    <Utensils size={20} />
                </div>
            </div>

            {/* Input Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                        <div className="flex items-center gap-1"><Clock size={10} /> {t('duration')}</div>
                        <span className="text-amber-400">{duration}h</span>
                    </div>
                    <input
                        type="range" min="0.5" max="8" step="0.5"
                        value={duration} onChange={(e) => setDuration(parseFloat(e.target.value))}
                        className="w-full h-1.5"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                        <div className="flex items-center gap-1"><Zap size={10} /> {t('intensity')}</div>
                        <span className="text-amber-400">{intensity}%</span>
                    </div>
                    <input
                        type="range" min="20" max="100" step="5"
                        value={intensity} onChange={(e) => setIntensity(parseInt(e.target.value))}
                        className="w-full h-1.5"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                        <div className="flex items-center gap-1"><Thermometer size={10} /> {t('temperature')}</div>
                        <span className="text-amber-400">{temp}°C</span>
                    </div>
                    <input
                        type="range" min="0" max="40" step="1"
                        value={temp} onChange={(e) => setTemp(parseInt(e.target.value))}
                        className="w-full h-1.5"
                    />
                </div>
            </div>

            {/* Product Inventory Section */}
            <div className="space-y-4">
                <div className="items-center flex gap-2">
                    <Package size={14} className="text-white/40" />
                    <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t('inventory')}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {FUEL_PRODUCTS.map(product => (
                        <button
                            key={product.id}
                            onClick={() => toggleProduct(product.id)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${selectedProductIds.includes(product.id)
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shelf-glow'
                                : 'bg-white/5 text-white/30 border-white/10 hover:border-white/20'
                                }`}
                        >
                            <span className="flex items-center gap-1.5">
                                {selectedProductIds.includes(product.id) && <Check size={10} />}
                                {product.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Display */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform">
                        <Zap size={40} className="text-amber-500" />
                    </div>
                    <div className="flex items-center gap-2 text-amber-500">
                        <Zap size={14} />
                        <span className="text-[10px] font-black uppercase">{t('carbsDemand')}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black italic tracking-tighter text-white pr-2">{result.totalCarbs}</span>
                        <span className="text-xs font-bold text-white/30 uppercase">g</span>
                    </div>
                </div>
                <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform">
                        <Droplets size={40} className="text-blue-400" />
                    </div>
                    <div className="flex items-center gap-2 text-blue-400">
                        <Droplets size={14} />
                        <span className="text-[10px] font-black uppercase">{t('fluidDemand')}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black italic tracking-tighter text-white pr-2">{result.totalFluid}</span>
                        <span className="text-xs font-bold text-white/30 uppercase">ml</span>
                    </div>
                </div>
            </div>

            {/* Specific Packing List */}
            <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    {t('packingList')}
                </h3>
                <div className="space-y-2">
                    {fuelingPlan.length > 0 ? fuelingPlan.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.04] transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.product.type === 'drink' ? 'bg-blue-500/10 text-blue-400' :
                                    item.product.type === 'gel' ? 'bg-amber-500/10 text-amber-400' : 'bg-purple-500/10 text-purple-400'
                                    }`}>
                                    {item.product.type === 'drink' ? <Droplets size={16} /> : <Zap size={16} />}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white/90">{item.product.name}</p>
                                    <p className="text-[9px] text-white/30 font-medium uppercase tracking-tighter">
                                        {t('perUnit', { unit: item.product.unit, carbs: item.product.carbs })}
                                        {item.product.sodium ? t('sodium', { sodium: item.product.sodium }) : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-black italic text-amber-400">x{item.count}</span>
                                <span className="text-[9px] text-white/30 font-bold uppercase">{item.product.unit}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="py-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
                            <p className="text-[10px] text-slate-500 uppercase font-bold">{t('emptyInventory')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Insight Toast/Info */}
            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:rotate-12 transition-transform">
                    <Info size={40} className="text-amber-500" />
                </div>
                <div className="space-y-1 relative z-10">
                    <p className="text-xs font-bold text-amber-400 flex items-center gap-2">
                        {t('intelligence')}
                    </p>
                    <p className="text-[10px] text-white/50 leading-relaxed font-medium">
                        {result.needsElectrolytes ? t('highTempWarning') : t('optimalAdvice')}
                    </p>
                </div>
            </div>
        </div>
    );
}
