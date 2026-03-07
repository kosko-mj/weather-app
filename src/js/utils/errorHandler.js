// ====================================
// CUSTOM ERROR TYPES
// ====================================
// These help us distinguish between different types of failures

// Base error for all weather API errors
export class WeatherAPIError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'WeatherAPIError';
    this.code = code; // e.g., 'INVALID_KEY', 'LOCATION_NOT_FOUND', 'NETWORK_ERROR'
  }
}

// Specific error types (optional but helpful)
export class InvalidKeyError extends WeatherAPIError {
  constructor(message = 'Invalid API key. Please check your key and try again.') {
    super(message, 'INVALID_KEY');
    this.name = 'InvalidKeyError';
  }
}

export class LocationNotFoundError extends WeatherAPIError {
  constructor(location) {
    super(`Location "${location}" not found. Please check the spelling and try again.`, 'LOCATION_NOT_FOUND');
    this.name = 'LocationNotFoundError';
  }
}

export class NetworkError extends WeatherAPIError {
  constructor(message = 'Network error. Please check your internet connection.') {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class RateLimitError extends WeatherAPIError {
  constructor(message = 'API rate limit exceeded. Please try again later.') {
    super(message, 'RATE_LIMIT');
    this.name = 'RateLimitError';
  }
}