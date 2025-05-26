// Trip Setup Component - Enhanced for multiple transportation & accommodation + User Profile
import { createUserProfile, isProfileComplete } from '../data/unified-data-model.js';
import { countriesDatabase } from '../data/countries-database.js';

export class TripSetup {
  constructor(options) {
        this.container = options.container;
        this.onGenerate = options.onGenerate;
        this.onLoad = options.onLoad;
        this.onReset = options.onReset;
        
        // Profile management
        this.storageManager = null;
        this.userProfile = null;
        this.showingProfileSetup = false;
        this.pendingTripData = null; // 🔧 FIX: Store data if DOM not ready
        
        this.render();
    }

    // ===== USER PROFILE SETUP METHODS =====
    
    setStorageManager(storageManager) {
        this.storageManager = storageManager;
        this.userProfile = storageManager ? storageManager.getUserProfile() : null;
    }

    checkProfileSetup() {
        if (!this.storageManager) return false;
        
        this.userProfile = this.storageManager.getUserProfile();
        
        if (!this.userProfile || !isProfileComplete(this.userProfile)) {
            this.showProfileSetup();
            return false;
        }
        return true;
    }

    showProfileSetup() {
        this.showingProfileSetup = true;
        this.container.innerHTML = this.renderProfileSetup();
        this.bindProfileSetupEvents();
    }

    renderProfileSetup() {
        const existingProfile = this.userProfile || {};
        
        return `
            <div class="profile-setup" id="profileSetup">
                <div class="setup-header">
                    <h2>👋 Welcome to TripMaster!</h2>
                    <p>Let's personalize your travel experience</p>
                </div>
                
                <div class="profile-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="userName">What's your first name?</label>
                            <input type="text" id="userName" placeholder="e.g., John" value="${existingProfile.name || ''}">
                            <small>We'll use this to personalize your experience</small>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="homeLocation">Where do you live?</label>
                            <input type="text" id="homeLocation" placeholder="e.g., London, United Kingdom" 
                                   value="${existingProfile.homeLocation ? existingProfile.homeLocation.city + ', ' + existingProfile.homeLocation.country : ''}">
                            <small>This helps us compare weather, plugs, and costs vs your destination</small>
                        </div>
                    </div>
                    
                    <div class="smart-preview" id="smartPreview" style="display: none;">
                        <h4>🧠 What this enables:</h4>
                        <ul id="previewList"></ul>
                    </div>
                    
                    <div class="button-group">
                        <button class="btn btn-primary" id="saveProfileBtn">
                            <span class="btn-icon">✨</span>
                            <span class="btn-text">Save & Continue</span>
                        </button>
                        <button class="btn btn-secondary" id="skipProfileBtn">
                            <span class="btn-text">Skip for Now</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    bindProfileSetupEvents() {
        document.getElementById('saveProfileBtn').addEventListener('click', () => this.handleSaveProfile());
        document.getElementById('skipProfileBtn').addEventListener('click', () => this.handleSkipProfile());
        
        // Show smart preview when both fields filled
        const nameInput = document.getElementById('userName');
        const locationInput = document.getElementById('homeLocation');
        
        const updatePreview = () => {
            const name = nameInput.value.trim();
            const location = locationInput.value.trim();
            
            if (name && location) {
                this.showSmartPreview(name, location);
            } else {
                document.getElementById('smartPreview').style.display = 'none';
            }
        };
        
        nameInput.addEventListener('input', updatePreview);
        locationInput.addEventListener('input', updatePreview);
        
        // Enter key handling
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') locationInput.focus();
        });
        locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSaveProfile();
        });
    }

    showSmartPreview(name, location) {
        const preview = document.getElementById('smartPreview');
        const list = document.getElementById('previewList');
        
        list.innerHTML = `
            <li>🌡️ "${name}, Athens is 8°C colder than ${location.split(',')[0]} - pack warm clothes"</li>
            <li>🔌 "Your UK plugs work in Greece - no adapter needed!"</li>
            <li>💱 "Different currency - you'll need Euros"</li>
            <li>🗣️ "Different language - essential Greek phrases included"</li>
        `;
        
        preview.style.display = 'block';
    }

    async handleSaveProfile() {
        const name = document.getElementById('userName').value.trim();
        const homeLocationInput = document.getElementById('homeLocation').value.trim();
        
        if (!name) {
            alert('Please enter your name');
            return;
        }
        
        if (!homeLocationInput) {
            alert('Please enter your home location');
            return;
        }
        
        try {
            // Parse location
            const parts = homeLocationInput.split(',').map(s => s.trim());
            if (parts.length !== 2) {
                alert('Please enter location as "City, Country"');
                return;
            }
            
            const [city, countryName] = parts;
            const country = countriesDatabase.dropdownList.find(c => 
                c.name.toLowerCase().includes(countryName.toLowerCase())
            );
            
            if (!country) {
                alert(`Country "${countryName}" not found. Please use full country name.`);
                return;
            }
            
            // Create profile
            const profileData = createUserProfile({
                name: name,
                homeCity: city,
                homeCountry: country.name,
                homeCountryCode: country.code
            });
            
// Save profile
if (this.storageManager.saveUserProfile(profileData)) {
            this.userProfile = profileData;
            this.showingProfileSetup = false;
            
            this.render(); // Clean re-render
            
            setTimeout(() => {
                alert(`Welcome ${name}! Profile set up successfully.`);
            }, 100);
        } else {
            alert('Failed to save profile. Please try again.');
        }
        
    } catch (error) {
        console.error('Profile setup error:', error);
        alert('Something went wrong. Please check your location format.');
    }
}

    handleSkipProfile() {
        this.showingProfileSetup = false;
        this.render(); // Show main trip setup without profile
    }

    
    render() {
        // Check if we need to show profile setup first
        if (!this.showingProfileSetup && !this.checkProfileSetup()) {
            return; // Profile setup is now showing
        }

        this.container.innerHTML = `
            <div class="trip-setup" id="tripSetup">
                <h2>🗺️ Plan Your Trip</h2>
                
                <!-- Basic Trip Info Section -->
                <div class="form-section" id="basicInfoSection">
                    <div class="section-header" data-toggle="basicInfo">
                        <h3>📋 Basic Information</h3>
                        <span class="section-toggle">▼</span>
                    </div>
                    <div class="section-content expanded" id="basicInfoContent">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="homeLocation">🏠 From (Your Location)</label>
                                <input type="text" id="homeLocation" placeholder="e.g., London, United Kingdom" 
                                       ${this.userProfile ? `value="${this.userProfile.homeLocation.city}, ${this.userProfile.homeLocation.country}" readonly` : ''}>
                                <small>${this.userProfile ? `Hello ${this.userProfile.name}! We'll use this for intelligent comparisons` : 'Set up your profile for personalized travel intelligence'}</small>
                            </div>
                            <div class="form-group">
                                <label for="location">📍 To (Destination)</label>
                                <input type="text" id="location" placeholder="e.g., Athens, Greece">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="nights">🌙 Number of Nights</label>
                                <input type="number" id="nights" min="1" max="365" value="5">
                            </div>
                            <div class="form-group">
                                <label for="startDate">📅 Start Date</label>
                                <input type="date" id="startDate">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="tripType">🎯 Trip Type</label>
                                <select id="tripType">
                                    <option value="business">Business</option>
                                    <option value="leisure">Leisure</option>
                                    <option value="camping">Camping</option>
                                    <option value="winter-sports">Winter Sports</option>
                                    <option value="beach">Beach</option>
                                    <option value="city-break">City Break</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Travel Details Section - ENHANCED FOR MULTIPLE SELECTIONS -->
                <div class="form-section" id="travelDetailsSection">
                    <div class="section-header" data-toggle="travelDetails">
                        <h3>🚗 Travel Details</h3>
                        <span class="section-toggle">▼</span>
                    </div>
                    <div class="section-content expanded" id="travelDetailsContent">
                        
                        <!-- MULTIPLE TRANSPORTATION -->
                        <div class="form-group">
                            <label>✈️ How are you traveling? <span class="multi-select-hint">(Select all that apply)</span></label>
                            <div class="multi-select-grid transportation-grid">
                                <label class="multi-select-option">
                                    <input type="checkbox" id="transport-plane" value="plane">
                                    <span class="option-icon">✈️</span>
                                    <span class="option-label">Flight</span>
                                </label>
                                <label class="multi-select-option">
                                    <input type="checkbox" id="transport-car" value="car">
                                    <span class="option-icon">🚗</span>
                                    <span class="option-label">Car/Road Trip</span>
                                </label>
                                <label class="multi-select-option">
                                    <input type="checkbox" id="transport-train" value="train">
                                    <span class="option-icon">🚊</span>
                                    <span class="option-label">Train</span>
                                </label>
                                <label class="multi-select-option">
                                    <input type="checkbox" id="transport-ferry" value="ferry">
                                    <span class="option-icon">⛴️</span>
                                    <span class="option-label">Ferry/Boat</span>
                                </label>
                                <label class="multi-select-option">
                                    <input type="checkbox" id="transport-bus" value="bus">
                                    <span class="option-icon">🚌</span>
                                    <span class="option-label">Bus/Coach</span>
                                </label>
                            </div>
                        </div>

                        <!-- MULTIPLE ACCOMMODATION -->
                        <div class="form-group">
                            <label>🏨 Where are you staying? <span class="multi-select-hint">(Select all that apply)</span></label>
                            <div class="multi-select-grid accommodation-grid">
                                <label class="multi-select-option">
                                    <input type="checkbox" id="accommodation-hotel" value="hotel">
                                    <span class="option-icon">🏨</span>
                                    <span class="option-label">Hotel</span>
                                </label>
                                <label class="multi-select-option">
                                    <input type="checkbox" id="accommodation-airbnb" value="airbnb">
                                    <span class="option-icon">🏠</span>
                                    <span class="option-label">Airbnb/Rental</span>
                                </label>
                                <label class="multi-select-option">
                                    <input type="checkbox" id="accommodation-camping" value="camping">
                                    <span class="option-icon">⛺</span>
                                    <span class="option-label">Camping</span>
                                </label>
                                <label class="multi-select-option">
                                    <input type="checkbox" id="accommodation-hostel" value="hostel">
                                    <span class="option-icon">🏨</span>
                                    <span class="option-label">Hostel</span>
                                </label>
                                <label class="multi-select-option">
                                    <input type="checkbox" id="accommodation-family" value="family">
                                    <span class="option-icon">👨‍👩‍👧‍👦</span>
                                    <span class="option-label">Family/Friends</span>
                                </label>
                            </div>
                        </div>

                        <!-- ENHANCED CONDITIONAL OPTIONS -->
                        <div class="conditional-options" id="conditionalOptions" style="display: none;">
                            
                            <!-- Flight Options -->
                            <div class="form-group options-group" id="flightOptionsGroup" style="display: none;">
                                <label>✈️ Flight Details</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" id="internationalFlight" value="international"> International flight</label>
                                    <label><input type="checkbox" id="longHaulFlight" value="longhaul"> Long-haul flight (6+ hours)</label>
                                    <label><input type="checkbox" id="carryOnOnly" value="carryonly"> Carry-on only</label>
                                    <label><input type="checkbox" id="connectingFlights" value="connecting"> Connecting flights</label>
                                </div>
                            </div>

                            <!-- Car Options -->
                            <div class="form-group options-group" id="carOptionsGroup" style="display: none;">
                                <label>🚗 Car Travel Details</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" id="longRoadTrip" value="longtrip"> Long road trip (8+ hours)</label>
                                    <label><input type="checkbox" id="rentalCar" value="rental"> Rental car</label>
                                    <label><input type="checkbox" id="crossBorder" value="crossborder"> Crossing borders</label>
                                    <label><input type="checkbox" id="mountainDriving" value="mountain"> Mountain/difficult terrain</label>
                                </div>
                            </div>

                            <!-- Train Options -->
                            <div class="form-group options-group" id="trainOptionsGroup" style="display: none;">
                                <label>🚊 Train Travel Details</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" id="overnightTrain" value="overnight"> Overnight train</label>
                                    <label><input type="checkbox" id="highSpeedTrain" value="highspeed"> High-speed train</label>
                                    <label><input type="checkbox" id="multipleTrains" value="multiple"> Multiple train changes</label>
                                </div>
                            </div>

                            <!-- Ferry Options -->
                            <div class="form-group options-group" id="ferryOptionsGroup" style="display: none;">
                                <label>⛴️ Ferry Travel Details</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" id="overnightFerry" value="overnight"> Overnight ferry</label>
                                    <label><input type="checkbox" id="roughSeas" value="rough"> Potential rough seas</label>
                                    <label><input type="checkbox" id="carOnFerry" value="withcar"> Taking car on ferry</label>
                                </div>
                            </div>

                            <!-- Hotel Options -->
                            <div class="form-group options-group" id="hotelOptionsGroup" style="display: none;">
                                <label>🏨 Hotel Details</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" id="luxuryHotel" value="luxury"> Luxury/Upscale hotel</label>
                                    <label><input type="checkbox" id="businessHotel" value="business"> Business hotel</label>
                                    <label><input type="checkbox" id="resortHotel" value="resort"> Resort/All-inclusive</label>
                                    <label><input type="checkbox" id="budgetHotel" value="budget"> Budget hotel</label>
                                </div>
                            </div>

                            <!-- Airbnb Options -->
                            <div class="form-group options-group" id="airbnbOptionsGroup" style="display: none;">
                                <label>🏠 Rental Property Details</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" id="entirePlace" value="entire"> Entire place</label>
                                    <label><input type="checkbox" id="sharedSpace" value="shared"> Shared space</label>
                                    <label><input type="checkbox" id="kitchenAccess" value="kitchen"> Full kitchen access</label>
                                    <label><input type="checkbox" id="laundryAccess" value="laundry"> Laundry facilities</label>
                                </div>
                            </div>

                            <!-- Camping Options -->
                            <div class="form-group options-group" id="campingOptionsGroup" style="display: none;">
                                <label>⛺ Camping Details</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" id="tentCamping" value="tent"> Tent camping</label>
                                    <label><input type="checkbox" id="rvCamping" value="rv"> RV/Motorhome</label>
                                    <label><input type="checkbox" id="wildCamping" value="wild"> Wild/dispersed camping</label>
                                    <label><input type="checkbox" id="coldWeatherCamping" value="coldweather"> Cold weather camping</label>
                                </div>
                            </div>

                            <!-- Hostel Options -->
                            <div class="form-group options-group" id="hostelOptionsGroup" style="display: none;">
                                <label>🏨 Hostel Details</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" id="dormRoom" value="dorm"> Dorm room</label>
                                    <label><input type="checkbox" id="privateHostelRoom" value="private"> Private room</label>
                                    <label><input type="checkbox" id="partyHostel" value="party"> Party hostel</label>
                                    <label><input type="checkbox" id="quietHostel" value="quiet"> Quiet/family hostel</label>
                                </div>
                            </div>

                            <!-- Family/Friends Options -->
                            <div class="form-group options-group" id="familyOptionsGroup" style="display: none;">
                                <label>👨‍👩‍👧‍👦 Staying with Family/Friends</label>
                                <div class="checkbox-group">
                                    <label><input type="checkbox" id="familyHome" value="family"> Family home</label>
                                    <label><input type="checkbox" id="friendsPlace" value="friends"> Friends' place</label>
                                    <label><input type="checkbox" id="couchSurfing" value="couch"> Couch surfing</label>
                                    <label><input type="checkbox" id="guestRoom" value="guestroom"> Proper guest room</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
    <!-- Activities Section -->
                <div class="form-section" id="activitiesSection">
                    <div class="section-header" data-toggle="activities">
                        <h3>🎯 Activities & Plans</h3>
                        <span class="section-toggle">▼</span>
                    </div>
                    <div class="section-content" id="activitiesContent">
                        <div class="form-row">
                            <div class="form-group" style="grid-column: 1 / -1;">
                                <label>🎯 Activities (check all that apply):</label>
                                <div class="activities-grid">
                                    <label><input type="checkbox" id="activity-business" value="business"> 💼 Business meetings</label>
                                    <label><input type="checkbox" id="activity-sightseeing" value="sightseeing"> 🏛️ Sightseeing</label>
                                    <label><input type="checkbox" id="activity-hiking" value="hiking"> 🥾 Hiking</label>
                                    <label><input type="checkbox" id="activity-beach" value="beach"> 🏖️ Beach</label>
                                    <label><input type="checkbox" id="activity-workout" value="workout"> 💪 Gym & fitness</label>
                                    <label><input type="checkbox" id="activity-photography" value="photography"> 📸 Photography</label>
                                    <label><input type="checkbox" id="activity-watersports" value="watersports"> 🏄‍♂️ Water sports</label>
                                    <label><input type="checkbox" id="activity-entertainment" value="entertainment"> 🎭 Shows & nightlife</label>
                                    <label><input type="checkbox" id="activity-shopping" value="shopping"> 🛍️ Shopping</label>
                                    <label><input type="checkbox" id="activity-family" value="family"> 👶 Family travel</label>
                                    <label><input type="checkbox" id="activity-relaxation" value="relaxation"> 🧘‍♀️ Relaxation & reading</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group" style="grid-column: 1 / -1;">
                                <label for="notes">📝 Special Notes</label>
                                <textarea id="notes" rows="3" placeholder="Any special requirements, events, or activities... (e.g., 'attending wedding', 'business conference', 'bringing baby')"></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ENHANCED Smart Tips Section -->
                <div class="smart-tips" id="smartTips" style="display: none;">
                    <h4>💡 Smart Tips for Your Trip</h4>
                    <ul id="tipsList"></ul>
                    <div class="trip-complexity" id="tripComplexity" style="display: none;">
                        <span class="complexity-badge">Complex Trip Detected</span>
                        <span class="complexity-description">Extra items will be added for your multi-transport/accommodation journey</span>
                    </div>
                    <div class="workflow-guidance" id="workflowGuidance" style="display: none;">
                        <div class="workflow-step">
                            <span class="step-number">1</span>
                            <span class="step-text">Generate basic packing list</span>
                        </div>
                        <div class="workflow-step">
                            <span class="step-number">2</span>
                            <span class="step-text">Import your itinerary for enhanced recommendations</span>
                        </div>
                        <div class="workflow-step">
                            <span class="step-number">3</span>
                            <span class="step-text">Get activity-specific items automatically added</span>
                        </div>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="button-group">
                    <button class="btn btn-primary" id="generateBtn">
                        <span class="btn-icon">🚀</span>
                        <span class="btn-text">Generate Smart List</span>
                    </button>
                    <button class="btn btn-secondary" id="loadBtn">
                        <span class="btn-icon">📂</span>
                        <span class="btn-text">Load Saved Trip</span>
                    </button>
                    <button class="btn btn-danger" id="resetBtn">
                        <span class="btn-icon">🔄</span>
                        <span class="btn-text">Reset Everything</span>
                    </button>
                </div>
            </div>
        `;
      
this.bindEvents();
this.setDefaultDate();

// Load pending data if exists
if (this.pendingTripData) {
    setTimeout(() => {
        this.loadTripData(this.pendingTripData);
    }, 100);
}
 }
    bindEvents() {
        // Button click handlers
        document.getElementById('generateBtn').addEventListener('click', () => this.handleGenerate());
        document.getElementById('loadBtn').addEventListener('click', () => this.onLoad());
        document.getElementById('resetBtn').addEventListener('click', () => this.onReset());

        // Enter key on location field
        document.getElementById('location').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleGenerate();
            }
        });

        // Section toggle handlers
        document.querySelectorAll('[data-toggle]').forEach(header => {
            header.addEventListener('click', (e) => {
                const sectionId = header.getAttribute('data-toggle');
                this.toggleSection(sectionId);
            });
        });

        // NEW: Multiple transportation change handlers
        document.querySelectorAll('input[id^="transport-"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.handleTransportationChanges();
            });
        });

        // NEW: Multiple accommodation change handlers
        document.querySelectorAll('input[id^="accommodation-"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.handleAccommodationChanges();
            });
        });

        // Trip type change handler (enhanced for multi-select)
        document.getElementById('tripType').addEventListener('change', (e) => {
            this.handleTripTypeChange(e.target.value);
        });

        // Location change handler
        document.getElementById('location').addEventListener('input', (e) => {
            this.handleLocationChange(e.target.value);
        });

        // NEW: Profile setup trigger
        const homeLocationField = document.getElementById('homeLocation');
        if (homeLocationField && !this.userProfile) {
            homeLocationField.addEventListener('click', () => {
                if (confirm('Set up your profile for personalized travel intelligence?')) {
                    this.showProfileSetup();
                }
            });
        }
    }

    // ENHANCED: Handle multiple transportation selections
    handleTransportationChanges() {
        const selectedTransports = this.getSelectedTransportation();
        const conditionalOptions = document.getElementById('conditionalOptions');
        
        // Hide all transport option groups first
        ['flightOptionsGroup', 'carOptionsGroup', 'trainOptionsGroup', 'ferryOptionsGroup'].forEach(groupId => {
            document.getElementById(groupId).style.display = 'none';
        });
        
        // Show relevant option groups for each selected transport
        if (selectedTransports.length > 0) {
            conditionalOptions.style.display = 'block';
            
            selectedTransports.forEach(transport => {
                const groupId = `${transport}OptionsGroup`;
                const group = document.getElementById(groupId);
                if (group) {
                    group.style.display = 'block';
                }
            });
        } else {
            // Only hide if no accommodations are selected either  
            const selectedAccommodations = this.getSelectedAccommodation();
            if (selectedAccommodations.length === 0) {
                conditionalOptions.style.display = 'none';
            }
        }
        
        this.updateSmartTips();
    }

    // ENHANCED: Handle multiple accommodation selections
    handleAccommodationChanges() {
        const selectedAccommodations = this.getSelectedAccommodation();
        const conditionalOptions = document.getElementById('conditionalOptions');
        
        // Hide all accommodation option groups first
        ['hotelOptionsGroup', 'airbnbOptionsGroup', 'campingOptionsGroup', 'hostelOptionsGroup', 'familyOptionsGroup'].forEach(groupId => {
            document.getElementById(groupId).style.display = 'none';
        });
        
        // Show relevant option groups for each selected accommodation
        if (selectedAccommodations.length > 0) {
            conditionalOptions.style.display = 'block';
            
            selectedAccommodations.forEach(accommodation => {
                const groupId = `${accommodation}OptionsGroup`;
                const group = document.getElementById(groupId);
                if (group) {
                    group.style.display = 'block';
                }
            });
        } else {
            // Only hide if no transportation is selected either
            const selectedTransports = this.getSelectedTransportation();
            if (selectedTransports.length === 0) {
                conditionalOptions.style.display = 'none';
            }
        }
        
        this.updateSmartTips();
    }

    // ENHANCED: Smart tips with profile intelligence
    updateSmartTips() {
        const tips = [];
        const selectedTransports = this.getSelectedTransportation();
        const selectedAccommodations = this.getSelectedAccommodation();
        const destination = document.getElementById('location').value;
        
        // NEW: Profile-based intelligence tips
        if (this.userProfile && destination) {
            const destParts = destination.split(',');
            if (destParts.length === 2) {
                const destCity = destParts[0].trim();
                const userName = this.userProfile.name;
                const homeCity = this.userProfile.homeLocation.city;
                
                tips.push(`🧠 ${userName}, we'll compare ${destCity} vs ${homeCity} for weather, plugs, and costs`);
                
                // Add specific intelligence preview
                if (this.userProfile.homeLocation.countryCode !== 'GR' && destination.toLowerCase().includes('greece')) {
                    tips.push('🔌 We\'ll check if your plugs work in Greece');
                    tips.push('🌡️ We\'ll compare current weather between your locations');
                    tips.push('💱 We\'ll check currency differences and exchange needs');
                }
                
                // Show workflow guidance
                if (selectedTransports.length > 0 || selectedAccommodations.length > 0) {
                    document.getElementById('workflowGuidance').style.display = 'block';
                }
            }
        }
        
        // Multi-modal transport tips
        if (selectedTransports.length > 1) {
            tips.push('🚀 Multi-modal trip detected - extra coordination items will be added');
            
            if (selectedTransports.includes('plane') && selectedTransports.includes('car')) {
                tips.push('✈️🚗 Flight + Car: Consider airport car rental pickup logistics');
            }
            
            if (selectedTransports.includes('plane') && selectedTransports.includes('train')) {
                tips.push('✈️🚊 Flight + Train: Plan airport to train station transfers');
            }
            
            if (selectedTransports.includes('ferry') && selectedTransports.includes('car')) {
                tips.push('⛴️🚗 Ferry + Car: Book car deck space in advance');
            }
        }
        
        // Multi-accommodation tips
        if (selectedAccommodations.length > 1) {
            tips.push('🏨 Multiple accommodations - versatile packing items will be added');
            
            if (selectedAccommodations.includes('hotel') && selectedAccommodations.includes('camping')) {
                tips.push('🏨⛺ Hotel + Camping: Pack both comfort and outdoor gear');
            }
            
            if (selectedAccommodations.includes('airbnb') && selectedAccommodations.includes('family')) {
                tips.push('🏠👨‍👩‍👧‍👦 Rental + Family: Bring toiletries for rental, gifts for family');
            }
        }
        
        // Individual transport tips
        selectedTransports.forEach(transport => {
            switch(transport) {
                case 'plane':
                    tips.push('✈️ Remember TSA 3-1-1 rule for carry-on liquids');
                    if (document.getElementById('internationalFlight')?.checked) {
                        tips.push('🛂 Check passport expiration (6+ months validity required)');
                    }
                    break;
                case 'car':
                    tips.push('🚗 Check your car insurance coverage for trip area');
                    tips.push('🗺️ Download offline maps in case of poor signal');
                    break;
                case 'train':
                    tips.push('🚊 Arrive at station 30 minutes early');
                    tips.push('🎧 Bring entertainment for the journey');
                    break;
                case 'ferry':
                    tips.push('⛴️ Pack motion sickness remedies just in case');
                    tips.push('🧥 Bring warm clothes for deck areas');
                    break;
            }
        });
        
        // Individual accommodation tips
        selectedAccommodations.forEach(accommodation => {
            switch(accommodation) {
                case 'hotel':
                    tips.push('🏨 Hotel provides towels and basic toiletries');
                    break;
                case 'airbnb':
                    tips.push('🏠 Bring all toiletries - nothing is provided');
                    break;
                case 'hostel':
                    tips.push('🔒 Bring a padlock for lockers');
                    tips.push('🩴 Flip flops for shared showers');
                    break;
                case 'camping':
                    tips.push('⛺ Check weather forecast for appropriate gear');
                    break;
                case 'family':
                    tips.push('🎁 Consider bringing a host gift');
                    break;
            }
        });
        
        // Show complexity indicator
        const complexityDiv = document.getElementById('tripComplexity');
        const isComplex = selectedTransports.length > 1 || selectedAccommodations.length > 1;
        
        if (isComplex) {
            complexityDiv.style.display = 'block';
        } else {
            complexityDiv.style.display = 'none';
        }
        
        // Show/hide tips section
        const tipsSection = document.getElementById('smartTips');
        const tipsList = document.getElementById('tipsList');
        
        if (tips.length > 0) {
            tipsSection.style.display = 'block';
            tipsList.innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');
        } else {
            tipsSection.style.display = 'none';
        }
    }

    // NEW: Get selected transportation methods
    getSelectedTransportation() {
        const selected = [];
        document.querySelectorAll('input[id^="transport-"]:checked').forEach(checkbox => {
            selected.push(checkbox.value);
        });
        return selected;
    }

    // NEW: Get selected accommodation types
    getSelectedAccommodation() {
        const selected = [];
        document.querySelectorAll('input[id^="accommodation-"]:checked').forEach(checkbox => {
            selected.push(checkbox.value);
        });
        return selected;
    }

    // ENHANCED: Trip data collection with profile integration
    getTripData() {
        // Get selected activities
        const activities = [];
        document.querySelectorAll('input[id^="activity-"]:checked').forEach(checkbox => {
            activities.push(checkbox.value);
        });

        // Get all transportation methods and their options
        const transportation = this.getSelectedTransportation();
        const transportationOptions = [];
        
        // Collect all transport-specific options
        const transportOptionMappings = {
            'internationalFlight': 'international',
            'longHaulFlight': 'longhaul',
            'carryOnOnly': 'carryonly',
            'connectingFlights': 'connecting',
            'longRoadTrip': 'longtrip',
            'rentalCar': 'rental',
            'crossBorder': 'crossborder',
            'mountainDriving': 'mountain',
            'overnightTrain': 'overnight-train',
            'highSpeedTrain': 'highspeed',
            'multipleTrains': 'multiple-trains',
            'overnightFerry': 'overnight-ferry',
            'roughSeas': 'rough',
            'carOnFerry': 'withcar'
        };
        
        Object.entries(transportOptionMappings).forEach(([checkboxId, optionValue]) => {
            if (document.getElementById(checkboxId)?.checked) {
                transportationOptions.push(optionValue);
            }
        });

        // Get all accommodation types and their options
        const accommodation = this.getSelectedAccommodation();
        const accommodationOptions = [];
        
        // Collect all accommodation-specific options
        const accommodationOptionMappings = {
            'luxuryHotel': 'luxury',
            'businessHotel': 'business',
            'resortHotel': 'resort',
            'budgetHotel': 'budget',
            'entirePlace': 'entire',
            'sharedSpace': 'shared',
            'kitchenAccess': 'kitchen',
            'laundryAccess': 'laundry',
            'tentCamping': 'tent',
            'rvCamping': 'rv',
            'wildCamping': 'wild',
            'coldWeatherCamping': 'coldweather',
            'dormRoom': 'dorm',
            'privateHostelRoom': 'private',
            'partyHostel': 'party',
            'quietHostel': 'quiet',
            'familyHome': 'family-home',
            'friendsPlace': 'friends',
            'couchSurfing': 'couch',
            'guestRoom': 'guestroom'
        };
        
        Object.entries(accommodationOptionMappings).forEach(([checkboxId, optionValue]) => {
            if (document.getElementById(checkboxId)?.checked) {
                accommodationOptions.push(optionValue);
            }
        });

        return {
            location: document.getElementById('location').value.trim(),
            nights: parseInt(document.getElementById('nights').value),
            tripType: document.getElementById('tripType').value,
            startDate: document.getElementById('startDate').value,
            notes: document.getElementById('notes').value.trim(),
            activities: activities,
            
            // Arrays instead of single values
            transportation: transportation,
            accommodation: accommodation,
            transportationOptions: transportationOptions,
            accommodationOptions: accommodationOptions,
            
            // NEW: Profile integration
            userProfile: this.userProfile,
            homeLocation: this.userProfile ? 
                `${this.userProfile.homeLocation.city}, ${this.userProfile.homeLocation.country}` : null,
            
            // Complexity indicators
            isMultiModal: transportation.length > 1,
            isMultiAccommodation: accommodation.length > 1,
            complexityScore: transportation.length + accommodation.length
        };
    }

    // ENHANCED: Load trip data with profile awareness
    loadTripData(trip) {
                if (!document.getElementById('location')) {
            this.pendingTripData = trip; // Store for later
            return;
        }
        document.getElementById('location').value = trip.location || '';
        document.getElementById('nights').value = trip.nights || 5;
        document.getElementById('tripType').value = trip.tripType || 'business';
        document.getElementById('startDate').value = trip.startDate || '';
        document.getElementById('notes').value = trip.notes || '';

        // Load activities
        document.querySelectorAll('input[id^="activity-"]').forEach(checkbox => {
            checkbox.checked = trip.activities && trip.activities.includes(checkbox.value);
        });

        // Load multiple transportation selections
        const transportationArray = Array.isArray(trip.transportation) ? trip.transportation : [trip.transportation].filter(Boolean);
        document.querySelectorAll('input[id^="transport-"]').forEach(checkbox => {
            checkbox.checked = transportationArray.includes(checkbox.value);
        });

        // Load multiple accommodation selections
        const accommodationArray = Array.isArray(trip.accommodation) ? trip.accommodation : [trip.accommodation].filter(Boolean);
        document.querySelectorAll('input[id^="accommodation-"]').forEach(checkbox => {
            checkbox.checked = accommodationArray.includes(checkbox.value);
        });

        // Update conditional options display
        this.handleTransportationChanges();
        this.handleAccommodationChanges();

        // Load all options
        if (trip.transportationOptions) {
            const optionMappings = {
                'international': 'internationalFlight',
                'longhaul': 'longHaulFlight',
                'carryonly': 'carryOnOnly',
                'connecting': 'connectingFlights',
                'longtrip': 'longRoadTrip',
                'rental': 'rentalCar',
                'crossborder': 'crossBorder',
                'mountain': 'mountainDriving',
                'overnight-train': 'overnightTrain',
                'highspeed': 'highSpeedTrain',
                'multiple-trains': 'multipleTrains',
                'overnight-ferry': 'overnightFerry',
                'rough': 'roughSeas',
                'withcar': 'carOnFerry'
            };
            
            trip.transportationOptions.forEach(option => {
                const checkboxId = optionMappings[option];
                const checkbox = document.getElementById(checkboxId);
                if (checkbox) checkbox.checked = true;
            });
        }

        // Load accommodation options
        if (trip.accommodationOptions) {
            const accommodationMappings = {
                'luxury': 'luxuryHotel',
                'business': 'businessHotel',
                'resort': 'resortHotel',
                'budget': 'budgetHotel',
                'entire': 'entirePlace',
                'shared': 'sharedSpace',
                'kitchen': 'kitchenAccess',
                'laundry': 'laundryAccess',
                'tent': 'tentCamping',
                'rv': 'rvCamping',
                'wild': 'wildCamping',
                'coldweather': 'coldWeatherCamping',
                'dorm': 'dormRoom',
                'private': 'privateHostelRoom',
                'party': 'partyHostel',
                'quiet': 'quietHostel',
                'family-home': 'familyHome',
                'friends': 'friendsPlace',
                'couch': 'couchSurfing',
                'guestroom': 'guestRoom'
            };
            
            trip.accommodationOptions.forEach(option => {
                const checkboxId = accommodationMappings[option];
                const checkbox = document.getElementById(checkboxId);
                if (checkbox) checkbox.checked = true;
            });
        }
          this.pendingTripData = null;


        // Update smart tips
        this.updateSmartTips();
    }

    // ENHANCED: Reset with profile preservation
    reset() {
        document.getElementById('location').value = '';
        document.getElementById('nights').value = '5';
        document.getElementById('tripType').value = 'business';
        document.getElementById('notes').value = '';
        
        // Reset activities
        document.querySelectorAll('input[id^="activity-"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Reset all transportation checkboxes
        document.querySelectorAll('input[id^="transport-"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Reset all accommodation checkboxes
        document.querySelectorAll('input[id^="accommodation-"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Reset all option checkboxes
        document.querySelectorAll('#conditionalOptions input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Hide conditional options and tips
        document.getElementById('conditionalOptions').style.display = 'none';
        document.getElementById('smartTips').style.display = 'none';
        document.getElementById('workflowGuidance').style.display = 'none';
        
        // Reset section states
        document.getElementById('basicInfoContent').classList.add('expanded');
        document.getElementById('travelDetailsContent').classList.add('expanded');
        document.getElementById('activitiesContent').classList.remove('expanded');
        
        // Reset toggle icons
        document.querySelectorAll('.section-toggle').forEach(toggle => {
            toggle.textContent = '▼';
            toggle.style.transform = 'rotate(180deg)';
        });
        
        this.setDefaultDate();
    }

    // ENHANCED: Generate with profile integration and validation
    handleGenerate() {
        const tripData = this.getTripData();
        
        if (!tripData.location || !tripData.nights) {
            alert('Please enter destination and number of nights');
            return;
        }

        // Enhanced validation for multiple selections
        if (tripData.transportation.length === 0) {
            if (!confirm('No transportation methods selected. The packing list will be more generic without this info. Continue anyway?')) {
                return;
            }
        }

        if (tripData.accommodation.length === 0) {
            if (!confirm('No accommodation types selected. The packing list might miss accommodation-specific items. Continue anyway?')) {
                return;
            }
        }

        // Show complexity warning for very complex trips
        if (tripData.complexityScore > 4) {
            if (!confirm(`Complex trip detected (${tripData.transportation.length} transport methods + ${tripData.accommodation.length} accommodation types). This will generate a comprehensive but potentially long packing list. Continue?`)) {
                return;
            }
        }

        // Profile-aware messaging
        if (this.userProfile) {
            const message = `Perfect ${this.userProfile.name}! Generating your smart packing list with travel intelligence for ${tripData.location}.`;
            console.log(message);
        }

        this.onGenerate(tripData);
    }

    // Keep all existing methods unchanged
    toggleSection(sectionId) {
        const content = document.getElementById(`${sectionId}Content`);
        const toggle = document.querySelector(`[data-toggle="${sectionId}"] .section-toggle`);
        
        if (content.classList.contains('expanded')) {
            content.classList.remove('expanded');
            toggle.textContent = '▶';
            toggle.style.transform = 'rotate(0deg)';
        } else {
            content.classList.add('expanded');
            toggle.textContent = '▼';
            toggle.style.transform = 'rotate(180deg)';
        }
    }

    handleTripTypeChange(tripType) {
        // Enhanced smart defaults for multiple selections with profile awareness
        const suggestions = {
            'business': { 
                transport: ['plane'], 
                accommodation: ['hotel'],
                activities: ['business']
            },
            'camping': { 
                transport: ['car'], 
                accommodation: ['camping'],
                activities: ['hiking']
            },
            'beach': { 
                transport: ['plane'], 
                accommodation: ['hotel'],
                activities: ['beach']
            },
            'city-break': { 
                transport: ['plane', 'train'], 
                accommodation: ['hotel', 'airbnb'],
                activities: ['sightseeing']
            }
        };
        
        const suggestion = suggestions[tripType];
        if (suggestion) {
            // Auto-select suggested transportation
            suggestion.transport.forEach(transport => {
                const checkbox = document.getElementById(`transport-${transport}`);
                if (checkbox && !this.getSelectedTransportation().length) {
                    checkbox.checked = true;
                }
            });
            
            // Auto-select suggested accommodation
            suggestion.accommodation.forEach(accommodation => {
                const checkbox = document.getElementById(`accommodation-${accommodation}`);
                if (checkbox && !this.getSelectedAccommodation().length) {
                    checkbox.checked = true;
                }
            });
            
            // Update displays
            this.handleTransportationChanges();
            this.handleAccommodationChanges();
            
            // Auto-check suggested activities
            if (suggestion.activities) {
                suggestion.activities.forEach(activity => {
                    const checkbox = document.getElementById(`activity-${activity}`);
                    if (checkbox && !checkbox.checked) {
                        checkbox.checked = true;
                    }
                });
            }
        }
        
        this.updateSmartTips();
    }

    handleLocationChange(location) {
        const isInternational = location.includes(',') || 
                               location.toLowerCase().includes('uk') ||
                               location.toLowerCase().includes('europe') ||
                               location.toLowerCase().includes('asia') ||
                               /\b(france|spain|italy|germany|japan|china|canada|mexico)\b/i.test(location);
        
        if (isInternational) {
            const internationalCheckbox = document.getElementById('internationalFlight');
            if (internationalCheckbox) {
                internationalCheckbox.checked = true;
            }
        }
        
        this.updateSmartTips();
    }

    setDefaultDate() {
        const today = new Date();
        document.getElementById('startDate').value = today.toISOString().split('T')[0];
    }
}
