// Integration test: Verify DataLoader output matches expected format for Analysis module

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

global.fetch = async function(url) {
    return new Promise((resolve, reject) => {
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

const CONFIG = require('./js/config.js');
global.CONFIG = CONFIG;
const DataLoader = require('./js/data-loader.js');

async function runIntegrationTest() {
    console.log('=== Integration Test: DataLoader with Historical Data ===\n');
    
    try {
        const loader = new DataLoader();
        loader.clearCache();
        
        console.log('Loading historical data...');
        const data = await loader.loadHistoricalData();
        
        console.log('\n✓ Data loaded successfully\n');
        
        // Verify structure
        console.log('--- Data Structure Verification ---');
        console.log(`Last Updated: ${data.lastUpdated}`);
        console.log(`Total Drawings: ${data.totalDrawings}`);
        console.log(`Actual Drawings: ${data.drawings.length}`);
        console.log(`Match: ${data.totalDrawings === data.drawings.length ? '✓' : '✗'}`);
        
        // Analyze date range
        console.log('\n--- Date Range Analysis ---');
        if (data.drawings.length > 0) {
            const dates = data.drawings.map(d => new Date(d.drawDate));
            const latest = new Date(Math.max(...dates));
            const earliest = new Date(Math.min(...dates));
            
            console.log(`Earliest: ${earliest.toISOString().split('T')[0]}`);
            console.log(`Latest: ${latest.toISOString().split('T')[0]}`);
            
            const daysDiff = (latest - earliest) / (1000 * 60 * 60 * 24);
            console.log(`Span: ${Math.round(daysDiff)} days`);
        }
        
        // Sample drawings
        console.log('\n--- Sample Drawings ---');
        console.log('Most recent 3 drawings:');
        data.drawings.slice(0, 3).forEach((drawing, idx) => {
            console.log(`\n${idx + 1}. ${drawing.drawDate}`);
            console.log(`   White Balls: ${drawing.whiteBalls.join(', ')}`);
            console.log(`   Powerball: ${drawing.powerball}`);
            console.log(`   Jackpot: ${drawing.jackpot ? '$' + drawing.jackpot.toLocaleString() : 'N/A'}`);
        });
        
        // Verify all drawings have correct structure
        console.log('\n--- Data Integrity Check ---');
        let validCount = 0;
        let invalidCount = 0;
        const issues = [];
        
        data.drawings.forEach((drawing, idx) => {
            let valid = true;
            
            if (!drawing.drawDate) {
                issues.push(`Drawing ${idx}: Missing drawDate`);
                valid = false;
            }
            
            if (!Array.isArray(drawing.whiteBalls) || drawing.whiteBalls.length !== 5) {
                issues.push(`Drawing ${idx}: Invalid whiteBalls (expected 5, got ${drawing.whiteBalls?.length})`);
                valid = false;
            }
            
            if (drawing.whiteBalls) {
                const invalidBalls = drawing.whiteBalls.filter(b => b < 1 || b > 69);
                if (invalidBalls.length > 0) {
                    issues.push(`Drawing ${idx}: White balls out of range: ${invalidBalls.join(', ')}`);
                    valid = false;
                }
                
                const uniqueBalls = new Set(drawing.whiteBalls);
                if (uniqueBalls.size !== 5) {
                    issues.push(`Drawing ${idx}: Duplicate white balls`);
                    valid = false;
                }
            }
            
            if (typeof drawing.powerball !== 'number' || drawing.powerball < 1 || drawing.powerball > 26) {
                issues.push(`Drawing ${idx}: Invalid powerball (${drawing.powerball})`);
                valid = false;
            }
            
            if (valid) {
                validCount++;
            } else {
                invalidCount++;
            }
        });
        
        console.log(`Valid drawings: ${validCount}`);
        console.log(`Invalid drawings: ${invalidCount}`);
        
        if (issues.length > 0) {
            console.log('\n⚠️  Issues found:');
            issues.slice(0, 10).forEach(issue => console.log(`  - ${issue}`));
            if (issues.length > 10) {
                console.log(`  ... and ${issues.length - 10} more`);
            }
        } else {
            console.log('✓ All drawings are valid');
        }
        
        // Test caching
        console.log('\n--- Cache Performance Test ---');
        const start1 = Date.now();
        await loader.loadHistoricalData();
        const time1 = Date.now() - start1;
        console.log(`Cached load time: ${time1}ms`);
        console.log(`Cache status: ${loader.getCacheStatus().isValid ? 'Valid' : 'Invalid'}`);
        
        // Statistics
        console.log('\n--- Quick Statistics ---');
        const allWhiteBalls = data.drawings.flatMap(d => d.whiteBalls);
        const allPowerballs = data.drawings.map(d => d.powerball);
        
        const whiteBallFreq = {};
        allWhiteBalls.forEach(ball => {
            whiteBallFreq[ball] = (whiteBallFreq[ball] || 0) + 1;
        });
        
        const powerballFreq = {};
        allPowerballs.forEach(ball => {
            powerballFreq[ball] = (powerballFreq[ball] || 0) + 1;
        });
        
        const topWhiteBalls = Object.entries(whiteBallFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        console.log('\nTop 5 most frequent white balls:');
        topWhiteBalls.forEach(([ball, count]) => {
            console.log(`  ${ball}: ${count} times (${((count / data.totalDrawings) * 100).toFixed(1)}%)`);
        });
        
        const topPowerballs = Object.entries(powerballFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        
        console.log('\nTop 3 most frequent powerballs:');
        topPowerballs.forEach(([ball, count]) => {
            console.log(`  ${ball}: ${count} times (${((count / data.totalDrawings) * 100).toFixed(1)}%)`);
        });
        
        console.log('\n✅ Integration test completed successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ Integration test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

runIntegrationTest();
