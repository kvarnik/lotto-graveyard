/**
 * Tombstone Renderer
 * Displays lottery numbers and analysis results in Rider-Waite themed tombstone graphic
 * 
 * Features:
 * - Generates mystical epitaph text based on historical analysis
 * - Formats lottery numbers prominently
 * - Includes win status, closest match, date range, and frequency statistics
 * - Multiple epitaph variations for variety
 * - 1909 Rider-Waite graveyard-themed language
 * 
 * Requirements: 4.3, 4.4, 4.5, 4.6, 4.7
 * 
 * Usage:
 *   const renderer = new TombstoneRenderer();
 *   const epitaph = renderer.generateEpitaph(analysisResult);
 *   renderer.render(analysisResult, containerElement);
 */

class TombstoneRenderer {
    constructor() {
        // Mystical opening phrases for variety
        this.openingPhrases = [
            'Here lie the numbers',
            'In this sacred ground rest',
            'Beneath this stone slumber',
            'Within this hallowed vault dwell',
            'Entombed herein are'
        ];
        
        // Win declaration variations
        this.winPhrases = [
            'These blessed numbers DID PREVAIL',
            'Victory was claimed by these digits',
            'Fortune smiled upon these numbers',
            'These numbers ACHIEVED TRIUMPH',
            'Glory was bestowed upon this combination'
        ];
        
        // Never-won phrases
        this.neverWonPhrases = [
            'Alas, these numbers never claimed the grand prize',
            'The jackpot remained forever beyond their grasp',
            'Victory eluded these numbers throughout time',
            'These digits never ascended to triumph',
            'The fates never granted these numbers their crowning glory'
        ];
        
        // Near-miss introductions
        this.nearMissPhrases = [
            'Their closest brush with destiny:',
            'The nearest they approached greatness:',
            'Their most favorable alignment:',
            'When fortune nearly smiled:',
            'Their peak convergence with fate:'
        ];
    }
    
    /**
     * Render tombstone with analysis results
     * @param {Object} analysisResult - Result from HistoricalAnalysis.analyze()
     * @param {HTMLElement} containerElement - DOM element to render into
     */
    render(analysisResult, containerElement) {
        if (!analysisResult || !containerElement) {
            throw new Error('Invalid arguments: analysisResult and containerElement required');
        }
        
        // Generate epitaph text
        const epitaph = this.generateEpitaph(analysisResult);
        
        // Create tombstone HTML structure
        const tombstoneHTML = `
            <div class="tombstone">
                <div class="tombstone-header">
                    <h3>Here Lie These Numbers</h3>
                </div>
                <div class="tombstone-numbers" role="text" aria-label="Lottery numbers: ${analysisResult.numbers.whiteBalls.join(', ')} and Powerball ${analysisResult.numbers.powerball}">
                    <span class="white-balls">${analysisResult.numbers.whiteBalls.join(' · ')}</span>
                    <span class="powerball" aria-label="Powerball">${analysisResult.numbers.powerball}</span>
                </div>
                <div class="tombstone-epitaph" role="article" aria-label="Historical analysis">${this._escapeHtml(epitaph)}</div>
            </div>
        `;
        
        // Clear container and insert tombstone
        containerElement.innerHTML = tombstoneHTML;
    }
    
    /**
     * Generate epitaph text from analysis results
     * Uses mystical/graveyard-themed language fitting 1909 Rider-Waite aesthetic
     * @param {Object} analysisResult - Result from HistoricalAnalysis.analyze()
     * @returns {string} Formatted epitaph text
     */
    generateEpitaph(analysisResult) {
        if (!analysisResult || !analysisResult.numbers) {
            throw new Error('Invalid analysis result');
        }
        
        const { numbers, exactMatch, closestMatch, dateRange, frequency, totalDrawings } = analysisResult;
        
        // Select random variations for variety
        const opening = this._selectRandom(this.openingPhrases);
        const nearMissIntro = this._selectRandom(this.nearMissPhrases);
        
        let epitaph = '';
        
        // Opening with numbers prominently displayed
        epitaph += `${opening}\n\n`;
        epitaph += `${this._formatNumbers(numbers)}\n\n`;
        epitaph += this._decorativeDivider() + '\n\n';
        
        // Win status - exact match or never won
        if (exactMatch) {
            const winPhrase = this._selectRandom(this.winPhrases);
            epitaph += `${winPhrase}\n`;
            epitaph += `upon the fateful date of ${this._formatDate(exactMatch.drawDate)}.\n\n`;
        } else {
            const neverWonPhrase = this._selectRandom(this.neverWonPhrases);
            epitaph += `${neverWonPhrase}.\n\n`;
        }
        
        // Closest match statistics
        if (closestMatch && closestMatch.drawing) {
            epitaph += `${nearMissIntro}\n`;
            epitaph += this._formatClosestMatch(closestMatch);
            epitaph += '\n\n';
        }
        
        // Date range analyzed
        epitaph += `Examined across ${this._formatDateRange(dateRange, totalDrawings)}.\n\n`;
        
        // Frequency statistics for past year
        epitaph += this._formatFrequency(numbers, frequency);
        
        return epitaph;
    }
    
    /**
     * Format lottery numbers prominently
     * @private
     * @param {Object} numbers - { whiteBalls: number[], powerball: number }
     * @returns {string} Formatted numbers
     */
    _formatNumbers(numbers) {
        const whiteBallsStr = numbers.whiteBalls.join(' · ');
        return `⟨ ${whiteBallsStr} ⟩  ✦  ⟨ ${numbers.powerball} ⟩`;
    }
    
    /**
     * Format closest match details
     * @private
     * @param {Object} closestMatch - { drawing, whiteMatches, powerballMatch }
     * @returns {string} Formatted closest match
     */
    _formatClosestMatch(closestMatch) {
        const { drawing, whiteMatches, powerballMatch } = closestMatch;
        
        let matchText = '';
        
        // Describe white ball matches
        if (whiteMatches === 0) {
            matchText = 'No white spheres aligned';
        } else if (whiteMatches === 1) {
            matchText = 'A single white sphere aligned';
        } else {
            matchText = `${this._numberToWord(whiteMatches)} white spheres aligned`;
        }
        
        // Add powerball match if applicable
        if (powerballMatch) {
            matchText += ', and the crimson sphere matched';
        }
        
        // Add date
        matchText += `\non ${this._formatDate(drawing.drawDate)}`;
        
        return matchText;
    }
    
    /**
     * Format date range with total drawings
     * @private
     * @param {Object} dateRange - { earliest: string, latest: string }
     * @param {number} totalDrawings - Total number of drawings analyzed
     * @returns {string} Formatted date range
     */
    _formatDateRange(dateRange, totalDrawings) {
        const earliest = this._formatDate(dateRange.earliest);
        const latest = this._formatDate(dateRange.latest);
        const drawingsText = totalDrawings === 1 ? 'drawing' : 'drawings';
        
        return `${totalDrawings} ${drawingsText}, from ${earliest} to ${latest}`;
    }
    
    /**
     * Format frequency statistics for past year
     * @private
     * @param {Object} numbers - { whiteBalls: number[], powerball: number }
     * @param {Object} frequency - { whiteBalls: { [number]: count }, powerball: count }
     * @returns {string} Formatted frequency text
     */
    _formatFrequency(numbers, frequency) {
        let text = '𝔉𝔯𝔢𝔮𝔲𝔢𝔫𝔠𝔶 𝔦𝔫 𝔱𝔥𝔢 𝔓𝔞𝔰𝔱 𝔜𝔢𝔞𝔯:\n\n';
        
        // White balls frequency
        numbers.whiteBalls.forEach(ball => {
            const count = frequency.whiteBalls[ball];
            const timesText = this._formatTimesText(count);
            text += `  White sphere ${ball}: ${timesText}\n`;
        });
        
        // Powerball frequency
        const powerballCount = frequency.powerball;
        const powerballTimesText = this._formatTimesText(powerballCount);
        text += `  Crimson sphere ${numbers.powerball}: ${powerballTimesText}\n`;
        
        return text;
    }
    
    /**
     * Format date in mystical style
     * @private
     * @param {string} dateStr - ISO date string (YYYY-MM-DD)
     * @returns {string} Formatted date
     */
    _formatDate(dateStr) {
        if (!dateStr) return 'Unknown';
        
        // Parse ISO date string (YYYY-MM-DD) correctly
        // Adding 'T00:00:00' ensures consistent parsing across timezones
        const date = new Date(dateStr + 'T00:00:00');
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        // Add ordinal suffix (st, nd, rd, th)
        const ordinal = this._getOrdinal(day);
        
        return `the ${day}${ordinal} of ${month}, ${year}`;
    }
    
    /**
     * Get ordinal suffix for day
     * @private
     * @param {number} day - Day of month
     * @returns {string} Ordinal suffix (st, nd, rd, th)
     */
    _getOrdinal(day) {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }
    
    /**
     * Format "X times" text with mystical language
     * @private
     * @param {number} count - Frequency count
     * @returns {string} Formatted text
     */
    _formatTimesText(count) {
        if (count === 0) {
            return 'appeared not at all';
        } else if (count === 1) {
            return 'appeared but once';
        } else if (count === 2) {
            return 'appeared twice';
        } else if (count === 3) {
            return 'appeared thrice';
        } else {
            return `appeared ${count} times`;
        }
    }
    
    /**
     * Convert number to word (for match counts)
     * @private
     * @param {number} num - Number to convert (0-5)
     * @returns {string} Word representation
     */
    _numberToWord(num) {
        const words = ['zero', 'one', 'two', 'three', 'four', 'five'];
        return words[num] || num.toString();
    }
    
    /**
     * Create decorative divider
     * @private
     * @returns {string} Decorative divider
     */
    _decorativeDivider() {
        return '✦ ═══════════════ ✦';
    }
    
    /**
     * Select random element from array
     * Uses lottery numbers as seed for deterministic selection (future enhancement)
     * @private
     * @param {Array} array - Array to select from
     * @returns {*} Random element
     */
    _selectRandom(array) {
        // For now, use true randomness for variety
        // Future: could make deterministic based on lottery numbers
        const index = Math.floor(Math.random() * array.length);
        return array[index];
    }
    
    /**
     * Escape HTML to prevent XSS
     * @private
     * @param {string} text - Text to escape
     * @returns {string} Escaped HTML-safe text
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Make class available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TombstoneRenderer;
}
