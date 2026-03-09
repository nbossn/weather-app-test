// Weather App - Main Entry
console.log("Weather App Starting...");

function getWeather(city) {
  return {
    city,
    temp: 72,
    condition: "Sunny"
  };
}

module.exports = { getWeather };
