"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { Zap, Wrench, AlertTriangle, Info, Gauge } from "lucide-react";

interface DrivetrainEfficiencyResult {
    efficiency: number; // 0-1
    lossWatts: number;
    advice: string;
}

export function DrivetrainEfficiencyCalculator() {
    const { bikes, activeBikeIndex } = useStore();
    const [inputPower, setInputPower] = useState(250);
    const [lubeType, setLubeType] = useState<'dry' | 'wet' | 'wax'>('dry');
    const [chainCondition, setChainCondition] = useState<'new' | 'worn' | 'bad'>('new');
    const [alignment, setAlignment] = useState<'straight' | 'moderate' | 'cross'>('straight');

    const result = useMemo((): DrivetrainEfficiencyResult => {
        let efficiency = 0.985; // Baseline high-end drivetrain (~1.5% loss)

        // Lube Impact
        const lubeLoss = {
            wax: 0.001,  // Wax is most efficient
            dry: 0.003,
            wet: 0.005   // Wet is slightly more viscous
        };
        efficiency -= lubeLoss[lubeType];

        // Chain Condition Impact (Based on friction increase)
        const conditionLoss = {
            new: 0,
            worn: 0.015, // ~1.5% extra loss at 0.5% wear
            bad: 0.035   // ~3.5% extra loss at 0.75%+ wear
        };
        efficiency -= conditionLoss[chainCondition];

        // Alignment (Cross-chaining)
        const alignmentLoss = {
            straight: 0,
            moderate: 0.008,
            cross: 0.025 // Cross-chaining can lose relative ~2.5% 
        };
        efficiency -= alignmentLoss[alignment];

        const lossWatts = inputPower * (1 - efficiency);

        let advice = "您的传动系统处于竞技状态。";
        if (efficiency < 0.95) advice = "注意：传动系统损耗严重，建议更换链条并优化走线。";
        if (alignment === 'cross') advice = "大盘对大规（交叉链条）导致了显著的机械摩擦，建议降档。";

        return { efficiency, lossWatts, advice };
    }, [inputPower, lubeType, chainCondition, alignment]);

    return (
        <div className="pro-card space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">传动效率模拟 (DRIVETRAIN LOSS)</h2>
                    <p className="text-[10px] text-muted-foreground uppercase mt-1">分析链条、润滑与走线对功率的影响</p>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-full text-blue-500">
                    <Wrench size={20} />
                </div>
            </div>

            {/* Input Controls */}
            <div className="space-y-6">
                {/* Power Input */}
                <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                        <div className="flex items-center gap-1"><Zap size={10} /> 输入功率 (Watts)</div>
                        <span className="text-blue-400">{inputPower}W</span>
                    </div>
                    <input
                        type="range" min="100" max="1000" step="10"
                        value={inputPower} onChange={(e) => setInputPower(parseInt(e.target.value))}
                        className="w-full h-1.5"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Lube Type */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">润滑类型</label>
                        <select
                            value={lubeType}
                            onChange={(e) => setLubeType(e.target.value as any)}
                            className="w-full liquid-select text-xs"
                        >
                            <option value="wax">链条蜡 (Performance Wax)</option>
                            <option value="dry">干性油 (Standard Dry)</option>
                            <option value="wet">湿性油 (Heavy Wet)</option>
                        </select>
                    </div>

                    {/* Chain Condition */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">链条状态</label>
                        <select
                            value={chainCondition}
                            onChange={(e) => setChainCondition(e.target.value as any)}
                            className="w-full liquid-select text-xs"
                        >
                            <option value="new">全新 / 低损耗 (&lt;0.5%)</option>
                            <option value="worn">磨损 / 建议关注 (0.5%-0.75%)</option>
                            <option value="bad">极差 / 需更换 (&gt;0.75%)</option>
                        </select>
                    </div>

                    {/* Alignment */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">链线条位 (Alignment)</label>
                        <select
                            value={alignment}
                            onChange={(e) => setAlignment(e.target.value as any)}
                            className="w-full liquid-select text-xs"
                        >
                            <option value="straight">平直 (无偏移)</option>
                            <option value="moderate">适中 (4-5片偏移)</option>
                            <option value="cross">交叉 (Big-Big / Small-Small)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Result Display */}
            <div className="flex gap-4">
                <div className="flex-1 p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform">
                        <Gauge size={40} className="text-blue-500" />
                    </div>
                    <div className="flex items-center gap-2 text-blue-500">
                        <Zap size={14} />
                        <span className="text-[10px] font-black uppercase">功率损耗</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black italic tracking-tighter text-white pr-2">-{result.lossWatts.toFixed(1)}</span>
                        <span className="text-xs font-bold text-white/30 uppercase">Watts</span>
                    </div>
                </div>
                <div className="flex-1 p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:scale-110 transition-transform">
                        <Info size={40} className="text-cyan-400" />
                    </div>
                    <div className="flex items-center gap-2 text-cyan-400">
                        <Info size={14} />
                        <span className="text-[10px] font-black uppercase">传递效率</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black italic tracking-tighter text-white pr-2">{(result.efficiency * 100).toFixed(1)}</span>
                        <span className="text-xs font-bold text-white/30 uppercase">%</span>
                    </div>
                </div>
            </div>

            {/* Advice Box */}
            <div className={`p-4 rounded-2xl border transition-all flex gap-4 ${result.efficiency < 0.95 ? 'bg-orange-500/5 border-orange-500/20' : 'bg-blue-500/5 border-blue-500/10'
                }`}>
                <div className={`liquid-icon p-1.5 h-fit ${result.efficiency < 0.95 ? 'warning' : 'blue'}`}>
                    {result.efficiency < 0.95 ? <AlertTriangle size={14} /> : <Info size={14} />}
                </div>
                <div>
                    <p className={`text-xs font-bold mb-1 ${result.efficiency < 0.95 ? 'text-orange-400' : 'text-blue-400'}`}>
                        {result.efficiency < 0.95 ? '机械警告' : '效能诊断'}
                    </p>
                    <p className="text-[10px] text-white/50 leading-relaxed font-medium">
                        {result.advice} 请记住，干净的传动系统是提升速度“最廉价”的方式。
                    </p>
                </div>
            </div>
        </div>
    );
}
