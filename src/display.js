// Display Module
function displayWeather(data) {
  console.log(`Weather: ${data.temp}°F - ${data.condition}`);
}

module.exports = { displayWeather };
