"use client";

import { useStore, Wheelset } from "@/store/useStore";
import { calculateBMR, getRiderCategory, estimateVO2Max, calculateIdealRacingWeight } from "@/lib/calculators/physiology";
import { useStravaSync } from "@/hooks/useStravaSync";
import { converters } from "@/lib/converters";
import Image from "next/image";
import { TorqueManager } from "@/components/modules/TorqueManager";
import { MaintenanceLogManager } from "@/components/modules/MaintenanceLogManager";
import { BikeFitManager } from "@/components/modules/BikeFitManager";
import { Bike, User, Weight, Ruler, Save, RefreshCw, LogOut, Layers, Plus, Trash2, CheckCircle2, Zap, History, Calendar, VenusAndMars, Activity, Flame, X, ChevronRight, Wrench, ShieldAlert, Globe, Sparkles } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useTranslations, useLocale } from 'next-intl';
import Cookies from 'js-cookie';

export default function GaragePage() {
    const t = useTranslations('PilotOffice');
    const commonT = useTranslations('Common');
    const langT = useTranslations('Language');
    const locale = useLocale();
    const { data: session } = useSession();
    const { user, bikes, activeBikeIndex, updateUser, updateBike, setBikes, setActiveBikeIndex, addWheelset, setActiveWheelset, toggleUnitSystem } = useStore();
    const bike = bikes[activeBikeIndex] || bikes[0];
    const unit = user.unitSystem;

    const [isAddingWheelset, setIsAddingWheelset] = useState(false);
    const [newWsName, setNewWsName] = useState("");
    const [newWsWidth, setNewWsWidth] = useState(25);
    const [newWsTubeless, setNewWsTubeless] = useState(false);
    const [isPhysioLocked, setIsPhysioLocked] = useState(true);
    const [assetTab, setAssetTab] = useState<'wheelset' | 'torque' | 'log' | 'fit'>('wheelset');

    const { isSyncing, syncSuccess, syncError, sync: handleStravaSync } = useStravaSync();

    const bmr = useMemo(() => calculateBMR(user.weight, user.height, user.age, user.sex), [user]);

    const performanceInsights = useMemo(() => {
        const category = getRiderCategory(user.ftp, user.weight, user.sex);
        const maxHR = 208 - Math.round(0.7 * user.age);
        const vo2Max = estimateVO2Max(maxHR, user.restingHR);
        const idealWeight = calculateIdealRacingWeight(user.height, user.sex);
        const wpkg = (user.ftp / user.weight).toFixed(2);

        return { category, vo2Max, idealWeight, wpkg };
    }, [user]);

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
            toast.error(commonT('error'), {
                description: t('minWheelsetWarning')
            });
            return;
        }
        if (confirm(t('confirmDeleteWheelset'))) {
            const newWheelsets = bike.wheelsets.filter((_, i) => i !== wsIndex);
            updateBike(activeBikeIndex, {
                wheelsets: newWheelsets,
                activeWheelsetIndex: 0
            });
        }
    };

    const onSyncClick = async () => {
        if (!session) return;
        const result = await handleStravaSync();
        if (result.success) {
            toast.success(commonT('success'), {
                description: "Strava Sync Success"
            });
        } else {
            toast.error(commonT('error'), {
                description: result.error || "Strava Sync Failed"
            });
        }
    };

    const handleLanguageChange = (newLocale: string) => {
        Cookies.set('NEXT_LOCALE', newLocale, { expires: 365 });
        window.location.reload();
    };

    return (
        <main className="space-y-8 pb-32">
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-3xl font-black text-gradient-aurora italic tracking-tighter leading-none mb-1">
                    {t('title')}
                </h1>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] ml-0.5">
                    {t('subtitle')}
                </p>
            </header>

            {/* 1. 数据同步 & 账号 */}
            <section className="space-y-4">
                <div className="section-header">
                    <div className="section-indicator orange" />
                    <h2 className="section-title">{t('stravaSync')}</h2>
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
                                {session && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-400 border-2 border-[#050810] rounded-full animate-status-blink" />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white/90 truncate max-w-[140px]">{session?.user?.name || t('unlinked')}</p>
                                <p className="text-[10px] text-white/40 uppercase font-medium">{session ? (isSyncing ? t('syncing') : t('synced')) : t('offlineMode')}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {session && (
                                <button
                                    disabled={isSyncing}
                                    onClick={onSyncClick}
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
                                {session ? commonT('logout') : t('stravaLink')}
                            </button>
                        </div>
                    </div>
                </div>

                {!session && (
                    <div className="pro-card p-6 border-orange-500/20 bg-orange-500/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <RefreshCw size={80} className="text-orange-400 rotate-12" />
                        </div>
                        <div className="space-y-3 relative z-10">
                            <h3 className="text-sm font-bold text-orange-400">{t('syncDisconnected')}</h3>
                            <p className="text-xs text-white/50 leading-relaxed">
                                {t('syncDisconnectedDesc')}
                            </p>
                            <button
                                onClick={() => signIn("strava", { callbackUrl: window.location.href })}
                                className="flex items-center gap-1.5 text-[10px] font-black text-orange-400 uppercase tracking-widest hover:gap-2 transition-all mt-2"
                            >
                                {t('enableSync')} <ChevronRight size={10} />
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* 2. 生理参数设置 [PHYSIO CONFIG] */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="section-header mb-0">
                        <div className="section-indicator pink" />
                        <h2 className="section-title">{t('physioTitle')}</h2>
                    </div>
                    <button
                        onClick={handleToggleLock}
                        className={`liquid-tag py-1.5 px-3 cursor-pointer transition-all border whitespace-nowrap ${isPhysioLocked
                            ? 'border-white/10'
                            : 'danger animate-pulse border-rose-500/30'
                            }`}
                    >
                        {isPhysioLocked ? t('physioLocked') : t('physioUnlocked')}
                    </button>
                </div>

                <div className={`pro-card space-y-5 transition-all ${!isPhysioLocked ? 'border-rose-500/30' : ''}`}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[8px] font-bold text-white/30 uppercase tracking-widest">
                                <Calendar size={10} /> {t('age')}
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
                                <VenusAndMars size={10} /> {t('sex')}
                            </label>
                            <select
                                disabled={isPhysioLocked}
                                value={user.sex}
                                onChange={(e) => updateUser({ sex: e.target.value as any })}
                                className="liquid-select w-full h-11 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <option value="male">{t('male')}</option>
                                <option value="female">{t('female')}</option>
                                <option value="other">{t('other')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[8px] font-bold text-white/30 uppercase tracking-widest">
                                <Ruler size={10} /> {t('height')} (CM)
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
                                <Flame size={10} /> {t('bmr')}
                            </label>
                            <div className="liquid-input h-11 flex items-center justify-between disabled:opacity-80">
                                <span className="text-sm font-mono font-bold text-gradient-sunset">{bmr}</span>
                                <span className="text-[10px] text-white/20 font-bold uppercase tracking-tighter">Kcal/Day</span>
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
                                <span className="text-sm font-medium text-white/80 whitespace-nowrap">{t('restingHR')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    disabled={isPhysioLocked}
                                    value={user.restingHR}
                                    onChange={(e) => updateUser({ restingHR: parseInt(e.target.value) })}
                                    className="liquid-input h-11 w-28 text-center text-sm font-mono text-rose-400 disabled:opacity-40 disabled:cursor-not-allowed"
                                />
                                <span className="text-[10px] font-bold text-white/20 w-8">BPM</span>
                            </div>
                        </div>
                        <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest pl-11">
                            {t('restingHRDesc')}
                        </p>
                    </div>

                    {!isPhysioLocked && (
                        <p className="text-[9px] text-rose-400/70 font-medium leading-tight px-1 flex gap-2 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                            <span>⚠️</span>
                            <span>{t('physioWarning')}</span>
                        </p>
                    )}
                </div>
            </section>
            <section className="space-y-4">
                <div className="section-header">
                    <div className="section-indicator purple" />
                    <h2 className="section-title text-purple-400">{t('proEngine')}</h2>
                </div>

                <div className="pro-card relative overflow-hidden group">
                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                        <Sparkles size={120} className="text-purple-400" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        {/* W/Kg and Category */}
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">{t('wpkg')}</p>
                                    <p className="text-3xl font-black italic text-white tracking-tighter">{performanceInsights.wpkg} <span className="text-xs not-italic text-white/30 uppercase">W/Kg</span></p>
                                </div>
                                <div className="liquid-tag purple py-1 px-2 text-[8px] font-black">PRO ENGINE v2.0</div>
                            </div>
                            <div className="pt-2 border-t border-white/[0.05]">
                                <p className="text-[10px] font-bold text-white/30 uppercase mb-1">{useTranslations('RiderDNA')('progress')}</p>
                                <p className="text-sm font-black text-gradient-aurora italic uppercase">{useTranslations('Ranks')(performanceInsights.category)}</p>
                            </div>
                        </div>

                        {/* VO2 Max and Ideal Weight */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col justify-between">
                                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">{t('vo2max')}</p>
                                <div className="py-2">
                                    <p className="text-2xl font-black italic text-white">{performanceInsights.vo2Max}</p>
                                    <p className="text-[8px] font-bold text-white/30 uppercase mt-1">ml/kg/min</p>
                                </div>
                                <p className="text-[8px] font-medium text-white/20 italic">{t('vo2maxDesc')}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col justify-between">
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">{t('idealWeight')}</p>
                                <div className="py-2">
                                    <p className="text-lg font-black italic text-white">{performanceInsights.idealWeight.min}-{performanceInsights.idealWeight.max}<span className="text-[10px] not-italic text-white/30 ml-1">KG</span></p>
                                </div>
                                <p className="text-[8px] font-medium text-white/20 italic">{t('idealWeightDesc')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Text Overlay */}
                    <div className="mt-4 flex items-center gap-2 opacity-30">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        <span className="text-[8px] font-mono text-white tracking-[0.3em] uppercase">{t('tacticalSync')}</span>
                    </div>
                </div>
            </section>

            {/* 2.5 显示偏好 [DISPLAY SETTINGS] */}
            <section className="space-y-4">
                <div className="section-header">
                    <div className="section-indicator blue" />
                    <h2 className="section-title">{t('language')}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="pro-card">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="liquid-icon p-2">
                                    <Globe size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white/80">{t('unitSystem')}</p>
                                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">{user.unitSystem === 'metric' ? 'Metric' : 'Imperial'}</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleUnitSystem}
                                className="liquid-button py-2 px-6 text-[10px] font-black uppercase tracking-widest"
                            >
                                {commonT('refresh')}
                            </button>
                        </div>
                    </div>

                    <div className="pro-card">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="liquid-icon p-2">
                                    <Globe size={16} className="text-cyan-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white/80">{t('language')}</p>
                                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">{langT(locale)}</p>
                                </div>
                            </div>
                            <select
                                value={locale}
                                onChange={(e) => handleLanguageChange(e.target.value)}
                                className="liquid-select h-9 text-[10px] font-black uppercase tracking-widest bg-white/5 border-none"
                            >
                                <option value="zh-CN">{langT('zh-CN')}</option>
                                <option value="en-US">{langT('en-US')}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. 核心参数 [USER CONFIG] */}
            <section className="space-y-4">
                <div className="section-header">
                    <div className="section-indicator" />
                    <h2 className="section-title">{t('weightPower')}</h2>
                </div>

                <div className="pro-card space-y-5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="liquid-icon success p-2">
                                <Weight size={16} />
                            </div>
                            <span className="text-sm font-medium text-white/80 whitespace-nowrap">{t('weight')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={user.weight}
                                onChange={(e) => updateUser({ weight: parseFloat(e.target.value) })}
                                className="liquid-input h-11 w-28 text-center text-sm font-mono text-emerald-400"
                            />
                            <span className="text-[10px] font-bold text-white/20 w-12 uppercase">{unit === 'metric' ? 'KG' : 'LBS'}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="liquid-icon p-2">
                                <Zap size={16} />
                            </div>
                            <span className="text-sm font-medium text-white/80 whitespace-nowrap">{t('ftp')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={user.ftp}
                                onChange={(e) => updateUser({ ftp: parseInt(e.target.value) })}
                                className="liquid-input h-11 w-28 text-center text-sm font-mono text-cyan-400"
                            />
                            <span className="text-[10px] font-bold text-white/20 w-8">W</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. 车辆切换 [BIKE SWITCHER] */}
            <section className="space-y-4">
                <div className="section-header">
                    <div className="section-indicator purple" />
                    <h2 className="section-title">{t('registeredBikes', { count: bikes.length })}</h2>
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
                            <p className={`text-sm font-mono font-bold ${activeBikeIndex === idx ? 'text-gradient-cyan' : 'text-white/40'}`}>
                                {converters.formatDistance(b.totalDistance, unit)}
                            </p>
                        </button>
                    ))}
                </div>
            </section>

            {/* 5. 机械档案与扭矩管理 [MECHANICAL ARCHIVE] */}
            <section className="space-y-4">
                <div className="section-header">
                    <div className="section-indicator blue" />
                    <h2 className="section-title">{t('mechanical')}</h2>
                </div>

                <div className="pro-card p-0 overflow-hidden">
                    {/* Segmented Control */}
                    <div className="flex p-1.5 bg-white/[0.03] border-b border-white/5 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setAssetTab('wheelset')}
                            className={`flex-1 min-w-[80px] py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${assetTab === 'wheelset' ? 'bg-white/10 text-cyan-400' : 'text-white/30 hover:text-white/50'}`}
                        >
                            {t('wheelsets')}
                        </button>
                        <button
                            onClick={() => setAssetTab('fit')}
                            className={`flex-1 min-w-[80px] py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${assetTab === 'fit' ? 'bg-white/10 text-emerald-400' : 'text-white/30 hover:text-white/50'}`}
                        >
                            {t('geometry')}
                        </button>
                        <button
                            onClick={() => setAssetTab('torque')}
                            className={`flex-1 min-w-[80px] py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${assetTab === 'torque' ? 'bg-white/10 text-purple-400' : 'text-white/30 hover:text-white/50'}`}
                        >
                            {t('torque')}
                        </button>
                        <button
                            onClick={() => setAssetTab('log')}
                            className={`flex-1 min-w-[80px] py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${assetTab === 'log' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'}`}
                        >
                            {t('maintenance')}
                        </button>
                    </div>

                    <div className="p-5">
                        {assetTab === 'wheelset' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{t('savedWheelsets', { count: bike?.wheelsets?.length })}</p>
                                    <button
                                        onClick={() => setIsAddingWheelset(true)}
                                        className="liquid-tag cursor-pointer"
                                    >
                                        <Plus size={10} /> {t('new')}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {bike?.wheelsets?.map((ws, idx) => (
                                        <div
                                            key={idx}
                                            className={`pro-card relative transition-all border-dashed ${bike.activeWheelsetIndex === idx
                                                ? 'border-cyan-500/30 bg-cyan-500/5'
                                                : 'border-white/5'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className={`text-sm font-bold uppercase ${bike.activeWheelsetIndex === idx ? 'text-cyan-400' : 'text-white/70'}`}>{ws.name}</p>
                                                        {bike.activeWheelsetIndex === idx && <CheckCircle2 size={12} className="text-cyan-400" />}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">
                                                            {ws.tireWidth}MM • {ws.isTubeless ? 'TL' : 'CL'} • {converters.formatDistance(ws.mileage, unit, 0)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {bike.activeWheelsetIndex !== idx && (
                                                        <button
                                                            onClick={() => setActiveWheelset(activeBikeIndex, idx)}
                                                            className="text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:brightness-125"
                                                        >
                                                            {t('activeLabel')}
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDeleteWheelset(idx)} className="text-white/20 hover:text-rose-500 transition-colors">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {assetTab === 'fit' && <BikeFitManager />}
                        {assetTab === 'torque' && <TorqueManager />}
                        {assetTab === 'log' && <MaintenanceLogManager />}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="pt-8 text-center">
                <div className="flex items-center justify-center gap-3">
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="flex items-center gap-2 text-[10px] text-white/20 font-bold uppercase tracking-widest">
                        <Save size={10} /> {t('dbSync')}
                    </div>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
            </footer>

            {/* Add Wheelset Modal */}
            {isAddingWheelset && (
                <div className="liquid-overlay">
                    <div className="liquid-modal space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gradient-cyan">{t('configWheelset')}</h3>
                            <button
                                onClick={() => setIsAddingWheelset(false)}
                                className="liquid-icon p-1.5 hover:scale-105 transition-transform"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{t('wsName')}</label>
                                <input
                                    autoFocus
                                    value={newWsName}
                                    onChange={(e) => setNewWsName(e.target.value)}
                                    placeholder={t('wsPlaceholder')}
                                    className="liquid-input text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{t('wsWidth')}</label>
                                    <select
                                        value={newWsWidth}
                                        onChange={(e) => setNewWsWidth(parseInt(e.target.value))}
                                        className="liquid-select w-full py-2.5"
                                    >
                                        {[25, 28, 30, 32].map(w => <option key={w} value={w}>{w}mm</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{t('wsSystem')}</label>
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
                                {commonT('cancel')}
                            </button>
                            <button
                                onClick={handleAddWheelset}
                                className="liquid-button-primary flex-1 py-3 text-sm font-bold rounded-xl"
                            >
                                {t('wsConfirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
