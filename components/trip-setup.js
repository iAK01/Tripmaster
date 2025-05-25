// Trip Setup Component - Enhanced for multiple transportation & accommodation
export class TripSetup {
    constructor(options) {
        this.container = options.container;
        this.onGenerate = options.onGenerate;
        this.onLoad = options.onLoad;
        this.onReset = options.onReset;
        
        this.render();
        this.bindEvents();
        this.setDefaultDate();
    }

    render() {
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
                                <label for="location">📍 Destination</label>
                                <input type="text" id="location" placeholder="e.g., Athens, Greece">
                            </div>
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
                
                <!-- Activities Section (unchanged) -->
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
                    <h4>💡 Smart Tips for Your Multi-Modal Trip</h4>
                    <ul id="tipsList"></ul>
                    <div class="trip-complexity" id="tripComplexity" style="display: none;">
                        <span class="complexity-badge">Complex Trip Detected</span>
                        <span class="complexity-description">Extra items will be added for your multi-transport/accommodation journey</span>
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
    }

    bindEvents() {
        // Button click handlers (unchanged)
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

    // ENHANCED: Smart tips for multiple selections
    updateSmartTips() {
        const tips = [];
        const selectedTransports = this.getSelectedTransportation();
        const selectedAccommodations = this.getSelectedAccommodation();
        const location = document.getElementById('location').value;
        
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
        
        // Individual transport tips (your existing logic)
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
        
        // Individual accommodation tips (your existing logic)
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

    // ENHANCED: Trip data collection for multiple selections
    getTripData() {
        // Get selected activities (unchanged)
        const activities = [];
        document.querySelectorAll('input[id^="activity-"]:checked').forEach(checkbox => {
            activities.push(checkbox.value);
        });

        // NEW: Get all transportation methods and their options
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

        // NEW: Get all accommodation types and their options
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
            
            // ENHANCED: Arrays instead of single values
            transportation: transportation,
            accommodation: accommodation,
            transportationOptions: transportationOptions,
            accommodationOptions: accommodationOptions,
            
            // NEW: Complexity indicators
            isMultiModal: transportation.length > 1,
            isMultiAccommodation: accommodation.length > 1,
            complexityScore: transportation.length + accommodation.length
        };
    }

    // ENHANCED: Load trip data with multiple selections
    loadTripData(trip) {
        document.getElementById('location').value = trip.location || '';
        document.getElementById('nights').value = trip.nights || 5;
        document.getElementById('tripType').value = trip.tripType || 'business';
        document.getElementById('startDate').value = trip.startDate || '';
        document.getElementById('notes').value = trip.notes || '';

        // Load activities
        document.querySelectorAll('input[id^="activity-"]').forEach(checkbox => {
            checkbox.checked = trip.activities && trip.activities.includes(checkbox.value);
        });

        // NEW: Load multiple transportation selections
        const transportationArray = Array.isArray(trip.transportation) ? trip.transportation : [trip.transportation].filter(Boolean);
        document.querySelectorAll('input[id^="transport-"]').forEach(checkbox => {
            checkbox.checked = transportationArray.includes(checkbox.value);
        });

        // NEW: Load multiple accommodation selections
        const accommodationArray = Array.isArray(trip.accommodation) ? trip.accommodation : [trip.accommodation].filter(Boolean);
        document.querySelectorAll('input[id^="accommodation-"]').forEach(checkbox => {
            checkbox.checked = accommodationArray.includes(checkbox.value);
        });

        // Update conditional options display
        this.handleTransportationChanges();
        this.handleAccommodationChanges();

        // Load all options (enhanced to handle more options)
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

        // Update smart tips
        this.updateSmartTips();
    }

    // ENHANCED: Reset with multiple selections
    reset() {
        document.getElementById('location').value = '';
        document.getElementById('nights').value = '5';
        document.getElementById('tripType').value = 'business';
        document.getElementById('notes').value = '';
        
        // Reset activities
        document.querySelectorAll('input[id^="activity-"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // NEW: Reset all transportation checkboxes
        document.querySelectorAll('input[id^="transport-"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // NEW: Reset all accommodation checkboxes
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

    // ENHANCED: Generate with validation for multiple selections
    handleGenerate() {
        const tripData = this.getTripData();
        
        if (!tripData.location || !tripData.nights) {
            alert('Please enter destination and number of nights');
            return;
        }

        // ENHANCED: Validation for multiple selections
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
        // Enhanced smart defaults for multiple selections
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
