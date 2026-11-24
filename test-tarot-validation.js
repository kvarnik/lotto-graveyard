// Unit tests for Task 9.5: Tarot prompt and question validation
// Run with: node test-tarot-validation.js

// Mock TAROT_DECK for testing
global.TAROT_DECK = Array.from({ length: 78 }, (_, i) => ({
    id: i,
    name: `Card ${i}`,
    arcana: i < 22 ? 'major' : 'minor'
}));

// Load the TarotModule
const TarotModule = require('./js/tarot.js');

// Test counter
let passed = 0;
let failed = 0;

function test(description, fn) {
    try {
        fn();
        console.log(`✓ ${description}`);
        passed++;
    } catch (error) {
        console.log(`✗ ${description}`);
        console.log(`  Error: ${error.message}`);
        failed++;
    }
}

function assertEquals(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
}

function assertFalse(value, message) {
    if (value !== false) {
        throw new Error(`${message}: expected false, got ${value}`);
    }
}

function assertTrue(value, message) {
    if (value !== true) {
        throw new Error(`${message}: expected true, got ${value}`);
    }
}

// Initialize tarot module
const tarot = new TarotModule();
tarot.init();

console.log('\n=== Testing Task 9.5: Question Validation ===\n');

// Test empty question validation (Requirement 6.5)
test('Empty string should be invalid', () => {
    const result = tarot.validateQuestion('');
    assertFalse(result.valid, 'Empty string validation');
    assertEquals(result.error, 'A question is required', 'Error message');
});

test('Whitespace-only string should be invalid', () => {
    const result = tarot.validateQuestion('   ');
    assertFalse(result.valid, 'Whitespace validation');
    assertEquals(result.error, 'A question is required', 'Error message');
});

test('Whitespace characters (tabs, newlines) should be invalid', () => {
    const result = tarot.validateQuestion('\n\t  \n');
    assertFalse(result.valid, 'Whitespace chars validation');
    assertEquals(result.error, 'A question is required', 'Error message');
});

// Test question length validation (Requirement 6.6)
test('Question with 201 characters should be invalid', () => {
    const longQuestion = 'a'.repeat(201);
    const result = tarot.validateQuestion(longQuestion);
    assertFalse(result.valid, '201 char validation');
    assertEquals(result.error, 'Question must be 200 characters or less', 'Error message');
});

test('Question with exactly 200 characters should be valid', () => {
    const maxQuestion = 'a'.repeat(200);
    const result = tarot.validateQuestion(maxQuestion);
    assertTrue(result.valid, '200 char validation');
});

test('Question with 199 characters should be valid', () => {
    const question = 'a'.repeat(199);
    const result = tarot.validateQuestion(question);
    assertTrue(result.valid, '199 char validation');
});

// Test valid questions (Requirement 6.4)
test('Normal question should be valid', () => {
    const result = tarot.validateQuestion('Will I find love?');
    assertTrue(result.valid, 'Normal question validation');
});

test('Single character question should be valid', () => {
    const result = tarot.validateQuestion('a');
    assertTrue(result.valid, 'Single char validation');
});

test('Question with leading/trailing whitespace should be valid', () => {
    const result = tarot.validateQuestion('  What is my destiny?  ');
    assertTrue(result.valid, 'Question with whitespace validation');
});

test('Question with multiple words and punctuation should be valid', () => {
    const result = tarot.validateQuestion('What will happen in my career this year?');
    assertTrue(result.valid, 'Complex question validation');
});

test('Question with special characters should be valid', () => {
    const result = tarot.validateQuestion('Will I succeed? Or fail...?');
    assertTrue(result.valid, 'Special chars validation');
});

// Test edge cases
test('Null should be invalid', () => {
    const result = tarot.validateQuestion(null);
    assertFalse(result.valid, 'Null validation');
});

test('Undefined should be invalid', () => {
    const result = tarot.validateQuestion(undefined);
    assertFalse(result.valid, 'Undefined validation');
});

test('Question with only spaces in middle should be valid', () => {
    const result = tarot.validateQuestion('a b');
    assertTrue(result.valid, 'Spaces in middle validation');
});

console.log('\n=== Test Results ===\n');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
    process.exit(1);
} else {
    console.log('\n✓ All tests passed!\n');
    process.exit(0);
}
