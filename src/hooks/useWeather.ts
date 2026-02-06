import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';

export interface WeatherData {
    temp: number;
    apparentTemp: number;
    windSpeed: number;
    windDirection: number;
    isRainy: boolean;
    city: string;
}

export function useWeather() {
    const { weatherCache, setWeatherCache } = useStore();
    const [loading, setLoading] = useState(!weatherCache);
    const [error, setError] = useState<string | null>(null);

    const data = weatherCache?.data as WeatherData | null;

    const performLocationRequest = (highAccuracy: boolean = true) => {
        return new Promise<GeolocationPosition>((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation not supported"));
                return;
            }
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: highAccuracy,
                timeout: highAccuracy ? 8000 : 15000,
                maximumAge: 600000
            });
        });
    };

    const fetchWeatherData = async (latitude: number, longitude: number) => {
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh&timezone=auto`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const json = await res.json();

            if (!json || !json.current) throw new Error("Invalid response from weather API");
            const current = json.current;

            const newData: WeatherData = {
                temp: current.temperature_2m,
                apparentTemp: current.apparent_temperature,
                windSpeed: current.wind_speed_10m,
                windDirection: current.wind_direction_10m,
                isRainy: current.precipitation > 0,
                city: "本地探测结果"
            };

            setWeatherCache({
                data: newData,
                timestamp: Date.now()
            });
            setError(null);
        } catch (_err) {
            setError("Failed to fetch weather");
        } finally {
            setLoading(false);
        }
    };

    const getLocation = async (force: boolean = false) => {
        if (typeof window === 'undefined' || !navigator.geolocation) {
            setError("Geolocation not supported");
            setLoading(false);
            return;
        }

        // Cache logic: 15 minutes fresh
        if (!force && weatherCache && Date.now() - weatherCache.timestamp < 15 * 60 * 1000) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // First attempt: High accuracy
            const position = await performLocationRequest(true).catch(async (err) => {
                console.warn("⚠️ High accuracy failed, falling back...", err);
                // Second attempt: Low accuracy fallback
                return await performLocationRequest(false);
            });

            const { latitude, longitude } = position.coords;
            await fetchWeatherData(latitude, longitude);
        } catch (err) {
            console.error("❌ Geolocation final error:", err);
            setError("Location denied or timeout");
            // Final fallback to Beijing if no data exists
            if (!data) await fetchWeatherData(39.9042, 116.4074);
            setLoading(false);
        }
    };

    useEffect(() => {
        getLocation();
    }, []);

    return { data, loading, error, refresh: () => getLocation(true) };
}
