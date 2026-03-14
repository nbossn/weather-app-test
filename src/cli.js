// CLI - Command Line Interface Handler

const readline = require('readline');

class CLI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }

  close() {
    this.rl.close();
  }

  async interactive(city) {
    console.log('Interactive Weather Mode');
    console.log('========================\n');

    const cityName = city || await this.prompt('Enter city name: ');

    const { WeatherApp } = require('./index');
    const app = new WeatherApp();

    console.log('\nFetching current weather...\n');
    console.log(await app.getCurrentWeather(cityName));

    console.log('\n');
    const forecast = await this.prompt('View forecast? (y/n): ');

    if (forecast.toLowerCase() === 'y') {
      console.log(await app.getForecast(cityName));
    }

    this.close();
  }
}

module.exports = { CLI };