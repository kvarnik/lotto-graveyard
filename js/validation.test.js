// Unit tests for validation.js
// Tests all acceptance criteria for Requirements 1.5-1.15

// Import the validation module
const { validateLotteryNumbers, ERROR_MESSAGES } = require('./validation.js');

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
    
    function assertEquals(actual, expected, message) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(`${message}\n  Expected: ${JSON.stringify(expected)}\n  Got: ${JSON.stringify(actual)}`);
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
    
    console.log('\n=== Validation Tests ===\n');
    
    // Test: Valid input
    test('Valid lottery numbers should pass validation', () => {
        const result = validateLotteryNumbers([1, 2, 3, 4, 5], 10);
        assertTrue(result.valid, 'Should be valid');
        assertEquals(result.errors.general.length, 0, 'Should have no general errors');
        assertEquals(Object.keys(result.errors.whiteBalls).length, 0, 'Should have no white ball errors');
        assertEquals(result.errors.powerball.length, 0, 'Should have no powerball errors');
    });
    
    test('Valid lottery numbers at upper ranges should pass', () => {
        const result = validateLotteryNumbers([65, 66, 67, 68, 69], 26);
        assertTrue(result.valid, 'Should be valid');
    });
    
    test('Valid lottery numbers at lower ranges should pass', () => {
        const result = validateLotteryNumbers([1, 2, 3, 4, 5], 1);
        assertTrue(result.valid, 'Should be valid');
    });
    
    // Requirement 1.15: Empty input
    test('Empty input should fail with appropriate error', () => {
        const result = validateLotteryNumbers([], null);
        assertFalse(result.valid, 'Should be invalid');
        assertTrue(
            result.errors.general.includes(ERROR_MESSAGES.EMPTY_INPUT),
            'Should have empty input error'
        );
    });
    
    test('Null white balls and undefined powerball should fail', () => {
        const result = validateLotteryNumbers(null, undefined);
        assertFalse(result.valid, 'Should be invalid');
        assertTrue(
            result.errors.general.includes(ERROR_MESSAGES.EMPTY_INPUT),
            'Should have empty input error'
        );
    });
    
    // Requirement 1.9: Exactly 5 white balls
    test('Fewer than 5 white balls should fail', () => {
        const result = validateLotteryNumbers([1, 2, 3], 10);
        assertFalse(result.valid, 'Should be invalid');
        assertTrue(
            result.errors.general.includes(ERROR_MESSAGES.WRONG_WHITE_COUNT),
            'Should have wrong count error'
        );
    });
    
    test('More than 5 white balls should fail', () => {
        const result = validateLotteryNumbers([1, 2, 3, 4, 5, 6], 10);
        assertFalse(result.valid, 'Should be invalid');
        assertTrue(
            result.errors.general.includes(ERROR_MESSAGES.WRONG_WHITE_COUNT),
            'Should have wrong count error'
        );
    });
    
    // Requirement 1.10: White balls in range 1-69
    test('White ball below range should fail', () => {
        const result = validateLotteryNumbers([0, 2, 3, 4, 5], 10);
        assertFalse(result.valid, 'Should be invalid');
        assertTrue(
            result.errors.whiteBalls[0] === ERROR_MESSAGES.WHITE_OUT_OF_RANGE,
            'Should have out of range error for first ball'
        );
    });
    
    test('White ball above range should fail', () => {
        const result = validateLotteryNumbers([1, 2, 3, 4, 70], 10);
        assertFalse(result.valid, 'Should be invalid');
        assertTrue(
            result.errors.whiteBalls[4] === ERROR_MESSAGES.WHITE_OUT_OF_RANGE,
            'Should have out of range error for fifth ball'
        );
    });
    
    test('Multiple white balls out of range should fail', () => {
        const result = validateLotteryNumbers([0, 2, 3, 4, 100], 10);
        assertFalse(result.valid, 'Should be invalid');
        assertTrue(
            result.errors.whiteBalls[0] === ERROR_MESSAGES.WHITE_OUT_OF_RANGE,
            'Should have out of range error for first ball'
        );
        assertTrue(
            result.errors.whiteBalls[4] === ERROR_MESSAGES.WHITE_OUT_OF_RANGE,
            'Should have out of range error for fifth ball'
        );
    });
    
    // Requirement 1.11: Powerball in range 1-26
    test('Powerball below range should fail', () => {
        const result = validateLotteryNumbers([1, 2, 3, 4, 5], 0);
        assertFalse(result.valid, 'Should be invalid');
        assertTrue(
            result.errors.powerball.includes(ERROR_MESSAGES.POWERBALL_OUT_OF_RANGE),
            'Should have powerball out of range error'
        );
    });
    
    test('Powerball above range should fail', () => {
        const result = validateLotteryNumbers([1, 2, 3, 4, 5], 27);
        assertFalse(result.valid, 'Should be invalid');
        assertTrue(
            result.errors.powerball.includes(ERROR_MESSAGES.POWERBALL_OUT_OF_RANGE),
            'Should have powerball out of range error'
        );
    });
    
    // Requirement 1.12: All white balls must be unique
    test('Duplicate white balls should fail', () => {
        const result = validateLotteryNumbers([1, 2, 3, 3, 5], 10);
        assertFalse(result.valid, 'Should be invalid');
        assertTrue(
            result.errors.whiteBalls[3] === ERROR_MESSAGES.WHITE_DUPLICATES,
            'Should have duplicate error'
        );
    });
    
    test('Multiple duplicate white balls should fail', () => {
        const result = validateLotteryNumbers([5, 5, 5, 4, 4], 10);
        assertFalse(result.valid, 'Should be invalid');
        // At least one of the duplicates should be marked
        const hasDuplicateError = Object.values(result.errors.whiteBalls).some(
            err => err === ERROR_MESSAGES.WHITE_DUPLICATES
        );
        assertTrue(hasDuplicateError, 'Should have duplicate error for at least one ball');
    });
    
    // Requirement 1.13: Powerball is required
    test('Missing powerball (null) should fail', () => {
        const result = validateLotteryNumbers([1, 2, 3, 4, 5], null);
        assertFalse(result.valid, 'Should be invalid');
        assertTrue(
            result.errors.powerball.includes(ERROR_MESSAGES.POWERBALL_MISSING),
            'Should have powerball missing error'
        );
    });
    
    test('Missing powerball (undefined) should fail', () => {
        const result = validateLotteryNumbers([1, 2, 3, 4, 5], undefined);
        assertFalse(result.valid, 'Should be invalid');
        assertTrue(
            result.errors.powerball.includes(ERROR_MESSAGES.POWERBALL_MISSING),
            'Should have powerball missing error'
        );
    });
    
    test('Missing powerball (empty string) should fail', () => {
        const result = validateLotteryNumbers([1, 2, 3, 4, 5], '');
        assertFalse(result.valid, 'Should be invalid');
        assertTrue(
            result.errors.powerball.includes(ERROR_MESSAGES.POWERBALL_MISSING),
            'Should have powerball missing error'
        );
    });
    
    // Edge cases: String inputs (from form fields)
    test('String white balls should be parsed and validated', () => {
        const result = validateLotteryNumbers(['1', '2', '3', '4', '5'], '10');
        assertTrue(result.valid, 'Should be valid with string inputs');
    });
    
    test('Invalid string white balls should fail', () => {
        const result = validateLotteryNumbers(['1', '2', '3', '4', 'abc'], '10');
        assertFalse(result.valid, 'Should be invalid');
        assertTrue(
            result.errors.whiteBalls[4] === ERROR_MESSAGES.WHITE_OUT_OF_RANGE,
            'Should have out of range error for invalid string'
        );
    });
    
    // Combined errors
    test('Multiple validation errors should all be reported', () => {
        const result = validateLotteryNumbers([0, 2, 3, 3, 70], 30);
        assertFalse(result.valid, 'Should be invalid');
        assertTrue(
            result.errors.whiteBalls[0] === ERROR_MESSAGES.WHITE_OUT_OF_RANGE,
            'Should have out of range error for first ball'
        );
        assertTrue(
            result.errors.whiteBalls[3] === ERROR_MESSAGES.WHITE_DUPLICATES,
            'Should have duplicate error for fourth ball'
        );
        assertTrue(
            result.errors.whiteBalls[4] === ERROR_MESSAGES.WHITE_OUT_OF_RANGE,
            'Should have out of range error for fifth ball'
        );
        assertTrue(
            result.errors.powerball.includes(ERROR_MESSAGES.POWERBALL_OUT_OF_RANGE),
            'Should have powerball out of range error'
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
