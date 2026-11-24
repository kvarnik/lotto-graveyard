/**
 * Historical Analysis Module
 * Queries historical Powerball data and calculates statistics
 * 
 * Features:
 * - Loads historical Powerball drawing data using DataLoader
 * - Finds exact matches (all 5 white balls + powerball)
 * - Calculates match counts for each drawing
 * - Identifies closest near-miss (maximum total matches)
 * - Determines date range of historical data
 * - Calculates frequency statistics for past year
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 * 
 * Usage:
 *   const analysis = new HistoricalAnalysis();
 *   await analysis.loadData();
 *   const result = analysis.analyze({ whiteBalls: [1,2,3,4,5], powerball: 10 });
 */

class HistoricalAnalysis {
    constructor() {
        this.dataLoader = new DataLoader();
        this.drawings = [];
        this.loaded = false;
        this.lastUpdated = null;
    }
    
    /**
     * Load historical data using DataLoader
     * @returns {Promise<void>}
     * @throws {Error} If data fails to load
     */
    async loadData() {
        try {
            const data = await this.dataLoader.loadHistoricalData();
            this.drawings = data.drawings;
            this.lastUpdated = data.lastUpdated;
            this.loaded = true;
            console.log(`Loaded ${this.drawings.length} historical drawings`);
        } catch (error) {
            console.error('Failed to load historical data:', error);
            this.loaded = false;
            throw error;
        }
    }
    
    /**
     * Analyze lottery numbers against historical data
     * @param {Object} lotteryNumbers - { whiteBalls: number[], powerball: number }
     * @returns {Object} AnalysisResult
     * @throws {Error} If data not loaded or invalid input
     */
    analyze(lotteryNumbers) {
        if (!this.loaded) {
            throw new Error('Historical data not loaded. Call loadData() first.');
        }
        
        if (!lotteryNumbers || !lotteryNumbers.whiteBalls || !lotteryNumbers.powerball) {
            throw new Error('Invalid lottery numbers format');
        }
        
        // Find exact match (all 5 white + powerball)
        const exactMatch = this._findExactMatch(lotteryNumbers);
        
        // Find closest near-miss
        const closestMatch = this._findClosestMatch(lotteryNumbers);
        
        // Determine date range
        const dateRange = this._getDateRange();
        
        // Calculate frequency for past year
        const frequency = this._calculateFrequency(lotteryNumbers);
        
        return {
            numbers: lotteryNumbers,
            exactMatch,
            closestMatch,
            dateRange,
            frequency,
            totalDrawings: this.drawings.length
        };
    }
    
    /**
     * Get data loading status
     * @returns {Object} Status information
     */
    getDataStatus() {
        return {
            loaded: this.loaded,
            lastUpdated: this.lastUpdated,
            drawingsCount: this.drawings.length
        };
    }
    
    /**
     * Find exact match where all numbers match
     * @private
     * @param {Object} lotteryNumbers - { whiteBalls: number[], powerball: number }
     * @returns {Object|null} Drawing object or null if no match
     */
    _findExactMatch(lotteryNumbers) {
        for (const drawing of this.drawings) {
            if (this._isExactMatch(drawing, lotteryNumbers)) {
                return drawing;
            }
        }
        return null;
    }
    
    /**
     * Check if drawing is exact match (all 5 white balls + powerball)
     * @private
     * @param {Object} drawing - Drawing object
     * @param {Object} lotteryNumbers - { whiteBalls: number[], powerball: number }
     * @returns {boolean} True if exact match
     */
    _isExactMatch(drawing, lotteryNumbers) {
        // Check powerball first (faster fail)
        if (drawing.powerball !== lotteryNumbers.powerball) {
            return false;
        }
        
        // Check all white balls match
        const drawingSet = new Set(drawing.whiteBalls);
        return lotteryNumbers.whiteBalls.every(ball => drawingSet.has(ball));
    }
    
    /**
     * Find closest match (maximum total matches)
     * @private
     * @param {Object} lotteryNumbers - { whiteBalls: number[], powerball: number }
     * @returns {Object} { drawing, whiteMatches, powerballMatch }
     */
    _findClosestMatch(lotteryNumbers) {
        let best = {
            drawing: null,
            whiteMatches: 0,
            powerballMatch: false
        };
        
        for (const drawing of this.drawings) {
            const whiteMatches = this._countWhiteBallMatches(drawing.whiteBalls, lotteryNumbers.whiteBalls);
            const powerballMatch = drawing.powerball === lotteryNumbers.powerball;
            
            // Calculate total score
            const totalScore = whiteMatches + (powerballMatch ? 1 : 0);
            const bestScore = best.whiteMatches + (best.powerballMatch ? 1 : 0);
            
            // Update best if this drawing is better
            if (totalScore > bestScore) {
                best = {
                    drawing,
                    whiteMatches,
                    powerballMatch
                };
            }
        }
        
        return best;
    }
    
    /**
     * Count how many white balls match between two sets
     * @private
     * @param {number[]} drawingBalls - White balls from drawing
     * @param {number[]} lotteryBalls - User's white balls
     * @returns {number} Count of matches (0-5)
     */
    _countWhiteBallMatches(drawingBalls, lotteryBalls) {
        const drawingSet = new Set(drawingBalls);
        let matches = 0;
        
        for (const ball of lotteryBalls) {
            if (drawingSet.has(ball)) {
                matches++;
            }
        }
        
        return matches;
    }
    
    /**
     * Get date range of historical data
     * @private
     * @returns {Object} { earliest: string, latest: string }
     */
    _getDateRange() {
        if (this.drawings.length === 0) {
            return { earliest: null, latest: null };
        }
        
        // Drawings are sorted newest first, so:
        // - First drawing is latest
        // - Last drawing is earliest
        return {
            earliest: this.drawings[this.drawings.length - 1].drawDate,
            latest: this.drawings[0].drawDate
        };
    }
    
    /**
     * Calculate frequency of lottery numbers in past year
     * @private
     * @param {Object} lotteryNumbers - { whiteBalls: number[], powerball: number }
     * @returns {Object} { whiteBalls: { [number]: count }, powerball: count }
     */
    _calculateFrequency(lotteryNumbers) {
        // Get drawings from past year
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        const pastYearDrawings = this.drawings.filter(drawing => {
            const drawDate = new Date(drawing.drawDate);
            return drawDate >= oneYearAgo;
        });
        
        // Initialize frequency counters
        const frequency = {
            whiteBalls: {},
            powerball: 0
        };
        
        // Initialize white ball counts to 0
        lotteryNumbers.whiteBalls.forEach(ball => {
            frequency.whiteBalls[ball] = 0;
        });
        
        // Count occurrences in past year
        for (const drawing of pastYearDrawings) {
            // Count white ball matches
            lotteryNumbers.whiteBalls.forEach(ball => {
                if (drawing.whiteBalls.includes(ball)) {
                    frequency.whiteBalls[ball]++;
                }
            });
            
            // Count powerball matches
            if (drawing.powerball === lotteryNumbers.powerball) {
                frequency.powerball++;
            }
        }
        
        return frequency;
    }
}

// Make class available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HistoricalAnalysis;
}
