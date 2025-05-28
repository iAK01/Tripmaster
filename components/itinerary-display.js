// components/itinerary-display.js - Refactored with Better UX & Accordions
export class ItineraryDisplay {
    constructor(options) {
        this.container = options.container;
        this.onStopToggle = options.onStopToggle;
        this.onNoteUpdate = options.onNoteUpdate;
        this.onActivitySync = options.onActivitySync;
        
        // Enhanced state management
        this.state = {
            currentItineraryData: null,
            expandedDays: new Set(),
            expandedSections: new Map(), // Track which accordion sections are open per stop
            filters: {
                showCompleted: true,
                showIncomplete: true,
                showRequired: true
            },
            viewMode: 'timeline' // timeline, compact, detailed
        };
        
        // Progress tracking with enhanced features
        this.progressData = this.loadProgressData();
        
        // Map tracking for interactive maps
        this.activeMaps = new Map();
        
        // Animation and interaction helpers
        this.animationQueue = [];
        this.isAnimating = false;
        
        // Initialize the component
        this.init();
    }

    // ===== ENHANCED INITIALIZATION =====
    init() {
        this.bindGlobalEvents();
        this.setupKeyboardShortcuts();
        this.loadUserPreferences();
        console.log('✅ ItineraryDisplay initialized with enhanced UX');
    }

    bindGlobalEvents() {
        // Global click handler for accordion management
        document.addEventListener('click', (e) => {
            if (e.target.closest('.accordion-header')) {
                this.handleAccordionClick(e);
            }
            if (e.target.closest('.quick-action-btn')) {
                this.handleQuickAction(e);
            }
        });
        
        // Global change handler for checkboxes and inputs
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('completion-checkbox')) {
                this.handleStopToggle(e);
            }
            if (e.target.classList.contains('filter-checkbox')) {
                this.handleFilterChange(e);
            }
        });
        
        // Global input handler for notes
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('personal-note-input')) {
                this.handleNoteInput(e);
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.itinerary-display-section')) {
                switch(e.key) {
                    case 'c':
                        if (e.ctrlKey || e.metaKey) {
                            e.preventDefault();
                            this.toggleCompactView();
                        }
                        break;
                    case 'f':
                        if (e.ctrlKey || e.metaKey) {
                            e.preventDefault();
                            this.focusFilterInput();
                        }
                        break;
                    case 'Escape':
                        this.closeAllModals();
                        break;
                }
            }
        });
    }

    loadUserPreferences() {
        try {
            const prefs = localStorage.getItem('tripmaster-itinerary-preferences');
            if (prefs) {
                const preferences = JSON.parse(prefs);
                this.state.viewMode = preferences.viewMode || 'timeline';
                this.state.filters = { ...this.state.filters, ...preferences.filters };
                this.state.expandedSections = new Map(preferences.expandedSections || []);
            }
        } catch (error) {
            console.warn('Failed to load user preferences:', error);
        }
    }

    saveUserPreferences() {
        try {
            const preferences = {
                viewMode: this.state.viewMode,
                filters: this.state.filters,
                expandedSections: Array.from(this.state.expandedSections.entries())
            };
            localStorage.setItem('tripmaster-itinerary-preferences', JSON.stringify(preferences));
        } catch (error) {
            console.warn('Failed to save user preferences:', error);
        }
    }

    // ===== ENHANCED PROGRESS TRACKING =====
    loadProgressData() {
        try {
            const saved = localStorage.getItem('tripmaster-itinerary-progress');
            const defaultData = {
                completedStops: [],
                openDays: [],
                personalNotes: {},
                lastVisited: null,
                streaks: {
                    current: 0,
                    longest: 0,
                    lastCompletionDate: null
                },
                achievements: [],
                timeSpent: 0,
                sessionStart: Date.now()
            };
            
            if (!saved) return defaultData;
            
            const data = JSON.parse(saved);
            // Merge with default structure for backward compatibility
            return { ...defaultData, ...data };
            
        } catch (error) {
            console.error('Failed to load itinerary progress:', error);
            return {
                completedStops: [],
                openDays: [],
                personalNotes: {},
                lastVisited: null,
                streaks: { current: 0, longest: 0, lastCompletionDate: null },
                achievements: [],
                timeSpent: 0,
                sessionStart: Date.now()
            };
        }
    }

    saveProgressData() {
        try {
            // Update session time
            const now = Date.now();
            const sessionTime = now - this.progressData.sessionStart;
            this.progressData.timeSpent += sessionTime;
            this.progressData.sessionStart = now;
            this.progressData.lastVisited = new Date().toISOString();
            
            localStorage.setItem('tripmaster-itinerary-progress', JSON.stringify(this.progressData));
        } catch (error) {
            console.error('Failed to save itinerary progress:', error);
        }
    }

    // ===== ACHIEVEMENT SYSTEM =====
    checkAchievements(stopId, completed) {
        if (!completed) return;
        
        const totalCompleted = this.progressData.completedStops.length;
        const achievements = [];
        
        // First completion
        if (totalCompleted === 1 && !this.progressData.achievements.includes('first_stop')) {
            achievements.push({
                id: 'first_stop',
                title: '🎯 First Step',
                description: 'Completed your first itinerary stop!',
                icon: '🎯'
            });
        }
        
        // Milestone achievements
        const milestones = [5, 10, 25, 50, 100];
        milestones.forEach(milestone => {
            if (totalCompleted === milestone && !this.progressData.achievements.includes(`milestone_${milestone}`)) {
                achievements.push({
                    id: `milestone_${milestone}`,
                    title: `🏆 ${milestone} Stops`,
                    description: `Completed ${milestone} itinerary stops!`,
                    icon: '🏆'
                });
            }
        });
        
        // Streak achievements
        this.updateStreak();
        if (this.progressData.streaks.current === 5 && !this.progressData.achievements.includes('streak_5')) {
            achievements.push({
                id: 'streak_5',
                title: '🔥 On Fire',
                description: 'Completed 5 stops in a row!',
                icon: '🔥'
            });
        }
        
        // Save new achievements
        achievements.forEach(achievement => {
            if (!this.progressData.achievements.includes(achievement.id)) {
                this.progressData.achievements.push(achievement.id);
                this.showAchievement(achievement);
            }
        });
        
        this.saveProgressData();
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastCompletion = this.progressData.streaks.lastCompletionDate;
        
        if (lastCompletion === today) {
            // Already completed something today, maintain streak
            return;
        } else if (lastCompletion === new Date(Date.now() - 86400000).toDateString()) {
            // Completed yesterday, continue streak
            this.progressData.streaks.current++;
        } else {
            // Streak broken, start new one
            this.progressData.streaks.current = 1;
        }
        
        this.progressData.streaks.lastCompletionDate = today;
        
        // Update longest streak
        if (this.progressData.streaks.current > this.progressData.streaks.longest) {
            this.progressData.streaks.longest = this.progressData.streaks.current;
        }
    }

    showAchievement(achievement) {
        const achievementEl = document.createElement('div');
        achievementEl.className = 'achievement-notification';
        achievementEl.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-text">
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(achievementEl);
        
        // Animate in
        requestAnimationFrame(() => {
            achievementEl.classList.add('show');
        });
        
        // Remove after delay
        setTimeout(() => {
            achievementEl.classList.add('hide');
            setTimeout(() => {
                if (achievementEl.parentNode) {
                    achievementEl.parentNode.removeChild(achievementEl);
                }
            }, 300);
        }, 4000);
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
            percentage: dayStopIds.length > 0 ? Math.round((completedInDay.length / dayStopIds.length) * 100) : 0
        };
    }

    getCurrentDayData(dayDate) {
        return this.state.currentItineraryData?.days?.find(day => day.date === dayDate);
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `itinerary-notification ${type}`;
        
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
        
        // Auto-remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }

    // ===== ANIMATION HELPERS =====
    async animateElement(element, animation, duration = 300) {
        return new Promise(resolve => {
            element.style.transition = `all ${duration}ms ease`;
            element.classList.add(animation);
            
            setTimeout(() => {
                element.classList.remove(animation);
                element.style.transition = '';
                resolve();
            }, duration);
        });
    }

    smoothScrollTo(element, offset = 0) {
        const elementTop = element.offsetTop - offset;
        window.scrollTo({
            top: elementTop,
            behavior: 'smooth'
        });
        
        // Highlight element briefly
        element.style.backgroundColor = '#e8f6ff';
        setTimeout(() => {
            element.style.backgroundColor = '';
        }, 1000);
    }
}
// ===== MAIN RENDER METHOD WITH ENHANCED UX =====
    render(itineraryData, tripInfo = null) {
        if (!itineraryData || !itineraryData.days) {
            this.renderEmptyState();
            return;
        }

        this.state.currentItineraryData = itineraryData;
        this.container.innerHTML = '';
        
        // Create main container with better structure
        const mainContainer = document.createElement('div');
        mainContainer.className = 'itinerary-main-container';
        
        // Add enhanced header with controls
        mainContainer.appendChild(this.createEnhancedHeader(itineraryData));
        
        // Add filter and view controls
        mainContainer.appendChild(this.createControlPanel(itineraryData));
        
        // Add progress overview
        mainContainer.appendChild(this.createProgressOverview(itineraryData));
        
        // Create days container with improved layout
        const daysContainer = document.createElement('div');
        daysContainer.className = `days-container view-${this.state.viewMode}`;
        
        // Render each day with enhanced accordions
        itineraryData.days.forEach((day, index) => {
            const dayElement = this.createEnhancedDayElement(day, index, tripInfo);
            daysContainer.appendChild(dayElement);
        });
        
        mainContainer.appendChild(daysContainer);
        this.container.appendChild(mainContainer);
        
        // Restore user state
        this.restoreExpandedDays();
        this.applyFilters();
        
        // Set up global reference for enhanced interactions
        window.itineraryDisplay = this;
        
        console.log('✅ Itinerary rendered with enhanced UX');
    }

    renderEmptyState() {
        this.container.innerHTML = `
            <div class="itinerary-empty-state">
                <div class="empty-state-content">
                    <div class="empty-state-icon">📅</div>
                    <h3>No Itinerary Yet</h3>
                    <p>Import your itinerary JSON file to see your detailed day-by-day schedule.</p>
                    <div class="empty-state-actions">
                        <button class="btn btn-primary" onclick="document.getElementById('itinerary-file-import')?.click()">
                            📥 Import Itinerary
                        </button>
                        <button class="btn btn-secondary" onclick="window.loadSampleItinerary?.()">
                            🧪 Try Sample Itinerary
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== ENHANCED HEADER WITH BETTER CONTROLS =====
    createEnhancedHeader(itineraryData) {
        const totalStops = itineraryData.days.reduce((sum, day) => sum + day.stops.length, 0);
        const completedStops = this.progressData.completedStops.length;
        const percentage = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;
        
        const header = document.createElement('div');
        header.className = 'itinerary-enhanced-header';
        header.innerHTML = `
            <div class="header-main">
                <div class="header-title">
                    <h2>📅 Your Itinerary</h2>
                    <div class="header-stats">
                        <span class="stat-chip">${itineraryData.days.length} days</span>
                        <span class="stat-chip">${totalStops} stops</span>
                        <span class="stat-chip ${percentage === 100 ? 'completed' : ''}">${percentage}% complete</span>
                    </div>
                </div>
                
                <div class="header-actions">
                    <div class="view-mode-toggle">
                        <button class="view-btn ${this.state.viewMode === 'timeline' ? 'active' : ''}" 
                                data-view="timeline" title="Timeline View">
                            📊
                        </button>
                        <button class="view-btn ${this.state.viewMode === 'compact' ? 'active' : ''}" 
                                data-view="compact" title="Compact View">
                            📋
                        </button>
                        <button class="view-btn ${this.state.viewMode === 'detailed' ? 'active' : ''}" 
                                data-view="detailed" title="Detailed View">
                            📖
                        </button>
                    </div>
                    
                    <div class="quick-actions">
                        <button class="quick-action-btn" data-action="expand-all" title="Expand All Days">
                            📂
                        </button>
                        <button class="quick-action-btn" data-action="collapse-all" title="Collapse All Days">
                            📁
                        </button>
                        <button class="quick-action-btn" data-action="mark-all" title="Mark All Complete">
                            ✅
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="header-progress">
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${percentage}%"></div>
                    <div class="progress-text">${completedStops}/${totalStops} stops completed</div>
                </div>
                ${this.progressData.streaks.current > 0 ? `
                    <div class="streak-indicator">
                        🔥 ${this.progressData.streaks.current} day streak
                    </div>
                ` : ''}
            </div>
        `;
        
        // Bind view mode toggle events
        header.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const viewMode = btn.dataset.view;
                this.changeViewMode(viewMode);
            });
        });
        
        return header;
    }

    // ===== ENHANCED CONTROL PANEL =====
    createControlPanel(itineraryData) {
        const panel = document.createElement('div');
        panel.className = 'itinerary-control-panel';
        panel.innerHTML = `
            <div class="control-section filters">
                <div class="filter-group">
                    <label class="filter-label">
                        <input type="checkbox" class="filter-checkbox" data-filter="completed" 
                               ${this.state.filters.showCompleted ? 'checked' : ''}>
                        <span class="filter-text">Show Completed</span>
                    </label>
                    <label class="filter-label">
                        <input type="checkbox" class="filter-checkbox" data-filter="incomplete" 
                               ${this.state.filters.showIncomplete ? 'checked' : ''}>
                        <span class="filter-text">Show Incomplete</span>
                    </label>
                    <label class="filter-label">
                        <input type="checkbox" class="filter-checkbox" data-filter="required" 
                               ${this.state.filters.showRequired ? 'checked' : ''}>
                        <span class="filter-text">Required Only</span>
                    </label>
                </div>
            </div>
            
            <div class="control-section actions">
                <button class="control-btn" data-action="export">
                    📤 Export Progress
                </button>
                <button class="control-btn" data-action="reset">
                    🔄 Reset Progress
                </button>
                <button class="control-btn" data-action="print">
                    🖨️ Print Itinerary
                </button>
            </div>
        `;
        
        return panel;
    }

    // ===== PROGRESS OVERVIEW WITH ACHIEVEMENTS =====
    createProgressOverview(itineraryData) {
        const overview = document.createElement('div');
        overview.className = 'progress-overview';
        
        const dayStats = itineraryData.days.map(day => ({
            date: day.date,
            ...this.getDayCompletionStatus(day)
        }));
        
        overview.innerHTML = `
            <div class="overview-section">
                <h3>📊 Progress Overview</h3>
                <div class="day-progress-grid">
                    ${dayStats.map(day => `
                        <div class="day-progress-card ${day.percentage === 100 ? 'completed' : ''}" 
                             data-date="${day.date}">
                            <div class="day-date">${new Date(day.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                            })}</div>
                            <div class="day-progress-circle">
                                <div class="progress-circle-fill" style="--progress: ${day.percentage}%">
                                    ${day.percentage}%
                                </div>
                            </div>
                            <div class="day-stops">${day.completed}/${day.total}</div>
                        </div>
                    `).join('')}
                </div>
                
                ${this.progressData.achievements.length > 0 ? `
                    <div class="achievements-showcase">
                        <h4>🏆 Achievements</h4>
                        <div class="achievement-badges">
                            ${this.progressData.achievements.slice(-3).map(achievementId => {
                                const achievement = this.getAchievementInfo(achievementId);
                                return `<div class="achievement-badge" title="${achievement.description}">
                                    ${achievement.icon}
                                </div>`;
                            }).join('')}
                            ${this.progressData.achievements.length > 3 ? `
                                <div class="achievement-more">+${this.progressData.achievements.length - 3}</div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        return overview;
    }

    // ===== ENHANCED DAY ELEMENT WITH BETTER ACCORDIONS =====
    createEnhancedDayElement(day, index, tripInfo) {
        const dayElement = document.createElement('div');
        dayElement.className = 'enhanced-day-accordion';
        dayElement.setAttribute('data-date', day.date);
        
        const completionStatus = this.getDayCompletionStatus(day);
        const isExpanded = this.state.expandedDays.has(day.date);
        const dayName = new Date(day.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        dayElement.innerHTML = `
            <div class="day-accordion-header ${completionStatus.percentage === 100 ? 'completed' : ''}" 
                 data-accordion="day-${day.date}">
                <div class="header-content">
                    <div class="day-info">
                        <div class="day-title">${dayName}</div>
                        <div class="day-subtitle">
                            ${day.stops.length} stops • ${completionStatus.completed}/${completionStatus.total} completed
                        </div>
                    </div>
                    
                    <div class="day-status">
                        <div class="completion-badge ${completionStatus.percentage === 100 ? 'completed' : ''}">
                            ${completionStatus.percentage}%
                        </div>
                        <div class="expand-indicator ${isExpanded ? 'expanded' : ''}">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path d="M7 10l5 5 5-5z" fill="currentColor"/>
                            </svg>
                        </div>
                    </div>
                </div>
                
                <div class="day-quick-actions">
                    <button class="day-action-btn" data-action="mark-day" data-date="${day.date}" 
                            title="Toggle All Stops">
                        ${completionStatus.percentage === 100 ? '❌' : '✅'}
                    </button>
                    <button class="day-action-btn" data-action="navigate-day" data-date="${day.date}" 
                            title="Navigate Today">
                        🗺️
                    </button>
                </div>
            </div>
            
            <div class="day-accordion-content ${isExpanded ? 'expanded' : ''}" id="day-content-${day.date}">
                <div class="day-content-wrapper">
                    ${this.createDayOverview(day)}
                    ${this.createStopsAccordion(day)}
                    ${this.createDayExtras(day)}
                </div>
            </div>
        `;
        
        return dayElement;
    }

    // ===== DAY OVERVIEW WITH BETTER LAYOUT =====
    createDayOverview(day) {
        const summary = day.dailySummary;
        if (!summary) return '';
        
        return `
            <div class="day-overview-section">
                <div class="overview-grid">
                    <div class="overview-card">
                        <div class="card-icon">🚶</div>
                        <div class="card-content">
                            <div class="card-label">Walking</div>
                            <div class="card-value">${summary.totalWalkingTime || 'N/A'}</div>
                        </div>
                    </div>
                    
                    <div class="overview-card">
                        <div class="card-icon">💰</div>
                        <div class="card-content">
                            <div class="card-label">Budget</div>
                            <div class="card-value">${summary.totalDiningBudget || 'N/A'}</div>
                        </div>
                    </div>
                    
                    <div class="overview-card">
                        <div class="card-icon">📍</div>
                        <div class="card-content">
                            <div class="card-label">Stops</div>
                            <div class="card-value">${day.stops.length}</div>
                        </div>
                    </div>
                    
                    <div class="overview-card">
                        <div class="card-icon">⭐</div>
                        <div class="card-content">
                            <div class="card-label">Highlights</div>
                            <div class="card-value">${summary.keyHighlights ? summary.keyHighlights.length : 0}</div>
                        </div>
                    </div>
                </div>
                
                ${summary.keyHighlights ? `
                    <div class="highlights-preview">
                        <h4>⭐ Today's Highlights</h4>
                        <div class="highlights-list">
                            ${summary.keyHighlights.slice(0, 3).map(highlight => 
                                `<div class="highlight-item">${highlight}</div>`
                            ).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // ===== ENHANCED STOPS ACCORDION =====
    createStopsAccordion(day) {
        return `
            <div class="stops-accordion-container">
                <div class="stops-header">
                    <h3>📍 Today's Stops</h3>
                    <div class="stops-timeline">
                        ${day.stops.filter(stop => stop.scheduledTime).slice(0, 4).map((stop, index) => {
                            const stopId = this.generateStopId(stop, day.date);
                            const isCompleted = this.progressData.completedStops.includes(stopId);
                            return `
                                <div class="timeline-point ${isCompleted ? 'completed' : ''}" 
                                     data-stop-id="${stopId}" title="${stop.name}">
                                    <div class="point-time">${stop.scheduledTime}</div>
                                    <div class="point-indicator"></div>
                                </div>
                            `;
                        }).join('')}
                        ${day.stops.length > 4 ? `<div class="timeline-more">+${day.stops.length - 4}</div>` : ''}
                    </div>
                </div>
                
                <div class="stops-list">
                    ${day.stops.map((stop, index) => 
                        this.createEnhancedStopElement(stop, index, day.stops.length, day.date)
                    ).join('')}
                </div>
            </div>
        `;
    }

    // ===== ENHANCED STOP ELEMENT WITH NESTED ACCORDIONS =====
    createEnhancedStopElement(stop, index, totalStops, dayDate) {
        const stopId = this.generateStopId(stop, dayDate);
        const isCompleted = this.progressData.completedStops.includes(stopId);
        const isRequired = stop.type === 'Required Event';
        const isExpanded = this.state.expandedSections.get(stopId) || false;
        
        return `
            <div class="enhanced-stop-accordion ${isCompleted ? 'completed' : ''} ${isRequired ? 'required' : ''}" 
                 data-stop-id="${stopId}">
                
                <div class="stop-accordion-header" data-accordion="stop-${stopId}">
                    <div class="stop-completion">
                        <input type="checkbox" 
                               class="completion-checkbox modern-checkbox" 
                               id="checkbox-${stopId}" 
                               ${isCompleted ? 'checked' : ''}>
                        <label for="checkbox-${stopId}" class="completion-label">
                            <div class="checkbox-custom"></div>
                        </label>
                    </div>
                    
                    <div class="stop-main-info">
                        <div class="stop-title">
                            <h4>${stop.name}</h4>
                            ${isRequired ? '<span class="required-badge">⭐ Required</span>' : ''}
                            <span class="stop-type-badge">${stop.type}</span>
                        </div>
                        
                        <div class="stop-meta">
                            ${stop.scheduledTime ? `<span class="meta-item">🕐 ${stop.scheduledTime}</span>` : ''}
                            ${stop.duration ? `<span class="meta-item">⏱️ ${stop.duration}</span>` : ''}
                            <span class="meta-item">📍 ${index + 1}/${totalStops}</span>
                        </div>
                        
                        <div class="stop-address">${stop.address}</div>
                    </div>
                    
                    <div class="stop-actions">
                        <button class="stop-action-btn" data-action="navigate" data-stop="${stopId}" title="Navigate">
                            🗺️
                        </button>
                        <button class="stop-action-btn" data-action="notes" data-stop="${stopId}" title="Notes">
                            📝
                        </button>
                        <div class="expand-indicator ${isExpanded ? 'expanded' : ''}">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M7 10l5 5 5-5z" fill="currentColor"/>
                            </svg>
                        </div>
                    </div>
                </div>
                
                <div class="stop-accordion-content ${isExpanded ? 'expanded' : ''}" id="stop-content-${stopId}">
                    <div class="stop-content-wrapper">
                        <div class="stop-description">${stop.description}</div>
                        ${this.createStopDetailsAccordions(stop, stopId)}
                    </div>
                </div>
            </div>
        `;
    }

    // ===== NESTED ACCORDIONS FOR STOP DETAILS =====
    createStopDetailsAccordions(stop, stopId) {
        const sections = [];
        
        // Activities section
        if (stop.activities && stop.activities.length > 0) {
            sections.push({
                id: 'activities',
                title: '🎯 Activities',
                content: this.createActivitiesContent(stop.activities, stopId),
                priority: 1
            });
        }
        
        // Dining section
        if (stop.diningRecommendations && stop.diningRecommendations.length > 0) {
            sections.push({
                id: 'dining',
                title: '🍽️ Dining',
                content: this.createDiningContent(stop.diningRecommendations),
                priority: 2
            });
        }
        
        // Transport section
        if (stop.transportOptions && stop.transportOptions.length > 0) {
            sections.push({
                id: 'transport',
                title: '🚇 Transport',
                content: this.createTransportContent(stop.transportOptions),
                priority: 3
            });
        }
        
        // Mobile info section
        if (stop.mobileInfo) {
            sections.push({
                id: 'mobile',
                title: '📱 Mobile Info',
                content: this.createMobileInfoContent(stop.mobileInfo),
                priority: 4
            });
        }
        
        // Notes section (always present)
        sections.push({
            id: 'notes',
            title: '📝 Personal Notes',
            content: this.createNotesContent(stopId),
            priority: 5,
            alwaysShow: true
        });
        
        // Sort by priority and create accordion
        sections.sort((a, b) => a.priority - b.priority);
        
        return `
            <div class="stop-details-accordions">
                ${sections.map(section => `
                    <div class="detail-accordion ${section.alwaysShow ? 'always-show' : ''}" 
                         data-section="${section.id}">
                        <div class="detail-accordion-header" data-accordion="detail-${stopId}-${section.id}">
                            <span class="section-title">${section.title}</span>
                            <div class="expand-indicator">
                                <svg viewBox="0 0 24 24" width="14" height="14">
                                    <path d="M7 10l5 5 5-5z" fill="currentColor"/>
                                </svg>
                            </div>
                        </div>
                        <div class="detail-accordion-content" id="detail-content-${stopId}-${section.id}">
                            ${section.content}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ===== DAY EXTRAS (SUMMARY, PRACTICAL INFO, ETC.) =====
    createDayExtras(day) {
        const extras = [];
        
        if (day.practicalInfo) {
            extras.push(`
                <div class="day-extra-section">
                    <h4>ℹ️ Practical Information</h4>
                    ${this.createPracticalInfoContent(day.practicalInfo)}
                </div>
            `);
        }
        
        if (day.events && day.events.length > 0) {
            extras.push(`
                <div class="day-extra-section">
                    <h4>🎉 Optional Events</h4>
                    ${this.createEventsContent(day.events)}
                </div>
            `);
        }
        
        return extras.length > 0 ? `<div class="day-extras">${extras.join('')}</div>` : '';
    }
// ===== ENHANCED ACCORDION INTERACTION HANDLERS =====
    handleAccordionClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const header = e.target.closest('.accordion-header, .day-accordion-header, .stop-accordion-header, .detail-accordion-header');
        if (!header) return;
        
        const accordionId = header.dataset.accordion;
        const content = document.getElementById(`${accordionId.replace(/^(day|stop|detail)-/, '').replace(/^/, accordionId.startsWith('day') ? 'day-content-' : accordionId.startsWith('stop') ? 'stop-content-' : 'detail-content-')}`);
        
        if (!content) return;
        
        const isExpanded = content.classList.contains('expanded');
        const expandIndicator = header.querySelector('.expand-indicator');
        
        // Smooth accordion animation
        if (isExpanded) {
            content.style.maxHeight = content.scrollHeight + 'px';
            requestAnimationFrame(() => {
                content.style.maxHeight = '0';
                content.classList.remove('expanded');
            });
        } else {
            content.classList.add('expanded');
            content.style.maxHeight = content.scrollHeight + 'px';
            
            // Reset max-height after animation
            setTimeout(() => {
                content.style.maxHeight = 'none';
            }, 300);
        }
        
        // Update expand indicator
        if (expandIndicator) {
            expandIndicator.classList.toggle('expanded', !isExpanded);
        }
        
        // Update state tracking
        if (accordionId.startsWith('day-')) {
            const dayDate = accordionId.replace('day-', '');
            if (isExpanded) {
                this.state.expandedDays.delete(dayDate);
            } else {
                this.state.expandedDays.add(dayDate);
                // Initialize map if needed
                setTimeout(() => this.initializeMap(dayDate), 100);
            }
        } else if (accordionId.startsWith('stop-')) {
            const stopId = accordionId.replace('stop-', '');
            this.state.expandedSections.set(stopId, !isExpanded);
        }
        
        this.saveUserPreferences();
    }

    handleQuickAction(e) {
        const action = e.target.dataset.action;
        const target = e.target.dataset.date || e.target.dataset.stop;
        
        switch(action) {
            case 'expand-all':
                this.expandAllDays();
                break;
            case 'collapse-all':
                this.collapseAllDays();
                break;
            case 'mark-all':
                this.markAllStopsComplete();
                break;
            case 'mark-day':
                this.toggleDayCompletion(target);
                break;
            case 'navigate-day':
                this.navigateToDay(target);
                break;
            case 'navigate':
                this.navigateToStop(target);
                break;
            case 'notes':
                this.focusStopNotes(target);
                break;
            case 'export':
                this.exportProgress();
                break;
            case 'reset':
                this.resetProgress();
                break;
            case 'print':
                this.printItinerary();
                break;
        }
    }

    handleStopToggle(e) {
        const checkbox = e.target;
        const stopId = checkbox.id.replace('checkbox-', '');
        const completed = checkbox.checked;
        
        // Visual feedback
        const stopElement = checkbox.closest('.enhanced-stop-accordion');
        if (stopElement) {
            stopElement.classList.toggle('completed', completed);
            
            // Animate completion
            if (completed) {
                this.animateCompletion(stopElement);
            }
        }
        
        // Update progress data
        if (completed) {
            if (!this.progressData.completedStops.includes(stopId)) {
                this.progressData.completedStops.push(stopId);
            }
        } else {
            this.progressData.completedStops = this.progressData.completedStops.filter(id => id !== stopId);
        }
        
        this.saveProgressData();
        this.checkAchievements(stopId, completed);
        this.updateProgressDisplays();
        
        // Trigger callback to parent app
        if (this.onStopToggle) {
            this.onStopToggle(stopId, completed);
        }
        
        // Show completion notification
        const stopName = stopElement.querySelector('.stop-title h4')?.textContent || 'Stop';
        this.showNotification(
            completed ? `✅ ${stopName} completed!` : `⭕ ${stopName} marked incomplete`,
            completed ? 'success' : 'info'
        );
    }

    handleFilterChange(e) {
        const filter = e.target.dataset.filter;
        const checked = e.target.checked;
        
        this.state.filters[`show${filter.charAt(0).toUpperCase() + filter.slice(1)}`] = checked;
        
        this.applyFilters();
        this.saveUserPreferences();
    }

    handleNoteInput(e) {
        const stopId = e.target.dataset.stopId;
        const note = e.target.value;
        
        // Debounced save
        clearTimeout(this.noteTimeout);
        this.noteTimeout = setTimeout(() => {
            this.savePersonalNote(stopId, note);
        }, 1000);
    }

    // ===== CONTENT CREATION METHODS =====
    createActivitiesContent(activities, stopId) {
        return `
            <div class="activities-content">
                <div class="sync-section">
                    <button class="sync-packing-btn modern-btn" data-stop="${stopId}" data-action="sync-activities">
                        🧳 Add Related Items to Packing List
                    </button>
                </div>
                
                <div class="activities-grid">
                    ${activities.map(activity => `
                        <div class="activity-card">
                            <div class="activity-header">
                                <h5 class="activity-name">${activity.name}</h5>
                                <span class="activity-price">${activity.price || 'Free'}</span>
                            </div>
                            <p class="activity-description">${activity.description}</p>
                            <div class="activity-meta">
                                ${activity.duration ? `<span class="meta-tag">⏱️ ${activity.duration}</span>` : ''}
                                ${activity.mobileNote ? `<span class="meta-tag mobile-note">📱 ${activity.mobileNote}</span>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    createDiningContent(recommendations) {
        return `
            <div class="dining-content">
                <div class="dining-grid">
                    ${recommendations.map(restaurant => `
                        <div class="dining-card">
                            <div class="dining-header">
                                <h5 class="restaurant-name">${restaurant.name}</h5>
                                <span class="price-range ${restaurant.priceRange?.toLowerCase().replace(/\s+/g, '-')}">${restaurant.priceRange}</span>
                            </div>
                            
                            <div class="dining-details">
                                <div class="detail-row">
                                    <span class="detail-label">Cuisine:</span>
                                    <span class="detail-value">${restaurant.cuisine}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Special Dish:</span>
                                    <span class="detail-value">${restaurant.specialDish}</span>
                                </div>
                                ${restaurant.walkingTime ? `
                                    <div class="detail-row">
                                        <span class="detail-label">🚶 Walking Time:</span>
                                        <span class="detail-value">${restaurant.walkingTime}</span>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div class="dining-actions">
                                ${restaurant.phone ? `<a href="tel:${restaurant.phone}" class="action-link">📞 Call</a>` : ''}
                                ${restaurant.address ? `<button class="action-btn" data-action="navigate" data-address="${restaurant.address}">🗺️ Navigate</button>` : ''}
                            </div>
                            
                            ${restaurant.mobileNote ? `<div class="mobile-note">📱 ${restaurant.mobileNote}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    createTransportContent(transportOptions) {
        return `
            <div class="transport-content">
                <div class="transport-options">
                    ${transportOptions.map(option => `
                        <div class="transport-card">
                            <div class="transport-header">
                                <div class="transport-method">${option.method}</div>
                                <div class="transport-cost">${option.cost}</div>
                            </div>
                            
                            <div class="transport-details">
                                <div class="detail-grid">
                                    <div class="detail-item">
                                        <span class="detail-icon">⏱️</span>
                                        <span class="detail-text">${option.duration}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-icon">🔄</span>
                                        <span class="detail-text">${option.frequency}</span>
                                    </div>
                                </div>
                            </div>
                            
                            ${option.pros || option.cons ? `
                                <div class="transport-pros-cons">
                                    ${option.pros ? `
                                        <div class="pros">
                                            <strong>✅ Pros:</strong> ${option.pros.join(', ')}
                                        </div>
                                    ` : ''}
                                    ${option.cons ? `
                                        <div class="cons">
                                            <strong>❌ Cons:</strong> ${option.cons.join(', ')}
                                        </div>
                                    ` : ''}
                                </div>
                            ` : ''}
                            
                            ${option.mobileNote ? `<div class="mobile-note">📱 ${option.mobileNote}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    createMobileInfoContent(mobileInfo) {
        return `
            <div class="mobile-info-content">
                ${mobileInfo.quickTip ? `
                    <div class="quick-tip-card">
                        <div class="tip-icon">💡</div>
                        <div class="tip-content">
                            <strong>Quick Tip:</strong> ${mobileInfo.quickTip}
                        </div>
                    </div>
                ` : ''}
                
                ${mobileInfo.essentials ? `
                    <div class="essentials-section">
                        <h5>✅ Essentials</h5>
                        <ul class="essentials-list">
                            ${mobileInfo.essentials.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${mobileInfo.apps ? `
                    <div class="apps-section">
                        <h5>📲 Recommended Apps</h5>
                        <div class="app-tags">
                            ${mobileInfo.apps.map(app => `<span class="app-tag">${app}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${mobileInfo.nearbyServices ? `
                    <div class="services-section">
                        <h5>🏪 Nearby Services</h5>
                        <ul class="services-list">
                            ${mobileInfo.nearbyServices.map(service => `<li>${service}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }

    createNotesContent(stopId) {
        const existingNote = this.progressData.personalNotes[stopId];
        
        return `
            <div class="notes-content">
                <div class="notes-input-section">
                    <textarea class="personal-note-input modern-textarea" 
                              data-stop-id="${stopId}"
                              placeholder="Add your personal notes, tips, or reminders for this stop..."
                              rows="4">${existingNote ? existingNote.text : ''}</textarea>
                    
                    <div class="notes-actions">
                        <button class="notes-btn save-btn" data-action="save-note" data-stop="${stopId}">
                            💾 Save Note
                        </button>
                        ${existingNote ? `
                            <button class="notes-btn delete-btn" data-action="delete-note" data-stop="${stopId}">
                                🗑️ Delete
                            </button>
                        ` : ''}
                    </div>
                    
                    ${existingNote ? `
                        <div class="note-metadata">
                            Last updated: ${new Date(existingNote.timestamp).toLocaleString()}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    createPracticalInfoContent(practicalInfo) {
        return `
            <div class="practical-info-content">
                <div class="emergency-section">
                    <h5>🚨 Emergency Contacts</h5>
                    <div class="emergency-grid">
                        <a href="tel:${practicalInfo.emergencyNumber}" class="emergency-card">
                            <div class="emergency-icon">🚨</div>
                            <div class="emergency-info">
                                <div class="emergency-label">General Emergency</div>
                                <div class="emergency-number">${practicalInfo.emergencyNumber}</div>
                            </div>
                        </a>
                        
                        ${practicalInfo.policeNumber ? `
                            <a href="tel:${practicalInfo.policeNumber}" class="emergency-card">
                                <div class="emergency-icon">👮</div>
                                <div class="emergency-info">
                                    <div class="emergency-label">Police</div>
                                    <div class="emergency-number">${practicalInfo.policeNumber}</div>
                                </div>
                            </a>
                        ` : ''}
                        
                        ${practicalInfo.medicalEmergency ? `
                            <a href="tel:${practicalInfo.medicalEmergency}" class="emergency-card">
                                <div class="emergency-icon">🏥</div>
                                <div class="emergency-info">
                                    <div class="emergency-label">Medical</div>
                                    <div class="emergency-number">${practicalInfo.medicalEmergency}</div>
                                </div>
                            </a>
                        ` : ''}
                    </div>
                </div>
                
                <div class="info-sections">
                    <div class="info-card">
                        <h6>🏥 Nearby Hospital</h6>
                        <p>${practicalInfo.nearbyHospital}</p>
                    </div>
                    
                    ${practicalInfo.nearestPharmacy ? `
                        <div class="info-card">
                            <h6>💊 Nearest Pharmacy</h6>
                            <p>${practicalInfo.nearestPharmacy}</p>
                        </div>
                    ` : ''}
                </div>
                
                ${practicalInfo.localCustoms ? `
                    <div class="customs-section">
                        <h5>🌍 Local Customs</h5>
                        <ul class="customs-list">
                            ${practicalInfo.localCustoms.map(custom => `<li>${custom}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }

    createEventsContent(events) {
        return `
            <div class="events-content">
                <div class="events-grid">
                    ${events.map(event => `
                        <div class="event-card">
                            <div class="event-header">
                                <h5 class="event-name">${event.name}</h5>
                                ${event.price ? `<span class="event-price">${event.price}</span>` : ''}
                            </div>
                            
                            <p class="event-description">${event.description}</p>
                            
                            <div class="event-details">
                                ${event.venue ? `<div class="event-detail">📍 <strong>Venue:</strong> ${event.venue}</div>` : ''}
                                ${event.time ? `<div class="event-detail">🕐 <strong>Time:</strong> ${event.time}</div>` : ''}
                                ${event.transportFromHotel ? `<div class="event-detail">🚇 <strong>From Hotel:</strong> ${event.transportFromHotel}</div>` : ''}
                            </div>
                            
                            ${event.mobileNote ? `<div class="mobile-note">📱 ${event.mobileNote}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ===== INTERACTION METHODS =====
    changeViewMode(viewMode) {
        this.state.viewMode = viewMode;
        
        // Update view mode buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewMode);
        });
        
        // Update container class
        const daysContainer = document.querySelector('.days-container');
        if (daysContainer) {
            daysContainer.className = `days-container view-${viewMode}`;
        }
        
        this.saveUserPreferences();
        this.showNotification(`Switched to ${viewMode} view`, 'info', 1500);
    }

    expandAllDays() {
        document.querySelectorAll('.day-accordion-content').forEach(content => {
            if (!content.classList.contains('expanded')) {
                const header = content.previousElementSibling;
                if (header) {
                    this.handleAccordionClick({ target: header, preventDefault: () => {}, stopPropagation: () => {} });
                }
            }
        });
        
        this.showNotification('All days expanded', 'info', 1500);
    }

    collapseAllDays() {
        document.querySelectorAll('.day-accordion-content.expanded').forEach(content => {
            const header = content.previousElementSibling;
            if (header) {
                this.handleAccordionClick({ target: header, preventDefault: () => {}, stopPropagation: () => {} });
            }
        });
        
        this.showNotification('All days collapsed', 'info', 1500);
    }

    toggleDayCompletion(dayDate) {
        const dayData = this.getCurrentDayData(dayDate);
        if (!dayData) return;
        
        const dayStopIds = dayData.stops.map(stop => this.generateStopId(stop, dayDate));
        const completedInDay = dayStopIds.filter(stopId => this.progressData.completedStops.includes(stopId));
        const shouldComplete = completedInDay.length < dayStopIds.length;
        
        if (confirm(`Mark all stops in this day as ${shouldComplete ? 'completed' : 'incomplete'}?`)) {
            dayStopIds.forEach(stopId => {
                const checkbox = document.getElementById(`checkbox-${stopId}`);
                if (checkbox) {
                    checkbox.checked = shouldComplete;
                    this.handleStopToggle({ target: checkbox });
                }
            });
            
            this.showNotification(
                `All stops marked as ${shouldComplete ? 'completed' : 'incomplete'}!`,
                'success'
            );
        }
    }

    applyFilters() {
        const stops = document.querySelectorAll('.enhanced-stop-accordion');
        
        stops.forEach(stop => {
            const isCompleted = stop.classList.contains('completed');
            const isRequired = stop.classList.contains('required');
            
            let shouldShow = true;
            
            if (!this.state.filters.showCompleted && isCompleted) {
                shouldShow = false;
            }
            
            if (!this.state.filters.showIncomplete && !isCompleted) {
                shouldShow = false;
            }
            
            if (this.state.filters.showRequired && !isRequired) {
                shouldShow = false;
            }
            
            stop.style.display = shouldShow ? 'block' : 'none';
        });
        
        // Hide days with no visible stops
        document.querySelectorAll('.enhanced-day-accordion').forEach(day => {
            const visibleStops = day.querySelectorAll('.enhanced-stop-accordion[style*="block"], .enhanced-stop-accordion:not([style*="none"])');
            const hasVisibleStops = Array.from(visibleStops).some(stop => 
                !stop.style.display || stop.style.display !== 'none'
            );
            
            day.style.display = hasVisibleStops ? 'block' : 'none';
        });
    }

    updateProgressDisplays() {
        // Update header progress
        const progressFill = document.querySelector('.progress-bar-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill && progressText && this.state.currentItineraryData) {
            const totalStops = this.state.currentItineraryData.days.reduce((sum, day) => sum + day.stops.length, 0);
            const completedStops = this.progressData.completedStops.length;
            const percentage = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;
            
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `${completedStops}/${totalStops} stops completed`;
        }
        
        // Update day completion badges
        if (this.state.currentItineraryData) {
            this.state.currentItineraryData.days.forEach(day => {
                const completionStatus = this.getDayCompletionStatus(day);
                const badge = document.querySelector(`[data-date="${day.date}"] .completion-badge`);
                
                if (badge) {
                    badge.textContent = `${completionStatus.percentage}%`;
                    badge.classList.toggle('completed', completionStatus.percentage === 100);
                }
            });
        }
    }

    animateCompletion(element) {
        element.classList.add('completion-animation');
        setTimeout(() => {
            element.classList.remove('completion-animation');
        }, 600);
    }

    // ===== NOTES METHODS =====
    savePersonalNote(stopId, note) {
        this.progressData.personalNotes[stopId] = {
            text: note,
            timestamp: new Date().toISOString()
        };
        this.saveProgressData();
        
        if (this.onNoteUpdate) {
            this.onNoteUpdate(stopId, note);
        }
        
        this.showNotification('Note saved!', 'success', 1500);
    }

    deletePersonalNote(stopId) {
        if (confirm('Delete this note?')) {
            delete this.progressData.personalNotes[stopId];
            this.saveProgressData();
            
            // Re-render the notes section
            const notesContent = document.querySelector(`#detail-content-${stopId}-notes`);
            if (notesContent) {
                notesContent.innerHTML = this.createNotesContent(stopId);
            }
            
            this.showNotification('Note deleted!', 'info', 1500);
        }
    }

    // ===== UTILITY METHODS =====
    getAchievementInfo(achievementId) {
        const achievements = {
            'first_stop': { icon: '🎯', description: 'Completed your first itinerary stop!' },
            'milestone_5': { icon: '🏆', description: 'Completed 5 itinerary stops!' },
            'milestone_10': { icon: '🏆', description: 'Completed 10 itinerary stops!' },
            'streak_5': { icon: '🔥', description: 'Completed 5 stops in a row!' }
        };
        
        return achievements[achievementId] || { icon: '🏅', description: 'Achievement unlocked!' };
    }

    initializeMap(dayDate) {
        // Map initialization logic (keeping existing implementation)
        const mapContainer = document.getElementById(`itinerary-map-${dayDate}`);
        
        if (mapContainer && !mapContainer.hasChildNodes() && typeof L !== 'undefined') {
            const dayData = this.getCurrentDayData(dayDate);
            if (!dayData || !dayData.stops) return;
            
            const map = L.map(`itinerary-map-${dayDate}`).setView([37.9755, 23.7348], 12);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            // Add markers for stops with coordinates
            dayData.stops.forEach((stop, index) => {
                if (stop.coordinates) {
                    const [lat, lng] = stop.coordinates.split(',');
                    const stopId = this.generateStopId(stop, dayDate);
                    const isCompleted = this.progressData.completedStops.includes(stopId);
                    
                    const marker = L.marker([parseFloat(lat), parseFloat(lng)]).addTo(map);
                    marker.bindPopup(`
                        <div class="map-popup">
                            <h4>${stop.name}</h4>
                            <p>${stop.description}</p>
                            <div class="popup-status ${isCompleted ? 'completed' : ''}">
                                ${isCompleted ? '✅ Completed' : '⭕ Not completed'}
                            </div>
                        </div>
                    `);
                }
            });
        }
    }

    // ===== EXPORT/IMPORT/UTILITY METHODS =====
    exportProgress() {
        const exportData = {
            progress: this.progressData,
            preferences: {
                viewMode: this.state.viewMode,
                filters: this.state.filters
            },
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `tripmaster-progress-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Progress exported!', 'success');
    }

    printItinerary() {
        const printWindow = window.open('', '_blank');
        const itineraryHTML = this.generatePrintHTML();
        
        printWindow.document.write(itineraryHTML);
        printWindow.document.close();
        printWindow.print();
    }

    generatePrintHTML() {
        // Generate a clean print version of the itinerary
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Travel Itinerary</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .day { page-break-before: always; margin-bottom: 30px; }
                    .day:first-child { page-break-before: avoid; }
                    .stop { margin: 15px 0; padding: 10px; border-left: 3px solid #3498db; }
                    .completed { background-color: #e8f5e8; }
                    h1, h2, h3 { color: #2c3e50; }
                </style>
            </head>
            <body>
                <h1>📅 Travel Itinerary</h1>
                ${this.state.currentItineraryData ? this.state.currentItineraryData.days.map(day => `
                    <div class="day">
                        <h2>${new Date(day.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}</h2>
                        ${day.stops.map(stop => {
                            const stopId = this.generateStopId(stop, day.date);
                            const isCompleted = this.progressData.completedStops.includes(stopId);
                            return `
                                <div class="stop ${isCompleted ? 'completed' : ''}">
                                    <h3>${stop.name} ${isCompleted ? '✅' : ''}</h3>
                                    <p><strong>Time:</strong> ${stop.scheduledTime || 'Flexible'}</p>
                                    <p><strong>Address:</strong> ${stop.address}</p>
                                    <p>${stop.description}</p>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `).join('') : ''}
            </body>
            </html>
        `;
    }

    resetProgress() {
        if (confirm('Reset all itinerary progress? This cannot be undone.')) {
            this.progressData = {
                completedStops: [],
                openDays: [],
                personalNotes: {},
                lastVisited: null,
                streaks: { current: 0, longest: 0, lastCompletionDate: null },
                achievements: [],
                timeSpent: 0,
                sessionStart: Date.now()
            };
            
            this.saveProgressData();
            this.showNotification('Progress reset successfully', 'info');
            
            // Re-render to reflect changes
            if (this.state.currentItineraryData) {
                this.render(this.state.currentItineraryData);
            }
        }
    }

    // Keep existing methods for backward compatibility
    restoreExpandedDays() {
        this.progressData.openDays.forEach(dayDate => {
            this.state.expandedDays.add(dayDate);
        });
    }

    scrollToStop(stopId) {
        const element = document.querySelector(`[data-stop-id="${stopId}"]`);
        if (element) {
            this.smoothScrollTo(element, 100);
        }
    }

    scrollToDayHeader(dayDate) {
        const element = document.querySelector(`[data-date="${dayDate}"]`);
        if (element) {
            this.smoothScrollTo(element, 100);
        }
    }

      toggleCompactView() {
       const newMode = this.state.viewMode === 'compact' ? 'timeline' : 'compact';
       this.changeViewMode(newMode);
   }

   focusFilterInput() {
       const filterInput = document.querySelector('.filter-checkbox');
       if (filterInput) {
           filterInput.focus();
       }
   }

   closeAllModals() {
       // Close any open modals or expanded sections
       document.querySelectorAll('.modal, .popup').forEach(modal => {
           modal.classList.remove('show');
       });
   }

   navigateToDay(dayDate) {
       const dayElement = document.querySelector(`[data-date="${dayDate}"]`);
       if (dayElement) {
           this.smoothScrollTo(dayElement, 100);
           
           // Expand the day if it's not already expanded
           const content = dayElement.querySelector('.day-accordion-content');
           if (content && !content.classList.contains('expanded')) {
               const header = dayElement.querySelector('.day-accordion-header');
               if (header) {
                   this.handleAccordionClick({ 
                       target: header, 
                       preventDefault: () => {}, 
                       stopPropagation: () => {} 
                   });
               }
           }
       }
   }

   navigateToStop(stopId) {
       const coordinates = this.getStopCoordinates(stopId);
       if (coordinates) {
           const [lat, lng] = coordinates.split(',');
           const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
           window.open(url, '_blank');
       } else {
           this.showNotification('No coordinates available for navigation', 'warning');
       }
   }

   focusStopNotes(stopId) {
       const notesTextarea = document.querySelector(`[data-stop-id="${stopId}"]`);
       if (notesTextarea) {
           notesTextarea.focus();
           notesTextarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
       }
   }

   getStopCoordinates(stopId) {
       if (!this.state.currentItineraryData) return null;
       
       for (const day of this.state.currentItineraryData.days) {
           const stop = day.stops.find(s => this.generateStopId(s, day.date) === stopId);
           if (stop && stop.coordinates) {
               return stop.coordinates;
           }
       }
       
       return null;
   }

   syncActivitiesToPacking(stopId) {
       const stop = this.findStopById(stopId);
       if (!stop || !stop.activities) return;
       
       const activities = stop.activities.map(activity => activity.name);
       
       if (this.onActivitySync) {
           this.onActivitySync(stopId, activities);
           this.showNotification('Activities synced to packing list!', 'success');
       }
   }

   findStopById(stopId) {
       if (!this.state.currentItineraryData) return null;
       
       for (const day of this.state.currentItineraryData.days) {
           const stop = day.stops.find(s => this.generateStopId(s, day.date) === stopId);
           if (stop) return stop;
       }
       
       return null;
   }

   markAllStopsComplete() {
       if (!this.state.currentItineraryData) return;
       
       const allStopIds = [];
       this.state.currentItineraryData.days.forEach(day => {
           day.stops.forEach(stop => {
               allStopIds.push(this.generateStopId(stop, day.date));
           });
       });
       
       const incompleteStops = allStopIds.filter(stopId => 
           !this.progressData.completedStops.includes(stopId)
       );
       
       if (incompleteStops.length === 0) {
           this.showNotification('All stops are already completed!', 'info');
           return;
       }
       
       if (confirm(`Mark all ${incompleteStops.length} remaining stops as complete?`)) {
           incompleteStops.forEach(stopId => {
               const checkbox = document.getElementById(`checkbox-${stopId}`);
               if (checkbox) {
                   checkbox.checked = true;
                   this.handleStopToggle({ target: checkbox });
               }
           });
           
           this.showNotification(`${incompleteStops.length} stops marked as complete!`, 'success');
       }
   }

   // ===== CLEANUP AND LIFECYCLE METHODS =====
   destroy() {
       // Clean up event listeners and timers
       if (this.noteTimeout) {
           clearTimeout(this.noteTimeout);
       }
       
       // Save final state
       this.saveProgressData();
       this.saveUserPreferences();
       
       // Remove global reference
       if (window.itineraryDisplay === this) {
           window.itineraryDisplay = null;
       }
       
       console.log('ItineraryDisplay destroyed and cleaned up');
   }

   // ===== LEGACY COMPATIBILITY METHODS =====
   // These methods maintain compatibility with existing code
   
   loadItinerary(itineraryData) {
       this.render(itineraryData);
   }

   toggleStopComplete(stopId, completed) {
       const checkbox = document.getElementById(`checkbox-${stopId}`);
       if (checkbox) {
           checkbox.checked = completed;
           this.handleStopToggle({ target: checkbox });
       }
   }

   exportItinerary() {
       this.exportProgress();
   }

   importItinerary(fileInput) {
       this.showNotification('Import functionality handled by parent app', 'info');
   }

   toggleSection(button) {
       // Legacy method - now handled by accordion system
       const isExpanded = button.classList.contains('expanded');
       button.classList.toggle('expanded', !isExpanded);
       
       const content = button.nextElementSibling;
       if (content) {
           content.classList.toggle('collapsed', isExpanded);
       }
   }

   markAllStopsInDay(dayDate, completed) {
       this.toggleDayCompletion(dayDate);
   }

   scrollToSection(sectionId) {
       const element = document.getElementById(sectionId);
       if (element) {
           this.smoothScrollTo(element, 100);
       }
   }

   // Method to extract activities from stop element (legacy compatibility)
   extractActivitiesFromStop(stopElement) {
       const activities = [];
       const activityElements = stopElement.querySelectorAll('.activity-name');
       activityElements.forEach(element => {
           activities.push(element.textContent);
       });
       return activities;
   }

   // Update visual state methods (legacy compatibility) 
   updateStopVisualState(stopId, completed) {
       const stopElement = document.querySelector(`[data-stop-id="${stopId}"]`);
       if (stopElement) {
           stopElement.classList.toggle('completed', completed);
           
           const checkbox = stopElement.querySelector('.completion-checkbox');
           if (checkbox) {
               checkbox.checked = completed;
           }
       }
   }

   updateProgressIndicator(itineraryData) {
       this.updateProgressDisplays();
   }

   updateDayProgress(dayDate) {
       // This is now handled automatically by updateProgressDisplays()
       this.updateProgressDisplays();
   }

   // Save/load progress methods (enhanced versions)
   loadProgressData() {
       return this.loadProgressData();
   }

   saveProgressData() {
       return this.saveProgressData();
   }
}
