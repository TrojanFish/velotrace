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
    const [loading, setLoading] = useState(!weatherCache); // Only load if no cache
    const [error, setError] = useState<string | null>(null);

    const data = weatherCache?.data as WeatherData | null;

    useEffect(() => {
        const getLocation = () => {
            if (typeof window === 'undefined' || !navigator.geolocation) {
                setError("Geolocation not supported");
                setLoading(false);
                return;
            }

            // If we have cache within last 15 minutes, don't force a refresh immediately for UI stability
            if (weatherCache && Date.now() - weatherCache.timestamp < 15 * 60 * 1000) {
                setLoading(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeatherData(latitude, longitude);
                },
                (err) => {
                    console.error("❌ Location Error:", err.code, err.message);
                    if (!data) fetchWeatherData(39.9042, 116.4074);
                    setLoading(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 300000 // Accept 5 min old location
                }
            );
        };

        getLocation();
    }, [weatherCache]);

    const fetchWeatherData = async (latitude: number, longitude: number) => {
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh&timezone=auto`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const text = await res.text();
            const json = text ? JSON.parse(text) : null;

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
        } catch (_err) {
            setError("Failed to fetch weather");
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error };
}
