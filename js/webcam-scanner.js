// Webcam Scanner Module
// Captures lottery ticket images and extracts numbers using OCR

class WebcamScanner {
    constructor() {
        this.videoElement = null;
        this.canvasElement = null;
        this.stream = null;
        this.onNumbersDetectedCallback = null;
        this.currentFacingMode = 'environment'; // Start with rear camera on mobile
        this.isScanning = false;
        this.ocrWorker = null;
        this.isOCRInitialized = false;
        
        // OCR Configuration per design requirements
        this.ocrConfig = {
            lang: 'eng',
            oem: 1, // LSTM OCR Engine Mode
            psm: 6, // Assume uniform block of text
            tessedit_char_whitelist: '0123456789 '
        };
    }
    
    /**
     * Initialize scanner with video and canvas elements
     * @param {HTMLVideoElement} videoElement - Video element for camera feed
     * @param {HTMLCanvasElement} canvasElement - Canvas element for image processing
     */
    init(videoElement, canvasElement) {
        this.videoElement = videoElement;
        this.canvasElement = canvasElement;
        
        if (!this.videoElement || !this.canvasElement) {
            throw new Error('Video and canvas elements are required');
        }
        
        // Initialize Tesseract worker
        this.initializeOCR();
    }
    
    /**
     * Initialize Tesseract.js OCR worker
     * @returns {Promise<void>}
     */
    async initializeOCR() {
        if (this.isOCRInitialized) {
            return;
        }
        
        try {
            // Check if Tesseract is available
            if (typeof Tesseract === 'undefined') {
                throw new Error('Tesseract.js is not loaded');
            }
            
            // Create worker
            this.ocrWorker = await Tesseract.createWorker(this.ocrConfig.lang);
            
            // Configure OCR settings
            await this.ocrWorker.setParameters({
                tessedit_ocr_engine_mode: this.ocrConfig.oem,
                tessedit_pageseg_mode: this.ocrConfig.psm,
                tessedit_char_whitelist: this.ocrConfig.tessedit_char_whitelist
            });
            
            this.isOCRInitialized = true;
            console.log('OCR initialized successfully');
        } catch (error) {
            console.error('Failed to initialize OCR:', error);
            throw error;
        }
    }
    
    /**
     * Request camera permissions and start video stream
     * @returns {Promise<void>}
     * @throws {Error} If camera access is denied or unavailable
     */
    async startCamera() {
        try {
            // Stop any existing stream first
            this.stopCamera();
            
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera API not supported in this browser');
            }
            
            // Request camera access with constraints
            const constraints = {
                video: {
                    facingMode: this.currentFacingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };
            
            // Request permission and get stream
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Attach stream to video element
            this.videoElement.srcObject = this.stream;
            
            // Wait for video to be ready
            await new Promise((resolve, reject) => {
                this.videoElement.onloadedmetadata = () => {
                    this.videoElement.play()
                        .then(resolve)
                        .catch(reject);
                };
                this.videoElement.onerror = reject;
            });
            
            this.isScanning = true;
            
        } catch (error) {
            this.isScanning = false;
            
            // Handle specific error types
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                throw new Error('PERMISSION_DENIED');
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                throw new Error('NO_CAMERA');
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                throw new Error('CAMERA_IN_USE');
            } else {
                throw new Error('CAMERA_ERROR');
            }
        }
    }
    
    /**
     * Stop camera and release resources
     */
    stopCamera() {
        this.isScanning = false;
        
        if (this.stream) {
            // Stop all tracks in the stream
            this.stream.getTracks().forEach(track => {
                track.stop();
            });
            this.stream = null;
        }
        
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
    }
    
    /**
     * Clean up OCR worker resources
     * @returns {Promise<void>}
     */
    async cleanup() {
        this.stopCamera();
        
        if (this.ocrWorker) {
            try {
                await this.ocrWorker.terminate();
                this.ocrWorker = null;
                this.isOCRInitialized = false;
                console.log('OCR worker terminated');
            } catch (error) {
                console.error('Error terminating OCR worker:', error);
            }
        }
    }
    
    /**
     * Switch between front and rear cameras (mobile support)
     * @returns {Promise<void>}
     */
    async switchCamera() {
        // Toggle facing mode
        this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
        
        // Restart camera with new facing mode
        if (this.isScanning) {
            await this.startCamera();
        }
    }
    
    /**
     * Get list of available video input devices
     * @returns {Promise<MediaDeviceInfo[]>}
     */
    async getAvailableCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === 'videoinput');
        } catch (error) {
            console.error('Error enumerating devices:', error);
            return [];
        }
    }
    
    /**
     * Check if device has multiple cameras
     * @returns {Promise<boolean>}
     */
    async hasMultipleCameras() {
        const cameras = await this.getAvailableCameras();
        return cameras.length > 1;
    }
    
    /**
     * Capture current video frame to canvas
     * @returns {ImageData|null}
     */
    captureFrame() {
        if (!this.videoElement || !this.canvasElement || !this.isScanning) {
            return null;
        }
        
        const context = this.canvasElement.getContext('2d');
        if (!context) {
            return null;
        }
        
        // Set canvas dimensions to match video
        this.canvasElement.width = this.videoElement.videoWidth;
        this.canvasElement.height = this.videoElement.videoHeight;
        
        // Draw current video frame to canvas
        context.drawImage(
            this.videoElement,
            0, 0,
            this.canvasElement.width,
            this.canvasElement.height
        );
        
        // Get image data from canvas
        return context.getImageData(
            0, 0,
            this.canvasElement.width,
            this.canvasElement.height
        );
    }
    
    /**
     * Preprocess image for better OCR results
     * @param {ImageData} imageData - Raw image data from canvas
     * @returns {ImageData} Preprocessed image data
     */
    preprocessImage(imageData) {
        const canvas = document.createElement('canvas');
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        const context = canvas.getContext('2d');
        
        if (!context) {
            return imageData;
        }
        
        // Put original image data on temporary canvas
        context.putImageData(imageData, 0, 0);
        
        // Get pixel data
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = pixels.data;
        
        // 1. Convert to grayscale and increase contrast
        for (let i = 0; i < data.length; i += 4) {
            // Grayscale conversion using luminosity method
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            
            // Increase contrast (factor of 1.5)
            const contrasted = ((gray - 128) * 1.5) + 128;
            const clamped = Math.max(0, Math.min(255, contrasted));
            
            data[i] = clamped;     // Red
            data[i + 1] = clamped; // Green
            data[i + 2] = clamped; // Blue
            // Alpha channel (data[i + 3]) remains unchanged
        }
        
        // 2. Apply simple binarization (thresholding)
        const threshold = 128;
        for (let i = 0; i < data.length; i += 4) {
            const value = data[i] > threshold ? 255 : 0;
            data[i] = value;
            data[i + 1] = value;
            data[i + 2] = value;
        }
        
        return pixels;
    }
    
    /**
     * Extract lottery numbers from OCR text
     * @param {string} text - OCR recognized text
     * @returns {{whiteBalls: number[], powerball: number}|null}
     */
    extractLotteryNumbers(text) {
        if (!text || typeof text !== 'string') {
            return null;
        }
        
        // Extract all digit sequences from text
        const digitSequences = text.match(/\d+/g);
        
        if (!digitSequences || digitSequences.length === 0) {
            return null;
        }
        
        // Convert to numbers
        const numbers = digitSequences.map(seq => parseInt(seq, 10));
        
        // Filter valid lottery numbers
        const validWhiteBalls = numbers.filter(n => n >= 1 && n <= 69);
        const validPowerballs = numbers.filter(n => n >= 1 && n <= 26);
        
        // Try to identify 5 white balls and 1 powerball
        // Heuristic: Look for patterns that match lottery ticket structure
        
        // Pattern 1: Exactly 5 numbers in white ball range + 1 in powerball range
        if (validWhiteBalls.length >= 5 && validPowerballs.length >= 1) {
            // Take first 5 unique white balls
            const whiteBalls = [];
            for (const num of validWhiteBalls) {
                if (!whiteBalls.includes(num) && whiteBalls.length < 5) {
                    whiteBalls.push(num);
                }
            }
            
            // If we found 5 unique white balls
            if (whiteBalls.length === 5) {
                // Find powerball (should be different from white balls or last number in range)
                let powerball = null;
                
                // Look for a number that's not in white balls
                for (const num of numbers) {
                    if (num >= 1 && num <= 26 && !whiteBalls.includes(num)) {
                        powerball = num;
                        break;
                    }
                }
                
                // Fallback: use last valid powerball candidate
                if (!powerball && validPowerballs.length > 0) {
                    powerball = validPowerballs[validPowerballs.length - 1];
                }
                
                if (powerball) {
                    return {
                        whiteBalls: whiteBalls.sort((a, b) => a - b),
                        powerball
                    };
                }
            }
        }
        
        // Pattern 2: Exactly 6 numbers where first 5 are unique and in white ball range
        if (numbers.length >= 6) {
            const firstFive = numbers.slice(0, 5);
            const sixth = numbers[5];
            
            // Check if first 5 are valid white balls and unique
            const uniqueFirstFive = [...new Set(firstFive)];
            if (uniqueFirstFive.length === 5 &&
                firstFive.every(n => n >= 1 && n <= 69) &&
                sixth >= 1 && sixth <= 26) {
                return {
                    whiteBalls: firstFive.sort((a, b) => a - b),
                    powerball: sixth
                };
            }
        }
        
        return null;
    }
    
    /**
     * Scan current frame for lottery numbers using OCR
     * @returns {Promise<{whiteBalls: number[], powerball: number}|null>}
     */
    async scanFrame() {
        // Ensure OCR is initialized
        if (!this.isOCRInitialized) {
            try {
                await this.initializeOCR();
            } catch (error) {
                console.error('Failed to initialize OCR:', error);
                return null;
            }
        }
        
        // Capture current frame
        const imageData = this.captureFrame();
        
        if (!imageData) {
            return null;
        }
        
        try {
            // Preprocess image for better OCR
            const preprocessedImage = this.preprocessImage(imageData);
            
            // Create canvas with preprocessed image for OCR
            const canvas = document.createElement('canvas');
            canvas.width = preprocessedImage.width;
            canvas.height = preprocessedImage.height;
            const context = canvas.getContext('2d');
            
            if (!context) {
                return null;
            }
            
            context.putImageData(preprocessedImage, 0, 0);
            
            // Run OCR on preprocessed image
            const result = await this.ocrWorker.recognize(canvas);
            
            // Extract lottery numbers from OCR text
            const lotteryNumbers = this.extractLotteryNumbers(result.data.text);
            
            if (lotteryNumbers) {
                console.log('Detected lottery numbers:', lotteryNumbers);
                
                // Trigger callback if set
                if (this.onNumbersDetectedCallback) {
                    this.onNumbersDetectedCallback(lotteryNumbers);
                }
            }
            
            return lotteryNumbers;
            
        } catch (error) {
            console.error('OCR scan error:', error);
            return null;
        }
    }
    
    /**
     * Set callback for successful number detection
     * @param {Function} callback - Callback function receiving detected numbers
     */
    onNumbersDetected(callback) {
        if (typeof callback === 'function') {
            this.onNumbersDetectedCallback = callback;
        }
    }
    
    /**
     * Get current camera state
     * @returns {Object}
     */
    getState() {
        return {
            isScanning: this.isScanning,
            facingMode: this.currentFacingMode,
            hasStream: !!this.stream
        };
    }
}

// Make class available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebcamScanner;
}
