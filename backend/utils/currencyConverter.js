/**
 * Currency Converter Utility
 * Fetches and caches live exchange rates to standardize 
 * multi-currency transactions into a user's base currency.
 */

// Simple in-memory cache to respect API rate limits
let ratesCache = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

/**
 * Ensures we have fresh exchange rates relative to USD.
 */
async function fetchRates() {
    const now = Date.now();

    // Return cached rates if still valid
    if (ratesCache && (now - lastFetchTime < CACHE_DURATION_MS)) {
        return ratesCache;
    }

    try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();

        if (data && data.rates) {
            ratesCache = data.rates;
            lastFetchTime = now;
            return ratesCache;
        }
    } catch (err) {
        console.error('Failed to fetch exchange rates:', err);
    }

    // Fallback map if API fails
    return ratesCache || { USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.2, CAD: 1.35, AUD: 1.52, JPY: 149.5 };
}

/**
 * Gets the exchange rate from one currency to another.
 * 
 * @param {string} fromCurrency - The ISO code (e.g. 'EUR')
 * @param {string} toCurrency - The ISO code (e.g. 'USD')
 * @returns {Promise<number>} - The multiplier (e.g. 1.08)
 */
export async function getExchangeRate(fromCurrency = 'USD', toCurrency = 'USD') {
    if (fromCurrency === toCurrency) return 1;

    const rates = await fetchRates();

    const rateFrom = rates[fromCurrency?.toUpperCase()] || 1;
    const rateTo = rates[toCurrency?.toUpperCase()] || 1;

    // Formula: (1 / rateFrom) * rateTo 
    // Because the free API gives everything relative to USD
    return rateTo / rateFrom;
}
