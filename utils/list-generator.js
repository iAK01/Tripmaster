// Enhanced List Generator - handles multiple transportation & accommodation
import { itemsDatabase } from '../data/items-database.js';
import { conditionalRules } from '../data/conditional-rules.js';

export class ListGenerator {
    constructor() {
        this.itemsDB = itemsDatabase;
        this.rules = conditionalRules;
    }

    async generateItems(tripData) {
        const items = {};
        
        // Step 1: Add essential base items
        this.addEssentialItems(items, tripData);
        
        // Step 2: Calculate average temperature if weather data exists
        const avgTemp = this.calculateAverageTemperature(tripData.weather);
        
        // Step 3: Add temperature-appropriate clothing
        this.addTemperatureClothing(items, avgTemp, tripData.nights);
        
        // Step 4: Add conditional items based on various factors
        this.addConditionalItems(items, tripData);
        
        // ENHANCED Step 5: Add ALL transportation-specific items
        this.addAllTransportationItems(items, tripData);
        
        // ENHANCED Step 6: Add ALL accommodation-specific items
        this.addAllAccommodationItems(items, tripData);
        
        // ENHANCED Step 7: Add multi-modal combination items
        this.addMultiModalCombinationItems(items, tripData);
        
        // Step 8: Remove replaced items (enhanced with new rules)
        this.removeReplacedItems(items, tripData);
        
        // Step 9: Adjust quantities based on trip duration
        this.adjustQuantities(items, tripData.nights);
        
        // ENHANCED Step 10: Apply multi-modal priority filtering
        this.applyMultiModalPriorityFiltering(items, tripData);
        
        return items;
    }

    // ENHANCED: Add items for ALL selected transportation methods
    addAllTransportationItems(items, tripData) {
        const transportationArray = Array.isArray(tripData.transportation) ? 
            tripData.transportation : [tripData.transportation].filter(Boolean);
        
        if (transportationArray.length === 0) return;

        transportationArray.forEach(transportType => {
            // Add basic transport items
            this.addSingleTransportationItems(items, transportType, tripData);
            
            // Add transport-specific options
            this.addTransportSpecificOptions(items, transportType, tripData);
        });

        // Add multi-transport coordination items
        if (transportationArray.length > 1) {
            this.addMultiTransportCoordinationItems(items, transportationArray, tripData);
        }
    }

    // ENHANCED: Add items for ALL selected accommodation types
    addAllAccommodationItems(items, tripData) {
        const accommodationArray = Array.isArray(tripData.accommodation) ? 
            tripData.accommodation : [tripData.accommodation].filter(Boolean);
        
        if (accommodationArray.length === 0) return;

        accommodationArray.forEach(accommodationType => {
            // Add basic accommodation items
            this.addSingleAccommodationItems(items, accommodationType, tripData);
            
            // Add accommodation-specific options
            this.addAccommodationSpecificOptions(items, accommodationType, tripData);
        });

        // Add multi-accommodation coordination items
        if (accommodationArray.length > 1) {
            this.addMultiAccommodationCoordinationItems(items, accommodationArray, tripData);
        }
    }

    // NEW: Add coordination items for multiple transport methods
    addMultiTransportCoordinationItems(items, transportArray, tripData) {
        this.addItemsToCategory(
            items,
            'multi_transport_coordination',
            {
                'Travel coordination folder': { multiplier: 0, essential: true, 
                  description: 'Keep all tickets, reservations, and schedules organized' },
                'Transport backup contacts': { multiplier: 0, essential: true, 
                  description: 'Contact info for all transport providers' },
                'Extra buffer time planning': { multiplier: 0, essential: true, 
                  description: 'Account for delays between transport modes' },
                'Digital backup of all tickets': { multiplier: 0, essential: true, 
                  description: 'Screenshots/PDFs of all reservations' }
            },
            `${transportArray.length} transport modes`,
            tripData.nights
        );

        // Specific multi-modal combinations
        if (transportArray.includes('plane') && transportArray.includes('car')) {
            this.addItemsToCategory(
                items,
                'flight_to_car_transition',
                {
                    'Airport car rental confirmation': { multiplier: 0, essential: true },
                    'Flight arrival notification for rental': { multiplier: 0, essential: true },
                    'Airport shuttle backup plan': { multiplier: 0, essential: false },
                    'Car rental inspection checklist': { multiplier: 0, essential: true }
                },
                'flight to car rental transition',
                tripData.nights
            );
        }

        if (transportArray.includes('plane') && transportArray.includes('train')) {
            this.addItemsToCategory(
                items,
                'flight_to_train_transition',
                {
                    'Airport to train station route': { multiplier: 0, essential: true },
                    'Train ticket booking confirmation': { multiplier: 0, essential: true },
                    'Local transport between connections': { multiplier: 0, essential: true },
                    'Connection time buffer calculation': { multiplier: 0, essential: true }
                },
                'flight to train transition',
                tripData.nights
            );
        }

        if (transportArray.includes('ferry') && transportArray.includes('car')) {
            this.addItemsToCategory(
                items,
                'ferry_car_coordination',
                {
                    'Ferry car deck reservation': { multiplier: 0, essential: true },
                    'Vehicle documentation for ferry': { multiplier: 0, essential: true },
                    'Ferry boarding time buffer': { multiplier: 0, essential: true },
                    'Car safety check before ferry': { multiplier: 0, essential: false }
                },
                'car ferry combination',
                tripData.nights
            );
        }
    }

    // NEW: Add coordination items for multiple accommodation types
    addMultiAccommodationCoordinationItems(items, accommodationArray, tripData) {
        this.addItemsToCategory(
            items,
            'multi_accommodation_coordination',
            {
                'Accommodation transition schedule': { multiplier: 0, essential: true, 
                  description: 'Check-in/out times and logistics for all stays' },
                'Flexible packing strategy': { multiplier: 0, essential: true, 
                  description: 'Pack for different accommodation requirements' },
                'Key/access coordination': { multiplier: 0, essential: true, 
                  description: 'Manage different check-in procedures' },
                'Luggage transition planning': { multiplier: 0, essential: true, 
                  description: 'Storage between accommodation changes' }
            },
            `${accommodationArray.length} accommodation types`,
            tripData.nights
        );

        // Specific accommodation combinations
        if (accommodationArray.includes('hotel') && accommodationArray.includes('camping')) {
            this.addItemsToCategory(
                items,
                'hotel_camping_combination',
                {
                    'Luxury to rugged transition items': { multiplier: 0, essential: true, 
                      description: 'Items that work for both hotel comfort and camping' },
                    'Hotel laundry before camping': { multiplier: 0, essential: false, 
                      description: 'Clean clothes for outdoor portion' },
                    'Camping gear storage during hotel': { multiplier: 0, essential: true, 
                      description: 'Where to leave camping equipment' }
                },
                'hotel to camping transition',
                tripData.nights
            );
        }

        if (accommodationArray.includes('airbnb') && accommodationArray.includes('family')) {
            this.addItemsToCategory(
                items,
                'rental_family_combination',
                {
                    'Host gifts for family portion': { multiplier: 0, essential: true, 
                      description: 'Thoughtful gifts for family hosts' },
                    'Rental cleaning supplies': { multiplier: 0, essential: true, 
                      description: 'Clean rental before moving to family' },
                    'Different courtesy levels prep': { multiplier: 0, essential: false, 
                      description: 'Adjust behavior for different host relationships' }
                },
                'rental to family transition',
                tripData.nights
            );
        }
    }

    // ENHANCED: Add complex multi-modal combination items
    addMultiModalCombinationItems(items, tripData) {
        const transportArray = Array.isArray(tripData.transportation) ? 
            tripData.transportation : [tripData.transportation].filter(Boolean);
        const accommodationArray = Array.isArray(tripData.accommodation) ? 
            tripData.accommodation : [tripData.accommodation].filter(Boolean);

        // Only proceed if we have both transport and accommodation selections
        if (transportArray.length === 0 || accommodationArray.length === 0) return;

        // Generate all transport + accommodation combinations
        transportArray.forEach(transport => {
            accommodationArray.forEach(accommodation => {
                this.addSpecificCombinationItems(items, transport, accommodation, tripData);
            });
        });

        // Add items for highly complex trips (3+ transport OR 3+ accommodation)
        const complexityScore = transportArray.length + accommodationArray.length;
        if (complexityScore >= 5) {
            this.addHighComplexityItems(items, tripData, complexityScore);
        }
    }

    // NEW: Add items for high complexity trips
    addHighComplexityItems(items, tripData, complexityScore) {
        this.addItemsToCategory(
            items,
            'high_complexity_management',
            {
                'Master trip timeline document': { multiplier: 0, essential: true, 
                  description: 'Detailed schedule with all transport and accommodation' },
                'Emergency backup plans': { multiplier: 0, essential: true, 
                  description: 'Alternative options for each leg of journey' },
                'Complex trip communication plan': { multiplier: 0, essential: true, 
                  description: 'Keep contacts informed of your complex itinerary' },
                'Travel insurance for complex trips': { multiplier: 0, essential: false, 
                  description: 'Extra coverage for multi-modal journey risks' },
                'Redundant charging solutions': { multiplier: 0, essential: true, 
                  description: 'Multiple ways to charge devices across all modes' }
            },
            `highly complex trip (${complexityScore} modes)`,
            tripData.nights
        );
    }

    // Enhanced single transport method handler
    addSingleTransportationItems(items, transportType, tripData) {
        // Check basic transportation rules (your existing logic)
        const transportRule = this.rules.transportation[transportType];
        if (transportRule && transportRule.trigger(transportType)) {
            if (transportRule.items) {
                for (const [categoryKey, categoryItems] of Object.entries(transportRule.items)) {
                    this.addItemsToCategory(
                        items,
                        categoryKey,
                        categoryItems,
                        `${transportType} travel`,
                        tripData.nights
                    );
                }
            }
        }

        // Add items from database
        const transportItems = this.itemsDB.transportation_specific[`${transportType}_items`];
        if (transportItems) {
            this.addItemsToCategory(
                items,
                `${transportType}_essentials`,
                transportItems,
                `${transportType} travel`,
                tripData.nights
            );
        }
    }

    // Enhanced transport-specific options handler
    addTransportSpecificOptions(items, transportType, tripData) {
        const { transportationOptions = [] } = tripData;
        
        if (transportType === 'plane') {
            // International flight items
            if (transportationOptions.includes('international') || this.isInternationalTrip(tripData)) {
                this.addItemsToCategory(
                    items,
                    'international_flight_items',
                    {
                        'Passport': { multiplier: 0, essential: true },
                        'Visa documents': { multiplier: 0, essential: false },
                        'Currency exchange info': { multiplier: 0, essential: true },
                        'International phone plan': { multiplier: 0, essential: true },
                        'Electrical adapter': { multiplier: 0, essential: true },
                        'Embassy contact information': { multiplier: 0, essential: true }
                    },
                    'international flight',
                    tripData.nights
                );
            }
            
            // Long-haul and connecting flights
            if (transportationOptions.includes('longhaul') || transportationOptions.includes('connecting')) {
                this.addItemsToCategory(
                    items,
                    'long_flight_comfort',
                    {
                        'Compression socks': { multiplier: 0, essential: true },
                        'Neck pillow': { multiplier: 0, essential: true },
                        'Eye mask and ear plugs': { multiplier: 0, essential: true },
                        'Extra entertainment': { multiplier: 0, essential: false },
                        'Snacks for long journey': { multiplier: 0, essential: true },
                        'Layover activity plan': { multiplier: 0, essential: false }
                    },
                    'long/connecting flights',
                    tripData.nights
                );
            }
            
            // Carry-on only restrictions
            if (transportationOptions.includes('carryonly')) {
                this.applyCarryOnRestrictions(items, tripData);
            }
        }
        
        // Add similar logic for other transport types...
        if (transportType === 'car') {
            if (transportationOptions.includes('longtrip')) {
                this.addItemsToCategory(
                    items,
                    'long_drive_comfort',
                    {
                        'Driver comfort pillow': { multiplier: 0, essential: false },
                        'Road trip snacks': { multiplier: 0.5, essential: true },
                        'Entertainment for passengers': { multiplier: 0, essential: false },
                        'Cooler for drinks': { multiplier: 0, essential: false },
                        'First aid kit for road trips': { multiplier: 0, essential: true }
                    },
                    'long road trip',
                    tripData.nights
                );
            }
            
            if (transportationOptions.includes('rental')) {
                this.addItemsToCategory(
                    items,
                    'rental_car_requirements',
                    {
                        'Rental confirmation': { multiplier: 0, essential: true },
                        'Additional driver licenses': { multiplier: 0, essential: false },
                        'Credit card for deposit': { multiplier: 0, essential: true },
                        'GPS or phone mount': { multiplier: 0, essential: true },
                        'Rental insurance documentation': { multiplier: 0, essential: false }
                    },
                    'rental car',
                    tripData.nights
                );
            }
        }

        if (transportType === 'train') {
            if (transportationOptions.includes('overnight-train')) {
                this.addItemsToCategory(
                    items,
                    'overnight_train_comfort',
                    {
                        'Sleep mask and ear plugs': { multiplier: 0, essential: true },
                        'Comfortable sleepwear': { multiplier: 0, essential: true },
                        'Personal blanket': { multiplier: 0, essential: false },
                        'Morning hygiene kit': { multiplier: 0, essential: true }
                    },
                    'overnight train',
                    tripData.nights
                );
            }
        }

        if (transportType === 'ferry') {
            if (transportationOptions.includes('overnight-ferry')) {
                this.addItemsToCategory(
                    items,
                    'overnight_ferry_comfort',
                    {
                        'Cabin sleepwear': { multiplier: 0, essential: true },
                        'Motion sickness remedies': { multiplier: 0, essential: true },
                        'Warm clothes for deck': { multiplier: 0, essential: true },
                        'Entertainment for long journey': { multiplier: 0, essential: false }
                    },
                    'overnight ferry',
                    tripData.nights
                );
            }
        }
    }

    // Enhanced single accommodation handler
    addSingleAccommodationItems(items, accommodationType, tripData) {
        // Check basic accommodation rules (your existing logic)
        const accommodationRule = this.rules.accommodation[accommodationType];
        if (accommodationRule && accommodationRule.trigger(accommodationType)) {
            if (accommodationRule.items) {
                for (const [itemName, itemData] of Object.entries(accommodationRule.items)) {
                    if (!items.accommodation_items) {
                        items.accommodation_items = {};
                    }
                    
                    const quantity = this.calculateQuantity(itemData, tripData.nights);
                    items.accommodation_items[itemName] = {
                        quantity: quantity,
                        essential: itemData.essential,
                        completed: false,
                        notes: itemData.description ? 
                            `${itemData.description} (${accommodationType} stay)` : 
                            `Added for ${accommodationType} stay`
                    };
                }
            }
        }

        // Add items from database
        const accommodationItems = this.itemsDB.accommodation_specific[`${accommodationType}_items`];
        if (accommodationItems) {
            this.addItemsToCategory(
                items,
                `${accommodationType}_essentials`,
                accommodationItems,
                `${accommodationType} stay`,
                tripData.nights
            );
        }
    }

    // Enhanced accommodation-specific options
    addAccommodationSpecificOptions(items, accommodationType, tripData) {
        const { accommodationOptions = [] } = tripData;
        
        if (accommodationType === 'hotel') {
            if (accommodationOptions.includes('luxury')) {
                this.addItemsToCategory(
                    items,
                    'luxury_hotel_items',
                    {
                        'Upscale dining attire': { multiplier: 0.3, essential: false },
                        'Premium toiletries': { multiplier: 0, essential: false },
                        'Formal evening wear': { multiplier: 0, essential: false },
                        'Concierge tip money': { multiplier: 0, essential: false }
                    },
                    'luxury hotel',
                    tripData.nights
                );
            }
            
            if (accommodationOptions.includes('business')) {
                this.addItemsToCategory(
                    items,
                    'business_hotel_items',
                    {
                        'Business center access items': { multiplier: 0, essential: false },
                        'Professional networking materials': { multiplier: 0, essential: false },
                        'Conference room appropriate attire': { multiplier: 0.2, essential: true }
                    },
                    'business hotel',
                    tripData.nights
                );
            }
        }

        if (accommodationType === 'airbnb') {
            if (accommodationOptions.includes('kitchen')) {
                this.addItemsToCategory(
                    items,
                    'cooking_essentials',
                    {
                        'Basic cooking ingredients': { multiplier: 0, essential: false },
                        'Coffee/tea supplies': { multiplier: 0, essential: false },
                        'Cleaning supplies for kitchen': { multiplier: 0, essential: true }
                    },
                    'Airbnb with kitchen',
                    tripData.nights
                );
            }
            
            if (accommodationOptions.includes('laundry')) {
                this.addItemsToCategory(
                    items,
                    'laundry_items',
                    {
                        'Laundry detergent': { multiplier: 0, essential: true },
                        'Fabric softener': { multiplier: 0, essential: false },
                        'Laundry bag': { multiplier: 0, essential: true }
                    },
                    'Airbnb with laundry',
                    tripData.nights
                );
            }
        }

        if (accommodationType === 'camping') {
            if (accommodationOptions.includes('wild')) {
                this.addItemsToCategory(
                    items,
                    'wild_camping_essentials',
                    {
                        'Water purification system': { multiplier: 0, essential: true },
                        'Emergency shelter backup': { multiplier: 0, essential: true },
                        'Leave No Trace guidelines': { multiplier: 0, essential: true },
                        'Emergency communication device': { multiplier: 0, essential: false }
                    },
                    'wild camping',
                    tripData.nights
                );
            }
            
            if (accommodationOptions.includes('coldweather')) {
                this.addItemsToCategory(
                    items,
                    'cold_weather_camping',
                    {
                        'Winter sleeping bag': { multiplier: 0, essential: true },
                        'Insulated sleeping pad': { multiplier: 0, essential: true },
                        'Cold weather tent': { multiplier: 0, essential: true },
                        'Emergency heating sources': { multiplier: 0, essential: true }
                    },
                    'cold weather camping',
                    tripData.nights
                );
            }
        }

        if (accommodationType === 'hostel') {
            if (accommodationOptions.includes('dorm')) {
                this.addItemsToCategory(
                    items,
                    'dorm_room_essentials',
                    {
                        'Padlock for lockers': { multiplier: 0, essential: true },
                        'Shower shoes': { multiplier: 0, essential: true },
                        'Eye mask and ear plugs': { multiplier: 0, essential: true },
                        'Personal towel': { multiplier: 0, essential: true }
                    },
                    'hostel dorm',
                    tripData.nights
                );
            }
        }
    }

    // ENHANCED: Multi-modal priority filtering
    applyMultiModalPriorityFiltering(items, tripData) {
        const transportArray = Array.isArray(tripData.transportation) ? 
            tripData.transportation : [tripData.transportation].filter(Boolean);
        const accommodationArray = Array.isArray(tripData.accommodation) ? 
            tripData.accommodation : [tripData.accommodation].filter(Boolean);

        const totalModes = transportArray.length + accommodationArray.length;
        
        // Count total items
        const totalItems = Object.values(items).reduce((sum, category) => 
            sum + Object.keys(category).length, 0);
        
        // Apply more aggressive filtering for complex trips
        if (totalModes >= 4 && totalItems > 80) {
            this.prioritizeMultiModalEssentials(items, tripData, totalModes);
        } else if (totalModes >= 6 && totalItems > 120) {
            this.applyAdvancedFiltering(items, tripData);
        }
    }

    // NEW: Prioritize essentials for multi-modal trips
    prioritizeMultiModalEssentials(items, tripData, totalModes) {
        console.log(`Applying multi-modal filtering for ${totalModes} modes`);
        
        for (const [categoryKey, categoryItems] of Object.entries(items)) {
            const nonEssentialItems = [];
            const categoryItemCount = Object.keys(categoryItems).length;
            
            for (const [itemName, itemData] of Object.entries(categoryItems)) {
                if (!itemData.essential && !itemData.multiModalEssential) {
                    nonEssentialItems.push(itemName);
                }
            }
            
            // For complex trips, remove more non-essential items
            if (categoryItemCount > 8) {
                const removeCount = Math.floor(nonEssentialItems.length * 0.4); // Remove 40%
                const toRemove = nonEssentialItems.slice(0, removeCount);
                
                toRemove.forEach(itemName => {
                    delete items[categoryKey][itemName];
                });
            }
        }
    }

    // NEW: Advanced filtering for extremely complex trips
    applyAdvancedFiltering(items, tripData) {
        console.log('Applying advanced filtering for extremely complex trip');
        
        // Keep only the most essential items and multi-modal coordination items
        for (const [categoryKey, categoryItems] of Object.entries(items)) {
            const itemsToKeep = {};
            
            for (const [itemName, itemData] of Object.entries(categoryItems)) {
                // Keep if essential, multi-modal specific, or coordination item
                if (itemData.essential || 
                    itemData.multiModalEssential || 
                    categoryKey.includes('coordination') ||
                    categoryKey.includes('multi_') ||
                    categoryKey.includes('transition')) {
                    itemsToKeep[itemName] = itemData;
                }
            }
            
            // Replace category with filtered items
            items[categoryKey] = itemsToKeep;
        }
        
        // Remove empty categories
        for (const [categoryKey, categoryItems] of Object.entries(items)) {
            if (Object.keys(categoryItems).length === 0) {
                delete items[categoryKey];
            }
        }
    }

    // ENHANCED: Specific combination items (existing logic enhanced)
    addSpecificCombinationItems(items, transport, accommodation, tripData) {
        // International flight + any accommodation
        if (transport === 'plane' && this.isInternationalTrip(tripData)) {
            this.addItemsToCategory(
                items,
                'international_essentials',
                {
                    'Currency exchange info': { multiplier: 0, essential: true },
                    'Language translation app': { multiplier: 0, essential: false },
                    'Emergency embassy contacts': { multiplier: 0, essential: true },
                    'International phone plan': { multiplier: 0, essential: true },
                    'Travel insurance documents': { multiplier: 0, essential: true }
                },
                'international travel',
                tripData.nights
            );
            
            // International + hotel = airport transfers
            if (accommodation === 'hotel') {
                this.addItemsToCategory(
                    items,
                    'international_hotel_transfer',
                    {
                        'Airport transfer booking': { multiplier: 0, essential: true },
                        'Hotel address in local language': { multiplier: 0, essential: true },
                        'Local currency for tips': { multiplier: 0, essential: true },
                        'Hotel contact for flight delays': { multiplier: 0, essential: false }
                    },
                    'international flight to hotel',
                    tripData.nights
                );
            }
        }
        
        // Car + camping = car camping gear
        if (transport === 'car' && accommodation === 'camping') {
            this.addItemsToCategory(
                items,
                'car_camping_combo',
                {
                    'Car camping tent': { multiplier: 0, essential: true, multiModalEssential: true },
                    'Car cooler': { multiplier: 0, essential: true, multiModalEssential: true },
                    'Car power inverter': { multiplier: 0, essential: false },
                    'Folding chairs for car camping': { multiplier: 0.2, essential: false },
                    'Car camping security': { multiplier: 0, essential: true, multiModalEssential: true }
                },
                'car camping combination',
                tripData.nights
            );
        }
        
        // Plane + hostel = budget travel security
        if (transport === 'plane' && accommodation === 'hostel') {
            this.addItemsToCategory(
                items,
                'budget_flight_security',
                {
                    'Luggage locks': { multiplier: 0, essential: true, multiModalEssential: true },
                    'Hidden backup money': { multiplier: 0, essential: true, multiModalEssential: true },
                    'Document copies': { multiplier: 0, essential: true, multiModalEssential: true },
                    'Hostel security research': { multiplier: 0, essential: false }
                },
                'flight to hostel',
                tripData.nights
            );
        }

        // Train + family = gift coordination
        if (transport === 'train' && accommodation === 'family') {
            this.addItemsToCategory(
                items,
                'train_family_visit',
                {
                    'Portable host gifts': { multiplier: 0, essential: true },
                    'Train-friendly gift wrapping': { multiplier: 0, essential: false },
                    'Family visit coordination': { multiplier: 0, essential: true },
                    'Arrival time updates': { multiplier: 0, essential: true }
                },
                'train to family visit',
                tripData.nights
            );
        }

        // Ferry + hotel = coastal logistics
        if (transport === 'ferry' && accommodation === 'hotel') {
            this.addItemsToCategory(
                items,
                'ferry_hotel_coastal',
                {
                    'Ferry to hotel transport plan': { multiplier: 0, essential: true },
                    'Salt air protection for luggage': { multiplier: 0, essential: false },
                    'Hotel booking with ferry delays': { multiplier: 0, essential: true },
                    'Coastal weather preparation': { multiplier: 0, essential: false }
                },
                'ferry to hotel',
                tripData.nights
            );
        }
    }

    // ENHANCED: Apply carry-on restrictions with multi-modal awareness
    applyCarryOnRestrictions(items, tripData) {
        // Remove or modify items that don't work with carry-on only
        const restrictedCategories = ['large_items', 'liquid_heavy', 'sharp_objects'];
        
        restrictedCategories.forEach(category => {
            if (items[category]) {
                delete items[category];
            }
        });
        
        // Add carry-on specific alternatives
        this.addItemsToCategory(
            items,
            'carry_on_essentials',
            {
                'TSA-compliant toiletry bag': { multiplier: 0, essential: true, multiModalEssential: true },
                'Solid alternatives to liquids': { multiplier: 0, essential: true, multiModalEssential: true },
                'Minimal clothing strategy': { multiplier: 0, essential: true, multiModalEssential: true },
                'Laundry planning for carry-on': { multiplier: 0, essential: true }
            },
            'carry-on only travel',
            tripData.nights
        );

        // Adjust quantities for all items to fit carry-on limits
        for (const categoryItems of Object.values(items)) {
            for (const item of Object.values(categoryItems)) {
                if (item.quantity > 2) {
                    item.quantity = Math.min(2, item.quantity);
                    item.notes = (item.notes || '') + ' (Reduced for carry-on limits)';
                }
            }
        }
    }

    // ENHANCED: Essential items with multi-modal awareness
    addEssentialItems(items, tripData) {
        const transportArray = Array.isArray(tripData.transportation) ? 
            tripData.transportation : [tripData.transportation].filter(Boolean);
        const accommodationArray = Array.isArray(tripData.accommodation) ? 
            tripData.accommodation : [tripData.accommodation].filter(Boolean);

        for (const [categoryKey, category] of Object.entries(this.itemsDB.essentials)) {
            items[categoryKey] = {};
            
            for (const [itemName, itemData] of Object.entries(category.items)) {
                // Skip items not relevant to trip type
                if (itemData.excludeForTripTypes && 
                    itemData.excludeForTripTypes.includes(tripData.tripType)) {
                    continue;
                }
                
                // ENHANCED: Skip items not relevant to ANY accommodation type
                if (this.shouldSkipForAnyAccommodation(itemName, accommodationArray)) {
                    continue;
                }
                
                // ENHANCED: Modify quantities based on ALL accommodation types
                let quantity = this.calculateQuantity(itemData, tripData.nights);
                quantity = this.adjustQuantityForMultipleAccommodations(quantity, itemName, accommodationArray);
                
                items[categoryKey][itemName] = {
                    quantity: quantity,
                    essential: itemData.essential,
                    completed: false,
                    notes: this.generateMultiModalItemNotes(itemData, tripData),
                    multiModalEssential: this.isMultiModalEssential(itemName, transportArray, accommodationArray)
                };
            }
        }
    }

    // NEW: Check if item should be skipped for ANY accommodation
    shouldSkipForAnyAccommodation(itemName, accommodationArray) {
        return accommodationArray.some(accommodation => {
            const skipRules = {
                'hotel': ['Towels', 'Basic soap', 'Hair dryer'],
                'airbnb': [],
                'camping': ['Hotel confirmations'],
                'hostel': [],
                'family': ['Host confirmations']
            };
            
            const itemsToSkip = skipRules[accommodation] || [];
            return itemsToSkip.some(skipItem => 
                itemName.toLowerCase().includes(skipItem.toLowerCase())
            );
        });
    }

    // NEW: Adjust quantity for multiple accommodations
    adjustQuantityForMultipleAccommodations(quantity, itemName, accommodationArray) {
        let adjustedQuantity = quantity;
        
        accommodationArray.forEach(accommodation => {
            // Hotels provide daily cleaning, so fewer clothes needed
            if (accommodation === 'hotel' && 
                (itemName.includes('shirt') || itemName.includes('pants'))) {
                adjustedQuantity = Math.max(adjustedQuantity, Math.ceil(quantity * 0.8));
            }
            
            // Camping requires more backup items
            if (accommodation === 'camping' && 
                (itemName.includes('socks') || itemName.includes('underwear'))) {
                adjustedQuantity = Math.max(adjustedQuantity, Math.ceil(quantity * 1.2));
            }
            
            // Multiple accommodations = need more versatile items
            if (accommodationArray.length > 1) {
                adjustedQuantity = Math.ceil(adjustedQuantity * 1.1);
            }
        });
        
        return adjustedQuantity;
    }

    // NEW: Generate multi-modal aware notes
    generateMultiModalItemNotes(itemData, tripData) {
        let notes = itemData.description || '';
        
        const transportArray = Array.isArray(tripData.transportation) ? 
            tripData.transportation : [tripData.transportation].filter(Boolean);
        const accommodationArray = Array.isArray(tripData.accommodation) ? 
            tripData.accommodation : [tripData.accommodation].filter(Boolean);
        
        // Add transportation-specific notes
        if (transportArray.includes('plane') && itemData.liquidRestriction) {
            notes += ' (TSA 3-1-1 rule applies)';
        }
        
        // Add accommodation-specific notes
        if (accommodationArray.includes('hotel') && itemData.hotelProvides) {
            notes += ' (Hotel may provide - check first)';
        }
        
        if (accommodationArray.includes('airbnb') && itemData.bringYourOwn) {
            notes += ' (Bring your own - not provided)';
        }
        
        // Add multi-modal complexity notes
        if (transportArray.length > 1 || accommodationArray.length > 1) {
            notes += ' (Multi-modal trip - pack versatile)';
        }
        
        return notes;
    }

    // NEW: Determine if item is essential for multi-modal trips
    isMultiModalEssential(itemName, transportArray, accommodationArray) {
        const multiModalEssentials = [
            'passport', 'id', 'phone', 'charger', 'money', 'cards', 
            'tickets', 'reservations', 'emergency contacts', 'medications'
        ];
        
        return multiModalEssentials.some(essential => 
            itemName.toLowerCase().includes(essential)
        ) || (transportArray.length > 1 || accommodationArray.length > 1);
    }

    // ENHANCED: Export to text with multi-modal information
    async exportToText(tripData) {
        let exportText = `🧳 PACKING LIST - ${tripData.location}\n`;
        exportText += `📅 ${tripData.startDate} | ${tripData.nights} nights | ${tripData.tripType}\n`;
        
        // ENHANCED: Add multiple transportation and accommodation info
        const transportArray = Array.isArray(tripData.transportation) ? 
            tripData.transportation : [tripData.transportation].filter(Boolean);
        const accommodationArray = Array.isArray(tripData.accommodation) ? 
            tripData.accommodation : [tripData.accommodation].filter(Boolean);
        
        if (transportArray.length > 0) {
            exportText += `✈️ Transportation: ${transportArray.join(' + ')}\n`;
        }
        if (accommodationArray.length > 0) {
            exportText += `🏨 Accommodation: ${accommodationArray.join(' + ')}\n`;
        }
        
        // Multi-modal complexity indicator
        const complexityScore = transportArray.length + accommodationArray.length;
        if (complexityScore > 2) {
            exportText += `🔄 Multi-modal trip complexity: ${complexityScore} modes\n`;
        }
        
        exportText += '\n';
        
        if (tripData.notes) {
            exportText += `📝 Notes: ${tripData.notes}\n\n`;
        }
        
        // Weather section (unchanged)
        if (tripData.weather && tripData.weather.length > 0) {
            exportText += `🌤️ WEATHER FORECAST:\n`;
            tripData.weather.forEach(day => {
                exportText += `• ${day.date}: ${day.condition}, ${day.temp}°C`;
                if (day.chanceOfRain > 30) {
                    exportText += ` (${day.chanceOfRain}% rain)`;
                }
                exportText += '\n';
            });
            exportText += '\n';
        }
        
        // Progress (unchanged)
        let totalItems = 0;
        let completedItems = 0;
        for (const items of Object.values(tripData.items)) {
            totalItems += Object.keys(items).length;
            completedItems += Object.values(items).filter(item => item.completed).length;
        }
        
        const percentage = totalItems > 0 ? Math.round((completedItems/totalItems)*100) : 0;
        exportText += `📊 PROGRESS: ${completedItems}/${totalItems} items (${percentage}%)\n\n`;
        
        // ENHANCED: Category names including multi-modal categories
        const categoryNames = {
            // Existing categories
            clothes: '👔 CLOTHES',
            toiletries: '🧴 TOILETRIES',
            electronics: '💻 ELECTRONICS',
            documents: '📄 DOCUMENTS',
            weather_gear: '☔ WEATHER GEAR',
            business_items: '💼 BUSINESS ITEMS',
            formal_wear: '👔 FORMAL WEAR',
            
            // Multi-modal coordination categories
            multi_transport_coordination: '🚀 MULTI-TRANSPORT COORDINATION',
            multi_accommodation_coordination: '🏨 MULTI-ACCOMMODATION COORDINATION',
            high_complexity_management: '⚡ HIGH COMPLEXITY MANAGEMENT',
            
            // Transport transition categories
            flight_to_car_transition: '✈️🚗 FLIGHT TO CAR TRANSITION',
            flight_to_train_transition: '✈️🚊 FLIGHT TO TRAIN TRANSITION',
            ferry_car_coordination: '⛴️🚗 FERRY CAR COORDINATION',
            
            // Accommodation transition categories
            hotel_camping_combination: '🏨⛺ HOTEL TO CAMPING TRANSITION',
            rental_family_combination: '🏠👨‍👩‍👧‍👦 RENTAL TO FAMILY TRANSITION',
            
            // Combination categories
            car_camping_combo: '🚗⛺ CAR CAMPING COMBO',
            budget_flight_security: '✈️🏨 BUDGET FLIGHT SECURITY',
            train_family_visit: '🚊👨‍👩‍👧‍👦 TRAIN FAMILY VISIT',
            ferry_hotel_coastal: '⛴️🏨 FERRY HOTEL COASTAL',
            
            // Enhanced single-mode categories
            international_flight_items: '🌍✈️ INTERNATIONAL FLIGHT',
            long_flight_comfort: '🛋️ LONG FLIGHT COMFORT',
            carry_on_essentials: '🧳 CARRY-ON ESSENTIALS',
            long_drive_comfort: '🚗 LONG DRIVE COMFORT',
            rental_car_requirements: '🚗📋 RENTAL CAR REQUIREMENTS',
            overnight_train_comfort: '🚊🛏️ OVERNIGHT TRAIN COMFORT',
            overnight_ferry_comfort: '⛴️🛏️ OVERNIGHT FERRY COMFORT',
            luxury_hotel_items: '✨🏨 LUXURY HOTEL',
            cooking_essentials: '🍳 COOKING ESSENTIALS',
            laundry_items: '🧺 LAUNDRY ITEMS',
            wild_camping_essentials: '🏕️ WILD CAMPING ESSENTIALS',
            cold_weather_camping: '❄️⛺ COLD WEATHER CAMPING',
            dorm_room_essentials: '🏨🔒 DORM ROOM ESSENTIALS'
        };
        
        for (const [categoryKey, items] of Object.entries(tripData.items)) {
            if (Object.keys(items).length === 0) continue;
            
            exportText += `${categoryNames[categoryKey] || categoryKey.toUpperCase()}:\n`;
            
            for (const [itemName, itemData] of Object.entries(items)) {
                const checkbox = itemData.completed ? '☑' : '☐';
                const quantity = itemData.quantity > 1 ? ` (×${itemData.quantity})` : '';
                const essential = itemData.essential ? ' *' : '';
                const multiModal = itemData.multiModalEssential ? ' **' : '';
                const notes = itemData.notes ? ` - ${itemData.notes}` : '';
                
                exportText += `${checkbox} ${itemName}${quantity}${essential}${multiModal}${notes}\n`;
            }
            exportText += '\n';
        }
        
        exportText += '* = Essential items\n';
        exportText += '** = Multi-modal trip essentials\n';
        exportText += `Generated by TripMaster Multi-Modal System - ${new Date().toLocaleString()}`;
        
        return exportText;
    }

    // Keep all existing helper methods unchanged
    calculateQuantity(itemData, nights) {
        if (itemData.multiplier === 0) return 1;
        
        let quantity = Math.ceil(nights * itemData.multiplier);
        
        if (itemData.min && quantity < itemData.min) {
            quantity = itemData.min;
        }
        
        if (itemData.max && quantity > itemData.max) {
            quantity = itemData.max;
        }
        
        if (!itemData.max && quantity > nights + 2) {
            quantity = nights + 2;
        }
        
        return Math.max(1, quantity);
    }

    calculateAverageTemperature(weather) {
        if (!weather || weather.length === 0) return 20;
        
        const temps = weather.map(day => day.temp);
        return Math.round(temps.reduce((sum, temp) => sum + temp, 0) / temps.length);
    }

    addTemperatureClothing(items, avgTemp, nights) {
        for (const [tempRange, config] of Object.entries(this.rules.temperatureClothing)) {
            if (config.trigger(avgTemp)) {
                if (!items.clothes) {
                    items.clothes = {};
                }
                
                for (const [itemName, itemData] of Object.entries(config.items)) {
                    const quantity = this.calculateQuantity(itemData, nights);
                    
                    items.clothes[itemName] = {
                        quantity: quantity,
                        essential: itemData.essential,
                        completed: false,
                        notes: `Added for ${tempRange} weather (${avgTemp}°C avg)`
                    };
                }
            }
        }
    }

    addConditionalItems(items, tripData) {
        // Weather-based items
        if (tripData.weather) {
            for (const [condition, config] of Object.entries(this.rules.weather)) {
                if (config.trigger(tripData.weather)) {
                    this.addItemsToCategory(
                        items, 
                        'weather_gear', 
                        config.items, 
                        `${condition} weather`,
                        tripData.nights
                    );
                }
            }
        }
        
        // Activity-based items
        if (tripData.activities) {
            for (const activity of tripData.activities) {
                const config = this.rules.activities[activity];
                        console.log(`Activity: ${activity}, Config found:`, config); // ← ADD THIS DEBUG LINE

                if (config) {
                    const categoryName = config.category || `${activity}_gear`;
                    this.addItemsToCategory(
                        items,
                        categoryName,
                        config.items,
                        `${activity} activities`,
                        tripData.nights
                    );
                }
            }
        }
        
        // Trip type specific items
        const tripTypeConfig = this.rules.tripTypes[tripData.tripType];
        if (tripTypeConfig) {
            for (const [categoryName, categoryItems] of Object.entries(tripTypeConfig.items)) {
                this.addItemsToCategory(
                    items,
                    categoryName,
                    categoryItems,
                    `${tripData.tripType} trip`,
                    tripData.nights
                );
            }
        }
        
        // Duration-based items
        for (const [duration, config] of Object.entries(this.rules.duration)) {
            if (config.trigger(tripData.nights)) {
                this.addItemsToCategory(
                    items,
                    'travel_essentials',
                    config.items,
                    `${duration} trip`,
                    tripData.nights
                );
            }
        }
        
        // Notes-based items
        if (tripData.notes) {
            this.parseNotesForItems(items, tripData.notes, tripData.nights);
        }
    }

    addItemsToCategory(items, categoryKey, categoryItems, reason, nights) {
        if (!items[categoryKey]) {
            items[categoryKey] = {};
        }
        
        for (const [itemName, itemData] of Object.entries(categoryItems)) {
            const quantity = this.calculateQuantity(itemData, nights);
            
            items[categoryKey][itemName] = {
                quantity: quantity,
                essential: itemData.essential,
                completed: false,
                notes: itemData.description ? 
                    `${itemData.description} (${reason})` : 
                    `Added for ${reason}`,
                multiModalEssential: itemData.multiModalEssential || false
            };
        }
    }

    parseNotesForItems(items, notes, nights) {
        const notesLower = notes.toLowerCase();
        
        // Enhanced keyword detection including multi-modal terms
        const keywords = {
            'formal': {
                category: 'formal_wear',
                items: {
                    'Formal suit/dress': { multiplier: 0, essential: true },
                    'Dress shoes': { multiplier: 0, essential: true },
                    'Formal accessories': { multiplier: 0, essential: false }
                }
            },
            'wedding': {
                category: 'formal_wear',
                items: {
                    'Wedding outfit': { multiplier: 0, essential: true },
                    'Dress shoes': { multiplier: 0, essential: true },
                    'Gift/Card': { multiplier: 0, essential: true }
                }
            },
            'multi-modal': {
                category: 'multi_modal_coordination',
                items: {
                    'Transport coordination app': { multiplier: 0, essential: true, multiModalEssential: true },
                    'Extra backup transport options': { multiplier: 0, essential: true, multiModalEssential: true }
                }
            },
            'complex trip': {
                category: 'high_complexity_management',
                items: {
                    'Detailed itinerary printout': { multiplier: 0, essential: true, multiModalEssential: true },
                    'Emergency contact list': { multiplier: 0, essential: true, multiModalEssential: true }
                }
            }
        };
        
        for (const [keyword, config] of Object.entries(keywords)) {
            if (notesLower.includes(keyword)) {
                this.addItemsToCategory(
                    items,
                    config.category,
                    config.items,
                    `${keyword} mentioned in notes`,
                    nights
                );
            }
        }
    }

    removeReplacedItems(items, tripData) {
        const itemsToRemove = [];
        
        // Check all replacement rules
        for (const rule of this.rules.replacements) {
            let shouldReplace = false;
            
            for (const replacingItem of rule.replacingItems) {
                for (const category of Object.values(items)) {
                    if (category[replacingItem]) {
                        shouldReplace = true;
                        break;
                    }
                }
            }
            
            if (shouldReplace) {
                for (const [categoryKey, categoryItems] of Object.entries(items)) {
                    for (const itemName of Object.keys(categoryItems)) {
                        if (rule.replacedItems.some(replaced => 
                            itemName.toLowerCase().includes(replaced.toLowerCase())
                        )) {
                            itemsToRemove.push({ category: categoryKey, item: itemName });
                        }
                    }
                }
            }
        }
        
        // Apply multi-modal contextual removals
        this.applyMultiModalContextualRemovals(items, tripData, itemsToRemove);
        
        // Remove the items
        itemsToRemove.forEach(({ category, item }) => {
            delete items[category][item];
        });
        
        // Clean up empty categories
        for (const [categoryKey, categoryItems] of Object.entries(items)) {
            if (Object.keys(categoryItems).length === 0) {
                delete items[categoryKey];
            }
        }
    }

    // ENHANCED: Multi-modal contextual removals
    applyMultiModalContextualRemovals(items, tripData, itemsToRemove) {
        const transportArray = Array.isArray(tripData.transportation) ? 
            tripData.transportation : [tripData.transportation].filter(Boolean);
        const accommodationArray = Array.isArray(tripData.accommodation) ? 
            tripData.accommodation : [tripData.accommodation].filter(Boolean);
        
        for (const [categoryKey, categoryItems] of Object.entries(items)) {
            for (const itemName of Object.keys(categoryItems)) {
                
                // Remove conflicting transport items
                if (transportArray.includes('plane') && itemName.includes('car-specific')) {
                    itemsToRemove.push({ category: categoryKey, item: itemName });
                }
                
                if (transportArray.includes('car') && itemName.includes('flight-specific')) {
                    itemsToRemove.push({ category: categoryKey, item: itemName });
                }
                
                // Remove conflicting accommodation items
                if (accommodationArray.includes('hotel') && itemName.includes('camping-specific')) {
                    itemsToRemove.push({ category: categoryKey, item: itemName });
                }
                
                if (accommodationArray.includes('camping') && itemName.includes('hotel-specific')) {
                    itemsToRemove.push({ category: categoryKey, item: itemName });
                }
            }
        }
    }

    adjustQuantities(items, nights) {
        const adjustmentFactor = nights <= 2 ? 0.8 : nights >= 14 ? 1.2 : 1;
        
        for (const categoryItems of Object.values(items)) {
            for (const item of Object.values(categoryItems)) {
                if (item.quantity > 1) {
                    item.quantity = Math.ceil(item.quantity * adjustmentFactor);
                }
            }
        }
    }

    isInternationalTrip(tripData) {
        if (!tripData.location) return false;
        
        const location = tripData.location.toLowerCase();
        const notes = (tripData.notes || '').toLowerCase();
        
        return (
            location.includes(',') || 
            notes.includes('international') ||
            notes.includes('passport') ||
            notes.includes('visa') ||
            location.includes('europe') ||
            location.includes('asia') ||
            location.includes('uk') ||
            location.includes('canada') ||
            location.includes('mexico') ||
            /\b(france|spain|italy|germany|japan|china|india|brazil)\b/.test(location)
        );
    }
}
