
// utils/storage-manager.js - Enhanced for unified data storage with itinerary support
import { createNewTrip, DataMigration } from '../data/unified-data-model.js';

export class StorageManager {
    constructor() {
        this.CURRENT_TRIP_KEY = 'tripmaster-current-trip';
        this.SAVED_TRIPS_KEY = 'tripmaster-saved-trips';
        this.APP_SETTINGS_KEY = 'tripmaster-settings';
        this.USER_PROFILE_KEY = 'tripmaster-user-profile';
        this.CACHE_KEY = 'tripmaster-cache';
        // NEW: Separate itinerary progress tracking
        this.ITINERARY_PROGRESS_KEY = 'tripmaster-itinerary-progress';
    }

safeStringifyLength(obj) {
    try {
        // Create a deep copy to avoid modifying the original
        const copy = JSON.parse(JSON.stringify(obj));
        return JSON.stringify(copy).length;
    } catch (error) {
        return 0;
    }
}

    // ===== CURRENT TRIP OPERATIONS =====

saveTrip(tripData) {
    try {
        console.log('💾 StorageManager.saveTrip called with:', {
            transportation: tripData.transportation,
            accommodation: tripData.accommodation,
            hasTransportation: !!tripData.transportation,
            hasAccommodation: !!tripData.accommodation
        });
        
        // FIX: Create a clean copy with all data preserved
        const dataToSave = {
            // Spread all existing trip data
            ...tripData,
            transportation: tripData.transportation || [],
            accommodation: tripData.accommodation || [],
            transportation: tripData.transportation || [],
            accommodation: tripData.accommodation || [],
            activities: tripData.activities || [],
            transportationOptions: tripData.transportationOptions || [],
            accommodationOptions: tripData.accommodationOptions || [],
            
            // Ensure itinerary structure exists
            itinerary: {
                days: [],
                progress: {
                    completedStops: [],
                    personalNotes: {},
                    openDays: [],
                    lastVisited: null
                },
                ...(tripData.itinerary || {})
            },
            
            // Update metadata
            meta: {
                ...(tripData.meta || {}),
                version: '2.0',
                lastModified: new Date().toISOString(),
                dataSize: this.safeStringifyLength(tripData),
                hasItinerary: !!(tripData.itinerary && tripData.itinerary.days && tripData.itinerary.days.length > 0),
                hasPacking: !!(tripData.items && Object.keys(tripData.items).length > 0),
                hasTransportation: !!(tripData.transportation && tripData.transportation.length > 0),
                hasAccommodation: !!(tripData.accommodation && tripData.accommodation.length > 0)
            }
        };
        
        console.log('💾 About to save to localStorage:', {
            transportation: dataToSave.transportation,
            accommodation: dataToSave.accommodation,
            transportationLength: dataToSave.transportation?.length,
            accommodationLength: dataToSave.accommodation?.length
        });
        
        // Save to localStorage
        localStorage.setItem(this.CURRENT_TRIP_KEY, JSON.stringify(dataToSave));
        
        // Verify save
        const saved = localStorage.getItem(this.CURRENT_TRIP_KEY);
        const parsed = JSON.parse(saved);
        console.log('✅ Verified save:', {
            transportation: parsed.transportation,
            accommodation: parsed.accommodation
        });
        
        // Also save backup in case of corruption
        this.saveBackup(dataToSave);
        
        return true;
    } catch (error) {
        console.error('Failed to save trip:', error);
        this.handleStorageError(error);
        return false;
    }
}
    
    getCurrentTrip() {
        try {
            const saved = localStorage.getItem(this.CURRENT_TRIP_KEY);
            if (!saved) {
                return null;
            }
            
            const tripData = JSON.parse(saved);
            
            // NEW: Check if migration is needed (Phase 1 to Phase 2)
            if (this.needsPhase2Migration(tripData)) {
                const migratedTrip = this.migrateToPhase2(tripData);
                this.saveTrip(migratedTrip); // Save migrated version
                return migratedTrip;
            }
            
            // Existing migration check
            if (DataMigration.needsMigration(tripData)) {
                const migratedTrip = DataMigration.migrateFromV1(tripData);
                this.saveTrip(migratedTrip);
                return migratedTrip;
            }
            
            return tripData;
        } catch (error) {
            console.error('Failed to load trip:', error);
            // Try to load from backup
            return this.loadFromBackup();
        }
    }

    // NEW: Check if Phase 2 migration is needed
    needsPhase2Migration(tripData) {
        return !tripData.meta || 
               !tripData.meta.version || 
               parseFloat(tripData.meta.version) < 2.0 ||
               !tripData.itinerary;
    }

    // NEW: Migrate Phase 1 data to Phase 2 structure
    migrateToPhase2(oldTripData) {
        const migratedTrip = {
            ...oldTripData,
            // Ensure itinerary structure exists
            itinerary: {
                days: [],
                progress: {
                    completedStops: [],
                    personalNotes: {},
                    openDays: [],
                    lastVisited: null
                },
                ...oldTripData.itinerary
            },
            // Ensure other unified model structures exist
            travelIntelligence: oldTripData.travelIntelligence || {},
            quickReference: oldTripData.quickReference || {},
            meta: {
                ...oldTripData.meta,
                version: '2.0',
                migrationDate: new Date().toISOString(),
                migratedFrom: oldTripData.meta?.version || '1.0'
            }
        };
        
        console.log('Migrated trip data to Phase 2 structure');
        return migratedTrip;
    }

    clearCurrentTrip() {
        try {
            localStorage.removeItem(this.CURRENT_TRIP_KEY);
            // NEW: Also clear itinerary progress
            localStorage.removeItem(this.ITINERARY_PROGRESS_KEY);
            return true;
        } catch (error) {
            console.error('Failed to clear trip:', error);
            return false;
        }
    }

        // ===== USER PROFILE OPERATIONS =====
    
    saveUserProfile(profileData) {
        try {
            const dataToSave = {
                ...profileData,
                lastUpdated: new Date().toISOString()
            };
            
            localStorage.setItem(this.USER_PROFILE_KEY, JSON.stringify(dataToSave));
            return true;
        } catch (error) {
            console.error('Failed to save user profile:', error);
            this.handleStorageError(error);
            return false;
        }
    }

    getUserProfile() {
        try {
            const saved = localStorage.getItem(this.USER_PROFILE_KEY);
            if (!saved) {
                return null;
            }
            
            const profileData = JSON.parse(saved);
            
            // Validate profile structure
            if (!profileData.name && !profileData.homeLocation) {
                console.warn('Invalid profile data found, clearing');
                this.clearUserProfile();
                return null;
            }
            
            return profileData;
        } catch (error) {
            console.error('Failed to load user profile:', error);
            return null;
        }
    }

    clearUserProfile() {
        try {
            localStorage.removeItem(this.USER_PROFILE_KEY);
            return true;
        } catch (error) {
            console.error('Failed to clear user profile:', error);
            return false;
        }
    }

    hasUserProfile() {
        const profile = this.getUserProfile();
        return profile && profile.name && profile.homeLocation?.city;
    }

    // ===== NEW: ITINERARY-SPECIFIC OPERATIONS =====
    
    saveItineraryProgress(progressData) {
        try {
            const dataToSave = {
                ...progressData,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(this.ITINERARY_PROGRESS_KEY, JSON.stringify(dataToSave));
            return true;
        } catch (error) {
            console.error('Failed to save itinerary progress:', error);
            return false;
        }
    }

    getItineraryProgress() {
        try {
            const saved = localStorage.getItem(this.ITINERARY_PROGRESS_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
            return {
                completedStops: [],
                personalNotes: {},
                openDays: [],
                lastVisited: null
            };
        } catch (error) {
            console.error('Failed to load itinerary progress:', error);
            return {
                completedStops: [],
                personalNotes: {},
                openDays: [],
                lastVisited: null
            };
        }
    }

    // NEW: Import itinerary data from JSON file
    importItineraryData(itineraryJson) {
        try {
            const itineraryData = typeof itineraryJson === 'string' ? 
                JSON.parse(itineraryJson) : itineraryJson;
            
            // Validate itinerary structure
            if (!itineraryData.days || !Array.isArray(itineraryData.days)) {
                throw new Error('Invalid itinerary format - missing days array');
            }
            
            // Validate each day has required structure
            for (const day of itineraryData.days) {
                if (!day.date || !day.stops || !Array.isArray(day.stops)) {
                    throw new Error(`Invalid day structure for date: ${day.date || 'unknown'}`);
                }
            }
            
            // Cache imported itinerary for quick access
            this.saveToCache('imported-itinerary', itineraryData, 24 * 60); // Cache for 24 hours
            
            return {
                success: true,
                data: itineraryData,
                stats: {
                    days: itineraryData.days.length,
                    totalStops: itineraryData.days.reduce((sum, day) => sum + day.stops.length, 0),
                    dateRange: {
                        start: itineraryData.days[0]?.date,
                        end: itineraryData.days[itineraryData.days.length - 1]?.date
                    }
                }
            };
        } catch (error) {
            console.error('Failed to import itinerary:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // NEW: Export itinerary data
    exportItinerary(tripData) {
        if (!tripData.itinerary || !tripData.itinerary.days) {
            return null;
        }
        
        const exportData = {
            tripInfo: {
                location: tripData.location,
                startDate: tripData.startDate,
                nights: tripData.nights,
                tripType: tripData.tripType
            },
            itinerary: tripData.itinerary,
            exportMeta: {
                exportDate: new Date().toISOString(),
                appVersion: 'TripMaster v2.0',
                format: 'itinerary-json'
            }
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    // ===== SAVED TRIPS LIBRARY OPERATIONS (Enhanced) =====
    
saveTripToLibrary(tripName, tripData) {
    try {
        console.log('🔍 STORAGE DEBUG: saveTripToLibrary called with:', tripName);
        console.log('🔍 STORAGE DEBUG: Input tripData keys:', Object.keys(tripData));
        
        // Check if input data is serializable BEFORE any processing
        try {
            JSON.stringify(tripData);
            console.log('✅ STORAGE DEBUG: Input tripData is JSON serializable');
        } catch (e) {
            console.error('❌ STORAGE DEBUG: Input tripData has circular reference:', e.message);
            
            // Check each property of input tripData
            for (const [key, value] of Object.entries(tripData)) {
                try {
                    JSON.stringify(value);
                    console.log(`✅ STORAGE DEBUG: tripData.${key} is OK`);
                } catch (e2) {
                    console.error(`❌ STORAGE DEBUG: tripData.${key} has circular reference:`, e2.message);
                }
            }
        }
        
        const savedTrips = this.getSavedTrips();
        console.log('🔍 STORAGE DEBUG: Got saved trips, count:', Object.keys(savedTrips).length);
        
        // Ensure unique trip name
        const uniqueName = this.ensureUniqueTripName(tripName, savedTrips);
        console.log('🔍 STORAGE DEBUG: Unique name:', uniqueName);
        
        // This is where the problem likely occurs - in the tripToSave creation
        console.log('🔍 STORAGE DEBUG: Creating tripToSave object...');
        
        const tripToSave = {
            ...tripData,
            meta: {
                ...tripData.meta,
                savedDate: new Date().toISOString(),
                savedName: uniqueName,
                version: '2.0',
                hasItinerary: !!(tripData.itinerary && tripData.itinerary.days && tripData.itinerary.days.length > 0),
                hasPacking: !!(tripData.items && Object.keys(tripData.items).length > 0),
                // NEW: Trip summary for library display
                summary: {
                    location: tripData.location,
                    nights: tripData.nights,
                    tripType: tripData.tripType,
                    transportation: tripData.transportation,
                    accommodation: tripData.accommodation,
                    totalPackingItems: this.countPackingItems(tripData.items),
                    totalItineraryStops: this.countItineraryStops(tripData.itinerary),
                    completionPercentage: this.calculateTripCompletion(tripData)
                }
            }
        };
        
        console.log('🔍 STORAGE DEBUG: tripToSave created, keys:', Object.keys(tripToSave));
        
        // Check if tripToSave is serializable AFTER creation
        try {
            JSON.stringify(tripToSave);
            console.log('✅ STORAGE DEBUG: tripToSave is JSON serializable');
        } catch (e) {
            console.error('❌ STORAGE DEBUG: tripToSave has circular reference:', e.message);
            
            // Check each property of tripToSave
            for (const [key, value] of Object.entries(tripToSave)) {
                try {
                    JSON.stringify(value);
                    console.log(`✅ STORAGE DEBUG: tripToSave.${key} is OK`);
                } catch (e2) {
                    console.error(`❌ STORAGE DEBUG: tripToSave.${key} has circular reference:`, e2.message);
                    
                    if (key === 'meta' && typeof value === 'object') {
                        console.log('🔍 STORAGE DEBUG: Checking meta properties...');
                        for (const [metaKey, metaValue] of Object.entries(value)) {
                            try {
                                JSON.stringify(metaValue);
                                console.log(`✅ STORAGE DEBUG: meta.${metaKey} is OK`);
                            } catch (e3) {
                                console.error(`❌ STORAGE DEBUG: meta.${metaKey} has circular reference:`, e3.message);
                            }
                        }
                    }
                }
            }
            
            return { success: false, error: 'Circular reference in trip data' };
        }
        
        console.log('🔍 STORAGE DEBUG: Adding to savedTrips...');
        savedTrips[uniqueName] = tripToSave;
        
        console.log('🔍 STORAGE DEBUG: About to stringify savedTrips for localStorage...');
        
        // This is likely where the circular reference error occurs
        try {
            const stringified = JSON.stringify(savedTrips);
            console.log('✅ STORAGE DEBUG: savedTrips stringified successfully');
            
            localStorage.setItem(this.SAVED_TRIPS_KEY, stringified);
            console.log('✅ STORAGE DEBUG: Saved to localStorage successfully');
            
            return { success: true, name: uniqueName };
        } catch (stringifyError) {
            console.error('❌ STORAGE DEBUG: JSON.stringify(savedTrips) failed:', stringifyError.message);
            
            // Check each trip in savedTrips
            for (const [name, trip] of Object.entries(savedTrips)) {
                try {
                    JSON.stringify(trip);
                    console.log(`✅ STORAGE DEBUG: savedTrips["${name}"] is OK`);
                } catch (e) {
                    console.error(`❌ STORAGE DEBUG: savedTrips["${name}"] has circular reference:`, e.message);
                }
            }
            
            return { success: false, error: stringifyError.message };
        }
        
    } catch (error) {
        console.error('❌ STORAGE DEBUG: saveTripToLibrary failed:', error);
        return { success: false, error: error.message };
    }
}
    countPackingItems(items) {
    if (!items) return 0;
    return Object.values(items).reduce((total, categoryItems) => 
        total + Object.keys(categoryItems).length, 0);
}

countItineraryStops(itinerary) {
    if (!itinerary || !itinerary.days) return 0;
    return itinerary.days.reduce((total, day) => total + (day.stops ? day.stops.length : 0), 0);
}

calculateTripCompletion(tripData) {
    let totalItems = 0;
    let completedItems = 0;
    
    if (tripData.items) {
        for (const categoryItems of Object.values(tripData.items)) {
            for (const item of Object.values(categoryItems)) {
                totalItems++;
                if (item.completed) completedItems++;
            }
        }
    }
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
}

 
    getSavedTrips() {
        try {
            const saved = localStorage.getItem(this.SAVED_TRIPS_KEY);
            if (saved) {
                const trips = JSON.parse(saved);
                
                // NEW: Migrate old trips to Phase 2 if needed
                const migratedTrips = {};
                let needsResave = false;
                
                Object.entries(trips).forEach(([name, trip]) => {
                    if (this.needsPhase2Migration(trip)) {
                        migratedTrips[name] = this.migrateToPhase2(trip);
                        needsResave = true;
                    } else if (DataMigration.needsMigration(trip)) {
                        migratedTrips[name] = DataMigration.migrateFromV1(trip);
                        needsResave = true;
                    } else {
                        migratedTrips[name] = trip;
                    }
                });
                
                if (needsResave) {
                    localStorage.setItem(this.SAVED_TRIPS_KEY, JSON.stringify(migratedTrips));
                }
                
                return migratedTrips;
            }
            return {};
        } catch (error) {
            console.error('Failed to load saved trips:', error);
            return {};
        }
    }

    // NEW: Get trip library with enhanced summaries
    getTripLibraryWithSummaries() {
        const savedTrips = this.getSavedTrips();
        const libraryData = [];
        
        Object.entries(savedTrips).forEach(([name, trip]) => {
            const summary = trip.meta?.summary || {
                location: trip.location || 'Unknown',
                nights: trip.nights || 0,
                tripType: trip.tripType || 'leisure',
                transportation: trip.transportation || '',
                accommodation: trip.accommodation || '',
                totalPackingItems: this.countPackingItems(trip.items),
                totalItineraryStops: this.countItineraryStops(trip.itinerary),
                completionPercentage: this.calculateTripCompletion(trip)
            };
            
            libraryData.push({
                name: name,
                savedDate: trip.meta?.savedDate,
                lastModified: trip.meta?.lastModified,
                summary: summary,
                hasItinerary: !!(trip.itinerary && trip.itinerary.days && trip.itinerary.days.length > 0),
                hasPacking: !!(trip.items && Object.keys(trip.items).length > 0)
            });
        });
        
        // Sort by last modified date (most recent first)
        libraryData.sort((a, b) => new Date(b.lastModified || b.savedDate) - new Date(a.lastModified || a.savedDate));
        
        return libraryData;
    }

    deleteSavedTrip(tripName) {
        try {
            const savedTrips = this.getSavedTrips();
            delete savedTrips[tripName];
            localStorage.setItem(this.SAVED_TRIPS_KEY, JSON.stringify(savedTrips));
            return true;
        } catch (error) {
            console.error('Failed to delete saved trip:', error);
            return false;
        }
    }

    // ===== EXPORT/IMPORT OPERATIONS (Enhanced) =====
    
    exportAllData() {
        const currentTrip = this.getCurrentTrip();
        const data = {
            currentTrip: currentTrip,
            savedTrips: this.getSavedTrips(),
            settings: this.getSettings(),
            userProfile: this.getUserProfile(),
            itineraryProgress: currentTrip ? this.getItineraryProgress() : null,
            exportDate: new Date().toISOString(),
            version: '2.0',
            appVersion: 'TripMaster v2.0 (Phase 2)',
            exportStats: {
                totalSavedTrips: Object.keys(this.getSavedTrips()).length,
                currentTripHasItinerary: !!(currentTrip?.itinerary?.days?.length > 0),
                currentTripHasPacking: !!(currentTrip?.items && Object.keys(currentTrip.items).length > 0)
            }
        };
        return JSON.stringify(data, null, 2);
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // NEW: Enhanced validation for Phase 2 data
            if (!data.version) {
                throw new Error('Invalid export format - missing version');
            }
            
            let importResults = {
                currentTrip: false,
                savedTrips: 0,
                itineraryProgress: false,
                userProfile: false,
                errors: []
            };
            
            // Import current trip with Phase 2 migration if needed
            if (data.currentTrip) {
                let tripToImport = data.currentTrip;
                if (this.needsPhase2Migration(tripToImport)) {
                    tripToImport = this.migrateToPhase2(tripToImport);
                }
                
                if (this.saveTrip(tripToImport)) {
                    importResults.currentTrip = true;
                } else {
                    importResults.errors.push('Failed to import current trip');
                }
            }
            
            // NEW: Import itinerary progress
            if (data.itineraryProgress) {
                if (this.saveItineraryProgress(data.itineraryProgress)) {
                    importResults.itineraryProgress = true;
                } else {
                    importResults.errors.push('Failed to import itinerary progress');
                }
            }
              // Import user profile
            if (data.userProfile) {
                if (this.saveUserProfile(data.userProfile)) {
                    importResults.userProfile = true;
                } else {
                    importResults.errors.push('Failed to import user profile');
                }
            }
            
            // Import saved trips with migration
            if (data.savedTrips) {
                Object.entries(data.savedTrips).forEach(([name, trip]) => {
                    let tripToImport = trip;
                    if (this.needsPhase2Migration(tripToImport)) {
                        tripToImport = this.migrateToPhase2(tripToImport);
                    }
                    
                    const result = this.saveTripToLibrary(name, tripToImport);
                    if (result.success) {
                        importResults.savedTrips++;
                    } else {
                        importResults.errors.push(`Failed to import trip: ${name}`);
                    }
                });
            }
            
            // Import settings
            if (data.settings) {
                this.saveSettings(data.settings);
            }
            
            return { success: true, results: importResults };
        } catch (error) {
            console.error('Failed to import data:', error);
            return { success: false, error: error.message };
        }
    }

    // ===== CACHING OPERATIONS (Unchanged) =====
    
    saveToCache(key, data, expiryMinutes = 60) {
        try {
            const cache = this.getCache();
            cache[key] = {
                data: data,
                timestamp: Date.now(),
                expiry: Date.now() + (expiryMinutes * 60 * 1000)
            };
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
            return true;
        } catch (error) {
            console.error('Failed to save to cache:', error);
            return false;
        }
    }

    getFromCache(key) {
        try {
            const cache = this.getCache();
            const item = cache[key];
            
            if (!item) {
                return null;
            }
            
            // Check if expired
            if (Date.now() > item.expiry) {
                delete cache[key];
                localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
                return null;
            }
            
            return item.data;
        } catch (error) {
            console.error('Failed to get from cache:', error);
            return null;
        }
    }

    getCache() {
        try {
            const cache = localStorage.getItem(this.CACHE_KEY);
            return cache ? JSON.parse(cache) : {};
        } catch (error) {
            return {};
        }
    }

    clearCache() {
        try {
            localStorage.removeItem(this.CACHE_KEY);
            return true;
        } catch (error) {
            return false;
        }
    }

    // ===== SETTINGS OPERATIONS (Enhanced) =====
    
    getSettings() {
        try {
            const settings = localStorage.getItem(this.APP_SETTINGS_KEY);
            return settings ? JSON.parse(settings) : this.getDefaultSettings();
        } catch (error) {
            return this.getDefaultSettings();
        }
    }

    saveSettings(settings) {
        try {
            const settingsToSave = {
                ...this.getDefaultSettings(),
                ...settings,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(this.APP_SETTINGS_KEY, JSON.stringify(settingsToSave));
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }

    getDefaultSettings() {
        return {
            theme: 'auto',
            language: 'en',
            notifications: {
                enabled: true,
                weatherAlerts: true,
                packingReminders: true,
                scheduleReminders: true,
                itineraryReminders: true // NEW
            },
            privacy: {
                analytics: false,
                crashReporting: true
            },
            export: {
                format: 'json',
                includePhotos: false,
                includeItinerary: true, // NEW
                includePacking: true    // NEW
            },
            // NEW: Itinerary-specific settings
            itinerary: {
                autoSync: true,
                showMaps: true,
                expandDaysByDefault: false,
                autoMarkCompleted: false
            },
            created: new Date().toISOString()
        };
    }

    // ===== STORAGE INFO & MAINTENANCE (Enhanced) =====
    
    getStorageInfo() {
        let totalSize = 0;
        let breakdown = {};
        
        const keys = [
            this.CURRENT_TRIP_KEY,
            this.SAVED_TRIPS_KEY,
            this.APP_SETTINGS_KEY,
            this.CACHE_KEY,
            this.ITINERARY_PROGRESS_KEY,
            this.USER_PROFILE_KEY // NEW
        ];
        
        keys.forEach(key => {
            const item = localStorage.getItem(key);
            const size = item ? item.length : 0;
            totalSize += size;
            breakdown[key] = {
                sizeBytes: size,
                sizeKB: (size / 1024).toFixed(2)
            };
        });
        
        const savedTrips = this.getSavedTrips();
        const currentTrip = this.getCurrentTrip();
        
        return {
            totalSizeBytes: totalSize,
            totalSizeKB: (totalSize / 1024).toFixed(2),
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
            breakdown: breakdown,
            tripCount: Object.keys(savedTrips).length,
            storageQuotaUsed: ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2) + '%',
            // NEW: Enhanced statistics
            stats: {
                hasCurrentTrip: !!currentTrip,
                currentTripHasItinerary: !!(currentTrip?.itinerary?.days?.length > 0),
                currentTripHasPacking: !!(currentTrip?.items && Object.keys(currentTrip.items).length > 0),
                tripsWithItinerary: Object.values(savedTrips).filter(trip => 
                    trip.itinerary && trip.itinerary.days && trip.itinerary.days.length > 0).length,
                tripsWithPacking: Object.values(savedTrips).filter(trip => 
                    trip.items && Object.keys(trip.items).length > 0).length
            }
        };
    }

    cleanupOldData(daysToKeep = 90) {
        try {
            const savedTrips = this.getSavedTrips();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
            
            let deletedCount = 0;
            
            Object.entries(savedTrips).forEach(([tripName, tripData]) => {
                const savedDate = tripData.meta?.savedDate || tripData.savedDate;
                if (savedDate) {
                    const tripDate = new Date(savedDate);
                    if (tripDate < cutoffDate) {
                        delete savedTrips[tripName];
                        deletedCount++;
                    }
                }
            });
            
            if (deletedCount > 0) {
                localStorage.setItem(this.SAVED_TRIPS_KEY, JSON.stringify(savedTrips));
            }
            
            // Also cleanup expired cache
            this.cleanupExpiredCache();
            
            return deletedCount;
        } catch (error) {
            console.error('Failed to cleanup old data:', error);
            return 0;
        }
    }

    cleanupExpiredCache() {
        try {
            const cache = this.getCache();
            const now = Date.now();
            let cleaned = false;
            
            Object.keys(cache).forEach(key => {
                if (cache[key].expiry < now) {
                    delete cache[key];
                    cleaned = true;
                }
            });
            
            if (cleaned) {
                localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
            }
        } catch (error) {
            console.error('Failed to cleanup cache:', error);
        }
    }

    // ===== BACKUP & RECOVERY (Enhanced) =====
    
    saveBackup(tripData) {
        try {
            const backupKey = this.CURRENT_TRIP_KEY + '_backup';
            localStorage.setItem(backupKey, JSON.stringify({
                ...tripData,
                backupTimestamp: new Date().toISOString()
            }));
        } catch (error) {
            console.warn('Failed to save backup:', error);
        }
    }

    loadFromBackup() {
        try {
            const backupKey = this.CURRENT_TRIP_KEY + '_backup';
            const backup = localStorage.getItem(backupKey);
            if (backup) {
                console.warn('Loading from backup due to corrupted main data');
                const backupData = JSON.parse(backup);
                
                // Migrate backup if needed
                if (this.needsPhase2Migration(backupData)) {
                    return this.migrateToPhase2(backupData);
                }
                
                return backupData;
            }
            return null;
        } catch (error) {
            console.error('Backup also corrupted:', error);
            return null;
        }
    }

    // ===== HELPER FUNCTIONS =====
    
    ensureUniqueTripName(proposedName, existingTrips) {
        let uniqueName = proposedName;
        let counter = 1;
        
        while (existingTrips[uniqueName]) {
            uniqueName = `${proposedName} (${counter})`;
            counter++;
        }
        
        return uniqueName;
    }

    testStorage() {
        try {
            const testKey = 'tripmaster_test';
            const testData = { test: true, timestamp: Date.now() };
            
            localStorage.setItem(testKey, JSON.stringify(testData));
            const retrieved = JSON.parse(localStorage.getItem(testKey));
            localStorage.removeItem(testKey);
            
            return retrieved.test === true;
        } catch (error) {
            console.error('Storage test failed:', error);
            return false;
        }
    }

    getStorageHealth() {
        const health = {
            isWorking: this.testStorage(),
            quotaExceeded: false,
            corruptedData: false,
            backupAvailable: false,
            itineraryProgressAvailable: false // NEW
        };

        try {
            const backupKey = this.CURRENT_TRIP_KEY + '_backup';
            health.backupAvailable = localStorage.getItem(backupKey) !== null;
            health.itineraryProgressAvailable = localStorage.getItem(this.ITINERARY_PROGRESS_KEY) !== null;

            const currentTrip = localStorage.getItem(this.CURRENT_TRIP_KEY);
            if (currentTrip) {
                JSON.parse(currentTrip);
            }
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                health.quotaExceeded = true;
            } else {
                health.corruptedData = true;
            }
        }

        return health;
    }

    emergencyRecovery() {
        try {
            console.warn('Performing emergency recovery...');
            
            const currentTrip = this.getCurrentTrip();
            const savedTrips = this.getSavedTrips();
            
            [
                this.CURRENT_TRIP_KEY,
                this.SAVED_TRIPS_KEY,
                this.APP_SETTINGS_KEY,
                this.CACHE_KEY,
                this.ITINERARY_PROGRESS_KEY // NEW
            ].forEach(key => {
                try {
                    localStorage.removeItem(key);
                } catch (e) {
                    console.warn(`Failed to clear ${key}:`, e);
                }
            });
            
            if (currentTrip) {
                this.saveTrip(currentTrip);
            }
            
            this.saveSettings(this.getDefaultSettings());
            
            return {
                success: true,
                restoredCurrentTrip: !!currentTrip,
                restoredSavedTrips: Object.keys(savedTrips).length
            };
        } catch (error) {
            console.error('Emergency recovery failed:', error);
            return { success: false, error: error.message };
        }
    }

        // NEW: Smart reset methods that handle user profile
    softReset() {
        // Reset trip data but keep profile and settings
        try {
            this.clearCurrentTrip();
            localStorage.removeItem(this.ITINERARY_PROGRESS_KEY);
            return { success: true, preserved: 'profile and settings' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    resetWithProfileChoice(keepProfile = true) {
        try {
            const profile = keepProfile ? this.getUserProfile() : null;
            
            // Clear everything
            [
                this.CURRENT_TRIP_KEY,
                this.SAVED_TRIPS_KEY,
                this.APP_SETTINGS_KEY,
                this.CACHE_KEY,
                this.ITINERARY_PROGRESS_KEY,
                ...(keepProfile ? [] : [this.USER_PROFILE_KEY])
            ].forEach(key => {
                try {
                    localStorage.removeItem(key);
                } catch (e) {
                    console.warn(`Failed to clear ${key}:`, e);
                }
            });
            
            // Restore profile if keeping it
            if (keepProfile && profile) {
                this.saveUserProfile(profile);
            }
            
            // Restore default settings
            this.saveSettings(this.getDefaultSettings());
            
            return { 
                success: true, 
                profileKept: keepProfile,
                profileName: profile?.name || null
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    handleStorageError(error) {
        if (error.name === 'QuotaExceededError') {
            console.warn('Storage quota exceeded - attempting cleanup');
            this.cleanupOldData(30);
            this.clearCache();
        }
    }
}
