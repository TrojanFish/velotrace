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
            if (!navigator.geolocation) {
                setError("Geolocation not supported");
                setLoading(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    fetchWeatherData(position.coords.latitude, position.coords.longitude);
                },
                (err) => {
                    console.error("Location Error:", err.code, err.message);
                    setError("Location failed - Using Default");
                    // Only fetch default if we haven't got data yet
                    if (!data) fetchWeatherData(39.9042, 116.4074);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        };

        getLocation();
    }, []);

    const fetchWeatherData = async (latitude: number, longitude: number) => {
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh&timezone=auto`);
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
                city: "默认位置 (北京)"
            });
        } catch (_err) {
            setError("Failed to fetch weather");
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error };
}
