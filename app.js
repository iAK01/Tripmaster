// app.js - TripMaster Complete Implementation - UNIFIED MODEL VERSION
import { Navigation } from './components/navigation.js';
import { TripSetup } from './components/trip-setup.js';
import { ChecklistDisplay } from './components/checklist-display.js';
import { ItineraryDisplay } from './components/itinerary-display.js';
import { ProgressTracking } from './components/progress-tracking.js';
import { WeatherDisplay } from './components/weather-display.js';
import { ControlPanel } from './components/control-panel.js';
import { StorageManager } from './utils/storage-manager.js';
import { ListGenerator } from './utils/list-generator.js';
import { NotificationManager } from './utils/notification-manager.js';
import { LocationService } from './utils/location-service.js';
import { createNewTrip, createUserProfile, isProfileComplete, calculateTravelIntelligence } from './data/unified-data-model.js';

class TripMaster {
    constructor() {
        console.log('🚀 TripMaster initializing with Unified Data Model...');
        
        // UNIFIED MODEL STATE - using the proper structure
        this.state = {
            trip: createNewTrip(), // This creates the proper unified structure
            activeTab: 'overview',
            isLoading: false,
            profileSetupComplete: false,
            hasUnsavedChanges: false
        };

        // Core services
        this.storage = new StorageManager();
        this.listGenerator = new ListGenerator();
        this.notification = new NotificationManager();
        this.locationService = new LocationService();
        
        // User profile management
        this.userProfile = null;
        
        // Initialize everything
        try {
            this.initializeUserProfile();
            this.initializeComponents();
            this.bindEvents();
            this.loadSavedState();
            this.setupEnhancedAutoSave();            
            this.showInitialTab();
            
            console.log('✅ TripMaster initialized successfully with Unified Model');
        } catch (error) {
            console.error('❌ TripMaster initialization failed:', error);
        }
    }

    // ===== USER PROFILE INITIALIZATION =====
    
    initializeUserProfile() {
        try {
            this.userProfile = this.storage.getUserProfile();
            
            if (this.userProfile && isProfileComplete(this.userProfile)) {
                console.log(`👤 Welcome back ${this.userProfile.name}!`);
                // Set profile in unified model
                this.state.trip.userProfile = this.userProfile;
                this.state.trip.tripInfo.origin = {
                    ...this.state.trip.tripInfo.origin,
                    city: this.userProfile.homeLocation.city,
                    country: this.userProfile.homeLocation.country,
                    countryCode: this.userProfile.homeLocation.countryCode,
                    coordinates: this.userProfile.homeLocation.coordinates
                };
                this.state.profileSetupComplete = true;
            } else {
                console.log('👤 No complete user profile found - will show setup');
                this.state.profileSetupComplete = false;
            }
        } catch (error) {
            console.error('Profile initialization error:', error);
            this.state.profileSetupComplete = false;
        }
    }

    // ===== COMPONENT INITIALIZATION =====
    
    initializeComponents() {
        console.log('🔧 Initializing components...');
        
        // Navigation system
        this.navigation = new Navigation({
            container: document.getElementById('navigation-section'),
            onTabChange: (tabId) => this.handleTabChange(tabId)
        });

        // Trip setup component - inject storage manager
        this.tripSetup = new TripSetup({
            container: document.getElementById('trip-setup-section'),
            onGenerate: (tripData) => this.handleGenerateTrip(tripData),
            onLoad: () => this.handleLoadTrip(),
            onReset: () => this.handleResetTrip()
        });
        
        // CRITICAL: Connect storage to trip setup
        this.tripSetup.setStorageManager(this.storage);
        
        // Weather display
        this.weatherDisplay = new WeatherDisplay({
            container: document.getElementById('weather-display-section')
        });

        // Progress tracking
        this.progressTracking = new ProgressTracking({
            container: document.getElementById('progress-tracking-section')
        });

        // Checklist display
        this.checklistDisplay = new ChecklistDisplay({
            container: document.getElementById('checklist-display-section'),
            onItemToggle: (category, item) => this.handleItemToggle(category, item),
            onItemAdd: (category, item, quantity) => this.handleItemAdd(category, item, quantity),
            onNoteUpdate: (category, item, note) => this.handleNoteUpdate(category, item, note)
        });

        // Itinerary display
        this.itineraryDisplay = new ItineraryDisplay({
            container: document.getElementById('itinerary-display-section'),
            onStopToggle: (stopId, completed) => this.handleStopToggle(stopId, completed),
            onNoteUpdate: (stopId, note) => this.handleItineraryNoteUpdate(stopId, note),
            onActivitySync: (stopId, activities) => this.handleActivitySync(stopId, activities)
        });

        // Control panel
        this.controlPanel = new ControlPanel({
            container: document.getElementById('control-panel'),
            onExport: () => this.handleExport(),
            onSave: () => this.handleSave(),
            onScrollTop: () => window.scrollTo({ top: 0, behavior: 'smooth' })
        });

        // Update navigation with profile info
        if (this.userProfile) {
            this.updateNavigationWithProfile();
        }
        
        // Make globally available
        window.itineraryDisplay = this.itineraryDisplay;
        
        console.log('✅ All components initialized with Unified Model');
    }

    updateNavigationWithProfile() {
        if (this.userProfile && this.navigation) {
            this.navigation.setStorageManager(this.storage);
            this.navigation.updateUserProfile(this.userProfile);
            console.log(`👤 Navigation updated for ${this.userProfile.name}`);
        }
    }
    // ===== TAB NAVIGATION & MANAGEMENT =====
    
    handleTabChange(tabId) {
        console.log('📋 Switching to tab:', tabId);
        
        this.state.activeTab = tabId;
        this.showTab(tabId);
        
        // Update components based on active tab
        switch(tabId) {
            case 'setup':
                this.ensureSetupTabVisible();
                break;
                
            case 'packing':
                this.updatePackingComponents();
                break;
                
            case 'itinerary':
                this.updateItineraryComponents();
                break;
                
            case 'overview':
                this.updateOverviewComponents();
                break;
                
            case 'local-info':
                this.updateLocalInfoComponents();
                break;
        }
        
        this.updateNavigationProgress();
    }

    showTab(tabId) {
        console.log(`🔄 Showing tab: ${tabId}`);

        // Hide all tab sections
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
            tab.style.display = 'none';
        });

        // Show only the target tab section
        const targetSection = document.getElementById(`${tabId}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.display = 'block';
            console.log(`✅ Tab ${tabId} shown successfully`);
        } else {
            console.error(`❌ Tab section ${tabId}-section not found`);
        }
    }

    ensureSetupTabVisible() {
        console.log('🔧 Ensuring setup tab is properly visible...');

        const setupSection = document.getElementById('setup-section');
        if (setupSection) {
            setupSection.classList.add('active');
        }

        // If no profile, show the profile setup form inside TripSetup
        if (!this.userProfile) {
            setTimeout(() => {
                if (this.tripSetup && this.tripSetup.showProfileSetup) {
                    this.tripSetup.showProfileSetup();
                }
            }, 100);
        }

        console.log('✅ Setup tab visibility handled');
    }

    showInitialTab() {
        this.navigation.switchTab('overview');
        this.showTab('overview');
        console.log(`📋 App initialized - click Setup tab to begin`);
    }

    // ===== TRIP GENERATION WITH UNIFIED MODEL =====
    
    async handleGenerateTrip(tripData) {
        try {
            console.log('🚀 Generating trip with Unified Model:', tripData);
            this.setLoading(true);
            
            // Enhanced messaging with profile
            if (this.userProfile) {
                this.notification.show(`🧠 ${this.userProfile.name}, analyzing your trip requirements...`, 'info', 2000);
            } else {
                this.notification.show('🧠 Analyzing your trip requirements...', 'info', 2000);
            }

            // UNIFIED MODEL: Update trip info properly
            this.state.trip.tripInfo.destination = {
                ...this.state.trip.tripInfo.destination,
                city: tripData.location.split(',')[0]?.trim() || '',
                country: tripData.location.split(',')[1]?.trim() || '',
                // Will be enriched by location service
            };
            
            this.state.trip.tripInfo.nights = tripData.nights;
            this.state.trip.tripInfo.tripType = tripData.tripType;
            this.state.trip.tripInfo.startDate = tripData.startDate;
            this.state.trip.tripInfo.notes = tripData.notes || '';
            
            // Calculate end date
            if (tripData.startDate && tripData.nights) {
                const endDate = new Date(tripData.startDate);
                endDate.setDate(endDate.getDate() + tripData.nights);
                this.state.trip.tripInfo.endDate = endDate.toISOString().split('T')[0];
            }

            // Store transportation and accommodation in logistics
            if (tripData.transportation && tripData.transportation.length > 0) {
                // For now, store in a way that's compatible with the list generator
                this.state.trip.logistics.transportation = tripData.transportation || [];
                // Also keep for backward compatibility with components expecting simple format
                this.state.trip.transportation = tripData.transportation || [];
            }
            
            if (tripData.accommodation && tripData.accommodation.length > 0) {
                this.state.trip.logistics.accommodationType = tripData.accommodation || [];
                // Also keep for backward compatibility
                this.state.trip.accommodation = tripData.accommodation || [];
            }

            // Store activities and options
            this.state.trip.activities = tripData.activities || [];
            this.state.trip.transportationOptions = tripData.transportationOptions || [];
            this.state.trip.accommodationOptions = tripData.accommodationOptions || [];

            // Location intelligence with unified model
            if (this.userProfile && tripData.location) {
                try {
                    this.notification.show('🌍 Getting location intelligence...', 'info', 1500);
                    
                    const originLocation = `${this.userProfile.homeLocation.city}, ${this.userProfile.homeLocation.country}`;
                    
                    const locationResult = await this.locationService.enrichTripLocations(
                        originLocation,
                        tripData.location,
                        tripData.nights,
                        new Date(tripData.startDate),
                        this.userProfile
                    );

                    if (locationResult.success) {
                        // Store in unified model
                        this.state.trip.tripInfo.origin = {
                            ...this.state.trip.tripInfo.origin,
                            ...locationResult.origin
                        };
                        
                        this.state.trip.tripInfo.destination = {
                            ...this.state.trip.tripInfo.destination,
                            ...locationResult.destination
                        };
                        
                        // Calculate and store travel intelligence
                        this.state.trip.travelIntelligence = calculateTravelIntelligence(this.state.trip);
                        
                        // Store quick reference data
                        this.state.trip.quickReference.emergency.local = locationResult.destination.emergency;
                        this.state.trip.quickReference.language.essentialPhrases = locationResult.destination.essentialPhrases;
                        this.state.trip.quickReference.customs = locationResult.destination.localCustoms;
                        
                        setTimeout(() => {
                            this.showTravelIntelligenceInsights(this.state.trip.travelIntelligence, this.userProfile.name);
                        }, 3500);
                        
                    } else {
                        console.warn('Location intelligence failed:', locationResult.error);
                        this.notification.show('⚠️ Location intelligence unavailable - continuing with basic generation', 'warning', 2000);
                    }
                    
                } catch (locationError) {
                    console.warn('Location intelligence failed:', locationError);
                    this.notification.show('⚠️ Location intelligence unavailable - continuing with basic generation', 'warning', 2000);
                }
            }

            // Weather fetching
            if (tripData.location) {
                setTimeout(() => {
                    this.notification.show('🌤️ Fetching weather forecast...', 'info', 1500);
                }, 4000);
                
                await this.weatherDisplay.fetchWeather(tripData.location, tripData.nights);
                const weatherData = this.weatherDisplay.getWeatherData();
                
                // Store in unified model
                this.state.trip.weather.forecast = weatherData || [];
                this.state.trip.weather.lastUpdated = new Date().toISOString();
                
                // Also keep for backward compatibility
                this.state.trip.weather = weatherData;
            }

            // Enhanced item generation using unified model
            setTimeout(() => {
                this.notification.show('🧠 Generating intelligent packing list...', 'info', 2000);
            }, 6500);

            // Create enhanced trip data for list generator (hybrid format for compatibility)
            const enhancedTripData = {
                // Legacy format for list generator compatibility
                location: tripData.location,
                nights: tripData.nights,
                tripType: tripData.tripType,
                startDate: tripData.startDate,
                transportation: tripData.transportation,
                accommodation: tripData.accommodation,
                activities: tripData.activities,
                transportationOptions: tripData.transportationOptions,
                accommodationOptions: tripData.accommodationOptions,
                
                // Enhanced data from unified model
                weather: this.state.trip.weather,
                travelIntelligence: this.state.trip.travelIntelligence,
                userProfile: this.userProfile,
                tripInfo: this.state.trip.tripInfo,
                originDestinationData: {
                    origin: this.state.trip.tripInfo.origin,
                    destination: this.state.trip.tripInfo.destination
                }
            };

            const generatedItems = await this.listGenerator.generateItems(enhancedTripData);
            
            // Store in unified model
            this.state.trip.packing.items = generatedItems;
            this.state.trip.packing.generatedFrom = {
                weather: true,
                activities: true,
                tripType: true,
                duration: true,
                destination: true
            };
            
            // Also store for backward compatibility
            this.state.trip.items = generatedItems;
            this.state.trip.completedItems = [];

            // Update metadata
            this.state.trip.meta.lastModified = new Date().toISOString();
            this.state.trip.meta.hasItinerary = !!(this.state.trip.itinerary && this.state.trip.itinerary.days && this.state.trip.itinerary.days.length > 0);
            this.state.trip.meta.hasPacking = !!(generatedItems && Object.keys(generatedItems).length > 0);

            // Update all components
            this.updateAllComponents();

            // Save using unified model
            this.storage.saveTrip(this.state.trip);
            this.state.hasUnsavedChanges = false;

            // Success messaging
            setTimeout(() => {
                const userName = this.userProfile ? ` ${this.userProfile.name}` : '';
                this.notification.show(`🎯${userName}, smart trip plan generated!`, 'success', 4000);
            }, 8000);

            setTimeout(() => {
                this.navigation.switchTab('packing');
            }, 11000);

        } catch (error) {
            console.error('Error generating trip:', error);
            this.notification.show('Failed to generate trip plan. Please try again.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    // ===== TRAVEL INTELLIGENCE INSIGHTS =====

    showTravelIntelligenceInsights(intelligence, userName) {
        const insights = [];
        
        if (intelligence.electrical) {
            if (intelligence.electrical.needsAdapter) {
                insights.push(`🔌 ${userName}, you'll need a ${intelligence.electrical.adapterType} adapter`);
            } else {
                insights.push(`✅ ${userName}, your ${intelligence.electrical.originPlug} plugs will work - no adapter needed!`);
            }
        }
        
        if (intelligence.currency) {
            if (intelligence.currency.needsExchange) {
                insights.push(`💱 ${userName}, you'll need to exchange ${intelligence.currency.originCurrency} to ${intelligence.currency.destinationCurrency}`);
            } else {
                insights.push(`💰 ${userName}, same currency (${intelligence.currency.originCurrency}) - no exchange needed!`);
            }
        }
        
        if (intelligence.language) {
            if (intelligence.language.sameLanguage) {
                insights.push(`🗣️ ${userName}, same language - easy communication!`);
            } else {
                insights.push(`🌍 ${userName}, different language (${intelligence.language.destinationLanguage}) - essential phrases included!`);
            }
        }
        
        if (intelligence.weather && intelligence.weather.hasComparison) {
            insights.push(`🌤️ ${userName}, ${intelligence.weather.recommendation}`);
        }
        
        insights.forEach((insight, index) => {
            setTimeout(() => {
                this.notification.show(insight, 'info', 4000);
            }, 1000 + (index * 1800));
        });
    }

    setLoading(isLoading) {
        this.state.isLoading = isLoading;
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.toggle('hidden', !isLoading);
        }
    }
    // ===== SECTION 3: COMPONENT MANAGEMENT & TAB SWITCHING =====

// ===== TAB NAVIGATION & MANAGEMENT =====

handleTabChange(tabId) {
    console.log('📋 Switching to tab:', tabId);
    
    this.state.activeTab = tabId;
    this.showTab(tabId);
    
    // Update components based on active tab
    switch(tabId) {
        case 'setup':
            this.ensureSetupTabVisible();
            break;
            
        case 'packing':
            this.updatePackingComponents();
            break;
            
        case 'itinerary':
            this.updateItineraryComponents();
            break;
            
        case 'overview':
            this.updateOverviewComponents();
            break;
            
        case 'local-info':
            this.updateLocalInfoComponents();
            break;
    }
    
    this.updateNavigationProgress();
}

showTab(tabId) {
    console.log(`🔄 Showing tab: ${tabId}`);

    // Hide all tab sections
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
    });

    // Show only the target tab section
    const targetSection = document.getElementById(`${tabId}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
        console.log(`✅ Tab ${tabId} shown successfully`);
    } else {
        console.error(`❌ Tab section ${tabId}-section not found`);
    }
}

ensureSetupTabVisible() {
    console.log('🔧 Ensuring setup tab is properly visible...');

    const setupSection = document.getElementById('setup-section');
    if (setupSection) {
        setupSection.classList.add('active');
    }

    // If no profile, show the profile setup form inside TripSetup
    if (!this.userProfile) {
        setTimeout(() => {
            if (this.tripSetup && this.tripSetup.showProfileSetup) {
                this.tripSetup.showProfileSetup();
            }
        }, 100);
    }

    console.log('✅ Setup tab visibility handled');
}

showInitialTab() {
    this.navigation.switchTab('overview');
    this.showTab('overview');
    console.log(`📋 App initialized - click Setup tab to begin`);
}

updateNavigationWithProfile() {
    if (this.userProfile && this.navigation) {
        this.navigation.setStorageManager(this.storage);
        this.navigation.updateUserProfile(this.userProfile);
        console.log(`👤 Navigation updated for ${this.userProfile.name}`);
    }
}

// ===== COMPONENT UPDATE METHODS (UNIFIED MODEL) =====

updateAllComponents() {
    this.updatePackingComponents();
    this.updateItineraryComponents();
    this.updateProgressComponents();
    this.updateOverviewComponents();
    this.updateNavigationProgress();
}

updatePackingComponents() {
    console.log('🔍 DEBUG: Updating packing components with unified model');
    
    // UNIFIED MODEL: Access items via packing.items
    const packingItems = this.state.trip.packing?.items || {};
    const completedItems = this.state.trip.packing?.completedItems || [];
    
    if (Object.keys(packingItems).length > 0) {
        if (this.checklistDisplay && typeof this.checklistDisplay.loadItems === 'function') {
            // Pass the unified trip data for enhanced rendering
            this.checklistDisplay.loadItems(packingItems, completedItems);
            
            // UNIFIED MODEL: Pass full trip context
            if (typeof this.checklistDisplay.updateTripSummary === 'function') {
                this.checklistDisplay.updateTripSummary({
                    location: `${this.state.trip.tripInfo.destination.city}, ${this.state.trip.tripInfo.destination.country}`,
                    nights: this.state.trip.tripInfo.nights,
                    tripType: this.state.trip.tripInfo.tripType,
                    transportation: this.state.trip.logistics?.transportation || [],
                    accommodation: this.state.trip.logistics?.accommodation || [],
                    weather: this.state.trip.weather?.forecast || [],
                    travelIntelligence: this.state.trip.travelIntelligence,
                    itinerary: this.state.trip.itinerary
                });
            }
        } else {
            console.error('❌ checklistDisplay or loadItems method missing');
        }
    }
}

updateItineraryComponents() {
    // UNIFIED MODEL: Access itinerary properly
    if (this.state.trip.itinerary && this.state.trip.itinerary.days.length > 0) {
        const tripInfo = {
            location: `${this.state.trip.tripInfo.destination.city}, ${this.state.trip.tripInfo.destination.country}`,
            startDate: this.state.trip.tripInfo.startDate,
            nights: this.state.trip.tripInfo.nights,
            tripType: this.state.trip.tripInfo.tripType
        };
        
        this.itineraryDisplay.render(this.state.trip.itinerary, tripInfo);
    }
}

updateProgressComponents() {
    // UNIFIED MODEL: Calculate progress from unified structure
    const totalPackingItems = Object.values(this.state.trip.packing?.items || {})
        .reduce((sum, cat) => sum + Object.keys(cat).length, 0);
    const completedPackingItems = this.state.trip.packing?.completedItems?.length || 0;
    
    const totalItineraryStops = this.state.trip.itinerary?.days?.reduce(
        (sum, day) => sum + (day.stops?.length || 0), 0) || 0;
    const completedItineraryStops = this.state.trip.itinerary?.progress?.completedStops?.length || 0;
    
    const totalItems = totalPackingItems + totalItineraryStops;
    const completedItems = completedPackingItems + completedItineraryStops;
    
    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    const progressData = {
        percentage: percentage,
        completed: completedItems,
        total: totalItems,
        packing: {
            completed: completedPackingItems,
            total: totalPackingItems,
            percentage: totalPackingItems > 0 ? Math.round((completedPackingItems / totalPackingItems) * 100) : 0
        },
        itinerary: {
            completed: completedItineraryStops,
            total: totalItineraryStops,
            percentage: totalItineraryStops > 0 ? Math.round((completedItineraryStops / totalItineraryStops) * 100) : 0
        }
    };
    
    this.progressTracking.update(progressData);
}

updateOverviewComponents() {
    const overviewSection = document.getElementById('overview-section');
    if (!overviewSection) return;
    
    const greeting = this.userProfile ? `Hi ${this.userProfile.name}!` : 'Welcome to TripMaster!';
    
    // UNIFIED MODEL: Check if trip has basic info
    const hasTrip = this.state.trip.tripInfo.destination.city && this.state.trip.tripInfo.nights;
    
    // Build travel intelligence display
    let intelligenceHTML = '';
    if (this.state.trip.travelIntelligence) {
        const intel = this.state.trip.travelIntelligence;
        const insights = [];
        
        if (intel.electrical) {
            insights.push({
                icon: intel.electrical.needsAdapter ? '🔌' : '✅',
                text: intel.electrical.recommendation,
                type: intel.electrical.needsAdapter ? 'warning' : 'success'
            });
        }
        
        if (intel.currency) {
            insights.push({
                icon: intel.currency.needsExchange ? '💱' : '💰',
                text: intel.currency.recommendation,
                type: intel.currency.needsExchange ? 'info' : 'success'
            });
        }
        
        if (intel.language) {
            insights.push({
                icon: intel.language.sameLanguage ? '🗣️' : '🌍',
                text: intel.language.recommendation,
                type: intel.language.sameLanguage ? 'success' : 'info'
            });
        }
        
        if (intel.weather && intel.weather.recommendation) {
            insights.push({
                icon: '🌤️',
                text: intel.weather.recommendation,
                type: 'info'
            });
        }
        
        if (insights.length > 0) {
            intelligenceHTML = `
                <div class="travel-intelligence-section">
                    <h3>🧠 Travel Intelligence</h3>
                    <div class="intelligence-insights">
                        ${insights.map(insight => `
                            <div class="insight-card ${insight.type}">
                                <span class="insight-icon">${insight.icon}</span>
                                <span class="insight-text">${insight.text}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }
    
    // Enhanced weather display for overview
    let weatherOverviewHTML = '';
    if (hasTrip && this.state.trip.weather?.forecast && this.state.trip.weather.forecast.length > 0) {
        const weatherPreview = this.state.trip.weather.forecast.slice(0, 5);
        weatherOverviewHTML = `
            <div class="weather-overview-section">
                <h4>🌤️ Weather Forecast</h4>
                <div class="weather-cards-overview">
                    ${weatherPreview.map(day => `
                        <div class="weather-card-mini">
                            <div class="weather-date">${day.date}</div>
                            <div class="weather-icon">${day.icon}</div>
                            <div class="weather-condition">${day.condition}</div>
                            <div class="weather-temp">${day.temp}°C</div>
                            <div class="weather-range">↑${day.maxTemp}° ↓${day.minTemp}°</div>
                            ${day.chanceOfRain > 30 ? `<div class="weather-rain">☔ ${day.chanceOfRain}%</div>` : ''}
                        </div>
                    `).join('')}
                </div>
                ${this.state.trip.weather.forecast.length > 5 ? `
                    <div class="weather-more-info">
                        <p>+${this.state.trip.weather.forecast.length - 5} more days - <a href="#" onclick="window.tripMaster.navigation.switchTab('packing')">View full forecast in Packing tab</a></p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // UNIFIED MODEL: Build activities display
    let activitiesHTML = '';
    if (this.state.trip.logistics?.activities && this.state.trip.logistics.activities.length > 0) {
        activitiesHTML = `
            <div class="trip-activities">
                <strong>🎯 Activities:</strong> ${this.state.trip.logistics.activities.join(', ')}
            </div>
        `;
    }
    
    overviewSection.innerHTML = `
        <div class="overview-content">
            <div class="overview-header">
                <h2>${greeting}</h2>
                <p>${hasTrip ? `Planning your trip to ${this.state.trip.tripInfo.destination.city}, ${this.state.trip.tripInfo.destination.country}` : 'Plan your perfect trip with intelligent packing'}</p>
            </div>

            ${weatherOverviewHTML}
            
            ${hasTrip ? `
                <div class="trip-summary-card">
                    <h3>📋 Current Trip</h3>
                    <div class="trip-basic-details">
                        <p><strong>📍 Destination:</strong> ${this.state.trip.tripInfo.destination.city}, ${this.state.trip.tripInfo.destination.country}</p>
                        ${this.userProfile ? `<p><strong>🏠 From:</strong> ${this.userProfile.homeLocation.city}, ${this.userProfile.homeLocation.country}</p>` : ''}
                        <p><strong>🌙 Duration:</strong> ${this.state.trip.tripInfo.nights} nights</p>
                        <p><strong>🎯 Type:</strong> ${this.state.trip.tripInfo.tripType}</p>
                        ${activitiesHTML}
                    </div>
                </div>
                
                ${intelligenceHTML}
                
            ` : `
                <div class="getting-started-card">
                    <h3>🚀 Let's Start Planning!</h3>
                    <p>Click "Trip Setup" to begin creating your intelligent packing list</p>
                    ${!this.userProfile ? '<p>💡 Set up your profile for personalized travel intelligence!</p>' : ''}
                    <button class="btn btn-primary" onclick="window.tripMaster.navigation.switchTab('setup')">
                        🧳 Start Trip Setup
                    </button>
                </div>
            `}
        </div>
    `;
}

updateLocalInfoComponents() {
    const localInfoSection = document.getElementById('local-info-section');
    if (localInfoSection) {
        // UNIFIED MODEL: Show quick reference if available
        let quickRefHTML = '';
        if (this.state.trip.quickReference) {
            const qr = this.state.trip.quickReference;
            quickRefHTML = `
                <div class="quick-reference-preview">
                    <h3>📞 Quick Reference</h3>
                    ${qr.emergency ? `<p><strong>Emergency:</strong> ${qr.emergency.local}</p>` : ''}
                    ${qr.language?.essentialPhrases?.length > 0 ? `<p><strong>Essential Phrases:</strong> ${qr.language.essentialPhrases.length} phrases ready</p>` : ''}
                    ${qr.customs?.length > 0 ? `<p><strong>Local Customs:</strong> ${qr.customs.length} tips available</p>` : ''}
                </div>
            `;
        }
        
        localInfoSection.innerHTML = `
            <div class="container">
                <div class="content-placeholder">
                    <h2>🗺️ Local Information</h2>
                    <p>Language phrases, customs, emergency info</p>
                    ${quickRefHTML}
                    <div class="coming-soon">Full Phase 3 implementation coming soon</div>
                </div>
            </div>
        `;
    }
}

updateNavigationProgress() {
    // UNIFIED MODEL: Calculate setup progress
    const setupProgress = this.calculateSetupProgress();
    const packingProgress = this.calculatePackingProgress();
    const itineraryProgress = this.calculateItineraryProgress();
    
    this.navigation.updateProgress({
        setup: setupProgress,
        packing: packingProgress,
        itinerary: itineraryProgress,
        overall: Math.round((setupProgress * 0.3) + (packingProgress * 0.4) + (itineraryProgress * 0.3)),
        profileComplete: !!this.userProfile
    });
}

// ===== PROGRESS CALCULATION (UNIFIED MODEL) =====

calculateSetupProgress() {
    // UNIFIED MODEL: Check tripInfo structure
    const tripInfo = this.state.trip.tripInfo;
    let completed = 0;
    let total = 6;
    
    if (this.userProfile) completed++;
    if (tripInfo.destination.city) completed++;
    if (tripInfo.startDate) completed++;
    if (tripInfo.nights > 0) completed++;
    if (tripInfo.tripType) completed++;
    if (this.state.trip.logistics?.transportation?.length > 0 || this.state.trip.logistics?.accommodation?.length > 0) completed++;
    
    return Math.round((completed / total) * 100);
}

calculatePackingProgress() {
    // UNIFIED MODEL: Access packing data properly
    const packingItems = this.state.trip.packing?.items || {};
    const completedItems = this.state.trip.packing?.completedItems || [];
    
    const totalItems = Object.values(packingItems).reduce((sum, cat) => sum + Object.keys(cat).length, 0);
    
    if (totalItems === 0) return 0;
    return Math.round((completedItems.length / totalItems) * 100);
}

calculateItineraryProgress() {
    // UNIFIED MODEL: Access itinerary data properly
    if (!this.state.trip.itinerary || !this.state.trip.itinerary.days.length) return 0;
    
    const totalStops = this.state.trip.itinerary.days.reduce((sum, day) => sum + (day.stops?.length || 0), 0);
    const completedStops = this.state.trip.itinerary.progress?.completedStops?.length || 0;
    
    if (totalStops === 0) return 0;
    return Math.round((completedStops / totalStops) * 100);
}

calculateOverallProgress() {
    const setupProgress = this.calculateSetupProgress();
    const packingProgress = this.calculatePackingProgress();
    const itineraryProgress = this.calculateItineraryProgress();
    
    // Weighted average: setup 30%, packing 40%, itinerary 30%
    return Math.round((setupProgress * 0.3) + (packingProgress * 0.4) + (itineraryProgress * 0.3));
}
// ===== SECTION 4: DATA OPERATIONS (UNIFIED MODEL SAVE/LOAD/IMPORT) =====

// ===== SAVE & LOAD OPERATIONS (UNIFIED MODEL) =====

async handleSave() {
    const savedTrips = this.storage.getSavedTrips();
    
    // UNIFIED MODEL: Generate name from unified structure
    const defaultName = this.generateTripName();
    let tripName = prompt('Enter a name for this trip:', defaultName);
    
    if (!tripName) return;

    // UNIFIED MODEL: Create a clean copy without circular references
    const tripToSave = JSON.parse(JSON.stringify(this.state.trip, (key, value) => {
        // Remove ALL circular references and problematic keys
        if (key === 'currentTrip' || key === 'parentTrip' || key === 'tripReference' || 
            key === 'userProfile' || key === 'profile' || key === 'tripMaster' ||
            key === '_trip' || key === '_parent' || key === '_state') {
            return undefined;
        }
        
        // Handle DOM elements or other non-serializable objects
        if (value instanceof HTMLElement || value instanceof Window || 
            value instanceof Document || typeof value === 'function') {
            return undefined;
        }
        
        return value;
    }));

    // Add metadata separately (without circular references)
    tripToSave.meta = {
        ...tripToSave.meta,
        savedByUser: this.userProfile?.name || 'Anonymous',
        savedFromLocation: this.userProfile?.homeLocation ? {
            city: this.userProfile.homeLocation.city,
            country: this.userProfile.homeLocation.country,
            countryCode: this.userProfile.homeLocation.countryCode
        } : null,
        savedDate: new Date().toISOString(),
        version: '2.1'
    };

    // If you need to preserve user profile info, add it as a simple object
    if (this.userProfile) {
        tripToSave.savedUserProfile = {
            name: this.userProfile.name,
            homeLocation: {
                city: this.userProfile.homeLocation.city,
                country: this.userProfile.homeLocation.country,
                countryCode: this.userProfile.homeLocation.countryCode
            }
        };
    }

    const result = this.storage.saveTripToLibrary(tripName, tripToSave);
    
    if (result.success) {
        const userName = this.userProfile ? ` ${this.userProfile.name}` : '';
        this.notification.show(`💾${userName}, trip "${tripName}" saved!`, 'success');
    } else {
        this.notification.show('Failed to save trip', 'error');
    }
}

async handleLoadTrip() {
   const savedTrips = this.storage.getSavedTrips();
   const tripNames = Object.keys(savedTrips);

   if (tripNames.length === 0) {
       this.notification.show('No saved trips found', 'info');
       return;
   }

   const tripOptions = tripNames.map((name, i) => {
       const trip = savedTrips[name];
       // UNIFIED MODEL: Access location from unified structure
       const location = trip.tripInfo ? 
           `${trip.tripInfo.destination.city}, ${trip.tripInfo.destination.country}` :
           trip.location || 'Unknown'; // Fallback for old format
       return `${i + 1}. ${name} (${location})`;
   }).join('\n');

   const tripName = prompt(
       `Choose a trip to load:\n${tripOptions}\n\nEnter trip name:`
   );

   if (tripName && savedTrips[tripName]) {
       // UNIFIED MODEL: Load and ensure proper structure
       this.state.trip = this.ensureUnifiedStructure(savedTrips[tripName]);
       
       // Update profile if trip contains one
if (this.state.trip.userProfile) {
    this.userProfile = { ...this.state.trip.userProfile };  // COPY, don't reference
    this.updateNavigationWithProfile();
}
       
       // UNIFIED MODEL: Convert to simple format for TripSetup component
       this.tripSetup.loadTripData(this.convertUnifiedToSimple(this.state.trip));
       this.updateAllComponents();

       const userName = this.userProfile ? ` ${this.userProfile.name}` : '';
       this.notification.show(`📂${userName}, loaded trip "${tripName}"`, 'success');
   }
}

handleResetTrip() {
   const userName = this.userProfile ? ` ${this.userProfile.name}` : '';
   const confirmMessage = `Reset current trip${userName}? This will clear all progress but keep your profile.`;
   
   if (confirm(confirmMessage)) {
       // UNIFIED MODEL: Reset to clean unified structure
       this.state.trip = createNewTrip({
           destination: { city: '', country: '', countryCode: '' },
           nights: 5,
           tripType: 'leisure',
           startDate: ''
       });
       
       // Preserve user profile in trip
       if (this.userProfile) {
           this.state.trip.userProfile = this.userProfile;
           this.state.trip.tripInfo.origin = {
               city: this.userProfile.homeLocation.city,
               country: this.userProfile.homeLocation.country,
               countryCode: this.userProfile.homeLocation.countryCode
           };
       }

       this.tripSetup.reset();
       this.storage.clearCurrentTrip();
       this.updateAllComponents();
       this.navigation.switchTab('setup');
       
       this.notification.show(`🔄${userName}, trip reset successfully! Your profile is preserved.`, 'info');
   }
}

handleExport() {
   try {
       // UNIFIED MODEL: Export complete unified structure
       const exportData = {
           ...this.state.trip,
           meta: {
               ...this.state.trip.meta,
               exportedAt: new Date().toISOString(),
               exportedBy: this.userProfile?.name || 'Anonymous',
               version: '2.1',
               format: 'unified-trip-model'
           }
       };
       
       const dataStr = JSON.stringify(exportData, null, 2);
       const dataBlob = new Blob([dataStr], { type: 'application/json' });
       
       const fileName = this.generateExportFileName();
       
       const link = document.createElement('a');
       link.href = URL.createObjectURL(dataBlob);
       link.download = fileName;
       link.click();
       
       const userName = this.userProfile ? ` ${this.userProfile.name}` : '';
       this.notification.show(`📤${userName}, trip exported as ${fileName}`, 'success');
       
   } catch (error) {
       console.error('Export failed:', error);
       this.notification.show('Export failed. Please try again.', 'error');
   }
}

// ===== ITEM HANDLING METHODS (UNIFIED MODEL) =====

handleItemToggle(category, itemKey) {
   // UNIFIED MODEL: Store completion in packing structure
   const itemId = `${category}.${itemKey}`;
   
   if (!this.state.trip.packing.completedItems) {
       this.state.trip.packing.completedItems = [];
   }
   
   const isCompleted = this.state.trip.packing.completedItems.includes(itemId);
   
   if (isCompleted) {
       this.state.trip.packing.completedItems = this.state.trip.packing.completedItems.filter(id => id !== itemId);
   } else {
       this.state.trip.packing.completedItems.push(itemId);
   }
   
   // Update packing progress in unified model
   this.updatePackingProgress();
   
   this.storage.saveTrip(this.state.trip);
   this.updateProgressComponents();
   this.updateNavigationProgress();
   this.state.hasUnsavedChanges = false;
   
   if (!isCompleted && this.userProfile) {
       const completionPercentage = this.calculatePackingProgress();
       if (completionPercentage === 50) {
           this.notification.show(`🎉 ${this.userProfile.name}, you're halfway packed!`, 'success', 2000);
       } else if (completionPercentage === 100) {
           this.notification.show(`🏆 ${this.userProfile.name}, packing complete! Ready for your trip!`, 'success', 4000);
       }
   }
}

handleItemAdd(category, item, quantity = 1) {
   // UNIFIED MODEL: Add to packing.items
   if (!this.state.trip.packing.items[category]) {
       this.state.trip.packing.items[category] = {};
   }
   
   this.state.trip.packing.items[category][item] = { 
       quantity,
       essential: false,
       completed: false,
       custom: true,
       notes: 'Custom item added by user'
   };
   
   this.storage.saveTrip(this.state.trip);
   this.updatePackingComponents();
   this.state.hasUnsavedChanges = false;
   
   const userName = this.userProfile ? ` ${this.userProfile.name}` : '';
   this.notification.show(`➕${userName}, added "${item}" to ${category}`, 'success');
}

handleNoteUpdate(category, itemKey, note) {
   // UNIFIED MODEL: Update notes in packing.items
   if (!this.state.trip.packing.items[category] || !this.state.trip.packing.items[category][itemKey]) return;
   
   this.state.trip.packing.items[category][itemKey].notes = note;
   this.storage.saveTrip(this.state.trip);
   this.state.hasUnsavedChanges = false;
   
   this.notification.show('📝 Note updated', 'info');
}

// ===== ITINERARY HANDLING (UNIFIED MODEL) =====

handleStopToggle(stopId, completed) {
   // UNIFIED MODEL: Update itinerary progress
   if (!this.state.trip.itinerary.progress) {
       this.state.trip.itinerary.progress = {
           completedStops: [],
           personalNotes: {},
           lastVisited: null
       };
   }
   
   if (!this.state.trip.itinerary.progress.completedStops) {
       this.state.trip.itinerary.progress.completedStops = [];
   }
   
   const isCompleted = this.state.trip.itinerary.progress.completedStops.includes(stopId);
   
   if (completed && !isCompleted) {
       this.state.trip.itinerary.progress.completedStops.push(stopId);
   } else if (!completed && isCompleted) {
       this.state.trip.itinerary.progress.completedStops = 
           this.state.trip.itinerary.progress.completedStops.filter(id => id !== stopId);
   }
   
   // Update last visited
   this.state.trip.itinerary.progress.lastVisited = new Date().toISOString();
   
   this.storage.saveTrip(this.state.trip);
   this.updateProgressComponents();
   this.updateNavigationProgress();
   
   if (completed && this.userProfile) {
       const completionPercentage = this.calculateItineraryProgress();
       if (completionPercentage === 100) {
           this.notification.show(`🎯 ${this.userProfile.name}, itinerary complete! Amazing trip!`, 'success', 4000);
       }
   }
}

handleItineraryNoteUpdate(stopId, note) {
   // UNIFIED MODEL: Update personal notes in itinerary
   if (!this.state.trip.itinerary.progress) {
       this.state.trip.itinerary.progress = {
           completedStops: [],
           personalNotes: {},
           lastVisited: null
       };
   }
   
   if (!this.state.trip.itinerary.progress.personalNotes) {
       this.state.trip.itinerary.progress.personalNotes = {};
   }
   
   this.state.trip.itinerary.progress.personalNotes[stopId] = {
       text: note,
       timestamp: new Date().toISOString()
   };
   
   this.storage.saveTrip(this.state.trip);
   this.state.hasUnsavedChanges = false;
   
   this.notification.show('📝 Itinerary note updated', 'info');
}

// ===== ACTIVITY SYNC (UNIFIED MODEL) =====

handleActivitySync(stopId, activities) {
   let addedItems = 0;
   
   const userName = this.userProfile ? ` ${this.userProfile.name}` : '';
   
   activities.forEach(activity => {
       const activityLower = activity.toLowerCase();
       
       if (activityLower.includes('session') || activityLower.includes('meeting') || 
           activityLower.includes('presentation') || activityLower.includes('showcase')) {
           this.addPackingItemsFromActivity(['business_items.business_cards', 'business_items.notebook', 'clothes.dress_shirt']);
           addedItems += 3;
       }
       
       if (activityLower.includes('dinner') || activityLower.includes('restaurant') || 
           activityLower.includes('dining')) {
           this.addPackingItemsFromActivity(['clothes.nice_shoes', 'clothes.dress_pants']);
           addedItems += 2;
       }
       
       if (activityLower.includes('walking') || activityLower.includes('tour') || 
           activityLower.includes('exploration') || activityLower.includes('stroll')) {
           this.addPackingItemsFromActivity(['clothes.comfortable_shoes', 'travel_essentials.water_bottle']);
           addedItems += 2;
       }
       
       if (activityLower.includes('museum') || activityLower.includes('cultural') || 
           activityLower.includes('historic')) {
           this.addPackingItemsFromActivity(['electronics.camera', 'travel_essentials.guidebook']);
           addedItems += 2;
       }
       
       if (activityLower.includes('beach') || activityLower.includes('swimming') || 
           activityLower.includes('water')) {
           this.addPackingItemsFromActivity(['beach_gear.swimwear', 'beach_gear.beach_towel', 'beach_gear.sunscreen']);
           addedItems += 3;
       }
       
       if (activityLower.includes('hiking') || activityLower.includes('outdoor') || 
           activityLower.includes('nature')) {
           this.addPackingItemsFromActivity(['hiking_gear.hiking_boots', 'hiking_gear.backpack', 'hiking_gear.water_bottle']);
           addedItems += 3;
       }
       
       if (activityLower.includes('photo') || activityLower.includes('picture') || 
           activityLower.includes('scenic')) {
           this.addPackingItemsFromActivity(['photography_gear.camera', 'photography_gear.extra_batteries', 'photography_gear.memory_cards']);
           addedItems += 3;
       }
   });
   
   if (addedItems > 0) {
       this.updatePackingComponents();
       this.storage.saveTrip(this.state.trip);
       this.notification.show(`🧳${userName}, added ${addedItems} items to packing list based on activities!`, 'success');
   } else {
       this.notification.show('No new packing items needed for these activities', 'info');
   }
}

addPackingItemsFromActivity(itemPaths) {
   itemPaths.forEach(path => {
       const [category, itemKey] = path.split('.');
       
       // UNIFIED MODEL: Add to packing.items
       if (!this.state.trip.packing.items[category]) {
           this.state.trip.packing.items[category] = {};
       }
       
       if (!this.state.trip.packing.items[category][itemKey]) {
           this.state.trip.packing.items[category][itemKey] = { 
               quantity: 1, 
               essential: false,
               completed: false,
               addedFromActivity: true,
               notes: 'Added from itinerary activity'
           };
       }
   });
}

// ===== IMPORT ITINERARY (UNIFIED MODEL) =====

async handleImportItinerary(itineraryData) {
   try {
       if (!itineraryData.days || !Array.isArray(itineraryData.days)) {
           throw new Error('Invalid itinerary format - missing days array');
       }
       
       // UNIFIED MODEL: Store in unified structure
       this.state.trip.itinerary = {
           days: itineraryData.days,
           progress: this.state.trip.itinerary.progress || {
               completedStops: [],
               personalNotes: {},
               lastVisited: null
           },
           meta: {
               importedDate: new Date().toISOString(),
               source: 'user-import',
               totalDays: itineraryData.days.length,
               totalStops: itineraryData.days.reduce((sum, day) => sum + day.stops.length, 0)
           }
       };
       
       this.updateItineraryComponents();
       this.updateNavigationProgress();
       
       this.storage.saveTrip(this.state.trip);
       
       const totalStops = itineraryData.days.reduce((sum, day) => sum + day.stops.length, 0);
       
       if (this.userProfile) {
           this.notification.show(`📅 ${this.userProfile.name}, imported itinerary with ${itineraryData.days.length} days and ${totalStops} stops!`, 'success');
       } else {
           this.notification.show(`📅 Imported itinerary with ${itineraryData.days.length} days and ${totalStops} stops!`, 'success');
       }
       
       setTimeout(() => {
           this.navigation.switchTab('itinerary');
       }, 2000);
       
   } catch (error) {
       console.error('Failed to import itinerary:', error);
       this.notification.show('Failed to import itinerary. Please check the file format.', 'error');
   }
}

async handleFileUpload(event) {
   const file = event.target.files[0];
   if (!file) return;

   try {
       this.setLoading(true);
       this.notification.show('📁 Processing file...', 'info', 1500);
       
       const text = await file.text();
       const itineraryData = JSON.parse(text);
       
       await this.handleImportItinerary(itineraryData);
       
   } catch (error) {
       console.error('File upload failed:', error);
       this.notification.show('Failed to load itinerary file. Please check the format.', 'error');
   } finally {
       this.setLoading(false);
   }
}

async loadSampleItinerary() {
   try {
       if (this.userProfile) {
           this.notification.show(`📅 ${this.userProfile.name}, loading sample Athens itinerary...`, 'info', 2000);
       } else {
           this.notification.show('📅 Loading sample Athens itinerary...', 'info', 2000);
       }
       
       const response = await fetch('./itinerary-data.json');
       if (!response.ok) {
           throw new Error('Could not load sample itinerary');
       }
       
       const itineraryData = await response.json();
       
       await this.handleImportItinerary(itineraryData);
       
   } catch (error) {
       console.error('Failed to load sample itinerary:', error);
       this.notification.show('Sample itinerary not available. Please import your own.', 'error');
   }
}

// ===== UNIFIED MODEL HELPER METHODS =====

ensureUnifiedStructure(tripData) {
   // Convert old format to unified model if needed
   if (tripData.tripInfo) {
       // Already unified format
       return tripData;
   }
   
   // Convert old simple format to unified
   const unifiedTrip = createNewTrip();
   
   // Map old fields to unified structure
   if (tripData.location) {
       const parts = tripData.location.split(',').map(s => s.trim());
       unifiedTrip.tripInfo.destination.city = parts[0] || '';
       unifiedTrip.tripInfo.destination.country = parts[1] || '';
   }
   
   unifiedTrip.tripInfo.nights = tripData.nights || 5;
   unifiedTrip.tripInfo.tripType = tripData.tripType || 'leisure';
   unifiedTrip.tripInfo.startDate = tripData.startDate || '';
   
   if (tripData.items) {
       unifiedTrip.packing.items = tripData.items;
   }
   
   if (tripData.completedItems) {
       unifiedTrip.packing.completedItems = tripData.completedItems;
   }
   
   if (tripData.weather) {
       unifiedTrip.weather.forecast = tripData.weather;
   }
   
   if (tripData.itinerary) {
       unifiedTrip.itinerary = tripData.itinerary;
   }
   
   return unifiedTrip;
}

convertUnifiedToSimple(unifiedTrip) {
   // Convert unified model to simple format for components that expect it
   return {
       location: unifiedTrip.tripInfo.destination.city && unifiedTrip.tripInfo.destination.country ? 
           `${unifiedTrip.tripInfo.destination.city}, ${unifiedTrip.tripInfo.destination.country}` : '',
       nights: unifiedTrip.tripInfo.nights,
       tripType: unifiedTrip.tripInfo.tripType,
       startDate: unifiedTrip.tripInfo.startDate,
       transportation: unifiedTrip.logistics?.transportation || [],
       accommodation: unifiedTrip.logistics?.accommodation || [],
       activities: unifiedTrip.logistics?.activities || [],
       notes: unifiedTrip.tripInfo.notes || '',
       userProfile: unifiedTrip.userProfile,
       homeLocation: unifiedTrip.userProfile ? 
           `${unifiedTrip.userProfile.homeLocation.city}, ${unifiedTrip.userProfile.homeLocation.country}` : null
   };
}

updatePackingProgress() {
   // Update packing progress metadata in unified model
   const packingItems = this.state.trip.packing?.items || {};
   const completedItems = this.state.trip.packing?.completedItems || [];
   
   const totalItems = Object.values(packingItems).reduce((sum, cat) => sum + Object.keys(cat).length, 0);
   const percentage = totalItems > 0 ? Math.round((completedItems.length / totalItems) * 100) : 0;
   
   this.state.trip.packing.progress = {
       totalItems,
       completedItems: completedItems.length,
       percentage,
       lastUpdated: new Date().toISOString()
   };
}


// ===== UTILITY METHODS (UNIFIED MODEL) =====

generateTripName() {
   const parts = [];
   
   // UNIFIED MODEL: Access destination properly
   if (this.userProfile && this.state.trip.tripInfo.destination.city) {
       const homeCity = this.userProfile.homeLocation.city;
       const destCity = this.state.trip.tripInfo.destination.city;
       parts.push(`${homeCity} → ${destCity}`);
   } else if (this.state.trip.tripInfo.destination.city) {
       parts.push(`${this.state.trip.tripInfo.destination.city}, ${this.state.trip.tripInfo.destination.country}`);
   }
   
   if (this.state.trip.tripInfo.tripType && this.state.trip.tripInfo.tripType !== 'leisure') {
       parts.push(this.state.trip.tripInfo.tripType);
   }
   
   const date = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
   parts.push(date);
   
   return parts.join(' - ');
}

generateExportFileName() {
   const parts = ['tripmaster'];
   
   // UNIFIED MODEL: Generate filename from unified structure
   if (this.userProfile && this.state.trip.tripInfo.destination.city) {
       const originCity = this.userProfile.homeLocation.city.replace(/\s+/g, '-').toLowerCase();
       const destCity = this.state.trip.tripInfo.destination.city.replace(/\s+/g, '-').toLowerCase();
       parts.push(`${originCity}-to-${destCity}`);
   } else if (this.state.trip.tripInfo.destination.city) {
       parts.push(this.state.trip.tripInfo.destination.city.replace(/\s+/g, '-').toLowerCase());
   }
   
   const date = new Date().toISOString().split('T')[0];
   parts.push(date);
   
   return parts.join('-') + '.json';
}

setLoading(isLoading) {
   this.state.isLoading = isLoading;
   const overlay = document.getElementById('loading-overlay');
   if (overlay) {
       overlay.classList.toggle('hidden', !isLoading);
   }
}

// ===== EVENT BINDING =====

bindEvents() {
   // Basic keyboard shortcuts
   document.addEventListener('keydown', (e) => {
       if ((e.ctrlKey || e.metaKey) && e.key === 's') {
           e.preventDefault();
           this.handleSave();
       }
       
       if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
           e.preventDefault();
           this.handleExport();
       }
       
       // Ctrl+Shift+R for emergency reset
       if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
           e.preventDefault();
           this.emergencyReset();
       }
       
       // Ctrl+I for import itinerary
       if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
           e.preventDefault();
           document.getElementById('itinerary-file-import')?.click();
       }
       
       // Tab navigation with Ctrl+1-5
       if ((e.ctrlKey || e.metaKey) && ['1', '2', '3', '4', '5'].includes(e.key)) {
           e.preventDefault();
           const tabMap = {
               '1': 'overview',
               '2': 'setup',
               '3': 'itinerary',
               '4': 'packing',
               '5': 'local-info'
           };
           this.navigation.switchTab(tabMap[e.key]);
       }
   });

   // Drag and drop for files
   ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
       document.addEventListener(eventName, this.preventDefaults, false);
   });

   document.addEventListener('drop', (e) => {
       const dt = e.dataTransfer;
       const files = dt.files;

       if (files.length > 0) {
           const file = files[0];
           if (file.name.endsWith('.json')) {
               this.handleFileUpload({ target: { files: [file] } });
           } else {
               this.notification.show('Please drop a JSON file', 'error');
           }
       }
   }, false);

   console.log('✅ Events bound');
}

preventDefaults(e) {
   e.preventDefault();
   e.stopPropagation();
}

// ===== ENHANCED AUTO-SAVE SYSTEM (UNIFIED MODEL) =====

setupEnhancedAutoSave() {
   let autoSaveTimeout;
   let lastSaveTime = Date.now();
   
   const triggerAutoSave = (source = 'unknown') => {
       clearTimeout(autoSaveTimeout);
       
       autoSaveTimeout = setTimeout(() => {
           // UNIFIED MODEL: Check if trip has meaningful data
           const hasData = this.state.trip.tripInfo.destination.city || 
                          Object.keys(this.state.trip.packing?.items || {}).length > 0 ||
                          (this.state.trip.itinerary?.days?.length || 0) > 0;
           
           if (hasData) {
               try {
                   // UNIFIED MODEL: Update metadata before saving
                   this.state.trip.meta = {
                       ...this.state.trip.meta,
                       lastModified: new Date().toISOString(),
                       autoSaveSource: source,
                       version: '2.1'
                   };
                   
                   this.storage.saveTrip(this.state.trip);
                   lastSaveTime = Date.now();
                   
                   console.log(`💾 Auto-saved (${source}) at ${new Date().toLocaleTimeString()}`);
                   
                   // Update document title
                   const location = this.state.trip.tripInfo.destination.city ? 
                       `${this.state.trip.tripInfo.destination.city}, ${this.state.trip.tripInfo.destination.country}` : 
                       'Trip Planning';
                   document.title = `🧳 TripMaster - ${location} (Saved)`;
                   
               } catch (error) {
                   console.error('❌ Auto-save failed:', error);
                   this.handleStorageError(error);
               }
           }
       }, 2000);
   };
   
   // Enhanced change detection for unified model
   const changeEvents = ['input', 'change', 'click'];
   const targetSelectors = [
       '.trip-setup', 
       '.checklist-display', 
       '.itinerary-display', 
       '.item-checkbox', 
       '.completion-checkbox',
       '.personal-note-input'
   ];
   
   changeEvents.forEach(eventType => {
       document.addEventListener(eventType, (e) => {
           if (targetSelectors.some(selector => e.target.closest(selector))) {
               this.state.hasUnsavedChanges = true;
               triggerAutoSave(eventType);
           }
       });
   });
   
   // Auto-save before page unload
   window.addEventListener('beforeunload', (e) => {
       if (this.state.hasUnsavedChanges) {
           try {
               this.storage.saveTrip(this.state.trip);
               console.log('💾 Final save before page unload');
           } catch (error) {
               console.error('❌ Failed to save before unload:', error);
           }
       }
   });
   
   // Smart conflict detection for multi-tab usage
   document.addEventListener('visibilitychange', () => {
       if (!document.hidden) {
           this.checkForConflicts();
       }
   });
   
   console.log('✅ Enhanced auto-save system initialized');
}

checkForConflicts() {
   try {
       const currentSaved = this.storage.getCurrentTrip();
       if (currentSaved && currentSaved.meta && currentSaved.meta.lastModified) {
           const savedTime = new Date(currentSaved.meta.lastModified).getTime();
           const localTime = this.state.trip.meta?.lastModified ? 
               new Date(this.state.trip.meta.lastModified).getTime() : 0;
           
           if (savedTime > localTime + 5000) { // 5 second buffer
               const userName = this.userProfile ? ` ${this.userProfile.name}` : '';
               
               if (confirm(`${userName}, trip was modified in another tab. Load the latest changes?`)) {
                   this.state.trip = this.ensureUnifiedStructure(currentSaved);
                   this.updateAllComponents();
                   this.notification.show('🔄 Synced with latest changes', 'info', 2000);
               } else {
                   // User chose to keep local changes, force save
                   this.storage.saveTrip(this.state.trip);
                   this.notification.show('💾 Kept your local changes', 'info', 2000);
               }
           }
       }
   } catch (error) {
       console.error('Conflict check failed:', error);
   }
}

// ===== ERROR HANDLING & RECOVERY =====

handleStorageError(error) {
   console.error('Storage error:', error);
   
   if (error.name === 'QuotaExceededError') {
       this.notification.show('Storage full - cleaning up old data...', 'warning', 3000);
       
       try {
           this.storage.cleanupOldData(30);
           this.storage.clearCache();
           this.notification.show('Storage cleaned up successfully', 'success');
       } catch (cleanupError) {
           console.error('Cleanup failed:', cleanupError);
           this.notification.show('Storage cleanup failed - please refresh the page', 'error');
       }
   } else {
       this.notification.show('Storage error occurred - some features may not work properly', 'error');
   }
}

emergencyReset() {
   const userName = this.userProfile ? ` ${this.userProfile.name}` : '';
   
   if (confirm(`Emergency reset${userName}? This will clear ALL data but attempt to preserve your profile.`)) {
       try {
           const profileBackup = this.userProfile;
           
           // Clear all storage keys
           ['tripmaster-current-trip', 'tripmaster-saved-trips', 'tripmaster-cache', 'tripmaster-itinerary-progress'].forEach(key => {
               try {
                   localStorage.removeItem(key);
               } catch (e) {
                   console.warn(`Failed to clear ${key}:`, e);
               }
           });
           
           // Restore profile if we had one
           if (profileBackup) {
               this.storage.saveUserProfile(profileBackup);
               this.userProfile = profileBackup;
           }
           
           // UNIFIED MODEL: Reset to clean unified structure
           this.state.trip = createNewTrip();
           if (this.userProfile) {
               this.state.trip.userProfile = this.userProfile;
               this.state.trip.tripInfo.origin = {
                   city: this.userProfile.homeLocation.city,
                   country: this.userProfile.homeLocation.country,
                   countryCode: this.userProfile.homeLocation.countryCode
               };
           }
           
           this.updateAllComponents();
           this.navigation.switchTab('overview');
           
           this.notification.show(`🔄 Emergency reset complete${userName}`, 'success');
           
       } catch (resetError) {
           console.error('Emergency reset failed:', resetError);
           this.notification.show('Emergency reset failed - please refresh the page', 'error');
       }
   }
}

// ===== LOAD SAVED STATE (UNIFIED MODEL) =====

async loadSavedState() {
   console.log('🔄 Loading saved state with unified model...');
   
   try {
       const savedTrip = this.storage.getCurrentTrip();
       
       if (savedTrip) {
           console.log('📂 Found saved trip data');
           
           // UNIFIED MODEL: Ensure proper structure
           this.state.trip = this.ensureUnifiedStructure(savedTrip);
           
           // Restore user profile if not already loaded
           if (!this.userProfile && this.state.trip.userProfile) {
               this.userProfile = this.state.trip.userProfile;
               this.updateNavigationWithProfile();
           }
           
           // Update trip setup component with converted simple format
           if (this.tripSetup && this.tripSetup.loadTripData) {
               console.log('📝 Restoring trip setup form...');
               this.tripSetup.loadTripData(this.convertUnifiedToSimple(this.state.trip));
           }
           
           // Restore weather display
           if (this.state.trip.weather?.forecast && this.state.trip.weather.forecast.length > 0) {
               console.log('🌤️ Restoring weather data...');
               this.weatherDisplay.displayWeather(this.state.trip.weather.forecast);
           }
           
           this.updateAllComponents();
           
           // Show welcome back message
           setTimeout(() => {
               const location = `${this.state.trip.tripInfo.destination.city}, ${this.state.trip.tripInfo.destination.country}`;
               if (this.userProfile) {
                   this.notification.show(`👋 Welcome back ${this.userProfile.name}! Restored your trip to ${location}`, 'success', 3000);
               } else {
                   this.notification.show(`👋 Welcome back! Restored your trip to ${location}`, 'success', 3000);
               }
           }, 1000);
           
           this.determineInitialTab();
           
       } else {
           console.log('📭 No saved trip found');
           this.showInitialTab();
       }
       
   } catch (error) {
       console.error('❌ Failed to load saved state:', error);
       this.notification.show('Failed to restore previous data. Starting fresh.', 'warning', 3000);
       this.showInitialTab();
   }
}

determineInitialTab() {
   // UNIFIED MODEL: Determine best tab based on unified structure
   const hasBasicTrip = this.state.trip.tripInfo.destination.city && this.state.trip.tripInfo.nights;
   const hasPackingList = this.state.trip.packing?.items && Object.keys(this.state.trip.packing.items).length > 0;
   const hasItinerary = this.state.trip.itinerary?.days && this.state.trip.itinerary.days.length > 0;
   
   if (hasItinerary) {
       setTimeout(() => this.navigation.switchTab('itinerary'), 500);
   } else if (hasPackingList) {
       setTimeout(() => this.navigation.switchTab('packing'), 500);
   } else if (hasBasicTrip) {
       setTimeout(() => this.navigation.switchTab('setup'), 500);
   } else {
       this.navigation.switchTab('overview');
   }
}
}

function safeStringify(obj, space = null) {
  const seen = new WeakSet();

  return JSON.stringify(obj, (key, value) => {
    // Skip known circular reference keys
    const skipKeys = [
      'currentTrip', 'parentTrip', 'tripReference',
      'userProfile', 'profile', 'trip', 'tripInfo',
      'travelIntelligence', 'weather', 'items',
      'transportation', 'accommodation', 'quickReference',
      'logistics', 'offline', 'completedItems'
    ];

    if (skipKeys.includes(key)) {
      return undefined;
    }

    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular Reference]';
      seen.add(value);
    }

    return value;
  }, space);
}

// Override JSON.stringify globally for this app
const originalStringify = JSON.stringify;
JSON.stringify = function(value, replacer, space) {
    if (arguments.length === 1 || (arguments.length === 2 && replacer === null)) {
        return safeStringify(value, space);
    }
    return originalStringify.apply(this, arguments);
};

// ===== INITIALIZATION & ERROR HANDLING =====

document.addEventListener('DOMContentLoaded', async () => {
   console.log('🌐 DOM loaded, initializing TripMaster with unified model...');
   
   try {
       const tripMaster = new TripMaster();
       
       // Make global methods available
       window.tripMaster = tripMaster;
       window.loadSampleItinerary = () => tripMaster.loadSampleItinerary();
       window.handleImportItinerary = (data) => tripMaster.handleImportItinerary(data);
       
       console.log('✅ TripMaster successfully created and attached to window');
       
       // Enhanced debugging tools for unified model
       window.debugTripMaster = {
           state: () => tripMaster.state,
           trip: () => tripMaster.state.trip,
           profile: () => tripMaster.userProfile,
           storage: () => tripMaster.storage.getStorageInfo(),
           health: () => tripMaster.storage.getStorageHealth(),
           unified: () => ({
               tripInfo: tripMaster.state.trip.tripInfo,
               packing: tripMaster.state.trip.packing,
               itinerary: tripMaster.state.trip.itinerary,
               travelIntelligence: tripMaster.state.trip.travelIntelligence
           }),
           components: () => ({
               navigation: !!tripMaster.navigation,
               tripSetup: !!tripMaster.tripSetup,
               checklistDisplay: !!tripMaster.checklistDisplay,
               itineraryDisplay: !!tripMaster.itineraryDisplay,
               storage: !!tripMaster.storage,
               listGenerator: !!tripMaster.listGenerator,
               locationService: !!tripMaster.locationService
           }),
           emergencyReset: () => tripMaster.emergencyReset(),
           forceSetupTab: () => {
               tripMaster.navigation.switchTab('setup');
               tripMaster.ensureSetupTabVisible();
           },
           testUnifiedModel: () => {
               console.log('=== UNIFIED MODEL TEST ===');
               console.log('Trip Info:', tripMaster.state.trip.tripInfo);
               console.log('Packing:', tripMaster.state.trip.packing);
               console.log('Itinerary:', tripMaster.state.trip.itinerary);
               console.log('Travel Intelligence:', tripMaster.state.trip.travelIntelligence);
               console.log('Quick Reference:', tripMaster.state.trip.quickReference);
               console.log('User Profile:', tripMaster.state.trip.userProfile);
           }
       };
       
       // Show welcome message if profile exists
       if (tripMaster.userProfile) {
           setTimeout(() => {
               tripMaster.notification.show(`🎉 Welcome back ${tripMaster.userProfile.name}! TripMaster unified model is ready.`, 'success', 3000);
           }, 1500);
       }
       
   } catch (error) {
       console.error('❌ TripMaster initialization failed:', error);
       
       // Enhanced error display with recovery options
       const errorDiv = document.createElement('div');
       errorDiv.style.cssText = `
           position: fixed; top: 20px; right: 20px; 
           background: #f44336; color: white; 
           padding: 20px; border-radius: 12px; 
           z-index: 1000; max-width: 350px;
           box-shadow: 0 8px 24px rgba(0,0,0,0.3);
           font-family: system-ui, -apple-system, sans-serif;
       `;
       errorDiv.innerHTML = `
           <h4 style="margin: 0 0 12px 0; font-size: 18px;">🚨 TripMaster Failed to Load</h4>
           <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.4;">
               The app encountered an error during startup. This may be due to corrupted data or browser storage issues.
           </p>
           <div style="display: flex; gap: 10px; flex-wrap: wrap;">
               <button onclick="location.reload()" 
                       style="background: white; color: #f44336; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">
                   🔄 Refresh Page
               </button>
               <button onclick="localStorage.clear(); location.reload()" 
                       style="background: rgba(255,255,255,0.2); color: white; border: 1px solid white; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                   🗑️ Clear Data & Restart
               </button>
           </div>
           <p style="margin: 15px 0 0 0; font-size: 12px; opacity: 0.9;">
               Error: ${error.message}
           </p>
       `;
       document.body.appendChild(errorDiv);
       
       // Auto-remove error after 20 seconds
       setTimeout(() => {
           if (errorDiv.parentNode) {
               errorDiv.remove();
           }
       }, 20000);
   }
});

// ===== ENHANCED ERROR HANDLING =====

window.addEventListener('error', (event) => {
   console.error('TripMaster runtime error:', event.error);
   
   const userProfile = window.tripMaster?.userProfile;
   const context = userProfile ? ` (User: ${userProfile.name})` : '';
   
   const errorContext = {
       message: event.message,
       filename: event.filename,
       lineno: event.lineno,
       colno: event.colno,
       userProfile: userProfile?.name || 'Anonymous',
       currentTab: window.tripMaster?.state?.activeTab || 'unknown',
       hasTrip: !!(window.tripMaster?.state?.trip?.tripInfo?.destination?.city),
       unifiedModelVersion: window.tripMaster?.state?.trip?.meta?.version || 'unknown',
       timestamp: new Date().toISOString()
   };
   
   console.error(`Error context${context}:`, errorContext);
   
   // Handle specific error types
   if (event.message.includes('storage') || event.message.includes('localStorage')) {
       console.warn('Storage error detected - attempting recovery');
       if (window.tripMaster) {
           window.tripMaster.handleStorageError(event.error);
       }
   }
   
   if (event.message.includes('unified') || event.message.includes('tripInfo')) {
       console.warn('Unified model error detected');
       if (window.tripMaster) {
           window.tripMaster.notification.show('Data structure error - some features may not work properly', 'warning', 4000);
       }
   }
});

window.addEventListener('unhandledrejection', (event) => {
   console.error('TripMaster unhandled promise rejection:', event.reason);
   
   const userProfile = window.tripMaster?.userProfile;
   const context = userProfile ? ` (User: ${userProfile.name})` : '';
   
   const rejectionContext = {
       reason: event.reason?.toString() || 'Unknown',
       stack: event.reason?.stack || 'No stack trace',
       userProfile: userProfile?.name || 'Anonymous',
       currentOperation: window.tripMaster?.state?.isLoading ? 'loading' : 'idle',
       unifiedModelState: window.tripMaster?.state?.trip ? 'present' : 'missing',
       timestamp: new Date().toISOString()
   };
   
   console.error(`Promise rejection context${context}:`, rejectionContext);
   
   // Handle specific rejection types
   if (event.reason && event.reason.toString().includes('fetch')) {
       console.warn('Network error detected - user will be notified');
       if (window.tripMaster && window.tripMaster.notification) {
           window.tripMaster.notification.show('Network error - some features may not work', 'warning', 3000);
       }
   }
   
   if (event.reason && event.reason.toString().includes('JSON')) {
       console.warn('Data parsing error detected');
       if (window.tripMaster && window.tripMaster.notification) {
           window.tripMaster.notification.show('Data format error - please check imported files', 'error', 4000);
       }
   }
});

// ===== VISIBILITY CHANGE HANDLING =====

document.addEventListener('visibilitychange', () => {
   if (!document.hidden && window.tripMaster) {
       console.log('Page visible - checking for unified model updates');
       
       try {
           const currentTrip = window.tripMaster.storage.getCurrentTrip();
           if (currentTrip && currentTrip.meta && currentTrip.meta.lastModified) {
               const lastModified = new Date(currentTrip.meta.lastModified).getTime();
               const currentLastModified = window.tripMaster.state.trip.meta?.lastModified ? 
                   new Date(window.tripMaster.state.trip.meta.lastModified).getTime() : 0;
               
               if (lastModified > currentLastModified + 2000) { // 2 second buffer
                   console.log('Trip updated in another tab - syncing unified model');
                   window.tripMaster.state.trip = window.tripMaster.ensureUnifiedStructure(currentTrip);
                   window.tripMaster.updateAllComponents();
                   
                   if (window.tripMaster.userProfile) {
                       window.tripMaster.notification.show(
                           `🔄 ${window.tripMaster.userProfile.name}, synced updates from another tab`, 
                           'info', 
                           2000
                       );
                   }
               }
           }
       } catch (error) {
           console.error('Failed to sync updates from other tabs:', error);
       }
   }
});

// ===== PERFORMANCE MONITORING =====

if (typeof performance !== 'undefined' && performance.mark) {
   // Mark initialization milestones
   performance.mark('tripmaster-dom-ready');
   
   window.addEventListener('load', () => {
       performance.mark('tripmaster-fully-loaded');
       
       // Log performance metrics
       setTimeout(() => {
           const navigation = performance.getEntriesByType('navigation')[0];
           const loadTime = navigation.loadEventEnd - navigation.fetchStart;
           
           console.log(`⚡ TripMaster loaded in ${loadTime}ms`);
           
           if (window.tripMaster) {
               const tripData = window.tripMaster.state.trip;
               const hasData = tripData.tripInfo.destination.city || 
                              Object.keys(tripData.packing?.items || {}).length > 0;
               
               console.log(`📊 App state: ${hasData ? 'with data' : 'empty'}, Unified model: ${tripData.meta?.version || 'unknown'}`);
           }
       }, 1000);
   });
}

// Export for potential module usage
export default TripMaster;
