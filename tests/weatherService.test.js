// Weather Service Tests
const { WeatherService } = require('../src/services/weatherService');

describe('WeatherService', () => {
  let service;

  beforeEach(() => {
    service = new WeatherService('test-api-key');
  });

  test('should return current weather data', async () => {
    const data = await service.getCurrent('New York');
    expect(data).toHaveProperty('city');
    expect(data).toHaveProperty('temp');
    expect(data).toHaveProperty('condition');
  });

  test('should return forecast data', async () => {
    const data = await service.getForecast('New York', 5);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(5);
  });

  test('should cache results', async () => {
    const data1 = await service.getCurrent('Boston');
    const data2 = await service.getCurrent('Boston');
    expect(data1).toEqual(data2);
  });

  test('should clear cache', async () => {
    await service.getCurrent('Chicago');
    service.clearCache();
    // Cache should be empty
    expect(service.cache.size).toBe(0);
  });
});