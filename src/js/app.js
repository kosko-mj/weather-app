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
let isCelsius = false;

// Unit Conversion
function fahrenheitToCelsius(f) {
  return Math.round(((f - 32) * 5) / 9);
}

function celsiusToFahrenheit(c) {
  return Math.round((c * 9) / 5 + 32);
}

// Get day name
function getDayName(dateStr) {
  const date = new Date(dateStr);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const adjustedIndex = (date.getDay() + 1) % 7;
  return days[adjustedIndex];
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

// Apply theme to background based on weather
function applyTheme(icon, temp) {
  // Remove old theme classes (keep for any other styling)
  document.body.classList.remove("theme-light", "theme-dim", "theme-dark");

  let gradient;

  if (icon.includes("clear")) {
    document.body.classList.add("theme-light");
    gradient =
      temp > 75
        ? "radial-gradient(ellipse 80% 50% at 20% -20%, #ff9a56 0%, #ff6b6b 25%, #74b9ff 50%, #0984e3 100%)"
        : "linear-gradient(135deg, #74b9ff 0%, #a8e6cf 25%, #98d8e8 75%, #ffffff 100%)";
  } else if (icon.includes("cloud") || icon.includes("overcast")) {
    document.body.classList.add("theme-dim");
    gradient =
      "linear-gradient(145deg, #bdc3c7 0%, #95a5a6 30%, #7f8c8d 70%, #2c3e50 100%)";
  } else if (icon.includes("rain") || icon.includes("drizzle")) {
    document.body.classList.add("theme-dim");
    gradient =
      "linear-gradient(135deg, #2c3e50 0%, #3498db 40%, #1e3c72 80%, #0f2027 100%)";
  } else if (icon.includes("snow") || icon.includes("sleet")) {
    document.body.classList.add("theme-dim");
    gradient =
      "linear-gradient(135deg, #e6f3ff 0%, #b8e6ff 40%, #a1d6ff 70%, #74b9ff 100%)";
  } else if (icon.includes("night")) {
    document.body.classList.add("theme-dark");
    gradient =
      "radial-gradient(ellipse 60% 40% at 30% 20%, #1a1a2e 0%, #16213e 40%, #0f0f23 70%, #000 100%)";
  } else {
    document.body.classList.add("theme-dim");
    gradient = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  }

  // Apply gradient with smooth transition
  weatherBackground.style.background = gradient;
  weatherBackground.style.transition =
    "background 1.5s cubic-bezier(0.4, 0, 0.2, 1)";
}

// Update date and time
function updateDateTime() {
  const now = new Date();

  // Minimal date: MM.DD
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${month}.${day}`;

  // Minimal time: HH:MM (24-hour format feels more future-tech)
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const timeStr = `${hours}:${minutes}`;

  document.getElementById("header-date").textContent = dateStr;
  document.getElementById("header-time").textContent = timeStr;
}

// Update every minute
setInterval(updateDateTime, 60000);

// Display weather data
function displayWeather(data) {
  if (!data) return;

  // Apply theme based on weather
  const icon = data.current.icon;
  const temp = data.current.temp;
  applyTheme(icon, temp);

  // Location (KEEP AS IS)
  const locationParts = data.location.name.split(",");
  locationTitle.textContent = locationParts[0] || data.location.name;

  // Current weather (FIXED high/low)
  const displayTemp = isCelsius
    ? fahrenheitToCelsius(data.current.temp)
    : Math.round(data.current.temp);
  currentTemp.textContent = `${displayTemp}°`;
  currentCondition.textContent = data.current.conditions;
  const todayHigh = isCelsius
    ? fahrenheitToCelsius(data.forecast[0].maxTemp)
    : Math.round(data.forecast[0].maxTemp);
  const todayLow = isCelsius
    ? fahrenheitToCelsius(data.forecast[0].minTemp)
    : Math.round(data.forecast[0].minTemp);
  highLow.textContent = `H:${todayHigh}° L:${todayLow}°`;

  // Hourly (iPhone-style 4 items)
  const hourlyItems = [
    {
      label: "Now",
      temp: isCelsius
        ? fahrenheitToCelsius(data.current.temp)
        : Math.round(data.current.temp),
      icon: data.current.icon,
    },
    {
      label: "Evening",
      temp: isCelsius
        ? fahrenheitToCelsius(data.forecast[0].minTemp + 8)
        : Math.round(data.forecast[0].minTemp + 8),
      icon: data.forecast[0].icon,
    },
    {
      label: "Tomorrow",
      temp: isCelsius
        ? fahrenheitToCelsius(data.forecast[1].maxTemp)
        : Math.round(data.forecast[1].maxTemp),
      icon: data.forecast[1].icon,
    },
    {
      label: getDayName(data.forecast[2]?.date),
      temp: isCelsius
        ? fahrenheitToCelsius(data.forecast[2]?.maxTemp)
        : Math.round(data.forecast[2]?.maxTemp),
      icon: data.forecast[2]?.icon,
    },
  ];

  hourlyScroll.innerHTML = hourlyItems
    .map(
      (item) => `
    <div class="hourly-item">
      <span class="hourly-time">${item.label}</span>
      <i class="hourly-icon ${getWeatherIcon(item.icon)}"></i>
      <span class="hourly-temp">${item.temp}°</span>
    </div>
  `,
    )
    .join("");

  console.log(
    "Forecast data:",
    data.forecast.map((day) => ({
      date: day.date,
      dayName: getDayName(day.date),
    })),
  );

  // Daily (KEEP AS IS - works)
  dailyList.innerHTML = data.forecast
    .slice(0, 5)
    .map((day, index) => {
      const dayName = index === 0 ? "Today" : getDayName(day.date);
      const iconClass = getWeatherIcon(day.icon);
      const precipProb =
        day.precipProb > 15 && day.icon && day.icon.includes("rain")
          ? `${Math.round(day.precipProb)}%`
          : "";
      const tempRange = ((day.maxTemp - day.minTemp) / day.maxTemp) * 100; // ← NEW LINE

      return `
  <div class="daily-item">
    <span class="daily-day">${dayName}</span>
    <i class="daily-icon-small ${iconClass}"></i>
    <span class="daily-precip">${precipProb}</span>
    <div class="daily-temp-range">
     <span class="daily-low">${
       isCelsius ? fahrenheitToCelsius(day.minTemp) : Math.round(day.minTemp)
     }°</span>
      <div class="daily-temp-bar" style="--temp-range: ${tempRange}%">
        <div class="daily-temp-fill"></div>
      </div>
     <span class="daily-high">${
       isCelsius ? fahrenheitToCelsius(day.maxTemp) : Math.round(day.maxTemp)
     }°</span>
    </div>
  </div>
`;
    })
    .join(""); // ← Don't forget .join('')
}

// Load weather
async function loadWeather(location) {
  currentTemp.textContent = "--°";
  currentCondition.textContent = "Loading...";
  highLow.textContent = "H:--° L:--°";
  hourlyScroll.innerHTML = '<div class="loading">Loading...</div>';
  dailyList.innerHTML = '<div class="loading">Loading...</div>';

  updateDateTime(); // Show current date/time

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

// Toggle units by clicking current temp
currentTemp.addEventListener("click", () => {
  isCelsius = !isCelsius;

  // Reload current data with new unit preference
  const currentLocation = searchInput.value.trim() || "Ridgewood, Queens";
  loadWeather(currentLocation);
});

// Set cursor style
currentTemp.style.cursor = "pointer";

// Start
loadWeather("Ridgewood, Queens");
