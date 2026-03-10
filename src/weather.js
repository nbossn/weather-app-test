// Weather API Module

const API_BASE = 'https://api.weather.example.com';

async function fetchWeather(city) {
  const response = await fetch(`${API_BASE}/weather?q=${city}`);
  return response.json();
}

async function getForecast(city, days = 7) {
  const response = await fetch(`${API_BASE}/forecast?q=${city}&days=${days}`);
  return response.json();
}

module.exports = { fetchWeather, getForecast };
