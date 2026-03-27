// Test script using DisplayService with unit='F'
const { DisplayService } = require('../src/services/displayService');

const mockData = {
  city: 'New York',
  temp: 72,
  condition: 'Sunny',
  humidity: 65,
  windSpeed: 10,
  feelsLike: 70
};

const displayF = new DisplayService({ unit: 'F' });
console.log('=== Test with unit=F ===');
console.log(displayF.formatCurrent(mockData));