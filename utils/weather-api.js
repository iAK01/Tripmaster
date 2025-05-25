export class WeatherAPI {
    constructor() {
        this.apiKey = '90c4c9014ba54aecadd160109231806';
        this.baseUrl = 'https://api.weatherapi.com/v1/forecast.json';
    }

    async getWeather(location, days, startDate = new Date()) {
        const today = new Date();
        const start = new Date(startDate);
        const diffDays = Math.round((start - today) / (1000 * 60 * 60 * 24));

        const useWeatherAPI = diffDays <= 3;
        const weatherApiDays = useWeatherAPI ? Math.min(3 - diffDays, days) : 0;
        const openMeteoDays = days - weatherApiDays;

        let forecast = [];

        if (weatherApiDays > 0) {
            try {
                const weatherData = await this.getWeatherAPIData(location, weatherApiDays);
                forecast.push(...weatherData);
            } catch (err) {
                console.warn('WeatherAPI failed, using Open-Meteo only');
            }
        }

        if (openMeteoDays > 0) {
            const openMeteoStart = new Date(start);
            openMeteoStart.setDate(openMeteoStart.getDate() + weatherApiDays);
            const openMeteoData = await this.getOpenMeteoWeather(location, openMeteoStart, openMeteoDays);
            forecast.push(...openMeteoData);
        }

        return forecast;
    }

    async getWeatherAPIData(location, days) {
        const url = `${this.baseUrl}?key=${this.apiKey}&q=${encodeURIComponent(location)}&days=${days}&aqi=no&alerts=no`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.error) throw new Error(data.error.message);

        return data.forecast.forecastday.map(day => {
            const date = new Date(day.date);
            const condition = day.day.condition.text;
            const temp = Math.round(day.day.avgtemp_c);
            return {
                date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                condition,
                temp,
                icon: this.getWeatherIcon(condition, temp),
                humidity: day.day.avghumidity,
                chanceOfRain: day.day.daily_chance_of_rain,
                maxTemp: Math.round(day.day.maxtemp_c),
                minTemp: Math.round(day.day.mintemp_c),
                wind: day.day.maxwind_kph,
                uv: day.day.uv,
                source: 'WeatherAPI'
            };
        });
    }

    async getOpenMeteoWeather(location, startDate, days) {
        const coords = await this.geocodeLocation(location);
        if (!coords) throw new Error('Failed to geocode for Open-Meteo');

        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + days - 1);

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&start_date=${start.toISOString().split('T')[0]}&end_date=${end.toISOString().split('T')[0]}&timezone=auto`;

        const res = await fetch(url);
        const data = await res.json();

        return data.daily.time.map((date, i) => {
            const condition = this.translateWeatherCode(data.daily.weathercode[i]);
            const temp = Math.round((data.daily.temperature_2m_max[i] + data.daily.temperature_2m_min[i]) / 2);
            return {
                date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                condition,
                temp,
                icon: this.getWeatherIcon(condition, temp),
                humidity: null,
                chanceOfRain: Math.min(data.daily.precipitation_sum[i] * 10, 100),
                maxTemp: Math.round(data.daily.temperature_2m_max[i]),
                minTemp: Math.round(data.daily.temperature_2m_min[i]),
                wind: null,
                uv: null,
                source: 'Open-Meteo'
            };
        });
    }

    async geocodeLocation(location) {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
        const res = await fetch(url);
        const data = await res.json();
        if (!data.results || data.results.length === 0) return null;
        return {
            lat: data.results[0].latitude,
            lon: data.results[0].longitude
        };
    }

    translateWeatherCode(code) {
        const map = {
            0: 'Clear',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Fog',
            48: 'Rime fog',
            51: 'Light drizzle',
            53: 'Drizzle',
            55: 'Heavy drizzle',
            61: 'Light rain',
            63: 'Rain',
            65: 'Heavy rain',
            71: 'Light snow',
            73: 'Snow',
            75: 'Heavy snow',
            80: 'Rain showers',
            81: 'Heavy showers',
            95: 'Thunderstorm'
        };
        return map[code] || 'Unknown';
    }

    getWeatherIcon(condition, temp = 20) {
        const conditionLower = condition.toLowerCase();

        if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) return '🌧️';
        if (conditionLower.includes('storm') || conditionLower.includes('thunder')) return '⛈️';
        if (conditionLower.includes('snow') || conditionLower.includes('sleet')) return '❄️';
        if (conditionLower.includes('mist') || conditionLower.includes('fog')) return '🌫️';
        if (conditionLower.includes('overcast') || conditionLower.includes('cloudy')) return '☁️';
        if (conditionLower.includes('partly cloudy')) return '⛅';
        if (conditionLower.includes('sunny') || conditionLower.includes('clear')) return temp > 30 ? '🌞' : '☀️';
        if (temp < 5) return '🥶';
        return '🌤️';
    }
}
