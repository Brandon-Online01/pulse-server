const Handlebars = require('handlebars');

// Equality helper
Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
});

// Greater than helper
Handlebars.registerHelper('gt', function(a, b) {
    return a > b;
});

// Less than helper
Handlebars.registerHelper('lt', function(a, b) {
    return a < b;
});

// If equals helper
Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});

// Date formatting helper
Handlebars.registerHelper('formatDate', function(date, format) {
    if (!date) return '';
    
    const dateObj = new Date(date);
    
    if (format === 'short') {
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } else if (format === 'long') {
        return dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } else if (format === 'datetime') {
        return dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    return dateObj.toLocaleDateString();
});

// Relative time helper
Handlebars.registerHelper('relativeTime', function(date) {
    if (!date) return '';
    
    const now = new Date();
    const targetDate = new Date(date);
    const diffMs = Math.abs(now - targetDate);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ${targetDate > now ? 'from now' : 'ago'}`;
    } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${targetDate > now ? 'from now' : 'ago'}`;
    } else {
        return 'Just now';
    }
});

// Currency formatting helper
Handlebars.registerHelper('currency', function(amount, currency) {
    if (typeof amount !== 'number') return amount;
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD'
    }).format(amount);
});

// Array length helper
Handlebars.registerHelper('length', function(array) {
    return Array.isArray(array) ? array.length : 0;
});

// Status badge helper
Handlebars.registerHelper('statusBadge', function(status) {
    const statusMap = {
        'pending': { color: '#A855F7', bg: '#faf5ff' },
        'completed': { color: '#10b981', bg: '#f0f9f4' },
        'done': { color: '#10b981', bg: '#f0f9f4' },
        'in-progress': { color: '#f59e0b', bg: '#fef3c7' },
        'cancelled': { color: '#ef4444', bg: '#fef2f2' },
        'overdue': { color: '#ef4444', bg: '#fef2f2' }
    };
    
    const statusStyle = statusMap[status?.toLowerCase()] || { color: '#6b7280', bg: '#f3f4f6' };
    
    return new Handlebars.SafeString(
        `<span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; background: ${statusStyle.bg}; color: ${statusStyle.color}; font-family: 'Unbounded', sans-serif;">
            ${status?.toUpperCase() || 'UNKNOWN'}
        </span>`
    );
});

// Priority color helper
Handlebars.registerHelper('priorityColor', function(priority) {
    const priorityMap = {
        'high': '#ef4444',
        'urgent': '#dc2626',
        'medium': '#f59e0b',
        'low': '#10b981'
    };
    
    return priorityMap[priority?.toLowerCase()] || '#6b7280';
});

// Priority emoji helper
Handlebars.registerHelper('priorityEmoji', function(priority) {
    const emojiMap = {
        'high': '🔴',
        'urgent': '🔴',
        'medium': '🟡',
        'low': '🟢'
    };
    
    return emojiMap[priority?.toLowerCase()] || '⚪';
});

// Task type emoji helper
Handlebars.registerHelper('taskTypeEmoji', function(type) {
    const emojiMap = {
        'in_person_meeting': '👥',
        'virtual_meeting': '💻',
        'phone_call': '📱',
        'email': '📧',
        'document': '📄',
        'research': '🔍',
        'development': '💻',
        'design': '🎨',
        'review': '👀',
        'installation': '🔧',
        'repair': '🛠️',
        'maintenance': '🔩',
        'inspection': '🔍',
        'consultation': '💬',
        'delivery': '📦',
        'meeting': '👥',
        'training': '📚',
        'other': '📝'
    };
    
    return emojiMap[type?.toLowerCase()] || '📋';
});

// Progress bar helper
Handlebars.registerHelper('progressBar', function(progress, width) {
    const percentage = Math.min(Math.max(progress || 0, 0), 100);
    const barWidth = width || '100%';
    
    return new Handlebars.SafeString(
        `<div style="background: #e5e7eb; border-radius: 8px; overflow: hidden; width: ${barWidth}; height: 8px;">
            <div style="background: #A855F7; height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
        </div>`
    );
});

// Uppercase helper
Handlebars.registerHelper('upper', function(str) {
    return str ? str.toString().toUpperCase() : '';
});

// Lowercase helper
Handlebars.registerHelper('lower', function(str) {
    return str ? str.toString().toLowerCase() : '';
});

// Capitalize helper
Handlebars.registerHelper('capitalize', function(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
});

// Replace helper
Handlebars.registerHelper('replace', function(str, search, replace) {
    if (!str) return '';
    return str.toString().replace(new RegExp(search, 'g'), replace);
});

// Math helpers
Handlebars.registerHelper('add', function(a, b) {
    return (a || 0) + (b || 0);
});

Handlebars.registerHelper('subtract', function(a, b) {
    return (a || 0) - (b || 0);
});

// Phone number formatting helper for tel: links
Handlebars.registerHelper('formatPhoneForTel', function(phone) {
    if (!phone) return '';
    // Remove all spaces, dashes, and parentheses for tel: links
    return phone.toString().replace(/[\s\-\(\)]/g, '');
});

Handlebars.registerHelper('multiply', function(a, b) {
    return (a || 0) * (b || 0);
});

Handlebars.registerHelper('divide', function(a, b) {
    return b !== 0 ? (a || 0) / b : 0;
});

module.exports = {}; 