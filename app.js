// app.js - TripMaster Part 1: Core Class & Initialization
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
        console.log('🚀 TripMaster Part 1 initializing...');
        
        // Core state - simplified for Part 1
        this.state = {
            trip: {
                location: '',
                nights: 5,
                tripType: 'leisure',
                startDate: '',
                transportation: [],
                accommodation: [],
                items: {},
                userProfile: null,
                homeLocation: null
            },
            activeTab: 'overview',
            isLoading: false,
            profileSetupComplete: false
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
            this.bindBasicEvents();
            this.showInitialTab();
            
            console.log('✅ TripMaster Part 1 initialized successfully');
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
        
        console.log('✅ All components initialized');
    }

    // ===== NAVIGATION & TAB MANAGEMENT =====
    
    handleTabChange(tabId) {
        console.log('📋 Switching to tab:', tabId);
        
        this.state.activeTab = tabId;
        this.showTab(tabId);
        
        // Update components based on active tab
        switch(tabId) {
            case 'setup':
                // Trip setup handles its own profile check
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
        }
        
        this.updateNavigationProgress();
    }

    showTab(tabId) {
        console.log(`🔄 Showing tab: ${tabId}`);
        
        // Hide all tab content sections
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
            tab.style.display = 'none';
        });
        
        // Show the target tab section
        const targetSection = document.getElementById(`${tabId}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.display = 'block';
            
            // CRITICAL: Force visibility for setup tab
            if (tabId === 'setup') {
                targetSection.style.visibility = 'visible';
                targetSection.style.opacity = '1';
                
                // Also ensure the setup container is visible
                const setupContainer = document.getElementById('trip-setup-section');
                if (setupContainer) {
                    setupContainer.style.display = 'block';
                    setupContainer.style.visibility = 'visible';
                }
                
                console.log(`✅ Setup tab forced visible`);
            }
            
            console.log(`✅ Tab ${tabId} shown successfully`);
        } else {
            console.error(`❌ Tab section ${tabId}-section not found`);
        }
    }

    showInitialTab() {
        // Always start with overview tab, then let user click Setup
        this.navigation.switchTab('overview');
        
        // Force proper tab display
        this.showTab('overview');
        
        console.log(`📋 App initialized - click Setup tab to begin`);
    }

    // ===== PROFILE INTEGRATION =====
    
    updateNavigationWithProfile() {
        if (this.userProfile && this.navigation) {
            // Update navigation component with profile
            this.navigation.setStorageManager(this.storage);
            this.navigation.updateUserProfile(this.userProfile);
            console.log(`👤 Navigation updated for ${this.userProfile.name}`);
        }
    }

    // ===== COMPONENT UPDATE METHODS (Simplified for Part 1) =====
    
    updatePackingComponents() {
        if (Object.keys(this.state.trip.items).length > 0) {
            this.checklistDisplay.loadItems(this.state.trip.items, this.state.trip.completedItems || []);
        }
        
        if (this.state.trip.weather) {
            this.weatherDisplay.displayWeather(this.state.trip.weather);
        }
    }

    updateItineraryComponents() {
        if (this.state.trip.itinerary && this.state.trip.itinerary.days.length > 0) {
            this.itineraryDisplay.render(this.state.trip.itinerary);
        }
    }

    updateOverviewComponents() {
        const overviewSection = document.getElementById('overview-section');
        if (overviewSection) {
            const greeting = this.userProfile ? `Hi ${this.userProfile.name}!` : 'Welcome to TripMaster!';
            const hasTrip = this.state.trip.location && this.state.trip.nights;
            
            overviewSection.innerHTML = `
                <div class="overview-content" style="padding: 20px;">
                    <div class="overview-header">
                        <h2>${greeting}</h2>
                        <p>${hasTrip ? `Planning your trip to ${this.state.trip.location}` : 'Plan your perfect trip with intelligent packing'}</p>
                    </div>
                    
                    ${hasTrip ? `
                        <div class="trip-summary" style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3>📋 Current Trip</h3>
                            <p><strong>📍 Destination:</strong> ${this.state.trip.location}</p>
                            <p><strong>🌙 Duration:</strong> ${this.state.trip.nights} nights</p>
                            <p><strong>🎯 Type:</strong> ${this.state.trip.tripType}</p>
                        </div>
                    ` : `
                        <div class="getting-started" style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3>🚀 Let's Start Planning!</h3>
                            <p>Click "Setup" to begin creating your intelligent packing list</p>
                            ${!this.userProfile ? '<p>💡 Set up your profile for personalized travel intelligence!</p>' : ''}
                        </div>
                    `}
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

    // ===== BASIC EVENT HANDLING =====
    
    bindBasicEvents() {
        // Basic keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.handleSave();
            }
        });

        // Auto-save on changes (simple version)
        let autoSaveTimeout;
        document.addEventListener('input', (e) => {
            if (e.target.closest('.trip-setup, .checklist-display')) {
                clearTimeout(autoSaveTimeout);
                autoSaveTimeout = setTimeout(() => {
                    this.storage.saveTrip(this.state.trip);
                }, 2000);
            }
        });

        console.log('✅ Basic events bound');
    }

    // ===== PLACEHOLDER METHODS (Will be implemented in Parts 2 & 3) =====
    
    handleGenerateTrip(tripData) {
        console.log('🚀 Trip generation requested:', tripData);
        // Will be implemented in Part 2
        alert('Trip generation will be implemented in Part 2');
    }

    handleLoadTrip() {
        console.log('📂 Load trip requested');
        // Will be implemented in Part 2
        alert('Load trip will be implemented in Part 2');
    }

    handleResetTrip() {
        console.log('🔄 Reset trip requested');
        // Will be implemented in Part 2
        alert('Reset trip will be implemented in Part 2');
    }

    handleSave() {
        console.log('💾 Save requested');
        // Will be implemented in Part 3
        alert('Save functionality will be implemented in Part 3');
    }

    handleExport() {
        console.log('📤 Export requested');
        // Will be implemented in Part 3
        alert('Export functionality will be implemented in Part 3');
    }

    // Placeholder event handlers
    handleItemToggle(category, item) { console.log('Item toggle:', category, item); }
    handleItemAdd(category, item, quantity) { console.log('Item add:', category, item, quantity); }
    handleNoteUpdate(category, item, note) { console.log('Note update:', category, item, note); }
    handleStopToggle(stopId, completed) { console.log('Stop toggle:', stopId, completed); }
    handleItineraryNoteUpdate(stopId, note) { console.log('Itinerary note:', stopId, note); }
    handleActivitySync(stopId, activities) { console.log('Activity sync:', stopId, activities); }

    // ===== PROGRESS CALCULATION =====
    
    calculateSetupProgress() {
        const trip = this.state.trip;
        let completed = 0;
        let total = 5;
        
        if (this.userProfile) completed++;
        if (trip.location) completed++;
        if (trip.startDate) completed++;
        if (trip.nights > 0) completed++;
        if (trip.tripType) completed++;
        
        return Math.round((completed / total) * 100);
    }

    calculatePackingProgress() {
        const totalItems = Object.values(this.state.trip.items).reduce((sum, cat) => sum + Object.keys(cat).length, 0);
        const completedItems = (this.state.trip.completedItems || []).length;
        
        if (totalItems === 0) return 0;
        return Math.round((completedItems / totalItems) * 100);
    }
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 DOM loaded, initializing TripMaster...');
    
    try {
        window.tripMaster = new TripMaster();
        console.log('✅ TripMaster successfully created and attached to window');
        
        // Make debugging easier
        window.debugTripMaster = {
            state: () => window.tripMaster.state,
            profile: () => window.tripMaster.userProfile,
            components: () => ({
                navigation: !!window.tripMaster.navigation,
                tripSetup: !!window.tripMaster.tripSetup,
                storage: !!window.tripMaster.storage
            })
        };
        
    } catch (error) {
        console.error('❌ TripMaster initialization failed:', error);
        
        // Show error to user
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #f44336; color: white; padding: 15px; border-radius: 8px; z-index: 1000;';
        errorDiv.textContent = 'TripMaster failed to load. Check console for details.';
        document.body.appendChild(errorDiv);
    }
});

// ===== ERROR HANDLING =====

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

export default TripMaster;
