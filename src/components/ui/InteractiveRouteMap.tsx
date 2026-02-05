"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Polyline, useMap, LayersControl, CircleMarker, Marker, Tooltip as LeafletTooltip } from "react-leaflet";
import L from "leaflet";
import { Wind, Wind as WindIcon, Eye, EyeOff } from "lucide-react";

interface Point {
    lat: number;
    lon: number;
}

interface InteractiveRouteMapProps {
    points: Point[];
    windSpeed?: number;
    windDeg?: number;
}

function ChangeView({ bounds }: { bounds: L.LatLngBoundsExpression }) {
    const map = useMap();
    useEffect(() => {
        map.fitBounds(bounds, { padding: [20, 20] });
    }, [bounds, map]);
    return null;
}

// Helper to draw a small arrow on canvas or as SVG
function WindArrow({ lat, lon, deg, speed }: { lat: number; lon: number; deg: number; speed: number }) {
    const opacity = Math.min(1, speed / 20); // Stronger wind = more visible

    return (
        <CircleMarker
            center={[lat, lon]}
            radius={2}
            pathOptions={{ color: '#22d3ee', fillOpacity: opacity, stroke: false }}
        >
            <LeafletTooltip direction="top" opacity={0.9} permanent className="bg-transparent border-none shadow-none text-cyan-400 p-0">
                <div
                    style={{ transform: `rotate(${deg}deg)` }}
                    className="flex flex-col items-center"
                >
                    <WindIcon size={14} className="opacity-60" />
                </div>
            </LeafletTooltip>
        </CircleMarker>
    );
}

// A more sophisticated wind field using a custom hook for the map
function WindFieldOverlay({ points, windDeg, windSpeed }: { points: Point[], windDeg: number, windSpeed: number }) {
    const map = useMap();
    const [zoom, setZoom] = useState(map.getZoom());

    useEffect(() => {
        const onZoom = () => setZoom(map.getZoom());
        map.on('zoomend', onZoom);
        return () => { map.off('zoomend', onZoom); };
    }, [map]);

    // Sample points along the route based on zoom level
    const sampledPoints = useMemo(() => {
        const interval = Math.max(1, Math.floor(20 / (zoom - 10 || 1)));
        const result = [];
        for (let i = 0; i < points.length; i += interval) {
            result.push(points[i]);
        }
        return result;
    }, [points, zoom]);

    return (
        <>
            {sampledPoints.map((p, i) => (
                <CircleMarker
                    key={i}
                    center={[p.lat, p.lon]}
                    radius={1}
                    pathOptions={{ color: '#22d3ee', fillOpacity: 0.2, stroke: false }}
                >
                    <WindVector lat={p.lat} lon={p.lon} deg={windDeg} speed={windSpeed} />
                </CircleMarker>
            ))}
        </>
    );
}

function WindVector({ lat, lon, deg, speed }: { lat: number; lon: number; deg: number; speed: number }) {
    // We can't easily draw SVG arrows in standard Leaflet markers without custom icons
    // So we use a DivIcon
    const arrowIcon = L.divIcon({
        html: `<div style="transform: rotate(${deg}deg); opacity: ${Math.min(0.8, speed / 25)}; color: #22d3ee;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
               </div>`,
        className: 'wind-arrow-icon',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });

    return <Marker position={[lat, lon]} icon={arrowIcon} />;
}

export default function InteractiveRouteMap({ points, windSpeed = 15, windDeg = 240 }: InteractiveRouteMapProps) {
    const [showWind, setShowWind] = useState(true);

    if (points.length === 0) return null;

    const positions = points.map(p => [p.lat, p.lon] as [number, number]);
    const bounds = L.latLngBounds(positions);

    return (
        <div className="w-full h-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative">
            <div className="absolute top-2 right-2 z-[1000] flex flex-col gap-2">
                <button
                    onClick={() => setShowWind(!showWind)}
                    className={`p-2 rounded-lg backdrop-blur-md border border-white/10 transition-all ${showWind ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-slate-900/80 text-white/40'
                        }`}
                >
                    {showWind ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
            </div>

            <MapContainer
                bounds={bounds}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
                className="bg-slate-900"
            >
                <LayersControl position="bottomright">
                    <LayersControl.BaseLayer checked name="高德/街道">
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="CyclOSM (骑行)">
                        <TileLayer
                            attribution='&copy; CyclOSM'
                            url="https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="卫星地图">
                        <TileLayer
                            attribution='&copy; Esri'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                <Polyline
                    positions={positions}
                    color="#22d3ee"
                    weight={4}
                    opacity={0.8}
                    lineCap="round"
                    lineJoin="round"
                />

                {showWind && <WindFieldOverlay points={points} windDeg={windDeg} windSpeed={windSpeed} />}

                <ChangeView bounds={bounds} />
            </MapContainer>
        </div>
    );
}
