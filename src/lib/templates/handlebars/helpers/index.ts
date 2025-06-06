import Handlebars from 'handlebars';

// Phone number formatting helper for tel: links
Handlebars.registerHelper('formatPhoneForTel', function(phone: string) {
    if (!phone) return '';
    // Remove all spaces, dashes, and parentheses for tel: links
    return phone.toString().replace(/[\s\-\(\)]/g, '');
});

// Comparison helpers for conditional rendering
Handlebars.registerHelper('gt', function(a: any, b: any) {
    return Number(a) > Number(b);
});

Handlebars.registerHelper('lt', function(a: any, b: any) {
    return Number(a) < Number(b);
});

Handlebars.registerHelper('gte', function(a: any, b: any) {
    return Number(a) >= Number(b);
});

Handlebars.registerHelper('lte', function(a: any, b: any) {
    return Number(a) <= Number(b);
});

Handlebars.registerHelper('eq', function(a: any, b: any) {
    return a === b;
});

Handlebars.registerHelper('ne', function(a: any, b: any) {
    return a !== b;
});

// String manipulation helpers
Handlebars.registerHelper('substring', function(str: string, start: number, end?: number) {
    if (!str) return '';
    return end !== undefined ? str.substring(start, end) : str.substring(start);
});

Handlebars.registerHelper('startsWith', function(str: string, prefix: string) {
    if (!str || !prefix) return false;
    return str.startsWith(prefix);
});

// Array helpers
Handlebars.registerHelper('length', function(array: any) {
    if (!array) return 0;
    return Array.isArray(array) ? array.length : 0;
});

Handlebars.registerHelper('isEmpty', function(array: any) {
    if (!array) return true;
    return Array.isArray(array) ? array.length === 0 : true;
});
