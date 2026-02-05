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
        if (!navigator.geolocation) {
            setError("Geolocation not supported");
            setLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(async (position) => {
            fetchWeatherData(position.coords.latitude, position.coords.longitude);
        }, () => {
            setError("Location timed out / denied - Using Default");
            fetchWeatherData(39.9042, 116.4074);
        }, { timeout: 5000 });
    }, []);

    const fetchWeatherData = async (latitude: number, longitude: number) => {
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh&timezone=auto`);
            const json = await res.json();

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
