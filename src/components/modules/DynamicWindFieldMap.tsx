"use client";

import { useEffect, useRef, useState } from "react";
import { Wind, Navigation, Loader2, AlertTriangle, ChevronDown, Map } from "lucide-react";
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

    const handleRouteChange = (index: number) => {
        setActiveRouteIndex(index);
        decodeAndProject(allRoutes[index].polyline);
        setShowSelector(false);
    };

    // Animation Engine
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

            // Draw route with glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = "rgba(0, 212, 255, 0.5)";
            ctx.beginPath();
            ctx.strokeStyle = "#00d4ff";
            ctx.lineWidth = 2.5;
            ctx.setLineDash([5, 8]);

            if (routePoints.length > 0) {
                ctx.moveTo(routePoints[0].x, routePoints[0].y);
                routePoints.forEach(p => ctx.lineTo(p.x, p.y));
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Draw particles
            particles.forEach((p, i) => {
                ctx.beginPath();
                const opacity = p.life / 100;
                const isHighSpeed = p.vx > 3.2;
                ctx.strokeStyle = isHighSpeed
                    ? `rgba(248, 113, 113, ${opacity})`
                    : `rgba(74, 222, 128, ${opacity})`;
                ctx.lineWidth = 1.5;
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
        <div className="pro-card p-0 overflow-hidden group">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/[0.05] bg-white/[0.01]">
                <div className="flex items-center gap-2 relative">
                    <div className="liquid-icon p-1.5">
                        <Navigation size={12} />
                    </div>

                    {allRoutes.length > 0 ? (
                        <button
                            onClick={() => setShowSelector(!showSelector)}
                            className="flex items-center gap-1.5 group/btn"
                        >
                            <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest group-hover/btn:text-white transition-colors">
                                {allRoutes[activeRouteIndex].name}
                            </h2>
                            <ChevronDown size={12} className={`text-cyan-400/50 transition-transform ${showSelector ? 'rotate-180' : ''}`} />
                        </button>
                    ) : (
                        <h2 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                            {isLoading ? 'SYNCING DATA...' : 'VeloTrace Demo Loop'}
                        </h2>
                    )}

                    {/* Route Selector Dropdown */}
                    {showSelector && allRoutes.length > 0 && (
                        <div className="absolute top-full left-0 mt-2 w-60 liquid-modal p-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                            <p className="px-2 py-1.5 text-[8px] font-bold text-white/30 uppercase tracking-widest border-b border-white/[0.05] mb-2">
                                选择骑行路线 / Select Route
                            </p>
                            <div className="max-h-48 overflow-y-auto space-y-1">
                                {allRoutes.map((route, idx) => (
                                    <button
                                        key={route.id}
                                        onClick={() => handleRouteChange(idx)}
                                        className={`w-full text-left p-3 rounded-xl flex flex-col gap-1 transition-colors ${activeRouteIndex === idx
                                            ? 'bg-cyan-500/10 border border-cyan-500/20'
                                            : 'hover:bg-white/[0.03] border border-transparent'
                                            }`}
                                    >
                                        <span className={`text-[10px] font-bold truncate ${activeRouteIndex === idx ? 'text-cyan-400' : 'text-white/70'}`}>
                                            {route.name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="liquid-tag text-[7px] py-0.5">{Math.round(route.distance / 1000)}KM</span>
                                            <span className="liquid-tag success text-[7px] py-0.5">+{Math.round(route.elevation)}M</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {isLoading && <Loader2 size={12} className="animate-spin text-cyan-400" />}
                    <button
                        onClick={() => setIs3D(!is3D)}
                        className="liquid-segment p-0.5"
                    >
                        <span className={`liquid-segment-button py-1 px-2.5 text-[8px] ${is3D ? 'active' : ''}`}>3D</span>
                        <span className={`liquid-segment-button py-1 px-2.5 text-[8px] ${!is3D ? 'active' : ''}`}>2D</span>
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="relative h-[280px] w-full bg-[#050810] overflow-hidden">
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'linear-gradient(rgba(0, 212, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.3) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />

                {/* Aurora Glow */}
                <div className="absolute top-0 left-1/4 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-32 h-32 rounded-full bg-purple-500/10 blur-3xl" />

                <div className={`w-full h-full transition-all duration-1000 ease-in-out ${is3D ? '[transform:rotateX(50deg)_rotateZ(-15deg)] scale-110' : ''}`}>
                    <canvas ref={canvasRef} width={400} height={280} className="w-full h-full" />
                </div>

                {/* Status Message */}
                {statusMessage && (
                    <div className="absolute top-4 left-4 liquid-tag warning text-[8px] py-1.5 px-3">
                        <AlertTriangle size={10} />
                        {statusMessage}
                    </div>
                )}

                {/* Legend */}
                <div className="absolute bottom-4 right-4 p-3 rounded-xl bg-black/40 backdrop-blur-xl border border-white/[0.05] space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                        <span className="text-[8px] font-bold text-white/50 uppercase">Aero Boost</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]" />
                        <span className="text-[8px] font-bold text-white/50 uppercase">Wind Threat</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/[0.01] border-t border-white/[0.05] flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="liquid-icon p-2">
                        <Wind size={14} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">气流动力学模拟</p>
                        <p className="text-[8px] text-white/30 uppercase">Real-time CFD Visualization</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="liquid-tag text-[7px]">
                        {allRoutes[activeRouteIndex]?.distance ? `${(allRoutes[activeRouteIndex].distance / 1000).toFixed(1)}KM` : 'LOCAL SIM'}
                    </span>
                    <span className="liquid-tag purple text-[7px]">
                        {allRoutes.length} Routes
                    </span>
                </div>
            </div>
        </div>
    );
}
