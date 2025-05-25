// Control Panel Component - floating action buttons
export class ControlPanel {
    constructor(options) {
        this.container = options.container;
        this.onExport = options.onExport;
        this.onSave = options.onSave;
        this.onScrollTop = options.onScrollTop;
        
        this.render();
        this.bindEvents();
    }

    render() {
        this.container.className = 'control-panel';
        this.container.innerHTML = `
            <button class="floating-btn btn-export" title="Export List" id="exportBtn">📤</button>
            <button class="floating-btn btn-save" title="Save Trip" id="saveBtn">💾</button>
            <button class="floating-btn btn-top" title="Back to Top" id="topBtn">⬆️</button>
        `;
    }

    bindEvents() {
        document.getElementById('exportBtn').addEventListener('click', () => this.onExport());
        document.getElementById('saveBtn').addEventListener('click', () => this.onSave());
        document.getElementById('topBtn').addEventListener('click', () => this.onScrollTop());
        
        // Show/hide back to top button based on scroll
        window.addEventListener('scroll', () => {
            const topBtn = document.getElementById('topBtn');
            if (window.scrollY > 300) {
                topBtn.style.display = 'block';
            } else {
                topBtn.style.display = 'none';
            }
        });
        
        // Initially hide back to top button
        document.getElementById('topBtn').style.display = 'none';
    }
}
