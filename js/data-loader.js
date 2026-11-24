/**
 * Data Loader Module
 * Loads historical Powerball data with caching
 * 
 * Features:
 * - Fetches data from /data/historical-data.json with 10-second timeout
 * - Caches data in localStorage for performance
 * - Cache valid per browsing session (invalidated on page refresh in new session)
 * - Validates data format for required fields
 * - Handles fetch errors gracefully with user-friendly messages
 * 
 * Requirements: 11.6, 11.7, 11.10
 * 
 * Usage:
 *   const loader = new DataLoader();
 *   const data = await loader.loadHistoricalData();
 *   // Returns: { lastUpdated, totalDrawings, drawings[] }
 */

class DataLoader {
    constructor() {
        this.dataFilePath = CONFIG.DATA_FILE_PATH;
        this.cacheKey = 'lotto_graveyard_historical_data';
        this.sessionKey = 'lotto_graveyard_session_start';
        this.fetchTimeout = CONFIG.CDN_TIMEOUT_MS;
        
        // Initialize session tracking
        this._initializeSession();
    }
    
    /**
     * Initialize session start timestamp
     * @private
     */
    _initializeSession() {
        if (!sessionStorage.getItem(this.sessionKey)) {
            sessionStorage.setItem(this.sessionKey, Date.now().toString());
        }
    }
    
    /**
     * Load historical data with caching
     * @returns {Promise<Object>} Historical data object with lastUpdated, totalDrawings, drawings[]
     * @throws {Error} If data fails to load
     */
    async loadHistoricalData() {
        try {
            // 1. Check localStorage cache
            const cached = this.getCachedData();
            if (cached && this.isCacheValid(cached)) {
                console.log('Using cached historical data');
                return cached.data;
            }
            
            // 2. Fetch from server with timeout
            console.log('Fetching historical data from server');
            const data = await this._fetchWithTimeout(this.dataFilePath, this.fetchTimeout);
            
            // 3. Validate data format
            this.validateData(data);
            
            // 4. Cache in localStorage
            this.cacheData(data);
            
            return data;
            
        } catch (error) {
            console.error('Failed to load historical data:', error);
            throw new Error(CONFIG.ERROR_MESSAGES.DATA_LOAD_ERROR);
        }
    }
    
    /**
     * Fetch data with timeout
     * @private
     * @param {string} url - URL to fetch
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<Object>} Parsed JSON response
     * @throws {Error} If fetch fails or times out
     */
    async _fetchWithTimeout(url, timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Data fetch timed out after ' + (timeout / 1000) + ' seconds');
            }
            throw error;
        }
    }
    
    /**
     * Get cached data from localStorage
     * @returns {Object|null} Cached data object or null if not found
     */
    getCachedData() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (!cached) {
                return null;
            }
            
            return JSON.parse(cached);
            
        } catch (error) {
            console.error('Error reading cache:', error);
            // Clear corrupted cache
            localStorage.removeItem(this.cacheKey);
            return null;
        }
    }
    
    /**
     * Check if cache is valid for current browsing session
     * @param {Object} cached - Cached data object with timestamp
     * @returns {boolean} True if cache is valid
     */
    isCacheValid(cached) {
        if (!cached || !cached.timestamp) {
            return false;
        }
        
        const sessionStart = sessionStorage.getItem(this.sessionKey);
        if (!sessionStart) {
            return false;
        }
        
        // Cache is valid if it was created after session start
        return cached.timestamp >= parseInt(sessionStart, 10);
    }
    
    /**
     * Cache data in localStorage
     * @param {Object} data - Historical data to cache
     */
    cacheData(data) {
        try {
            const cacheEntry = {
                data: data,
                timestamp: Date.now()
            };
            
            localStorage.setItem(this.cacheKey, JSON.stringify(cacheEntry));
            console.log('Historical data cached successfully');
            
        } catch (error) {
            // localStorage might be full or unavailable
            console.warn('Failed to cache data:', error);
            // Non-fatal - continue without caching
        }
    }
    
    /**
     * Validate data format matches expected schema
     * @param {Object} data - Data to validate
     * @throws {Error} If data format is invalid
     * @returns {boolean} True if valid
     */
    validateData(data) {
        // Check required top-level fields
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format: not an object');
        }
        
        if (!data.lastUpdated || typeof data.lastUpdated !== 'string') {
            throw new Error('Invalid data format: missing or invalid lastUpdated');
        }
        
        if (!Number.isInteger(data.totalDrawings) || data.totalDrawings < 0) {
            throw new Error('Invalid data format: missing or invalid totalDrawings');
        }
        
        if (!Array.isArray(data.drawings)) {
            throw new Error('Invalid data format: drawings must be an array');
        }
        
        // Validate first drawing structure (sample validation)
        if (data.drawings.length > 0) {
            const firstDrawing = data.drawings[0];
            
            if (!firstDrawing.drawDate || typeof firstDrawing.drawDate !== 'string') {
                throw new Error('Invalid drawing format: missing or invalid drawDate');
            }
            
            if (!Array.isArray(firstDrawing.whiteBalls) || firstDrawing.whiteBalls.length !== 5) {
                throw new Error('Invalid drawing format: whiteBalls must be array of 5 numbers');
            }
            
            if (!Number.isInteger(firstDrawing.powerball)) {
                throw new Error('Invalid drawing format: missing or invalid powerball');
            }
        }
        
        return true;
    }
    
    /**
     * Clear cached data (useful for testing or troubleshooting)
     */
    clearCache() {
        localStorage.removeItem(this.cacheKey);
        console.log('Cache cleared');
    }
    
    /**
     * Get cache status for debugging
     * @returns {Object} Cache status information
     */
    getCacheStatus() {
        const cached = this.getCachedData();
        const sessionStart = sessionStorage.getItem(this.sessionKey);
        
        return {
            hasCachedData: cached !== null,
            cacheTimestamp: cached ? new Date(cached.timestamp).toISOString() : null,
            sessionStart: sessionStart ? new Date(parseInt(sessionStart, 10)).toISOString() : null,
            isValid: cached ? this.isCacheValid(cached) : false
        };
    }
}

// Make class available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataLoader;
}
