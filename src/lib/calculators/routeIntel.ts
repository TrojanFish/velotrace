/**
 * Route intelligence utilities for VeloTrace
 * Handles polyline decoding and bearing calculations.
 */

export interface Point {
    lat: number;
    lng: number;
}

/**
 * Decodes a Google Encoded Polyline
 */
export function decodePolyline(encoded: string): Point[] {
    const points: Point[] = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        points.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }
    return points;
}

/**
 * Calculates initial bearing between two points
 * Returns degrees 0-360
 */
export function calculateBearing(start: Point, end: Point): number {
    const startLat = start.lat * Math.PI / 180;
    const startLng = start.lng * Math.PI / 180;
    const endLat = end.lat * Math.PI / 180;
    const endLng = end.lng * Math.PI / 180;

    const y = Math.sin(endLng - startLng) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) -
        Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);

    let brng = Math.atan2(y, x) * 180 / Math.PI;
    return (brng + 360) % 360;
}

/**
 * Scores a route based on wind relative to its bearing
 * Score: 1.0 (Full Tailwind) to -1.0 (Full Headwind)
 */
export function scoreWindAlignment(routeBearing: number, windDeg: number): number {
    // Difference between wind source direction and route travel direction
    // If wind is at 180deg (South) and route is 180deg (To South), it's a tailwind.
    let diff = Math.abs(routeBearing - windDeg);
    if (diff > 180) diff = 360 - diff;

    // Normalize to score between -1 and 1
    // 0 deg diff -> score 1
    // 180 deg diff -> score -1
    return 1 - (diff / 90);
}
