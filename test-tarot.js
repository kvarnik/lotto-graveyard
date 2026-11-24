#!/usr/bin/env node

// Test script for TarotModule card selection
// Run with: node test-tarot.js

// Load seedrandom
const seedrandom = require('seedrandom');
Math.seedrandom = seedrandom;

// Load tarot deck and make it global for TarotModule
const { TAROT_DECK } = require('./js/tarot-deck.js');
global.TAROT_DECK = TAROT_DECK;

// Load TarotModule
const TarotModule = require('./js/tarot.js');

// Create instance
const tarotModule = new TarotModule();

console.log('\n=== Tarot Card Selection Tests ===\n');

// Test 1: Deterministic Selection
console.log('Test 1: Deterministic Selection');
console.log('Same lottery numbers + same question should produce identical cards\n');

const lotteryNumbers1 = {
    whiteBalls: [5, 12, 23, 45, 67],
    powerball: 13
};
const question1 = "What does my future hold?";

const cards1a = tarotModule.selectCards(lotteryNumbers1, question1);
const cards1b = tarotModule.selectCards(lotteryNumbers1, question1);

const test1Pass = cards1a.every((card, i) => 
    card.id === cards1b[i].id && 
    card.name === cards1b[i].name &&
    card.position === cards1b[i].position
);

console.log(test1Pass ? '✓ PASS' : '✗ FAIL');
console.log('First selection:', cards1a.map(c => `${c.position}: ${c.name} (${c.id})`).join(', '));
console.log('Second selection:', cards1b.map(c => `${c.position}: ${c.name} (${c.id})`).join(', '));
console.log('');

// Test 2: Card Uniqueness
console.log('Test 2: Card Uniqueness');
console.log('All 3 selected cards should be distinct\n');

const testCases = [
    { whiteBalls: [1, 2, 3, 4, 5], powerball: 1, question: "Test question 1" },
    { whiteBalls: [10, 20, 30, 40, 50], powerball: 10, question: "Test question 2" },
    { whiteBalls: [15, 25, 35, 45, 55], powerball: 15, question: "Test question 3" }
];

let test2Pass = true;
testCases.forEach((testCase, index) => {
    const cards = tarotModule.selectCards(
        { whiteBalls: testCase.whiteBalls, powerball: testCase.powerball },
        testCase.question
    );
    
    const ids = cards.map(c => c.id);
    const uniqueIds = new Set(ids);
    const hasNoDuplicates = ids.length === uniqueIds.size;
    
    if (!hasNoDuplicates) test2Pass = false;
    
    console.log(`Test case ${index + 1}: ${hasNoDuplicates ? '✓' : '✗'} - IDs: [${ids.join(', ')}]`);
});

console.log(test2Pass ? '\n✓ ALL PASS\n' : '\n✗ SOME FAILED\n');

// Test 3: Valid Card Selection
console.log('Test 3: Valid Card Selection');
console.log('All selected cards should have valid IDs (0-77) and positions\n');

const validTestCases = [
    { whiteBalls: [7, 14, 21, 28, 35], powerball: 7, question: "Valid test 1" },
    { whiteBalls: [11, 22, 33, 44, 55], powerball: 11, question: "Valid test 2" },
    { whiteBalls: [69, 68, 67, 66, 65], powerball: 26, question: "Valid test 3" }
];

let test3Pass = true;
validTestCases.forEach((testCase, index) => {
    const cards = tarotModule.selectCards(
        { whiteBalls: testCase.whiteBalls, powerball: testCase.powerball },
        testCase.question
    );
    
    const allValid = cards.every(card => 
        card.id >= 0 && 
        card.id <= 77 &&
        ['past', 'present', 'future'].includes(card.position)
    );
    
    if (!allValid) test3Pass = false;
    
    const positions = cards.map(c => c.position).join(', ');
    const ids = cards.map(c => c.id).join(', ');
    console.log(`Test case ${index + 1}: ${allValid ? '✓' : '✗'} - Positions: [${positions}], IDs: [${ids}]`);
});

console.log(test3Pass ? '\n✓ ALL PASS\n' : '\n✗ SOME FAILED\n');

// Test 4: Different Seeds Produce Different Cards
console.log('Test 4: Different Seeds Produce Different Cards');
console.log('Different questions with same numbers should produce different cards\n');

const lotteryNumbers4 = {
    whiteBalls: [5, 12, 23, 45, 67],
    powerball: 13
};

const cards4a = tarotModule.selectCards(lotteryNumbers4, "What about love?");
const cards4b = tarotModule.selectCards(lotteryNumbers4, "What about career?");
const cards4c = tarotModule.selectCards(lotteryNumbers4, "What about health?");

const different_ab = cards4a.some((card, i) => card.id !== cards4b[i].id);
const different_bc = cards4b.some((card, i) => card.id !== cards4c[i].id);
const different_ac = cards4a.some((card, i) => card.id !== cards4c[i].id);

const test4Pass = different_ab && different_bc && different_ac;

console.log(test4Pass ? '✓ PASS' : '✗ FAIL');
console.log('Question 1 (love):', cards4a.map(c => `${c.name} (${c.id})`).join(', '));
console.log('Question 2 (career):', cards4b.map(c => `${c.name} (${c.id})`).join(', '));
console.log('Question 3 (health):', cards4c.map(c => `${c.name} (${c.id})`).join(', '));
console.log('');

// Test 5: Verify deck has 78 cards
console.log('Test 5: Deck Validation');
console.log('Verify deck has exactly 78 unique cards\n');

const test5Pass = TAROT_DECK.length === 78 && 
    new Set(TAROT_DECK.map(c => c.id)).size === 78;

console.log(test5Pass ? '✓ PASS' : '✗ FAIL');
console.log(`Deck size: ${TAROT_DECK.length}, Unique IDs: ${new Set(TAROT_DECK.map(c => c.id)).size}`);
console.log('');

// Summary
console.log('=== Test Summary ===');
const allTestsPassed = test1Pass && test2Pass && test3Pass && test4Pass && test5Pass;
console.log(allTestsPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED');
console.log('');

process.exit(allTestsPassed ? 0 : 1);
