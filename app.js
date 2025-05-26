
// app.js - TripMaster Phase 2.1 - PART 1: Profile Integration & Core Setup
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
import { createNewTrip, TripValidation } from './data/unified-data-model.js';

class TripMaster {
    constructor() {
        // Enhanced state structure with profile integration
        this.state = {
            // Enhanced trip structure with user profile
            trip: {
                // Basic info (enhanced with profile awareness)
                location: '',
                nights: 5,
                tripType: 'business',
                startDate: '',
                notes: '',
                activities: [],
                
                // Transportation/accommodation enhancements
                transportation: '',
                accommodation: '',
                transportationOptions: [],
                accommodationOptions: [],
                
                // Existing packing structure
                weather: null,
                items: {},
                completedItems: [],
                
                // Unified model integration
                tripInfo: null,
                itinerary: { days: [], progress: {} },
                travelIntelligence: {},
                quickReference: {},
                
                // NEW: User profile integration
                userProfile: null,
                homeLocation: null,
                originDestinationIntelligence: null
            },
            
            // Navigation state
            activeTab: 'overview',
            isLoading: false,
            hasUnsavedChanges: false,
            
            // NEW: Profile state
            profileSetupComplete: false,
            showingFirstTimeWelcome: false
        };

        // Enhanced services
        this.storage = new StorageManager();
        this.listGenerator = new ListGenerator();
        this.notification = new NotificationManager();
        this.locationService = new LocationService();
        
        // NEW: Profile management
        this.userProfile = null;
        
        this.initializeComponents();
        this.bindEvents();
        this.initializeUserProfile(); // NEW: Initialize profile first
        this.loadSavedState();
    }

    // ===== NEW: USER PROFILE INITIALIZATION =====
    
    async initializeUserProfile() {
        try {
            // Load existing profile
            this.userProfile = this.storage.getUserProfile();
            
            if (this.userProfile) {
                console.log(`Welcome back ${this.userProfile.name}!`);
                this.state.trip.userProfile = this.userProfile;
                this.state.trip.homeLocation = `${this.userProfile.homeLocation.city}, ${this.userProfile.homeLocation.country}`;
                this.state.profileSetupComplete = true;
                
                // Update navigation with personalization
                this.updateNavigationWithProfile();
            } else {
                console.log('No user profile found - will show setup on first trip creation');
                this.state.profileSetupComplete = false;
            }
        } catch (error) {
            console.error('Failed to initialize user profile:', error);
            this.state.profileSetupComplete = false;
        }
    }

    // ===== ENHANCED COMPONENT INITIALIZATION =====
    
    initializeComponents() {
        // Navigation system (enhanced with profile awareness)
        this.navigation = new Navigation({
            container: document.getElementById('navigation-section'),
            onTabChange: (tabId) => this.handleTabChange(tabId)
        });

        // ENHANCED: Trip setup with storage manager injection
        this.tripSetup = new TripSetup({
            container: document.getElementById('trip-setup-section'),
            onGenerate: (tripData) => this.handleGenerateTrip(tripData),
            onLoad: () => this.handleLoadTrip(),
            onReset: () => this.handleResetTrip()
        });
        
        // NEW: Inject storage manager for profile functionality
        this.tripSetup.setStorageManager(this.storage);

        // Weather display (unchanged)
        this.weatherDisplay = new WeatherDisplay({
            container: document.getElementById('weather-display-section')
        });

        // Progress tracking (unchanged)
        this.progressTracking = new ProgressTracking({
            container: document.getElementById('progress-tracking-section')
        });

        // Checklist display (unchanged)
        this.checklistDisplay = new ChecklistDisplay({
            container: document.getElementById('checklist-display-section'),
            onItemToggle: (category, item) => this.handleItemToggle(category, item),
            onItemAdd: (category, item, quantity) => this.handleItemAdd(category, item, quantity),
            onNoteUpdate: (category, item, note) => this.handleNoteUpdate(category, item, note)
        });

        // Itinerary display (unchanged)
        this.itineraryDisplay = new ItineraryDisplay({
            container: document.getElementById('itinerary-display-section'),
            onStopToggle: (stopId, completed) => this.handleStopToggle(stopId, completed),
            onNoteUpdate: (stopId, note) => this.handleItineraryNoteUpdate(stopId, note),
            onActivitySync: (stopId, activities) => this.handleActivitySync(stopId, activities)
        });

        // Control panel (unchanged)
        this.controlPanel = new ControlPanel({
            container: document.getElementById('control-panel'),
            onExport: () => this.handleExport(),
            onSave: () => this.handleSave(),
            onScrollTop: () => window.scrollTo({ top: 0, behavior: 'smooth' })
        });

        // Initialize tab content visibility
        this.showTab('overview');
        
        // Make components available globally for callbacks
        window.itineraryDisplay = this.itineraryDisplay;
    }

    // ===== NEW: NAVIGATION PROFILE UPDATES =====
    
    updateNavigationWithProfile() {
        if (this.userProfile && this.navigation) {
            // Add personalized greeting to navigation
            const navHeader = document.querySelector('.nav-header h1');
            if (navHeader) {
                navHeader.innerHTML = `🧳 TripMaster - Hi ${this.userProfile.name}!`;
            }
            
            // Update subtitle with home location
            const navSubtitle = document.querySelector('.nav-header .app-subtitle');
            if (navSubtitle) {
                navSubtitle.textContent = `Planning from ${this.userProfile.homeLocation.city}`;
            }
        }
    }

    // ===== ENHANCED TAB MANAGEMENT =====
    
    handleTabChange(tabId) {
        this.state.activeTab = tabId;
        this.showTab(tabId);
        
        // Update components based on active tab (enhanced with profile awareness)
        switch(tabId) {
            case 'setup':
                // NEW: Pass profile state to trip setup
                this.tripSetup.loadTripData(this.state.trip);
                if (this.userProfile) {
                    this.tripSetup.userProfile = this.userProfile;
                }
                break;
                
            case 'packing':
                this.updatePackingComponents();
                break;
                
            case 'itinerary':
                this.updateItineraryComponents();
                break;
                
            case 'local-info':
                // Future: Update local info components with profile context
                break;
                
            case 'overview':
                this.updateOverviewComponents();
                break;
        }
        
        this.updateNavigationProgress();
    }

    showTab(tabId) {
        // Hide all tab content
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tab
        const targetTab = document.getElementById(`${tabId}-section`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }

    // ===== ENHANCED TRIP GENERATION (Part 1: Setup & Profile Integration) =====
    
    async handleGenerateTrip(tripData) {
        try {
            this.setLoading(true);
            
            // NEW: Profile-aware messaging
            if (this.userProfile) {
                this.notification.show(`🧠 ${this.userProfile.name}, analyzing your trip requirements...`, 'info', 2000);
                
                // Enhanced origin/destination messaging
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

            // Enhanced transport/accommodation messages (unchanged)
            setTimeout(() => {
                if (tripData.transportation) {
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
                if (tripData.accommodation) {
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

            // Update state with trip data (enhanced with profile)
            Object.assign(this.state.trip, tripData);
            
            // NEW: Store profile reference in trip
            if (this.userProfile) {
                this.state.trip.userProfile = this.userProfile;
                this.state.trip.homeLocation = `${this.userProfile.homeLocation.city}, ${this.userProfile.homeLocation.country}`;
            }

            // Continue with Part 2 processing...
            // [PART 2 WILL CONTAIN: Location Intelligence, Weather, Item Generation, and Success Handling]
            
        } catch (error) {
            console.error('Error generating trip:', error);
            this.notification.show('Failed to generate trip plan. Please try again.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    // ===== ENHANCED SAVE OPERATIONS =====
    
    async handleSave() {
        const savedTrips = await this.storage.getSavedTrips();
        
        // NEW: Profile-aware trip naming
        const defaultName = this.generateTripName(this.state.trip);
        let tripName = prompt('Enter a name for this trip:', defaultName);
        
        if (!tripName) return;

        // NEW: Add profile context to saved trip
        const tripToSave = { 
            ...this.state.trip,
            savedByUser: this.userProfile?.name || 'Anonymous',
            savedFromLocation: this.userProfile?.homeLocation || null
        };

        savedTrips[tripName] = tripToSave;
        this.storage.saveTripToLibrary(tripName, tripToSave);
        
        const context = [];
        if (this.state.trip.transportation) context.push(this.state.trip.transportation);
        if (this.state.trip.accommodation) context.push(this.state.trip.accommodation);
        const contextText = context.length > 0 ? ` (${context.join(' + ')})` : '';
        
        // NEW: Profile-aware success message
        const userName = this.userProfile ? ` ${this.userProfile.name}` : '';
        this.notification.show(`💾${userName}, trip "${tripName}" saved${contextText}!`, 'success');
    }

    // ===== ENHANCED TRIP NAMING =====
    
    generateTripName(trip) {
        const parts = [];
        
        // NEW: Add user context if available
        if (this.userProfile && trip.location) {
            parts.push(`${this.userProfile.homeLocation.city} → ${trip.location}`);
        } else if (trip.location) {
            parts.push(trip.location);
        }
        
        if (trip.tripType && trip.tripType !== 'leisure') parts.push(trip.tripType);
        
        if (trip.transportation === 'car' && trip.accommodation === 'camping') {
            parts.push('car camping');
        } else if (trip.accommodation === 'hostel') {
            parts.push('hostel trip');
        } else if (trip.transportation === 'plane' && trip.transportationOptions?.includes('international')) {
            parts.push('international');
        }
        
        const date = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        parts.push(date);
        
        return parts.join(' - ');
    }

    // ===== PROGRESS CALCULATION (Enhanced with Profile) =====
    
    calculateSetupProgress() {
        const trip = this.state.trip;
        let completed = 0;
        let total = 6; // Increased from 5 to include profile
        
        // NEW: Profile setup counts as progress
        if (this.userProfile) completed++;
        if (trip.location) completed++;
        if (trip.startDate) completed++;
        if (trip.nights > 0) completed++;
        if (trip.tripType) completed++;
        if (trip.transportation || trip.accommodation) completed++;
        
        return Math.round((completed / total) * 100);
    }

    // ===== UTILITY METHODS (Enhanced) =====
    
    setLoading(isLoading) {
        this.state.isLoading = isLoading;
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.toggle('hidden', !isLoading);
        }
        
        // NEW: Profile-aware loading messages
        if (isLoading && this.userProfile) {
            console.log(`Loading trip data for ${this.userProfile.name}...`);
        }
    }
    
// ===== PART 2: ENHANCED TRIP GENERATION (Location Intelligence & Completion) =====
    
    // Continue handleGenerateTrip from Part 1...
    async handleGenerateTrip(tripData) {
        try {
            // [Part 1 setup code already in place...]
            
            // ===== NEW: LOCATION INTELLIGENCE WITH ORIGIN/DESTINATION =====
            
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
                        // Store comprehensive location data
                        this.state.trip.travelIntelligence = locationResult.travelIntelligence;
                        this.state.trip.quickReference = {
                            emergency: { local: locationResult.destination.emergency },
                            language: { essentialPhrases: locationResult.destination.essentialPhrases },
                            customs: locationResult.destination.localCustoms
                        };
                        
                        // Store origin/destination data for enhanced item generation
                        this.state.trip.originDestinationIntelligence = {
                            origin: locationResult.origin,
                            destination: locationResult.destination
                        };
                        
                        // NEW: Show intelligent insights with delays
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
                // Fallback for users without profile
                this.notification.show('💡 Set up your profile for origin/destination intelligence!', 'info', 2000);
            }

            // ===== WEATHER FETCHING (Enhanced) =====
            
            if (tripData.location) {
                setTimeout(() => {
                    this.notification.show('🌤️ Fetching weather forecast...', 'info', 1500);
                }, 4000);
                
                await this.weatherDisplay.fetchWeather(tripData.location, tripData.nights);
                this.state.trip.weather = this.weatherDisplay.getWeatherData();
                
                // NEW: Weather comparison with home location if profile exists
                if (this.userProfile && this.state.trip.weather && this.state.trip.weather.length > 0) {
                    const avgDestTemp = Math.round(
                        this.state.trip.weather.reduce((sum, day) => sum + day.temp, 0) / this.state.trip.weather.length
                    );
                    
                    // This is a simplified comparison - in reality, you'd fetch home weather too
                    setTimeout(() => {
                        this.notification.show(
                            `🌡️ ${this.userProfile.name}, average temperature in ${tripData.location.split(',')[0]} will be ${avgDestTemp}°C`, 
                            'info', 
                            3000
                        );
                    }, 5500);
                }
            }

            // ===== ENHANCED ITEM GENERATION =====
            
            setTimeout(() => {
                this.notification.show('🧠 Generating intelligent packing list...', 'info', 2000);
            }, 6500);

            // Enhanced trip data for generation
            const enhancedTripData = {
                ...tripData,
                weather: this.state.trip.weather,
                travelIntelligence: this.state.trip.travelIntelligence,
                userProfile: this.userProfile,
                originDestinationData: this.state.trip.originDestinationIntelligence
            };

            const generatedItems = await this.listGenerator.generateItems(enhancedTripData);
            this.state.trip.items = generatedItems;

            // ===== UPDATE ALL COMPONENTS =====
            
            this.updateAllComponents();

            // ===== SAVE STATE =====
            
            this.storage.saveTrip(this.state.trip);
            this.state.hasUnsavedChanges = false;

            // ===== SUCCESS MESSAGING (Enhanced) =====
            
            setTimeout(() => {
                const contextInfo = [];
                if (tripData.transportation) {
                    const transports = Array.isArray(tripData.transportation) ? tripData.transportation : [tripData.transportation];
                    contextInfo.push(...transports);
                }
                if (tripData.accommodation) {
                    const accommodations = Array.isArray(tripData.accommodation) ? tripData.accommodation : [tripData.accommodation];
                    contextInfo.push(...accommodations);
                }
                
                const contextText = contextInfo.length > 0 ? ` for ${contextInfo.join(' + ')}` : '';
                const userName = this.userProfile ? ` ${this.userProfile.name}` : '';
                
                this.notification.show(`🎯${userName}, smart trip plan generated${contextText}!`, 'success', 4000);
            }, 8000);

            // ===== ENHANCED INSIGHTS =====
            
            setTimeout(() => {
                this.showGenerationInsights(tripData, generatedItems);
            }, 9000);

            // ===== WORKFLOW GUIDANCE =====
            
            setTimeout(() => {
                if (this.userProfile) {
                    this.notification.show(`💡 ${this.userProfile.name}, import your itinerary next for activity-specific items!`, 'info', 4000);
                } else {
                    this.notification.show('💡 Import your itinerary next for activity-specific items!', 'info', 4000);
                }
            }, 10000);

            // NEW: Switch to packing tab to show results
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

    // ===== NEW: TRAVEL INTELLIGENCE INSIGHTS =====
    
    showTravelIntelligenceInsights(intelligence, userName) {
        const insights = [];
        
        // Electrical compatibility insights
        if (intelligence.electrical) {
            if (intelligence.electrical.needsAdapter) {
                insights.push(`🔌 ${userName}, you'll need a ${intelligence.electrical.adapterType} adapter`);
            } else {
                insights.push(`✅ ${userName}, your ${intelligence.electrical.originPlug} plugs will work - no adapter needed!`);
            }
        }
        
        // Currency insights
        if (intelligence.currency) {
            if (intelligence.currency.needsExchange) {
                insights.push(`💱 ${userName}, you'll need to exchange ${intelligence.currency.originCurrency} to ${intelligence.currency.destinationCurrency}`);
            } else {
                insights.push(`💰 ${userName}, same currency (${intelligence.currency.originCurrency}) - no exchange needed!`);
            }
        }
        
        // Language insights
        if (intelligence.language) {
            if (intelligence.language.sameLanguage) {
                insights.push(`🗣️ ${userName}, same language - easy communication!`);
            } else {
                insights.push(`🌍 ${userName}, different language (${intelligence.language.destinationLanguage}) - essential phrases included!`);
            }
        }
        
        // Timezone insights
        if (intelligence.timezone && !intelligence.timezone.sameTimezone) {
            insights.push(`⏰ ${userName}, different timezone (${intelligence.timezone.destinationTimezone}) - check times carefully!`);
        }
        
        // Weather comparison insights (if available)
        if (intelligence.weather && intelligence.weather.hasComparison) {
            insights.push(`🌤️ ${userName}, ${intelligence.weather.recommendation}`);
        }
        
        // Show insights with staggered timing
        insights.forEach((insight, index) => {
            setTimeout(() => {
                this.notification.show(insight, 'info', 4000);
            }, 1000 + (index * 1800));
        });
    }

    // ===== ENHANCED GENERATION INSIGHTS =====
    
    showGenerationInsights(tripData, items) {
        const insights = [];
        const categoryCount = Object.keys(items).length;
        let totalItems = 0;
        
        for (const categoryItems of Object.values(items)) {
            totalItems += Object.keys(categoryItems).length;
        }

        // Profile-aware insights
        if (this.userProfile) {
            insights.push(`📊 ${this.userProfile.name}, generated ${totalItems} items across ${categoryCount} categories`);
        } else {
            insights.push(`📊 Generated ${totalItems} items across ${categoryCount} categories`);
        }

        // Transport-specific insights (enhanced)
        const transportArray = Array.isArray(tripData.transportation) ? tripData.transportation : [tripData.transportation].filter(Boolean);
        
        if (transportArray.includes('plane')) {
            if (tripData.transportationOptions?.includes('international')) {
                insights.push('🌍 International flight requirements added');
            }
            if (tripData.transportationOptions?.includes('carryonly')) {
                insights.push('🧳 Carry-on restrictions applied');
            }
        }

        // Accommodation-specific insights (enhanced)
        const accommodationArray = Array.isArray(tripData.accommodation) ? tripData.accommodation : [tripData.accommodation].filter(Boolean);
        
        if (accommodationArray.includes('hotel')) {
            insights.push('🏨 Hotel amenities considered - basic toiletries excluded');
        } else if (accommodationArray.includes('camping')) {
            insights.push('⛺ Complete camping self-sufficiency included');
        }

        // NEW: Travel intelligence insights
        if (this.state.trip.travelIntelligence) {
            if (this.state.trip.travelIntelligence.electrical?.needsAdapter) {
                insights.push('🔌 Electrical adapter requirement detected and added');
            }
            if (this.state.trip.travelIntelligence.currency?.needsExchange) {
                insights.push('💱 Currency exchange planning included');
            }
        }

        // Multi-modal complexity insights
        const complexityScore = transportArray.length + accommodationArray.length;
        if (complexityScore > 2) {
            insights.push(`🚀 Multi-modal trip (${complexityScore} modes) - coordination items added`);
        }

        // Show insights with timing
        insights.forEach((insight, index) => {
            setTimeout(() => {
                this.notification.show(insight, 'info', 2500);
            }, 1000 + (index * 1500));
        });
    }

    // ===== ENHANCED IMPORT ITINERARY =====
    
    async handleImportItinerary(itineraryData) {
        try {
            // Validate itinerary data structure
            if (!itineraryData.days || !Array.isArray(itineraryData.days)) {
                throw new Error('Invalid itinerary format - missing days array');
            }
            
            // Store itinerary data
            this.state.trip.itinerary = {
                days: itineraryData.days,
                progress: this.state.trip.itinerary.progress || {
                    completedStops: [],
                    personalNotes: {}
                }
            };
            
            // Update components
            this.updateItineraryComponents();
            this.updateNavigationProgress();
            
            // Save to storage
            this.storage.saveTrip(this.state.trip);
            
            // Enhanced success messaging
            const totalStops = itineraryData.days.reduce((sum, day) => sum + day.stops.length, 0);
            
            if (this.userProfile) {
                this.notification.show(`📅 ${this.userProfile.name}, imported itinerary with ${itineraryData.days.length} days and ${totalStops} stops!`, 'success');
            } else {
                this.notification.show(`📅 Imported itinerary with ${itineraryData.days.length} days and ${totalStops} stops!`, 'success');
            }
            
            // NEW: Suggest activity sync
            setTimeout(() => {
                if (this.userProfile) {
                    this.notification.show(`💡 ${this.userProfile.name}, activities from your itinerary can enhance your packing list!`, 'info', 4000);
                } else {
                    this.notification.show('💡 Activities from your itinerary can enhance your packing list!', 'info', 4000);
                }
            }, 2000);
            
            // Switch to itinerary tab
            setTimeout(() => {
                this.navigation.switchTab('itinerary');
            }, 3000);
            
        } catch (error) {
            console.error('Failed to import itinerary:', error);
            this.notification.show('Failed to import itinerary. Please check the file format.', 'error');
        }
    }

    // ===== ENHANCED ACTIVITY SYNC =====
    
    handleActivitySync(stopId, activities) {
        let addedItems = 0;
        
        // Profile-aware messaging
        const userName = this.userProfile ? ` ${this.userProfile.name}` : '';
        
        // Analyze activities and add relevant packing items
        activities.forEach(activity => {
            const activityLower = activity.toLowerCase();
            
            // Business activities
            if (activityLower.includes('session') || activityLower.includes('meeting') || 
                activityLower.includes('presentation') || activityLower.includes('showcase')) {
                this.addPackingItemsFromActivity(['business_items.business_cards', 'business_items.notebook', 'clothes.dress_shirt']);
                addedItems += 3;
            }
            
            // Dining activities
            if (activityLower.includes('dinner') || activityLower.includes('restaurant') || 
                activityLower.includes('dining')) {
                this.addPackingItemsFromActivity(['clothes.nice_shoes', 'clothes.dress_pants']);
                addedItems += 2;
            }
            
            // Walking/touring activities
            if (activityLower.includes('walking') || activityLower.includes('tour') || 
                activityLower.includes('exploration') || activityLower.includes('stroll')) {
                this.addPackingItemsFromActivity(['clothes.comfortable_shoes', 'travel_essentials.water_bottle']);
                addedItems += 2;
            }
            
            // Cultural activities
            if (activityLower.includes('museum') || activityLower.includes('cultural') || 
                activityLower.includes('historic')) {
                this.addPackingItemsFromActivity(['electronics.camera', 'travel_essentials.guidebook']);
                addedItems += 2;
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

    // ===== ENHANCED LOAD TRIP =====
    
    async handleLoadTrip() {
        const savedTrips = await this.storage.getSavedTrips();
        const tripNames = Object.keys(savedTrips);

        if (tripNames.length === 0) {
            this.notification.show('No saved trips found', 'info');
            return;
        }

        // Enhanced trip display with profile context
        const tripOptions = tripNames.map((name, i) => {
            const trip = savedTrips[name];
            const context = [];
            if (trip.transportation) context.push(trip.transportation);
            if (trip.accommodation) context.push(trip.accommodation);
            const contextText = context.length > 0 ? ` (${context.join(' + ')})` : '';
            
            // NEW: Show saved by user if available
            const savedBy = trip.savedByUser ? ` - saved by ${trip.savedByUser}` : '';
            
            return `${i + 1}. ${name}${contextText}${savedBy}`;
        }).join('\n');

        const tripName = prompt(
            `Choose a trip to load:\n${tripOptions}\n\nEnter trip name:`
        );

        if (tripName && savedTrips[tripName]) {
            this.state.trip = { ...savedTrips[tripName] };
            
            this.tripSetup.loadTripData(this.state.trip);
            this.updateAllComponents();

            const context = [];
            if (this.state.trip.transportation) context.push(this.state.trip.transportation);
            if (this.state.trip.accommodation) context.push(this.state.trip.accommodation);
            const contextText = context.length > 0 ? ` (${context.join(' + ')})` : '';

            // Enhanced success message
            const userName = this.userProfile ? ` ${this.userProfile.name}` : '';
            this.notification.show(`📂${userName}, loaded trip "${tripName}"${contextText}`, 'success');
        }
    }

    // ===== ENHANCED RESET =====
    
    handleResetTrip() {
        // NEW: Profile-aware reset confirmation
        const userName = this.userProfile ? ` ${this.userProfile.name}` : '';
        const confirmMessage = `Reset current trip${userName}? This will clear all progress but keep your profile.`;
        
        if (confirm(confirmMessage)) {
            this.state.trip = {
                location: '',
                nights: 5,
                tripType: 'business',
                startDate: '',
                notes: '',
                activities: [],
                transportation: '',
                accommodation: '',
                transportationOptions: [],
                accommodationOptions: [],
                weather: null,
                items: {},
                completedItems: [],
                tripInfo: null,
                itinerary: { days: [], progress: {} },
                travelIntelligence: {},
                quickReference: {},
                // NEW: Preserve profile data
                userProfile: this.userProfile,
                homeLocation: this.userProfile ? `${this.userProfile.homeLocation.city}, ${this.userProfile.homeLocation.country}` : null,
                originDestinationIntelligence: null
            };

            this.tripSetup.reset();
            this.storage.clearCurrentTrip();
            this.updateAllComponents();
            this.navigation.switchTab('setup');
            
            // Enhanced reset message
            this.notification.show(`🔄${userName}, trip reset successfully! Your profile is preserved.`, 'info');
        }
    }
// ===== PART 3: COMPLETE INTEGRATION & FINAL METHODS =====

    // ===== ENHANCED COMPONENT UPDATES =====
    
    updateAllComponents() {
        this.updatePackingComponents();
        this.updateItineraryComponents();
        this.updateProgressComponents();
        this.updateOverviewComponents();
        this.updateNavigationProgress();
        
        // NEW: Update profile-aware elements
        this.updateProfileElements();
    }

    updatePackingComponents() {
        if (Object.keys(this.state.trip.items).length > 0) {
            this.checklistDisplay.loadItems(this.state.trip.items, this.state.trip.completedItems);
            this.checklistDisplay.updateTripSummary(this.state.trip);
        }
        
        // Update weather display
        if (this.state.trip.weather) {
            this.weatherDisplay.displayWeather(this.state.trip.weather);
        }
    }

    updateItineraryComponents() {
        if (this.state.trip.itinerary && this.state.trip.itinerary.days.length > 0) {
            this.itineraryDisplay.loadItinerary(this.state.trip.itinerary);
        }
    }

    updateProgressComponents() {
        const progress = this.calculateOverallProgress();
        this.progressTracking.updateProgress(progress);
    }

    updateOverviewComponents() {
        // Enhanced overview with profile context
        const overviewSection = document.getElementById('overview-section');
        if (overviewSection) {
            const hasTrip = this.state.trip.location && this.state.trip.nights;
            const hasItems = Object.keys(this.state.trip.items).length > 0;
            const hasItinerary = this.state.trip.itinerary && this.state.trip.itinerary.days.length > 0;
            
            // NEW: Profile-aware overview
            const greeting = this.userProfile ? `Hi ${this.userProfile.name}!` : 'Welcome to TripMaster!';
            const locationContext = this.userProfile && this.state.trip.location ? 
                `Planning your trip from ${this.userProfile.homeLocation.city} to ${this.state.trip.location}` : 
                'Plan your perfect trip with intelligent packing';
            
            overviewSection.innerHTML = `
                <div class="overview-content">
                    <div class="overview-header">
                        <h2>${greeting}</h2>
                        <p>${locationContext}</p>
                    </div>
                    
                    ${hasTrip ? `
                        <div class="trip-summary">
                            <h3>📋 Current Trip</h3>
                            <div class="trip-details">
                                <div class="detail-item">
                                    <strong>📍 Destination:</strong> ${this.state.trip.location}
                                </div>
                                ${this.userProfile ? `
                                    <div class="detail-item">
                                        <strong>🏠 From:</strong> ${this.userProfile.homeLocation.city}, ${this.userProfile.homeLocation.country}
                                    </div>
                                ` : ''}
                                <div class="detail-item">
                                    <strong>📅 Duration:</strong> ${this.state.trip.nights} nights
                                </div>
                                <div class="detail-item">
                                    <strong>🎯 Type:</strong> ${this.state.trip.tripType}
                                </div>
                                ${this.state.trip.transportation ? `
                                    <div class="detail-item">
                                        <strong>🚗 Transport:</strong> ${Array.isArray(this.state.trip.transportation) ? 
                                            this.state.trip.transportation.join(', ') : this.state.trip.transportation}
                                    </div>
                                ` : ''}
                                ${this.state.trip.accommodation ? `
                                    <div class="detail-item">
                                        <strong>🏨 Stay:</strong> ${Array.isArray(this.state.trip.accommodation) ? 
                                            this.state.trip.accommodation.join(', ') : this.state.trip.accommodation}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : `
                        <div class="getting-started">
                            <h3>🚀 Let's Start Planning!</h3>
                            <p>Click "Setup" to begin creating your intelligent packing list</p>
                            ${!this.userProfile ? `
                                <div class="profile-prompt">
                                    <p>💡 Set up your profile for personalized travel intelligence!</p>
                                </div>
                            ` : ''}
                        </div>
                    `}
                    
                    ${hasItems ? `
                        <div class="packing-summary">
                            <h3>🧳 Packing Progress</h3>
                            <div class="progress-stats">
                                <div class="stat-item">
                                    <strong>Categories:</strong> ${Object.keys(this.state.trip.items).length}
                                </div>
                                <div class="stat-item">
                                    <strong>Items:</strong> ${Object.values(this.state.trip.items).reduce((sum, cat) => sum + Object.keys(cat).length, 0)}
                                </div>
                                <div class="stat-item">
                                    <strong>Completed:</strong> ${this.state.trip.completedItems.length}
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${hasItinerary ? `
                        <div class="itinerary-summary">
                            <h3>📅 Itinerary Overview</h3>
                            <div class="itinerary-stats">
                                <div class="stat-item">
                                    <strong>Days:</strong> ${this.state.trip.itinerary.days.length}
                                </div>
                                <div class="stat-item">
                                    <strong>Stops:</strong> ${this.state.trip.itinerary.days.reduce((sum, day) => sum + day.stops.length, 0)}
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${this.state.trip.travelIntelligence && Object.keys(this.state.trip.travelIntelligence).length > 0 ? `
                        <div class="intelligence-summary">
                            <h3>🧠 Travel Intelligence</h3>
                            <div class="intelligence-items">
                                ${this.state.trip.travelIntelligence.electrical ? `
                                    <div class="intelligence-item">
                                        🔌 ${this.state.trip.travelIntelligence.electrical.needsAdapter ? 
                                            `Adapter needed: ${this.state.trip.travelIntelligence.electrical.adapterType}` : 
                                            'Your plugs work - no adapter needed!'}
                                    </div>
                                ` : ''}
                                ${this.state.trip.travelIntelligence.currency ? `
                                    <div class="intelligence-item">
                                        💱 ${this.state.trip.travelIntelligence.currency.needsExchange ? 
                                            `Currency exchange needed: ${this.state.trip.travelIntelligence.currency.destinationCurrency}` : 
                                            'Same currency - no exchange needed!'}
                                    </div>
                                ` : ''}
                                ${this.state.trip.travelIntelligence.language ? `
                                    <div class="intelligence-item">
                                        🗣️ ${this.state.trip.travelIntelligence.language.sameLanguage ? 
                                            'Same language - easy communication!' : 
                                            `Different language: ${this.state.trip.travelIntelligence.language.destinationLanguage}`}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
    }

    // NEW: Update profile-aware elements throughout the app
    updateProfileElements() {
        // Update any profile-specific UI elements
        if (this.userProfile) {
            // Update navigation greeting
            this.updateNavigationWithProfile();
            
            // Update any profile indicators
            const profileIndicators = document.querySelectorAll('.profile-indicator');
            profileIndicators.forEach(indicator => {
                indicator.textContent = `${this.userProfile.name} (${this.userProfile.homeLocation.city})`;
                indicator.style.display = 'block';
            });
        }
    }

    // ===== ENHANCED NAVIGATION PROGRESS =====
    
    updateNavigationProgress() {
        const setupProgress = this.calculateSetupProgress();
        const packingProgress = this.calculatePackingProgress();
        const itineraryProgress = this.calculateItineraryProgress();
        
        // Enhanced progress with profile awareness
        this.navigation.updateProgress({
            setup: setupProgress,
            packing: packingProgress,
            itinerary: itineraryProgress,
            overall: this.calculateOverallProgress(),
            // NEW: Profile completion status
            profileComplete: !!this.userProfile
        });
    }

    calculateOverallProgress() {
        const setupProgress = this.calculateSetupProgress();
        const packingProgress = this.calculatePackingProgress();
        const itineraryProgress = this.calculateItineraryProgress();
        
        // Weighted average with profile consideration
        const weights = { setup: 0.3, packing: 0.5, itinerary: 0.2 };
        const weighted = (setupProgress * weights.setup) + 
                        (packingProgress * weights.packing) + 
                        (itineraryProgress * weights.itinerary);
        
        return Math.round(weighted);
    }

    calculatePackingProgress() {
        const totalItems = Object.values(this.state.trip.items).reduce((sum, cat) => sum + Object.keys(cat).length, 0);
        const completedItems = this.state.trip.completedItems.length;
        
        if (totalItems === 0) return 0;
        return Math.round((completedItems / totalItems) * 100);
    }

    calculateItineraryProgress() {
        if (!this.state.trip.itinerary || !this.state.trip.itinerary.days.length) return 0;
        
        const totalStops = this.state.trip.itinerary.days.reduce((sum, day) => sum + day.stops.length, 0);
        const completedStops = this.state.trip.itinerary.progress.completedStops?.length || 0;
        
        if (totalStops === 0) return 0;
        return Math.round((completedStops / totalStops) * 100);
    }

    // ===== ITEM HANDLING METHODS (Enhanced) =====
    
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
        
        // NEW: Profile-aware completion messages
        if (!isCompleted && this.userProfile) {
            // Celebratory messages for major milestones
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
        
        // Enhanced success message
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

    // Helper method for activity sync
    addPackingItemsFromActivity(itemPaths) {
        itemPaths.forEach(path => {
            const [category, itemKey] = path.split('.');
            if (!this.state.trip.items[category]) {
                this.state.trip.items[category] = {};
            }
            if (!this.state.trip.items[category][itemKey]) {
                this.state.trip.items[category][itemKey] = { quantity: 1, addedFromActivity: true };
            }
        });
    }

    // ===== ITINERARY HANDLING (Enhanced) =====
    
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
        
        // Enhanced completion messages
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

    // ===== ENHANCED EXPORT FUNCTIONALITY =====
    
    handleExport() {
        try {
            // Enhanced export data with profile context
            const exportData = {
                ...this.state.trip,
                exportedAt: new Date().toISOString(),
                exportedBy: this.userProfile?.name || 'Anonymous',
                exportedFrom: this.userProfile?.homeLocation || null,
                version: '2.1'
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            // Enhanced filename with profile context
            const fileName = this.generateExportFileName();
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = fileName;
            link.click();
            
            // Enhanced success message
            const userName = this.userProfile ? ` ${this.userProfile.name}` : '';
            this.notification.show(`📤${userName}, trip exported as ${fileName}`, 'success');
            
        } catch (error) {
            console.error('Export failed:', error);
            this.notification.show('Export failed. Please try again.', 'error');
        }
    }

    generateExportFileName() {
        const parts = ['tripmaster'];
        
        // Add profile context
        if (this.userProfile && this.state.trip.location) {
            const originCity = this.userProfile.homeLocation.city.replace(/\s+/g, '-').toLowerCase();
            const destCity = this.state.trip.location.split(',')[0].replace(/\s+/g, '-').toLowerCase();
            parts.push(`${originCity}-to-${destCity}`);
        } else if (this.state.trip.location) {
            parts.push(this.state.trip.location.split(',')[0].replace(/\s+/g, '-').toLowerCase());
        }
        
        if (this.state.trip.tripType && this.state.trip.tripType !== 'leisure') {
            parts.push(this.state.trip.tripType);
        }
        
        const date = new Date().toISOString().split('T')[0];
        parts.push(date);
        
        return parts.join('-') + '.json';
    }

    // ===== ENHANCED EVENT BINDING =====
    
    bindEvents() {
        // Enhanced keyboard shortcuts with profile awareness
        document.addEventListener('keydown', (e) => {
            // Ctrl+S / Cmd+S to save (enhanced)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.handleSave();
            }
            
            // Ctrl+E / Cmd+E to export (enhanced)
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.handleExport();
            }
            
            // Ctrl+R / Cmd+R to reset (enhanced with profile protection)
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.handleResetTrip();
            }
            
            // NEW: Ctrl+P / Cmd+P to toggle profile setup
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                if (this.userProfile) {
                    this.showProfileEditDialog();
                } else {
                    this.tripSetup.showProfileSetup();
                }
            }
        });

        // Auto-save functionality (enhanced)
        let autoSaveTimeout;
        const autoSave = () => {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                if (this.state.hasUnsavedChanges) {
                    this.storage.saveTrip(this.state.trip);
                    this.state.hasUnsavedChanges = false;
                    
                    // Subtle auto-save indication
                    const userName = this.userProfile ? ` ${this.userProfile.name}` : '';
                    console.log(`💾 Auto-saved${userName} at ${new Date().toLocaleTimeString()}`);
                }
            }, 2000);
        };

        // Enhanced change detection
        ['input', 'change', 'click'].forEach(eventType => {
            document.addEventListener(eventType, (e) => {
                if (e.target.closest('.trip-setup, .checklist-display, .itinerary-display')) {
                    this.state.hasUnsavedChanges = true;
                    autoSave();
                }
            });
        });

        // File import handlers (enhanced)
        const fileInput = document.getElementById('itineraryFile');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }
    }

    // NEW: Profile edit dialog
    showProfileEditDialog() {
        const currentProfile = this.userProfile;
        const newName = prompt(`Edit your name:`, currentProfile.name);
        
        if (newName && newName !== currentProfile.name) {
            currentProfile.name = newName;
            this.storage.saveUserProfile(currentProfile);
            this.userProfile = currentProfile;
            this.state.trip.userProfile = currentProfile;
            
            this.updateAllComponents();
            this.notification.show(`👤 Profile updated - Hi ${newName}!`, 'success');
        }
    }

    // ===== ENHANCED INITIALIZATION =====
    
    async loadSavedState() {
        if (this.state.profileSetupComplete) {
            // Load the last trip if it exists
            const savedTrip = this.storage.getTrip();
            
            if (savedTrip && savedTrip.location) {
                this.state.trip = { ...savedTrip };
                
                // Ensure profile is properly restored
                if (!this.state.trip.userProfile && this.userProfile) {
                    this.state.trip.userProfile = this.userProfile;
                    this.state.trip.homeLocation = `${this.userProfile.homeLocation.city}, ${this.userProfile.homeLocation.country}`;
                }
                
                this.tripSetup.loadTripData(this.state.trip);
                this.updateAllComponents();
                
                // Enhanced welcome back message
                const userName = this.userProfile ? ` ${this.userProfile.name}` : '';
                console.log(`👋 Welcome back${userName}! Restored your trip to ${this.state.trip.location}`);
                
                // Show trip restoration notification
                setTimeout(() => {
                    if (this.userProfile) {
                        this.notification.show(`👋 Welcome back ${this.userProfile.name}! Restored your trip to ${this.state.trip.location}`, 'info', 3000);
                    }
                }, 1000);
            }
        }
    }

    // ===== FILE UPLOAD HANDLER (Enhanced) =====
    
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const itineraryData = JSON.parse(text);
            
            await this.handleImportItinerary(itineraryData);
            
        } catch (error) {
            console.error('File upload failed:', error);
            this.notification.show('Failed to load itinerary file. Please check the format.', 'error');
        }
    }

    // ===== SAMPLE ITINERARY LOADER (Enhanced) =====
    
    async loadSampleItinerary() {
        try {
            // Enhanced sample loading with profile context
            if (this.userProfile) {
                this.notification.show(`📅 ${this.userProfile.name}, loading sample Athens itinerary...`, 'info', 2000);
            } else {
                this.notification.show('📅 Loading sample Athens itinerary...', 'info', 2000);
            }
            
            const response = await fetch('./itinerary-data.json');
            const itineraryData = await response.json();
            
            await this.handleImportItinerary(itineraryData);
            
        } catch (error) {
            console.error('Failed to load sample itinerary:', error);
            this.notification.show('Sample itinerary not available. Please import your own.', 'error');
        }
    }
}

// ===== ENHANCED INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 TripMaster Phase 2.1 initializing with profile intelligence...');
    
    window.tripmaster = new TripMaster();
    
    // Make sample itinerary loader available globally
    window.loadSampleItinerary = () => window.tripmaster.loadSampleItinerary();
    
    console.log('✅ TripMaster ready with enhanced profile intelligence!');
});

// ===== ENHANCED ERROR HANDLING =====

window.addEventListener('error', (event) => {
    console.error('TripMaster error:', event.error);
    
    // Profile-aware error reporting
    const userProfile = window.tripmaster?.userProfile;
    const context = userProfile ? ` (User: ${userProfile.name})` : '';
    
    console.error(`Error context${context}:`, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        userProfile: userProfile?.name || 'Anonymous'
    });
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('TripMaster unhandled promise rejection:', event.reason);
    
    // Profile-aware promise rejection handling
    const userProfile = window.tripmaster?.userProfile;
    const context = userProfile ? ` (User: ${userProfile.name})` : '';
    
    console.error(`Promise rejection context${context}:`, event.reason);
});

// Export for potential module usage
export default TripMaster;
