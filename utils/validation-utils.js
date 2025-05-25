// utils/validation-utils.js - Input validation helpers
import { countriesDatabase } from '../data/countries-database.js';

export class ValidationUtils {
    
    /**
     * Validate trip basic info
     */
    static validateTripInfo(tripInfo) {
        const errors = [];
        
        // Required fields
        if (!tripInfo.destination?.city?.trim()) {
            errors.push('Destination city is required');
        }
        
        if (!tripInfo.destination?.countryCode) {
            errors.push('Destination country is required');
        }
        
        if (!tripInfo.startDate) {
            errors.push('Start date is required');
        }
        
        if (!tripInfo.nights || tripInfo.nights < 1) {
            errors.push('Number of nights must be at least 1');
        }
        
        if (!tripInfo.tripType) {
            errors.push('Trip type is required');
        }

        // Date validation
        if (tripInfo.startDate) {
            const startDate = new Date(tripInfo.startDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (startDate < today) {
                errors.push('Start date cannot be in the past');
            }
        }

        // Nights validation
        if (tripInfo.nights && (tripInfo.nights > 365)) {
            errors.push('Trip cannot be longer than 365 nights');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Validate location input format
     */
    static validateLocationInput(locationInput) {
        const errors = [];
        
        if (!locationInput || typeof locationInput !== 'string') {
            errors.push('Location input is required');
            return { isValid: false, errors: errors };
        }

        const trimmed = locationInput.trim();
        if (!trimmed) {
            errors.push('Location cannot be empty');
            return { isValid: false, errors: errors };
        }

        // Check format: "City, Country"
        const parts = trimmed.split(',').map(s => s.trim());
        
        if (parts.length !== 2) {
            errors.push('Location must be in format "City, Country"');
            return { isValid: false, errors: errors };
        }

        const [city, countryName] = parts;

        // Validate city
        if (!city || city.length < 2) {
            errors.push('City name must be at least 2 characters');
        }

        if (city && city.length > 50) {
            errors.push('City name too long (max 50 characters)');
        }

        // Validate country
        if (!countryName) {
            errors.push('Country name is required');
        } else {
            const country = countriesDatabase.dropdownList.find(c => 
                c.name.toLowerCase() === countryName.toLowerCase()
            );
            
            if (!country) {
                errors.push(`Country "${countryName}" is not supported. Please select from the dropdown.`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            parsed: errors.length === 0 ? { city, countryName } : null
        };
    }

    /**
     * Validate country code
     */
    static validateCountryCode(countryCode) {
        if (!countryCode || typeof countryCode !== 'string') {
            return { isValid: false, error: 'Country code is required' };
        }

        const country = countriesDatabase.getCountryByCode(countryCode.toUpperCase());
        
        return {
            isValid: !!country,
            error: country ? null : `Country code "${countryCode}" not supported`,
            country: country
        };
    }

    /**
     * Validate trip dates
     */
    static validateTripDates(startDate, nights) {
        const errors = [];
        
        if (!startDate) {
            errors.push('Start date is required');
            return { isValid: false, errors: errors };
        }

        const start = new Date(startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if date is valid
        if (isNaN(start.getTime())) {
            errors.push('Invalid start date format');
            return { isValid: false, errors: errors };
        }

        // Check if date is not too far in the past
        if (start < today) {
            errors.push('Start date cannot be in the past');
        }

        // Check if date is not too far in the future (2 years)
        const twoYearsFromNow = new Date();
        twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
        
        if (start > twoYearsFromNow) {
            errors.push('Start date cannot be more than 2 years in the future');
        }

        // Validate nights
        if (!nights || typeof nights !== 'number' || nights < 1) {
            errors.push('Number of nights must be at least 1');
        }

        if (nights && nights > 365) {
            errors.push('Trip cannot be longer than 365 nights');
        }

        // Calculate end date
        let endDate = null;
        if (errors.length === 0) {
            endDate = new Date(start);
            endDate.setDate(endDate.getDate() + nights);
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            dates: errors.length === 0 ? {
                startDate: start,
                endDate: endDate,
                nights: nights
            } : null
        };
    }

    /**
     * Validate trip type
     */
    static validateTripType(tripType) {
        const validTypes = [
            'business',
            'leisure', 
            'camping',
            'winter-sports',
            'beach',
            'city-break'
        ];

        const isValid = validTypes.includes(tripType);
        
        return {
            isValid: isValid,
            error: isValid ? null : `Trip type must be one of: ${validTypes.join(', ')}`,
            validTypes: validTypes
        };
    }

    /**
     * Sanitize user input
     */
    static sanitizeInput(input) {
        if (typeof input !== 'string') {
            return '';
        }
        
        return input
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .substring(0, 100); // Limit length
    }

    /**
     * Validate email format (for future contact features)
     */
    static validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return { isValid: false, error: 'Email is required' };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email.trim());
        
        return {
            isValid: isValid,
            error: isValid ? null : 'Invalid email format'
        };
    }

    /**
     * Validate phone number format (basic)
     */
    static validatePhone(phone) {
        if (!phone || typeof phone !== 'string') {
            return { isValid: false, error: 'Phone number is required' };
        }

        // Basic phone validation - digits, spaces, +, -, ()
        const phoneRegex = /^[\d\s\+\-\(\)]+$/;
        const cleaned = phone.trim();
        
        if (cleaned.length < 7 || cleaned.length > 20) {
            return { isValid: false, error: 'Phone number must be 7-20 characters' };
        }

        const isValid = phoneRegex.test(cleaned);
        
        return {
            isValid: isValid,
            error: isValid ? null : 'Invalid phone number format'
        };
    }

    /**
     * Validate coordinates
     */
    static validateCoordinates(lat, lng) {
        const errors = [];
        
        if (typeof lat !== 'number' || isNaN(lat)) {
            errors.push('Latitude must be a number');
        } else if (lat < -90 || lat > 90) {
            errors.push('Latitude must be between -90 and 90');
        }

        if (typeof lng !== 'number' || isNaN(lng)) {
            errors.push('Longitude must be a number');
        } else if (lng < -180 || lng > 180) {
            errors.push('Longitude must be between -180 and 180');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Get user-friendly error messages
     */
    static getUserFriendlyErrors(errors) {
        const friendlyMessages = {
            'Destination city is required': 'Please enter your destination city',
            'Destination country is required': 'Please select your destination country',
            'Start date is required': 'Please choose when your trip starts',
            'Number of nights must be at least 1': 'Your trip must be at least 1 night',
            'Start date cannot be in the past': 'Your trip must start today or in the future',
            'Location must be in format "City, Country"': 'Please enter location as "City, Country" (e.g. "Athens, Greece")'
        };

        return errors.map(error => friendlyMessages[error] || error);
    }

    /**
     * Comprehensive trip validation
     */
    static validateCompleteTrip(tripData) {
        const errors = [];
        
        // Validate basic trip info
        const tripInfoValidation = this.validateTripInfo(tripData.tripInfo || {});
        errors.push(...tripInfoValidation.errors);

        // Validate origin if provided
        if (tripData.tripInfo?.origin?.userInput) {
            const originValidation = this.validateLocationInput(tripData.tripInfo.origin.userInput);
            if (!originValidation.isValid) {
                errors.push(...originValidation.errors.map(e => `Origin: ${e}`));
            }
        }

        // Validate destination
        if (tripData.tripInfo?.destination?.userInput) {
            const destValidation = this.validateLocationInput(tripData.tripInfo.destination.userInput);
            if (!destValidation.isValid) {
                errors.push(...destValidation.errors.map(e => `Destination: ${e}`));
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            friendlyErrors: this.getUserFriendlyErrors(errors)
        };
    }
}