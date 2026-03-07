// ====================================
// WEATHER CLIENT CLASS
// ====================================
import {
  WeatherAPIError,
  InvalidKeyError,
  LocationNotFoundError,
  NetworkError,
  RateLimitError
} from './utils/errorHandler.js';

class WeatherClient {
  constructor(apiKey) {
    if (!apiKey) {
      throw new InvalidKeyError('API key is required');
    }
    this.apiKey = apiKey;
    this.baseUrl = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';
  }

  // ====================================
  // PRIVATE HELPER: Make API request with error handling
  // ====================================
  async _makeRequest(url) {
    try {
      const response = await fetch(url);
      
      // Handle HTTP errors
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `HTTP Error ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If we can't parse JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        // Map status codes to specific errors
        switch (response.status) {
          case 400:
          case 401:
            throw new InvalidKeyError();
          case 404:
            throw new LocationNotFoundError('the requested location');
          case 429:
            throw new RateLimitError();
          default:
            throw new WeatherAPIError(errorMessage, `HTTP_${response.status}`);
        }
      }
      
      // Parse successful response
      const data = await response.json();
      return data;
      
    } catch (error) {
      // If it's already one of our custom errors, rethrow it
      if (error instanceof WeatherAPIError) {
        throw error;
      }
      
      // Handle network errors (failed to connect)
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        throw new NetworkError();
      }
      
      // Wrap any other errors
      throw new WeatherAPIError(error.message, 'UNKNOWN_ERROR');
    }
  }

  // ====================================
  // PRIVATE FORMATTING METHOD
  // ====================================
  _formatWeatherData(rawData) {
    // Safety check - if no data, return null
    if (!rawData) return null;
    
    // Extract current conditions (with fallback if missing)
    const current = rawData.currentConditions || {};
    
    // Extract location info
    const location = {
      name: rawData.resolvedAddress || 'Unknown',
      timezone: rawData.timezone || 'Unknown',
      lat: rawData.latitude || 0,
      lon: rawData.longitude || 0
    };
    
    // Format current weather
    const currentWeather = {
      temp: current.temp || 0,
      feelsLike: current.feelslike || 0,
      conditions: current.conditions || 'Unknown',
      icon: current.icon || 'unknown',
      humidity: current.humidity || 0,
      windSpeed: current.windspeed || 0,
      windDir: current.winddir || 0,
      uvIndex: current.uvindex || 0,
      // Format sunrise/sunset times (remove seconds)
      sunrise: current.sunrise ? current.sunrise.slice(0, 5) : '00:00',
      sunset: current.sunset ? current.sunset.slice(0, 5) : '00:00'
    };
    
    // Format forecast (next 7 days)
    const forecast = [];
    if (rawData.days && rawData.days.length > 0) {
      // Skip day 0 (today) since we already have current conditions
      // Take next 7 days
      const forecastDays = rawData.days.slice(1, 8);
      
      forecastDays.forEach(day => {
        forecast.push({
          date: day.datetime || 'Unknown',
          maxTemp: day.tempmax || 0,
          minTemp: day.tempmin || 0,
          conditions: day.conditions || 'Unknown',
          icon: day.icon || 'unknown',
          precipProb: day.precipprob || 0
        });
      });
    }
    
    // Return the complete formatted object
    return {
      location,
      current: currentWeather,
      forecast,
      // Include units info (will be enhanced later)
      units: {
        temperature: 'fahrenheit',
        windSpeed: 'mph',
        precipitation: 'inches'
      }
    };
  }

  // ====================================
  // PUBLIC METHODS
  // ====================================

  // Get weather data for a location
  async getWeather(location) {
    if (!location || location.trim() === '') {
      throw new WeatherAPIError('Location is required', 'NO_LOCATION');
    }
    
    const url = `${this.baseUrl}${encodeURIComponent(location)}?key=${this.apiKey}`;
    const rawData = await this._makeRequest(url);
    return this._formatWeatherData(rawData);
  }

  // Test connection (kept for backward compatibility)
  async testConnection(location = 'London') {
    try {
      const data = await this.getWeather(location);
      console.log('Connection successful!');
      console.log('Formatted data:', data);
      return data;
    } catch (error) {
      console.error('Connection failed:', error.message);
      throw error;
    }
  }
}

export default WeatherClient;