// Test script using DisplayService with unit='C'
const { DisplayService } = require('../src/services/displayService');

const mockData = {
  city: 'New York',
  temp: 72,
  condition: 'Sunny',
  humidity: 65,
  windSpeed: 10,
  feelsLike: 70
};

const displayC = new DisplayService({ unit: 'C' });
console.log('=== Test with unit=C ===');
console.log(displayC.formatCurrent(mockData));