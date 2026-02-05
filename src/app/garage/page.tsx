"use client";

import { useStore, Wheelset } from "@/store/useStore";
import { calculateBMR } from "@/lib/calculators/physiology";
import Image from "next/image";
import { Bike, User, Weight, Ruler, Save, RefreshCw, LogOut, Layers, Plus, Trash2, CheckCircle2, Zap, History, Calendar, VenusAndMars, Activity, Flame, X, Sparkles } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useMemo } from "react";

export default function GaragePage() {
    const { data: session } = useSession();
    const { user, bikes, activeBikeIndex, updateUser, updateBike, setBikes, setActiveBikeIndex, addWheelset, setActiveWheelset } = useStore();
    const bike = bikes[activeBikeIndex] || bikes[0];

    const [isAddingWheelset, setIsAddingWheelset] = useState(false);
    const [newWsName, setNewWsName] = useState("");
    const [newWsWidth, setNewWsWidth] = useState(25);
    const [newWsTubeless, setNewWsTubeless] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isPhysioLocked, setIsPhysioLocked] = useState(true);
    const [syncSuccess, setSyncSuccess] = useState(false);
    const [syncError, setSyncError] = useState(false);

    const bmr = useMemo(() => calculateBMR(user.weight, user.height, user.age, user.sex), [user]);

    const handleToggleLock = () => {
        setIsPhysioLocked(!isPhysioLocked);
    };

    const handleAddWheelset = () => {
        if (!newWsName) return;
        const newWs: Wheelset = {
            id: `ws-${Date.now()}`,
            name: newWsName,
            tireWidth: newWsWidth,
            isTubeless: newWsTubeless,
            mileage: 0,
            lastLubeMileage: 0
        };
        addWheelset(activeBikeIndex, newWs);
        setIsAddingWheelset(false);
        setNewWsName("");
    };

    const handleDeleteWheelset = (wsIndex: number) => {
        if (bike.wheelsets.length <= 1) {
            alert("至少需要保留一套轮组。");
            return;
        }
        if (confirm("确定要删除这套轮组吗？其里程记录将永久丢失。")) {
            const newWheelsets = bike.wheelsets.filter((_, i) => i !== wsIndex);
            updateBike(activeBikeIndex, {
                wheelsets: newWheelsets,
                activeWheelsetIndex: 0
            });
        }
    };

    const handleStravaSync = async () => {
        if (!session) return;
        setIsSyncing(true);
        setSyncSuccess(false);
        setSyncError(false);
        try {
            const res = await fetch('/api/strava/sync');
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            updateUser({
                ftp: data.ftp || user.ftp,
                weight: data.weight || user.weight,
                sex: data.sex || user.sex,
                lastSyncDate: new Date().toISOString()
            });

            if (data.bikes && data.bikes.length > 0) {
                const syncedBikes = data.bikes.map((b: any) => {
                    const existing = bikes.find(eb => eb.stravaGearId === b.id);
                    return {
                        id: b.id,
                        name: b.name,
                        totalDistance: b.totalDistance,
                        stravaGearId: b.id,
                        weight: existing?.weight || 8.5,
                        activeWheelsetIndex: existing?.activeWheelsetIndex || 0,
                        wheelsets: existing?.wheelsets || [
                            {
                                id: `ws-${b.id}-default`,
                                name: "默认轮组",
                                tireWidth: 28,
                                isTubeless: false,
                                mileage: b.totalDistance,
                                lastLubeMileage: 0
                            }
                        ],
                        maintenance: existing?.maintenance || {
                            chainLube: 0,
                            chainWear: 0,
                            tires: 0,
                            brakePads: 0,
                            service: 0
                        }
                    };
                });
                setBikes(syncedBikes);

                const primaryIndex = syncedBikes.findIndex((sb: any) => data.bikes.find((db: any) => db.id === sb.id && db.primary));
                if (primaryIndex !== -1) setActiveBikeIndex(primaryIndex);
            }
            setSyncSuccess(true);
            setTimeout(() => setSyncSuccess(false), 3000);
        } catch (e) {
            console.error(e);
            setSyncError(true);
            setTimeout(() => setSyncError(false), 3000);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <main className="space-y-8 pb-32">
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-3xl font-black text-gradient-aurora italic tracking-tighter leading-none mb-1">
                    PILOT OFFICE
                </h1>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] ml-0.5">
                    生理特征、体能模型与器材资产管理
                </p>
            </header>

            {/* 1. 数据同步 & 账号 */}
            <section className="space-y-4">
                <div className="section-header">
                    <div className="section-indicator orange" />
                    <h2 className="section-title">数据同步</h2>
                </div>

                <div className="pro-card space-y-4 overflow-hidden relative">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-50" />

                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                {session?.user?.image ? (
                                    <Image src={session.user.image} alt={session.user.name || "User"} width={40} height={40} className="rounded-xl border-2 border-orange-500/30" />
                                ) : (
                                    <div className="liquid-icon warning p-2.5">
                                        <User size={18} />
                                    </div>
                                )}
                                {session && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-400 border-2 border-[#050810] rounded-full animate-pulse" />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white/90 truncate max-w-[140px]">{session?.user?.name || "未同步用户"}</p>
                                <p className="text-[10px] text-white/40 uppercase font-medium">{session ? (isSyncing ? "正在拉取 Strava..." : "已链接 Strava") : "离线同步模式"}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {session && (
                                <button
                                    disabled={isSyncing}
                                    onClick={handleStravaSync}
                                    className={`liquid-icon w-10 h-10 aspect-square flex items-center justify-center transition-all duration-300 ${isSyncing
                                        ? 'warning animate-spin'
                                        : syncSuccess
                                            ? 'success'
                                            : syncError
                                                ? 'danger'
                                                : 'warning hover:scale-105'
                                        }`}
                                >
                                    {syncSuccess ? <CheckCircle2 size={16} /> : <RefreshCw size={16} />}
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (session) signOut();
                                    else signIn("strava", { callbackUrl: window.location.href });
                                }}
                                className={session ? 'liquid-button py-2 px-4 text-xs' : 'liquid-button-primary py-2 px-4 text-xs'}
                            >
                                {session ? '退出' : 'Strava 登录'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. 生理参数设置 [PHYSIO CONFIG] */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="section-header mb-0">
                        <div className="section-indicator pink" />
                        <h2 className="section-title">生理参数 ( PHYSIOLOGICAL )</h2>
                    </div>
                    <button
                        onClick={handleToggleLock}
                        className={`liquid-tag py-1.5 px-3 cursor-pointer transition-all ${isPhysioLocked
                            ? ''
                            : 'danger animate-pulse'
                            }`}
                    >
                        {isPhysioLocked ? '🔒 锁定模式' : '🔓 解锁编辑'}
                    </button>
                </div>

                <div className={`pro-card space-y-5 transition-all ${!isPhysioLocked ? 'border-rose-500/30' : ''}`}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[8px] font-bold text-white/30 uppercase tracking-widest">
                                <Calendar size={10} /> 年龄 / AGE
                            </label>
                            <input
                                type="number"
                                disabled={isPhysioLocked}
                                value={user.age}
                                onChange={(e) => updateUser({ age: parseInt(e.target.value) })}
                                className="liquid-input h-11 text-sm font-mono disabled:opacity-40 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[8px] font-bold text-white/30 uppercase tracking-widest">
                                <VenusAndMars size={10} /> 性别 / SEX
                            </label>
                            <select
                                disabled={isPhysioLocked}
                                value={user.sex}
                                onChange={(e) => updateUser({ sex: e.target.value as any })}
                                className="liquid-select w-full h-11 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <option value="male">MALE / 男性</option>
                                <option value="female">FEMALE / 女性</option>
                                <option value="other">OTHER</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[8px] font-bold text-white/30 uppercase tracking-widest">
                                <Ruler size={10} /> 身高 / HEIGHT (CM)
                            </label>
                            <input
                                type="number"
                                disabled={isPhysioLocked}
                                value={user.height}
                                onChange={(e) => updateUser({ height: parseInt(e.target.value) })}
                                className="liquid-input h-11 text-sm font-mono disabled:opacity-40 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[8px] font-bold text-white/30 uppercase tracking-widest">
                                <Flame size={10} /> 基础代谢 / BMR
                            </label>
                            <div className="h-11 px-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center">
                                <span className="text-sm font-bold text-gradient-sunset">{bmr}</span>
                                <span className="text-[10px] text-white/30 ml-1 uppercase">Kcal/Day</span>
                            </div>
                        </div>
                    </div>

                    <div className="liquid-divider" />

                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="liquid-icon danger p-2">
                                    <Activity size={16} />
                                </div>
                                <span className="text-sm font-medium text-white/80 whitespace-nowrap">静息心率 (RHR)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    disabled={isPhysioLocked}
                                    value={user.restingHR}
                                    onChange={(e) => updateUser({ restingHR: parseInt(e.target.value) })}
                                    className="liquid-input w-20 text-center text-sm font-mono text-rose-400 disabled:opacity-40 disabled:cursor-not-allowed"
                                />
                                <span className="text-[10px] font-bold text-white/30">BPM</span>
                            </div>
                        </div>
                        <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest pl-11">
                            用于计算 Karvonen 心率区间
                        </p>
                    </div>

                    {!isPhysioLocked && (
                        <p className="text-[9px] text-rose-400/70 font-medium leading-tight px-1 flex gap-2 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                            <span>⚠️</span>
                            <span>修改基础生理数据将导致系统重新计算你的所有心率分区与体能模型，请谨慎操作。</span>
                        </p>
                    )}
                </div>
            </section>

            {/* 3. 核心参数 [USER CONFIG] */}
            <section className="space-y-4">
                <div className="section-header">
                    <div className="section-indicator" />
                    <h2 className="section-title">权重与功率</h2>
                </div>

                <div className="pro-card space-y-5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="liquid-icon success p-2">
                                <Weight size={16} />
                            </div>
                            <span className="text-sm font-medium text-white/80 whitespace-nowrap">体重 (kg)</span>
                        </div>
                        <input
                            type="number"
                            value={user.weight}
                            onChange={(e) => updateUser({ weight: parseFloat(e.target.value) })}
                            className="liquid-input w-24 text-center text-sm font-mono text-emerald-400"
                        />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="liquid-icon p-2">
                                <Zap size={16} />
                            </div>
                            <span className="text-sm font-medium text-white/80 whitespace-nowrap">FTP (W)</span>
                        </div>
                        <input
                            type="number"
                            value={user.ftp}
                            onChange={(e) => updateUser({ ftp: parseInt(e.target.value) })}
                            className="liquid-input w-24 text-center text-sm font-mono text-cyan-400"
                        />
                    </div>
                </div>
            </section>

            {/* 4. 车辆切换 [BIKE SWITCHER] */}
            <section className="space-y-4">
                <div className="section-header">
                    <div className="section-indicator purple" />
                    <h2 className="section-title">已注册单车 ({bikes.length})</h2>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {bikes.map((b, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveBikeIndex(idx)}
                            className={`flex-shrink-0 px-5 py-4 rounded-2xl border transition-all text-left min-w-[150px] ${activeBikeIndex === idx
                                ? 'bg-gradient-to-br from-purple-500/15 to-cyan-500/10 border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.2)]'
                                : 'bg-white/[0.02] border-white/[0.05] opacity-60 hover:opacity-80'
                                }`}
                        >
                            <p className={`text-[10px] font-bold uppercase mb-1.5 truncate ${activeBikeIndex === idx ? 'text-purple-400' : 'text-white/50'}`}>{b.name}</p>
                            <p className={`text-sm font-mono font-bold ${activeBikeIndex === idx ? 'text-gradient-cyan' : 'text-white/40'}`}>{b.totalDistance.toFixed(1)} KM</p>
                        </button>
                    ))}
                </div>
            </section>

            {/* 5. 活动轮组管理 [WHEELSETS] */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="section-header mb-0">
                        <div className="section-indicator" />
                        <h2 className="section-title">轮组资产库</h2>
                    </div>
                    <button
                        onClick={() => setIsAddingWheelset(true)}
                        className="liquid-tag cursor-pointer hover:scale-105 transition-transform"
                    >
                        <Plus size={10} /> 新增
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {bike?.wheelsets?.map((ws, idx) => (
                        <div
                            key={idx}
                            className={`pro-card relative transition-all ${bike.activeWheelsetIndex === idx
                                ? 'border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 to-transparent'
                                : ''
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className={`text-sm font-bold uppercase ${bike.activeWheelsetIndex === idx ? 'text-gradient-cyan' : 'text-white/70'}`}>{ws.name}</p>
                                        {bike.activeWheelsetIndex === idx && <CheckCircle2 size={12} className="text-cyan-400" />}
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="liquid-tag text-[8px] py-0.5">{ws.tireWidth}MM</span>
                                        <span className="liquid-tag purple text-[8px] py-0.5">{ws.isTubeless ? 'TL' : 'CL'}</span>
                                        <span className="liquid-tag success text-[8px] py-0.5">{ws.mileage.toFixed(0)}KM</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {bike.activeWheelsetIndex !== idx && (
                                        <button
                                            onClick={() => setActiveWheelset(activeBikeIndex, idx)}
                                            className="liquid-button text-[9px] py-1.5 px-3"
                                        >
                                            激活
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteWheelset(idx)}
                                        className="liquid-icon danger p-1.5 hover:scale-105 transition-transform"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="pt-8 text-center">
                <div className="flex items-center justify-center gap-3">
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="flex items-center gap-2 text-[10px] text-white/20 font-bold uppercase tracking-widest">
                        <Save size={10} /> 自动同步至 IndexedDB
                    </div>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
            </footer>

            {/* Add Wheelset Modal */}
            {isAddingWheelset && (
                <div className="liquid-overlay">
                    <div className="liquid-modal space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gradient-cyan">配置新轮组</h3>
                            <button
                                onClick={() => setIsAddingWheelset(false)}
                                className="liquid-icon p-1.5 hover:scale-105 transition-transform"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[8px] font-bold text-white/30 uppercase tracking-widest">型号名称</label>
                                <input
                                    autoFocus
                                    value={newWsName}
                                    onChange={(e) => setNewWsName(e.target.value)}
                                    placeholder="例如: AD350 Stock"
                                    className="liquid-input text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-bold text-white/30 uppercase tracking-widest">胎宽</label>
                                    <select
                                        value={newWsWidth}
                                        onChange={(e) => setNewWsWidth(parseInt(e.target.value))}
                                        className="liquid-select w-full py-2.5"
                                    >
                                        {[25, 28, 30, 32].map(w => <option key={w} value={w}>{w}mm</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-bold text-white/30 uppercase tracking-widest">系统</label>
                                    <button
                                        onClick={() => setNewWsTubeless(!newWsTubeless)}
                                        className={`w-full py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all ${newWsTubeless
                                            ? 'liquid-button-primary'
                                            : 'liquid-button'
                                            }`}
                                    >
                                        {newWsTubeless ? 'TUBELESS' : 'CLINCHER'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="liquid-divider" />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsAddingWheelset(false)}
                                className="flex-1 py-3 text-sm font-bold text-white/50 hover:text-white transition-colors rounded-xl hover:bg-white/5"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleAddWheelset}
                                className="liquid-button-primary flex-1 py-3 text-sm font-bold rounded-xl"
                            >
                                确认新增
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
