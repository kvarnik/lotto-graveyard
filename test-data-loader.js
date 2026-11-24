// Node.js test for DataLoader (server-side simulation)
// This tests the core logic without browser APIs

const fs = require('fs');
const path = require('path');

// Mock browser APIs
global.sessionStorage = {
    data: {},
    getItem(key) { return this.data[key] || null; },
    setItem(key, value) { this.data[key] = value; },
    removeItem(key) { delete this.data[key]; }
};

global.localStorage = {
    data: {},
    getItem(key) { return this.data[key] || null; },
    setItem(key, value) { this.data[key] = value; },
    removeItem(key) { delete this.data[key]; }
};

// Mock fetch for Node.js
global.fetch = async function(url) {
    return new Promise((resolve, reject) => {
        // Simulate file loading
        const filePath = path.join(__dirname, url);
        
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            resolve({
                ok: true,
                status: 200,
                statusText: 'OK',
                json: async () => JSON.parse(data)
            });
        } else {
            reject(new Error(`File not found: ${url}`));
        }
    });
};

// Load modules
const CONFIG = require('./js/config.js');
// Make CONFIG global for DataLoader
global.CONFIG = CONFIG;
const DataLoader = require('./js/data-loader.js');

// Test suite
async function runTests() {
    console.log('=== DataLoader Test Suite ===\n');
    
    let passCount = 0;
    let failCount = 0;
    
    const test = (name, condition, details = '') => {
        if (condition) {
            console.log(`✓ ${name}`);
            if (details) console.log(`  ${details}`);
            passCount++;
        } else {
            console.log(`✗ ${name}`);
            if (details) console.log(`  ${details}`);
            failCount++;
        }
    };
    
    try {
        // Test 1: Constructor initialization
        console.log('\n--- Test 1: Constructor Initialization ---');
        const loader = new DataLoader();
        test('Constructor creates instance', loader instanceof DataLoader);
        test('Sets data file path', loader.dataFilePath === CONFIG.DATA_FILE_PATH);
        test('Initializes session', sessionStorage.getItem('lotto_graveyard_session_start') !== null);
        
        // Test 2: Data validation
        console.log('\n--- Test 2: Data Validation ---');
        
        const validData = {
            lastUpdated: '2024-01-01T00:00:00Z',
            totalDrawings: 100,
            drawings: [
                {
                    drawDate: '2024-01-01',
                    whiteBalls: [1, 2, 3, 4, 5],
                    powerball: 10
                }
            ]
        };
        
        try {
            loader.validateData(validData);
            test('Accepts valid data', true);
        } catch (e) {
            test('Accepts valid data', false, e.message);
        }
        
        const invalidData1 = { totalDrawings: 100, drawings: [] };
        try {
            loader.validateData(invalidData1);
            test('Rejects data missing lastUpdated', false);
        } catch (e) {
            test('Rejects data missing lastUpdated', e.message.includes('lastUpdated'));
        }
        
        const invalidData2 = {
            lastUpdated: '2024-01-01T00:00:00Z',
            totalDrawings: 'not a number',
            drawings: []
        };
        try {
            loader.validateData(invalidData2);
            test('Rejects invalid totalDrawings', false);
        } catch (e) {
            test('Rejects invalid totalDrawings', e.message.includes('totalDrawings'));
        }
        
        const invalidData3 = {
            lastUpdated: '2024-01-01T00:00:00Z',
            totalDrawings: 100
        };
        try {
            loader.validateData(invalidData3);
            test('Rejects missing drawings array', false);
        } catch (e) {
            test('Rejects missing drawings array', e.message.includes('drawings'));
        }
        
        // Test 3: Caching mechanism
        console.log('\n--- Test 3: Caching Mechanism ---');
        
        loader.clearCache();
        test('Cache cleared successfully', loader.getCachedData() === null);
        
        const testData = {
            lastUpdated: '2024-01-01T00:00:00Z',
            totalDrawings: 50,
            drawings: []
        };
        
        loader.cacheData(testData);
        const cached = loader.getCachedData();
        test('Data cached successfully', cached !== null);
        test('Cached data contains timestamp', cached && cached.timestamp !== undefined);
        test('Cached data matches original', 
            cached && cached.data.totalDrawings === testData.totalDrawings);
        
        // Test 4: Cache validity
        console.log('\n--- Test 4: Cache Validity ---');
        
        const freshCache = loader.getCachedData();
        test('Fresh cache is valid', loader.isCacheValid(freshCache));
        
        const oldCache = {
            data: testData,
            timestamp: Date.now() - 100000 // Old timestamp
        };
        // New session should invalidate old cache
        sessionStorage.setItem('lotto_graveyard_session_start', Date.now().toString());
        test('Old cache is invalid in new session', !loader.isCacheValid(oldCache));
        
        // Test 5: Cache status
        console.log('\n--- Test 5: Cache Status ---');
        
        const status = loader.getCacheStatus();
        test('getCacheStatus returns object', typeof status === 'object');
        test('Status includes hasCachedData', 'hasCachedData' in status);
        test('Status includes cacheTimestamp', 'cacheTimestamp' in status);
        test('Status includes sessionStart', 'sessionStart' in status);
        test('Status includes isValid', 'isValid' in status);
        
        // Test 6: Load historical data
        console.log('\n--- Test 6: Load Historical Data ---');
        
        loader.clearCache();
        const data = await loader.loadHistoricalData();
        
        test('Data loads successfully', data !== null);
        test('Data has lastUpdated field', data.lastUpdated !== undefined);
        test('Data has totalDrawings field', typeof data.totalDrawings === 'number');
        test('Data has drawings array', Array.isArray(data.drawings));
        test('TotalDrawings matches array length', 
            data.totalDrawings === data.drawings.length,
            `Expected: ${data.drawings.length}, Got: ${data.totalDrawings}`);
        
        if (data.drawings.length > 0) {
            const firstDrawing = data.drawings[0];
            test('Drawing has drawDate', typeof firstDrawing.drawDate === 'string');
            test('Drawing has whiteBalls array', Array.isArray(firstDrawing.whiteBalls));
            test('Drawing has 5 white balls', firstDrawing.whiteBalls.length === 5);
            test('Drawing has powerball', typeof firstDrawing.powerball === 'number');
        }
        
        // Test 7: Caching performance
        console.log('\n--- Test 7: Caching Performance ---');
        
        loader.clearCache();
        
        const start1 = Date.now();
        await loader.loadHistoricalData();
        const time1 = Date.now() - start1;
        
        const start2 = Date.now();
        await loader.loadHistoricalData();
        const time2 = Date.now() - start2;
        
        test('Cached load is faster', time2 < time1,
            `First load: ${time1}ms, Cached load: ${time2}ms`);
        
        const speedup = (time1 / Math.max(time2, 1)).toFixed(1);
        console.log(`  Speed improvement: ${speedup}x faster`);
        
        // Test 8: Error handling
        console.log('\n--- Test 8: Error Handling ---');
        
        const badLoader = new DataLoader();
        badLoader.dataFilePath = '/nonexistent/file.json';
        badLoader.clearCache(); // Clear cache to force fetch
        
        try {
            await badLoader.loadHistoricalData();
            test('Throws error for missing file', false);
        } catch (e) {
            test('Throws error for missing file', true);
            test('Error message is user-friendly', 
                e.message.includes('unavailable') || e.message.includes('failed'));
        }
        
    } catch (error) {
        console.error('\n❌ Test suite error:', error);
        failCount++;
    }
    
    // Summary
    console.log('\n=== Test Summary ===');
    console.log(`Total: ${passCount + failCount} tests`);
    console.log(`✓ Passed: ${passCount}`);
    console.log(`✗ Failed: ${failCount}`);
    
    if (failCount === 0) {
        console.log('\n🎉 All tests passed!');
        process.exit(0);
    } else {
        console.log('\n❌ Some tests failed');
        process.exit(1);
    }
}

// Run tests
runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
