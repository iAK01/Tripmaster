
// components/navigation.js - Tab navigation system for TripMaster - COMPLETE & FIXED
import { isProfileComplete } from '../data/unified-data-model.js';

export class Navigation {
    constructor(options) {
        this.container = options.container;
        this.onTabChange = options.onTabChange;
        this.currentTab = 'overview';

        this.userProfile = null;
        this.storageManager = null; // Will be injected
        
        // FIXED: Ensure all tabs are properly defined
        this.tabs = [
            { id: 'overview', label: '📋 Overview', icon: '📋' },
            { id: 'setup', label: '🧳 Trip Setup', icon: '🧳' },
            { id: 'itinerary', label: '📅 Itinerary', icon: '📅' },
            { id: 'packing', label: '🎒 Packing', icon: '🎒' },
            { id: 'local-info', label: '🗺️ Local Info', icon: '🗺️' }
        ];
        
        // DEBUG: Log tabs to ensure they're correct
        console.log('Navigation tabs initialized:', this.tabs.map(t => t.label));
        
        this.render();
        this.bindEvents();
    }

    render() {
        // DEBUG: Log rendering
        console.log('Rendering navigation with tabs:', this.tabs.length);
        
        this.container.innerHTML = `
            <nav class="tripmaster-navigation">
               <div class="nav-header">
                    <h1 class="app-title">🧳 TripMaster</h1>
                    <p class="app-subtitle">${this.getPersonalizedSubtitle()}</p>
                </div>
                <div class="nav-tabs">
                    ${this.tabs.map(tab => `
                        <button class="nav-tab ${tab.id === this.currentTab ? 'active' : ''}" 
                                data-tab="${tab.id}">
                            <span class="tab-icon">${tab.icon}</span>
                            <span class="tab-label">${tab.label}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="nav-progress">
                    <div class="progress-indicator">
                        <span class="progress-label">Trip Progress</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 0%"></div>
                        </div>
                        <span class="progress-text">0% Complete</span>
                    </div>
                </div>
            </nav>
        `;
        
        // DEBUG: Verify rendered tabs
        setTimeout(() => {
            const renderedTabs = this.container.querySelectorAll('.nav-tab');
            console.log('Rendered tab buttons:', renderedTabs.length, Array.from(renderedTabs).map(t => t.textContent.trim()));
        }, 100);
    }

    bindEvents() {
        // Tab click handlers
        this.container.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = e.currentTarget.getAttribute('data-tab');
                console.log('Tab clicked:', tabId); // DEBUG
                this.switchTab(tabId);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                const tabMap = {
                    '1': 'overview',
                    '2': 'setup', 
                    '3': 'itinerary',
                    '4': 'packing',
                    '5': 'local-info'
                };
                
                if (tabMap[e.key]) {
                    e.preventDefault();
                    console.log('Keyboard shortcut:', e.key, '→', tabMap[e.key]); // DEBUG
                    this.switchTab(tabMap[e.key]);
                }
            }
        });
    }

    switchTab(tabId) {
        console.log('Switching to tab:', tabId, 'from:', this.currentTab); // DEBUG
        
        if (tabId === this.currentTab) return;
        
        // Update visual state
        this.container.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const newTab = this.container.querySelector(`[data-tab="${tabId}"]`);
        if (newTab) {
            newTab.classList.add('active');
            this.currentTab = tabId;
            
            // Add animation
            newTab.style.transform = 'scale(0.95)';
            setTimeout(() => {
                newTab.style.transform = 'scale(1)';
            }, 100);
            
            // Notify parent component
            if (this.onTabChange) {
                console.log('Calling onTabChange for:', tabId); // DEBUG
                this.onTabChange(tabId);
            } else {
                console.warn('No onTabChange callback defined!'); // DEBUG
            }
            
            // Save current tab to localStorage
            localStorage.setItem('tripmaster-current-tab', tabId);
        } else {
            console.error('Tab not found:', tabId); // DEBUG
        }
    }

    updateProgress(progressData) {
        const progressFill = this.container.querySelector('.progress-fill');
        const progressText = this.container.querySelector('.progress-text');
        
        if (progressFill && progressText && progressData) {
            const totalProgress = this.calculateOverallProgress(progressData);
            
            progressFill.style.width = `${totalProgress}%`;
            progressText.textContent = `${totalProgress}% Complete`;
            
            // Color coding based on progress
            progressFill.className = 'progress-fill';
            if (totalProgress > 80) {
                progressFill.classList.add('progress-excellent');
            } else if (totalProgress > 60) {
                progressFill.classList.add('progress-good');
            } else if (totalProgress > 30) {
                progressFill.classList.add('progress-moderate');
            }
        }
    }

    calculateOverallProgress(progressData) {
         const weights = {
            profile: 10,    // User profile setup (NEW)
            setup: 15,      // Trip setup completion
            packing: 40,    // Packing completion
            itinerary: 30,  // Itinerary planning
            docs: 5         // Document readiness
        };
        
        let totalProgress = 0;
        
        const profileComplete = (this.userProfile && isProfileComplete(this.userProfile)) ? 100 : 0;
        totalProgress += (profileComplete * weights.profile) / 100;
        
        const setupComplete = progressData.setup || 0;
        totalProgress += (setupComplete * weights.setup) / 100;
        
        // Packing progress
        const packingComplete = progressData.packing || 0;
        totalProgress += (packingComplete * weights.packing) / 100;
        
        // Itinerary progress
        const itineraryComplete = progressData.itinerary || 0;
        totalProgress += (itineraryComplete * weights.itinerary) / 100;
        
        // Documents progress
        const docsComplete = progressData.documents || 0;
        totalProgress += (docsComplete * weights.docs) / 100;
        
        return Math.round(totalProgress);
    }

    // NEW: Profile and personalization methods
    setStorageManager(storageManager) {
        this.storageManager = storageManager;
        this.userProfile = storageManager ? storageManager.getUserProfile() : null;
        console.log('Storage manager set, user profile:', this.userProfile?.name || 'None'); // DEBUG
    }

    updateUserProfile(profile) {
        this.userProfile = profile;
        console.log('User profile updated:', profile?.name || 'None'); // DEBUG
        // Re-render header to show updated personalization
        this.updateHeader();
    }

    getPersonalizedSubtitle() {
        if (this.userProfile && this.userProfile.name) {
            const greeting = this.getTimeBasedGreeting();
            return `${greeting} ${this.userProfile.name}! Your Complete Travel Companion`;
        }
        return 'Your Complete Travel Companion';
    }

    getTimeBasedGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning,';
        if (hour < 17) return 'Hello,';
        return 'Good evening,';
    }

    updateHeader() {
        const subtitle = this.container.querySelector('.app-subtitle');
        if (subtitle) {
            subtitle.textContent = this.getPersonalizedSubtitle();
        }
    }

    showTabNotification(tabId, message, type = 'info') {
        const tab = this.container.querySelector(`[data-tab="${tabId}"]`);
        if (!tab) return;
        
        // Create notification badge
        const existing = tab.querySelector('.tab-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('span');
        notification.className = `tab-notification ${type}`;
        notification.textContent = '!';
        notification.title = message;
        
        tab.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    highlightTab(tabId, duration = 3000) {
        const tab = this.container.querySelector(`[data-tab="${tabId}"]`);
        if (tab) {
            tab.classList.add('tab-highlight');
            setTimeout(() => {
                tab.classList.remove('tab-highlight');
            }, duration);
        }
    }

    getActiveTab() {
        return this.currentTab;
    }

    // Load saved tab from localStorage
    loadSavedTab() {
        const savedTab = localStorage.getItem('tripmaster-current-tab');
        if (savedTab && this.tabs.find(t => t.id === savedTab)) {
            console.log('Loading saved tab:', savedTab); // DEBUG
            this.switchTab(savedTab);
        }
    }

    // Update tab badge counts (for packing items, itinerary stops, etc.)
    updateTabBadge(tabId, count) {
        const tab = this.container.querySelector(`[data-tab="${tabId}"]`);
        if (!tab) return;
        
        // Remove existing badge
        const existing = tab.querySelector('.tab-badge');
        if (existing) existing.remove();
        
        // Add new badge if count > 0
        if (count > 0) {
            const badge = document.createElement('span');
            badge.className = 'tab-badge';
            badge.textContent = count;
            tab.appendChild(badge);
        }
    }

    // DEBUGGING METHODS
    debugState() {
        console.log('=== Navigation Debug ===');
        console.log('Current tab:', this.currentTab);
        console.log('Defined tabs:', this.tabs);
        console.log('Container:', this.container);
        console.log('Rendered tab buttons:', this.container.querySelectorAll('.nav-tab').length);
        console.log('User profile:', this.userProfile);
        console.log('Storage manager:', !!this.storageManager);
    }

    // MANUAL TAB FORCING (for debugging)
    forceShowTab(tabId) {
        console.log('Force showing tab:', tabId);
        
        // Remove active from all tabs
        this.container.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Add active to target tab
        const targetTab = this.container.querySelector(`[data-tab="${tabId}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
            this.currentTab = tabId;
        }
        
        // Force show content section
        document.querySelectorAll('.tab-content').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(`${tabId}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            console.log('Forced section active:', tabId);
        } else {
            console.error('Section not found:', `${tabId}-section`);
        }
        
        // Call tab change if callback exists
        if (this.onTabChange) {
            this.onTabChange(tabId);
        }
    }
}
