import React, { useState } from "react";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  Wind,
  Droplets,
  Eye,
  Gauge,
} from "lucide-react";

function WheatherApp() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getWeatherIcon = (code, isDay) => {
    if (code === 0) return <Sun className="w-16 h-16 text-yellow-400" />;
    if (code <= 3) return <Cloud className="w-16 h-16 text-gray-400" />;
    if (code <= 67 || code <= 82)
      return <CloudRain className="w-16 h-16 text-blue-400" />;
    if (code <= 77 || code <= 86)
      return <CloudSnow className="w-16 h-16 text-blue-200" />;
    return <Cloud className="w-16 h-16 text-gray-400" />;
  };

  const getWeatherDescription = (code) => {
    const descriptions = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Slight snow",
      73: "Moderate snow",
      75: "Heavy snow",
      77: "Snow grains",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail",
    };
    return descriptions[code] || "Unknown";
  };

  const searchCity = async (e) => {
    e.preventDefault();
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}&count=1&language=en&format=json`
      );
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found. Please try another search.");
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,visibility&timezone=auto`
      );
      const weatherData = await weatherResponse.json();

      setWeather({
        name,
        country,
        ...weatherData.current,
        timezone: weatherData.timezone,
      });
    } catch (err) {
      setError("Failed to fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">Weather Now</h1>
            <p className="text-blue-100">
              Get instant weather updates for any city
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={searchCity} className="mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city name..."
                  className="w-full sm:flex-1 px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </form>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                {error}
              </div>
            )}

            {weather && (
              <div className="space-y-6">
                <div className="text-center pb-6 border-b border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-800 mb-1">
                    {weather.name}, {weather.country}
                  </h2>
                  <p className="text-gray-500">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-8 py-6">
                  {getWeatherIcon(weather.weather_code, weather.is_day)}
                  <div>
                    <div className="text-6xl font-bold text-gray-800">
                      {Math.round(weather.temperature_2m)}°C
                    </div>
                    <div className="text-xl text-gray-600 mt-2">
                      {getWeatherDescription(weather.weather_code)}
                    </div>
                    <div className="text-gray-500 mt-1">
                      Feels like {Math.round(weather.apparent_temperature)}°C
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6">
                  <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
                    <Wind className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-600">Wind Speed</div>
                      <div className="text-xl font-semibold text-gray-800">
                        {Math.round(weather.wind_speed_10m)} km/h
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
                    <Droplets className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-600">Humidity</div>
                      <div className="text-xl font-semibold text-gray-800">
                        {weather.relative_humidity_2m}%
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
                    <Gauge className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-600">Pressure</div>
                      <div className="text-xl font-semibold text-gray-800">
                        {Math.round(weather.pressure_msl)} hPa
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
                    <Eye className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-600">Visibility</div>
                      <div className="text-xl font-semibold text-gray-800">
                        {(weather.visibility / 1000).toFixed(1)} km
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
                    <CloudRain className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-600">Precipitation</div>
                      <div className="text-xl font-semibold text-gray-800">
                        {weather.precipitation} mm
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
                    <Wind className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-600">
                        Wind Direction
                      </div>
                      <div className="text-xl font-semibold text-gray-800">
                        {weather.wind_direction_10m}°
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!weather && !loading && !error && (
              <div className="text-center py-12 text-gray-400">
                <Cloud className="w-24 h-24 mx-auto mb-4 opacity-50" />
                <p className="text-xl">
                  Enter a city name to check the weather
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WheatherApp;
