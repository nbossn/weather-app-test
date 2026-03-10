// Display Service - Formats weather data for display

class DisplayService {
  constructor(options = {}) {
    this.unit = options.unit || 'F'; // F or C
    this.format = options.format || 'text'; // text or json
  }

  formatCurrent(data) {
    if (this.format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    const temp = this.unit === 'C' ? this.fahrenheitToCelsius(data.temp) : data.temp;
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
║  Feels Like: ${data.feelsLike}${unitLabel}                  ║
╚══════════════════════════════════════╝
    `.trim();
  }

  formatForecast(forecast) {
    if (this.format === 'json') {
      return JSON.stringify(forecast, null, 2);
    }

    let output = '\n╔════════════════════════════════════════════╗\n';
    output += '║           7-DAY FORECAST                 ║\n';
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