// Trip configuration data - defines trip types and their characteristics
export const tripConfig = {
    tripTypes: {
        business: {
            name: 'Business',
            description: 'Professional travel for work or conferences',
            defaultActivities: ['business'],
            suggestedItems: {
                business_items: {
                    'Laptop & charger': { multiplier: 0, essential: true },
                    'Business cards': { multiplier: 0, essential: true },
                    'Notebook & pens': { multiplier: 0, essential: true },
                    'Portable charger': { multiplier: 0, essential: true }
                }
            }
        },
        leisure: {
            name: 'Leisure',
            description: 'Vacation and relaxation travel',
            defaultActivities: ['sightseeing'],
            suggestedItems: {
                activity_items: {
                    'Camera': { multiplier: 0, essential: false },
                    'Guidebook': { multiplier: 0, essential: false },
                    'Comfortable walking shoes': { multiplier: 0, essential: true }
                }
            }
        },
        camping: {
            name: 'Camping',
            description: 'Outdoor camping and wilderness trips',
            defaultActivities: ['hiking'],
            suggestedItems: {
                camping_gear: {
                    'Tent': { multiplier: 0, essential: true },
                    'Sleeping bag': { multiplier: 0, essential: true },
                    'Camping stove': { multiplier: 0, essential: true },
                    'Flashlight/headlamp': { multiplier: 0, essential: true },
                    'First aid kit': { multiplier: 0, essential: true }
                }
            }
        },
        'winter-sports': {
            name: 'Winter Sports',
            description: 'Skiing, snowboarding, and winter activities',
            defaultActivities: [],
            suggestedItems: {
                winter_sports_gear: {
                    'Ski/snowboard jacket': { multiplier: 0, essential: true },
                    'Snow pants': { multiplier: 0, essential: true },
                    'Thermal underwear': { multiplier: 0.6, essential: true },
                    'Goggles': { multiplier: 0, essential: true },
                    'Gloves': { multiplier: 0.2, essential: true }
                }
            }
        },
        beach: {
            name: 'Beach',
            description: 'Beach vacation and water activities',
            defaultActivities: ['beach'],
            suggestedItems: {
                beach_gear: {
                    'Swimwear': { multiplier: 0.4, essential: true, min: 2 },
                    'Beach towel': { multiplier: 0, essential: true },
                    'Sunscreen': { multiplier: 0, essential: true },
                    'Beach bag': { multiplier: 0, essential: false }
                }
            }
        },
        'city-break': {
            name: 'City Break',
            description: 'Short urban getaway',
            defaultActivities: ['sightseeing'],
            suggestedItems: {
                city_items: {
                    'City map/app': { multiplier: 0, essential: true },
                    'Comfortable walking shoes': { multiplier: 0, essential: true },
                    'Light daypack': { multiplier: 0, essential: true }
                }
            }
        }
    },
    
    // NEW: Transportation types and their requirements
    transportationTypes: {
        plane: {
            name: 'Flight',
            icon: '✈️',
            description: 'Air travel with security and baggage restrictions',
            categories: ['carry_on_items', 'flight_comfort'],
            restrictions: {
                liquids: '100ml containers in clear bag',
                electronics: 'Must be easily accessible for security',
                batteries: 'Lithium batteries in carry-on only'
            },
            suggestedItems: {
                carry_on_items: {
                    'Travel-size toiletries (100ml)': { multiplier: 0, essential: true },
                    'Clear liquids bag': { multiplier: 0, essential: true },
                    'Laptop in accessible bag': { multiplier: 0, essential: true },
                    'Phone charger': { multiplier: 0, essential: true },
                    'Important documents in carry-on': { multiplier: 0, essential: true }
                },
                flight_comfort: {
                    'Neck pillow': { multiplier: 0, essential: false },
                    'Eye mask': { multiplier: 0, essential: false },
                    'Noise-canceling headphones': { multiplier: 0, essential: false },
                    'Compression socks': { multiplier: 0, essential: false },
                    'Entertainment (book/tablet)': { multiplier: 0, essential: false }
                }
            }
        },
        car: {
            name: 'Car/Road Trip',
            icon: '🚗',
            description: 'Driving with flexible packing but emergency needs',
            categories: ['road_trip_essentials', 'car_emergency'],
            suggestedItems: {
                road_trip_essentials: {
                    'Driver\'s license': { multiplier: 0, essential: true },
                    'Car insurance documents': { multiplier: 0, essential: true },
                    'Road maps/GPS': { multiplier: 0, essential: true },
                    'Snacks for journey': { multiplier: 0.3, essential: true },
                    'Water bottles': { multiplier: 0.5, essential: true },
                    'Phone car charger': { multiplier: 0, essential: true }
                },
                car_emergency: {
                    'Emergency car kit': { multiplier: 0, essential: true },
                    'Jumper cables': { multiplier: 0, essential: false },
                    'First aid kit': { multiplier: 0, essential: true },
                    'Emergency contact list': { multiplier: 0, essential: true },
                    'Cash for tolls/emergencies': { multiplier: 0, essential: true }
                }
            }
        },
        train: {
            name: 'Train',
            icon: '🚊',
            description: 'Rail travel with comfort and timing considerations',
            categories: ['train_comfort', 'station_navigation'],
            suggestedItems: {
                train_comfort: {
                    'Comfortable pillow': { multiplier: 0, essential: false },
                    'Blanket/shawl': { multiplier: 0, essential: false },
                    'Entertainment': { multiplier: 0, essential: false },
                    'Snacks': { multiplier: 0.2, essential: false },
                    'Water bottle': { multiplier: 0, essential: true }
                },
                station_navigation: {
                    'Train tickets': { multiplier: 0, essential: true },
                    'Station maps': { multiplier: 0, essential: false },
                    'Platform information': { multiplier: 0, essential: true }
                }
            }
        },
        ferry: {
            name: 'Ferry/Boat',
            icon: '⛴️',
            description: 'Water travel with motion and weather considerations',
            categories: ['marine_travel', 'seasickness_prep'],
            suggestedItems: {
                marine_travel: {
                    'Waterproof bag': { multiplier: 0, essential: true },
                    'Deck appropriate clothing': { multiplier: 0, essential: true },
                    'Sun protection': { multiplier: 0, essential: true },
                    'Warm layer for deck': { multiplier: 0, essential: true }
                },
                seasickness_prep: {
                    'Motion sickness medication': { multiplier: 0, essential: false },
                    'Ginger supplements': { multiplier: 0, essential: false },
                    'Light snacks': { multiplier: 0, essential: false }
                }
            }
        },
        bus: {
            name: 'Bus/Coach',
            icon: '🚌',
            description: 'Bus travel with limited space and comfort needs',
            categories: ['bus_comfort'],
            suggestedItems: {
                bus_comfort: {
                    'Neck support': { multiplier: 0, essential: false },
                    'Entertainment': { multiplier: 0, essential: false },
                    'Snacks': { multiplier: 0.2, essential: false },
                    'Layers for temperature': { multiplier: 0, essential: true }
                }
            }
        }
    },

    // NEW: Accommodation types and their characteristics
    accommodationTypes: {
        hotel: {
            name: 'Hotel',
            icon: '🏨',
            description: 'Full-service accommodation with amenities provided',
            categories: ['hotel_extras'],
            assumptions: {
                provided: ['Towels', 'Basic toiletries', 'Hair dryer', 'Iron', 'Hangers'],
                notProvided: ['Personal toiletries', 'Laundry detergent', 'Snacks']
            },
            suggestedItems: {
                hotel_extras: {
                    'Tip money for housekeeping': { multiplier: 0, essential: false },
                    'Personal toiletries': { multiplier: 0, essential: true },
                    'Phone charger': { multiplier: 0, essential: true },
                    'Do not disturb preferences': { multiplier: 0, essential: false }
                }
            }
        },
        airbnb: {
            name: 'Airbnb/Vacation Rental',
            icon: '🏠',
            description: 'Self-catering accommodation, check what\'s provided',
            categories: ['self_catering', 'cleaning_supplies'],
            assumptions: {
                maybeProvided: ['Kitchen basics', 'Towels', 'Linens'],
                bringYourOwn: ['All toiletries', 'Food', 'Cleaning supplies']
            },
            suggestedItems: {
                self_catering: {
                    'Basic cooking ingredients': { multiplier: 0, essential: false },
                    'Coffee/tea': { multiplier: 0, essential: false },
                    'Breakfast items': { multiplier: 0.3, essential: false },
                    'Kitchen towel': { multiplier: 0, essential: false },
                    'Dish soap': { multiplier: 0, essential: true }
                },
                cleaning_supplies: {
                    'Cleaning wipes': { multiplier: 0, essential: true },
                    'Trash bags': { multiplier: 0, essential: false },
                    'Basic cleaning spray': { multiplier: 0, essential: true }
                }
            }
        },
        camping: {
            name: 'Camping',
            icon: '⛺',
            description: 'Outdoor accommodation, bring everything needed',
            categories: ['camping_essentials', 'outdoor_comfort'],
            assumptions: {
                provided: [],
                bringEverything: true
            },
            suggestedItems: {
                camping_essentials: {
                    'Tent': { multiplier: 0, essential: true },
                    'Sleeping bag': { multiplier: 0, essential: true },
                    'Sleeping pad': { multiplier: 0, essential: true },
                    'Camping pillow': { multiplier: 0, essential: true },
                    'Headlamp/flashlight': { multiplier: 0, essential: true }
                },
                outdoor_comfort: {
                    'Camping chair': { multiplier: 0, essential: false },
                    'Cooler': { multiplier: 0, essential: false },
                    'Insect repellent': { multiplier: 0, essential: true },
                    'Sunscreen': { multiplier: 0, essential: true }
                }
            }
        },
        hostel: {
            name: 'Hostel',
            icon: '🏨',
            description: 'Budget accommodation with shared facilities',
            categories: ['hostel_security', 'shared_facilities'],
            assumptions: {
                provided: ['Bed', 'Basic linens'],
                shared: ['Bathrooms', 'Kitchen', 'Common areas']
            },
            suggestedItems: {
                hostel_security: {
                    'Padlock for lockers': { multiplier: 0, essential: true },
                    'Money belt': { multiplier: 0, essential: true },
                    'Flip flops for showers': { multiplier: 0, essential: true }
                },
                shared_facilities: {
                    'Quick-dry towel': { multiplier: 0, essential: true },
                    'Toiletry bag': { multiplier: 0, essential: true },
                    'Earplugs': { multiplier: 0, essential: true },
                    'Eye mask': { multiplier: 0, essential: true }
                }
            }
        },
        family: {
            name: 'Staying with Family/Friends',
            icon: '👨‍👩‍👧‍👦',
            description: 'Staying with people you know, bring courtesy items',
            categories: ['courtesy_items', 'host_gifts'],
            assumptions: {
                provided: ['Accommodation', 'Basic amenities'],
                courtesy: ['Bring gifts', 'Help with expenses', 'Respect house rules']
            },
            suggestedItems: {
                courtesy_items: {
                    'Personal toiletries': { multiplier: 0, essential: true },
                    'Personal towel': { multiplier: 0, essential: false },
                    'Contribution to groceries': { multiplier: 0, essential: true }
                },
                host_gifts: {
                    'Host gift': { multiplier: 0, essential: true },
                    'Local specialty from home': { multiplier: 0, essential: false },
                    'Thank you card': { multiplier: 0, essential: true }
                }
            }
        }
    },
    
    activities: {
        business: {
            name: 'Business Meetings',
            icon: '💼',
            requiredItems: ['Business attire', 'Laptop', 'Business cards']
        },
        sightseeing: {
            name: 'Sightseeing',
            icon: '🏛️',
            requiredItems: ['Camera', 'Comfortable shoes', 'Daypack']
        },
        hiking: {
            name: 'Hiking',
            icon: '🥾',
            requiredItems: ['Hiking boots', 'Backpack', 'Water bottle']
        },
        beach: {
            name: 'Beach Activities',
            icon: '🏖️',
            requiredItems: ['Swimwear', 'Beach towel', 'Sunscreen']
        },
        workout: {
            name: 'Gym & Fitness',
            icon: '💪',
            requiredItems: ['Workout clothes', 'Sports shoes', 'Gym towel']
        },
        photography: {
            name: 'Photography',
            icon: '📸',
            requiredItems: ['Camera', 'Extra batteries', 'Memory cards']
        }
    }
};
