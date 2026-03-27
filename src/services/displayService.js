// Display Service - Formats weather data for display

class DisplayService {
  constructor(options = {}) {
    this.unit = options.unit || 'F'; // F or C
    this.format = options.format || 'text'; // text or json
  }

  formatCurrent(data) {
    if (this.format === 'json') {
      // Convert temperatures for JSON output when using Celsius
      if (this.unit === 'C') {
        const converted = {
          ...data,
          temp: this.fahrenheitToCelsius(data.temp),
          feelsLike: this.fahrenheitToCelsius(data.feelsLike),
          unit: 'C'
        };
        return JSON.stringify(converted, null, 2);
      }
      return JSON.stringify(data, null, 2);
    }

    const temp = this.unit === 'C' ? this.fahrenheitToCelsius(data.temp) : data.temp;
    const feelsLike = this.unit === 'C' ? this.fahrenheitToCelsius(data.feelsLike) : data.feelsLike;
    const unitLabel = '°' + this.unit;

    return `
╔══════════════════════════════════════╗
║         CURRENT WEATHER              ║
╠══════════════════════════════════════╣
║  ${data.city.toUpperCase().padEnd(30)}║
║  ${temp}${unitLabel} - ${data.condition.padEnd(20)}║
║                                      ║
║  Humidity: ${data.humidity}%                     ║
║  Wind: ${data.windSpeed} mph                    ║
║  Feels Like: ${feelsLike}${unitLabel}                  ║
╚══════════════════════════════════════╝
    `.trim();
  }

  formatForecast(forecast, days = 7) {
    if (this.format === 'json') {
      // Convert temperatures for JSON output when using Celsius
      if (this.unit === 'C') {
        const converted = forecast.map(day => ({
          ...day,
          tempHigh: this.fahrenheitToCelsius(day.tempHigh),
          tempLow: this.fahrenheitToCelsius(day.tempLow),
          unit: 'C'
        }));
        return JSON.stringify(converted, null, 2);
      }
      return JSON.stringify(forecast, null, 2);
    }

    let output = '\n╔════════════════════════════════════════════╗\n';
    output += `║           ${days}-DAY FORECAST`.padEnd(38) + '╗\n';
    output += '╠════════════════════════════════════════════╣\n';

    for (const day of forecast) {
      const high = this.unit === 'C' ? this.fahrenheitToCelsius(day.tempHigh) : day.tempHigh;
      const low = this.unit === 'C' ? this.fahrenheitToCelsius(day.tempLow) : day.tempLow;
      const unitLabel = '°' + this.unit;

      output += `║ ${day.date}  ${high}${unitLabel}/${low}${unitLabel}  ${day.condition.padEnd(12)} ║\n`;
    }

    output += '╚════════════════════════════════════════════╝';
    return output;
  }

  fahrenheitToCelsius(f) {
    return Math.round((f - 32) * 5 / 9);
  }
}

module.exports = { DisplayService };