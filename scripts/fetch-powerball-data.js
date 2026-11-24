/**
 * Powerball Data Fetcher
 * 
 * Fetches latest Powerball drawing results from NY Open Data API
 * and updates the historical data file.
 * 
 * Data Source: NY State Open Data Portal
 * API: https://data.ny.gov/resource/d6yy-54nr.json
 * 
 * Features:
 * - Fetches Powerball results from January 2015 onwards
 * - Transforms data to application schema
 * - Sorts white balls ascending
 * - Sorts drawings by date (newest first)
 * - Handles network errors gracefully
 * - Validates data format
 * - Only writes if data has changed
 * 
 * Exit Codes:
 * - 0: Success
 * - 1: Network error or data fetch failure
 * - 2: Data validation error
 * - 3: File write error
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Minimum date for historical data (January 1, 2015)
const MIN_DATE = '2015-01-01';

/**
 * Fetches Powerball data from NY Open Data API
 * @returns {Promise<Array>} Raw API response data
 */
async function fetchFromAPI() {
    const API_URL = 'https://data.ny.gov/resource/d6yy-54nr.json';
    // Fetch large dataset with pagination, filtered by date
    const LIMIT = 10000; // NY Open Data default max
    const url = `${API_URL}?$limit=${LIMIT}&$where=draw_date>='${MIN_DATE}'&$order=draw_date DESC`;
    
    console.log(`Fetching records from ${MIN_DATE} onwards...`);
    
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                return;
            }
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (error) {
                    reject(new Error(`JSON parse error: ${error.message}`));
                }
            });
        }).on('error', (error) => {
            reject(new Error(`Network error: ${error.message}`));
        });
    });
}

/**
 * Parses winning numbers string into array
 * Format: "05 29 33 36 45 22" -> [5, 29, 33, 36, 45] + 22
 * @param {string} numbersStr - Space-separated numbers
 * @returns {Object} { whiteBalls: number[], powerball: number }
 */
function parseWinningNumbers(numbersStr) {
    const numbers = numbersStr.trim().split(/\s+/).map(n => parseInt(n, 10));
    
    if (numbers.length !== 6) {
        throw new Error(`Invalid number count: expected 6, got ${numbers.length}`);
    }
    
    // First 5 numbers are white balls, last is Powerball
    const whiteBalls = numbers.slice(0, 5).sort((a, b) => a - b);
    const powerball = numbers[5];
    
    return { whiteBalls, powerball };
}

/**
 * Validates a single drawing record
 * @param {Object} drawing - Drawing record to validate
 * @throws {Error} If validation fails
 */
function validateDrawing(drawing) {
    if (!drawing.drawDate || typeof drawing.drawDate !== 'string') {
        throw new Error('Missing or invalid drawDate');
    }
    
    if (!Array.isArray(drawing.whiteBalls) || drawing.whiteBalls.length !== 5) {
        throw new Error('Invalid whiteBalls: must be array of 5 numbers');
    }
    
    for (const ball of drawing.whiteBalls) {
        if (!Number.isInteger(ball) || ball < 1 || ball > 69) {
            throw new Error(`Invalid white ball: ${ball} (must be 1-69)`);
        }
    }
    
    // Check white balls are unique
    const uniqueBalls = new Set(drawing.whiteBalls);
    if (uniqueBalls.size !== 5) {
        throw new Error('White balls must be unique');
    }
    
    if (!Number.isInteger(drawing.powerball) || drawing.powerball < 1 || drawing.powerball > 26) {
        throw new Error(`Invalid powerball: ${drawing.powerball} (must be 1-26)`);
    }
}

/**
 * Transforms raw API data to application schema
 * Filters out records before January 2015
 * @param {Array} rawData - Raw API response
 * @returns {Array} Transformed drawings
 */
function transformData(rawData) {
    const drawings = [];
    const minDate = new Date(MIN_DATE);
    
    for (const record of rawData) {
        try {
            // Parse date (format: "2026-11-21T00:00:00.000")
            const drawDate = record.draw_date.split('T')[0]; // Extract YYYY-MM-DD
            
            // Filter out records before MIN_DATE
            const recordDate = new Date(drawDate);
            if (recordDate < minDate) {
                continue; // Skip this record
            }
            
            // Parse winning numbers
            const { whiteBalls, powerball } = parseWinningNumbers(record.winning_numbers);
            
            // Create drawing record
            const drawing = {
                drawDate,
                whiteBalls,
                powerball,
                // Note: NY Open Data doesn't include jackpot amounts
                // We could enhance this later by cross-referencing another source
                jackpot: null
            };
            
            // Validate before adding
            validateDrawing(drawing);
            
            drawings.push(drawing);
        } catch (error) {
            console.warn(`Skipping invalid record (${record.draw_date}): ${error.message}`);
            // Continue processing other records
        }
    }
    
    return drawings;
}

/**
 * Checks if new data differs from existing data
 * @param {string} filePath - Path to existing data file
 * @param {Object} newData - New data to compare
 * @returns {boolean} True if data has changed
 */
function hasDataChanged(filePath, newData) {
    if (!fs.existsSync(filePath)) {
        return true; // No existing file, definitely changed
    }
    
    try {
        const existingContent = fs.readFileSync(filePath, 'utf8');
        const existingData = JSON.parse(existingContent);
        
        // Compare drawing counts
        if (existingData.totalDrawings !== newData.totalDrawings) {
            return true;
        }
        
        // Compare most recent drawing date
        if (existingData.drawings.length > 0 && newData.drawings.length > 0) {
            const existingLatest = existingData.drawings[0].drawDate;
            const newLatest = newData.drawings[0].drawDate;
            if (existingLatest !== newLatest) {
                return true;
            }
        }
        
        return false; // No meaningful changes detected
    } catch (error) {
        console.warn(`Error reading existing file: ${error.message}`);
        return true; // If we can't read existing file, assume changed
    }
}

/**
 * Main function to fetch and update Powerball data
 */
async function fetchPowerballData() {
    console.log('Starting Powerball data fetch...');
    console.log('Source: NY State Open Data Portal');
    console.log(`Filtering: Records from ${MIN_DATE} onwards`);
    
    try {
        // 1. Fetch raw data from API
        console.log('Fetching data from API...');
        const rawData = await fetchFromAPI();
        console.log(`Received ${rawData.length} records from API`);
        
        if (rawData.length === 0) {
            console.error('Error: API returned no data');
            process.exit(1);
        }
        
        // 2. Transform data to our schema (with date filtering)
        console.log('Transforming data...');
        const drawings = transformData(rawData);
        console.log(`Successfully transformed ${drawings.length} drawings (${MIN_DATE} onwards)`);
        
        if (drawings.length === 0) {
            console.error('Error: No valid drawings after transformation');
            process.exit(2);
        }
        
        // 3. Sort by date (newest first)
        drawings.sort((a, b) => new Date(b.drawDate) - new Date(a.drawDate));
        
        // 4. Prepare output data
        const outputData = {
            lastUpdated: new Date().toISOString(),
            totalDrawings: drawings.length,
            drawings
        };
        
        // 5. Check if data has changed
        const outputPath = path.join(process.cwd(), 'data', 'historical-data.json');
        const hasChanged = hasDataChanged(outputPath, outputData);
        
        if (!hasChanged) {
            console.log('No changes detected - data is up to date');
            console.log(`Total drawings: ${drawings.length}`);
            console.log(`Latest drawing: ${drawings[0].drawDate}`);
            console.log(`Oldest drawing: ${drawings[drawings.length - 1].drawDate}`);
            process.exit(0);
        }
        
        // 6. Write to file
        console.log('Writing updated data to file...');
        try {
            fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
        } catch (error) {
            console.error(`Error writing file: ${error.message}`);
            process.exit(3);
        }
        
        // 7. Success
        console.log(`✓ Successfully updated ${drawings.length} drawings`);
        console.log(`✓ Data written to ${outputPath}`);
        console.log(`✓ Latest drawing: ${drawings[0].drawDate}`);
        console.log(`✓ Oldest drawing: ${drawings[drawings.length - 1].drawDate}`);
        console.log(`✓ Date range: ${drawings[drawings.length - 1].drawDate} to ${drawings[0].drawDate}`);
        
    } catch (error) {
        console.error('Fatal error:', error.message);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    fetchPowerballData();
}

module.exports = { fetchPowerballData };
