// Items database - master list of all possible packing items
export const itemsDatabase = {
    essentials: {
        clothes: {
            icon: '👔',
            items: {
                'Underwear': { 
                    multiplier: 1.2, 
                    essential: true,
                    min: 3,
                    description: 'Pack extras for comfort'
                },
                'Socks': { 
                    multiplier: 1.2, 
                    essential: true,
                    min: 3,
                    description: 'Mix of regular and athletic'
                },
                'Sleep bottoms': { 
                    multiplier: 0.4, 
                    essential: true, 
                    min: 2,
                    description: 'Pajama pants or shorts'
                },
                'Sleep tops': { 
                    multiplier: 0.4, 
                    essential: true, 
                    min: 2,
                    description: 'Comfortable sleeping shirts'
                },
                'Basic t-shirts': { 
                    multiplier: 0.8, 
                    essential: true,
                    min: 2,
                    description: 'Versatile everyday wear'
                },
                'Pants/jeans': { 
                    multiplier: 0.4, 
                    essential: true, 
                    min: 2,
                    max: 4,
                    description: 'Everyday bottoms'
                },
                'Casual shirts': {
                    multiplier: 0.6,
                    essential: true,
                    min: 2,
                    description: 'For dining and activities'
                }
            }
        },
        toiletries: {
            icon: '🧴',
            items: {
                'Toothbrush & toothpaste': { 
                    multiplier: 0, 
                    essential: true,
                    description: 'Travel-sized preferred'
                },
                'Shampoo & conditioner': { 
                    multiplier: 0, 
                    essential: true,
                    description: 'Travel bottles or hotel provided'
                },
                'Body wash/soap': { 
                    multiplier: 0, 
                    essential: true 
                },
                'Deodorant': { 
                    multiplier: 0, 
                    essential: true 
                },
                'Medications': { 
                    multiplier: 0, 
                    essential: true,
                    description: 'Prescription and basic meds'
                },
                'Razor & shaving cream': {
                    multiplier: 0,
                    essential: false,
                    description: 'If needed'
                },
                'Skincare items': {
                    multiplier: 0,
                    essential: false,
                    description: 'Moisturizer, sunscreen'
                },
                'Coffee/Tea': { 
                    multiplier: 2, 
                    essential: true,
                    description: 'For morning routine, aeropress etc'
        }
            }
        },
        electronics: {
            icon: '💻',
            items: {
                'Phone charger': { 
                    multiplier: 0, 
                    essential: true,
                    description: 'Consider backup cable'
                },
                'Universal adapter': { 
                    multiplier: 0, 
                    essential: true,
                    description: 'For international travel'
                },
                'Power bank': { 
                    multiplier: 0, 
                    essential: true,
                    description: '10000mAh+ recommended'
                },
                'Headphones': {
                    multiplier: 0,
                    essential: false,
                    description: 'For flights and downtime'
                }
            }
        },
        documents: {
            icon: '📄',
            items: {
                'Passport/ID': { 
                    multiplier: 0, 
                    essential: true,
                    description: 'Check expiration date'
                },
                'Travel insurance': { 
                    multiplier: 0, 
                    essential: true,
                    description: 'Print copy + digital'
                },
                'Flight/transport tickets': { 
                    multiplier: 0, 
                    essential: true,
                    description: 'Print backups'
                },
                'Hotel confirmations': {
                    multiplier: 0,
                    essential: true,
                    description: 'Address and booking info'
                },
                'Credit/debit cards': { 
                    multiplier: 0, 
                    essential: true,
                    description: 'Notify bank of travel'
                },
                'Cash': {
                    multiplier: 0,
                    essential: true,
                    description: 'Local currency if possible'
                }
            }
        }
    },
    
    seasonal: {
        cold_weather: {
            'Heavy coat': { multiplier: 0, essential: true },
            'Thermal underwear': { multiplier: 0.6, essential: true },
            'Warm gloves': { multiplier: 0.2, essential: true },
            'Winter hat': { multiplier: 0, essential: true },
            'Scarf': { multiplier: 0, essential: false },
            'Warm socks': { multiplier: 0.8, essential: true }
        },
        hot_weather: {
            'Light shirts': { multiplier: 1, essential: true },
            'Shorts': { multiplier: 0.6, essential: true },
            'Sandals': { multiplier: 0, essential: true },
            'Sun hat': { multiplier: 0, essential: true },
            'Sunglasses': { multiplier: 0, essential: true },
            'Sunscreen': { multiplier: 0, essential: true }
        },
        rainy_weather: {
            'Rain jacket': { multiplier: 0, essential: true },
            'Waterproof shoes': { multiplier: 0, essential: false },
            'Compact umbrella': { multiplier: 0, essential: true },
            'Waterproof bag cover': { multiplier: 0, essential: false }
        }
    },
    
    // NEW: Transportation-specific items
    transportation_specific: {
        flight_essentials: {
            'Boarding pass (printed & digital)': { 
                multiplier: 0, 
                essential: true,
                description: 'Multiple formats for backup'
            },
            'TSA PreCheck/Global Entry info': { 
                multiplier: 0, 
                essential: false,
                description: 'If enrolled'
            },
            'Flight confirmation email': { 
                multiplier: 0, 
                essential: true 
            },
            'Seat selection confirmation': { 
                multiplier: 0, 
                essential: false 
            },
            'Airline app downloaded': { 
                multiplier: 0, 
                essential: true,
                description: 'For real-time updates'
            }
        },
        carry_on_items: {
            'TSA-compliant toiletries': { 
                multiplier: 0, 
                essential: true,
                description: '3-1-1 rule: 3oz bottles in 1 quart bag'
            },
            'Clear liquids bag': { 
                multiplier: 0, 
                essential: true,
                description: 'Quart-size ziplock'
            },
            'Laptop easily accessible': { 
                multiplier: 0, 
                essential: true,
                description: 'For security screening'
            },
            'Chargers in carry-on': { 
                multiplier: 0, 
                essential: true,
                description: 'In case checked bag is lost'
            },
            'Change of clothes in carry-on': { 
                multiplier: 0, 
                essential: true,
                description: 'Emergency backup'
            },
            'Medications in original bottles': { 
                multiplier: 0, 
                essential: true,
                description: 'Keep in carry-on'
            }
        },
        flight_comfort: {
            'Neck pillow': { 
                multiplier: 0, 
                essential: false,
                description: 'For longer flights'
            },
            'Eye mask': { 
                multiplier: 0, 
                essential: false,
                description: 'Block cabin lights'
            },
            'Noise-canceling headphones': { 
                multiplier: 0, 
                essential: false,
                description: 'Reduce engine noise'
            },
            'Compression socks': { 
                multiplier: 0, 
                essential: false,
                description: 'Prevent blood clots on long flights'
            },
            'Empty water bottle': { 
                multiplier: 0, 
                essential: true,
                description: 'Fill after security'
            },
            'Entertainment device': { 
                multiplier: 0, 
                essential: false,
                description: 'Tablet, e-reader, etc.'
            },
            'Portable phone charger': { 
                multiplier: 0, 
                essential: true,
                description: 'For long travel days'
            }
        },
        car_travel: {
            'Valid driver\'s license': { 
                multiplier: 0, 
                essential: true 
            },
            'Car registration & insurance': { 
                multiplier: 0, 
                essential: true,
                description: 'Keep in glove compartment'
            },
            'Emergency roadside kit': { 
                multiplier: 0, 
                essential: true,
                description: 'Jumper cables, flares, etc.'
            },
            'First aid kit': { 
                multiplier: 0, 
                essential: true 
            },
            'Phone car charger': { 
                multiplier: 0, 
                essential: true 
            },
            'Paper maps (backup)': { 
                multiplier: 0, 
                essential: false,
                description: 'In case GPS fails'
            },
            'Cash for tolls': { 
                multiplier: 0, 
                essential: true 
            },
            'Roadside assistance contact': { 
                multiplier: 0, 
                essential: true,
                description: 'AAA or insurance company'
            },
            'Comfortable driving shoes': { 
                multiplier: 0, 
                essential: true 
            },
            'Sunglasses': { 
                multiplier: 0, 
                essential: true 
            },
            'Road trip snacks': { 
                multiplier: 0.3, 
                essential: false,
                description: 'Non-perishable options'
            },
            'Water bottles': { 
                multiplier: 0.5, 
                essential: true 
            }
        },
        train_travel: {
            'Train tickets (printed & digital)': { 
                multiplier: 0, 
                essential: true 
            },
            'Seat reservation confirmation': { 
                multiplier: 0, 
                essential: false 
            },
            'Station maps/directions': { 
                multiplier: 0, 
                essential: false,
                description: 'Large stations can be confusing'
            },
            'Comfortable travel pillow': { 
                multiplier: 0, 
                essential: false 
            },
            'Light blanket/shawl': { 
                multiplier: 0, 
                essential: false,
                description: 'Trains can be cold'
            },
            'Entertainment': { 
                multiplier: 0, 
                essential: false,
                description: 'Books, tablets, music'
            },
            'Snacks': { 
                multiplier: 0.2, 
                essential: false,
                description: 'Dining car can be expensive'
            }
        },
        ferry_travel: {
            'Ferry tickets': { 
                multiplier: 0, 
                essential: true 
            },
            'Motion sickness medication': { 
                multiplier: 0, 
                essential: false,
                description: 'Take before boarding'
            },
            'Waterproof bag for electronics': { 
                multiplier: 0, 
                essential: true,
                description: 'Protect from sea spray'
            },
            'Warm jacket for deck': { 
                multiplier: 0, 
                essential: true,
                description: 'Ocean air is always cooler'
            },
            'Non-slip shoes': { 
                multiplier: 0, 
                essential: true,
                description: 'Decks can be wet and slippery'
            },
            'Entertainment for crossing': { 
                multiplier: 0, 
                essential: false,
                description: 'Long crossings can be boring'
            }
        }
    },

    // NEW: Accommodation-specific items
    accommodation_specific: {
        hotel_items: {
            'Hotel confirmation printout': { 
                multiplier: 0, 
                essential: true,
                description: 'Address and booking reference'
            },
            'Loyalty program card/number': { 
                multiplier: 0, 
                essential: false 
            },
            'Personal toiletries': { 
                multiplier: 0, 
                essential: true,
                description: 'Hotel provides basics only'
            },
            'Tip money for housekeeping': { 
                multiplier: 0, 
                essential: false,
                description: '$2-5 per night'
            },
            'Phone charger': { 
                multiplier: 0, 
                essential: true 
            },
            'Laundry bag': { 
                multiplier: 0, 
                essential: false,
                description: 'Keep dirty clothes separate'
            }
        },
        luxury_hotel_items: {
            'Formal dinner attire': { 
                multiplier: 0, 
                essential: true,
                description: 'Some restaurants have dress codes'
            },
            'Dress shoes': { 
                multiplier: 0, 
                essential: true 
            },
            'Upscale casual wear': { 
                multiplier: 0.3, 
                essential: true,
                description: 'For hotel common areas'
            },
            'Nice accessories': { 
                multiplier: 0, 
                essential: false,
                description: 'Watch, jewelry, etc.'
            }
        },
        airbnb_items: {
            'Host contact information': { 
                multiplier: 0, 
                essential: true,
                description: 'Phone number and check-in details'
            },
            'Check-in instructions': { 
                multiplier: 0, 
                essential: true,
                description: 'Key location, codes, etc.'
            },
            'All personal toiletries': { 
                multiplier: 0, 
                essential: true,
                description: 'Nothing is provided'
            },
            'Basic cleaning supplies': { 
                multiplier: 0, 
                essential: true,
                description: 'Leave it clean for next guest'
            },
            'Dish soap': { 
                multiplier: 0, 
                essential: true,
                description: 'For washing dishes'
            },
            'Coffee/tea': { 
                multiplier: 0, 
                essential: false,
                description: 'May not be provided'
            },
            'Breakfast basics': { 
                multiplier: 0, 
                essential: false,
                description: 'Bread, milk, eggs'
            },
            'Laundry detergent': { 
                multiplier: 0, 
                essential: false,
                description: 'If washer available'
            },
            'Trash bags': { 
                multiplier: 0, 
                essential: false,
                description: 'Take out trash on departure'
            }
        },
        hostel_items: {
            'Padlock for lockers': { 
                multiplier: 0, 
                essential: true,
                description: 'Check locker size requirements'
            },
            'Quick-dry towel': { 
                multiplier: 0, 
                essential: true,
                description: 'Hostels charge for towel rental'
            },
            'Flip flops for showers': { 
                multiplier: 0, 
                essential: true,
                description: 'Hygiene in shared bathrooms'
            },
            'Earplugs': { 
                multiplier: 0, 
                essential: true,
                description: 'Dorm rooms are noisy'
            },
            'Eye mask': { 
                multiplier: 0, 
                essential: true,
                description: 'People come and go at all hours'
            },
            'Money belt': { 
                multiplier: 0, 
                essential: true,
                description: 'Keep valuables on your person'
            },
            'Toiletry caddy': { 
                multiplier: 0, 
                essential: true,
                description: 'Carry toiletries to shared bathroom'
            },
            'Combination lock for bags': { 
                multiplier: 0, 
                essential: true,
                description: 'Secure belongings'
            }
        },
        camping_items: {
            'Tent appropriate for weather': { 
                multiplier: 0, 
                essential: true 
            },
            'Sleeping bag rated for temperature': { 
                multiplier: 0, 
                essential: true 
            },
            'Sleeping pad': { 
                multiplier: 0, 
                essential: true,
                description: 'Insulation from ground'
            },
            'Camping pillow': { 
                multiplier: 0, 
                essential: true 
            },
            'Headlamp + backup batteries': { 
                multiplier: 0, 
                essential: true 
            },
            'Camping stove + fuel': { 
                multiplier: 0, 
                essential: true 
            },
            'Camping cookware': { 
                multiplier: 0, 
                essential: true,
                description: 'Lightweight pots, utensils'
            },
            'Food for entire trip': { 
                multiplier: 0, 
                essential: true,
                description: 'No restaurants nearby'
            },
            'Water purification tablets': { 
                multiplier: 0, 
                essential: true,
                description: 'Or portable filter'
            },
            'Biodegradable soap': { 
                multiplier: 0, 
                essential: true,
                description: 'Environmentally responsible'
            },
            'Insect repellent': { 
                multiplier: 0, 
                essential: true 
            },
            'Weather protection': { 
                multiplier: 0, 
                essential: true,
                description: 'Rain gear, warm layers'
            }
        },
        family_friends_items: {
            'Host gift': { 
                multiplier: 0, 
                essential: true,
                description: 'Wine, local specialty, flowers'
            },
            'Thank you card': { 
                multiplier: 0, 
                essential: true,
                description: 'Handwritten note'
            },
            'Contribution to groceries/meals': { 
                multiplier: 0, 
                essential: true,
                description: 'Cash or offer to cook'
            },
            'Personal toiletries': { 
                multiplier: 0, 
                essential: true,
                description: 'Don\'t use up their supplies'
            },
            'Personal towel (optional)': { 
                multiplier: 0, 
                essential: false,
                description: 'If staying longer than a few days'
            },
            'Respectful clothing': { 
                multiplier: 0, 
                essential: true,
                description: 'Appropriate for their household'
            },
            'Local specialty from your area': { 
                multiplier: 0, 
                essential: false,
                description: 'Something they can\'t get locally'
            }
        }
    },
    
    activities_specific: {
        hiking: {
            'Hiking boots': { multiplier: 0, essential: true },
            'Hiking backpack': { multiplier: 0, essential: true },
            'Water bottles': { multiplier: 0.2, essential: true },
            'Trail snacks': { multiplier: 0.5, essential: true },
            'First aid kit': { multiplier: 0, essential: true },
            'Maps/GPS': { multiplier: 0, essential: true },
            'Rain gear': { multiplier: 0, essential: true },
            'Hiking socks': { multiplier: 0.8, essential: true }
        },
        beach: {
            'Swimsuits': { multiplier: 0.4, essential: true, min: 2 },
            'Beach towels': { multiplier: 0.2, essential: true },
            'Flip flops': { multiplier: 0, essential: true },
            'Beach bag': { multiplier: 0, essential: false },
            'Snorkeling gear': { multiplier: 0, essential: false },
            'Water shoes': { multiplier: 0, essential: false },
            'Rash guard': { multiplier: 0, essential: false }
        },
        business: {
            'Business suits': { multiplier: 0.3, essential: true, min: 2 },
            'Dress shirts': { multiplier: 0.5, essential: true, min: 3 },
            'Dress shoes': { multiplier: 0, essential: true },
            'Ties': { multiplier: 0.3, essential: false },
            'Blazer': { multiplier: 0, essential: true },
            'Laptop': { multiplier: 0, essential: true },
            'Business cards': { multiplier: 0, essential: true },
            'Portfolio/briefcase': { multiplier: 0, essential: false }
        },
        photography: {
            'Camera body': { multiplier: 0, essential: true },
            'Camera lenses': { multiplier: 0, essential: true },
            'Memory cards': { multiplier: 0.3, essential: true },
            'Camera batteries': { multiplier: 0.2, essential: true },
            'Tripod': { multiplier: 0, essential: false },
            'Camera bag': { multiplier: 0, essential: true },
            'Lens cleaning kit': { multiplier: 0, essential: true },
            'ND filters': { multiplier: 0, essential: false }
        },
        fitness: {
            'Workout clothes': { multiplier: 0.5, essential: true },
            'Sports shoes': { multiplier: 0, essential: true },
            'Gym towel': { multiplier: 0.2, essential: false },
            'Water bottle': { multiplier: 0, essential: true },
            'Resistance bands': { multiplier: 0, essential: false },
            'Sports headphones': { multiplier: 0, essential: false }
        },
            watersports: {
        'Swimsuits': { multiplier: 0.4, essential: true, min: 2 },
        'Water shoes': { multiplier: 0, essential: true },
        'Waterproof phone case': { multiplier: 0, essential: true },
        'Dry bag': { multiplier: 0, essential: true },
        'Snorkel gear': { multiplier: 0, essential: false },
        'Rash guard': { multiplier: 0, essential: true },
        'Quick-dry towel': { multiplier: 0, essential: true },
        'Waterproof sunscreen': { multiplier: 0, essential: true }
    },
    
    entertainment: {
        'Evening attire': { multiplier: 0.3, essential: true },
        'Dress shoes': { multiplier: 0, essential: true },
        'Small evening bag': { multiplier: 0, essential: false },
        'Nice accessories': { multiplier: 0, essential: false },
        'Cash for shows/drinks': { multiplier: 0, essential: true },
        'Comfortable walking shoes': { multiplier: 0, essential: true }
    },
    
    shopping: {
        'Extra suitcase/duffle bag': { multiplier: 0, essential: true },
        'Reusable shopping bags': { multiplier: 0.2, essential: true },
        'Comfortable walking shoes': { multiplier: 0, essential: true },
        'Payment cards': { multiplier: 0, essential: true },
        'Currency for markets': { multiplier: 0, essential: false },
        'Luggage scale': { multiplier: 0, essential: false }
    },
    
    family: {
        'Kid entertainment': { multiplier: 0.5, essential: true },
        'Snacks for kids': { multiplier: 1, essential: true },
        'First aid kit': { multiplier: 0, essential: true },
        'Extra kid clothes': { multiplier: 1.5, essential: true },
        'Wipes': { multiplier: 1, essential: true },
        'Portable games/toys': { multiplier: 0.3, essential: false }
    },
    
    relaxation: {
        'Books': { multiplier: 0.2, essential: true },
        'E-reader': { multiplier: 0, essential: false },
        'Journal': { multiplier: 0, essential: false },
        'Comfortable loungewear': { multiplier: 0.4, essential: true },
        'Eye mask': { multiplier: 0, essential: false },
        'Meditation app': { multiplier: 0, essential: false },
        'Herbal tea': { multiplier: 0, essential: false }
    }
}
    },
    
    special_items: {
        baby_travel: {
            'Diapers': { multiplier: 6, essential: true },
            'Baby wipes': { multiplier: 2, essential: true },
            'Baby clothes': { multiplier: 2, essential: true },
            'Formula/food': { multiplier: 3, essential: true },
            'Bottles': { multiplier: 0.5, essential: true },
            'Pacifiers': { multiplier: 0.3, essential: true },
            'Baby carrier': { multiplier: 0, essential: true },
            'Stroller': { multiplier: 0, essential: false }
        },
        medical_needs: {
            'Prescription medications': { multiplier: 0, essential: true },
            'Medical devices': { multiplier: 0, essential: true },
            'Emergency contacts': { multiplier: 0, essential: true },
            'Insurance cards': { multiplier: 0, essential: true },
            'Allergy medications': { multiplier: 0, essential: false }
        },
        tech_nomad: {
            'Laptop': { multiplier: 0, essential: true },
            'Laptop charger': { multiplier: 0, essential: true },
            'Mouse': { multiplier: 0, essential: false },
            'Portable monitor': { multiplier: 0, essential: false },
            'USB hub': { multiplier: 0, essential: false },
            'Ethernet cable': { multiplier: 0, essential: false },
            'Backup drive': { multiplier: 0, essential: false }
        }
    }
};
