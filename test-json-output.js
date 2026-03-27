// Test script to verify JSON output format

const { DisplayService } = require('./src/services/displayService');
const { WeatherService } = require('./src/services/weatherService');
const { WeatherApp } = require('./src/index');

async function testDisplayServiceDirectly() {
  console.log('=== Test 1: DisplayService with format=text ===\n');

  const textDisplay = new DisplayService({ format: 'text' });
  const sampleData = {
    city: 'Seattle',
    temp: 72,
    condition: 'Sunny',
    humidity: 65,
    windSpeed: 10,
    feelsLike: 70
  };

  const textOutput = textDisplay.formatCurrent(sampleData);
  console.log('Output:');
  console.log(textOutput);
  console.log('\nIs valid text output:', textOutput.includes('CURRENT WEATHER'));

  console.log('\n=== Test 2: DisplayService with format=json ===\n');

  const jsonDisplay = new DisplayService({ format: 'json' });
  const jsonOutput = jsonDisplay.formatCurrent(sampleData);
  console.log('Output:');
  console.log(jsonOutput);

  // Validate it's valid JSON
  let parsed;
  try {
    parsed = JSON.parse(jsonOutput);
    console.log('\nIs valid JSON: true');
    console.log('Parsed data:', parsed);
  } catch (e) {
    console.log('\nIs valid JSON: false - ERROR:', e.message);
  }
}

async function testWeatherAppWithDisplayService() {
  console.log('\n=== Test 3: WeatherApp with custom DisplayService (json) ===\n');

  // Create WeatherApp with custom display service
  const weatherApp = new WeatherApp();
  weatherApp.displayService = new DisplayService({ format: 'json' });

  const jsonResult = await weatherApp.getCurrentWeather('Portland');
  console.log('Output:');
  console.log(jsonResult);

  // Validate JSON
  try {
    const parsed = JSON.parse(jsonResult);
    console.log('\nIs valid JSON: true');
  } catch (e) {
    console.log('\nIs valid JSON: false - ERROR:', e.message);
  }

  console.log('\n=== Test 4: WeatherApp with custom DisplayService (text) ===\n');

  const textApp = new WeatherApp();
  textApp.displayService = new DisplayService({ format: 'text' });

  const textResult = await textApp.getCurrentWeather('Portland');
  console.log('Output:');
  console.log(textResult);
  console.log('\nIs text output:', textResult.includes('CURRENT WEATHER'));
}

function testCLIFlags() {
  console.log('\n=== Test 5: Check CLI argument support ===\n');

  // Simulate CLI arguments
  const testArgs = ['node', 'weather', 'current', 'Seattle', '--json'];
  console.log('Test CLI args:', testArgs);

  // Parse what the CLI currently accepts
  const command = testArgs[2];
  const city = testArgs[3];
  const extraArgs = testArgs.slice(4);

  console.log('Command:', command);
  console.log('City:', city);
  console.log('Extra args (ignored):', extraArgs);
  console.log('\nCLI --json flag support: NOT IMPLEMENTED');
}

async function runAllTests() {
  await testDisplayServiceDirectly();
  await testWeatherAppWithDisplayService();
  testCLIFlags();
}

runAllTests();