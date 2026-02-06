import { useState, useEffect } from 'react';

export interface WeatherData {
    temp: number;
    apparentTemp: number;
    windSpeed: number;
    windDirection: number;
    isRainy: boolean;
    city: string;
}

export function useWeather() {
    const [data, setData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getLocation = () => {
            if (typeof window === 'undefined' || !navigator.geolocation) {
                setError("Geolocation not supported");
                setLoading(false);
                return;
            }

            // iOS PWA Tip: Geolocation is strictly tied to HTTPS and domain origin.
            // We use high accuracy and a reasonably long timeout.
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log("📍 Location acquired:", latitude, longitude);
                    fetchWeatherData(latitude, longitude);
                },
                (err) => {
                    console.error("❌ Location Error:", err.code, err.message);
                    // Specific handling for permission denial
                    if (err.code === 1) {
                        setError("Permission Denied - Using Default");
                    } else {
                        setError("Location Timeout - Using Default");
                    }
                    // Fallback to Beijing if no data exists
                    if (!data) fetchWeatherData(39.9042, 116.4074);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                }
            );
        };

        getLocation();
    }, []);

    const fetchWeatherData = async (latitude: number, longitude: number) => {
        try {
            // Speed optimization: Use cache-control for faster weather response
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh&timezone=auto`, {
                cache: 'force-cache'
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const text = await res.text();
            const json = text ? JSON.parse(text) : null;

            if (!json || !json.current) throw new Error("Invalid response from weather API");
            const current = json.current;
            setData({
                temp: current.temperature_2m,
                apparentTemp: current.apparent_temperature,
                windSpeed: current.wind_speed_10m,
                windDirection: current.wind_direction_10m,
                isRainy: current.precipitation > 0,
                city: "本地探测结果"
            });
        } catch (_err) {
            setError("Failed to fetch weather");
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error };
}
