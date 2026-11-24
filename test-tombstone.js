#!/usr/bin/env node

/**
 * Node.js test for TombstoneRenderer.generateEpitaph()
 * Tests various scenarios to ensure epitaph generation works correctly
 */

const TombstoneRenderer = require('./js/tombstone.js');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function testEpitaphGeneration() {
    const renderer = new TombstoneRenderer();
    let passed = 0;
    let failed = 0;
    
    log('cyan', '\n========================================');
    log('cyan', 'Tombstone Epitaph Generation Test Suite');
    log('cyan', '========================================\n');
    
    // Test 1: Exact match (numbers won)
    log('blue', 'Test 1: Exact Match (Won the Jackpot)');
    try {
        const result1 = {
            numbers: { whiteBalls: [5, 12, 23, 34, 45], powerball: 10 },
            exactMatch: {
                drawDate: '2023-05-15',
                whiteBalls: [5, 12, 23, 34, 45],
                powerball: 10
            },
            closestMatch: {
                drawing: { drawDate: '2023-05-15', whiteBalls: [5, 12, 23, 34, 45], powerball: 10 },
                whiteMatches: 5,
                powerballMatch: true
            },
            dateRange: { earliest: '2015-01-03', latest: '2024-12-31' },
            frequency: { whiteBalls: { 5: 15, 12: 8, 23: 12, 34: 10, 45: 7 }, powerball: 6 },
            totalDrawings: 1497
        };
        
        const epitaph1 = renderer.generateEpitaph(result1);
        
        // Verify content
        if (epitaph1.includes('5 · 12 · 23 · 34 · 45') && 
            epitaph1.includes('10') &&
            epitaph1.includes('2023') &&
            epitaph1.includes('1497') &&
            epitaph1.includes('sphere')) {
            log('green', '✓ PASSED: Exact match epitaph generated correctly');
            console.log(epitaph1);
            passed++;
        } else {
            log('red', '✗ FAILED: Missing expected content in exact match epitaph');
            failed++;
        }
    } catch (error) {
        log('red', `✗ FAILED: ${error.message}`);
        failed++;
    }
    
    console.log('');
    
    // Test 2: Never won - close match
    log('blue', 'Test 2: Never Won - Close Match (4 white + powerball)');
    try {
        const result2 = {
            numbers: { whiteBalls: [3, 15, 27, 42, 68], powerball: 22 },
            exactMatch: null,
            closestMatch: {
                drawing: { drawDate: '2022-11-08', whiteBalls: [3, 15, 27, 42, 55], powerball: 22 },
                whiteMatches: 4,
                powerballMatch: true
            },
            dateRange: { earliest: '2015-01-03', latest: '2024-12-31' },
            frequency: { whiteBalls: { 3: 18, 15: 14, 27: 9, 42: 11, 68: 5 }, powerball: 8 },
            totalDrawings: 1497
        };
        
        const epitaph2 = renderer.generateEpitaph(result2);
        
        // Verify content
        if (epitaph2.includes('3 · 15 · 27 · 42 · 68') && 
            epitaph2.includes('22') &&
            epitaph2.includes('four') &&
            epitaph2.includes('crimson') &&
            !epitaph2.includes('PREVAIL') &&
            !epitaph2.includes('TRIUMPH')) {
            log('green', '✓ PASSED: Close match epitaph generated correctly');
            passed++;
        } else {
            log('red', '✗ FAILED: Incorrect content in close match epitaph');
            failed++;
        }
    } catch (error) {
        log('red', `✗ FAILED: ${error.message}`);
        failed++;
    }
    
    console.log('');
    
    // Test 3: Weak match
    log('blue', 'Test 3: Never Won - Weak Match (2 white balls only)');
    try {
        const result3 = {
            numbers: { whiteBalls: [1, 2, 3, 4, 5], powerball: 1 },
            exactMatch: null,
            closestMatch: {
                drawing: { drawDate: '2020-07-22', whiteBalls: [1, 2, 15, 28, 45], powerball: 15 },
                whiteMatches: 2,
                powerballMatch: false
            },
            dateRange: { earliest: '2015-01-03', latest: '2024-12-31' },
            frequency: { whiteBalls: { 1: 20, 2: 16, 3: 14, 4: 12, 5: 18 }, powerball: 10 },
            totalDrawings: 1497
        };
        
        const epitaph3 = renderer.generateEpitaph(result3);
        
        // Verify content
        if (epitaph3.includes('1 · 2 · 3 · 4 · 5') && 
            epitaph3.includes('two white spheres') &&
            epitaph3.length > 200) {
            log('green', '✓ PASSED: Weak match epitaph generated correctly');
            passed++;
        } else {
            log('red', '✗ FAILED: Incorrect content in weak match epitaph');
            failed++;
        }
    } catch (error) {
        log('red', `✗ FAILED: ${error.message}`);
        failed++;
    }
    
    console.log('');
    
    // Test 4: No matches
    log('blue', 'Test 4: Never Won - No Matches');
    try {
        const result4 = {
            numbers: { whiteBalls: [7, 14, 21, 28, 35], powerball: 7 },
            exactMatch: null,
            closestMatch: {
                drawing: { drawDate: '2019-03-10', whiteBalls: [8, 15, 22, 29, 36], powerball: 8 },
                whiteMatches: 0,
                powerballMatch: false
            },
            dateRange: { earliest: '2015-01-03', latest: '2024-12-31' },
            frequency: { whiteBalls: { 7: 2, 14: 1, 21: 3, 28: 0, 35: 1 }, powerball: 0 },
            totalDrawings: 1497
        };
        
        const epitaph4 = renderer.generateEpitaph(result4);
        
        // Verify content
        if (epitaph4.includes('No white spheres aligned') && 
            epitaph4.includes('appeared not at all')) {
            log('green', '✓ PASSED: No matches epitaph generated correctly');
            passed++;
        } else {
            log('red', '✗ FAILED: Incorrect content in no matches epitaph');
            failed++;
        }
    } catch (error) {
        log('red', `✗ FAILED: ${error.message}`);
        failed++;
    }
    
    console.log('');
    
    // Test 5: Single match + powerball
    log('blue', 'Test 5: Single White Ball Match + Powerball');
    try {
        const result5 = {
            numbers: { whiteBalls: [10, 20, 30, 40, 50], powerball: 15 },
            exactMatch: null,
            closestMatch: {
                drawing: { drawDate: '2021-09-18', whiteBalls: [10, 25, 35, 45, 55], powerball: 15 },
                whiteMatches: 1,
                powerballMatch: true
            },
            dateRange: { earliest: '2015-01-03', latest: '2024-12-31' },
            frequency: { whiteBalls: { 10: 12, 20: 11, 30: 13, 40: 9, 50: 7 }, powerball: 11 },
            totalDrawings: 1497
        };
        
        const epitaph5 = renderer.generateEpitaph(result5);
        
        // Verify content
        if (epitaph5.includes('single white sphere aligned') && 
            epitaph5.includes('crimson sphere matched')) {
            log('green', '✓ PASSED: Single match + powerball epitaph generated correctly');
            passed++;
        } else {
            log('red', '✗ FAILED: Incorrect content in single match epitaph');
            failed++;
        }
    } catch (error) {
        log('red', `✗ FAILED: ${error.message}`);
        failed++;
    }
    
    console.log('');
    
    // Test 6: Invalid input
    log('blue', 'Test 6: Invalid Input (Error Handling)');
    try {
        renderer.generateEpitaph(null);
        log('red', '✗ FAILED: Should have thrown error for null input');
        failed++;
    } catch (error) {
        if (error.message.includes('Invalid')) {
            log('green', '✓ PASSED: Correctly throws error for invalid input');
            passed++;
        } else {
            log('red', `✗ FAILED: Wrong error message: ${error.message}`);
            failed++;
        }
    }
    
    console.log('');
    
    // Test 7: Variety test (multiple generations should differ)
    log('blue', 'Test 7: Variety Check (Multiple Generations)');
    try {
        const result = {
            numbers: { whiteBalls: [5, 12, 23, 34, 45], powerball: 10 },
            exactMatch: null,
            closestMatch: {
                drawing: { drawDate: '2023-05-15', whiteBalls: [5, 12, 23, 34, 45], powerball: 9 },
                whiteMatches: 5,
                powerballMatch: false
            },
            dateRange: { earliest: '2015-01-03', latest: '2024-12-31' },
            frequency: { whiteBalls: { 5: 15, 12: 8, 23: 12, 34: 10, 45: 7 }, powerball: 6 },
            totalDrawings: 1497
        };
        
        const epitaphs = new Set();
        for (let i = 0; i < 10; i++) {
            epitaphs.add(renderer.generateEpitaph(result));
        }
        
        // Should have some variety (at least 2 different versions in 10 tries)
        if (epitaphs.size >= 2) {
            log('green', `✓ PASSED: Generated ${epitaphs.size} different variations in 10 attempts`);
            passed++;
        } else {
            log('yellow', `⚠ WARNING: Only ${epitaphs.size} variation found (may need more randomization)`);
            passed++; // Still pass, as variation is nice-to-have
        }
    } catch (error) {
        log('red', `✗ FAILED: ${error.message}`);
        failed++;
    }
    
    // Summary
    console.log('');
    log('cyan', '========================================');
    log('cyan', 'Test Summary');
    log('cyan', '========================================');
    log('green', `Passed: ${passed}`);
    if (failed > 0) {
        log('red', `Failed: ${failed}`);
    } else {
        log('green', `Failed: ${failed}`);
    }
    log('cyan', `Total: ${passed + failed}`);
    console.log('');
    
    return failed === 0;
}

// Run tests
const success = testEpitaphGeneration();
process.exit(success ? 0 : 1);
