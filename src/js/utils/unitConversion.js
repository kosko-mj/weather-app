// ====================================
// UNIT CONVERSION UTILITIES
// ====================================
// Temperature conversions
export function fahrenheitToCelsius(f) {
  return Math.round(((f - 32) * 5/9) * 10) / 10;
}

export function celsiusToFahrenheit(c) {
  return Math.round((c * 9/5 + 32) * 10) / 10;
}

// Wind speed conversions (mph <-> kph)
export function mphToKph(mph) {
  return Math.round(mph * 1.60934 * 10) / 10;
}

export function kphToMph(kph) {
  return Math.round(kph / 1.60934 * 10) / 10;
}

// Precipitation conversions (inches <-> mm)
export function inchesToMm(inches) {
  return Math.round(inches * 25.4 * 10) / 10;
}

export function mmToInches(mm) {
  return Math.round(mm / 25.4 * 10) / 10;
}

// Helper to convert entire weather object
export function convertWeatherUnits(weatherData, toSystem = 'metric') {
  if (!weatherData) return null;
  
  const converted = JSON.parse(JSON.stringify(weatherData)); // Deep clone
  
  if (toSystem === 'metric') {
    // Convert to Celsius, kph, mm
    converted.current.temp = fahrenheitToCelsius(converted.current.temp);
    converted.current.feelsLike = fahrenheitToCelsius(converted.current.feelsLike);
    converted.current.windSpeed = mphToKph(converted.current.windSpeed);
    
    converted.forecast = converted.forecast.map(day => ({
      ...day,
      maxTemp: fahrenheitToCelsius(day.maxTemp),
      minTemp: fahrenheitToCelsius(day.minTemp)
    }));
    
    converted.units = {
      temperature: 'celsius',
      windSpeed: 'kph',
      precipitation: 'mm'
    };
  }
  
  return converted;
}