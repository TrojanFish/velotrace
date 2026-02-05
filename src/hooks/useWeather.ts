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
            try {
                const { latitude, longitude } = position.coords;
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh&timezone=auto`);
                const json = await res.json();

                const current = json.current;
                setData({
                    temp: current.temperature_2m,
                    apparentTemp: current.apparent_temperature,
                    windSpeed: current.wind_speed_10m,
                    windDirection: current.wind_direction_10m,
                    isRainy: current.precipitation > 0,
                    city: "我的位置"
                });
            } catch (_err) {
                setError("Failed to fetch weather");
            } finally {
                setLoading(false);
            }
        }, () => {
            setError("Location permission denied");
            setLoading(false);
        });
    }, []);

    return { data, loading, error };
}
