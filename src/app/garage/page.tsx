"use client";

import { useStore, Wheelset } from "@/store/useStore";
import Image from "next/image";
import { Bike, User, Weight, Ruler, Save, RefreshCw, LogOut, Layers, Plus, Trash2, CheckCircle2, Zap, History } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function GaragePage() {
    const { data: session } = useSession();
    const { user, bikes, activeBikeIndex, updateUser, updateBike, setBikes, setActiveBikeIndex, addWheelset, setActiveWheelset } = useStore();
    const bike = bikes[activeBikeIndex] || bikes[0];

    // Local state for new wheelset form
    const [isAddingWheelset, setIsAddingWheelset] = useState(false);
    const [newWsName, setNewWsName] = useState("");
    const [newWsWidth, setNewWsWidth] = useState(25);
    const [newWsTubeless, setNewWsTubeless] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

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
        try {
            const res = await fetch('/api/strava/sync');
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            updateUser({
                ftp: data.ftp || user.ftp,
                weight: data.weight || user.weight,
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
                                mileage: b.totalDistance, // Logic: Assume stock wheels have done all mileage if new
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
            alert("Strava 数据同步成功！");
        } catch (e) {
            console.error(e);
            alert("同步失败，请检查 Strava 连接或稍后重试。");
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <main className="space-y-8 pb-32">
            <header className="mb-4">
                <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent italic tracking-tight pr-4">
                    THE GARAGE
                </h1>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em] mt-1">
                    个人参数与器材设置
                </p>
            </header>

            {/* 1. 数据同步 & 账号 [SYNC] */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <RefreshCw size={14} className="text-orange-500" />
                    <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                        数据同步
                    </h2>
                </div>

                <div className="pro-card border-orange-500/20 bg-orange-500/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                {session?.user?.image ? (
                                    <Image
                                        src={session.user.image}
                                        alt={session.user.name || "User"}
                                        width={36}
                                        height={36}
                                        className="rounded-lg border border-orange-500/30"
                                    />
                                ) : (
                                    <div className="p-2 bg-orange-500/10 rounded-lg">
                                        <User size={18} className={`${session ? 'text-orange-500' : 'text-slate-500'}`} />
                                    </div>
                                )}
                                {session && (
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-500 border-2 border-[#0f172a] rounded-full animate-pulse" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-bold truncate max-w-[120px]">
                                    {session?.user?.name || "未同步用户"}
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase">
                                    {session ? (isSyncing ? "正在拉取 Strava..." : "已链接 Strava") : "离线同步模式"}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {session && (
                                <button
                                    disabled={isSyncing}
                                    onClick={handleStravaSync}
                                    className={`p-2 bg-orange-500/10 text-orange-500 rounded-lg border border-orange-500/20 transition-all ${isSyncing ? 'animate-spin' : 'hover:bg-orange-500/20'}`}
                                >
                                    <RefreshCw size={16} />
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (session) signOut(); else signIn("strava");
                                }}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${session
                                    ? 'bg-slate-800 text-slate-400 border border-slate-700'
                                    : 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                    }`}
                            >
                                {session ? '退出' : 'Strava 登录'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. 核心参数 [USER CONFIG] */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <User size={14} className="text-emerald-400" />
                    <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                        骑手权重
                    </h2>
                </div>
                <div className="pro-card space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 rounded-lg"><Weight size={16} className="text-slate-400" /></div>
                            <span className="text-sm font-medium">体重 (kg)</span>
                        </div>
                        <input
                            type="number"
                            value={user.weight}
                            onChange={(e) => updateUser({ weight: parseFloat(e.target.value) })}
                            className="w-20 bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-right text-sm font-mono text-emerald-400 focus:border-emerald-500 outline-none"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 rounded-lg"><Zap size={16} className="text-slate-400" /></div>
                            <span className="text-sm font-medium">FTP (W)</span>
                        </div>
                        <input
                            type="number"
                            value={user.ftp}
                            onChange={(e) => updateUser({ ftp: parseInt(e.target.value) })}
                            className="w-20 bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-right text-sm font-mono text-cyan-400 focus:border-cyan-500 outline-none"
                        />
                    </div>
                </div>
            </section>

            {/* 3. 车辆切换 [BIKE SWITCHER] */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Bike size={14} className="text-blue-400" />
                    <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                        已注册单车 ({bikes.length})
                    </h2>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {bikes.map((b, idx) => (
                        <button
                            key={b.id}
                            onClick={() => setActiveBikeIndex(idx)}
                            className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all text-left min-w-[140px] ${activeBikeIndex === idx
                                ? 'bg-blue-500/10 border-blue-500 text-blue-100 shadow-lg shadow-blue-500/5'
                                : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60'
                                }`}
                        >
                            <p className="text-[10px] font-black uppercase mb-1 truncate">{b.name}</p>
                            <p className="text-xs font-mono">{b.totalDistance.toFixed(1)} KM</p>
                        </button>
                    ))}
                </div>
            </section>

            {/* 4. 活动轮组管理 [WHEELSETS] */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <Layers size={14} className="text-cyan-400" />
                        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                            轮组资产库 ({bike?.name || '未选中'})
                        </h2>
                    </div>
                    <button
                        onClick={() => setIsAddingWheelset(true)}
                        className="p-1 px-2.5 bg-cyan-400/10 hover:bg-cyan-400/20 rounded text-[9px] font-black uppercase text-cyan-400 flex items-center gap-1.5"
                    >
                        <Plus size={10} /> 新增
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {bike?.wheelsets?.map((ws, idx) => (
                        <div
                            key={ws.id}
                            className={`pro-card relative transition-all ${bike.activeWheelsetIndex === idx ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-slate-800/60'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className={`text-sm font-black italic uppercase ${bike.activeWheelsetIndex === idx ? 'text-cyan-400' : 'text-slate-300'}`}>{ws.name}</p>
                                        {bike.activeWheelsetIndex === idx && <CheckCircle2 size={12} className="text-cyan-400" />}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">
                                        {ws.tireWidth}MM / {ws.isTubeless ? 'TL' : 'CL'} • {ws.mileage.toFixed(1)}KM
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {bike.activeWheelsetIndex !== idx && (
                                        <button
                                            onClick={() => setActiveWheelset(activeBikeIndex, idx)}
                                            className="px-2 py-1 bg-slate-800 text-[9px] font-black uppercase rounded"
                                        >
                                            激活
                                        </button>
                                    )}
                                    <button onClick={() => handleDeleteWheelset(idx)} className="p-1 text-slate-600 hover:text-rose-500">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. 核心车体设定 [BIKE SETTINGS] */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Save size={14} className="text-slate-400" />
                    <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                        车体固参 ({bike?.name})
                    </h2>
                </div>
                <div className="pro-card space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 rounded-lg"><History size={16} className="text-slate-400" /></div>
                            <span className="text-sm font-medium">总累计里程 (ODO)</span>
                        </div>
                        <div className="text-right px-2 py-1 bg-slate-900 border border-slate-700 rounded-md min-w-[5rem] text-sm font-mono text-cyan-400">
                            {bike?.totalDistance.toFixed(1)} KM
                        </div>
                    </div>
                </div>
            </section>

            <footer className="pt-8 text-center text-[10px] text-slate-600 font-medium uppercase tracking-widest italic flex items-center justify-center gap-2">
                <Save size={10} /> 自动同步至 IndexedDB
            </footer>

            {/* Modal for adding wheelset */}
            {isAddingWheelset && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-6">
                    <div className="pro-card w-full max-w-xs space-y-4 border-cyan-500/30">
                        <h3 className="text-lg font-bold italic">配置新轮组</h3>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[8px] font-bold text-slate-500 uppercase">型号名称</label>
                                <input
                                    autoFocus
                                    value={newWsName}
                                    onChange={(e) => setNewWsName(e.target.value)}
                                    placeholder="例如: AD350 Stock"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-cyan-500"
                                />
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
                                    <button onClick={() => setNewWsTubeless(!newWsTubeless)} className="w-full py-2 bg-slate-900 border border-slate-700 rounded-lg text-[9px] font-bold uppercase">
                                        {newWsTubeless ? 'TUBELESS' : 'CLINCHER'}
                                    </button>
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
