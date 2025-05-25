// Checklist Display Component - renders and manages the packing list
export class ChecklistDisplay {
    constructor(options) {
        this.container = options.container;
        this.onItemToggle = options.onItemToggle;
        this.onItemAdd = options.onItemAdd;
        this.onNoteUpdate = options.onNoteUpdate;
        
        // NEW: Filter state
        this.showIncompleteOnly = false;
        
        // Enhanced category names including all new transport/accommodation categories
        this.categoryNames = {
            clothes: '👔 Clothes',
            toiletries: '🧴 Toiletries',
            electronics: '💻 Electronics',
            documents: '📄 Documents',
            weather_gear: '☔ Weather Gear',
            business_items: '💼 Business Items',
            hiking_gear: '🥾 Hiking Gear',
            beach_gear: '🏖️ Beach Gear',
            photography_gear: '📸 Photography',
            fitness_gear: '💪 Fitness',
            activity_items: '🎯 Activity Items',
            travel_essentials: '✈️ Travel Essentials',
            formal_wear: '👔 Formal Wear',
            baby_items: '👶 Baby Items',
            entertainment_gear: '🎭 Entertainment',
            family_travel_gear: '👨‍👩‍👧‍👦 Family Travel',
            relaxation_gear: '🧘‍♀️ Relaxation',
            carry_on_compliance: '🧳 Carry-On Compliance',
            international_flight_items: '🌍 International Flight',
            multi_transport_coordination: '🚀 Multi-Transport Coordination',
            water_sports_gear: '🏄‍♂️ Water Sports',
            shopping_gear: '🛍️ Shopping'
            // NEW: Transportation categories
            flight_essentials: '✈️ Flight Essentials',
            carry_on_items: '🧳 Carry-On Items',
            flight_comfort: '🛋️ Flight Comfort',
            car_travel: '🚗 Car Travel',
            road_trip_essentials: '🛣️ Road Trip Essentials',
            road_trip_comfort: '🚗💤 Road Trip Comfort',
            train_comfort: '🚊 Train Comfort',
            ferry_travel: '⛴️ Ferry Travel',
            international_travel: '🌍 International Travel',
            international_essentials: '🌍✈️ International Flight',
            rental_car_items: '🚗📋 Rental Car',
            // NEW: Accommodation categories
            accommodation_items: '🏨 Accommodation',
            hotel_essentials: '🏨 Hotel Essentials',
            luxury_hotel_items: '✨ Luxury Hotel',
            business_hotel_items: '💼🏨 Business Hotel',
            resort_items: '🏖️🏨 Resort',
            airbnb_essentials: '🏠 Airbnb/Vacation Rental',
            hostel_essentials: '🏨 Hostel',
            camping_essentials: '⛺ Camping',
            family_friends_items: '👨‍👩‍👧‍👦 Family/Friends',
            // NEW: Combination and special categories
            combination_items: '🔗 Special Combinations',
            car_camping: '🚗⛺ Car Camping',
            budget_travel_security: '🔒 Budget Travel Security',
            airport_transfer: '🚐 Airport Transfer',
            carry_on_alternatives: '🧳 Carry-On Alternatives'
        };
        
        // Enhanced category icons
        this.categoryIcons = {
            clothes: '👔',
            toiletries: '🧴',
            electronics: '💻',
            documents: '📄',
            weather_gear: '☔',
            business_items: '💼',
            hiking_gear: '🥾',
            beach_gear: '🏖️',
            photography_gear: '📸',
            fitness_gear: '💪',
            activity_items: '🎯',
            travel_essentials: '✈️',
            formal_wear: '👔',
            baby_items: '👶',
            entertainment_gear: '🎭',
            family_travel_gear: '👨‍👩‍👧‍👦',
            relaxation_gear: '🧘‍♀️',
            carry_on_compliance: '🧳',
            international_flight_items: '🌍',
            multi_transport_coordination: '🚀',
            water_sports_gear: '🏄‍♂️',
            shopping_gear: '🛍️'
            // NEW: Transportation icons
            flight_essentials: '✈️',
            carry_on_items: '🧳',
            flight_comfort: '🛋️',
            car_travel: '🚗',
            road_trip_essentials: '🛣️',
            road_trip_comfort: '🚗',
            train_comfort: '🚊',
            ferry_travel: '⛴️',
            international_travel: '🌍',
            international_essentials: '🌍',
            rental_car_items: '🚗',
            // NEW: Accommodation icons
            accommodation_items: '🏨',
            hotel_essentials: '🏨',
            luxury_hotel_items: '✨',
            business_hotel_items: '💼',
            resort_items: '🏖️',
            airbnb_essentials: '🏠',
            hostel_essentials: '🏨',
            camping_essentials: '⛺',
            family_friends_items: '👨‍👩‍👧‍👦',
            // NEW: Combination icons
            combination_items: '🔗',
            car_camping: '🚗',
            budget_travel_security: '🔒',
            airport_transfer: '🚐',
            carry_on_alternatives: '🧳'
        };

        // NEW: Category priority order for display
        this.categoryPriority = {
            // Essential categories first
            'documents': 1,
            'flight_essentials': 2,
            'carry_on_items': 3,
            'international_travel': 4,
            'international_essentials': 5,
            
            // Transportation categories
            'car_travel': 10,
            'road_trip_essentials': 11,
            'train_comfort': 12,
            'ferry_travel': 13,
            'flight_comfort': 14,
            'rental_car_items': 15,
            
            // Accommodation categories
            'accommodation_items': 20,
            'hotel_essentials': 21,
            'luxury_hotel_items': 22,
            'business_hotel_items': 23,
            'resort_items': 24,
            'airbnb_essentials': 25,
            'hostel_essentials': 26,
            'camping_essentials': 27,
            'family_friends_items': 28,
            
            // Core categories
            'clothes': 30,
            'toiletries': 31,
            'electronics': 32,
            
            // Activity categories
            'business_items': 40,
            'hiking_gear': 41,
            'beach_gear': 42,
            'photography_gear': 43,
            'fitness_gear': 44,
            'activity_items': 45,
            
            // Weather and special
            'weather_gear': 50,
            'formal_wear': 51,
            'baby_items': 52,
            'travel_essentials': 53,
            
            // Combinations last
            'combination_items': 60,
            'car_camping': 61,
            'budget_travel_security': 62,
            'airport_transfer': 63,
            'carry_on_alternatives': 64
        };
    }

    render(items, tripData = null) {
        this.container.innerHTML = '';
        
        // Add enhanced trip summary
        if (tripData) {
            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'trip-summary';
            summaryDiv.innerHTML = this.generateEnhancedTripSummary(tripData);
            this.container.appendChild(summaryDiv);
        }
        
        // NEW: Add filter controls
        this.addFilterControls(items);
        
        // Sort categories by priority
        const sortedCategories = Object.entries(items).sort(([keyA], [keyB]) => {
            const priorityA = this.categoryPriority[keyA] || 999;
            const priorityB = this.categoryPriority[keyB] || 999;
            return priorityA - priorityB;
        });
        
        // Render each category
        for (const [categoryKey, categoryItems] of sortedCategories) {
            if (Object.keys(categoryItems).length === 0) continue;
            
            const categoryElement = this.createCategoryElement(categoryKey, categoryItems);
            this.container.appendChild(categoryElement);
        }
        
        // Add smart insights section
        if (tripData) {
            const insightsDiv = document.createElement('div');
            insightsDiv.className = 'smart-insights';
            insightsDiv.innerHTML = this.generateSmartInsights(items, tripData);
            this.container.appendChild(insightsDiv);
        }
        
        // Bind events after rendering
        this.bindCategoryEvents();
        
        // Apply current filter state
        this.applyFilter();
    }

    // NEW: Add filter controls
    addFilterControls(items) {
        // Calculate incomplete items
        let totalItems = 0;
        let incompleteItems = 0;
        let incompleteEssentials = 0;
        
        for (const categoryItems of Object.values(items)) {
            for (const item of Object.values(categoryItems)) {
                totalItems++;
                if (!item.completed) {
                    incompleteItems++;
                    if (item.essential) incompleteEssentials++;
                }
            }
        }
        
        // Only show filter if there are items and some are incomplete
        if (totalItems === 0 || incompleteItems === 0) return;
        
        const filterDiv = document.createElement('div');
        filterDiv.className = 'filter-controls';
        filterDiv.innerHTML = `
            <div class="filter-header">
                <div class="filter-info">
                    <span class="filter-stats">
                        📋 ${incompleteItems} items remaining
                        ${incompleteEssentials > 0 ? `(${incompleteEssentials} essential)` : ''}
                    </span>
                </div>
                <div class="filter-actions">
                    <button class="filter-toggle" id="filterToggle">
                        <span class="filter-icon">👁️</span>
                        <span class="filter-text">Show Incomplete Only</span>
                    </button>
                </div>
            </div>
        `;
        
        this.container.appendChild(filterDiv);
        
        // Bind filter toggle event
        document.getElementById('filterToggle').addEventListener('click', () => {
            this.toggleFilter();
        });
    }

    // NEW: Toggle filter state
    toggleFilter() {
        this.showIncompleteOnly = !this.showIncompleteOnly;
        this.applyFilter();
        this.updateFilterButton();
    }

    // NEW: Apply filter to visible items
    applyFilter() {
        const allItems = document.querySelectorAll('.item');
        const allCategories = document.querySelectorAll('.category');
        
        if (this.showIncompleteOnly) {
            // Hide completed items
            allItems.forEach(item => {
                if (item.classList.contains('completed')) {
                    item.style.display = 'none';
                } else {
                    item.style.display = 'flex';
                }
            });
            
            // Show/hide categories based on whether they have incomplete items
            allCategories.forEach(category => {
                const incompleteItems = category.querySelectorAll('.item:not(.completed)');
                const addItemSection = category.querySelector('.add-item-section');
                
                // Count actual incomplete items (exclude add-item-section)
                let actualIncompleteCount = 0;
                incompleteItems.forEach(item => {
                    if (!item.classList.contains('add-item-section') && 
                        !item.querySelector('.add-item-form')) {
                        actualIncompleteCount++;
                    }
                });
                
                if (actualIncompleteCount > 0) {
                    category.style.display = 'block';
                    // Auto-expand categories with incomplete items
                    const content = category.querySelector('.category-content');
                    if (content && !content.classList.contains('expanded')) {
                        content.classList.add('expanded');
                        category.classList.add('expanded');
                        const toggle = category.querySelector('.toggle-icon');
                        if (toggle) toggle.style.transform = 'rotate(180deg)';
                    }
                } else {
                    category.style.display = 'none';
                }
            });
            
            // Add filter active class
            document.body.classList.add('filter-active');
            
        } else {
            // Show all items
            allItems.forEach(item => {
                item.style.display = 'flex';
            });
            
            // Show all categories
            allCategories.forEach(category => {
                category.style.display = 'block';
            });
            
            // Remove filter active class
            document.body.classList.remove('filter-active');
        }
    }

    // NEW: Update filter button text
    updateFilterButton() {
        const filterButton = document.getElementById('filterToggle');
        if (!filterButton) return;
        
        const icon = filterButton.querySelector('.filter-icon');
        const text = filterButton.querySelector('.filter-text');
        
        if (this.showIncompleteOnly) {
            icon.textContent = '👀';
            text.textContent = 'Show All Items';
            filterButton.classList.add('active');
        } else {
            icon.textContent = '👁️';
            text.textContent = 'Show Incomplete Only';
            filterButton.classList.remove('active');
        }
    }

    // NEW: Generate enhanced trip summary with transport/accommodation context
    generateEnhancedTripSummary(tripData) {
        const avgTemp = tripData.weather ? 
            Math.round(tripData.weather.reduce((sum, day) => sum + day.temp, 0) / tripData.weather.length) : 'Unknown';
        
        const conditions = [];
        const recommendations = [];
        
        // Transportation-specific insights
        if (tripData.transportation) {
            const transportMap = {
                'plane': '✈️ Flying',
                'car': '🚗 Driving',
                'train': '🚊 Train travel',
                'ferry': '⛴️ Ferry travel',
                'bus': '🚌 Bus travel'
            };
            conditions.push(`${transportMap[tripData.transportation] || tripData.transportation}`);
            
            // Add transport-specific recommendations
            if (tripData.transportation === 'plane') {
                recommendations.push('📋 TSA 3-1-1 rule applied to toiletries');
                if (tripData.transportationOptions?.includes('international')) {
                    recommendations.push('🛂 International flight items included');
                }
                if (tripData.transportationOptions?.includes('carryonly')) {
                    recommendations.push('🧳 Carry-on only restrictions applied');
                }
            } else if (tripData.transportation === 'car') {
                recommendations.push('🚗 Road trip essentials and emergency kit included');
            }
        }
        
        // Accommodation-specific insights
        if (tripData.accommodation) {
            const accommodationMap = {
                'hotel': '🏨 Hotel stay',
                'airbnb': '🏠 Vacation rental',
                'camping': '⛺ Camping',
                'hostel': '🏨 Hostel',
                'family': '👨‍👩‍👧‍👦 Staying with family/friends'
            };
            conditions.push(`${accommodationMap[tripData.accommodation] || tripData.accommodation}`);
            
            // Add accommodation-specific recommendations
            if (tripData.accommodation === 'hotel') {
                recommendations.push('🏨 Hotel provides towels and basic toiletries');
                if (tripData.accommodationOptions?.includes('luxury')) {
                    recommendations.push('✨ Formal attire included for upscale venues');
                }
            } else if (tripData.accommodation === 'airbnb') {
                recommendations.push('🏠 All toiletries and cleaning supplies included');
            } else if (tripData.accommodation === 'hostel') {
                recommendations.push('🔒 Security items and shared facility essentials included');
            } else if (tripData.accommodation === 'camping') {
                recommendations.push('⛺ Complete camping setup and self-sufficiency items included');
            } else if (tripData.accommodation === 'family') {
                recommendations.push('🎁 Host gifts and courtesy items included');
            }
        }
        
        // Weather conditions
        if (tripData.weather) {
            const hasRain = tripData.weather.some(day => day.condition.toLowerCase().includes('rain'));
            const hasCold = tripData.weather.some(day => day.temp < 10);
            const hasHot = tripData.weather.some(day => day.temp > 25);
            
            if (hasRain) recommendations.push('🌧️ Rain gear included');
            if (hasCold) recommendations.push('🧥 Cold weather gear included');
            if (hasHot) recommendations.push('☀️ Hot weather items included');
        }
        
        // Activity conditions
        if (tripData.activities && tripData.activities.length > 0) {
            conditions.push(`🎯 Activities: ${tripData.activities.join(', ')}`);
        }
        
        return `
            <h4>📋 Smart Packing Summary</h4>
            <div class="trip-basic-info">
                <p><strong>Trip:</strong> ${tripData.location} • ${tripData.nights} nights • ${tripData.tripType}</p>
                <p><strong>Average Temperature:</strong> ${avgTemp}°C</p>
                ${conditions.length > 0 ? `<p><strong>Travel Details:</strong> ${conditions.join(' • ')}</p>` : ''}
            </div>
            ${recommendations.length > 0 ? `
                <div class="smart-recommendations">
                    <h5>🧠 Smart Recommendations Applied:</h5>
                    ${recommendations.map(r => `<div class="recommendation">${r}</div>`).join('')}
                </div>
            ` : ''}
            <p class="summary-footer">
                ✨ This list was automatically customized based on your transportation, accommodation, weather, and activities!
            </p>
        `;
    }

    // NEW: Generate smart insights about the packing list
    generateSmartInsights(items, tripData) {
        const insights = [];
        const totalCategories = Object.keys(items).length;
        let totalItems = 0;
        let essentialItems = 0;
        
        // Count items and analyze
        for (const categoryItems of Object.values(items)) {
            totalItems += Object.keys(categoryItems).length;
            essentialItems += Object.values(categoryItems).filter(item => item.essential).length;
        }
        
        // Generate insights based on trip characteristics
        if (tripData.transportation === 'plane' && tripData.accommodation === 'hotel') {
            insights.push('✈️🏨 Perfect combination: Flight + Hotel keeps packing minimal and convenient');
        }
        
        if (tripData.transportation === 'car' && tripData.accommodation === 'camping') {
            insights.push('🚗⛺ Car camping detected: Extra storage allows for comfort items and full camping gear');
        }
        
        if (tripData.accommodation === 'hostel') {
            insights.push('🔒 Hostel security: Focus on portable, lockable, and essential items only');
        }
        
        if (tripData.nights <= 3) {
            insights.push('🎒 Short trip advantage: Minimal clothing needs, focus on essentials');
        } else if (tripData.nights >= 14) {
            insights.push('🧳 Extended trip: Laundry supplies and backup items included for sustainability');
        }
        
        // Essential items ratio insight
        const essentialRatio = Math.round((essentialItems / totalItems) * 100);
        if (essentialRatio > 70) {
            insights.push(`⭐ High-priority list: ${essentialRatio}% of items are marked essential`);
        } else if (essentialRatio < 40) {
            insights.push(`🎯 Comprehensive list: ${essentialRatio}% essential items, ${100-essentialRatio}% convenience items`);
        }
        
        // Category diversity insight
        if (totalCategories >= 8) {
            insights.push(`📊 Comprehensive packing: ${totalCategories} categories ensure nothing is forgotten`);
        }
        
        return `
            <h4>💡 Smart Insights</h4>
            <div class="insights-grid">
                ${insights.map(insight => `<div class="insight-item">${insight}</div>`).join('')}
            </div>
            <div class="packing-stats">
                <div class="stat-item">
                    <span class="stat-number">${totalItems}</span>
                    <span class="stat-label">Total Items</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${essentialItems}</span>
                    <span class="stat-label">Essential Items</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${totalCategories}</span>
                    <span class="stat-label">Categories</span>
                </div>
            </div>
        `;
    }

    createCategoryElement(categoryKey, items) {
        const totalItems = Object.keys(items).length;
        const completedItems = Object.values(items).filter(item => item.completed).length;
        const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        categoryDiv.setAttribute('data-category', categoryKey);
        
        // NEW: Add category-specific styling classes
        if (this.isHighPriorityCategory(categoryKey)) {
            categoryDiv.classList.add('high-priority-category');
        }
        if (this.isTransportationCategory(categoryKey)) {
            categoryDiv.classList.add('transportation-category');
        }
        if (this.isAccommodationCategory(categoryKey)) {
            categoryDiv.classList.add('accommodation-category');
        }
        
        categoryDiv.innerHTML = `
            <div class="category-header" data-category-toggle="${categoryKey}">
                <div class="category-title">
                    <span class="category-icon">${this.categoryIcons[categoryKey] || '📦'}</span>
                    <span class="category-name">${this.categoryNames[categoryKey] || categoryKey.replace('_', ' ')}</span>
                    ${this.getCategoryBadge(categoryKey)}
                </div>
                <div class="category-progress">
                    <div class="category-badge">${completedItems}/${totalItems}</div>
                    <div class="category-badge">${percentage}%</div>
                    <span class="toggle-icon">▼</span>
                </div>
            </div>
            <div class="category-content" id="category-${categoryKey}">
                <div class="category-description">${this.getCategoryDescription(categoryKey)}</div>
                ${Object.entries(items).map(([itemName, itemData]) => 
                    this.createItemElement(categoryKey, itemName, itemData)
                ).join('')}
                <div class="add-item-section">
                    <div class="add-item-form">
                        <input type="text" placeholder="Add custom item..." id="new-item-${categoryKey}">
                        <input type="number" placeholder="Qty" min="1" value="1" id="new-qty-${categoryKey}">
                        <button class="btn btn-primary" data-add-item="${categoryKey}">Add</button>
                    </div>
                </div>
            </div>
        `;
        
        return categoryDiv;
    }

    // NEW: Check if category is high priority
    isHighPriorityCategory(categoryKey) {
        const highPriorityCategories = [
            'documents', 'flight_essentials', 'carry_on_items', 'international_travel',
            'international_essentials', 'accommodation_items'
        ];
        return highPriorityCategories.includes(categoryKey);
    }

    // NEW: Check if category is transportation-related
    isTransportationCategory(categoryKey) {
        return categoryKey.includes('flight') || categoryKey.includes('car') || 
               categoryKey.includes('train') || categoryKey.includes('ferry') ||
               categoryKey.includes('road_trip') || categoryKey.includes('rental') ||
               categoryKey.includes('international');
    }

    // NEW: Check if category is accommodation-related
    isAccommodationCategory(categoryKey) {
        return categoryKey.includes('hotel') || categoryKey.includes('airbnb') ||
               categoryKey.includes('hostel') || categoryKey.includes('camping') ||
               categoryKey.includes('family') || categoryKey.includes('accommodation');
    }

    // NEW: Get category badge based on type
    getCategoryBadge(categoryKey) {
        if (this.isHighPriorityCategory(categoryKey)) {
            return '<span class="category-badge-priority">ESSENTIAL</span>';
        }
        if (this.isTransportationCategory(categoryKey)) {
            return '<span class="category-badge-transport">TRANSPORT</span>';
        }
        if (this.isAccommodationCategory(categoryKey)) {
            return '<span class="category-badge-accommodation">ACCOMMODATION</span>';
        }
        return '';
    }

    // NEW: Get category description
    getCategoryDescription(categoryKey) {
        const descriptions = {
            'flight_essentials': 'Items required for air travel and airport security',
            'carry_on_items': 'Items that must be in your carry-on bag',
            'international_travel': 'Additional requirements for international flights',
            'hotel_essentials': 'Items specifically for hotel stays (towels provided)',
            'airbnb_essentials': 'Items for vacation rentals (bring everything)',
            'hostel_essentials': 'Items for hostel stays (focus on security)',
            'camping_essentials': 'Complete camping setup for outdoor accommodation',
            'car_camping': 'Items specifically for car-based camping',
            'budget_travel_security': 'Security-focused items for budget accommodations'
        };
        
        const description = descriptions[categoryKey];
        return description ? `<p class="category-desc">${description}</p>` : '';
    }

    createItemElement(categoryKey, itemName, itemData) {
        const itemId = `${categoryKey}-${itemName.replace(/[^a-zA-Z0-9]/g, '')}`;
        
        // NEW: Add item priority classes
        let itemClasses = 'item';
        if (itemData.completed) itemClasses += ' completed';
        if (itemData.essential) itemClasses += ' essential-item';
        if (itemData.custom) itemClasses += ' custom-item';
        
        return `
            <div class="${itemClasses}" id="item-${itemId}">
                <input type="checkbox" 
                       class="item-checkbox" 
                       data-category="${categoryKey}"
                       data-item="${itemName}"
                       ${itemData.completed ? 'checked' : ''}>
                <div class="item-content">
                    <div class="item-header">
                        <div class="item-name">
                            ${itemName}
                            ${itemData.essential ? '<span class="item-essential">*</span>' : ''}
                            ${itemData.custom ? '<span class="item-custom">CUSTOM</span>' : ''}
                        </div>
                        <div class="item-metadata">
                            ${itemData.quantity > 1 ? `<div class="item-quantity">×${itemData.quantity}</div>` : ''}
                            ${this.getItemPriorityBadge(itemData)}
                        </div>
                    </div>
                    <textarea class="item-notes" 
                              placeholder="Add notes..." 
                              data-category="${categoryKey}"
                              data-item="${itemName}">${itemData.notes || ''}</textarea>
                </div>
            </div>
        `;
    }

    // NEW: Get item priority badge
    getItemPriorityBadge(itemData) {
        if (itemData.essential) {
            return '<span class="item-badge-essential">ESSENTIAL</span>';
        }
        if (itemData.custom) {
            return '<span class="item-badge-custom">CUSTOM</span>';
        }
        return '';
    }

    // All existing methods remain the same but enhanced...
    bindCategoryEvents() {
        // Category toggle handlers
        document.querySelectorAll('[data-category-toggle]').forEach(header => {
            header.addEventListener('click', (e) => {
                const categoryKey = header.getAttribute('data-category-toggle');
                this.toggleCategory(categoryKey);
            });
        });

        // Item checkbox handlers
        document.querySelectorAll('.item-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const category = e.target.getAttribute('data-category');
                const item = e.target.getAttribute('data-item');
                this.onItemToggle(category, item);
                
                // NEW: Re-apply filter after item toggle to update visibility
                setTimeout(() => {
                    this.applyFilter();
                    this.updateFilterStats();
                }, 100);
            });
        });

        // Add item button handlers
        document.querySelectorAll('[data-add-item]').forEach(button => {
            button.addEventListener('click', (e) => {
                const category = button.getAttribute('data-add-item');
                this.handleAddItem(category);
            });
        });

        // Note update handlers
        document.querySelectorAll('.item-notes').forEach(textarea => {
            textarea.addEventListener('change', (e) => {
                const category = e.target.getAttribute('data-category');
                const item = e.target.getAttribute('data-item');
                this.onNoteUpdate(category, item, e.target.value);
            });
        });

        // Enter key on add item inputs
        document.querySelectorAll('[id^="new-item-"]').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const category = input.id.replace('new-item-', '');
                    this.handleAddItem(category);
                }
            });
        });
    }

    // NEW: Update filter stats
    updateFilterStats() {
        const filterStats = document.querySelector('.filter-stats');
        if (!filterStats) return;
        
        const allItems = document.querySelectorAll('.item:not(.add-item-section)');
        let incompleteItems = 0;
        let incompleteEssentials = 0;
        
        allItems.forEach(item => {
            if (!item.classList.contains('completed')) {
                incompleteItems++;
                if (item.classList.contains('essential-item')) {
                    incompleteEssentials++;
                }
            }
        });
        
        filterStats.textContent = `📋 ${incompleteItems} items remaining${incompleteEssentials > 0 ? ` (${incompleteEssentials} essential)` : ''}`;
        
        // Hide filter controls if no incomplete items
        if (incompleteItems === 0) {
            const filterControls = document.querySelector('.filter-controls');
            if (filterControls) {
                filterControls.style.display = 'none';
            }
        }
    }

    toggleCategory(categoryKey) {
        const content = document.getElementById(`category-${categoryKey}`);
        const category = content.parentElement;
        
        if (content.classList.contains('expanded')) {
            content.classList.remove('expanded');
            category.classList.remove('expanded');
        } else {
            content.classList.add('expanded');
            category.classList.add('expanded');
        }
    }

    handleAddItem(categoryKey) {
        const nameInput = document.getElementById(`new-item-${categoryKey}`);
        const qtyInput = document.getElementById(`new-qty-${categoryKey}`);
        
        const itemName = nameInput.value.trim();
        const quantity = parseInt(qtyInput.value) || 1;
        
        if (!itemName) {
            alert('Please enter an item name');
            return;
        }
        
        // Clear inputs
        nameInput.value = '';
        qtyInput.value = '1';
        
        // Call parent handler
        this.onItemAdd(categoryKey, itemName, quantity);
    }

    updateItem(categoryKey, itemName, itemData) {
        const itemId = `${categoryKey}-${itemName.replace(/[^a-zA-Z0-9]/g, '')}`;
        const itemElement = document.getElementById(`item-${itemId}`);
        
        if (itemElement) {
            if (itemData.completed) {
                itemElement.classList.add('completed');
            } else {
                itemElement.classList.remove('completed');
            }
            
            // Update checkbox
            const checkbox = itemElement.querySelector('.item-checkbox');
            if (checkbox) {
                checkbox.checked = itemData.completed;
            }
        }
        
        // Update category progress
        this.updateCategoryProgress(categoryKey);
    }

    updateCategoryProgress(categoryKey) {
        const categoryElement = document.querySelector(`[data-category="${categoryKey}"]`);
        if (!categoryElement) return;
        
        // Count items
        const items = categoryElement.querySelectorAll('.item');
        const completedItems = categoryElement.querySelectorAll('.item.completed');
        const totalItems = items.length - 1; // Subtract 1 for the add item section
        const completed = completedItems.length;
        const percentage = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;
        
        // Update badges
        const badges = categoryElement.querySelectorAll('.category-badge');
        if (badges.length >= 2) {
            badges[0].textContent = `${completed}/${totalItems}`;
            badges[1].textContent = `${percentage}%`;
        }
        
        // NEW: Update category completion status
        if (percentage === 100) {
            categoryElement.classList.add('category-complete');
        } else {
            categoryElement.classList.remove('category-complete');
        }
    }
}
