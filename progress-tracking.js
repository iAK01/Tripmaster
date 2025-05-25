// Progress Tracking Component - displays overall packing progress
export class ProgressTracking {
    constructor(options) {
        this.container = options.container;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="progress-section hidden" id="progressSection">
                <h3>📊 Packing Progress</h3>
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill">0%</div>
                </div>
                <div id="progressStats">
                    <p><strong>0</strong> of <strong>0</strong> items packed</p>
                </div>
            </div>
        `;
    }

    update(progress) {
        const progressSection = document.getElementById('progressSection');
        const progressFill = document.getElementById('progressFill');
        const progressStats = document.getElementById('progressStats');
        
        if (!progressSection || !progressFill || !progressStats) return;
        
        // Show section if hidden
        progressSection.classList.remove('hidden');
        
        // Update progress bar
        progressFill.style.width = `${progress.percentage}%`;
        progressFill.textContent = `${progress.percentage}%`;
        
        // Update stats text
        progressStats.innerHTML = `
            <p><strong>${progress.completed}</strong> of <strong>${progress.total}</strong> items packed</p>
            ${progress.percentage === 100 ? '<p style="color: #28a745; font-weight: 600;">🎉 All packed! Ready to go!</p>' : ''}
        `;
        
        // Add celebration animation if complete
        if (progress.percentage === 100 && !progressSection.classList.contains('complete')) {
            progressSection.classList.add('complete');
            this.celebrate();
        } else if (progress.percentage < 100) {
            progressSection.classList.remove('complete');
        }
    }

    celebrate() {
        // Create confetti or celebration effect
        const celebrationDiv = document.createElement('div');
        celebrationDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 4em;
            z-index: 1000;
            animation: celebration 2s ease-out;
        `;
        celebrationDiv.textContent = '🎉';
        document.body.appendChild(celebrationDiv);
        
        setTimeout(() => {
            if (celebrationDiv.parentNode) {
                celebrationDiv.parentNode.removeChild(celebrationDiv);
            }
        }, 2000);
    }

    hide() {
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            progressSection.classList.add('hidden');
        }
    }

    show() {
        const progressSection = document.getElementById('progressSection');
        if (progressSection) {
            progressSection.classList.remove('hidden');
        }
    }
}
