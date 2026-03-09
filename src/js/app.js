// ====================================
// KOSKO Weather - App Entry Point
// ====================================

// Import styles
import "../css/style.css";
import WeatherClient from "./WeatherClient.js";

const API_KEY = "FYK72UUCBXUGU782A7SBZ7CGK";
const weather = new WeatherClient(API_KEY);

// DOM elements
const locationTitle = document.getElementById("location-title");
const currentTemp = document.getElementById("current-temp");
const currentCondition = document.getElementById("current-condition");
const highLow = document.getElementById("high-low");
const alertSection = document.getElementById("alert-section");
const hourlyScroll = document.getElementById("hourly-scroll");
const dailyList = document.getElementById("daily-list");
const weatherBackground = document.querySelector(".weather-background");

// Get day name
function getDayName(dateStr) {
  const date = new Date(dateStr);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

// Get weather icon
function getWeatherIcon(iconCode) {
  const iconMap = {
    "clear-day": "ri-sun-line",
    "clear-night": "ri-moon-line",
    "partly-cloudy-day": "ri-sun-cloudy-line",
    "partly-cloudy-night": "ri-moon-cloudy-line",
    cloudy: "ri-cloud-line",
    overcast: "ri-cloudy-line",
    rain: "ri-rainy-line",
    drizzle: "ri-drizzle-line",
    snow: "ri-snowy-line",
    sleet: "ri-showers-line",
    wind: "ri-windy-line",
    fog: "ri-foggy-line",
    thunderstorm: "ri-thunderstorms-line",
  };
  return iconMap[iconCode] || "ri-cloud-line";
}

// Apply theme to background
function applyTheme(theme) {
  document.body.classList.remove("theme-light", "theme-dim", "theme-dark");
  document.body.classList.add(theme);

  if (theme === "theme-dark") {
    weatherBackground.style.background = "linear-gradient(180deg, #0a0a1a 0%, #000 100%)";
  } else if (theme === "theme-dim") {
    weatherBackground.style.background = "linear-gradient(180deg, #2a3a4a 0%, #1a2a3a 100%)";
  } else {
    weatherBackground.style.background = "linear-gradient(180deg, #4a6b8a 0%, #2a4a6a 100%)";
  }
}

// Display weather data
function displayWeather(data) {
  if (!data) return;

  // Apply theme (KEEP AS IS - perfect)
  const icon = data.current.icon;
  const conditions = data.current.conditions.toLowerCase();
  const uv = data.current.uvIndex;
  if (icon.includes("night")) applyTheme("theme-dark");
  else if (conditions.includes("clear") || icon.includes("clear") || uv > 5) applyTheme("theme-light");
  else applyTheme("theme-dim");

  // Location (KEEP AS IS)
  const locationParts = data.location.name.split(",");
  locationTitle.textContent = locationParts[0] || data.location.name;

  // Current weather (FIXED high/low)
  currentTemp.textContent = `${Math.round(data.current.temp)}°`;
  currentCondition.textContent = data.current.conditions;
  const todayHigh = Math.round(data.forecast[0].maxTemp);  // TODAY
  const todayLow = Math.round(data.forecast[0].minTemp);
  highLow.textContent = `H:${todayHigh}° L:${todayLow}°`;

  // Hourly (iPhone-style 4 items)
  const hourlyItems = [
  { label: 'Now', temp: Math.round(data.current.temp), icon: data.current.icon },
  { label: 'Evening', temp: Math.round(data.forecast[0].minTemp + 8), icon: data.forecast[0].icon }, // 36+8=44°
  { label: 'Tomorrow', temp: Math.round(data.forecast[1].maxTemp), icon: data.forecast[1].icon },
  { label: getDayName(data.forecast[2]?.date), temp: Math.round(data.forecast[2]?.maxTemp), icon: data.forecast[2]?.icon }
];


  hourlyScroll.innerHTML = hourlyItems.map(item => `
    <div class="hourly-item">
      <span class="hourly-time">${item.label}</span>
      <i class="hourly-icon ${getWeatherIcon(item.icon)}"></i>
      <span class="hourly-temp">${item.temp}°</span>
    </div>
  `).join('');

  // Daily (KEEP AS IS - works)
  dailyList.innerHTML = data.forecast.slice(0, 5).map((day, index) => {
  const dayName = index === 0 ? 'Today' : getDayName(day.date);
  const iconClass = getWeatherIcon(day.icon);
  const precipProb = (day.precipProb > 15 && day.icon && day.icon.includes('rain')) ? `${Math.round(day.precipProb)}%` : "";
  const tempRange = ((day.maxTemp - day.minTemp) / day.maxTemp) * 100;  // ← NEW LINE
  
  return `
  <div class="daily-item">
    <span class="daily-day">${dayName}</span>
    <i class="daily-icon-small ${iconClass}"></i>
    <span class="daily-precip">${precipProb}</span>
    <div class="daily-temp-range">
      <span class="daily-low">${Math.round(day.minTemp)}°</span>
      <div class="daily-temp-bar" style="--temp-range: ${tempRange}%">
        <div class="daily-temp-fill"></div>
      </div>
      <span class="daily-high">${Math.round(day.maxTemp)}°</span>
    </div>
  </div>
`;

}).join('');  // ← Don't forget .join('')

}


// Load weather
async function loadWeather(location) {
  currentTemp.textContent = "--°";
  currentCondition.textContent = "Loading...";
  highLow.textContent = "H:--° L:--°";
  hourlyScroll.innerHTML = '<div class="loading">Loading...</div>';
  dailyList.innerHTML = '<div class="loading">Loading...</div>';

  try {
    const data = await weather.getWeather(location);
    displayWeather(data);
  } catch (error) {
    currentCondition.textContent = "Error loading weather";
    console.error(error);
  }
}

// Search functionality
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

searchButton.addEventListener("click", () => {
  const location = searchInput.value.trim();
  if (location) {
    loadWeather(location);
  }
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const location = searchInput.value.trim();
    if (location) {
      loadWeather(location);
    }
  }
});

// Start
loadWeather("Ridgewood, Queens");