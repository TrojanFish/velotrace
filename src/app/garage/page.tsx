"use client";

import { useStore, Wheelset } from "@/store/useStore";
import { calculateBMR } from "@/lib/calculators/physiology";
import Image from "next/image";
import { Bike, User, Weight, Ruler, Save, RefreshCw, LogOut, Layers, Plus, Trash2, CheckCircle2, Zap, History, Calendar, VenusAndMars, Activity, Flame } from "lucide-react";
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
            // Keep critical alerts for destructive actions
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
            <header className="mb-4">
                <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent italic tracking-tight pr-4">
                    PILOT OFFICE
                </h1>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em] mt-1">
                    生理特征、体能模型与器材资产管理
                </p>
            </header>

            {/* 1. 数据同步 & 账号 */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <RefreshCw size={14} className="text-orange-500" />
                    <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">数据同步</h2>
                </div>

                <div className="pro-card border-orange-500/20 bg-orange-500/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                {session?.user?.image ? (
                                    <Image src={session.user.image} alt={session.user.name || "User"} width={36} height={36} className="rounded-lg border border-orange-500/30" />
                                ) : (
                                    <div className="p-2 bg-orange-500/10 rounded-lg"><User size={18} className={`${session ? 'text-orange-500' : 'text-slate-500'}`} /></div>
                                )}
                                {session && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-500 border-2 border-[#0f172a] rounded-full animate-pulse" />}
                            </div>
                            <div>
                                <p className="text-sm font-bold truncate max-w-[120px]">{session?.user?.name || "未同步用户"}</p>
                                <p className="text-[10px] text-muted-foreground uppercase">{session ? (isSyncing ? "正在拉取 Strava..." : "已链接 Strava") : "离线同步模式"}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {session && (
                                <button
                                    disabled={isSyncing}
                                    onClick={handleStravaSync}
                                    className={`p-2 rounded-lg border transition-all duration-300 ${isSyncing
                                        ? 'bg-orange-500/10 text-orange-500 border-orange-500/20 animate-spin'
                                        : syncSuccess
                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                            : syncError
                                                ? 'bg-rose-500/20 text-rose-500 border-rose-500/30'
                                                : 'bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20'
                                        }`}
                                >
                                    {syncSuccess ? <CheckCircle2 size={16} className="animate-in zoom-in" /> : <RefreshCw size={16} />}
                                </button>
                            )}
                            <button onClick={() => { if (session) signOut(); else signIn("strava"); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${session ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'}`}>
                                {session ? '退出' : 'Strava 登录'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. 生理参数设置 [PHYSIO CONFIG] */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <Activity size={14} className="text-rose-400" />
                        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">生理参数 ( PHYSIOLOGICAL )</h2>
                    </div>
                    <button
                        onClick={handleToggleLock}
                        className={`p-1 px-3 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 transition-all ${isPhysioLocked
                            ? 'bg-slate-800 text-slate-500'
                            : 'bg-rose-500/20 text-rose-500 border border-rose-500/30 animate-pulse'
                            }`}
                    >
                        {isPhysioLocked ? (
                            <>🔒 锁定模式</>
                        ) : (
                            <>🔓 解锁编辑</>
                        )}
                    </button>
                </div>
                <div className={`pro-card space-y-5 transition-all ${isPhysioLocked ? 'opacity-80' : 'border-rose-500/30'}`}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                <Calendar size={10} /> 年龄 / AGE
                            </label>
                            <input
                                type="number"
                                disabled={isPhysioLocked}
                                value={user.age}
                                onChange={(e) => updateUser({ age: parseInt(e.target.value) })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-200 focus:border-rose-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                <VenusAndMars size={10} /> 性别 / SEX
                            </label>
                            <select
                                disabled={isPhysioLocked}
                                value={user.sex}
                                onChange={(e) => updateUser({ sex: e.target.value as any })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs font-bold text-slate-200 focus:border-rose-500 outline-none appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="male">MALE / 男性</option>
                                <option value="female">FEMALE / 女性</option>
                                <option value="other">OTHER</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                <Ruler size={10} /> 身高 / HEIGHT (CM)
                            </label>
                            <input
                                type="number"
                                disabled={isPhysioLocked}
                                value={user.height}
                                onChange={(e) => updateUser({ height: parseInt(e.target.value) })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-200 focus:border-rose-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                <Flame size={10} /> 基础代谢 / BMR
                            </label>
                            <div className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-sm font-black italic text-rose-400">
                                {bmr} <span className="text-[10px] font-normal not-italic text-slate-500 ml-1 uppercase">Kcal/Day</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 rounded-lg"><Activity size={16} className="text-rose-400" /></div>
                            <div>
                                <span className="text-sm font-medium block">静息心率 (RHR)</span>
                                <span className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">用于计算 Karvonen 心率区间</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    disabled={isPhysioLocked}
                                    value={user.restingHR}
                                    onChange={(e) => updateUser({ restingHR: parseInt(e.target.value) })}
                                    className="w-16 bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-right text-sm font-mono text-rose-400 focus:border-rose-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <span className="text-[10px] font-black text-slate-600">BPM</span>
                            </div>
                        </div>
                    </div>
                    {!isPhysioLocked && (
                        <p className="text-[9px] text-rose-500/70 font-medium leading-tight px-1 flex gap-2">
                            <span>⚠️</span>
                            <span>修改基础生理数据将导致系统重新计算你的所有心率分区与体能模型，请谨慎操作。</span>
                        </p>
                    )}
                </div>
            </section>

            {/* 3. 核心参数 [USER CONFIG] */}
            {/* ... rest of the file stays same ... */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <User size={14} className="text-emerald-400" />
                    <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">权重与功率</h2>
                </div>
                <div className="pro-card space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 rounded-lg"><Weight size={16} className="text-slate-400" /></div>
                            <span className="text-sm font-medium">体重 (kg)</span>
                        </div>
                        <input type="number" value={user.weight} onChange={(e) => updateUser({ weight: parseFloat(e.target.value) })} className="w-20 bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-right text-sm font-mono text-emerald-400 focus:border-emerald-500 outline-none" />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 rounded-lg"><Zap size={16} className="text-slate-400" /></div>
                            <span className="text-sm font-medium">FTP (W)</span>
                        </div>
                        <input type="number" value={user.ftp} onChange={(e) => updateUser({ ftp: parseInt(e.target.value) })} className="w-20 bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-right text-sm font-mono text-cyan-400 focus:border-cyan-500 outline-none" />
                    </div>
                </div>
            </section>

            {/* 4. 车辆切换 [BIKE SWITCHER] */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Bike size={14} className="text-blue-400" />
                    <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">已注册单车 ({bikes.length})</h2>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {bikes.map((b, idx) => (
                        <button key={idx} onClick={() => setActiveBikeIndex(idx)} className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all text-left min-w-[140px] ${activeBikeIndex === idx ? 'bg-blue-500/10 border-blue-500 text-blue-100 shadow-lg shadow-blue-500/5' : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60'}`}>
                            <p className="text-[10px] font-black uppercase mb-1 truncate">{b.name}</p>
                            <p className="text-xs font-mono">{b.totalDistance.toFixed(1)} KM</p>
                        </button>
                    ))}
                </div>
            </section>

            {/* 5. 活动轮组管理 [WHEELSETS] */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <Layers size={14} className="text-cyan-400" />
                        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">轮组资产库</h2>
                    </div>
                    <button onClick={() => setIsAddingWheelset(true)} className="p-1 px-2.5 bg-cyan-400/10 hover:bg-cyan-400/20 rounded text-[9px] font-black uppercase text-cyan-400 flex items-center gap-1.5"><Plus size={10} /> 新增</button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {bike?.wheelsets?.map((ws, idx) => (
                        <div key={idx} className={`pro-card relative transition-all ${bike.activeWheelsetIndex === idx ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-slate-800/60'}`}>
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className={`text-sm font-black italic uppercase ${bike.activeWheelsetIndex === idx ? 'text-cyan-400' : 'text-slate-300'}`}>{ws.name}</p>
                                        {bike.activeWheelsetIndex === idx && <CheckCircle2 size={12} className="text-cyan-400" />}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">{ws.tireWidth}MM / {ws.isTubeless ? 'TL' : 'CL'} • {ws.mileage.toFixed(1)}KM</p>
                                </div>
                                <div className="flex gap-2">
                                    {bike.activeWheelsetIndex !== idx && <button onClick={() => setActiveWheelset(activeBikeIndex, idx)} className="px-2 py-1 bg-slate-800 text-[9px] font-black uppercase rounded">激活</button>}
                                    <button onClick={() => handleDeleteWheelset(idx)} className="p-1 text-slate-600 hover:text-rose-500"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="pt-8 text-center text-[10px] text-slate-600 font-medium uppercase tracking-widest italic flex items-center justify-center gap-2">
                <Save size={10} /> 自动同步至 IndexedDB
            </footer>

            {isAddingWheelset && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-6">
                    <div className="pro-card w-full max-w-xs space-y-4 border-cyan-500/30">
                        <h3 className="text-lg font-bold italic">配置新轮组</h3>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[8px] font-bold text-slate-500 uppercase">型号名称</label>
                                <input autoFocus value={newWsName} onChange={(e) => setNewWsName(e.target.value)} placeholder="例如: AD350 Stock" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-cyan-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-bold text-slate-500 uppercase">胎宽</label>
                                    <select value={newWsWidth} onChange={(e) => setNewWsWidth(parseInt(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs">
                                        {[25, 28, 30, 32].map(w => <option key={w} value={w}>{w}mm</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-bold text-slate-500 uppercase">系统</label>
                                    <button onClick={() => setNewWsTubeless(!newWsTubeless)} className="w-full py-2 bg-slate-900 border border-slate-700 rounded-lg text-[9px] font-bold uppercase">{newWsTubeless ? 'TUBELESS' : 'CLINCHER'}</button>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setIsAddingWheelset(false)} className="flex-1 py-2 text-xs font-bold text-slate-500">取消</button>
                                <button onClick={handleAddWheelset} className="flex-1 py-2 bg-cyan-500 text-slate-950 rounded-lg text-xs font-black uppercase">确认新增</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
