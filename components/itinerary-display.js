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
        
        // Store current itinerary data
        this.currentItineraryData = null;
    }

    // ===== MAIN RENDER METHOD =====
    render(itineraryData, tripInfo = null) {
        if (!itineraryData || !itineraryData.days) {
            this.container.innerHTML = '<p>No itinerary data available. Import your itinerary or create a new trip.</p>';
            return;
        }

        // Store itinerary data for use in other methods
        this.currentItineraryData = itineraryData;
        
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
        
        // Set up global reference for onclick handlers
        window.itineraryDisplay = this;
    }

    // ===== PROGRESS TRACKING CORE =====
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

    // ===== PROGRESS CONTROL METHODS =====
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

    getCurrentDayData(dayDate) {
        return this.currentItineraryData?.days?.find(day => day.date === dayDate);
    }

    showNotification(message, type = 'info') {
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

    createDaySummaryCard(day) {
        const summary = day.dailySummary;
        if (!summary) return '';
        
        const highlights = summary.keyHighlights ? summary.keyHighlights.slice(0, 3).join(', ') : '';
        const totalStops = day.stops.length;
        const firstStop = day.stops[0];
        const lastStop = day.stops[day.stops.length - 1];
        const completionStatus = this.getDayCompletionStatus(day);
        
        return `
            <div class="day-summary-card">
                <div class="summary-header">
                    <h3>📊 Day Summary</h3>
                    <div class="day-completion-indicator">
                        <div class="completion-circle ${completionStatus.percentage === 100 ? 'completed' : ''}">
                            ${completionStatus.percentage}%
                        </div>
                    </div>
                    <div class="day-stats">
                        <span class="stat">🚶 ${summary.totalWalkingTime || 'N/A'}</span>
                        <span class="stat">💰 ${summary.totalDiningBudget || 'N/A'}</span>
                        <span class="stat">📍 ${totalStops} stops</span>
                        <span class="stat">✅ ${completionStatus.completed}/${completionStatus.total} done</span>
                    </div>
                </div>
                
                <div class="summary-timeline">
                    <div class="timeline-item">
                        <span class="time">⏰ ${firstStop.scheduledTime || 'Start'}</span>
                        <span class="activity">${firstStop.name}</span>
                    </div>
                    ${highlights ? `<div class="highlights">⭐ ${highlights}</div>` : ''}
                    <div class="timeline-item">
                        <span class="time">🏁 ${lastStop.scheduledTime || 'End'}</span>
                        <span class="activity">${lastStop.name}</span>
                    </div>
                </div>
                
                ${summary.tomorrowPrep ? `
                    <div class="tomorrow-prep">
                        <strong>📋 Tomorrow:</strong> ${summary.tomorrowPrep.slice(0, 2).join(', ')}
                    </div>
                ` : ''}
                
                <div class="day-actions">
                    <button class="day-action-btn" onclick="window.itineraryDisplay.markAllStopsInDay('${day.date}', true)">✅ Mark All Complete</button>
                    <button class="day-action-btn" onclick="window.itineraryDisplay.markAllStopsInDay('${day.date}', false)">❌ Mark All Incomplete</button>
                </div>
            </div>
        `;
    }

    createQuickNavigation(day) {
        const sections = [];
        
        if (day.stops.some(stop => stop.activities && stop.activities.length > 0)) {
            sections.push({name: 'Activities', id: 'activities', icon: '🎯'});
        }
        if (day.stops.some(stop => stop.diningRecommendations && stop.diningRecommendations.length > 0)) {
            sections.push({name: 'Dining', id: 'dining', icon: '🍽️'});
        }
        if (day.stops.some(stop => stop.transportOptions && stop.transportOptions.length > 0)) {
            sections.push({name: 'Transport', id: 'transport', icon: '🚇'});
        }
        if (day.stops.some(stop => stop.photoSpots && stop.photoSpots.length > 0)) {
            sections.push({name: 'Photos', id: 'photos', icon: '📸'});
        }
        if (day.practicalInfo) {
            sections.push({name: 'Practical', id: 'practical', icon: 'ℹ️'});
        }
        
        if (sections.length === 0) return '';
        
        return `
            <div class="quick-navigation">
                <h4>🧭 Quick Jump</h4>
                <div class="nav-buttons">
                    ${sections.map(section => 
                        `<button class="nav-btn" onclick="window.itineraryDisplay.scrollToSection('${section.id}')">${section.icon} ${section.name}</button>`
                    ).join('')}
                </div>
                <button class="back-to-day-btn" onclick="window.itineraryDisplay.scrollToDayHeader('${day.date}')">
                    ⬆️ Back to Day Summary
                </button>
            </div>
        `;
    }

    createTimelineOverview(day) {
        const timelineStops = day.stops.filter(stop => stop.scheduledTime).slice(0, 6);
        if (timelineStops.length === 0) return '';
        
        return `
            <div class="timeline-overview">
                <h4>⏰ Today's Schedule</h4>
                <div class="timeline-strip">
                    ${timelineStops.map(stop => {
                        const stopId = this.generateStopId(stop, day.date);
                        const isCompleted = this.progressData.completedStops.includes(stopId);
                        return `
                            <div class="timeline-point ${isCompleted ? 'completed' : ''}" onclick="window.itineraryDisplay.scrollToStop('${stopId}')">
                                <div class="time-label">${stop.scheduledTime}</div>
                                <div class="activity-label">${stop.name.length > 20 ? stop.name.substring(0, 20) + '...' : stop.name}</div>
                                ${this.getTimeStatus(stop.scheduledTime)}
                                ${isCompleted ? '<div class="timeline-completed">✅</div>' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
                <button class="back-to-day-btn" onclick="window.itineraryDisplay.scrollToDayHeader('${day.date}')">
                    ⬆️ Back to Day Summary
                </button>
            </div>
        `;
    }

    createTimeInfo(stop) {
        if (!stop.scheduledTime && !stop.duration && !stop.walkingTime) return '';
        
        return `
            <div class="time-info">
                ${stop.scheduledTime ? `<span class="scheduled-time">🕐 ${stop.scheduledTime}</span>` : ''}
                ${stop.duration ? `<span class="duration">⏱️ ${stop.duration}</span>` : ''}
                ${stop.walkingTime ? `<span class="walking-time">🚶 ${stop.walkingTime}</span>` : ''}
            </div>
        `;
    }

    createBufferAlert(stop) {
        if (!stop.scheduledTime || !stop.mobileInfo) return '';
        
        const bufferTime = 15;
        const currentTime = new Date();
        const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        
        const startTime = stop.scheduledTime.split('-')[0].trim();
        const [hours, minutes] = startTime.split(':').map(Number);
        const scheduledMinutes = hours * 60 + minutes;
        const leaveTime = scheduledMinutes - bufferTime;
        const leaveHours = Math.floor(leaveTime / 60);
        const leaveMins = leaveTime % 60;
        
        const timeDiff = leaveTime - currentMinutes;
        
        if (timeDiff > 0 && timeDiff < 120) {
            const alertClass = timeDiff <= 15 ? 'urgent' : 'soon';
            return `
                <div class="buffer-alert ${alertClass}">
                    ⏰ Leave by ${leaveHours.toString().padStart(2, '0')}:${leaveMins.toString().padStart(2, '0')} 
                    ${timeDiff <= 15 ? '(Soon!)' : `(in ${Math.floor(timeDiff / 60)}h ${timeDiff % 60}m)`}
                </div>
            `;
        }
        
        return '';
    }

    createActionButtons(stop) {
        const buttons = [];
        
        if (stop.coordinates) {
            const [lat, lng] = stop.coordinates.split(',');
            buttons.push(`<button class="action-btn nav-btn" onclick="window.open('https://www.google.com/maps/search/?api=1&query=${lat},${lng}', '_blank')">🗺️ Navigate</button>`);
        }
        
        if (stop.diningRecommendations) {
            stop.diningRecommendations.forEach(restaurant => {
                if (restaurant.phone) {
                    buttons.push(`<button class="action-btn phone-btn" onclick="window.location.href='tel:${restaurant.phone}'">${restaurant.name} 📞</button>`);
                }
            });
        }
        
        if (stop.hotelInfo && stop.hotelInfo.phone) {
            buttons.push(`<button class="action-btn phone-btn" onclick="window.location.href='tel:${stop.hotelInfo.phone}'">Hotel 📞</button>`);
        }
        
        return buttons.length ? `<div class="action-buttons">${buttons.join('')}</div>` : '';
    }

    getTimeStatus(scheduledTime) {
        if (!scheduledTime) return '';
        
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const startTime = scheduledTime.split('-')[0].trim();
        const [hours, minutes] = startTime.split(':').map(Number);
        const scheduledMinutes = hours * 60 + minutes;
        
        const timeDiff = scheduledMinutes - currentTime;
        
        if (timeDiff < -60) return '<span class="status-complete">✅</span>';
        if (timeDiff < 0) return '<span class="status-current">🔄</span>';
        if (timeDiff < 30) return '<span class="status-soon">⏰</span>';
        return '<span class="status-upcoming">⏳</span>';
    }
// ===== PERSONAL NOTES FUNCTIONALITY =====
    createPersonalNotesSection(stopId) {
        const existingNote = this.progressData.personalNotes[stopId];
        
        return `
            <div class="personal-notes-section">
                <h4>📝 Personal Notes</h4>
                <div class="notes-container">
                    <textarea class="personal-note-input" id="note-${stopId}" 
                              placeholder="Add your personal notes, tips, or reminders for this stop..."
                              onchange="window.itineraryDisplay.savePersonalNote('${stopId}', this.value)">${existingNote ? existingNote.text : ''}</textarea>
                    <div class="notes-actions">
                        <button class="save-note-btn" onclick="window.itineraryDisplay.savePersonalNote('${stopId}', document.getElementById('note-${stopId}').value)">💾 Save Note</button>
                        ${existingNote ? `<button class="delete-note-btn" onclick="window.itineraryDisplay.deletePersonalNote('${stopId}')">🗑️ Delete</button>` : ''}
                    </div>
                    ${existingNote ? `<div class="note-timestamp">Last updated: ${new Date(existingNote.timestamp).toLocaleString()}</div>` : ''}
                </div>
            </div>
        `;
    }

    savePersonalNote(stopId, note) {
        this.progressData.personalNotes[stopId] = {
            text: note,
            timestamp: new Date().toISOString()
        };
        this.saveProgressData();
        this.showNotification('Note saved!', 'success');
    }

    deletePersonalNote(stopId) {
        delete this.progressData.personalNotes[stopId];
        this.saveProgressData();
        this.showNotification('Note deleted!', 'info');
        
        // Re-render the personal notes section
        const noteSection = document.querySelector(`#stop-${stopId} .personal-notes-section`);
        if (noteSection) {
            noteSection.innerHTML = this.createPersonalNotesSection(stopId);
        }
    }

    // ===== MOBILE INFO & TRANSPORT SECTIONS =====
    createMobileInfoSection(mobileInfo) {
        if (!mobileInfo) return '';
        
        return `
            <div class="mobile-info-section">
                <h4>📱 Mobile Info</h4>
                ${mobileInfo.quickTip ? `<div class="quick-tip"><strong>💡 Quick Tip:</strong> ${mobileInfo.quickTip}</div>` : ''}
                ${mobileInfo.essentials ? `
                    <div class="essentials">
                        <strong>✅ Essentials:</strong>
                        <ul>${mobileInfo.essentials.map(item => `<li>${item}</li>`).join('')}</ul>
                    </div>
                ` : ''}
                ${mobileInfo.apps ? `
                    <div class="recommended-apps">
                        <strong>📲 Recommended Apps:</strong>
                        <div class="app-list">${mobileInfo.apps.map(app => `<span class="app-tag">${app}</span>`).join('')}</div>
                    </div>
                ` : ''}
                ${mobileInfo.nearbyServices ? `
                    <div class="nearby-services">
                        <strong>🏪 Nearby Services:</strong>
                        <ul>${mobileInfo.nearbyServices.map(service => `<li>${service}</li>`).join('')}</ul>
                    </div>
                ` : ''}
                <button class="back-to-day-btn" onclick="window.itineraryDisplay.scrollToDayHeader()">
                    ⬆️ Back to Day Overview
                </button>
            </div>
        `;
    }

    createTransportOptionsSection(transportOptions) {
        if (!transportOptions || transportOptions.length === 0) return '';
        
        return `
            <div class="transport-options-section">
                <h4>🚇 Transport Options</h4>
                ${transportOptions.map(option => `
                    <div class="transport-option">
                        <div class="transport-header">
                            <strong>${option.method}</strong>
                            <span class="transport-cost">${option.cost}</span>
                        </div>
                        <div class="transport-details">
                            <span class="duration">Duration: ${option.duration}</span>
                            <span class="frequency">Frequency: ${option.frequency}</span>
                        </div>
                        ${option.mobileNote ? `<div class="mobile-note">📝 ${option.mobileNote}</div>` : ''}
                        ${option.pros ? `<div class="pros">✅ ${option.pros.join(', ')}</div>` : ''}
                        ${option.cons ? `<div class="cons">❌ ${option.cons.join(', ')}</div>` : ''}
                    </div>
                `).join('')}
                <button class="back-to-day-btn" onclick="window.itineraryDisplay.scrollToDayHeader()">
                    ⬆️ Back to Day Overview
                </button>
            </div>
        `;
    }

    // ===== COLLAPSIBLE SECTIONS =====
    createCollapsibleSection(title, content, id) {
        if (!content) return '';
        
        return `
            <div class="collapsible-section">
                <button class="section-header" onclick="window.itineraryDisplay.toggleSection(this)">
                    <span>${title}</span>
                    <span class="toggle-icon">▼</span>
                </button>
                <div class="section-content collapsed" id="${id}">
                    ${content}
                </div>
            </div>
        `;
    }

    toggleSection(button) {
        const content = button.nextElementSibling;
        const icon = button.querySelector('.toggle-icon');
        
        if (content.classList.contains('collapsed')) {
            content.classList.remove('collapsed');
            icon.textContent = '▲';
        } else {
            content.classList.add('collapsed');
            icon.textContent = '▼';
        }
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

    syncActivitiesToPacking(stopId) {
        if (this.onActivitySync) {
            const stopElement = document.getElementById(`stop-${stopId}`);
            const activities = this.extractActivitiesFromStop(stopElement);
            this.onActivitySync(stopId, activities);
            this.showNotification('Activities synced to packing list!', 'success');
        }
    }

    extractActivitiesFromStop(stopElement) {
        const activities = [];
        const activityElements = stopElement.querySelectorAll('.activity-item h5');
        activityElements.forEach(element => {
            activities.push(element.textContent);
        });
        return activities;
    }

    // ===== DINING & CONTENT SECTIONS =====
    createDiningRecommendationsSection(recommendations) {
        if (!recommendations || recommendations.length === 0) return '';
        return `
            <div class="feature-section" id="dining">
                <h4>🍽️ Dining Recommendations</h4>
                ${recommendations.map(recommendation => `
                    <div class="dining-item">
                        <div class="dining-header">
                            <h5>${recommendation.name}</h5>
                            <span class="price-range">${recommendation.priceRange}</span>
                        </div>
                        <div class="dining-details">
                            <p><strong>Cuisine:</strong> ${recommendation.cuisine}</p>
                            <p><strong>Special Dish:</strong> ${recommendation.specialDish}</p>
                            ${recommendation.walkingTime ? `<p><strong>🚶 Walking Time:</strong> ${recommendation.walkingTime}</p>` : ''}
                            ${recommendation.address ? `<p><strong>📍 Address:</strong> ${recommendation.address}</p>` : ''}
                            ${recommendation.phone ? `<p><strong>📞 Phone:</strong> <a href="tel:${recommendation.phone}">${recommendation.phone}</a></p>` : ''}
                            ${recommendation.openingHours ? `<p><strong>🕐 Hours:</strong> ${recommendation.openingHours}</p>` : ''}
                            ${recommendation.mobileNote ? `<div class="mobile-note">📱 ${recommendation.mobileNote}</div>` : ''}
                        </div>
                    </div>
                `).join('')}
                <button class="back-to-day-btn" onclick="window.itineraryDisplay.scrollToDayHeader()">
                    ⬆️ Back to Day Overview
                </button>
            </div>
        `;
    }

    createDetailsSections(stop) {
        let details = '';
        
        if (stop.wikiInfo) details += this.createWikiInfo(stop.wikiInfo);
        if (stop.cuisine) details += this.createFeatureSection('Local Cuisine', stop.cuisine, 'cuisine-item');
        if (stop.photoSpots) details += this.createFeatureSection('Photo Opportunities', stop.photoSpots, 'photo-spot');
        if (stop.timeline) details += this.createTimeline(stop.timeline);
        if (stop.souvenirs) details += this.createFeatureSection('Souvenir Ideas', stop.souvenirs, 'souvenir-item');
        
        if (details) {
            details += `<button class="back-to-day-btn" onclick="window.itineraryDisplay.scrollToDayHeader()">⬆️ Back to Day Overview</button>`;
        }
        
        return details;
    }

    createWikiInfo(wikiInfo) {
        if (!wikiInfo) return '';
        return `
            <div class="wiki-info">
                <h4>📚 ${wikiInfo.title}</h4>
                <p>${wikiInfo.content}</p>
                <a href="${wikiInfo.link}" target="_blank" rel="noopener noreferrer">🔗 Read more on Wikipedia</a>
            </div>
        `;
    }

    createFeatureSection(title, items, itemClass) {
        if (!items || items.length === 0) return '';
        
        const emoji = {
            'Local Cuisine': '🍽️',
            'Photo Opportunities': '📸',
            'Souvenir Ideas': '🎁'
        }[title] || '📝';
        
        return `
            <div class="feature-section">
                <h4>${emoji} ${title}</h4>
                ${items.map(item => `<div class="${itemClass}">${item}</div>`).join('')}
            </div>
        `;
    }

    createTimeline(timeline) {
        if (!timeline || timeline.length === 0) return '';
        return `
            <div class="feature-section">
                <h4>📅 Historical Timeline</h4>
                <div class="timeline">
                    ${timeline.map(item => `<div class="timeline-item">${item}</div>`).join('')}
                </div>
            </div>
        `;
    }

    createDirections(directions) {
        if (!directions) return '';
        return `
            <div class="directions">
                <h4>🗺️ Next Destination</h4>
                <p><strong>To:</strong> ${directions.to}</p>
                <p><strong>Distance:</strong> ${directions.distance}</p>
                <p><strong>Time:</strong> ${directions.time}</p>
                <p><strong>Cost:</strong> ${directions.cost}</p>
                
                ${directions.recommendedTransport ? `<p><strong>Recommended:</strong> ${directions.recommendedTransport}</p>` : ''}
                
                ${directions.publicTransportSteps ? `
                    <div class="public-transport-steps">
                        <strong>🚇 Public Transport Steps:</strong>
                        <ol>${directions.publicTransportSteps.map(step => `<li>${step}</li>`).join('')}</ol>
                    </div>
                ` : ''}
                
                ${directions.walkingDirections ? `<p><strong>🚶 Walking:</strong> ${directions.walkingDirections}</p>` : ''}
                ${directions.walkingRoute ? `<p><strong>🚶 Route:</strong> ${directions.walkingRoute}</p>` : ''}
                
                <div class="navigation-links">
                    ${directions.wazeLink ? `<a href="${directions.wazeLink}" target="_blank" rel="noopener noreferrer" class="waze-link">🚗 Navigate with Waze</a>` : ''}
                    <a href="#" onclick="window.open('https://www.google.com/maps/search/${encodeURIComponent(directions.to)}', '_blank')" class="gmaps-link">🗺️ Google Maps</a>
                </div>
                
                <button class="back-to-day-btn" onclick="window.itineraryDisplay.scrollToDayHeader()">
                    ⬆️ Back to Day Overview
                </button>
            </div>
        `;
    }

    // ===== SUMMARY SECTIONS =====
    createDailySummarySection(summary) {
        if (!summary) return '';
        
        return `
            <div class="daily-summary-section">
                <h4>📊 Full Day Summary</h4>
                <div class="summary-grid">
                    ${summary.totalWalkingTime ? `<div class="summary-item"><strong>🚶 Walking:</strong> ${summary.totalWalkingTime}</div>` : ''}
                    ${summary.totalTransportCost ? `<div class="summary-item"><strong>🚇 Transport:</strong> ${summary.totalTransportCost}</div>` : ''}
                    ${summary.totalDiningBudget ? `<div class="summary-item"><strong>🍽️ Dining:</strong> ${summary.totalDiningBudget}</div>` : ''}
                    ${summary.totalAttractionCosts ? `<div class="summary-item"><strong>🎫 Attractions:</strong> ${summary.totalAttractionCosts}</div>` : ''}
                </div>
                ${summary.keyHighlights ? `
                    <div class="key-highlights">
                        <strong>⭐ Today's Highlights:</strong>
                        <ul>${summary.keyHighlights.map(highlight => `<li>${highlight}</li>`).join('')}</ul>
                    </div>
                ` : ''}
                ${summary.eveningOption ? `<div class="evening-option"><strong>🌙 Evening Option:</strong> ${summary.eveningOption}</div>` : ''}
                <button class="back-to-day-btn" onclick="window.itineraryDisplay.scrollToDayHeader()">
                    ⬆️ Back to Day Overview
                </button>
            </div>
        `;
    }

    createPracticalInfoSection(practicalInfo) {
        if (!practicalInfo) return '';
        return `
            <div class="feature-section practical-info" id="practical">
                <h4>ℹ️ Practical Information</h4>
                
                <div class="emergency-info">
                    <h5>🚨 Emergency Contacts</h5>
                    <p><strong>General Emergency:</strong> <a href="tel:${practicalInfo.emergencyNumber}">${practicalInfo.emergencyNumber}</a></p>
                    ${practicalInfo.policeNumber ? `<p><strong>Police:</strong> <a href="tel:${practicalInfo.policeNumber}">${practicalInfo.policeNumber}</a></p>` : ''}
                    ${practicalInfo.medicalEmergency ? `<p><strong>Medical:</strong> <a href="tel:${practicalInfo.medicalEmergency}">${practicalInfo.medicalEmergency}</a></p>` : ''}
                    <p><strong>Nearby Hospital:</strong> ${practicalInfo.nearbyHospital}</p>
                    ${practicalInfo.nearestPharmacy ? `<p><strong>Nearest Pharmacy:</strong> ${practicalInfo.nearestPharmacy}</p>` : ''}
                </div>
                
                ${practicalInfo.localCustoms ? `
                    <div class="local-customs">
                        <h5>🌍 Local Customs</h5>
                        <ul>${practicalInfo.localCustoms.map(custom => `<li>${custom}</li>`).join('')}</ul>
                    </div>
                ` : ''}
                
                ${practicalInfo.mobileEssentials ? `
                    <div class="mobile-essentials">
                        <h5>📱 Mobile Essentials</h5>
                        <ul>${practicalInfo.mobileEssentials.map(essential => `<li>${essential}</li>`).join('')}</ul>
                    </div>
                ` : ''}
                
                ${practicalInfo.budgetBreakdown ? `
                    <div class="budget-breakdown">
                        <h5>💰 Budget Breakdown</h5>
                        ${Object.entries(practicalInfo.budgetBreakdown).map(([key, value]) => 
                            `<p><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}</p>`
                        ).join('')}
                    </div>
                ` : ''}
                
                <button class="back-to-day-btn" onclick="window.itineraryDisplay.scrollToDayHeader()">
                    ⬆️ Back to Day Overview
                </button>
            </div>
        `;
    }

    createEventsSection(events) {
        if (!events || events.length === 0) return '';
        return `
            <div class="feature-section">
                <h4>🎉 Optional Events</h4>
                ${events.map(event => `
                    <div class="event-item">
                        <h5>${event.name}</h5>
                        <p>${event.description}</p>
                        ${event.venue ? `<p><strong>📍 Venue:</strong> ${event.venue}</p>` : ''}
                        ${event.address ? `<p><strong>Address:</strong> ${event.address}</p>` : ''}
                        ${event.time ? `<p><strong>🕐 Time:</strong> ${event.time}</p>` : ''}
                        ${event.price ? `<p><strong>💰 Price:</strong> ${event.price}</p>` : ''}
                        ${event.mobileNote ? `<div class="mobile-note">📱 ${event.mobileNote}</div>` : ''}
                        ${event.transportFromHotel ? `<p><strong>🚇 From Hotel:</strong> ${event.transportFromHotel}</p>` : ''}
                    </div>
                `).join('')}
                <button class="back-to-day-btn" onclick="window.itineraryDisplay.scrollToDayHeader()">
                    ⬆️ Back to Day Overview
                </button>
            </div>
        `;
    }

    // ===== BULK ACTIONS & NAVIGATION =====
    markAllStopsInDay(dayDate, completed) {
        const dayElement = document.querySelector(`[data-date="${dayDate}"]`);
        if (!dayElement) return;
        
        const checkboxes = dayElement.querySelectorAll('.completion-checkbox');
        const stopIds = Array.from(checkboxes).map(cb => cb.id.replace('checkbox-', ''));
        
        const confirmation = completed ? 
            confirm(`Mark all ${stopIds.length} stops in this day as completed?`) :
            confirm(`Mark all ${stopIds.length} stops in this day as incomplete?`);
            
        if (confirmation) {
            stopIds.forEach(stopId => {
                this.toggleStopComplete(stopId, completed);
            });
            
            this.showNotification(`All stops marked as ${completed ? 'complete' : 'incomplete'}!`, 'success');
        }
    }

    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            element.style.backgroundColor = '#e8f6ff';
            setTimeout(() => {
                element.style.backgroundColor = '';
            }, 1000);
        }
    }

    scrollToStop(stopId) {
        const element = document.getElementById('stop-' + stopId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            element.style.backgroundColor = '#e8f6ff';
            setTimeout(() => {
                element.style.backgroundColor = '';
            }, 1000);
        }
    }

    scrollToDayHeader(dayDate) {
        const dayElement = document.querySelector(`[data-date="${dayDate}"]`);
        if (dayElement) {
            const header = dayElement.querySelector('.day-header');
            header.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // ===== MAPS & VISUAL UPDATES =====
    initializeMap(dayDate) {
        const mapContainer = document.getElementById(`itinerary-map-${dayDate}`);
        
        if (mapContainer && !mapContainer.hasChildNodes() && typeof L !== 'undefined') {
            const dayData = this.getCurrentDayData(dayDate);
            if (!dayData || !dayData.stops) return;
            
            const map = L.map(`itinerary-map-${dayDate}`).setView([37.9755, 23.7348], 12);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            const bounds = L.latLngBounds();
            
            dayData.stops.forEach((stop, index) => {
                if (stop.coordinates) {
                    const [lat, lng] = stop.coordinates.split(',');
                    const stopId = this.generateStopId(stop, dayDate);
                    const isCompleted = this.progressData.completedStops.includes(stopId);
                    
                    const iconColor = isCompleted ? 'green' : '#3498db';
                    const iconHtml = isCompleted ? '✅' : '📍';
                    
                    const customIcon = L.divIcon({
                        html: `<div style="background-color: ${iconColor}; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 12px;">${iconHtml}</div>`,
                        iconSize: [30, 30],
                        className: 'custom-div-icon'
                    });
                    
                    const marker = L.marker([parseFloat(lat), parseFloat(lng)], {icon: customIcon}).addTo(map);
                    
                    const popupContent = `
                        <b>${stop.name}</b><br>
                        ${stop.scheduledTime ? `🕐 ${stop.scheduledTime}<br>` : ''}
                        ${stop.description}<br>
                        <div style="margin-top: 8px;">
                            ${isCompleted ? '✅ <strong>Completed</strong>' : '⭕ <em>Not completed</em>'}
                        </div>
                    `;
                    marker.bindPopup(popupContent);
                    bounds.extend([parseFloat(lat), parseFloat(lng)]);
                }
            });
            
            if (bounds.isValid()) {
                map.fitBounds(bounds, {padding: [10, 10]});
            }
        } else if (mapContainer && typeof L === 'undefined') {
            mapContainer.innerHTML = `
                <div class="map-fallback">
                    <p>📍 Interactive map requires Leaflet.js library</p>
                    <p>Maps will be available once Leaflet loads.</p>
                </div>
            `;
        }
    }

    updateProgressIndicator(itineraryData) {
        const indicator = this.container.querySelector('.itinerary-progress-indicator');
        if (indicator) {
            const totalStops = itineraryData.days.reduce((sum, day) => sum + day.stops.length, 0);
            const completedStops = this.progressData.completedStops.length;
            const percentage = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;
            
            const progressText = indicator.querySelector('.progress-text');
            const progressFill = indicator.querySelector('.progress-fill');
            
            if (progressText) {
                progressText.textContent = `${completedStops}/${totalStops} stops completed (${percentage}%)`;
            }
            if (progressFill) {
                progressFill.style.width = `${percentage}%`;
            }
        }
    }

    updateStopVisualState(stopId, completed) {
        const stopElement = document.getElementById(`stop-${stopId}`);
        if (stopElement) {
            const checkbox = stopElement.querySelector('.completion-checkbox');
            if (checkbox) {
                checkbox.checked = completed;
            }
            
            if (completed) {
                stopElement.classList.add('completed-stop');
            } else {
                stopElement.classList.remove('completed-stop');
            }
        }
        
        // Update day progress
        const dayElement = stopElement?.closest('[data-date]');
        if (dayElement) {
            const dayDate = dayElement.getAttribute('data-date');
            this.updateDayProgress(dayDate);
        }
    }

    updateDayProgress(dayDate) {
        const dayElement = document.querySelector(`[data-date="${dayDate}"]`);
        if (!dayElement) return;
        
        const completionStatus = this.getDayCompletionStatus({ date: dayDate, stops: [] });
        const progressFill = dayElement.querySelector('.mini-progress-fill');
        const progressText = dayElement.querySelector('.mini-progress-text');
        const badge = dayElement.querySelector('.day-completion-badge');
        
        if (progressFill) progressFill.style.width = `${completionStatus.percentage}%`;
        if (progressText) progressText.textContent = `${completionStatus.percentage}%`;
        if (badge) badge.textContent = `${completionStatus.completed}/${completionStatus.total}`;
        
        if (completionStatus.percentage === 100) {
            dayElement.querySelector('.day-header')?.classList.add('day-completed');
        } else {
            dayElement.querySelector('.day-header')?.classList.remove('day-completed');
        }
    }

    restoreExpandedDays() {
        this.progressData.openDays.forEach(dayDate => {
            const dayElement = document.querySelector(`[data-date="${dayDate}"]`);
            if (dayElement) {
                const content = dayElement.querySelector('.day-content');
                const indicator = dayElement.querySelector('.toggle-indicator');
                if (content && indicator) {
                    content.style.display = 'block';
                    indicator.textContent = '▼';
                    setTimeout(() => this.initializeMap(dayDate), 500);
                }
            }
        });
    }

    // ===== EXPORT/IMPORT METHODS =====
    exportItinerary() {
        this.showNotification('Export functionality to be implemented', 'info');
    }

    importItinerary(fileInput) {
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
