// Notification Manager - handles toast notifications
export class NotificationManager {
    constructor() {
        this.container = document.getElementById('notification-container');
        this.activeNotifications = [];
    }

    show(message, type = 'info', duration = 4000) {
        const notification = this.createNotification(message, type);
        
        // Add to container
        if (this.container) {
            this.container.appendChild(notification);
        } else {
            document.body.appendChild(notification);
        }
        
        // Track active notification
        this.activeNotifications.push(notification);
        
        // Auto-remove after duration
        setTimeout(() => {
            this.remove(notification);
        }, duration);
        
        return notification;
    }

    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add close button
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            margin-left: 15px;
            font-size: 1.2em;
            cursor: pointer;
            float: right;
        `;
        closeBtn.onclick = () => this.remove(notification);
        
        notification.appendChild(closeBtn);
        
        return notification;
    }

    remove(notification) {
        if (notification && notification.parentNode) {
            // Add fade out animation
            notification.style.animation = 'slideOut 0.3s ease';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                
                // Remove from active list
                const index = this.activeNotifications.indexOf(notification);
                if (index > -1) {
                    this.activeNotifications.splice(index, 1);
                }
            }, 300);
        }
    }

    clear() {
        this.activeNotifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
        this.activeNotifications = [];
    }

    // Convenience methods
    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}
