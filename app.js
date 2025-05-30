// app.js - TripMaster Complete Implementation
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
import { createNewTrip } from './data/unified-data-model.js';

class TripMaster {
    constructor() {
        console.log('🚀 TripMaster initializing...');
        
        // Core state
        this.state = {
            trip: {
                location: '',
                nights: 5,
                tripType: 'leisure',
                startDate: '',
                transportation: [],
                accommodation: [],
                items: {},
                completedItems: [],
                userProfile: null,
                homeLocation: null,
                weather: null,
                itinerary: { days: [], progress: {} }
            },
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
            
            console.log('✅ TripMaster initialized successfully');
        } catch (error) {
            console.error('❌ TripMaster initialization failed:', error);
        }
    }

    // ===== USER PROFILE INITIALIZATION =====
    
    initializeUserProfile() {
        try {
            this.userProfile = this.storage.getUserProfile();
            
            if (this.userProfile) {
                console.log(`👤 Welcome back ${this.userProfile.name}!`);
                this.state.trip.userProfile = this.userProfile;
                this.state.trip.homeLocation = `${this.userProfile.homeLocation.city}, ${this.userProfile.homeLocation.country}`;
                this.state.profileSetupComplete = true;
            } else {
                console.log('👤 No user profile found - will show setup');
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

    console.log('🔧 About to create ChecklistDisplay...');
try {
    this.checklistDisplay = new ChecklistDisplay({
        container: document.getElementById('checklist-display-section'),
        onItemToggle: (category, item) => this.handleItemToggle(category, item),
        onItemAdd: (category, item, quantity) => this.handleItemAdd(category, item, quantity),
        onNoteUpdate: (category, item, note) => this.handleNoteUpdate(category, item, note)
    });
  console.log('ChecklistDisplay prototype:', Object.getOwnPropertyNames(ChecklistDisplay.prototype));
console.log('Instance methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.checklistDisplay)));
} catch (error) {
    console.error('❌ ChecklistDisplay creation FAILED:', error);
    console.error('Error details:', error.stack);
}
            // PUT THE DEBUG CODE RIGHT HERE - AFTER THE CHECKLIST CREATION:
    console.log('ChecklistDisplay created:', this.checklistDisplay);
    console.log('ChecklistDisplay methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.checklistDisplay)));
    console.log('Has loadItems?', typeof this.checklistDisplay.loadItems);
    console.log('Has render?', typeof this.checklistDisplay.render);

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
        
        // CRITICAL: Make itineraryDisplay available globally
        window.itineraryDisplay = this.itineraryDisplay;
        console.log('DEBUG: ChecklistDisplay object:', this.checklistDisplay);
        console.log('DEBUG: ChecklistDisplay constructor:', ChecklistDisplay);
        console.log('DEBUG: ChecklistDisplay prototype methods:', Object.getOwnPropertyNames(ChecklistDisplay.prototype));
        console.log('DEBUG: Has loadItems?', typeof this.checklistDisplay.loadItems);
        console.log('✅ All components initialized');
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

    // Only show setup section if we're actually on the setup tab
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
    // ===== TRIP GENERATION WITH LOCATION INTELLIGENCE =====
    
    async handleGenerateTrip(tripData) {
        try {
            console.log('🚀 Generating enhanced trip:', tripData);
            this.setLoading(true);
            
            // Enhanced messaging with profile
            if (this.userProfile) {
                this.notification.show(`🧠 ${this.userProfile.name}, analyzing your trip requirements...`, 'info', 2000);
                
                if (tripData.location) {
                    const destCity = tripData.location.split(',')[0]?.trim();
                    const homeCity = this.userProfile.homeLocation.city;
                    
                    setTimeout(() => {
                        this.notification.show(`🌍 Comparing ${destCity} vs ${homeCity} for intelligent packing...`, 'info', 2500);
                    }, 1000);
                }
            } else {
                this.notification.show('🧠 Analyzing your trip requirements...', 'info', 2000);
            }

            setTimeout(() => {
    if (this.state.trip.items && Object.keys(this.state.trip.items).length > 0) {
        // Show workflow guidance
        this.notification.show(
            '💡 TIP: Import your itinerary now to get activity-specific packing items!', 
            'info', 
            6000
        );
        
        // Highlight the itinerary tab
        this.navigation.highlightTab('itinerary');
    }
}, 12000);

            // Enhanced transport/accommodation messaging
            setTimeout(() => {
                if (tripData.transportation && tripData.transportation.length > 0) {
                    const transportMessages = {
                        'plane': '✈️ Adding flight-specific items and TSA compliance...',
                        'car': '🚗 Including road trip essentials and emergency kit...',
                        'train': '🚊 Adding train comfort items...',
                        'ferry': '⛴️ Including ferry travel preparations...',
                        'bus': '🚌 Adding bus travel comfort items...'
                    };
                    
                    const selectedTransports = Array.isArray(tripData.transportation) ? 
                        tripData.transportation : [tripData.transportation];
                    
                    selectedTransports.forEach((transport, index) => {
                        setTimeout(() => {
                            this.notification.show(transportMessages[transport] || 'Adding transportation items...', 'info', 2000);
                        }, index * 500);
                    });
                }
            }, 1500);

            setTimeout(() => {
                if (tripData.accommodation && tripData.accommodation.length > 0) {
                    const accommodationMessages = {
                        'hotel': '🏨 Optimizing for hotel stay (toiletries provided)...',
                        'airbnb': '🏠 Adding vacation rental essentials (bring everything)...',
                        'camping': '⛺ Including complete camping setup...',
                        'hostel': '🏨 Adding hostel security and shared facility items...',
                        'family': '👨‍👩‍👧‍👦 Including courtesy items for family stay...'
                    };
                    
                    const selectedAccommodations = Array.isArray(tripData.accommodation) ? 
                        tripData.accommodation : [tripData.accommodation];
                    
                    selectedAccommodations.forEach((accommodation, index) => {
                        setTimeout(() => {
                            this.notification.show(accommodationMessages[accommodation] || 'Adding accommodation items...', 'info', 2000);
                        }, index * 500);
                    });
                }
            }, 2500);

            // Update state with trip data
            Object.assign(this.state.trip, tripData);
            
            // Store profile reference in trip
            if (this.userProfile) {
                this.state.trip.userProfile = this.userProfile;
                this.state.trip.homeLocation = `${this.userProfile.homeLocation.city}, ${this.userProfile.homeLocation.country}`;
            }

            // Location intelligence with origin/destination
            if (this.userProfile && tripData.location) {
                try {
                    this.notification.show('🌍 Getting location intelligence...', 'info', 1500);
                    
                    const originLocation = `${this.userProfile.homeLocation.city}, ${this.userProfile.homeLocation.country}`;
                    
                    const locationResult = await this.locationService.enrichTripLocations(
                        originLocation,
                        tripData.location,
                        tripData.nights,
                        new Date(tripData.startDate)
                    );

                    if (locationResult.success) {
                        this.state.trip.travelIntelligence = locationResult.travelIntelligence;
                        this.state.trip.quickReference = {
                            emergency: { local: locationResult.destination.emergency },
                            language: { essentialPhrases: locationResult.destination.essentialPhrases },
                            customs: locationResult.destination.localCustoms
                        };
                        
                        this.state.trip.originDestinationIntelligence = {
                            origin: locationResult.origin,
                            destination: locationResult.destination
                        };
                        
                        setTimeout(() => {
                            this.showTravelIntelligenceInsights(locationResult.travelIntelligence, this.userProfile.name);
                        }, 3500);
                        
                    } else {
                        console.warn('Location intelligence failed:', locationResult.error);
                        this.notification.show('⚠️ Location intelligence unavailable - continuing with basic generation', 'warning', 2000);
                    }
                    
                } catch (locationError) {
                    console.warn('Location intelligence failed:', locationError);
                    this.notification.show('⚠️ Location intelligence unavailable - continuing with basic generation', 'warning', 2000);
                }
            } else if (!this.userProfile) {
                this.notification.show('💡 Set up your profile for origin/destination intelligence!', 'info', 2000);
            }

            // Weather fetching with comparison
            if (tripData.location) {
                setTimeout(() => {
                    this.notification.show('🌤️ Fetching weather forecast...', 'info', 1500);
                }, 4000);
                
                await this.weatherDisplay.fetchWeather(tripData.location, tripData.nights);
                this.state.trip.weather = this.weatherDisplay.getWeatherData();
                
                if (this.userProfile && this.state.trip.weather && this.state.trip.weather.length > 0) {
                    const avgDestTemp = Math.round(
                        this.state.trip.weather.reduce((sum, day) => sum + day.temp, 0) / this.state.trip.weather.length
                    );
                    
                    setTimeout(() => {
                        this.notification.show(
                            `🌡️ ${this.userProfile.name}, average temperature in ${tripData.location.split(',')[0]} will be ${avgDestTemp}°C`, 
                            'info', 
                            3000
                        );
                    }, 5500);
                }
            }

            // Enhanced item generation
            setTimeout(() => {
                this.notification.show('🧠 Generating intelligent packing list...', 'info', 2000);
            }, 6500);

            const enhancedTripData = {
                ...tripData,
                weather: this.state.trip.weather,
                travelIntelligence: this.state.trip.travelIntelligence,
                userProfile: this.userProfile,
                originDestinationData: this.state.trip.originDestinationIntelligence
            };

            const generatedItems = await this.listGenerator.generateItems(enhancedTripData);
            this.state.trip.items = generatedItems;
            this.state.trip.completedItems = [];

            // Update all components
            this.updateAllComponents();

            // Save state
            this.storage.saveTrip(this.state.trip);
            this.state.hasUnsavedChanges = false;

            // Success messaging
            setTimeout(() => {
                const contextInfo = [];
                if (tripData.transportation && tripData.transportation.length > 0) {
                    const transports = Array.isArray(tripData.transportation) ? tripData.transportation : [tripData.transportation];
                    contextInfo.push(...transports);
                }
                if (tripData.accommodation && tripData.accommodation.length > 0) {
                    const accommodations = Array.isArray(tripData.accommodation) ? tripData.accommodation : [tripData.accommodation];
                    contextInfo.push(...accommodations);
                }
                
                const contextText = contextInfo.length > 0 ? ` for ${contextInfo.join(' + ')}` : '';
                const userName = this.userProfile ? ` ${this.userProfile.name}` : '';
                
                this.notification.show(`🎯${userName}, smart trip plan generated${contextText}!`, 'success', 4000);
            }, 8000);

            setTimeout(() => {
                this.showGenerationInsights(tripData, generatedItems);
            }, 9000);

            setTimeout(() => {
                if (this.userProfile) {
                    this.notification.show(`💡 ${this.userProfile.name}, import your itinerary next for activity-specific items!`, 'info', 4000);
                } else {
                    this.notification.show('💡 Import your itinerary next for activity-specific items!', 'info', 4000);
                }
            }, 10000);

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
        
        if (intelligence.timezone && !intelligence.timezone.sameTimezone) {
            insights.push(`⏰ ${userName}, different timezone (${intelligence.timezone.destinationTimezone}) - check times carefully!`);
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

    showGenerationInsights(tripData, items) {
        const insights = [];
        const categoryCount = Object.keys(items).length;
        let totalItems = 0;
        
        for (const categoryItems of Object.values(items)) {
            totalItems += Object.keys(categoryItems).length;
        }

        if (this.userProfile) {
            insights.push(`📊 ${this.userProfile.name}, generated ${totalItems} items across ${categoryCount} categories`);
        } else {
            insights.push(`📊 Generated ${totalItems} items across ${categoryCount} categories`);
        }

        const transportArray = Array.isArray(tripData.transportation) ? tripData.transportation : [tripData.transportation].filter(Boolean);
        
        if (transportArray.includes('plane')) {
            if (tripData.transportationOptions?.includes('international')) {
                insights.push('🌍 International flight requirements added');
            }
            if (tripData.transportationOptions?.includes('carryonly')) {
                insights.push('🧳 Carry-on restrictions applied');
            }
        }

        const accommodationArray = Array.isArray(tripData.accommodation) ? tripData.accommodation : [tripData.accommodation].filter(Boolean);
        
        if (accommodationArray.includes('hotel')) {
            insights.push('🏨 Hotel amenities considered - basic toiletries excluded');
        } else if (accommodationArray.includes('camping')) {
            insights.push('⛺ Complete camping self-sufficiency included');
        }

        if (this.state.trip.travelIntelligence) {
            if (this.state.trip.travelIntelligence.electrical?.needsAdapter) {
                insights.push('🔌 Electrical adapter requirement detected and added');
            }
            if (this.state.trip.travelIntelligence.currency?.needsExchange) {
                insights.push('💱 Currency exchange planning included');
            }
        }

        const complexityScore = transportArray.length + accommodationArray.length;
        if (complexityScore > 2) {
            insights.push(`🚀 Multi-modal trip (${complexityScore} modes) - coordination items added`);
        }

        insights.forEach((insight, index) => {
            setTimeout(() => {
                this.notification.show(insight, 'info', 2500);
            }, 1000 + (index * 1500));
        });
    }

    // ===== SAVE & LOAD OPERATIONS =====
    
    async handleSave() {
        const savedTrips = this.storage.getSavedTrips();
        
        const defaultName = this.generateTripName(this.state.trip);
        let tripName = prompt('Enter a name for this trip:', defaultName);
        
        if (!tripName) return;

        const tripToSave = { 
            ...this.state.trip,
            savedByUser: this.userProfile?.name || 'Anonymous',
            savedFromLocation: this.userProfile?.homeLocation || null
        };

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
            return `${i + 1}. ${name} (${trip.location || 'Unknown'})`;
        }).join('\n');

        const tripName = prompt(
            `Choose a trip to load:\n${tripOptions}\n\nEnter trip name:`
        );

        if (tripName && savedTrips[tripName]) {
            this.state.trip = { ...savedTrips[tripName] };
            
            if (this.state.trip.userProfile) {
                this.userProfile = this.state.trip.userProfile;
                this.updateNavigationWithProfile();
            }
            
            this.tripSetup.loadTripData(this.state.trip);
            this.updateAllComponents();

            const userName = this.userProfile ? ` ${this.userProfile.name}` : '';
            this.notification.show(`📂${userName}, loaded trip "${tripName}"`, 'success');
        }
    }

    handleResetTrip() {
        const userName = this.userProfile ? ` ${this.userProfile.name}` : '';
        const confirmMessage = `Reset current trip${userName}? This will clear all progress but keep your profile.`;
        
        if (confirm(confirmMessage)) {
            this.state.trip = {
                location: '',
                nights: 5,
                tripType: 'leisure',
                startDate: '',
                transportation: [],
                accommodation: [],
                items: {},
                completedItems: [],
                weather: null,
                itinerary: { days: [], progress: {} },
                userProfile: this.userProfile,
                homeLocation: this.userProfile ? `${this.userProfile.homeLocation.city}, ${this.userProfile.homeLocation.country}` : null
            };

            this.tripSetup.reset();
            this.storage.clearCurrentTrip();
            this.updateAllComponents();
            this.navigation.switchTab('setup');
            
            this.notification.show(`🔄${userName}, trip reset successfully! Your profile is preserved.`, 'info');
        }
    }

    handleExport() {
        try {
            const exportData = {
                ...this.state.trip,
                exportedAt: new Date().toISOString(),
                exportedBy: this.userProfile?.name || 'Anonymous',
                version: '2.1'
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
    // ===== COMPONENT UPDATE METHODS =====
    
    updateAllComponents() {
        this.updatePackingComponents();
        this.updateItineraryComponents();
        this.updateProgressComponents();
        this.updateOverviewComponents();
        this.updateNavigationProgress();
    }

updatePackingComponents() {
    console.log('🔍 DEBUG: checklistDisplay exists?', !!this.checklistDisplay);
    console.log('🔍 DEBUG: checklistDisplay type:', typeof this.checklistDisplay);
    
    // FIX: Add defensive check for items
    const tripItems = this.state.trip.items || {};
    
    if (Object.keys(tripItems).length > 0) {
        if (this.checklistDisplay && typeof this.checklistDisplay.loadItems === 'function') {
            this.checklistDisplay.loadItems(tripItems, this.state.trip.completedItems || []);
        } else {
            console.error('❌ checklistDisplay or loadItems method missing');
        }
    }
}

    updateItineraryComponents() {
        if (this.state.trip.itinerary && this.state.trip.itinerary.days.length > 0) {
            this.itineraryDisplay.render(this.state.trip.itinerary);
        }
    }

  updateProgressComponents() {
    const progress = this.calculateOverallProgress();
    // FIX: Convert to the format progress-tracking expects
    const progressData = {
        percentage: progress,
        completed: this.state.trip.completedItems.length,
        total: Object.values(this.state.trip.items).reduce((sum, cat) => sum + Object.keys(cat).length, 0)
    };
    this.progressTracking.update(progressData);
}

updateOverviewComponents() {
    const overviewSection = document.getElementById('overview-section');
    if (overviewSection) {
        const greeting = this.userProfile ? `Hi ${this.userProfile.name}!` : 'Welcome to TripMaster!';
        const hasTrip = this.state.trip.location && this.state.trip.nights;
        
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
        if (hasTrip && this.state.trip.weather && this.state.trip.weather.length > 0) {
            // Show first 5 days of weather in overview
            const weatherPreview = this.state.trip.weather.slice(0, 5);
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
                    ${this.state.trip.weather.length > 5 ? `
                        <div class="weather-more-info">
                            <p>+${this.state.trip.weather.length - 5} more days - <a href="#" onclick="window.tripMaster.navigation.switchTab('packing')">View full forecast in Packing tab</a></p>
                        </div>
                    ` : ''}
                </div>
            `;
        }
// Build activities display
        let activitiesHTML = '';
        if (this.state.trip.activities && this.state.trip.activities.length > 0) {
            activitiesHTML = `
                <div class="trip-activities">
                    <strong>🎯 Activities:</strong> ${this.state.trip.activities.join(', ')}
                </div>
            `;
        }
        
        overviewSection.innerHTML = `
            <div class="overview-content">
                <div class="overview-header">
                    <h2>${greeting}</h2>
                    <p>${hasTrip ? `Planning your trip to ${this.state.trip.location}` : 'Plan your perfect trip with intelligent packing'}</p>
                </div>

                ${weatherOverviewHTML}
                
                ${hasTrip ? `
                    <div class="trip-summary-card">
                        <h3>📋 Current Trip</h3>
                        <div class="trip-basic-details">
                            <p><strong>📍 Destination:</strong> ${this.state.trip.location}</p>
                            ${this.userProfile ? `<p><strong>🏠 From:</strong> ${this.userProfile.homeLocation.city}, ${this.userProfile.homeLocation.country}</p>` : ''}
                            <p><strong>🌙 Duration:</strong> ${this.state.trip.nights} nights</p>
                            <p><strong>🎯 Type:</strong> ${this.state.trip.tripType}</p>
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
}


    updateLocalInfoComponents() {
        const localInfoSection = document.getElementById('local-info-section');
        if (localInfoSection) {
            localInfoSection.innerHTML = `
                <div class="container">
                    <div class="content-placeholder">
                        <h2>🗺️ Local Information</h2>
                        <p>Language phrases, customs, emergency info</p>
                        <div class="coming-soon">Coming in Phase 3</div>
                    </div>
                </div>
            `;
        }
    }

    updateNavigationProgress() {
        const setupProgress = this.calculateSetupProgress();
        const packingProgress = this.calculatePackingProgress();
        
        this.navigation.updateProgress({
            setup: setupProgress,
            packing: packingProgress,
            overall: Math.round((setupProgress + packingProgress) / 2),
            profileComplete: !!this.userProfile
        });
    }

    // ===== PROGRESS CALCULATION =====
    
    calculateSetupProgress() {
        const trip = this.state.trip;
        let completed = 0;
        let total = 6;
        
        if (this.userProfile) completed++;
        if (trip.location) completed++;
        if (trip.startDate) completed++;
        if (trip.nights > 0) completed++;
        if (trip.tripType) completed++;
        if (trip.transportation.length > 0 || trip.accommodation.length > 0) completed++;
        
        return Math.round((completed / total) * 100);
    }

    calculatePackingProgress() {
        const totalItems = Object.values(this.state.trip.items).reduce((sum, cat) => sum + Object.keys(cat).length, 0);
        const completedItems = this.state.trip.completedItems.length;
        
        if (totalItems === 0) return 0;
        return Math.round((completedItems / totalItems) * 100);
    }

    calculateOverallProgress() {
        const setupProgress = this.calculateSetupProgress();
        const packingProgress = this.calculatePackingProgress();
        
        return Math.round((setupProgress * 0.4) + (packingProgress * 0.6));
    }

    // ===== ITEM HANDLING METHODS =====
    
    handleItemToggle(category, itemKey) {
        const itemId = `${category}.${itemKey}`;
        const isCompleted = this.state.trip.completedItems.includes(itemId);
        
        if (isCompleted) {
            this.state.trip.completedItems = this.state.trip.completedItems.filter(id => id !== itemId);
        } else {
            this.state.trip.completedItems.push(itemId);
        }
        
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
        if (!this.state.trip.items[category]) {
            this.state.trip.items[category] = {};
        }
        
        this.state.trip.items[category][item] = { quantity };
        this.storage.saveTrip(this.state.trip);
        this.updatePackingComponents();
        this.state.hasUnsavedChanges = false;
        
        const userName = this.userProfile ? ` ${this.userProfile.name}` : '';
        this.notification.show(`➕${userName}, added "${item}" to ${category}`, 'success');
    }

    handleNoteUpdate(category, itemKey, note) {
        if (!this.state.trip.items[category] || !this.state.trip.items[category][itemKey]) return;
        
        this.state.trip.items[category][itemKey].note = note;
        this.storage.saveTrip(this.state.trip);
        this.state.hasUnsavedChanges = false;
        
        this.notification.show('📝 Note updated', 'info');
    }

    // ===== ITINERARY HANDLING =====
    
    handleStopToggle(stopId, completed) {
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
        if (!this.state.trip.itinerary.progress.personalNotes) {
            this.state.trip.itinerary.progress.personalNotes = {};
        }
        
        this.state.trip.itinerary.progress.personalNotes[stopId] = note;
        this.storage.saveTrip(this.state.trip);
        this.state.hasUnsavedChanges = false;
        
        this.notification.show('📝 Itinerary note updated', 'info');
    }

    calculateItineraryProgress() {
        if (!this.state.trip.itinerary || !this.state.trip.itinerary.days.length) return 0;
        
        const totalStops = this.state.trip.itinerary.days.reduce((sum, day) => sum + day.stops.length, 0);
        const completedStops = this.state.trip.itinerary.progress.completedStops?.length || 0;
        
        if (totalStops === 0) return 0;
        return Math.round((completedStops / totalStops) * 100);
    }

    // ===== ACTIVITY SYNC =====

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
            if (!this.state.trip.items[category]) {
                this.state.trip.items[category] = {};
            }
            if (!this.state.trip.items[category][itemKey]) {
                this.state.trip.items[category][itemKey] = { 
                    quantity: 1, 
                    addedFromActivity: true,
                    note: 'Added from itinerary activity'
                };
            }
        });
    }

    // ===== IMPORT ITINERARY =====
    
    async handleImportItinerary(itineraryData) {
        try {
            if (!itineraryData.days || !Array.isArray(itineraryData.days)) {
                throw new Error('Invalid itinerary format - missing days array');
            }
            
            this.state.trip.itinerary = {
                days: itineraryData.days,
                progress: this.state.trip.itinerary.progress || {
                    completedStops: [],
                    personalNotes: {}
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

    // ===== UTILITY METHODS =====
    
    generateTripName(trip) {
        const parts = [];
        
        if (this.userProfile && trip.location) {
            parts.push(`${this.userProfile.homeLocation.city} → ${trip.location}`);
        } else if (trip.location) {
            parts.push(trip.location);
        }
        
        if (trip.tripType && trip.tripType !== 'leisure') parts.push(trip.tripType);
        
        const date = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        parts.push(date);
        
        return parts.join(' - ');
    }

    generateExportFileName() {
        const parts = ['tripmaster'];
        
        if (this.userProfile && this.state.trip.location) {
            const originCity = this.userProfile.homeLocation.city.replace(/\s+/g, '-').toLowerCase();
            const destCity = this.state.trip.location.split(',')[0].replace(/\s+/g, '-').toLowerCase();
            parts.push(`${originCity}-to-${destCity}`);
        } else if (this.state.trip.location) {
            parts.push(this.state.trip.location.split(',')[0].replace(/\s+/g, '-').toLowerCase());
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

        // Enhanced auto-save with conflict detection
        let autoSaveTimeout;
        let lastSaveTime = Date.now();
        
        const smartAutoSave = () => {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                if (this.state.hasUnsavedChanges) {
                    try {
                        const currentSaved = this.storage.getCurrentTrip();
                        if (currentSaved && currentSaved.meta && currentSaved.meta.lastModified) {
                            const savedTime = new Date(currentSaved.meta.lastModified).getTime();
                            if (savedTime > lastSaveTime) {
                                if (confirm('Trip was modified in another tab. Overwrite with current changes?')) {
                                    this.storage.saveTrip(this.state.trip);
                                    lastSaveTime = Date.now();
                                } else {
                                    this.state.trip = { ...currentSaved };
                                    this.updateAllComponents();
                                }
                            } else {
                                this.storage.saveTrip(this.state.trip);
                                lastSaveTime = Date.now();
                            }
                        } else {
                            this.storage.saveTrip(this.state.trip);
                            lastSaveTime = Date.now();
                        }
                        
                        this.state.hasUnsavedChanges = false;
                        
                        const userName = this.userProfile ? ` ${this.userProfile.name}` : '';
                        console.log(`💾 Auto-saved${userName} at ${new Date().toLocaleTimeString()}`);
                        
                    } catch (error) {
                        this.handleStorageError(error);
                    }
                }
            }, 3000);
        };

        // Enhanced change detection
        ['input', 'change', 'click'].forEach(eventType => {
            document.addEventListener(eventType, (e) => {
                if (e.target.closest('.trip-setup, .checklist-display, .itinerary-display')) {
                    this.state.hasUnsavedChanges = true;
                    smartAutoSave();
                }
            });
        });

        console.log('✅ Events bound');
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
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
                
                ['tripmaster-current-trip', 'tripmaster-saved-trips', 'tripmaster-cache', 'tripmaster-itinerary-progress'].forEach(key => {
                    try {
                        localStorage.removeItem(key);
                    } catch (e) {
                        console.warn(`Failed to clear ${key}:`, e);
                    }
                });
                
                if (profileBackup) {
                    this.storage.saveUserProfile(profileBackup);
                    this.userProfile = profileBackup;
                }
                
                this.state.trip = {
                    location: '',
                    nights: 5,
                    tripType: 'leisure',
                    startDate: '',
                    transportation: [],
                    accommodation: [],
                    items: {},
                    completedItems: [],
                    userProfile: this.userProfile,
                    homeLocation: this.userProfile ? `${this.userProfile.homeLocation.city}, ${this.userProfile.homeLocation.country}` : null
                };
                
                this.updateAllComponents();
                this.navigation.switchTab('overview');
                
                this.notification.show(`🔄 Emergency reset complete${userName}`, 'success');
                
            } catch (resetError) {
                console.error('Emergency reset failed:', resetError);
                this.notification.show('Emergency reset failed - please refresh the page', 'error');
            }
        }
    }


// ===== LOAD SAVED STATE =====
    
    async loadSavedState() {
        console.log('🔄 Loading saved state...');
        
        try {
            const savedTrip = this.storage.getCurrentTrip();
            
            if (savedTrip) {
                console.log('📂 Found saved trip data:', savedTrip.location);
                
                this.state.trip = { ...savedTrip };
                
                if (!this.state.trip.userProfile && this.userProfile) {
                    this.state.trip.userProfile = this.userProfile;
                    this.state.trip.homeLocation = `${this.userProfile.homeLocation.city}, ${this.userProfile.homeLocation.country}`;
                }
                
                if (this.tripSetup && this.tripSetup.loadTripData) {
                    console.log('📝 Restoring trip setup form...');
                    this.tripSetup.loadTripData(this.state.trip);
                }
                
                if (this.state.trip.weather && this.state.trip.weather.length > 0) {
                    console.log('🌤️ Restoring weather data...');
                    this.weatherDisplay.displayWeather(this.state.trip.weather);
                }
                
                this.updateAllComponents();
                
                setTimeout(() => {
                    if (this.userProfile) {
                        this.notification.show(`👋 Welcome back ${this.userProfile.name}! Restored your trip to ${this.state.trip.location}`, 'success', 3000);
                    } else {
                        this.notification.show(`👋 Welcome back! Restored your trip to ${this.state.trip.location}`, 'success', 3000);
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
    } // <-- Missing closing brace was here
    
    determineInitialTab() {
        const hasBasicTrip = this.state.trip.location && this.state.trip.nights;
        const hasPackingList = this.state.trip.items && Object.keys(this.state.trip.items).length > 0;
        const hasItinerary = this.state.trip.itinerary && this.state.trip.itinerary.days && this.state.trip.itinerary.days.length > 0;
        
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

    // ADD this new method
    setupEnhancedAutoSave() {
        let autoSaveTimeout;
        
        const triggerAutoSave = (source = 'unknown') => {
            clearTimeout(autoSaveTimeout);
            
            autoSaveTimeout = setTimeout(() => {
                if (this.state.trip.location || Object.keys(this.state.trip.items).length > 0) {
                    try {
                        this.state.trip.meta = {
                            ...this.state.trip.meta,
                            lastModified: new Date().toISOString(),
                            autoSaveSource: source
                        };
                        
                        this.storage.saveTrip(this.state.trip);
                        console.log(`💾 Auto-saved (${source}) at ${new Date().toLocaleTimeString()}`);
                        document.title = `🧳 TripMaster - ${this.state.trip.location || 'Trip Planning'} (Saved)`;
                        
                    } catch (error) {
                        console.error('❌ Auto-save failed:', error);
                        this.notification.show('Auto-save failed - please save manually', 'warning', 2000);
                    }
                }
            }, 2000);
        };
        
        const changeEvents = ['input', 'change', 'click'];
        const targetSelectors = ['.trip-setup', '.checklist-display', '.itinerary-display', '.item-checkbox', '.completion-checkbox'];
        
        changeEvents.forEach(eventType => {
            document.addEventListener(eventType, (e) => {
                if (targetSelectors.some(selector => e.target.closest(selector))) {
                    this.state.hasUnsavedChanges = true;
                    triggerAutoSave(eventType);
                }
            });
        });
        
        window.addEventListener('beforeunload', (e) => {
            if (this.state.hasUnsavedChanges) {
                this.storage.saveTrip(this.state.trip);
            }
        });
        
        console.log('✅ Enhanced auto-save system initialized');
    }
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌐 DOM loaded, initializing TripMaster...');
    
    try {
        const tripMaster = new TripMaster();
        
        // Make global methods available
        window.tripMaster = tripMaster;
        window.loadSampleItinerary = () => tripMaster.loadSampleItinerary();
        window.handleImportItinerary = (data) => tripMaster.handleImportItinerary(data);
        
        console.log('✅ TripMaster successfully created and attached to window');
        
        // Enhanced debugging tools
        window.debugTripMaster = {
            state: () => tripMaster.state,
            profile: () => tripMaster.userProfile,
            storage: () => tripMaster.storage.getStorageInfo(),
            health: () => tripMaster.storage.getStorageHealth(),
            components: () => ({
                navigation: !!tripMaster.navigation,
                tripSetup: !!tripMaster.tripSetup,
                storage: !!tripMaster.storage,
                listGenerator: !!tripMaster.listGenerator,
                locationService: !!tripMaster.locationService
            }),
            emergencyReset: () => tripMaster.emergencyReset(),
            forceSetupTab: () => {
                tripMaster.navigation.switchTab('setup');
                tripMaster.ensureSetupTabVisible();
            }
        };
        
        // Show welcome message if profile exists
        if (tripMaster.userProfile) {
            setTimeout(() => {
                tripMaster.notification.show(`🎉 Welcome back ${tripMaster.userProfile.name}! TripMaster is ready.`, 'success', 3000);
            }, 1000);
        }
        
    } catch (error) {
        console.error('❌ TripMaster initialization failed:', error);
        
        // Show error to user with recovery options
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed; top: 20px; right: 20px; 
            background: #f44336; color: white; 
            padding: 15px; border-radius: 8px; 
            z-index: 1000; max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        errorDiv.innerHTML = `
            <h4 style="margin: 0 0 10px 0;">TripMaster Failed to Load</h4>
            <p style="margin: 0 0 10px 0; font-size: 14px;">The app encountered an error during startup.</p>
            <button onclick="location.reload()" style="background: white; color: #f44336; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">Refresh Page</button>
        `;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 10000);
    }
});

// ===== ENHANCED ERROR HANDLING =====

window.addEventListener('error', (event) => {
    console.error('TripMaster error:', event.error);
    
    const userProfile = window.tripMaster?.userProfile;
    const context = userProfile ? ` (User: ${userProfile.name})` : '';
    
    console.error(`Error context${context}:`, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        userProfile: userProfile?.name || 'Anonymous',
        currentTab: window.tripMaster?.state?.activeTab || 'unknown',
        hasTrip: !!(window.tripMaster?.state?.trip?.location)
    });
    
    if (event.message.includes('storage') || event.message.includes('localStorage')) {
        console.warn('Storage error detected - attempting recovery');
        if (window.tripMaster) {
            window.tripMaster.handleStorageError(event.error);
        }
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('TripMaster unhandled promise rejection:', event.reason);
    
    const userProfile = window.tripMaster?.userProfile;
    const context = userProfile ? ` (User: ${userProfile.name})` : '';
    
    console.error(`Promise rejection context${context}:`, {
        reason: event.reason,
        userProfile: userProfile?.name || 'Anonymous',
        currentOperation: window.tripMaster?.state?.isLoading ? 'loading' : 'idle'
    });
    
    if (event.reason && event.reason.toString().includes('fetch')) {
        console.warn('Network error detected - user will be notified');
        if (window.tripMaster && window.tripMaster.notification) {
            window.tripMaster.notification.show('Network error - some features may not work', 'warning', 3000);
        }
    }
});

// ===== VISIBILITY CHANGE HANDLING =====

document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.tripMaster) {
        console.log('Page visible - checking for updates');
        
        const currentTrip = window.tripMaster.storage.getCurrentTrip();
        if (currentTrip && currentTrip.meta && currentTrip.meta.lastModified) {
            const lastModified = new Date(currentTrip.meta.lastModified).getTime();
            const currentLastModified = window.tripMaster.state.trip.meta?.lastModified ? 
                new Date(window.tripMaster.state.trip.meta.lastModified).getTime() : 0;
            
            if (lastModified > currentLastModified) {
                console.log('Trip updated in another tab - syncing');
                window.tripMaster.state.trip = { ...currentTrip };
                window.tripMaster.updateAllComponents();
                
                if (window.tripMaster.userProfile) {
                    window.tripMaster.notification.show(`🔄 ${window.tripMaster.userProfile.name}, synced updates from another tab`, 'info', 2000);
                }
            }
        }
    }
});

// Export for potential module usage
export default TripMaster;
