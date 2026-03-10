# Weather App

A CLI weather application that provides current weather conditions and forecasts for cities worldwide.

## Features

- **Current Weather**: Get real-time weather data for any city
- **7-Day Forecast**: View weather predictions for the week
- **Interactive Mode**: Conversation-style weather queries
- **Multiple Units**: Temperature in Fahrenheit or Celsius
- **JSON Output**: Machine-readable format for integration

## Installation

```bash
# Clone the repository
git clone https://github.com/nbossn/weather-app-test.git
cd weather-app-test

# Install dependencies
npm install
```

## Usage

### CLI Commands

```bash
# Get current weather
npm start -- current "New York"

# Get forecast (default 7 days)
npm start -- forecast "New York"

# Get 3-day forecast
npm start -- forecast "New York" 3
```

### Interactive Mode

```bash
npm start
```

## Project Structure

```
weather-app/
├── src/
│   ├── index.js           # Main entry point
│   ├── cli.js             # CLI handler
│   └── services/
│       ├── weatherService.js  # Weather API integration
│       └── displayService.js  # Output formatting
├── tests/
│   └── weatherService.test.js
├── package.json
└── README.md
```

## Configuration

Set environment variables:

```bash
export WEATHER_API_KEY=your-api-key
```

## Testing

```bash
npm test
```

## License

MIT

---

🤖 Generated with [claude-flow](https://github.com/ruvnet/claude-flow)