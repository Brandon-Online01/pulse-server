import Handlebars from 'handlebars';

// Phone number formatting helper for tel: links
Handlebars.registerHelper('formatPhoneForTel', function(phone: string) {
    if (!phone) return '';
    // Remove all spaces, dashes, and parentheses for tel: links
    return phone.toString().replace(/[\s\-\(\)]/g, '');
});
