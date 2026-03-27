// Weather App - Main Entry Point
const { WeatherService } = require('./services/weatherService');
const { DisplayService } = require('./services/displayService');
const { CLI } = require('./cli');

class WeatherApp {
  constructor(options = {}) {
    this.options = options;
    this.weatherService = new WeatherService(options.apiKey);
    this.displayService = new DisplayService({
      unit: options.unit || 'F',
      format: options.format || 'text'
    });
    this.cli = new CLI();
  }

  async getCurrentWeather(city) {
    const data = await this.weatherService.getCurrent(city);
    return this.displayService.formatCurrent(data);
  }

  async getForecast(city, days = 7) {
    const data = await this.weatherService.getForecast(city, days);
    return this.displayService.formatForecast(data, days);
  }

  parseArgs(args) {
    const options = { unit: 'F', format: 'text' };
    const remainingArgs = [];

    for (let i = 2; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--json' || arg === '-j') {
        options.format = 'json';
      } else if (arg === '--unit' || arg === '-u') {
        if (args[i + 1] && (args[i + 1].toUpperCase() === 'C' || args[i + 1].toUpperCase() === 'F')) {
          options.unit = args[i + 1].toUpperCase();
          i++;
        }
      } else if (!arg.startsWith('-')) {
        remainingArgs.push(arg);
      }
    }

    return { options, remainingArgs };
  }

  async run(args) {
    // Parse global options first
    const { options, remainingArgs } = this.parseArgs(args);

    // Create app with parsed options
    const app = new WeatherApp({ ...this.options, ...options });

    const command = remainingArgs[0] || 'help';
    const city = remainingArgs[1];
    const extraParam = remainingArgs[2];

    switch (command) {
      case 'current':
        if (!city) {
          console.error('Please specify a city');
          process.exit(1);
        }
        console.log(await app.getCurrentWeather(city));
        break;
      case 'forecast':
        if (!city) {
          console.error('Please specify a city');
          process.exit(1);
        }
        const days = parseInt(extraParam) || 7;
        console.log(await app.getForecast(city, days));
        break;
      case 'interactive':
        const cityName = extraParam || await app.cli.prompt('Enter city name: ');
        console.log('\nFetching current weather...\n');
        console.log(await app.getCurrentWeather(cityName));
        console.log('\n');
        const forecast = await app.cli.prompt('View forecast? (y/n): ');
        if (forecast.toLowerCase() === 'y') {
          console.log(await app.getForecast(cityName));
        }
        app.cli.close();
        break;
      case 'help':
      default:
        // Interactive mode when no command
        if (!command || command === 'help') {
          console.log(`
Weather App CLI

Usage:
  weather current <city> [--json] [--unit F|C]     Get current weather
  weather forecast <city> [days] [--json] [--unit F|C]  Get forecast (default 7 days)
  weather interactive [city]               Interactive mode
  weather help                             Show this help

Options:
  -j, --json     Output in JSON format
  -u, --unit    Temperature unit (F or C, default: F)
`.trim());
        }
    }
  }
}

module.exports = { WeatherApp };

// Auto-execute when run directly
if (require.main === module) {
  const app = new WeatherApp();
  app.run(process.argv).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}