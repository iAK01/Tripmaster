// utils/storage-manager.js - Enhanced for unified data storage
import { createNewTrip, DataMigration } from '../data/unified-data-model.js';

export class StorageManager {
    constructor() {
        this.CURRENT_TRIP_KEY = 'tripmaster-current-trip';
        this.SAVED_TRIPS_KEY = 'tripmaster-saved-trips';
        this.APP_SETTINGS_KEY = 'tripmaster-settings';
        this.CACHE_KEY = 'tripmaster-cache';
    }

    // ===== CURRENT TRIP OPERATIONS =====
    
    saveTrip(tripData) {
        try {
            // Ensure data has proper structure
            const dataToSave = {
                ...tripData,
                meta: {
                    ...tripData.meta,
                    version: '1.0',
                    lastModified: new Date().toISOString(),
                    dataSize: JSON.stringify(tripData).length
                }
            };
            
            localStorage.setItem(this.CURRENT_TRIP_KEY, JSON.stringify(dataToSave));
            
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
            
            // Check if migration is needed
            if (DataMigration.needsMigration(tripData)) {
                const migratedTrip = DataMigration.migrateFromV1(tripData);
                this.saveTrip(migratedTrip); // Save migrated version
                return migratedTrip;
            }
            
            return tripData;
        } catch (error) {
            console.error('Failed to load trip:', error);
            // Try to load from backup
            return this.loadFromBackup();
        }
    }

    clearCurrentTrip() {
        try {
            localStorage.removeItem(this.CURRENT_TRIP_KEY);
            return true;
        } catch (error) {
            console.error('Failed to clear trip:', error);
            return false;
        }
    }

    // ===== SAVED TRIPS LIBRARY OPERATIONS =====
    
    saveTripToLibrary(tripName, tripData) {
        try {
            const savedTrips = this.getSavedTrips();
            
            // Ensure unique trip name
            const uniqueName = this.ensureUniqueTripName(tripName, savedTrips);
            
            savedTrips[uniqueName] = {
                ...tripData,
                meta: {
                    ...tripData.meta,
                    savedDate: new Date().toISOString(),
                    savedName: uniqueName
                }
            };
            
            localStorage.setItem(this.SAVED_TRIPS_KEY, JSON.stringify(savedTrips));
            return { success: true, name: uniqueName };
        } catch (error) {
            console.error('Failed to save to library:', error);
            return { success: false, error: error.message };
        }
    }

    getSavedTrips() {
        try {
            const saved = localStorage.getItem(this.SAVED_TRIPS_KEY);
            if (saved) {
                const trips = JSON.parse(saved);
                
                // Migrate old trips if needed
                const migratedTrips = {};
                let needsResave = false;
                
                Object.entries(trips).forEach(([name, trip]) => {
                    if (DataMigration.needsMigration(trip)) {
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

    // ===== CACHING OPERATIONS =====
    
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

    // ===== EXPORT/IMPORT OPERATIONS =====
    
    exportAllData() {
        const data = {
            currentTrip: this.getCurrentTrip(),
            savedTrips: this.getSavedTrips(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString(),
            version: '1.0',
            appVersion: 'TripMaster v1.0'
        };
        return JSON.stringify(data, null, 2);
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Validate data structure
            if (!data.version || !data.exportDate) {
                throw new Error('Invalid export format - missing version or date');
            }
            
            let importResults = {
                currentTrip: false,
                savedTrips: 0,
                errors: []
            };
            
            // Import current trip
            if (data.currentTrip) {
                if (this.saveTrip(data.currentTrip)) {
                    importResults.currentTrip = true;
                } else {
                    importResults.errors.push('Failed to import current trip');
                }
            }
            
            // Import saved trips
            if (data.savedTrips) {
                Object.entries(data.savedTrips).forEach(([name, trip]) => {
                    const result = this.saveTripToLibrary(name, trip);
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

    // ===== SETTINGS OPERATIONS =====
    
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
                scheduleReminders: true
            },
            privacy: {
                analytics: false,
                crashReporting: true
            },
            export: {
                format: 'json',
                includePhotos: false
            },
            created: new Date().toISOString()
        };
    }

    // ===== STORAGE INFO & MAINTENANCE =====
    
    getStorageInfo() {
        let totalSize = 0;
        let breakdown = {};
        
        const keys = [
            this.CURRENT_TRIP_KEY,
            this.SAVED_TRIPS_KEY,
            this.APP_SETTINGS_KEY,
            this.CACHE_KEY
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
        
        return {
            totalSizeBytes: totalSize,
            totalSizeKB: (totalSize / 1024).toFixed(2),
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
            breakdown: breakdown,
            tripCount: Object.keys(savedTrips).length,
            storageQuotaUsed: ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2) + '%'
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

    // ===== BACKUP & RECOVERY =====
    
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
                return JSON.parse(backup);
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
            backupAvailable: false
        };

        try {
            const backupKey = this.CURRENT_TRIP_KEY + '_backup';
            health.backupAvailable = localStorage.getItem(backupKey) !== null;

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
                this.CACHE_KEY
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

    handleStorageError(error) {
        if (error.name === 'QuotaExceededError') {
            console.warn('Storage quota exceeded - attempting cleanup');
            this.cleanupOldData(30);
            this.clearCache();
        }
    }
}