// List Generator - handles the logic for generating packing lists
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
        
        // NEW Step 5: Add transportation-specific items
        this.addTransportationItems(items, tripData);
        
        // NEW Step 6: Add accommodation-specific items
        this.addAccommodationItems(items, tripData);
        
        // NEW Step 7: Add combination-specific items
        this.addCombinationItems(items, tripData);
        
        // Step 8: Remove replaced items (enhanced with new rules)
        this.removeReplacedItems(items, tripData);
        
        // Step 9: Adjust quantities based on trip duration
        this.adjustQuantities(items, tripData.nights);
        
        // NEW Step 10: Apply priority-based filtering
        this.applyPriorityFiltering(items, tripData);
        
        return items;
    }

    // NEW: Add transportation-specific items
    addTransportationItems(items, tripData) {
        const transportType = tripData.transportation;
        if (!transportType) return;

        // Check basic transportation rules
        const transportRule = this.rules.transportation[transportType];
        if (transportRule && transportRule.trigger(transportType)) {
            // Add items from conditional rules
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
            
            // Add items directly from the rule
            if (transportRule.categories) {
                for (const category of transportRule.categories) {
                    const categoryItems = this.itemsDB.transportation_specific[category];
                    if (categoryItems) {
                        this.addItemsToCategory(
                            items,
                            category,
                            categoryItems,
                            `${transportType} travel`,
                            tripData.nights
                        );
                    }
                }
            }
        }

        // Check for specific transport configurations
        this.addSpecificTransportItems(items, tripData);
    }

    // NEW: Add specific transportation configurations
    addSpecificTransportItems(items, tripData) {
        const { transportation, transportationOptions = [] } = tripData;
        
        if (transportation === 'plane') {
            // International flight items
            if (transportationOptions.includes('international') || this.isInternationalTrip(tripData)) {
                const intlRule = this.rules.transportation.international_flight;
                if (intlRule && intlRule.trigger(transportation, tripData)) {
                    this.addItemsToCategory(
                        items,
                        'international_travel',
                        intlRule.items,
                        'international flight',
                        tripData.nights
                    );
                }
            }
            
            // Long-haul flight items
            if (transportationOptions.includes('longhaul')) {
                const longHaulRule = this.rules.transportation.long_haul_flight;
                if (longHaulRule && longHaulRule.trigger(transportation, tripData)) {
                    this.addItemsToCategory(
                        items,
                        'flight_comfort',
                        longHaulRule.items,
                        'long-haul flight',
                        tripData.nights
                    );
                }
            }
            
            // Carry-on only restrictions
            if (transportationOptions.includes('carryonly')) {
                this.applyCarryOnRestrictions(items, tripData);
            }
        }
        
        if (transportation === 'car') {
            // Long road trip items
            if (transportationOptions.includes('longtrip')) {
                this.addItemsToCategory(
                    items,
                    'road_trip_comfort',
                    {
                        'Driver comfort pillow': { multiplier: 0, essential: false },
                        'Extra snacks': { multiplier: 0.5, essential: true },
                        'Audio entertainment': { multiplier: 0, essential: false },
                        'Cooler with ice packs': { multiplier: 0, essential: false }
                    },
                    'long road trip',
                    tripData.nights
                );
            }
            
            // Rental car considerations
            if (transportationOptions.includes('rental')) {
                this.addItemsToCategory(
                    items,
                    'rental_car_items',
                    {
                        'Rental agreement': { multiplier: 0, essential: true },
                        'Credit card for deposit': { multiplier: 0, essential: true },
                        'Additional driver license': { multiplier: 0, essential: false },
                        'GPS/phone mount': { multiplier: 0, essential: true }
                    },
                    'rental car',
                    tripData.nights
                );
            }
        }
    }

    // NEW: Add accommodation-specific items
    addAccommodationItems(items, tripData) {
        const accommodationType = tripData.accommodation;
        if (!accommodationType) return;

        // Check basic accommodation rules
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

        // Check for specific accommodation configurations
        this.addSpecificAccommodationItems(items, tripData);
    }

    // NEW: Add specific accommodation configurations
    addSpecificAccommodationItems(items, tripData) {
        const { accommodation, accommodationOptions = [] } = tripData;
        
        if (accommodation === 'hotel') {
            // Luxury hotel items
            if (accommodationOptions.includes('luxury')) {
                const luxuryItems = this.itemsDB.accommodation_specific.luxury_hotel_items;
                if (luxuryItems) {
                    this.addItemsToCategory(
                        items,
                        'luxury_hotel_items',
                        luxuryItems,
                        'luxury hotel stay',
                        tripData.nights
                    );
                }
            }
            
            // Business hotel considerations
            if (accommodationOptions.includes('business')) {
                this.addItemsToCategory(
                    items,
                    'business_hotel_items',
                    {
                        'Business center access info': { multiplier: 0, essential: false },
                        'Professional attire': { multiplier: 0.3, essential: true },
                        'Laptop setup accessories': { multiplier: 0, essential: true }
                    },
                    'business hotel',
                    tripData.nights
                );
            }
            
            // Resort hotel items
            if (accommodationOptions.includes('resort')) {
                this.addItemsToCategory(
                    items,
                    'resort_items',
                    {
                        'Resort wristband': { multiplier: 0, essential: true },
                        'Pool/beach attire': { multiplier: 0.5, essential: true },
                        'Casual dining wear': { multiplier: 0.4, essential: true },
                        'Resort activity signup': { multiplier: 0, essential: false }
                    },
                    'resort stay',
                    tripData.nights
                );
            }
        }
    }

    // NEW: Add combination-specific items (transport + accommodation)
    addCombinationItems(items, tripData) {
        const { transportation, accommodation } = tripData;
        if (!transportation || !accommodation) return;

        // Check combination rules
        for (const [ruleKey, rule] of Object.entries(this.rules.combinations)) {
            if (rule.trigger(transportation, accommodation, tripData)) {
                this.addItemsToCategory(
                    items,
                    'combination_items',
                    rule.items,
                    `${transportation} + ${accommodation}`,
                    tripData.nights
                );
            }
        }

        // Specific logical combinations
        this.addLogicalCombinations(items, tripData);
    }

    // NEW: Add logical combinations based on transport + accommodation
    addLogicalCombinations(items, tripData) {
        const { transportation, accommodation, transportationOptions = [] } = tripData;
        
        // International flight + any accommodation
        if (transportation === 'plane' && 
            (transportationOptions.includes('international') || this.isInternationalTrip(tripData))) {
            
            this.addItemsToCategory(
                items,
                'international_essentials',
                {
                    'Currency exchange info': { multiplier: 0, essential: true },
                    'Language translation app': { multiplier: 0, essential: false },
                    'Emergency embassy contacts': { multiplier: 0, essential: true },
                    'International phone plan': { multiplier: 0, essential: true }
                },
                'international travel',
                tripData.nights
            );
            
            // International + hotel = airport transfers
            if (accommodation === 'hotel') {
                this.addItemsToCategory(
                    items,
                    'airport_transfer',
                    {
                        'Airport transfer booking': { multiplier: 0, essential: true },
                        'Hotel address in local language': { multiplier: 0, essential: true },
                        'Local currency for tips': { multiplier: 0, essential: true }
                    },
                    'international flight to hotel',
                    tripData.nights
                );
            }
        }
        
        // Car + camping = car camping gear
        if (transportation === 'car' && accommodation === 'camping') {
            this.addItemsToCategory(
                items,
                'car_camping',
                {
                    'Car camping tent': { multiplier: 0, essential: true },
                    'Cooler for car': { multiplier: 0, essential: true },
                    'Car power inverter': { multiplier: 0, essential: false },
                    'Folding chairs': { multiplier: 0.2, essential: false },
                    'Car camping table': { multiplier: 0, essential: false }
                },
                'car camping',
                tripData.nights
            );
        }
        
        // Plane + hostel = security focus
        if (transportation === 'plane' && accommodation === 'hostel') {
            this.addItemsToCategory(
                items,
                'budget_travel_security',
                {
                    'Luggage locks': { multiplier: 0, essential: true },
                    'Backup card hidden separately': { multiplier: 0, essential: true },
                    'Photocopy of important documents': { multiplier: 0, essential: true }
                },
                'flight to hostel',
                tripData.nights
            );
        }
    }

    // NEW: Apply carry-on only restrictions
    applyCarryOnRestrictions(items, tripData) {
        // Remove or modify items that don't work with carry-on only
        const restrictedItems = [
            'Large bottles',
            'Sharp objects',
            'Heavy items',
            'Excess liquids'
        ];
        
        // Add carry-on specific alternatives
        this.addItemsToCategory(
            items,
            'carry_on_alternatives',
            {
                'Travel-size everything': { multiplier: 0, essential: true },
                'Solid alternatives to liquids': { multiplier: 0, essential: true, 
                  description: 'Solid deodorant, shampoo bars, etc.' },
                'One week max clothing': { multiplier: 0, essential: true, 
                  description: 'Plan for laundry or minimal packing' }
            },
            'carry-on only travel',
            tripData.nights
        );
    }

    // Enhanced: Add essential items with transport/accommodation awareness
    addEssentialItems(items, tripData) {
        for (const [categoryKey, category] of Object.entries(this.itemsDB.essentials)) {
            items[categoryKey] = {};
            
            for (const [itemName, itemData] of Object.entries(category.items)) {
                // Skip items not relevant to trip type
                if (itemData.excludeForTripTypes && 
                    itemData.excludeForTripTypes.includes(tripData.tripType)) {
                    continue;
                }
                
                // NEW: Skip items not relevant to accommodation type
                if (this.shouldSkipForAccommodation(itemName, tripData.accommodation)) {
                    continue;
                }
                
                // NEW: Modify quantities based on accommodation
                let quantity = this.calculateQuantity(itemData, tripData.nights);
                quantity = this.adjustQuantityForAccommodation(quantity, itemName, tripData.accommodation);
                
                items[categoryKey][itemName] = {
                    quantity: quantity,
                    essential: itemData.essential,
                    completed: false,
                    notes: this.generateItemNotes(itemData, tripData)
                };
            }
        }
    }

    // NEW: Check if item should be skipped for accommodation type
    shouldSkipForAccommodation(itemName, accommodationType) {
        const skipRules = {
            'hotel': [
                // Hotels provide these
                'Towels', 'Basic soap', 'Hair dryer'
            ],
            'airbnb': [
                // Usually need to bring everything
            ],
            'camping': [
                // Camping doesn't use hotel-style items
                'Hotel confirmations'
            ],
            'hostel': [
                // Hostels provide basics but not luxury items
            ],
            'family': [
                // Family might provide some items
                'Host confirmations'
            ]
        };
        
        const itemsToSkip = skipRules[accommodationType] || [];
        return itemsToSkip.some(skipItem => 
            itemName.toLowerCase().includes(skipItem.toLowerCase())
        );
    }

    // NEW: Adjust quantity based on accommodation type
    adjustQuantityForAccommodation(quantity, itemName, accommodationType) {
        // Hotels provide daily cleaning, so fewer clothes needed
        if (accommodationType === 'hotel' && 
            (itemName.includes('shirt') || itemName.includes('pants'))) {
            return Math.max(1, Math.ceil(quantity * 0.8));
        }
        
        // Camping requires more backup items
        if (accommodationType === 'camping' && 
            (itemName.includes('socks') || itemName.includes('underwear'))) {
            return Math.ceil(quantity * 1.2);
        }
        
        // Hostels need more security-conscious packing
        if (accommodationType === 'hostel' && itemName.includes('valuable')) {
            return Math.min(1, quantity); // Minimize valuables
        }
        
        return quantity;
    }

    // NEW: Generate context-aware notes for items
    generateItemNotes(itemData, tripData) {
        let notes = itemData.description || '';
        
        // Add transportation-specific notes
        if (tripData.transportation === 'plane' && itemData.liquidRestriction) {
            notes += ' (TSA 3-1-1 rule applies)';
        }
        
        // Add accommodation-specific notes
        if (tripData.accommodation === 'hotel' && itemData.hotelProvides) {
            notes += ' (Hotel may provide - check first)';
        }
        
        if (tripData.accommodation === 'airbnb' && itemData.bringYourOwn) {
            notes += ' (Bring your own - not provided)';
        }
        
        return notes;
    }

    // Enhanced: Remove replaced items with new logic
    removeReplacedItems(items, tripData) {
        const itemsToRemove = [];
        
        // Check all replacement rules including new ones
        for (const rule of this.rules.replacements) {
            let shouldReplace = false;
            
            // Check if replacing items exist
            for (const replacingItem of rule.replacingItems) {
                for (const category of Object.values(items)) {
                    if (category[replacingItem]) {
                        shouldReplace = true;
                        break;
                    }
                }
            }
            
            // Remove replaced items
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
        
        // NEW: Apply transportation/accommodation specific removals
        this.applyContextualRemovals(items, tripData, itemsToRemove);
        
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

    // NEW: Apply contextual item removals
    applyContextualRemovals(items, tripData, itemsToRemove) {
        const { transportation, accommodation } = tripData;
        
        // Remove items that don't make sense for the context
        for (const [categoryKey, categoryItems] of Object.entries(items)) {
            for (const itemName of Object.keys(categoryItems)) {
                
                // Transportation-based removals
                if (transportation === 'plane' && itemName.includes('car')) {
                    itemsToRemove.push({ category: categoryKey, item: itemName });
                }
                
                if (transportation === 'car' && itemName.includes('flight')) {
                    itemsToRemove.push({ category: categoryKey, item: itemName });
                }
                
                // Accommodation-based removals
                if (accommodation === 'hotel' && itemName.includes('camping')) {
                    itemsToRemove.push({ category: categoryKey, item: itemName });
                }
                
                if (accommodation === 'camping' && itemName.includes('hotel')) {
                    itemsToRemove.push({ category: categoryKey, item: itemName });
                }
            }
        }
    }

    // NEW: Apply priority-based filtering
    applyPriorityFiltering(items, tripData) {
        // If we have too many items, prioritize based on context
        const totalItems = Object.values(items).reduce((sum, category) => 
            sum + Object.keys(category).length, 0);
        
        if (totalItems > 100) { // Threshold for too many items
            this.prioritizeEssentialItems(items, tripData);
        }
    }

    // NEW: Prioritize essential items when list gets too long
    prioritizeEssentialItems(items, tripData) {
        for (const [categoryKey, categoryItems] of Object.entries(items)) {
            const nonEssentialItems = [];
            
            for (const [itemName, itemData] of Object.entries(categoryItems)) {
                if (!itemData.essential) {
                    nonEssentialItems.push(itemName);
                }
            }
            
            // Remove half of non-essential items if category is too large
            if (Object.keys(categoryItems).length > 10) {
                const toRemove = nonEssentialItems.slice(0, Math.floor(nonEssentialItems.length / 2));
                toRemove.forEach(itemName => {
                    delete items[categoryKey][itemName];
                });
            }
        }
    }

    // Enhanced helper method to check if trip is international
    isInternationalTrip(tripData) {
        if (!tripData.location) return false;
        
        const location = tripData.location.toLowerCase();
        const notes = (tripData.notes || '').toLowerCase();
        
        // Enhanced detection logic
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
            // Add more country/region detection as needed
            /\b(france|spain|italy|germany|japan|china|india|brazil)\b/.test(location)
        );
    }

    // All existing methods remain the same...
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
                    `Added for ${reason}`
            };
        }
    }

    parseNotesForItems(items, notes, nights) {
        const notesLower = notes.toLowerCase();
        
        // Enhanced keyword detection including transport/accommodation
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
            'conference': {
                category: 'business_items',
                items: {
                    'Name badge holder': { multiplier: 0, essential: true },
                    'Extra business cards': { multiplier: 0, essential: true },
                    'Conference materials': { multiplier: 0, essential: false }
                }
            },
            'baby': {
                category: 'baby_items',
                items: {
                    'Baby clothes': { multiplier: 1.5, essential: true },
                    'Diapers': { multiplier: 6, essential: true },
                    'Baby food/formula': { multiplier: 3, essential: true },
                    'Baby carrier': { multiplier: 0, essential: true }
                }
            },
            // NEW: Transportation keywords
            'rental car': {
                category: 'rental_car_items',
                items: {
                    'Additional driver documentation': { multiplier: 0, essential: false },
                    'GPS device': { multiplier: 0, essential: false }
                }
            },
            'long flight': {
                category: 'flight_comfort',
                items: {
                    'Compression socks': { multiplier: 0, essential: true },
                    'Neck pillow': { multiplier: 0, essential: true }
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

    async exportToText(tripData) {
        let exportText = `🧳 PACKING LIST - ${tripData.location}\n`;
        exportText += `📅 ${tripData.startDate} | ${tripData.nights} nights | ${tripData.tripType}\n`;
        
        // NEW: Add transportation and accommodation info
        if (tripData.transportation) {
            exportText += `✈️ Transportation: ${tripData.transportation}\n`;
        }
        if (tripData.accommodation) {
            exportText += `🏨 Accommodation: ${tripData.accommodation}\n`;
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
        
        // Enhanced category names including new ones
        const categoryNames = {
            clothes: '👔 CLOTHES',
            toiletries: '🧴 TOILETRIES',
            electronics: '💻 ELECTRONICS',
            documents: '📄 DOCUMENTS',
            weather_gear: '☔ WEATHER GEAR',
            business_items: '💼 BUSINESS ITEMS',
            formal_wear: '👔 FORMAL WEAR',
            hiking_gear: '🥾 HIKING GEAR',
            beach_gear: '🏖️ BEACH GEAR',
            photography_gear: '📸 PHOTOGRAPHY',
            fitness_gear: '💪 FITNESS',
            activity_items: '🎯 ACTIVITY ITEMS',
            travel_essentials: '✈️ TRAVEL ESSENTIALS',
            baby_items: '👶 BABY ITEMS',
            // NEW: Transportation categories
            flight_essentials: '✈️ FLIGHT ESSENTIALS',
            carry_on_items: '🧳 CARRY-ON ITEMS',
            flight_comfort: '🛋️ FLIGHT COMFORT',
            car_travel: '🚗 CAR TRAVEL',
            road_trip_essentials: '🛣️ ROAD TRIP ESSENTIALS',
            train_comfort: '🚊 TRAIN COMFORT',
            ferry_travel: '⛴️ FERRY TRAVEL',
            international_travel: '🌍 INTERNATIONAL TRAVEL',
            // NEW: Accommodation categories
            hotel_essentials: '🏨 HOTEL ESSENTIALS',
            luxury_hotel_items: '✨ LUXURY HOTEL',
            airbnb_essentials: '🏠 AIRBNB ESSENTIALS',
            hostel_essentials: '🏨 HOSTEL ESSENTIALS',
            camping_essentials: '⛺ CAMPING ESSENTIALS',
            family_friends_items: '👨‍👩‍👧‍👦 FAMILY/FRIENDS',
            // NEW: Combination categories
            combination_items: '🔗 SPECIAL COMBINATIONS',
            car_camping: '🚗⛺ CAR CAMPING',
            international_essentials: '🌍✈️ INTERNATIONAL FLIGHT',
            budget_travel_security: '🔒 BUDGET TRAVEL SECURITY'
        };
        
        for (const [categoryKey, items] of Object.entries(tripData.items)) {
            if (Object.keys(items).length === 0) continue;
            
            exportText += `${categoryNames[categoryKey] || categoryKey.toUpperCase()}:\n`;
            
            for (const [itemName, itemData] of Object.entries(items)) {
                const checkbox = itemData.completed ? '☑' : '☐';
                const quantity = itemData.quantity > 1 ? ` (×${itemData.quantity})` : '';
                const essential = itemData.essential ? ' *' : '';
                const notes = itemData.notes ? ` - ${itemData.notes}` : '';
                
                exportText += `${checkbox} ${itemName}${quantity}${essential}${notes}\n`;
            }
            exportText += '\n';
        }
        
        exportText += '* = Essential items\n';
        exportText += `Generated by Smart Trip Planner - ${new Date().toLocaleString()}`;
        
        return exportText;
    }
}
