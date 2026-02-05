"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, useMap, LayersControl } from "react-leaflet";
import L from "leaflet";

interface Point {
    lat: number;
    lon: number;
}

interface InteractiveRouteMapProps {
    points: Point[];
}

function ChangeView({ bounds }: { bounds: L.LatLngBoundsExpression }) {
    const map = useMap();
    useEffect(() => {
        map.fitBounds(bounds, { padding: [20, 20] });
    }, [bounds, map]);
    return null;
}

export default function InteractiveRouteMap({ points }: InteractiveRouteMapProps) {
    if (points.length === 0) return null;

    const positions = points.map(p => [p.lat, p.lon] as [number, number]);
    const bounds = L.latLngBounds(positions);

    return (
        <div className="w-full h-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
            <MapContainer
                bounds={bounds}
                style={{ height: "100%", width: "100%" }}
                zoomControl={true}
                className="bg-slate-900"
            >
                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="高德/街道">
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="CyclOSM (专业骑行)">
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

                <ChangeView bounds={bounds} />
            </MapContainer>
        </div>
    );
}
