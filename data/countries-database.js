// data/countries-database.js - Country dropdown and metadata
export const countriesDatabase = {
  // Main dropdown list - ~50 major travel destinations
  dropdownList: [
    // Europe (Major destinations)
    { code: 'AT', name: 'Austria', region: 'Europe' },
    { code: 'BE', name: 'Belgium', region: 'Europe' },
    { code: 'BG', name: 'Bulgaria', region: 'Europe' },
    { code: 'HR', name: 'Croatia', region: 'Europe' },
    { code: 'CZ', name: 'Czech Republic', region: 'Europe' },
    { code: 'DK', name: 'Denmark', region: 'Europe' },
    { code: 'EE', name: 'Estonia', region: 'Europe' },
    { code: 'FI', name: 'Finland', region: 'Europe' },
    { code: 'FR', name: 'France', region: 'Europe' },
    { code: 'DE', name: 'Germany', region: 'Europe' },
    { code: 'GR', name: 'Greece', region: 'Europe' },
    { code: 'HU', name: 'Hungary', region: 'Europe' },
    { code: 'IS', name: 'Iceland', region: 'Europe' },
    { code: 'IE', name: 'Ireland', region: 'Europe' },
    { code: 'IT', name: 'Italy', region: 'Europe' },
    { code: 'LV', name: 'Latvia', region: 'Europe' },
    { code: 'LT', name: 'Lithuania', region: 'Europe' },
    { code: 'LU', name: 'Luxembourg', region: 'Europe' },
    { code: 'MT', name: 'Malta', region: 'Europe' },
    { code: 'NL', name: 'Netherlands', region: 'Europe' },
    { code: 'NO', name: 'Norway', region: 'Europe' },
    { code: 'PL', name: 'Poland', region: 'Europe' },
    { code: 'PT', name: 'Portugal', region: 'Europe' },
    { code: 'RO', name: 'Romania', region: 'Europe' },
    { code: 'SK', name: 'Slovakia', region: 'Europe' },
    { code: 'SI', name: 'Slovenia', region: 'Europe' },
    { code: 'ES', name: 'Spain', region: 'Europe' },
    { code: 'SE', name: 'Sweden', region: 'Europe' },
    { code: 'CH', name: 'Switzerland', region: 'Europe' },
    { code: 'GB', name: 'United Kingdom', region: 'Europe' },
    
    // North America
    { code: 'CA', name: 'Canada', region: 'North America' },
    { code: 'MX', name: 'Mexico', region: 'North America' },
    { code: 'US', name: 'United States', region: 'North America' },
    
    // Asia Pacific (Major destinations)
    { code: 'AU', name: 'Australia', region: 'Asia Pacific' },
    { code: 'CN', name: 'China', region: 'Asia Pacific' },
    { code: 'HK', name: 'Hong Kong', region: 'Asia Pacific' },
    { code: 'IN', name: 'India', region: 'Asia Pacific' },
    { code: 'ID', name: 'Indonesia', region: 'Asia Pacific' },
    { code: 'JP', name: 'Japan', region: 'Asia Pacific' },
    { code: 'MY', name: 'Malaysia', region: 'Asia Pacific' },
    { code: 'NZ', name: 'New Zealand', region: 'Asia Pacific' },
    { code: 'PH', name: 'Philippines', region: 'Asia Pacific' },
    { code: 'SG', name: 'Singapore', region: 'Asia Pacific' },
    { code: 'KR', name: 'South Korea', region: 'Asia Pacific' },
    { code: 'TW', name: 'Taiwan', region: 'Asia Pacific' },
    { code: 'TH', name: 'Thailand', region: 'Asia Pacific' },
    { code: 'VN', name: 'Vietnam', region: 'Asia Pacific' },
    
    // Middle East & Africa (Major business/tourist hubs)
    { code: 'EG', name: 'Egypt', region: 'Middle East & Africa' },
    { code: 'IL', name: 'Israel', region: 'Middle East & Africa' },
    { code: 'JO', name: 'Jordan', region: 'Middle East & Africa' },
    { code: 'KE', name: 'Kenya', region: 'Middle East & Africa' },
    { code: 'MA', name: 'Morocco', region: 'Middle East & Africa' },
    { code: 'ZA', name: 'South Africa', region: 'Middle East & Africa' },
    { code: 'AE', name: 'United Arab Emirates', region: 'Middle East & Africa' },
    
    // South America (Major destinations)
    { code: 'AR', name: 'Argentina', region: 'South America' },
    { code: 'BR', name: 'Brazil', region: 'South America' },
    { code: 'CL', name: 'Chile', region: 'South America' },
    { code: 'CO', name: 'Colombia', region: 'South America' },
    { code: 'PE', name: 'Peru', region: 'South America' }
  ],

  // Country metadata for enhanced functionality
  countryMetadata: {
    // European countries
    'AT': {
      timezone: 'Europe/Vienna',
      currency: 'EUR',
      currencySymbol: '€',
      language: 'German',
      emergency: '112',
      drivingSide: 'right',
      electricalPlug: 'C/F'
    },
    'BE': {
      timezone: 'Europe/Brussels',
      currency: 'EUR',
      currencySymbol: '€',
      language: 'Dutch/French',
      emergency: '112',
      drivingSide: 'right',
      electricalPlug: 'C/E'
    },
    'FR': {
      timezone: 'Europe/Paris',
      currency: 'EUR',
      currencySymbol: '€',
      language: 'French',
      emergency: '112',
      drivingSide: 'right',
      electricalPlug: 'C/E'
    },
    'DE': {
      timezone: 'Europe/Berlin',
      currency: 'EUR',
      currencySymbol: '€',
      language: 'German',
      emergency: '112',
      drivingSide: 'right',
      electricalPlug: 'C/F'
    },
    'GR': {
      timezone: 'Europe/Athens',
      currency: 'EUR',
      currencySymbol: '€',
      language: 'Greek',
      emergency: '112',
      drivingSide: 'right',
      electricalPlug: 'C/F'
    },
    'IT': {
      timezone: 'Europe/Rome',
      currency: 'EUR',
      currencySymbol: '€',
      language: 'Italian',
      emergency: '112',
      drivingSide: 'right',
      electricalPlug: 'C/F/L'
    },
    'ES': {
      timezone: 'Europe/Madrid',
      currency: 'EUR',
      currencySymbol: '€',
      language: 'Spanish',
      emergency: '112',
      drivingSide: 'right',
      electricalPlug: 'C/F'
    },
    'GB': {
      timezone: 'Europe/London',
      currency: 'GBP',
      currencySymbol: '£',
      language: 'English',
      emergency: '999',
      drivingSide: 'left',
      electricalPlug: 'G'
    },
    'IE': {
  timezone: 'Europe/Dublin',
  currency: 'EUR',
  currencySymbol: '€',
  language: 'English',
  emergency: '999',
  drivingSide: 'left',
  electricalPlug: 'G'
},
    'NL': {
      timezone: 'Europe/Amsterdam',
      currency: 'EUR',
      currencySymbol: '€',
      language: 'Dutch',
      emergency: '112',
      drivingSide: 'right',
      electricalPlug: 'C/F'
    },
    'CH': {
      timezone: 'Europe/Zurich',
      currency: 'CHF',
      currencySymbol: 'Fr',
      language: 'German/French/Italian',
      emergency: '112',
      drivingSide: 'right',
      electricalPlug: 'C/J'
    },
    
    // North America
    'US': {
      timezone: 'America/New_York', // Default - varies by region
      currency: 'USD',
      currencySymbol: '$',
      language: 'English',
      emergency: '911',
      drivingSide: 'right',
      electricalPlug: 'A/B'
    },
    'CA': {
      timezone: 'America/Toronto', // Default - varies by region  
      currency: 'CAD',
      currencySymbol: 'C$',
      language: 'English/French',
      emergency: '911',
      drivingSide: 'right',
      electricalPlug: 'A/B'
    },
    'MX': {
      timezone: 'America/Mexico_City',
      currency: 'MXN',
      currencySymbol: '$',
      language: 'Spanish',
      emergency: '911',
      drivingSide: 'right',
      electricalPlug: 'A/B'
    },
    
    // Asia Pacific
    'JP': {
      timezone: 'Asia/Tokyo',
      currency: 'JPY',
      currencySymbol: '¥',
      language: 'Japanese',
      emergency: '119',
      drivingSide: 'left',
      electricalPlug: 'A/B'
    },
    'AU': {
      timezone: 'Australia/Sydney', // Default - varies by region
      currency: 'AUD',
      currencySymbol: 'A$',
      language: 'English',
      emergency: '000',
      drivingSide: 'left',
      electricalPlug: 'I'
    },
    'SG': {
      timezone: 'Asia/Singapore',
      currency: 'SGD',
      currencySymbol: 'S$',
      language: 'English/Mandarin/Malay/Tamil',
      emergency: '999',
      drivingSide: 'left',
      electricalPlug: 'G'
    },
    'TH': {
      timezone: 'Asia/Bangkok',
      currency: 'THB',
      currencySymbol: '฿',
      language: 'Thai',
      emergency: '191',
      drivingSide: 'left',
      electricalPlug: 'A/B/C'
    }
  },

  // Helper functions
  getCountryByCode(code) {
    return this.dropdownList.find(country => country.code === code);
  },

  getCountryMetadata(code) {
    return this.countryMetadata[code] || {
      timezone: 'UTC',
      currency: 'USD',
      currencySymbol: '$',
      language: 'Local Language',
      emergency: '112',
      drivingSide: 'right',
      electricalPlug: 'Unknown'
    };
  },

  getCountriesByRegion(region) {
    return this.dropdownList.filter(country => country.region === region);
  },

  // For the dropdown component
  getDropdownOptions() {
    return this.dropdownList.map(country => ({
      value: country.code,
      label: country.name,
      region: country.region
    }));
  },

  // Grouped for better UX
  getGroupedDropdownOptions() {
    const grouped = {};
    this.dropdownList.forEach(country => {
      if (!grouped[country.region]) {
        grouped[country.region] = [];
      }
      grouped[country.region].push({
        value: country.code,
        label: country.name
      });
    });
    return grouped;
  }
};
