// Weather App Utilities

function celsiusToFahrenheit(celsius) {
  return (celsius * 9/5) + 32;
}

function fahrenheitToCelsius(fahrenheit) {
  return (fahrenheit - 32) * 5/9;
}

function formatTemperature(temp, unit = 'F') {
  return `${Math.round(temp)}°${unit}`;
}

module.exports = { celsiusToFahrenheit, fahrenheitToCelsius, formatTemperature };
