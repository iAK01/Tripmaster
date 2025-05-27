// Weather Display Component - shows the weather forecast
import { WeatherAPI } from '../utils/weather-api.js';

export class WeatherDisplay {
    constructor(options) {
        this.container = options.container;
        this.weatherAPI = new WeatherAPI();
        this.weatherData = null;
        this.renderSkeleton();
    }

    renderSkeleton() {
        this.container.innerHTML = `
            <div class="weather-section hidden" id="weatherSection">
                <h3>🌤️ Weather Forecast</h3>
                <div id="weatherCards" class="weather-cards">Loading...</div>
            </div>
        `;
    }

    async fetchWeather(location, days) {
        const weatherCards = this.container.querySelector('#weatherCards');
        weatherCards.innerHTML = 'Loading...';
        try {
            this.weatherData = await this.weatherAPI.getWeather(location, days);
            this.render(this.weatherData);
        } catch (error) {
            weatherCards.innerHTML = `<p class="error">Failed to load weather: ${error.message}</p>`;
        }
    }

    getWeatherData() {
        return this.weatherData;
    }

    displayWeather(weatherData) {
    if (weatherData && weatherData.length > 0) {
        this.weatherData = weatherData;
        this.render(weatherData);
    }
}

    render(weatherData) {
        const section = this.container.querySelector('.weather-section');
        const weatherCards = this.container.querySelector('#weatherCards');

        if (!weatherCards || !weatherData) return;

        section.classList.remove('hidden');

        weatherCards.innerHTML = weatherData.map(day => `
            <div class="weather-card">
                <div class="date">${day.date}</div>
                <div class="icon">${day.icon}</div>
                <div class="condition">${day.condition}</div>
                <div class="temp">${day.temp}°C</div>
                <div class="source">🛰️ Source: ${day.source}</div>
                <div class="range">↑ ${day.maxTemp}° | ↓ ${day.minTemp}°</div>
                <div class="details">💧 ${day.humidity}% | ☔ ${day.chanceOfRain}% | 🌬️ ${day.wind} km/h</div>
            </div>
        `).join('');
    }
}
