/**
 * Webcam Scanner Test Script
 * Tests the WebcamScanner class functionality
 * 
 * To run: Open webcam-test.html in a browser with HTTPS or localhost
 */

// Test suite for WebcamScanner
class WebcamScannerTests {
    constructor() {
        this.results = [];
    }
    
    async runAllTests() {
        console.log('=== Webcam Scanner Test Suite ===\n');
        
        await this.testInstantiation();
        await this.testInitialization();
        await this.testGetState();
        await this.testGetAvailableCameras();
        
        console.log('\n=== Test Results ===');
        const passed = this.results.filter(r => r.passed).length;
        const failed = this.results.filter(r => !r.passed).length;
        console.log(`Passed: ${passed}/${this.results.length}`);
        console.log(`Failed: ${failed}/${this.results.length}`);
        
        return this.results;
    }
    
    testInstantiation() {
        const testName = 'WebcamScanner instantiation';
        try {
            const scanner = new WebcamScanner();
            
            if (!scanner) {
                throw new Error('Scanner not created');
            }
            
            if (scanner.videoElement !== null ||
                scanner.canvasElement !== null ||
                scanner.stream !== null ||
                scanner.currentFacingMode !== 'environment' ||
                scanner.isScanning !== false) {
                throw new Error('Initial state incorrect');
            }
            
            this.logPass(testName);
        } catch (error) {
            this.logFail(testName, error.message);
        }
    }
    
    testInitialization() {
        const testName = 'WebcamScanner initialization';
        try {
            const scanner = new WebcamScanner();
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            
            scanner.init(video, canvas);
            
            if (scanner.videoElement !== video || scanner.canvasElement !== canvas) {
                throw new Error('Elements not set correctly');
            }
            
            this.logPass(testName);
        } catch (error) {
            this.logFail(testName, error.message);
        }
    }
    
    testGetState() {
        const testName = 'WebcamScanner getState()';
        try {
            const scanner = new WebcamScanner();
            const state = scanner.getState();
            
            if (!state || typeof state !== 'object') {
                throw new Error('State not returned as object');
            }
            
            if (!state.hasOwnProperty('isScanning') ||
                !state.hasOwnProperty('facingMode') ||
                !state.hasOwnProperty('hasStream')) {
                throw new Error('State missing required properties');
            }
            
            if (state.isScanning !== false ||
                state.facingMode !== 'environment' ||
                state.hasStream !== false) {
                throw new Error('Initial state values incorrect');
            }
            
            this.logPass(testName);
        } catch (error) {
            this.logFail(testName, error.message);
        }
    }
    
    async testGetAvailableCameras() {
        const testName = 'WebcamScanner getAvailableCameras()';
        try {
            const scanner = new WebcamScanner();
            
            // This requires browser permission, so we'll just check the method exists
            if (typeof scanner.getAvailableCameras !== 'function') {
                throw new Error('getAvailableCameras method not found');
            }
            
            if (typeof scanner.hasMultipleCameras !== 'function') {
                throw new Error('hasMultipleCameras method not found');
            }
            
            this.logPass(testName);
        } catch (error) {
            this.logFail(testName, error.message);
        }
    }
    
    logPass(testName) {
        console.log(`✓ ${testName}`);
        this.results.push({ test: testName, passed: true });
    }
    
    logFail(testName, error) {
        console.log(`✗ ${testName}: ${error}`);
        this.results.push({ test: testName, passed: false, error });
    }
}

// Export for use in test page
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebcamScannerTests;
}
