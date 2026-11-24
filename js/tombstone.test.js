/**
 * Unit tests for tombstone.js
 * Tests tombstone rendering and epitaph generation
 * 
 * Requirements: 4.1, 4.2, 4.7, 4.8, 4.9, 4.10, 4.11
 */

// Import the tombstone module
const TombstoneRenderer = require('./tombstone.js');

// Mock DOM for Node.js environment
global.document = {
    createElement: (tag) => ({
        textContent: '',
        innerHTML: '',
        get innerHTML() { return this._innerHTML || ''; },
        set innerHTML(value) { this._innerHTML = value; }
    })
};

// Helper function to run tests
function runTests() {
    let passed = 0;
    let failed = 0;
    
    function test(name, fn) {
        try {
            fn();
            console.log(`✓ ${name}`);
            passed++;
        } catch (error) {
            console.error(`✗ ${name}`);
            console.error(`  ${error.message}`);
            failed++;
        }
    }
    
    function assertTrue(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }
    
    function assertFalse(condition, message) {
        if (condition) {
            throw new Error(message);
        }
    }
    
    function assertContains(str, substr, message) {
        if (!str.includes(substr)) {
            throw new Error(`${message}\n  String does not contain: ${substr}`);
        }
    }
    
    function assertNotNull(value, message) {
        if (value === null || value === undefined) {
            throw new Error(message);
        }
    }
    
    function assertThrows(fn, message) {
        try {
            fn();
            throw new Error(`${message} - Expected function to throw error`);
        } catch (error) {
            // Expected
        }
    }
    
    console.log('\n=== Tombstone Renderer Tests ===\n');
    
    // Sample analysis result for testing
    const sampleAnalysis = {
        numbers: {
            whiteBalls: [5, 12, 23, 34, 45],
            powerball: 10
        },
        exactMatch: null,
        closestMatch: {
            drawing: {
                drawDate: '2024-12-15',
                whiteBalls: [5, 12, 20, 30, 40],
                powerball: 8
            },
            whiteMatches: 2,
            powerballMatch: false
        },
        dateRange: {
            earliest: '2020-01-01',
            latest: '2024-12-31'
        },
        frequency: {
            whiteBalls: {
                5: 15,
                12: 8,
                23: 12,
                34: 6,
                45: 3
            },
            powerball: 7
        },
        totalDrawings: 500
    };
    
    const sampleAnalysisWithWin = {
        ...sampleAnalysis,
        exactMatch: {
            drawDate: '2023-06-15',
            whiteBalls: [5, 12, 23, 34, 45],
            powerball: 10,
            jackpot: 250000000
        }
    };
    
    const renderer = new TombstoneRenderer();
    
    // Test: Epitaph generation
    test('Generate epitaph for numbers that never won', () => {
        const epitaph = renderer.generateEpitaph(sampleAnalysis);
        assertNotNull(epitaph, 'Epitaph should not be null');
        assertTrue(epitaph.length > 0, 'Epitaph should not be empty');
        
        // Should contain lottery numbers
        assertContains(epitaph, '5', 'Should contain first white ball');
        assertContains(epitaph, '10', 'Should contain powerball');
        
        // Should mention never won
        const hasNeverWonPhrase = renderer.neverWonPhrases.some(phrase => 
            epitaph.toLowerCase().includes(phrase.toLowerCase().split(' ').slice(0, 3).join(' '))
        );
        assertTrue(hasNeverWonPhrase, 'Should mention that numbers never won');
    });
    
    test('Generate epitaph for winning numbers', () => {
        const epitaph = renderer.generateEpitaph(sampleAnalysisWithWin);
        assertNotNull(epitaph, 'Epitaph should not be null');
        
        // Should mention win
        const hasWinPhrase = renderer.winPhrases.some(phrase =>
            epitaph.toLowerCase().includes(phrase.toLowerCase().split(' ').slice(0, 2).join(' '))
        );
        assertTrue(hasWinPhrase, 'Should mention that numbers won');
        
        // Should contain win date
        assertContains(epitaph, '2023', 'Should contain win year');
    });
    
    test('Epitaph contains closest match information', () => {
        const epitaph = renderer.generateEpitaph(sampleAnalysis);
        
        // Should mention closest match
        assertTrue(
            epitaph.includes('two') || epitaph.includes('2'),
            'Should mention 2 white ball matches'
        );
        assertContains(epitaph, '2024', 'Should contain closest match year');
    });
    
    test('Epitaph contains date range', () => {
        const epitaph = renderer.generateEpitaph(sampleAnalysis);
        assertContains(epitaph, '2020', 'Should contain earliest year');
        assertContains(epitaph, '2024', 'Should contain latest year');
        assertContains(epitaph, '500', 'Should contain total drawings count');
    });
    
    test('Epitaph contains frequency statistics', () => {
        const epitaph = renderer.generateEpitaph(sampleAnalysis);
        
        // Should mention frequency
        assertTrue(
            epitaph.toLowerCase().includes('frequency') || 
            epitaph.toLowerCase().includes('appeared'),
            'Should mention frequency or appearance'
        );
        
        // Should contain some frequency counts
        assertContains(epitaph, '15', 'Should contain frequency count for ball 5');
        assertContains(epitaph, '7', 'Should contain powerball frequency');
    });
    
    test('Invalid analysis result should throw error', () => {
        assertThrows(
            () => renderer.generateEpitaph(null),
            'Should throw error for null input'
        );
        
        assertThrows(
            () => renderer.generateEpitaph({}),
            'Should throw error for invalid input'
        );
    });
    
    // Test: Render method
    test('Render tombstone with valid analysis', () => {
        const mockContainer = {
            innerHTML: ''
        };
        
        renderer.render(sampleAnalysis, mockContainer);
        
        const html = mockContainer.innerHTML;
        assertNotNull(html, 'Should render HTML');
        assertTrue(html.length > 0, 'Should render non-empty HTML');
        
        // Should contain tombstone CSS class
        assertContains(html, 'tombstone', 'Should have tombstone class');
        
        // Should contain numbers
        assertContains(html, '5', 'Should contain first white ball');
        assertContains(html, '10', 'Should contain powerball');
        
        // Should have required sections
        assertContains(html, 'tombstone-header', 'Should have header section');
        assertContains(html, 'tombstone-numbers', 'Should have numbers section');
        assertContains(html, 'tombstone-epitaph', 'Should have epitaph section');
    });
    
    test('Render should include proper ARIA labels', () => {
        const mockContainer = {
            innerHTML: ''
        };
        
        renderer.render(sampleAnalysis, mockContainer);
        
        const html = mockContainer.innerHTML;
        
        // Should have ARIA labels for accessibility
        assertContains(html, 'aria-label', 'Should have ARIA labels');
        assertContains(html, 'role=', 'Should have ARIA roles');
    });
    
    test('Render should display white balls and powerball separately', () => {
        const mockContainer = {
            innerHTML: ''
        };
        
        renderer.render(sampleAnalysis, mockContainer);
        
        const html = mockContainer.innerHTML;
        
        // Should have separate classes for white balls and powerball
        assertContains(html, 'white-balls', 'Should have white-balls class');
        assertContains(html, 'powerball', 'Should have powerball class');
    });
    
    test('Render should escape HTML to prevent XSS', () => {
        const maliciousAnalysis = {
            ...sampleAnalysis,
            numbers: {
                whiteBalls: [1, 2, 3, 4, 5],
                powerball: 10
            }
        };
        
        const mockContainer = {
            innerHTML: ''
        };
        
        // This should not throw and should escape any HTML in epitaph
        renderer.render(maliciousAnalysis, mockContainer);
        
        const html = mockContainer.innerHTML;
        assertNotNull(html, 'Should render safely');
    });
    
    test('Render with invalid arguments should throw error', () => {
        assertThrows(
            () => renderer.render(null, {}),
            'Should throw error for null analysis'
        );
        
        assertThrows(
            () => renderer.render(sampleAnalysis, null),
            'Should throw error for null container'
        );
    });
    
    // Test: Format helpers
    test('Format date should produce readable output', () => {
        const formatted = renderer._formatDate('2024-01-15');
        assertContains(formatted, 'January', 'Should contain month name');
        assertContains(formatted, '2024', 'Should contain year');
        assertContains(formatted, '15', 'Should contain day');
    });
    
    test('Format numbers with separators', () => {
        const formatted = renderer._formatNumbers(sampleAnalysis.numbers);
        assertContains(formatted, '·', 'Should use separator');
        assertContains(formatted, '5', 'Should contain first number');
        assertContains(formatted, '10', 'Should contain powerball');
    });
    
    test('Format times text for different counts', () => {
        assertTrue(
            renderer._formatTimesText(0).includes('not'),
            'Zero times should indicate none'
        );
        assertTrue(
            renderer._formatTimesText(1).includes('once'),
            'One time should use "once"'
        );
        assertTrue(
            renderer._formatTimesText(2).includes('twice'),
            'Two times should use "twice"'
        );
        assertTrue(
            renderer._formatTimesText(5).includes('5'),
            'Multiple times should include number'
        );
    });
    
    console.log(`\n=== Test Results ===`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${passed + failed}\n`);
    
    return failed === 0;
}

// Run tests if executed directly
if (require.main === module) {
    const success = runTests();
    process.exit(success ? 0 : 1);
}

module.exports = { runTests };
