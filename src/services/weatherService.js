// Weather Service - Handles API calls to weather providers

const MAX_CITY_LENGTH = 100;
const CITY_PATTERN = /^[a-zA-Z\u00C0-\u024F\s'\-,.]+$/;

class WeatherService {
  constructor(apiKey) {
    const key = apiKey || process.env.WEATHER_API_KEY;
    if (!key) {
      throw new Error('WEATHER_API_KEY is required. Set it via the WEATHER_API_KEY environment variable.');
    }
    this.apiKey = key;
    this.baseUrl = 'https://api.weather.example.com/v1';
    this.cache = new Map();
    this.cacheTimeout = 300000; // 5 minutes
  }

  _validateCity(city) {
    if (!city || typeof city !== 'string') throw new Error('City is required');
    if (city.length > MAX_CITY_LENGTH) throw new Error('City name too long');
    if (!CITY_PATTERN.test(city)) throw new Error('City name contains invalid characters');
  }

  async getCurrent(city) {
    this._validateCity(city);
    const cacheKey = `current:${city}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    // Simulated weather data (replace with real API call)
    const data = {
      city,
      temp: Math.round(60 + Math.random() * 30),
      condition: this.getRandomCondition(),
      humidity: Math.round(40 + Math.random() * 40),
      windSpeed: Math.round(5 + Math.random() * 20),
      feelsLike: Math.round(55 + Math.random() * 30),
      updatedAt: new Date().toISOString()
    };

    this.setCache(cacheKey, data);
    return data;
  }

  async getForecast(city, days = 7) {
    this._validateCity(city);
    const cacheKey = `forecast:${city}:${days}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const forecast = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      forecast.push({
        date: date.toISOString().split('T')[0],
        tempHigh: Math.round(65 + Math.random() * 20),
        tempLow: Math.round(45 + Math.random() * 15),
        condition: this.getRandomCondition(),
        precipitation: Math.round(Math.random() * 100)
      });
    }

    this.setCache(cacheKey, forecast);
    return forecast;
  }

  getRandomCondition() {
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = { WeatherService };