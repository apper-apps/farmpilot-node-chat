class WeatherService {
  constructor() {
    this.tableName = 'weather_c';
    this.apperClient = null;
    this.initializeClient();
  }

  initializeClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  async getCurrentWeather() {
    if (!this.apperClient) this.initializeClient();
    
    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "Name" } },
        { field: { Name: "date_c" } },
        { field: { Name: "temperature_c" } },
        { field: { Name: "condition_c" } },
        { field: { Name: "precipitation_c" } },
        { field: { Name: "wind_c" } },
        { field: { Name: "humidity_c" } },
        { field: { Name: "uv_c" } }
      ],
      pagingInfo: {
        limit: 5,
        offset: 0
      }
    };

    const response = await this.apperClient.fetchRecords(this.tableName, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    return (response.data || []).map(weather => ({
      date: weather.date_c || new Date().toLocaleDateString(),
      temperature: parseInt(weather.temperature_c) || 75,
      condition: weather.condition_c || 'Sunny',
      precipitation: parseInt(weather.precipitation_c) || 0,
      wind: parseInt(weather.wind_c) || 5,
      humidity: parseInt(weather.humidity_c) || 65,
      uv: parseInt(weather.uv_c) || 6
    }));
  }

  async getExtendedForecast() {
    if (!this.apperClient) this.initializeClient();
    
    const params = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "Name" } },
        { field: { Name: "date_c" } },
        { field: { Name: "temperature_c" } },
        { field: { Name: "condition_c" } },
        { field: { Name: "precipitation_c" } },
        { field: { Name: "wind_c" } },
        { field: { Name: "humidity_c" } },
        { field: { Name: "uv_c" } }
      ]
    };

    const response = await this.apperClient.fetchRecords(this.tableName, params);
    
    if (!response.success) {
      throw new Error(response.message);
    }

    return (response.data || []).map(weather => ({
      date: weather.date_c || new Date().toLocaleDateString(),
      temperature: parseInt(weather.temperature_c) || 75,
      condition: weather.condition_c || 'Sunny',
      precipitation: parseInt(weather.precipitation_c) || 0,
      wind: parseInt(weather.wind_c) || 5,
      humidity: parseInt(weather.humidity_c) || 65,
      uv: parseInt(weather.uv_c) || 6
    }));
  }
}

export default new WeatherService();