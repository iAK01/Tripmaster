// utils/location-service.js - Centralized location data fetching & intelligence
import { countriesDatabase } from '../data/countries-database.js';
import { languagePhrases } from '../data/language-phrases.js';

export class LocationService {
    constructor() {
        this.nominatimBase = 'https://nominatim.openstreetmap.org';
        this.weatherApiKey = '90c4c9014ba54aecadd160109231806'; // Your existing key
        
        // Cache to avoid repeated API calls
        this.locationCache = new Map();
        this.weatherCache = new Map();
    }

    /**
     * Main method: Enrich both origin and destination locations
     */
    async enrichTripLocations(originInput, destinationInput, tripDuration, startDate, userProfile = null) {
    try {
        // Use user profile home location as origin if available
        const actualOriginInput = userProfile?.homeLocation?.city && userProfile?.homeLocation?.country ? 
            `${userProfile.homeLocation.city}, ${userProfile.homeLocation.country}` : 
            originInput;

        // Enrich both locations in parallel
        const [originData, destinationData] = await Promise.all([
            this.enrichSingleLocation(actualOriginInput, userProfile?.homeLocation),
            this.enrichSingleLocation(destinationInput)
        ]);

        // Get weather for both locations for comparison
        let originWeather = null;
        let destinationWeather = null;
        
        if (originData.coordinates && destinationData.coordinates) {
            const [originWeatherData, destWeatherData] = await Promise.all([
                this.getCurrentWeather(actualOriginInput),
                this.getLocationWeather(destinationInput, tripDuration, startDate)
            ]);
            
            originWeather = originWeatherData;
            destinationWeather = destWeatherData;
        }

        // Calculate travel intelligence with weather comparison
        const travelIntelligence = this.calculateTravelIntelligence(
            originData, 
            destinationData, 
            originWeather, 
            destinationWeather,
            userProfile
        );

        return {
            origin: {
                ...originData,
                currentWeather: originWeather
            },
            destination: {
                ...destinationData,
                weather: destinationWeather
            },
            travelIntelligence,
            success: true
        };

    } catch (error) {
        console.error('Location enrichment failed:', error);
        return {
            origin: this.getFallbackLocationData(actualOriginInput || originInput),
            destination: this.getFallbackLocationData(destinationInput),
            travelIntelligence: this.getDefaultTravelIntelligence(),
            success: false,
            error: error.message
        };
    }
}

    /**
     * Enrich a single location (origin or destination)
     */
    async enrichSingleLocation(locationInput, knownLocationData = null) {
        const { city, countryCode } = this.parseLocationInput(locationInput);
        
        // Check cache first
        const cacheKey = `${city}-${countryCode}`.toLowerCase();
        if (this.locationCache.has(cacheKey)) {
            console.log(`Using cached location data for ${city}, ${countryCode}`);
            return this.locationCache.get(cacheKey);
        }

        try {
            // Get country metadata (always available)
            const countryInfo = countriesDatabase.getCountryMetadata(countryCode);
            const countryData = countriesDatabase.getCountryByCode(countryCode);

                // Try to get coordinates from known data first, then geocoding
        let coordinates = knownLocationData?.coordinates || null;
        let geocodingSuccess = !!coordinates;
        
        if (!coordinates) {
            try {
                const geoData = await this.geocodeLocation(`${city}, ${countryData.name}`);
                coordinates = geoData.coordinates;
                geocodingSuccess = true;
            } catch (geoError) {
                console.warn(`Geocoding failed for ${city}, ${countryCode}:`, geoError.message);
                // Continue without coordinates - we'll still have country-level data
            }
        }

            // Build enriched location data
            const enrichedData = {
                // User input
                userInput: locationInput,
                
                // Parsed location
                city: city,
                country: countryData.name,
                countryCode: countryCode,
                
                // Coordinates (may be null if geocoding failed)
                coordinates: coordinates,
                
                // Country metadata
                timezone: countryInfo.timezone,
                currency: countryInfo.currency,
                currencySymbol: countryInfo.currencySymbol,
                language: countryInfo.language,
                emergency: countryInfo.emergency,
                electricalPlug: countryInfo.electricalPlug,
                
                // Essential phrases
                essentialPhrases: this.getEssentialPhrases(countryCode),
                
                // Local info
                localCustoms: this.getLocalCustoms(countryCode),
                
                // Status flags
                geocodingSuccess: geocodingSuccess,
                
                // Cache timestamp
                cachedAt: new Date().toISOString()
            };

            // Cache the result
            this.locationCache.set(cacheKey, enrichedData);
            
            return enrichedData;

        } catch (error) {
            console.error(`Failed to enrich location ${locationInput}:`, error);
            return this.getFallbackLocationData(locationInput);
        }
    }

    /**
     * Parse user input "Athens, Greece" -> {city: "Athens", countryCode: "GR"}
     */
    parseLocationInput(locationInput) {
        const parts = locationInput.split(',').map(s => s.trim());
        
        if (parts.length !== 2) {
            throw new Error('Location must be in format "City, Country"');
        }

        const [city, countryName] = parts;
        
        // Find country code from name
        const country = countriesDatabase.dropdownList.find(c => 
            c.name.toLowerCase() === countryName.toLowerCase()
        );

        if (!country) {
            throw new Error(`Country "${countryName}" not found in supported destinations`);
        }

        return {
            city: city,
            countryCode: country.code
        };
    }

    /**
     * Geocode location using Nominatim (free OpenStreetMap)
     */
    async geocodeLocation(locationString) {
        const url = `${this.nominatimBase}/search?` + new URLSearchParams({
            q: locationString,
            format: 'json',
            limit: 1,
            addressdetails: 1
        });

        // Add delay to respect rate limits (1 request per second)
        await this.rateLimitDelay();

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Geocoding API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.length === 0) {
            throw new Error(`Location not found: ${locationString}`);
        }
        
        const result = data[0];
        
        return {
            coordinates: {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon)
            },
            displayName: result.display_name,
            boundingBox: result.boundingbox
        };
    }

    /**
     * Get weather for location using your existing weather API
     */
    async getLocationWeather(locationString, duration, startDate) {
        const cacheKey = `weather-${locationString}-${startDate}-${duration}`;
        
        // Check cache (weather cached for 1 hour)
        if (this.weatherCache.has(cacheKey)) {
            const cached = this.weatherCache.get(cacheKey);
            if (Date.now() - cached.timestamp < 3600000) { // 1 hour
                return cached.data;
            }
        }

        try {
            // Import your existing weather API
            const { WeatherAPI } = await import('./weather-api.js');
            const weatherService = new WeatherAPI();
            
            const weatherData = await weatherService.getWeather(locationString, duration, startDate);
            
            // Cache the result
            this.weatherCache.set(cacheKey, {
                data: weatherData,
                timestamp: Date.now()
            });
            
            return weatherData;
            
        } catch (error) {
            console.warn(`Weather fetch failed for ${locationString}:`, error);
            return []; // Return empty array instead of failing
        }
    }

    async getCurrentWeather(locationString) {
    try {
        // Import your existing weather API
        const { WeatherAPI } = await import('./weather-api.js');
        const weatherService = new WeatherAPI();
        
        // Get today's weather (1 day forecast gives current conditions)
        const weatherData = await weatherService.getWeather(locationString, 1, new Date());
        
        return weatherData && weatherData.length > 0 ? weatherData[0] : null;
        
    } catch (error) {
        console.warn(`Current weather fetch failed for ${locationString}:`, error);
        return null;
    }
}

    /**
     * Calculate travel intelligence (your brilliant idea!)
     */
    calculateTravelIntelligence(originData, destinationData, originWeather = null, destinationWeather = null, userProfile = null) {
    const intelligence = {
        electrical: this.compareElectricalSystems(originData, destinationData),
        currency: this.compareCurrencies(originData, destinationData),
        language: this.compareLanguages(originData, destinationData),
        timezone: this.compareTimezones(originData, destinationData),
        weather: this.compareWeather(originData, destinationData, originWeather, destinationWeather),
        personalization: this.addPersonalization(originData, destinationData, userProfile)
    };

    return intelligence;
}

    /**
     * Compare electrical systems (your genius idea!)
     */
    compareElectricalSystems(origin, destination) {
        const originPlug = origin.electricalPlug;
        const destPlug = destination.electricalPlug;
        const needsAdapter = originPlug !== destPlug;

        return {
            needsAdapter: needsAdapter,
            originPlug: originPlug,
            destinationPlug: destPlug,
            adapterType: needsAdapter ? `${originPlug} to ${destPlug}` : 'None needed',
            recommendation: needsAdapter ? 
                `🔌 Bring ${originPlug} to ${destPlug} adapter for ${destination.country}` : 
                `✅ Your ${originPlug} plugs will work in ${destination.country} - no adapter needed!`
        };
    }

    /**
     * Compare currencies
     */
    compareCurrencies(origin, destination) {
        const needsExchange = origin.currency !== destination.currency;

        return {
            needsExchange: needsExchange,
            originCurrency: origin.currency,
            destinationCurrency: destination.currency,
            recommendation: needsExchange ? 
                `💱 Exchange ${origin.currency} to ${destination.currency} before travel` :
                `💰 Same currency (${origin.currency}) - no exchange needed!`
        };
    }

    /**
     * Compare languages
     */
    compareLanguages(origin, destination) {
        const sameLanguage = origin.language === destination.language;

        return {
            sameLanguage: sameLanguage,
            originLanguage: origin.language,
            destinationLanguage: destination.language,
            recommendation: sameLanguage ?
                `🗣️ Same language (${origin.language}) - easy communication!` :
                `🌍 Different language: ${destination.language} - essential phrases provided!`
        };
    }

    /**
     * Compare timezones
     */
    compareTimezones(origin, destination) {
        // This is simplified - in reality you'd need a proper timezone library
        const sameTimezone = origin.timezone === destination.timezone;

        return {
            sameTimezone: sameTimezone,
            originTimezone: origin.timezone,
            destinationTimezone: destination.timezone,
            recommendation: sameTimezone ?
                `⏰ Same timezone - no jet lag!` :
                `🕐 Different timezone: ${destination.timezone} - check times carefully!`
        };
    }

    /**
     * Compare weather (if both have current weather)
     */
    compareWeather(origin, destination, originWeather, destinationWeather) {
    if (!originWeather || !destinationWeather) {
        return {
            hasComparison: false,
            recommendation: `🌤️ Check current weather for both locations to compare`
        };
    }

    const tempDiff = destinationWeather.temp - originWeather.temp;
    const recommendations = [];
    
    if (Math.abs(tempDiff) >= 5) {
        if (tempDiff > 0) {
            recommendations.push(`🌡️ ${tempDiff}°C warmer in ${destination.city} - pack lighter clothes`);
        } else {
            recommendations.push(`🌡️ ${Math.abs(tempDiff)}°C colder in ${destination.city} - pack warmer clothes`);
        }
    } else {
        recommendations.push(`🌡️ Similar temperature (${tempDiff > 0 ? '+' : ''}${tempDiff}°C difference)`);
    }

    // Weather condition comparison
    if (originWeather.condition !== destinationWeather.condition) {
        recommendations.push(`☔ Different conditions: ${originWeather.condition} → ${destinationWeather.condition}`);
    }

    return {
        hasComparison: true,
        temperatureDifference: tempDiff,
        originWeather: originWeather,
        destinationWeather: destinationWeather,
        recommendations: recommendations,
        recommendation: recommendations.join(' • ')
    };
}
    addPersonalization(origin, destination, userProfile) {
    if (!userProfile || !userProfile.name) {
        return {
            hasPersonalization: false,
            greeting: null
        };
    }

    const greeting = `${userProfile.name}, you're traveling from ${origin.city} to ${destination.city}`;
    
    return {
        hasPersonalization: true,
        greeting: greeting,
        userName: userProfile.name,
        homeLocation: `${origin.city}, ${origin.country}`,
        destinationLocation: `${destination.city}, ${destination.country}`
    };
}

    /**
     * Get essential phrases for country
     */
    getEssentialPhrases(countryCode) {
        const phrases = languagePhrases.getPhrasesByCountry(countryCode);
        return phrases.phrases.slice(0, 8); // Top 8 most essential
    }

    /**
     * Get local customs and tips
     */
    getLocalCustoms(countryCode) {
        // This would come from a customs database
        // For now, return some basics based on country
        const customsMap = {
            'GR': [
                'Greeks dine late - restaurants busy after 21:00',
                'Many shops close 15:00-17:00 for siesta', 
                'Dress modestly in churches and monasteries',
                'Tap water is safe to drink in Athens'
            ],
            'FR': [
                'Always greet shopkeepers when entering',
                'Lunch is typically 12:00-14:00',
                'Dinner rarely before 19:30',
                'Tipping 10-15% is expected'
            ],
            'DE': [
                'Germans appreciate punctuality',
                'Quiet hours (Ruhezeit) observed 22:00-06:00',
                'Cash preferred in many places',
                'Separate your recycling properly'
            ],
            'IT': [
                'Cappuccino only for breakfast',
                'Shops close for lunch 13:00-16:00',
                'Dress well - Italians notice style',
                'Ask for the check - it won\'t come automatically'
            ]
        };

        return customsMap[countryCode] || [
            'Research local customs before arrival',
            'Respect local traditions and dress codes',
            'Learn basic greetings in the local language'
        ];
    }

    /**
     * Fallback data if API calls fail
     */
    getFallbackLocationData(userInput) {
        const parts = userInput.split(',').map(s => s.trim());
        const city = parts[0] || userInput;
        const countryName = parts[1] || 'Unknown';

        return {
            userInput: userInput,
            city: city,
            country: countryName,
            countryCode: 'XX',
            coordinates: null,
            timezone: 'UTC',
            currency: 'EUR', // Your default
            currencySymbol: '€',
            language: 'Local Language',
            emergency: '112',
            electricalPlug: 'Unknown',
            essentialPhrases: [],
            localCustoms: [],
            geocodingSuccess: false,
            error: 'Location data could not be fetched - using fallback'
        };
    }

    /**
     * Default travel intelligence if comparison fails
     */
    getDefaultTravelIntelligence() {
        return {
            electrical: {
                needsAdapter: true,
                recommendation: '🔌 Check electrical adapter requirements'
            },
            currency: {
                needsExchange: true,
                recommendation: '💱 Check currency exchange requirements'
            },
            language: {
                sameLanguage: false,
                recommendation: '🗣️ Learn basic local phrases'
            },
            timezone: {
                sameTimezone: false,
                recommendation: '⏰ Check timezone differences'
            },
            weather: {
                hasComparison: false,
                recommendation: '🌤️ Check weather for packing guidance'
            }
        };
    }

    /**
     * Rate limiting for Nominatim (1 request per second max)
     */
    async rateLimitDelay() {
        const now = Date.now();
        const lastRequest = this.lastNominatimRequest || 0;
        const timeSinceLastRequest = now - lastRequest;
        
        if (timeSinceLastRequest < 1000) {
            const delay = 1000 - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        this.lastNominatimRequest = Date.now();
    }

    /**
     * Clear caches (for testing or memory management)
     */
    clearCaches() {
        this.locationCache.clear();
        this.weatherCache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            locationCacheSize: this.locationCache.size,
            weatherCacheSize: this.weatherCache.size,
            locationEntries: Array.from(this.locationCache.keys()),
            weatherEntries: Array.from(this.weatherCache.keys())
        };
    }
}
