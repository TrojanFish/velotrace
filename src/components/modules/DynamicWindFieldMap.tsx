"use client";

import { useEffect, useRef, useState } from "react";
import { Wind, Navigation, Maximize2, Loader2, AlertTriangle, Info, ChevronDown, ListFilter } from "lucide-react";
import polyline from "polyline-encoded";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
}

interface Point {
    x: number;
    y: number;
}

interface StravaRoute {
    id: string;
    name: string;
    distance: number;
    elevation: number;
    polyline: string;
}

export function DynamicWindFieldMap() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [is3D, setIs3D] = useState(true);
    const [routePoints, setRoutePoints] = useState<Point[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [allRoutes, setAllRoutes] = useState<StravaRoute[]>([]);
    const [activeRouteIndex, setActiveRouteIndex] = useState<number>(0);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [showSelector, setShowSelector] = useState(false);

    const useDemoRoute = () => {
        setRoutePoints([
            { x: 50, y: 150 },
            { x: 100, y: 100 },
            { x: 200, y: 200 },
            { x: 300, y: 100 },
            { x: 350, y: 150 }
        ]);
        setStatusMessage("DEMO MODE: Using Synthetic Loop");
    };

    // 1. Fetch all routes initially
    useEffect(() => {
        async function fetchRoutes() {
            setIsLoading(true);
            try {
                const res = await fetch('/api/strava/routes');
                const data = await res.json();

                if (data.error || !data.routes || data.routes.length === 0) {
                    useDemoRoute();
                    return;
                }

                setAllRoutes(data.routes);
                setActiveRouteIndex(0);
                decodeAndProject(data.routes[0].polyline);
            } catch (err) {
                console.warn("Strava Route Sync Failed", err);
                useDemoRoute();
            } finally {
                setIsLoading(false);
            }
        }
        fetchRoutes();
    }, []);

    // 2. Decoder & Projector
    const decodeAndProject = (encoded: string) => {
        if (!encoded) {
            useDemoRoute();
            return;
        }

        const decoded = polyline.decode(encoded);
        if (decoded.length < 2) {
            useDemoRoute();
            return;
        }

        const lats = decoded.map(p => p[0]);
        const lngs = decoded.map(p => p[1]);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        const projected = decoded.map(p => ({
            x: ((p[1] - minLng) / (maxLng - minLng)) * 300 + 50,
            y: (1 - (p[0] - minLat) / (maxLat - minLat)) * 200 + 50
        }));

        setRoutePoints(projected);
        setStatusMessage(null);
    };

    // 3. Switch route handler
    const handleRouteChange = (index: number) => {
        setActiveRouteIndex(index);
        decodeAndProject(allRoutes[index].polyline);
        setShowSelector(false);
    };

    // 4. Animation Engine
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || routePoints.length === 0) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        const particles: Particle[] = [];
        const particleCount = 45;

        const createParticle = () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() + 0.5) * 2.8,
            vy: (Math.random() - 0.5) * 1.2,
            life: Math.random() * 100
        });

        for (let i = 0; i < particleCount; i++) {
            particles.push(createParticle());
        }

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.beginPath();
            ctx.strokeStyle = "#06b6d4";
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 8]);

            if (routePoints.length > 0) {
                ctx.moveTo(routePoints[0].x, routePoints[0].y);
                routePoints.forEach(p => ctx.lineTo(p.x, p.y));
            }
            ctx.stroke();

            particles.forEach((p, i) => {
                ctx.beginPath();
                const opacity = p.life / 100;
                ctx.strokeStyle = p.vx > 3.2 ? `rgba(244, 63, 94, ${opacity})` : `rgba(34, 197, 94, ${opacity})`;
                ctx.lineWidth = 1.2;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + p.vx * 4, p.y + p.vy * 4);
                ctx.stroke();

                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.6;

                if (p.life < 0 || p.x > canvas.width) {
                    particles[i] = createParticle();
                    particles[i].x = 0;
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [routePoints]);

    return (
        <div className="pro-card border-cyan-500/20 bg-slate-950/40 p-0 overflow-hidden group">
            <div className="p-4 flex items-center justify-between border-b border-slate-900 bg-slate-950/20">
                <div className="flex items-center gap-2 relative">
                    <Navigation size={14} className="text-cyan-400" />

                    {allRoutes.length > 0 ? (
                        <button
                            onClick={() => setShowSelector(!showSelector)}
                            className="flex items-center gap-1.5 group/btn"
                        >
                            <h2 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] group-hover/btn:text-white transition-colors">
                                {allRoutes[activeRouteIndex].name}
                            </h2>
                            <ChevronDown size={12} className={`text-cyan-400/50 transition-transform ${showSelector ? 'rotate-180' : ''}`} />
                        </button>
                    ) : (
                        <h2 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">
                            {isLoading ? 'SYNCING DATA...' : 'VeloTrace Demo Loop'}
                        </h2>
                    )}

                    {/* Route Selector Dropdown */}
                    {showSelector && allRoutes.length > 0 && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl z-[100] p-2 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                            <p className="px-2 py-1.5 text-[8px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-900 mb-1">
                                选择骑行路线 / Select Route
                            </p>
                            <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-hide">
                                {allRoutes.map((route, idx) => (
                                    <button
                                        key={route.id}
                                        onClick={() => handleRouteChange(idx)}
                                        className={`w-full text-left p-2.5 rounded-lg flex flex-col gap-0.5 transition-colors ${activeRouteIndex === idx ? 'bg-cyan-500/10 border border-cyan-500/20' : 'hover:bg-slate-900 border border-transparent'
                                            }`}
                                    >
                                        <span className={`text-[10px] font-black ${activeRouteIndex === idx ? 'text-cyan-400' : 'text-slate-300'}`}>
                                            {route.name}
                                        </span>
                                        <div className="flex items-center gap-3 text-[8px] text-slate-500 font-bold uppercase">
                                            <span>{Math.round(route.distance / 1000)}KM</span>
                                            <span>+{Math.round(route.elevation)}M</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {isLoading && <Loader2 size={12} className="animate-spin text-cyan-400" />}
                    <button
                        onClick={() => setIs3D(!is3D)}
                        className="p-1 px-3 bg-slate-800 rounded-lg text-[9px] font-black uppercase text-slate-400 hover:text-cyan-400 transition-all border border-slate-700/50"
                    >
                        {is3D ? 'View: 3D' : 'View: Flat'}
                    </button>
                </div>
            </div>

            <div className="relative h-[300px] w-full bg-[#020617] overflow-hidden">
                <div className="absolute inset-0 opacity-[0.05]" style={{
                    backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />

                <div className={`w-full h-full transition-all duration-1000 ease-in-out ${is3D ? '[transform:rotateX(50deg)_rotateZ(-15deg)] scale-110' : ''}`}>
                    <canvas ref={canvasRef} width={400} height={300} className="w-full h-full" />
                </div>

                {statusMessage && (
                    <div className="absolute top-4 left-4 p-2 px-3 bg-amber-500/10 border border-amber-500/20 rounded-xl backdrop-blur-md flex items-center gap-2">
                        <AlertTriangle size={12} className="text-amber-500" />
                        <span className="text-[9px] font-black text-amber-500 uppercase">
                            {statusMessage}
                        </span>
                    </div>
                )}

                <div className="absolute bottom-6 right-6 p-3 bg-slate-950/60 backdrop-blur-md border border-white/5 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[8px] font-black text-slate-400 uppercase">Aero Boost</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500" /><span className="text-[8px] font-black text-slate-400 uppercase">Wind Threat</span></div>
                </div>
            </div>

            <div className="p-4 bg-slate-950/20 border-t border-slate-900 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                        <Wind size={14} className="text-cyan-400" />
                    </div>
                    <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-wider">气流动力学模拟 / Real-time CFD</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                        {allRoutes[activeRouteIndex]?.distance ? `${(allRoutes[activeRouteIndex].distance / 1000).toFixed(1)}KM` : 'LOCAL SIM'}
                    </span>
                    <div className="w-1 h-1 bg-slate-700 rounded-full" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">
                        {allRoutes.length} Routes Synced
                    </span>
                </div>
            </div>
        </div>
    );
}
