# Weather App

A CLI weather application that provides current weather conditions and forecasts for cities worldwide.

## Features

- **Current Weather**: Get real-time weather data for any city
- **Configurable Forecast**: View weather predictions for 1–14 days (default 7)
- **Interactive Mode**: Conversation-style weather queries
- **Multiple Units**: Temperature in Fahrenheit or Celsius (text and JSON output)
- **JSON Output**: Machine-readable format for integration
- **Input Validation**: City names and forecast range validated at the boundary
- **GitHub Automation**: Workflow trigger for automated PR creation and code review

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
│   ├── index.js               # Main entry point & WeatherApp class
│   ├── cli.js                 # Interactive CLI handler
│   └── services/
│       ├── weatherService.js  # Weather API integration with caching
│       └── displayService.js  # Output formatting (text & JSON, F/C)
├── .claude/
│   └── helpers/
│       └── workflow-trigger.js  # GitHub automation helper
├── tests/
│   ├── weatherService.test.js
│   ├── test-unit-c.js         # DisplayService unit tests (Celsius)
│   └── test-unit-f.js         # DisplayService unit tests (Fahrenheit)
├── test-json-output.js        # Integration tests for JSON output
├── package.json
└── README.md
```

## Configuration

Set environment variables:

```bash
export WEATHER_API_KEY=your-api-key
```

> `WEATHER_API_KEY` is required. The app will throw at startup if it is not set.

## GitHub Automation

`.claude/helpers/workflow-trigger.js` is an optional automation helper that integrates with the GitHub CLI to auto-create PRs and trigger code review agents on push.

```bash
# Trigger manually
node .claude/helpers/workflow-trigger.js --event push --branch feature/my-branch --commit abc1234
```

Configure behaviour in `.claude/settings.json` under the `github-automation` key:

| Key | Default | Description |
|-----|---------|-------------|
| `enabled` | `true` | Enable/disable automation |
| `autoPr` | `true` | Auto-create PRs on feature branch push |
| `autoReview` | `true` | Spawn code review agent on PRs |
| `autoDocs` | `true` | Generate docs on `docs:` commits |
| `branchPatterns` | `["feature/*","fix/*",...]` | Branch patterns that trigger automation |
| `autoPrLabels` | `["automated","claude-flow"]` | Labels added to auto-created PRs |

Requires the [GitHub CLI](https://cli.github.com/) (`gh auth login`).

## Testing

```bash
npm test
```

## License

MIT

---

🤖 Generated with [claude-flow](https://github.com/ruvnet/claude-flow)