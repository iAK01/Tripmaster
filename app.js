// app.js - TripMaster application (evolved from your SmartTripPlanner)
import { Navigation } from './components/navigation.js';
import { TripSetup } from './components/trip-setup.js';
import { ChecklistDisplay } from './components/checklist-display.js';
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
        // Enhanced state structure (building on your existing state)
        this.state = {
            // Your existing trip structure enhanced with unified model
            trip: {
                // Basic info (your existing fields enhanced)
                location: '',
                nights: 5,
                tripType: 'business',
                startDate: '',
                notes: '',
                activities: [],
                
                // Your transportation/accommodation enhancements
                transportation: '',
                accommodation: '',
                transportationOptions: [],
                accommodationOptions: [],
                
                // Existing packing structure
                weather: null,
                items: {},
                completedItems: [],
                
                // NEW: Unified model integration
                tripInfo: null,    // Will hold unified trip info
                itinerary: { days: [], progress: {} },
                travelIntelligence: {},
                quickReference: {}
            },
            
            // NEW: Navigation state
            activeTab: 'overview',
            isLoading: false,
            hasUnsavedChanges: false
        };

        // Your existing services
        this.storage = new StorageManager();
        this.listGenerator = new ListGenerator();
        this.notification = new NotificationManager();
        
        // NEW: Location service for intelligence
        this.locationService = new LocationService();
        
        this.initializeComponents();
        this.bindEvents();
        this.loadSavedState();
    }

    initializeComponents() {
        // NEW: Navigation system
        this.navigation = new Navigation({
            container: document.getElementById('navigation-section'),
            onTabChange: (tabId) => this.handleTabChange(tabId)
        });

        // Your existing components (enhanced)
        this.tripSetup = new TripSetup({
            container: document.getElementById('trip-setup-section'),
            onGenerate: (tripData) => this.handleGenerateTrip(tripData),
            onLoad: () => this.handleLoadTrip(),
            onReset: () => this.handleResetTrip()
        });

        this.weatherDisplay = new WeatherDisplay({
            container: document.getElementById('weather-display-section')
        });

        this.progressTracking = new ProgressTracking({
            container: document.getElementById('progress-tracking-section')
        });

        this.checklistDisplay = new ChecklistDisplay({
            container: document.getElementById('checklist-display-section'),
            onItemToggle: (category, item) => this.handleItemToggle(category, item),
            onItemAdd: (category, item, quantity) => this.handleItemAdd(category, item, quantity),
            onNoteUpdate: (category, item, note) => this.handleNoteUpdate(category, item, note)
        });

        this.controlPanel = new ControlPanel({
            container: document.getElementById('control-panel'),
            onExport: () => this.handleExport(),
            onSave: () => this.handleSave(),
            onScrollTop: () => window.scrollTo({ top: 0, behavior: 'smooth' })
        });

        // Initialize tab content visibility
        this.showTab('overview');
    }

    // NEW: Tab management system
    handleTabChange(tabId) {
        this.state.activeTab = tabId;
        this.showTab(tabId);
        
        // Update components based on active tab
        switch(tabId) {
            case 'setup':
                this.tripSetup.loadTripData(this.state.trip);
                break;
                
            case 'packing':
                this.updatePackingComponents();
                break;
                
            case 'itinerary':
                // Future: Update itinerary components
                break;
                
            case 'local-info':
                // Future: Update local info components
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

    // ENHANCED: Your existing handleGenerateTrip with location intelligence
    async handleGenerateTrip(tripData) {
        try {
            this.setLoading(true);
            
            // Your existing enhanced notifications
            this.notification.show('🧠 Analyzing your trip requirements...', 'info', 2000);
            
            // Your existing transport/accommodation messages
            setTimeout(() => {
                if (tripData.transportation) {
                    const transportMessages = {
                        'plane': '✈️ Adding flight-specific items and TSA compliance...',
                        'car': '🚗 Including road trip essentials and emergency kit...',
                        'train': '🚊 Adding train comfort items...',
                        'ferry': '⛴️ Including ferry travel preparations...',
                        'bus': '🚌 Adding bus travel comfort items...'
                    };
                    this.notification.show(transportMessages[tripData.transportation] || 'Adding transportation items...', 'info', 2000);
                }
            }, 1000);

            setTimeout(() => {
                if (tripData.accommodation) {
                    const accommodationMessages = {
                        'hotel': '🏨 Optimizing for hotel stay (toiletries provided)...',
                        'airbnb': '🏠 Adding vacation rental essentials (bring everything)...',
                        'camping': '⛺ Including complete camping setup...',
                        'hostel': '🏨 Adding hostel security and shared facility items...',
                        'family': '👨‍👩‍👧‍👦 Including courtesy items for family stay...'
                    };
                    this.notification.show(accommodationMessages[tripData.accommodation] || 'Adding accommodation items...', 'info', 2000);
                }
            }, 2000);

            // Update state with trip data (your existing logic)
            Object.assign(this.state.trip, tripData);

            // NEW: Try to get location intelligence
            try {
                this.notification.show('🌍 Getting location intelligence...', 'info', 1500);
                const locationResult = await this.locationService.enrichTripLocations(
                    'Your Location', // Could be made configurable
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
                }
            } catch (locationError) {
                console.warn('Location intelligence failed:', locationError);
                // Continue without it - your existing flow still works
            }

            // Your existing weather fetching
            if (tripData.location) {
                await this.weatherDisplay.fetchWeather(tripData.location, tripData.nights);
                this.state.trip.weather = this.weatherDisplay.getWeatherData();
            }

            // Your existing item generation (enhanced with location data)
            const generatedItems = await this.listGenerator.generateItems({
                ...tripData,
                weather: this.state.trip.weather,
                travelIntelligence: this.state.trip.travelIntelligence
            });

            this.state.trip.items = generatedItems;

            // Update all components
            this.updateAllComponents();

            // Save state
            this.storage.saveTrip(this.state.trip);
            this.state.hasUnsavedChanges = false;

            // Your existing success notification with context
            const contextInfo = [];
            if (tripData.transportation) contextInfo.push(tripData.transportation);
            if (tripData.accommodation) contextInfo.push(tripData.accommodation);
            
            const contextText = contextInfo.length > 0 ? ` for ${contextInfo.join(' + ')}` : '';
            this.notification.show(`🎯 Smart trip plan generated${contextText}!`, 'success', 4000);

            // Your existing insights
            this.showGenerationInsights(tripData, generatedItems);

            // NEW: Switch to overview to show results
            this.navigation.switchTab('overview');

        } catch (error) {
            console.error('Error generating trip:', error);
            this.notification.show('Failed to generate trip plan. Please try again.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    // Your existing showGenerationInsights method
    showGenerationInsights(tripData, items) {
        const insights = [];
        const categoryCount = Object.keys(items).length;
        let totalItems = 0;
        
        for (const categoryItems of Object.values(items)) {
            totalItems += Object.keys(categoryItems).length;
        }

        // Your existing transport-specific insights
        if (tripData.transportation === 'plane') {
            if (tripData.transportationOptions?.includes('international')) {
                insights.push('🌍 International flight requirements added');
            }
            if (tripData.transportationOptions?.includes('carryonly')) {
                insights.push('🧳 Carry-on restrictions applied');
            }
        }

        // Your existing accommodation-specific insights
        if (tripData.accommodation === 'hotel') {
            insights.push('🏨 Hotel amenities considered - basic toiletries excluded');
        } else if (tripData.accommodation === 'camping') {
            insights.push('⛺ Complete camping self-sufficiency included');
        }

        // NEW: Location intelligence insights
        if (this.state.trip.travelIntelligence?.electrical?.needsAdapter) {
            insights.push('🔌 Electrical adapter requirement detected');
        }
        if (this.state.trip.travelIntelligence?.currency?.needsExchange) {
            insights.push('💱 Currency exchange needed');
        }

        // Show summary insight
        setTimeout(() => {
            this.notification.show(
                `📊 Generated ${totalItems} items across ${categoryCount} categories`, 
                'info', 
                3000
            );
        }, 3000);

        // Show specific insights
        insights.forEach((insight, index) => {
            setTimeout(() => {
                this.notification.show(insight, 'info', 2500);
            }, 4000 + (index * 1500));
        });
    }

    // Your existing methods (mostly unchanged)
    handleItemToggle(category, itemName) {
        if (this.state.trip.items[category] && this.state.trip.items[category][itemName]) {
            const item = this.state.trip.items[category][itemName];
            item.completed = !item.completed;

            this.checklistDisplay.updateItem(category, itemName, item);
            this.updateNavigationProgress();
            this.storage.saveTrip(this.state.trip);

            const categoryName = this.getCategoryDisplayName(category);
            if (item.completed) {
                this.notification.show(`✅ ${itemName} packed! (${categoryName})`, 'success', 2000);
            } else {
                this.notification.show(`📦 ${itemName} unpacked (${categoryName})`, 'info', 2000);
            }
        }
    }

    getCategoryDisplayName(categoryKey) {
        const categoryNames = {
            'flight_essentials': 'Flight Essentials',
            'carry_on_items': 'Carry-On',
            'hotel_essentials': 'Hotel',
            'airbnb_essentials': 'Vacation Rental',
            'car_travel': 'Road Trip',
            'international_travel': 'International',
        };
        return categoryNames[categoryKey] || categoryKey.replace('_', ' ');
    }

    handleItemAdd(category, itemName, quantity) {
        if (!this.state.trip.items[category]) {
            this.state.trip.items[category] = {};
        }

        this.state.trip.items[category][itemName] = {
            quantity: quantity,
            essential: false,
            completed: false,
            notes: '',
            custom: true
        };

        this.updatePackingComponents();
        this.storage.saveTrip(this.state.trip);

        const categoryName = this.getCategoryDisplayName(category);
        this.notification.show(`✨ Added "${itemName}" to ${categoryName}`, 'success');
    }

    handleNoteUpdate(category, itemName, note) {
        if (this.state.trip.items[category] && this.state.trip.items[category][itemName]) {
            this.state.trip.items[category][itemName].notes = note;
            this.storage.saveTrip(this.state.trip);
            this.state.hasUnsavedChanges = false;
        }
    }

    // Your existing methods enhanced
    async handleSave() {
        const savedTrips = await this.storage.getSavedTrips();
        const defaultName = this.generateTripName(this.state.trip);
        const tripName = prompt('Enter a name for this trip:', defaultName);
        
        if (!tripName) return;

        savedTrips[tripName] = { ...this.state.trip };
        this.storage.saveTripToLibrary(tripName, this.state.trip);
        
        const context = [];
        if (this.state.trip.transportation) context.push(this.state.trip.transportation);
        if (this.state.trip.accommodation) context.push(this.state.trip.accommodation);
        const contextText = context.length > 0 ? ` (${context.join(' + ')})` : '';
        
        this.notification.show(`💾 Trip "${tripName}" saved${contextText}!`, 'success');
    }

    generateTripName(trip) {
        const parts = [];
        
        if (trip.location) parts.push(trip.location);
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

    async handleLoadTrip() {
        const savedTrips = await this.storage.getSavedTrips();
        const tripNames = Object.keys(savedTrips);

        if (tripNames.length === 0) {
            this.notification.show('No saved trips found', 'info');
            return;
        }

        const tripOptions = tripNames.map((name, i) => {
            const trip = savedTrips[name];
            const context = [];
            if (trip.transportation) context.push(trip.transportation);
            if (trip.accommodation) context.push(trip.accommodation);
            const contextText = context.length > 0 ? ` (${context.join(' + ')})` : '';
            return `${i + 1}. ${name}${contextText}`;
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

            this.notification.show(`📂 Loaded trip "${tripName}"${contextText}`, 'success');
        }
    }

    handleResetTrip() {
        if (confirm('Reset current trip? This will clear all progress.')) {
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
                quickReference: {}
            };

            this.tripSetup.reset();
            this.storage.clearCurrentTrip();
            this.updateAllComponents();
            this.navigation.switchTab('setup');
            this.notification.show('🔄 Trip reset successfully!', 'info');
        }
    }

    async handleExport() {
        const exportText = await this.listGenerator.exportToText(this.state.trip);
        
        const filenameParts = ['tripmaster'];
        if (this.state.trip.location) filenameParts.push(this.state.trip.location.replace(/[^a-zA-Z0-9]/g, '-'));
        if (this.state.trip.transportation) filenameParts.push(this.state.trip.transportation);
        if (this.state.trip.accommodation) filenameParts.push(this.state.trip.accommodation);
        filenameParts.push(new Date().toISOString().split('T')[0]);
        
        const filename = filenameParts.join('-') + '.txt';
        
        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.notification.show('📤 Complete trip data exported!', 'success');
    }

    // Component update methods
    updatePackingComponents() {
        if (Object.keys(this.state.trip.items).length > 0) {
            if (this.state.trip.weather) {
                this.weatherDisplay.render(this.state.trip.weather);
            }
            this.checklistDisplay.render(this.state.trip.items, this.state.trip);
            this.progressTracking.update(this.calculateProgress());
        }
    }

    updateOverviewComponents() {
        // Future: Overview dashboard
        this.updateNavigationProgress();
    }

    updateAllComponents() {
        this.updatePackingComponents();
        this.updateOverviewComponents();
    }

    updateNavigationProgress() {
        const progress = {
            setup: this.calculateSetupProgress(),
            packing: this.calculateProgress().percentage,
            itinerary: 0, // Future
            documents: 0  // Future
        };
        
        this.navigation.updateProgress(progress);
        
        const packingItems = this.getTotalPackingItems();
        if (packingItems > 0) {
            this.navigation.updateTabBadge('packing', packingItems);
        }
    }

    calculateSetupProgress() {
        const trip = this.state.trip;
        let completed = 0;
        let total = 5;
        
        if (trip.location) completed++;
        if (trip.startDate) completed++;
        if (trip.nights > 0) completed++;
        if (trip.tripType) completed++;
        if (trip.transportation || trip.accommodation) completed++;
        
        return Math.round((completed / total) * 100);
    }

    calculateProgress() {
        let totalItems = 0;
        let completedItems = 0;

        for (const items of Object.values(this.state.trip.items)) {
            for (const item of Object.values(items)) {
                totalItems++;
                if (item.completed) completedItems++;
            }
        }

        return {
            total: totalItems,
            completed: completedItems,
            percentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
        };
    }

    getTotalPackingItems() {
        let total = 0;
        for (const items of Object.values(this.state.trip.items)) {
            total += Object.keys(items).length;
        }
        return total;
    }

    // Utility methods
    setLoading(isLoading) {
        this.state.isLoading = isLoading;
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.toggle('hidden', !isLoading);
        }
    }

    bindEvents() {
        // Your existing global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.handleSave();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.handleExport();
                        break;
                    case 'r':
                        if (e.shiftKey) {
                            e.preventDefault();
                            this.handleResetTrip();
                        }
                        break;
                }
            }
        });

        // Your existing auto-save
        setInterval(() => {
            if (Object.keys(this.state.trip.items).length > 0) {
                this.storage.saveTrip(this.state.trip);
            }
        }, 30000);

        // Your existing save on page unload
        window.addEventListener('beforeunload', () => {
            this.storage.saveTrip(this.state.trip);
        });
    }

    async loadSavedState() {
        const savedTrip = await this.storage.getCurrentTrip();
        
        if (savedTrip && savedTrip.location) {
            // Your existing backward compatibility logic
            this.state.trip = {
                ...this.state.trip,
                ...savedTrip,
                transportation: savedTrip.transportation || '',
                accommodation: savedTrip.accommodation || '',
                transportationOptions: savedTrip.transportationOptions || [],
                accommodationOptions: savedTrip.accommodationOptions || []
            };
            
            this.tripSetup.loadTripData(this.state.trip);
            
            if (Object.keys(savedTrip.items).length > 0) {
                this.updateAllComponents();
                
                const context = [];
                if (this.state.trip.transportation) context.push(this.state.trip.transportation);
                if (this.state.trip.accommodation) context.push(this.state.trip.accommodation);
                const contextText = context.length > 0 ? ` (${context.join(' + ')})` : '';
                
                this.notification.show(`🔄 Previous trip restored${contextText}`, 'info', 3000);
            }
            
            // Load saved tab
            this.navigation.loadSavedTab();
        } else {
            // No saved trip, show setup tab
            this.navigation.switchTab('setup');
        }
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tripMaster = new TripMaster();
});
