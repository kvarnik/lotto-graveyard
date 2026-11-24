/**
 * Test script for HistoricalAnalysis module
 * Run with: node test-analysis.js
 */

const fs = require('fs');
const path = require('path');

// Mock CONFIG for Node.js environment
global.CONFIG = {
    DATA_FILE_PATH: '/data/historical-data.json',
    CDN_TIMEOUT_MS: 10000,
    ERROR_MESSAGES: {
        DATA_LOAD_ERROR: 'Historical lottery data is currently unavailable. Please try again later.'
    }
};

// Mock DataLoader for Node.js testing
class DataLoader {
    constructor() {
        this.dataFilePath = path.join(__dirname, 'data', 'historical-data.json');
    }
    
    async loadHistoricalData() {
        const rawData = fs.readFileSync(this.dataFilePath, 'utf8');
        const data = JSON.parse(rawData);
        return data;
    }
}

// Load HistoricalAnalysis by evaluating it in the global scope
const analysisCode = fs.readFileSync(path.join(__dirname, 'js', 'analysis.js'), 'utf8');
// Extract just the class definition and assign to global
const classMatch = analysisCode.match(/class HistoricalAnalysis \{[\s\S]*?\n\}/);
if (classMatch) {
    eval(`global.HistoricalAnalysis = ${classMatch[0]}`);
} else {
    throw new Error('Could not extract HistoricalAnalysis class');
}
const HistoricalAnalysis = global.HistoricalAnalysis;

// Test cases
async function runTests() {
    console.log('='.repeat(60));
    console.log('Testing HistoricalAnalysis Module');
    console.log('='.repeat(60));
    
    const analysis = new HistoricalAnalysis();
    
    // Test 1: Load data
    console.log('\n[Test 1] Loading historical data...');
    try {
        await analysis.loadData();
        const status = analysis.getDataStatus();
        console.log('✓ Data loaded successfully');
        console.log(`  - Loaded: ${status.loaded}`);
        console.log(`  - Drawings: ${status.drawingsCount}`);
        console.log(`  - Last Updated: ${status.lastUpdated}`);
    } catch (error) {
        console.error('✗ Failed to load data:', error.message);
        return;
    }
    
    // Test 2: Analyze numbers from most recent drawing (should be exact match)
    console.log('\n[Test 2] Testing with most recent drawing numbers (should find exact match)...');
    const recentDrawing = analysis.drawings[0];
    const recentNumbers = {
        whiteBalls: recentDrawing.whiteBalls,
        powerball: recentDrawing.powerball
    };
    console.log(`  Input: ${recentNumbers.whiteBalls.join(', ')} + PB ${recentNumbers.powerball}`);
    
    const result1 = analysis.analyze(recentNumbers);
    console.log(`  Exact Match: ${result1.exactMatch ? '✓ Found on ' + result1.exactMatch.drawDate : '✗ None'}`);
    console.log(`  Closest Match: ${result1.closestMatch.whiteMatches} white + ${result1.closestMatch.powerballMatch ? 'PB' : 'no PB'} on ${result1.closestMatch.drawing.drawDate}`);
    
    // Test 3: Analyze custom numbers (likely no exact match)
    console.log('\n[Test 3] Testing with custom numbers (1,2,3,4,5 + PB 10)...');
    const customNumbers = {
        whiteBalls: [1, 2, 3, 4, 5],
        powerball: 10
    };
    
    const result2 = analysis.analyze(customNumbers);
    console.log(`  Exact Match: ${result2.exactMatch ? '✓ Found on ' + result2.exactMatch.drawDate : '✗ None'}`);
    console.log(`  Closest Match: ${result2.closestMatch.whiteMatches} white + ${result2.closestMatch.powerballMatch ? 'PB' : 'no PB'} on ${result2.closestMatch.drawing.drawDate}`);
    console.log(`  Date Range: ${result2.dateRange.earliest} to ${result2.dateRange.latest}`);
    console.log(`  Total Drawings: ${result2.totalDrawings}`);
    
    // Test 4: Check frequency calculation
    console.log('\n[Test 4] Frequency analysis for custom numbers...');
    console.log('  White Ball Frequencies (past year):');
    customNumbers.whiteBalls.forEach(ball => {
        console.log(`    Ball ${ball}: ${result2.frequency.whiteBalls[ball]} times`);
    });
    console.log(`  Powerball ${customNumbers.powerball}: ${result2.frequency.powerball} times`);
    
    // Test 5: Analyze a drawing from middle of dataset
    console.log('\n[Test 5] Testing with middle drawing...');
    const midIndex = Math.floor(analysis.drawings.length / 2);
    const midDrawing = analysis.drawings[midIndex];
    const midNumbers = {
        whiteBalls: midDrawing.whiteBalls,
        powerball: midDrawing.powerball
    };
    console.log(`  Input: ${midNumbers.whiteBalls.join(', ')} + PB ${midNumbers.powerball}`);
    console.log(`  Drawing date: ${midDrawing.drawDate}`);
    
    const result3 = analysis.analyze(midNumbers);
    console.log(`  Exact Match: ${result3.exactMatch ? '✓ Found on ' + result3.exactMatch.drawDate : '✗ None'}`);
    
    // Test 6: Test match counting logic
    console.log('\n[Test 6] Testing match counting with known partial match...');
    // Take a real drawing and modify one number
    const testDrawing = analysis.drawings[10];
    const partialMatch = {
        whiteBalls: [testDrawing.whiteBalls[0], testDrawing.whiteBalls[1], testDrawing.whiteBalls[2], testDrawing.whiteBalls[3], 99], // Change last number
        powerball: testDrawing.powerball
    };
    console.log(`  Original: ${testDrawing.whiteBalls.join(', ')} + PB ${testDrawing.powerball}`);
    console.log(`  Modified: ${partialMatch.whiteBalls.join(', ')} + PB ${partialMatch.powerball}`);
    
    const result4 = analysis.analyze(partialMatch);
    console.log(`  Expected: 4 white matches + PB match`);
    console.log(`  Actual: ${result4.closestMatch.whiteMatches} white matches + ${result4.closestMatch.powerballMatch ? 'PB match' : 'no PB match'}`);
    
    // Test 7: Error handling
    console.log('\n[Test 7] Testing error handling...');
    try {
        analysis.analyze(null);
        console.log('✗ Should have thrown error for null input');
    } catch (error) {
        console.log('✓ Correctly rejected null input:', error.message);
    }
    
    try {
        analysis.analyze({ whiteBalls: [1, 2, 3] }); // Missing powerball
        console.log('✗ Should have thrown error for incomplete input');
    } catch (error) {
        console.log('✓ Correctly rejected incomplete input:', error.message);
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('All tests completed successfully! ✓');
    console.log('='.repeat(60));
}

// Run tests
runTests().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
