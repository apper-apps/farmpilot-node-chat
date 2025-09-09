import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import { Card, CardContent, CardHeader } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import WeatherCard from "@/components/molecules/WeatherCard";
import weatherService from "@/services/api/weatherService";

const Weather = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const data = await weatherService.getExtendedForecast();
      setWeatherData(data);
    } catch (err) {
      setError(err.message || "Failed to load weather data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherData();
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error title="Weather Error" message={error} onRetry={loadWeatherData} />;

  const currentWeather = weatherData[0];
  const upcomingWeather = weatherData.slice(1);

  const getAgriculturalAdvice = (weather) => {
    const advice = [];
    
if (weather.temperature > 85) {
      advice.push({ 
        type: "warning", 
        text: "High temperatures expected. Increase watering frequency.", 
        icon: "Thermometer" 
      });
    }
    
    if (weather.precipitation > 70) {
      advice.push({ 
        type: "info", 
        text: "High chance of rain. Consider postponing outdoor activities.", 
        icon: "CloudRain" 
      });
    }
    
    if (weather.wind > 15) {
      advice.push({ 
        type: "caution", 
        text: "Strong winds forecasted. Secure loose equipment.", 
        icon: "Wind" 
      });
    }
    
    if (weather.temperature < 40) {
      advice.push({ 
        type: "danger", 
        text: "Cold temperatures may affect sensitive crops. Consider protection.", 
        icon: "Snowflake" 
      });
    }

    if (advice.length === 0) {
      advice.push({ 
        type: "success", 
        text: "Favorable conditions for most farm activities.", 
        icon: "Sun" 
      });
    }

    return advice;
  };

  const getAdviceVariant = (type) => {
    switch (type) {
      case "warning":
        return "warning";
      case "danger":
        return "error";
      case "info":
        return "primary";
      case "caution":
        return "warning";
      default:
        return "success";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700">Weather Forecast</h1>
          <p className="text-gray-600 mt-1">
            Stay informed about weather conditions for better farm planning
          </p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg">
          <div className="text-sm opacity-90">Location</div>
          <div className="text-lg font-bold">Your Farm Area</div>
        </div>
      </div>

      {/* Current Weather */}
      {currentWeather && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Today's Weather</h2>
                  <p className="opacity-90">{currentWeather.date}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">{currentWeather.temperature}°F</div>
                  <div className="opacity-90 capitalize">{currentWeather.condition}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ApperIcon name="Droplets" className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-primary-700">{currentWeather.precipitation}%</div>
                  <div className="text-sm text-gray-500">Precipitation</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ApperIcon name="Wind" className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-primary-700">{currentWeather.wind} mph</div>
                  <div className="text-sm text-gray-500">Wind Speed</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ApperIcon name="Gauge" className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-primary-700">{currentWeather.humidity || 65}%</div>
                  <div className="text-sm text-gray-500">Humidity</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ApperIcon name="Sun" className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-primary-700">{currentWeather.uv || 6}</div>
                  <div className="text-sm text-gray-500">UV Index</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Agricultural Advisory */}
      {currentWeather && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <ApperIcon name="AlertCircle" className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-bold text-primary-700">Agricultural Advisory</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getAgriculturalAdvice(currentWeather).map((advice, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      advice.type === "success" ? "bg-secondary-500" :
                      advice.type === "warning" ? "bg-yellow-500" :
                      advice.type === "danger" ? "bg-red-500" :
                      "bg-blue-500"
                    }`}>
                      <ApperIcon name={advice.icon} className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <Badge variant={getAdviceVariant(advice.type)} className="mb-2">
                        {advice.type.toUpperCase()}
                      </Badge>
                      <p className="text-gray-700">{advice.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 7-Day Forecast */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ApperIcon name="Calendar" className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-bold text-primary-700">7-Day Forecast</h2>
              </div>
              <Badge variant="primary">Extended Forecast</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
              {weatherData.map((weather, index) => (
                <WeatherCard key={index} weather={weather} index={index} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weather Tips for Farmers */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ApperIcon name="Lightbulb" className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-bold text-primary-700">Weather Tips for Farmers</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <ApperIcon name="CloudRain" className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Rainy Weather</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Use rainy days for indoor tasks like equipment maintenance, planning, and record keeping.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <ApperIcon name="Sun" className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Sunny Days</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Perfect for harvesting, planting, and field work. Start early to avoid midday heat.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                    <ApperIcon name="Thermometer" className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Hot Weather</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Increase watering frequency and consider shade covers for sensitive crops.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Weather;