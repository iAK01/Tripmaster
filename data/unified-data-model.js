export function generateTripId() {
  return 'trip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// data/unified-data-model.js - The heart of everything
export const UnifiedTripModel = {
  // Core trip info
  tripInfo: {
    id: '',
    name: '',
    origin: {
      city: '',
      country: '',
      countryCode: '',
      coordinates: { lat: null, lng: null },
      timezone: '',
      currency: '',
      currencySymbol: '',
      electricalPlug: '',
      currentWeather: null
    },
    destination: {
      city: '',
      country: '',
      countryCode: '',
      coordinates: { lat: null, lng: null },
      timezone: '',
      currency: '',
      currencySymbol: '',
      language: '',
      electricalPlug: '',
      currentWeather: null
    },
    startDate: '',
    endDate: '',
    nights: 0,
    tripType: '',
    purpose: '',
    notes: '',
    created: '',
    lastModified: ''
  },
    // NEW: User Profile (persistent across all trips)
  userProfile: {
    name: '',
    homeLocation: {
      city: '',
      country: '',
      countryCode: '',
      coordinates: { lat: null, lng: null },
      timezone: '',
      currency: '',
      currencySymbol: '',
      electricalPlug: '',
      currentWeather: null
    },
    preferences: {
      units: 'metric', // 'metric' or 'imperial'
      language: 'en',
      defaultTripType: 'leisure'
    },
    setupComplete: false,
    created: '',
    lastUpdated: ''
  },

  // Activities & Schedule (from your work trip JSON structure)
  itinerary: {
    days: [
      {
        date: '',
        dayOfWeek: '',
        stops: [
          {
            id: '',
            name: '',
            type: '',
            address: '',
            coordinates: '',
            scheduledTime: '',
            duration: '',
            description: '',
            completed: false,
            personalNotes: '',
            
            // Your existing rich data structure (keep all of this!)
            mobileInfo: {
              quickTip: '',
              essentials: [],
              apps: [],
              nearbyServices: []
            },
            transportOptions: [
              {
                method: '',
                duration: '',
                cost: '',
                frequency: '',
                mobileNote: '',
                pros: [],
                cons: []
              }
            ],
            activities: [
              {
                name: '',
                description: '',
                duration: '',
                price: '',
                mobileNote: ''
              }
            ],
            diningRecommendations: [
              {
                name: '',
                cuisine: '',
                priceRange: '',
                specialDish: '',
                walkingTime: '',
                address: '',
                phone: '',
                mobileNote: '',
                openingHours: ''
              }
            ],
            wikiInfo: {
              title: '',
              content: '',
              link: ''
            },
            photoSpots: [],
            timeline: [],
            cuisine: [],
            souvenirs: [],
            
            // Quick reference additions
            quickReference: {
              phone: '',
              website: '',
              openingHours: '',
              priceRange: '',
              tips: []
            }
          }
        ],
        travelInfo: {
          distance: '',
          cost: '',
          time: ''
        },
        dailySummary: {
          totalWalkingTime: '',
          totalTransportCost: '',
          totalDiningBudget: '',
          totalAttractionCosts: '',
          keyHighlights: [],
          eveningOption: '',
          tomorrowPrep: []
        },
        practicalInfo: {
          emergencyNumber: '',
          policeNumber: '',
          medicalEmergency: '',
          nearbyHospital: '',
          nearestPharmacy: '',
          localCustoms: [],
          mobileEssentials: [],
          budgetBreakdown: {}
        },
        events: [],
        completed: false,
        completionPercentage: 0
      }
    ],
    progress: {
      completedStops: [],
      completedDays: [],
      currentDay: null,
      lastVisited: null,
      milestones: {
        planningComplete: false,
        packingComplete: false,
        documentsReady: false,
        tripStarted: false,
        tripCompleted: false
      }
    }
  },

  // Packing system (your existing structure)
  packing: {
    items: {
      // Your existing category structure
      clothes: {},
      toiletries: {},
      electronics: {},
      documents: {},
      weather_gear: {},
      business_items: {},
      hiking_gear: {},
      beach_gear: {},
      photography_gear: {},
      fitness_gear: {},
      activity_items: {},
      travel_essentials: {}
    },
    progress: {
      totalItems: 0,
      completedItems: 0,
      percentage: 0
    },
    generatedFrom: {
      weather: true,
      activities: true,
      tripType: true,
      duration: true,
      destination: true
    },
    customCategories: {},
    lastMinuteItems: []
  },

  // Weather (enhanced from your existing)
  weather: {
    forecast: [
      {
        date: '',
        condition: '',
        temp: 0,
        icon: '',
        humidity: 0,
        chanceOfRain: 0,
        maxTemp: 0,
        minTemp: 0,
        wind: 0,
        uv: 0,
        source: ''
      }
    ],
    lastUpdated: '',
    affectedSchedule: [],
    affectedPacking: [],
    alerts: [],
    recommendations: {
      clothing: [],
      activities: [],
      timing: []
    }
  },

  // Smart travel intelligence (your brilliant additions!)
  travelIntelligence: {
    // Electrical compatibility
    electrical: {
      needsAdapter: false,
      originPlug: '',
      destinationPlug: '',
      adapterType: '',
      recommendation: ''
    },
    
    // Weather comparison
    weatherComparison: {
      temperatureDifference: 0, // +5 = 5 degrees warmer, -3 = 3 degrees colder
      originCurrent: null,
      destinationCurrent: null,
      recommendation: '',
      packingTips: []
    },
    
    // Currency comparison
    currencyComparison: {
      needsExchange: false,
      exchangeRate: null,
      costDifference: '', // "20% more expensive", "Similar prices"
      recommendation: ''
    },
    
    // Time zone difference
    timezoneComparison: {
      hoursDifference: 0, // +2 = 2 hours ahead, -5 = 5 hours behind
      jetlagRisk: 'none', // none, mild, moderate, severe
      recommendation: '',
      adjustmentTips: []
    },
    
    // Cultural differences
    culturalNotes: {
      languageDifference: '', // "Different language", "Same language"
      customsDifferences: [],
      importantDifferences: []
    }
  },
  quickReference: {
    // Emergency info (critical for travelers)
    emergency: {
      local: '112',           // Default EU
      police: '',
      medical: '',
      embassy: '',
      hotel: '',
      nearestHospital: ''
    },
    
    // Essential phrases (your brilliant idea!)
    language: {
      code: '',
      name: '',
      localName: '',
      essentialPhrases: [
        {
          id: '',
          english: '',
          local: '',
          phonetic: '',
          usage: '',
          context: ''
        }
      ]
    },
    
    // Currency & practical info
    money: {
      currency: '',
      symbol: '',
      tipping: '',
      paymentNotes: '',
      commonDenominations: []
    },
    
    // Local customs (travel companion essential)
    customs: [],
    
    // Transport quick reference
    transport: {
      metro: {
        cost: '',
        dayPass: '',
        notes: ''
      },
      taxi: {
        startingFare: '',
        perKm: '',
        apps: [],
        tips: ''
      }
    }
  },

  // Simple logistics (no complex integrations)
  logistics: {
    flights: [
      {
        airline: '',
        flightNumber: '',
        departure: { 
          airport: '', 
          time: '', 
          terminal: '',
          gate: ''
        },
        arrival: { 
          airport: '', 
          time: '', 
          terminal: '',
          gate: ''
        },
        seat: '',
        confirmationCode: '',
        notes: ''
      }
    ],
    
    accommodation: [
      {
        name: '',
        address: '',
        phone: '',
        checkIn: '',
        checkOut: '',
        confirmationCode: '',
        wifi: '',
        notes: ''
      }
    ],
    
    // Simple document checklist
    documents: {
      passport: { 
        expires: '', 
        notes: '',
        checked: false
      },
      visa: { 
        required: false, 
        expires: '', 
        notes: '',
        checked: false
      },
      insurance: { 
        provider: '', 
        policyNumber: '', 
        notes: '',
        checked: false
      },
      tickets: { 
        saved: false, 
        notes: '',
        checked: false
      },
      other: []
    }
  },

  // Meta data
  meta: {
    version: '1.0',
    appVersion: '',
    syncStatus: 'local',
    lastBackup: '',
    exportFormat: 'json',
    dataSize: 0
  },

  // Offline/companion features
  offline: {
    enabled: true,
    downloadedMaps: false,
    offlineContent: true,
    lastOnlineSync: null
  }
};


// Then use it in createNewTrip
export function createNewTrip(basicInfo = {}) {
  console.log('[DEBUG] generateTripId type:', typeof generateTripId); // should log "function"
  
  const trip = JSON.parse(JSON.stringify(UnifiedTripModel)); // Deep clone
  trip.tripInfo.id = generateTripId(); // 💥 Fails here currently
  trip.tripInfo.created = new Date().toISOString();
  trip.tripInfo.lastModified = new Date().toISOString();

  Object.assign(trip.tripInfo, basicInfo);
  return trip;
}

// Helper function to calculate travel intelligence
export function calculateTravelIntelligence(trip) {
  if (!trip.tripInfo.origin.countryCode || !trip.tripInfo.destination.countryCode) {
    return trip; // Can't calculate without both locations
  }
  
  const intelligence = trip.travelIntelligence;
  
  // Electrical compatibility
  const originPlug = trip.tripInfo.origin.electricalPlug;
  const destPlug = trip.tripInfo.destination.electricalPlug;
  
  intelligence.electrical = {
    needsAdapter: originPlug !== destPlug,
    originPlug: originPlug,
    destinationPlug: destPlug,
    adapterType: originPlug !== destPlug ? `${originPlug} to ${destPlug}` : 'None needed',
    recommendation: originPlug !== destPlug ? 
      `Bring ${originPlug} to ${destPlug} adapter` : 
      'Your plugs will work - no adapter needed! 🔌'
  };
  
  // Weather comparison (if both have current weather)
  if (trip.tripInfo.origin.currentWeather && trip.tripInfo.destination.currentWeather) {
    const tempDiff = trip.tripInfo.destination.currentWeather.temp - trip.tripInfo.origin.currentWeather.temp;
    
    intelligence.weatherComparison = {
      temperatureDifference: tempDiff,
      originCurrent: trip.tripInfo.origin.currentWeather,
      destinationCurrent: trip.tripInfo.destination.currentWeather,
      recommendation: getWeatherRecommendation(tempDiff),
      packingTips: getWeatherPackingTips(tempDiff)
    };
  }
  
  // Currency comparison
  const needsCurrencyExchange = trip.tripInfo.origin.currency !== trip.tripInfo.destination.currency;
  intelligence.currencyComparison = {
    needsExchange: needsCurrencyExchange,
    exchangeRate: null, // Could be fetched from API
    recommendation: needsCurrencyExchange ? 
      `Exchange ${trip.tripInfo.origin.currency} to ${trip.tripInfo.destination.currency}` :
      'Same currency - no exchange needed! 💰'
  };
  
  // Timezone difference
  // Note: This would need proper timezone calculation library for accuracy
  intelligence.timezoneComparison = {
    hoursDifference: 0, // Placeholder - needs timezone library
    jetlagRisk: 'unknown',
    recommendation: 'Check timezone difference for jet lag preparation'
  };
  
  // Cultural differences
  const sameLang = trip.tripInfo.origin.countryCode === trip.tripInfo.destination.countryCode;
  intelligence.culturalNotes = {
    languageDifference: sameLang ? 'Same language' : 'Different language - phrases included!',
    customsDifferences: [], // Could be populated from cultural database
    importantDifferences: []
  };
  
  return trip;
}
// NEW: User Profile Management Functions
export function createUserProfile(basicInfo = {}) {
  const profile = {
    name: basicInfo.name || '',
    homeLocation: {
      city: basicInfo.homeCity || '',
      country: basicInfo.homeCountry || '',
      countryCode: basicInfo.homeCountryCode || '',
      coordinates: { lat: null, lng: null },
      timezone: 'UTC',
      currency: 'USD',
      currencySymbol: '$',
      electricalPlug: 'Unknown',
      currentWeather: null
    },
    preferences: {
      units: 'metric',
      language: 'en',
      defaultTripType: 'leisure'
    },
    setupComplete: !!(basicInfo.name && basicInfo.homeCity),
    created: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
  
  return profile;
}

export function isProfileComplete(profile) {
  return profile && 
         profile.name && 
         profile.homeLocation.city && 
         profile.homeLocation.countryCode &&
         profile.setupComplete;
}

export function updateProfile(existingProfile, updates) {
  return {
    ...existingProfile,
    ...updates,
    lastUpdated: new Date().toISOString(),
    setupComplete: !!(updates.name || existingProfile.name) && 
                   !!(updates.homeLocation?.city || existingProfile.homeLocation?.city)
  };
}

// Helper functions for recommendations
function getWeatherRecommendation(tempDifference) {
  if (tempDifference > 10) {
    return `Much warmer destination (+${tempDifference}°C) - pack lighter clothes! ☀️`;
  } else if (tempDifference > 5) {
    return `Warmer destination (+${tempDifference}°C) - pack some lighter clothes 🌤️`;
  } else if (tempDifference < -10) {
    return `Much colder destination (${tempDifference}°C) - pack warm clothes! 🧥`;
  } else if (tempDifference < -5) {
    return `Colder destination (${tempDifference}°C) - pack some warm clothes ❄️`;
  } else {
    return `Similar temperature (${tempDifference > 0 ? '+' : ''}${tempDifference}°C) - pack normally 👍`;
  }
}

function getWeatherPackingTips(tempDifference) {
  const tips = [];
  
  if (tempDifference > 10) {
    tips.push('Pack shorts and t-shirts');
    tips.push('Bring sunscreen and hat');
    tips.push('Light, breathable fabrics');
  } else if (tempDifference < -10) {
    tips.push('Pack warm jacket/coat');
    tips.push('Bring gloves and warm hat');
    tips.push('Layer-friendly clothing');
    tips.push('Warm socks and shoes');
  } else if (Math.abs(tempDifference) > 5) {
    tips.push('Pack versatile layers');
    tips.push('Bring adaptable clothing');
  }
  
  return tips;
}


// Validation helpers
export const TripValidation = {
  isValidTrip(trip) {
    return trip.tripInfo && 
           trip.tripInfo.destination && 
           trip.tripInfo.destination.city && 
           trip.tripInfo.destination.countryCode &&
           trip.tripInfo.startDate &&
           trip.tripInfo.nights > 0;
  },

   canUseProfileIntelligence(trip, profile) {
    return this.isValidTrip(trip) && 
           isProfileComplete(profile) &&
           trip.tripInfo.destination.countryCode !== profile.homeLocation.countryCode;
  },

  getValidationErrors(trip) {
    const errors = [];
    
    if (!trip.tripInfo?.destination?.city) {
      errors.push('City is required');
    }
    
    if (!trip.tripInfo?.destination?.countryCode) {
      errors.push('Country is required');
    }
    
    if (!trip.tripInfo?.startDate) {
      errors.push('Start date is required');
    }
    
    if (!trip.tripInfo?.nights || trip.tripInfo.nights <= 0) {
      errors.push('Number of nights must be greater than 0');
    }
    
    return errors;
  },

  canGeneratePacking(trip) {
    return this.isValidTrip(trip) && trip.tripInfo.tripType;
  },

  canGenerateItinerary(trip) {
    return this.isValidTrip(trip) && trip.tripInfo.destination.coordinates;
  }
};

// Data migration helpers (for when we update the model)
export const DataMigration = {
  migrateFromV1(oldTrip) {
    // Handle migration from old packing list format
    const newTrip = createNewTrip();
    
    // Copy over existing data
    if (oldTrip.location) {
      newTrip.tripInfo.destination.city = oldTrip.location;
    }
    
    if (oldTrip.nights) {
      newTrip.tripInfo.nights = oldTrip.nights;
    }
    
    if (oldTrip.items) {
      newTrip.packing.items = oldTrip.items;
    }
    
    if (oldTrip.weather) {
      newTrip.weather.forecast = oldTrip.weather;
    }
    
    return newTrip;
  },

  getCurrentVersion() {
    return '1.0';
  },

  needsMigration(trip) {
    return !trip.meta || !trip.meta.version || trip.meta.version !== this.getCurrentVersion();
  }
};

