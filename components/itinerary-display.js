// components/itinerary-display.js - Interactive itinerary display for TripMaster
export class ItineraryDisplay {
    constructor(options) {
        this.container = options.container;
        this.onStopToggle = options.onStopToggle;
        this.onNoteUpdate = options.onNoteUpdate;
        this.onActivitySync = options.onActivitySync; // NEW: Sync with packing list
        
        // Progress tracking
        this.progressData = this.loadProgressData();
        
        // Map tracking
        this.activeMaps = new Map();
    }

    // ===== MAIN RENDER METHOD =====
    render(itineraryData, tripInfo = null) {
        if (!itineraryData || !itineraryData.days) {
            this.container.innerHTML = '<p>No itinerary data available. Import your itinerary or create a new trip.</p>';
            return;
        }

        this.container.innerHTML = '';
        
        // Add progress indicator
        const progressIndicator = this.createProgressIndicator(itineraryData);
        this.container.appendChild(progressIndicator);
        
        // Add import/export controls
        const controls = this.createItineraryControls();
        this.container.appendChild(controls);

        // Render each day
        itineraryData.days.forEach(day => {
            const dayElement = this.createDayElement(day, tripInfo);
            this.container.appendChild(dayElement);
        });
        
        // Restore expanded days
        this.restoreExpandedDays();
        
        // Update progress display
        this.updateProgressIndicator(itineraryData);
    }

    // ===== PROGRESS TRACKING =====
    loadProgressData() {
        try {
            const saved = localStorage.getItem('tripmaster-itinerary-progress');
            return saved ? JSON.parse(saved) : {
                completedStops: [],
                openDays: [],
                personalNotes: {},
                lastVisited: null
            };
        } catch (error) {
            console.error('Failed to load itinerary progress:', error);
            return { completedStops: [], openDays: [], personalNotes: {}, lastVisited: null };
        }
    }

    saveProgressData() {
        try {
            this.progressData.lastVisited = new Date().toISOString();
            localStorage.setItem('tripmaster-itinerary-progress', JSON.stringify(this.progressData));
        } catch (error) {
            console.error('Failed to save itinerary progress:', error);
        }
    }

    // ===== DAY CREATION =====
    createDayElement(day, tripInfo) {
        const dayElement = document.createElement('div');
        dayElement.className = 'itinerary-day';
        dayElement.setAttribute('data-date', day.date);
        
        const completionStatus = this.getDayCompletionStatus(day);
        const isExpanded = this.progressData.openDays.includes(day.date);
        
        dayElement.innerHTML = `
            <div class="day-header ${completionStatus.percentage === 100 ? 'day-completed' : ''}" 
                 onclick="window.itineraryDisplay.toggleDay('${day.date}')">
                <div class="day-header-content">
                    <div class="day-title">
                        ${new Date(day.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                        <span class="day-completion-badge">${completionStatus.completed}/${completionStatus.total}</span>
                    </div>
                    <div class="day-progress-mini">
                        <div class="mini-progress-bar">
                            <div class="mini-progress-fill" style="width: ${completionStatus.percentage}%"></div>
                        </div>
                        <span class="mini-progress-text">${completionStatus.percentage}%</span>
                    </div>
                </div>
                <span class="toggle-indicator">${isExpanded ? '▼' : '▶'}</span>
            </div>
            <div class="day-content" style="display: ${isExpanded ? 'block' : 'none'}">
                ${this.createDaySummaryCard(day)}
                ${this.createQuickNavigation(day)}
                ${this.createTimelineOverview(day)}
                
                <div class="feature-section">
                    <h4>📍 Today's Route</h4>
                    <div id="itinerary-map-${day.date}" class="map-container"></div>
                    <button class="back-to-day-btn" onclick="window.itineraryDisplay.scrollToDayHeader('${day.date}')">
                        ⬆️ Back to Day Summary
                    </button>
                </div>
                
                <div class="stops-container">
                    ${day.stops.map((stop, index) => this.createStopElement(stop, index, day.stops.length, day.date)).join('')}
                </div>
                
                ${this.createDailySummarySection(day.dailySummary)}
                ${this.createPracticalInfoSection(day.practicalInfo)}
                ${this.createEventsSection(day.events)}
                
                <div class="day-navigation-footer">
                    <button class="back-to-day-btn" onclick="window.itineraryDisplay.scrollToDayHeader('${day.date}')">
                        ⬆️ Back to Day Summary
                    </button>
                    <button class="back-to-top-btn" onclick="window.scrollTo({ top: 0, behavior: 'smooth' })">
                        ⬆️ Back to Top
                    </button>
                </div>
            </div>
        `;
        
        return dayElement;
    }

    // ===== STOP CREATION =====
    createStopElement(stop, index, totalStops, dayDate) {
        const stopId = this.generateStopId(stop, dayDate);
        const isCompleted = this.progressData.completedStops.includes(stopId);
        const isRequired = stop.type === 'Required Event';
        const stopClass = isRequired ? 'required-event' : 'itinerary-stop';
        
        return `
            <div class="${stopClass} ${isCompleted ? 'completed-stop' : ''}" id="stop-${stopId}">
                <div class="stop-completion-header">
                    <div class="completion-controls">
                        <input type="checkbox" 
                               class="completion-checkbox" 
                               id="checkbox-${stopId}" 
                               ${isCompleted ? 'checked' : ''} 
                               onchange="window.itineraryDisplay.toggleStopComplete('${stopId}', this.checked)">
                        <label for="checkbox-${stopId}" class="completion-label">
                            ${isCompleted ? '✅ Completed' : '⭕ Mark Complete'}
                        </label>
                    </div>
                    <div class="stop-progress-indicator">
                        <span class="progress-indicator">${index + 1}/${totalStops}</span>
                        ${isCompleted ? '<span class="completed-badge">✅</span>' : ''}
                    </div>
                </div>
                
                ${isRequired ? '<h3>⭐ REQUIRED EVENT</h3>' : ''}
                
                <div class="stop-header">
                    <div class="stop-main-info">
                        <p class="stop-name">${stop.name}<span class="stop-type">${stop.type}</span></p>
                        ${this.createTimeInfo(stop)}
                        ${this.createBufferAlert(stop)}
                    </div>
                    <div class="stop-actions">
                        ${this.createActionButtons(stop)}
                    </div>
                </div>
                
                <p class="stop-address">📍 ${stop.address}</p>
                <p class="stop-description">${stop.description}</p>
                
                ${this.createPersonalNotesSection(stopId)}
                
                <button class="back-to-day-btn" onclick="window.itineraryDisplay.scrollToDayHeader('${dayDate}')">
                    ⬆️ Back to Day Overview
                </button>
                
                ${this.createMobileInfoSection(stop.mobileInfo)}
                ${this.createTransportOptionsSection(stop.transportOptions)}
                
                <div class="collapsible-sections">
                    ${this.createCollapsibleSection('Activities', this.createActivitiesSection(stop.activities, stopId), 'activities')}
                    ${this.createCollapsibleSection('Dining', this.createDiningRecommendationsSection(stop.diningRecommendations), 'dining')}
                    ${this.createCollapsibleSection('Details', this.createDetailsSections(stop), 'details')}
                </div>
                
                ${this.createDirections(stop.directions)}
                
                <div class="stop-footer">
                    <button class="back-to-day-btn" onclick="window.itineraryDisplay.scrollToDayHeader('${dayDate}')">
                        ⬆️ Back to Day Overview
                    </button>
                    <div class="stop-divider"></div>
                </div>
            </div>
        `;
    }

    // ===== ACTIVITY SYNC WITH PACKING =====
    createActivitiesSection(activities, stopId) {
        if (!activities || activities.length === 0) return '';
        
        return `
            <div class="feature-section" id="activities">
                <h4>🎯 Activities</h4>
                <div class="activity-sync-notice">
                    <button class="sync-packing-btn" onclick="window.itineraryDisplay.syncActivitiesToPacking('${stopId}')">
                        🧳 Add Related Items to Packing List
                    </button>
                </div>
                ${activities.map(activity => `
                    <div class="activity-item">
                        <div class="activity-header">
                            <h5>${activity.name}</h5>
                            <span class="activity-price">${activity.price}</span>
                        </div>
                        <p>${activity.description}</p>
                        <div class="activity-details">
                            <span class="duration">⏱️ Duration: ${activity.duration}</span>
                            ${activity.mobileNote ? `<div class="mobile-note">📱 ${activity.mobileNote}</div>` : ''}
                        </div>
                    </div>
                `).join('')}
                <button class="back-to-day-btn" onclick="window.itineraryDisplay.scrollToDayHeader()">
                    ⬆️ Back to Day Overview
                </button>
            </div>
        `;
    }

    // ===== PROGRESS METHODS =====
    toggleStopComplete(stopId, completed) {
        if (completed) {
            if (!this.progressData.completedStops.includes(stopId)) {
                this.progressData.completedStops.push(stopId);
            }
        } else {
            this.progressData.completedStops = this.progressData.completedStops.filter(id => id !== stopId);
        }
        
        this.saveProgressData();
        this.updateStopVisualState(stopId, completed);
        this.showNotification(completed ? 'Stop marked as complete!' : 'Stop marked as incomplete', 'success');
        
        // Trigger callback to parent app
        if (this.onStopToggle) {
            this.onStopToggle(stopId, completed);
        }
    }

    toggleDay(dayDate) {
        const dayElement = document.querySelector(`[data-date="${dayDate}"]`);
        const content = dayElement.querySelector('.day-content');
        const indicator = dayElement.querySelector('.toggle-indicator');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            indicator.textContent = '▼';
            
            if (!this.progressData.openDays.includes(dayDate)) {
                this.progressData.openDays.push(dayDate);
            }
            
            // Initialize map for this day
            setTimeout(() => this.initializeMap(dayDate), 100);
        } else {
            content.style.display = 'none';
            indicator.textContent = '▶';
            this.progressData.openDays = this.progressData.openDays.filter(date => date !== dayDate);
        }
        
        this.saveProgressData();
    }

    // ===== UTILITY METHODS =====
    generateStopId(stop, dayDate) {
        return `${dayDate}-${stop.name.replace(/[^a-zA-Z0-9]/g, '')}`;
    }

    getDayCompletionStatus(day) {
        const dayStopIds = day.stops.map(stop => this.generateStopId(stop, day.date));
        const completedInDay = dayStopIds.filter(stopId => this.progressData.completedStops.includes(stopId));
        
        return {
            completed: completedInDay.length,
            total: dayStopIds.length,
            percentage: Math.round((completedInDay.length / dayStopIds.length) * 100)
        };
    }

    // ===== INTEGRATION METHODS =====
    syncActivitiesToPacking(stopId) {
        // This will be called by the parent app to sync activities to packing list
        if (this.onActivitySync) {
            const stopElement = document.getElementById(`stop-${stopId}`);
            const activities = this.extractActivitiesFromStop(stopElement);
            this.onActivitySync(stopId, activities);
            this.showNotification('Activities synced to packing list!', 'success');
        }
    }

    extractActivitiesFromStop(stopElement) {
        // Extract activity data for packing sync
        const activities = [];
        const activityElements = stopElement.querySelectorAll('.activity-item h5');
        activityElements.forEach(element => {
            activities.push(element.textContent);
        });
        return activities;
    }

    // ===== UI HELPER METHODS =====
    createProgressIndicator(itineraryData) {
        const totalStops = itineraryData.days.reduce((sum, day) => sum + day.stops.length, 0);
        const completedStops = this.progressData.completedStops.length;
        const percentage = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;
        
        const indicator = document.createElement('div');
        indicator.className = 'itinerary-progress-indicator';
        indicator.innerHTML = `
            <div class="progress-stats">
                <h3>📅 Itinerary Progress</h3>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="progress-text">
                    ${completedStops}/${totalStops} stops completed (${percentage}%)
                </div>
            </div>
        `;
        return indicator;
    }

    createItineraryControls() {
        const controls = document.createElement('div');
        controls.className = 'itinerary-controls';
        controls.innerHTML = `
            <div class="control-buttons">
                <button class="control-btn" onclick="window.itineraryDisplay.exportItinerary()">
                    📤 Export Itinerary
                </button>
                <button class="control-btn" onclick="document.getElementById('itinerary-import').click()">
                    📥 Import Itinerary
                </button>
                <button class="control-btn" onclick="window.itineraryDisplay.resetProgress()">
                    🔄 Reset Progress
                </button>
            </div>
            <input type="file" id="itinerary-import" accept=".json" style="display: none;" 
                   onchange="window.itineraryDisplay.importItinerary(this)">
        `;
        return controls;
    }

    // ===== PLACEHOLDER METHODS (to be implemented) =====
    createDaySummaryCard(day) { return '<div>Day summary card placeholder</div>'; }
    createQuickNavigation(day) { return '<div>Quick navigation placeholder</div>'; }
    createTimelineOverview(day) { return '<div>Timeline overview placeholder</div>'; }
    createTimeInfo(stop) { return '<div>Time info placeholder</div>'; }
    createBufferAlert(stop) { return ''; }
    createActionButtons(stop) { return '<div>Action buttons placeholder</div>'; }
    createPersonalNotesSection(stopId) { return '<div>Personal notes placeholder</div>'; }
    createMobileInfoSection(mobileInfo) { return '<div>Mobile info placeholder</div>'; }
    createTransportOptionsSection(transportOptions) { return '<div>Transport options placeholder</div>'; }
    createCollapsibleSection(title, content, id) { return '<div>Collapsible section placeholder</div>'; }
    createDiningRecommendationsSection(recommendations) { return '<div>Dining recommendations placeholder</div>'; }
    createDetailsSections(stop) { return '<div>Details sections placeholder</div>'; }
    createDirections(directions) { return '<div>Directions placeholder</div>'; }
    createDailySummarySection(summary) { return '<div>Daily summary placeholder</div>'; }
    createPracticalInfoSection(practicalInfo) { return '<div>Practical info placeholder</div>'; }
    createEventsSection(events) { return '<div>Events placeholder</div>'; }

    initializeMap(dayDate) {
        console.log('Map initialization for', dayDate);
        // Map initialization will be implemented
    }

    updateProgressIndicator(itineraryData) {
        // Update progress display
        const indicator = this.container.querySelector('.itinerary-progress-indicator');
        if (indicator) {
            // Refresh progress display
        }
    }

    updateStopVisualState(stopId, completed) {
        const stopElement = document.getElementById(`stop-${stopId}`);
        if (stopElement) {
            if (completed) {
                stopElement.classList.add('completed-stop');
            } else {
                stopElement.classList.remove('completed-stop');
            }
        }
    }

    restoreExpandedDays() {
        this.progressData.openDays.forEach(dayDate => {
            const dayElement = document.querySelector(`[data-date="${dayDate}"]`);
            if (dayElement) {
                const content = dayElement.querySelector('.day-content');
                const indicator = dayElement.querySelector('.toggle-indicator');
                content.style.display = 'block';
                indicator.textContent = '▼';
                setTimeout(() => this.initializeMap(dayDate), 500);
            }
        });
    }

    scrollToDayHeader(dayDate) {
        const dayElement = document.querySelector(`[data-date="${dayDate}"]`);
        if (dayElement) {
            const header = dayElement.querySelector('.day-header');
            header.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 12px 20px;
            background: ${type === 'success' ? '#27ae60' : '#3498db'};
            color: white; border-radius: 6px; z-index: 1000;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // ===== EXPORT/IMPORT METHODS =====
    exportItinerary() {
        // Export functionality
        this.showNotification('Export functionality to be implemented', 'info');
    }

    importItinerary(fileInput) {
        // Import functionality
        this.showNotification('Import functionality to be implemented', 'info');
    }

    resetProgress() {
        if (confirm('Reset all itinerary progress? This cannot be undone.')) {
            this.progressData = { completedStops: [], openDays: [], personalNotes: {}, lastVisited: null };
            this.saveProgressData();
            location.reload();
        }
    }
}
