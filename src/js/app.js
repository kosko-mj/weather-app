// ====================================
// KOSKO Weather - App Entry Point
// ====================================

// Import styles
import '../css/style.css';
import WeatherClient from './WeatherClient.js';

const API_KEY = 'FYK72UUCBXUGU782A7SBZ7CGK';
const weather = new WeatherClient(API_KEY);

// DOM elements
const currentWeatherDisplay = document.querySelector('.current-weather-display');
const forecastDisplay = document.querySelector('.forecast-display');
const searchInput = document.querySelector('.search-input');
const searchButton = document.querySelector('.search-button');
const timeDisplay = document.querySelector('.time-display');

// Update the time
function updateTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  timeDisplay.textContent = `${hours}:${minutes}`;
}

// Determine theme based on weather conditions
function getThemeFromWeather(data) {
    if (!data) return 'theme-light';

    const icon = data.current.icon;
    const conditions = data.current.conditions.toLowerCase();
    const uv = data.current.uvIndex;

    // If the icon says it's night, use dark theme
    if (icon.includes('night')) {
        return 'theme-dark';
    }

    // It's daytime, check conditions
    // Bright sun = light theme
    if (conditions.includes('clear') ||
        icon.includes('clear') ||
        uv > 5) {
        return 'theme-light';
    }

    // Heavy clouds/rain/fog = dim theme
    if (conditions.includes('overcast') ||
        conditions.includes('rain') ||
        conditions.includes('fog') ||
        conditions.includes('drizzle') ||
        icon.includes('cloudy') ||
        icon.includes('rain')) {
        return 'theme-dim';
    }

    // Default to light
    return 'theme-light';
}

//Apply theme to body
function applyTheme(theme) {
    //remove existing theme classes
    document.body.classList.remove('theme-light', 'theme-dim', 'theme-dark');
    // Add new theme
    document.body.classList.add(theme);
}

// Display weather data
function displayWeather(data) {
  if (!data) return;
  
  // Apply theme based on weather conditions
  const theme = getThemeFromWeather(data);
  applyTheme(theme);

  // Current weather
  currentWeatherDisplay.innerHTML = `
    <div class="current-weather">
      <div class="temp-large">${Math.round(data.current.temp)}°</div>
      <div class="conditions">${data.current.conditions}</div>
      <div class="feels-like">feels like ${Math.round(data.current.feelsLike)}°</div>
      
      <div class="details-grid">
        <div class="detail">
          <span class="detail-label">wind</span>
          <span class="detail-value">${Math.round(data.current.windSpeed)} mph</span>
        </div>
        <div class="detail">
          <span class="detail-label">humidity</span>
          <span class="detail-value">${Math.round(data.current.humidity)}%</span>
        </div>
        <div class="detail">
          <span class="detail-label">uv</span>
          <span class="detail-value">${data.current.uvIndex}</span>
        </div>
      </div>
    </div>
  `;
  
  // Format forecast
  const forecastHTML = data.forecast.slice(0, 5).map(day => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    return `
      <div class="forecast-day">
        <div class="forecast-day-name">${dayName}</div>
        <div class="forecast-temp">${Math.round(day.maxTemp)}°/${Math.round(day.minTemp)}°</div>
        <div class="forecast-conditions">${day.conditions.split(',')[0]}</div>
      </div>
    `;
  }).join('');
  
  forecastDisplay.innerHTML = `
    <div class="forecast-section">
      <div class="forecast-grid">
        ${forecastHTML}
      </div>
    </div>
  `;
}

async function loadWeather(location) {
  currentWeatherDisplay.innerHTML = '<div class="loading">loading...</div>';
  forecastDisplay.innerHTML = '';
  
  try {
    const data = await weather.getWeather(location);
    displayWeather(data);
    updateTime();
  } catch (error) {
    currentWeatherDisplay.innerHTML = `<div class="error">${error.message}</div>`;
  }
}

// Event listeners
searchButton.addEventListener('click', () => {
  const location = searchInput.value.trim();
  if (location) {
    loadWeather(location);
  }
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const location = searchInput.value.trim();
    if (location) {
      loadWeather(location);
    }
  }
});

// Initial load
updateTime();
loadWeather('Ridgewood, Queens');