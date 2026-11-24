/**
 * Main Application Orchestrator
 * 
 * Wires together all modules and manages application state.
 * Implements the complete user flow from number input to tarot reading.
 * 
 * Manual Input Flow:
 * 1. User enters numbers via InputModule
 * 2. Numbers validated
 * 3. Historical analysis runs
 * 4. Tombstone displayed with epitaph
 * 5. Tarot prompt appears
 * 6. If accepted, collect question → select cards → generate fortune → display reading
 * 
 * Requirements: 1.1, 1.3, 1.5, 3.1, 4.1
 */
class LottoGraveyardApp {
    constructor() {
        // Application state machine
        // States: INPUT, ANALYSIS, TOMBSTONE, TAROT_PROMPT, QUESTION, READING
        this.state = 'INPUT';
        
        // Module instances
        this.inputModule = new InputModule();
        this.scanner = new WebcamScanner();
        this.analysis = new HistoricalAnalysis();
        this.tombstone = new TombstoneRenderer();
        this.tarot = new TarotModule();
        this.fortuneClient = new FortuneClient();
        
        // Current data
        this.currentLotteryNumbers = null;
        this.currentAnalysisResult = null;
        this.currentCards = null;
        this.currentFortune = null;
        
        // Webcam scanning state
        this.scanningActive = false;
        this.scanTimeout = null;
        this.scanAttempts = 0;
        this.maxScanAttempts = 10;
        
        // DOM element references
        this.inputSection = null;
        this.tombstoneSection = null;
        this.tarotPromptSection = null;
        this.questionSection = null;
        this.cardDisplaySection = null;
        this.fortuneSection = null;
    }
    
    /**
     * Initialize the application
     * Sets up all modules and loads historical data
     */
    async init() {
        try {
            console.log('Initializing Lotto Graveyard...');
            
            // Get DOM element references
            this.inputSection = document.getElementById('input-section');
            this.tombstoneSection = document.getElementById('tombstone-section');
            this.tarotPromptSection = document.getElementById('tarot-prompt-section');
            this.questionSection = document.getElementById('question-section');
            this.cardDisplaySection = document.getElementById('card-display-section');
            this.fortuneSection = document.getElementById('fortune-section');
            
            // Initialize input module
            const inputContainer = document.getElementById('input-container');
            this.inputModule.init(inputContainer);
            
            // Set up callback for validated numbers
            this.inputModule.onNumbersValidated((lotteryNumbers) => {
                this.handleNumbersValidated(lotteryNumbers);
            });
            
            // Initialize webcam scanner
            const videoElement = document.getElementById('webcam-video');
            const canvasElement = document.getElementById('webcam-canvas');
            if (videoElement && canvasElement) {
                this.scanner.init(videoElement, canvasElement);
                
                // Set up callback for scanned numbers
                this.scanner.onNumbersDetected((lotteryNumbers) => {
                    this.handleScannedNumbers(lotteryNumbers);
                });
                
                // Set up webcam scanner controls
                this.setupWebcamControls();
            }
            
            // Load historical data
            await this.loadHistoricalData();
            
            // Set initial state
            this.setState('INPUT');
            
            console.log('Lotto Graveyard initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }
    
    /**
     * Set up webcam scanner control buttons
     * Requirements: 2.1, 2.3
     */
    setupWebcamControls() {
        const startBtn = document.getElementById('start-camera-btn');
        const stopBtn = document.getElementById('stop-camera-btn');
        const switchBtn = document.getElementById('switch-camera-btn');
        const fallbackBtn = document.getElementById('fallback-to-manual-btn');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startScanning());
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopScanning());
        }
        
        if (switchBtn) {
            switchBtn.addEventListener('click', async () => {
                try {
                    await this.scanner.switchCamera();
                    this.showScannerStatus('Camera switched');
                } catch (error) {
                    this.showScannerError('Failed to switch camera');
                }
            });
        }
        
        if (fallbackBtn) {
            fallbackBtn.addEventListener('click', () => {
                this.stopScanning();
                this.inputModule.toggleInputMode('manual');
            });
        }
    }
    
    /**
     * Start webcam scanning process
     * Requirements: 2.1, 2.2, 2.3
     */
    async startScanning() {
        try {
            this.clearScannerMessages();
            this.showScannerStatus('Starting camera...');
            
            // Request camera access and start stream
            await this.scanner.startCamera();
            
            this.showScannerStatus('Camera ready. Position ticket in view...');
            
            // Update UI
            this.updateScannerUI(true);
            
            // Check if device has multiple cameras
            const hasMultiple = await this.scanner.hasMultipleCameras();
            const switchBtn = document.getElementById('switch-camera-btn');
            if (switchBtn) {
                switchBtn.classList.toggle('hidden', !hasMultiple);
            }
            
            // Start continuous scanning with timeout
            this.startContinuousScanning();
            
        } catch (error) {
            console.error('Failed to start camera:', error);
            this.handleCameraError(error);
        }
    }
    
    /**
     * Stop webcam scanning process
     */
    stopScanning() {
        this.scanningActive = false;
        
        // Clear scan timeout
        if (this.scanTimeout) {
            clearTimeout(this.scanTimeout);
            this.scanTimeout = null;
        }
        
        // Stop camera
        this.scanner.stopCamera();
        
        // Update UI
        this.updateScannerUI(false);
        this.clearScannerMessages();
        
        // Reset scan attempts
        this.scanAttempts = 0;
        
        console.log('Scanning stopped');
    }
    
    /**
     * Start continuous scanning loop with timeout
     * Requirements: 2.5, 2.6
     */
    startContinuousScanning() {
        this.scanningActive = true;
        this.scanAttempts = 0;
        
        // Start the scanning loop
        this.scanLoop();
        
        // Set 30-second timeout per requirements
        this.scanTimeout = setTimeout(() => {
            if (this.scanningActive) {
                this.handleScanTimeout();
            }
        }, 30000);
    }
    
    /**
     * Continuous scanning loop
     */
    async scanLoop() {
        if (!this.scanningActive) {
            return;
        }
        
        try {
            this.scanAttempts++;
            
            // Attempt to scan current frame
            const result = await this.scanner.scanFrame();
            
            if (result) {
                // Numbers detected - scanning will stop in handleScannedNumbers
                return;
            }
            
            // Show fallback option after several failed attempts
            if (this.scanAttempts >= this.maxScanAttempts) {
                this.showScannerFallback();
            }
            
            // Continue scanning if still active
            if (this.scanningActive) {
                // Wait a bit before next scan attempt
                setTimeout(() => this.scanLoop(), 500);
            }
            
        } catch (error) {
            console.error('Scan loop error:', error);
            if (this.scanningActive) {
                setTimeout(() => this.scanLoop(), 1000);
            }
        }
    }
    
    /**
     * Handle successfully scanned numbers from webcam
     * Requirements: 2.7, 2.8, 2.9, 2.10
     */
    handleScannedNumbers(lotteryNumbers) {
        // Stop scanning
        this.stopScanning();
        
        // Validate extracted numbers
        const validationResult = validateLotteryNumbers(
            lotteryNumbers.whiteBalls,
            lotteryNumbers.powerball
        );
        
        if (!validationResult.valid) {
            // Invalid numbers detected - show error and allow retry
            this.showScannerError('Detected numbers are invalid. Please try again.');
            this.showScannerFallback();
            console.log('Invalid scanned numbers:', lotteryNumbers, validationResult);
            return;
        }
        
        // Display extracted numbers for confirmation
        this.displayScannedNumbersConfirmation(lotteryNumbers);
    }
    
    /**
     * Display scanned numbers for user confirmation
     * Requirements: 2.8, 2.10
     */
    displayScannedNumbersConfirmation(lotteryNumbers) {
        const statusElement = document.getElementById('scanner-status');
        
        if (!statusElement) {
            // Fallback: proceed directly
            this.handleNumbersValidated(lotteryNumbers);
            return;
        }
        
        // Format numbers for display
        const whiteBallsStr = lotteryNumbers.whiteBalls.join(', ');
        const powerballStr = lotteryNumbers.powerball;
        
        // Create confirmation UI
        statusElement.innerHTML = `
            <div class="scanned-numbers-confirmation">
                <p><strong>Detected Numbers:</strong></p>
                <p class="detected-numbers">
                    White Balls: <span class="white-balls">${whiteBallsStr}</span><br>
                    Powerball: <span class="powerball">${powerballStr}</span>
                </p>
                <div class="confirmation-buttons">
                    <button type="button" id="confirm-scanned-btn" class="btn-primary">
                        Confirm & Analyze
                    </button>
                    <button type="button" id="retry-scan-btn" class="btn-secondary">
                        Retry Scan
                    </button>
                </div>
            </div>
        `;
        
        statusElement.classList.remove('hidden');
        
        // Wire up confirmation buttons
        const confirmBtn = document.getElementById('confirm-scanned-btn');
        const retryBtn = document.getElementById('retry-scan-btn');
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.handleNumbersValidated(lotteryNumbers);
            });
        }
        
        if (retryBtn) {
            retryBtn.addEventListener('click', async () => {
                this.clearScannerMessages();
                await this.startScanning();
            });
        }
    }
    
    /**
     * Handle camera errors
     * Requirements: 2.2, 2.10, 1.14
     */
    handleCameraError(error) {
        const errorMessage = error.message || error.toString();
        
        if (errorMessage.includes('PERMISSION_DENIED')) {
            this.showScannerError('Camera access is required for scanning. Please allow camera access or use manual input.');
        } else if (errorMessage.includes('NO_CAMERA')) {
            this.showScannerError('No camera found. Please use manual input.');
        } else if (errorMessage.includes('CAMERA_IN_USE')) {
            this.showScannerError('Camera is already in use by another application. Please close other applications or use manual input.');
        } else {
            this.showScannerError('Camera error occurred. Please use manual input.');
        }
        
        // Show fallback to manual input
        this.showScannerFallback();
    }
    
    /**
     * Handle scan timeout (30 seconds)
     * Requirements: 2.5, 2.9
     */
    handleScanTimeout() {
        this.stopScanning();
        this.showScannerError('Could not detect numbers from ticket within 30 seconds. Please ensure the ticket is well-lit and in focus, or use manual input.');
        this.showScannerFallback();
    }
    
    /**
     * Update scanner UI based on scanning state
     */
    updateScannerUI(isScanning) {
        const startBtn = document.getElementById('start-camera-btn');
        const stopBtn = document.getElementById('stop-camera-btn');
        
        if (startBtn) {
            startBtn.classList.toggle('hidden', isScanning);
        }
        
        if (stopBtn) {
            stopBtn.classList.toggle('hidden', !isScanning);
        }
    }
    
    /**
     * Show scanner status message
     */
    showScannerStatus(message) {
        const statusElement = document.getElementById('scanner-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.classList.remove('hidden');
        }
    }
    
    /**
     * Show scanner error message
     * Requirements: 1.14, 2.9
     */
    showScannerError(message) {
        const errorElement = document.getElementById('scanner-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }
    
    /**
     * Show fallback to manual input option
     * Requirements: 2.10
     */
    showScannerFallback() {
        const fallbackElement = document.getElementById('scanner-fallback');
        if (fallbackElement) {
            fallbackElement.classList.remove('hidden');
        }
    }
    
    /**
     * Clear scanner messages
     */
    clearScannerMessages() {
        const statusElement = document.getElementById('scanner-status');
        const errorElement = document.getElementById('scanner-error');
        const fallbackElement = document.getElementById('scanner-fallback');
        
        if (statusElement) {
            statusElement.textContent = '';
            statusElement.innerHTML = '';
            statusElement.classList.add('hidden');
        }
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.add('hidden');
        }
        
        if (fallbackElement) {
            fallbackElement.classList.add('hidden');
        }
    }
    
    /**
     * Load historical lottery data
     */
    async loadHistoricalData() {
        try {
            console.log('Loading historical lottery data...');
            await this.analysis.loadData();
            const status = this.analysis.getDataStatus();
            console.log(`Loaded ${status.drawingsCount} drawings (last updated: ${status.lastUpdated})`);
        } catch (error) {
            console.error('Failed to load historical data:', error);
            throw new Error('Historical lottery data is currently unavailable');
        }
    }
    
    /**
     * Handle validated lottery numbers from input or scanner
     * Triggers historical analysis
     * 
     * @param {Object} lotteryNumbers - { whiteBalls: number[], powerball: number }
     */
    async handleNumbersValidated(lotteryNumbers) {
        try {
            console.log('Numbers validated:', lotteryNumbers);
            
            // Store lottery numbers
            this.currentLotteryNumbers = lotteryNumbers;
            
            // Transition to analysis state
            this.setState('ANALYSIS');
            
            // Show loading indicator
            this.showLoading('Analyzing your numbers against historical data...');
            
            // Run historical analysis
            const analysisResult = this.analysis.analyze(lotteryNumbers);
            console.log('Analysis complete:', analysisResult);
            
            // Store analysis result
            this.currentAnalysisResult = analysisResult;
            
            // Hide loading indicator
            this.hideLoading();
            
            // Display tombstone with results
            this.displayTombstone(analysisResult);
            
        } catch (error) {
            console.error('Analysis failed:', error);
            this.hideLoading();
            this.showError('Failed to analyze numbers. Please try again.');
            this.setState('INPUT');
        }
    }
    
    /**
     * Display tombstone with analysis results
     * 
     * @param {Object} analysisResult - Result from HistoricalAnalysis.analyze()
     */
    displayTombstone(analysisResult) {
        try {
            console.log('Displaying tombstone...');
            
            // Hide input section
            if (this.inputSection) {
                this.inputSection.classList.add('hidden');
            }
            
            // Show tombstone section
            if (this.tombstoneSection) {
                this.tombstoneSection.classList.remove('hidden');
            }
            
            // Render tombstone
            const tombstoneContainer = document.getElementById('tombstone-container');
            if (tombstoneContainer) {
                this.tombstone.render(analysisResult, tombstoneContainer);
            }
            
            // Transition to tombstone state
            this.setState('TOMBSTONE');
            
            // Show tarot reading prompt
            this.showTarotPrompt();
            
        } catch (error) {
            console.error('Failed to display tombstone:', error);
            this.showError('Failed to display results. Please try again.');
        }
    }
    
    /**
     * Show tarot reading prompt after tombstone
     * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
     */
    showTarotPrompt() {
        try {
            console.log('Showing tarot prompt...');
            
            // Validate lottery numbers are available (Requirement 7.8)
            if (!this.currentLotteryNumbers) {
                console.error('Cannot show tarot prompt: lottery numbers not available');
                this.showError('Lottery numbers are not available for tarot reading.');
                return;
            }
            
            // Show tarot prompt section
            if (this.tarotPromptSection) {
                this.tarotPromptSection.classList.remove('hidden');
            }
            
            // Render tarot prompt
            const tarotPromptContainer = document.getElementById('tarot-prompt-container');
            if (tarotPromptContainer && this.currentLotteryNumbers) {
                this.tarot.showPrompt(this.currentLotteryNumbers, tarotPromptContainer);
            }
            
            // Set up question submission callback
            this.tarot.onQuestionSubmit((question) => {
                this.handleQuestionSubmitted(question);
            });
            
            // Transition to tarot prompt state
            this.setState('TAROT_PROMPT');
            
        } catch (error) {
            console.error('Failed to show tarot prompt:', error);
            this.showError('Failed to show tarot prompt.');
        }
    }
    
    /**
     * Handle question submission
     * Selects cards, generates fortune, and displays reading
     * Requirements: 6.7, 7.1, 7.5, 8.1, 8.7, 8.8
     * 
     * @param {string} question - User's question
     */
    async handleQuestionSubmitted(question) {
        try {
            console.log('Question submitted:', question);
            
            // Validate lottery numbers are available
            if (!this.currentLotteryNumbers) {
                this.showError('Lottery numbers are not available. Please start over.');
                return;
            }
            
            // Transition to question state
            this.setState('QUESTION');
            
            // Hide tarot prompt section
            if (this.tarotPromptSection) {
                this.tarotPromptSection.classList.add('hidden');
            }
            
            // Hide question section
            if (this.questionSection) {
                this.questionSection.classList.add('hidden');
            }
            
            // Show loading indicator
            this.showLoading('Selecting your cards...');
            
            // Select cards deterministically
            const cards = this.tarot.selectCards(this.currentLotteryNumbers, question);
            console.log('Cards selected:', cards);
            
            // Store cards
            this.currentCards = cards;
            
            // Update loading message
            this.showLoading('Generating your fortune...');
            
            // Generate fortune
            const fortune = await this.tarot.generateFortune(cards, question);
            console.log('Fortune generated:', fortune);
            
            // Store fortune
            this.currentFortune = fortune;
            
            // Hide loading indicator
            this.hideLoading();
            
            // Display complete reading (cards + fortune)
            this.displayCompleteReading(cards, fortune);
            
            // Transition to reading state
            this.setState('READING');
            
        } catch (error) {
            console.error('Failed to generate reading:', error);
            this.hideLoading();
            
            // Show error with retry option
            this.showFortuneError(error.message || 'Failed to generate fortune. Please try again.');
        }
    }
    
    /**
     * Display complete tarot reading (cards + fortune)
     * Requirements: 7.6, 7.7, 8.12
     * 
     * @param {Array} cards - Array of 3 selected cards
     * @param {string} fortune - Generated fortune text
     */
    displayCompleteReading(cards, fortune) {
        try {
            console.log('Displaying complete reading...');
            
            // Show card display section
            if (this.cardDisplaySection) {
                this.cardDisplaySection.classList.remove('hidden');
            }
            
            // Show fortune section
            if (this.fortuneSection) {
                this.fortuneSection.classList.remove('hidden');
            }
            
            // Render cards
            const cardDisplayContainer = document.getElementById('card-display-container');
            if (cardDisplayContainer) {
                this.tarot.displayReading(cards, '', cardDisplayContainer);
            }
            
            // Render fortune with Rider-Waite styling
            const fortuneContainer = document.getElementById('fortune-container');
            if (fortuneContainer) {
                // Split fortune into paragraphs
                const paragraphs = fortune.split('\n\n').filter(p => p.trim());
                
                let fortuneHTML = '<div class="fortune-text" role="article" aria-label="Your mystical fortune">';
                paragraphs.forEach(paragraph => {
                    fortuneHTML += `<p>${this.escapeHtml(paragraph.trim())}</p>`;
                });
                fortuneHTML += '</div>';
                
                fortuneHTML += `
                    <div class="fortune-actions">
                        <button type="button" id="start-over-btn" class="btn-primary">
                            Start Over
                        </button>
                    </div>
                `;
                
                fortuneContainer.innerHTML = fortuneHTML;
                
                // Set up start over button
                const startOverBtn = document.getElementById('start-over-btn');
                if (startOverBtn) {
                    startOverBtn.addEventListener('click', () => this.reset());
                }
            }
            
            // Scroll to cards smoothly
            if (this.cardDisplaySection) {
                this.cardDisplaySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            
        } catch (error) {
            console.error('Failed to display reading:', error);
            this.showError('Failed to display tarot reading.');
        }
    }
    
    /**
     * Set application state
     * 
     * @param {string} newState - New state (INPUT, ANALYSIS, TOMBSTONE, TAROT_PROMPT, QUESTION, READING)
     */
    setState(newState) {
        console.log(`State transition: ${this.state} → ${newState}`);
        this.state = newState;
    }
    
    /**
     * Reset application to initial state
     */
    reset() {
        console.log('Resetting application...');
        
        // Stop any active scanning
        this.stopScanning();
        
        // Clear data
        this.currentLotteryNumbers = null;
        this.currentAnalysisResult = null;
        this.currentCards = null;
        this.currentFortune = null;
        
        // Reset modules
        this.inputModule.reset();
        
        // Hide all sections except input
        if (this.inputSection) this.inputSection.classList.remove('hidden');
        if (this.tombstoneSection) this.tombstoneSection.classList.add('hidden');
        if (this.tarotPromptSection) this.tarotPromptSection.classList.add('hidden');
        if (this.questionSection) this.questionSection.classList.add('hidden');
        if (this.cardDisplaySection) this.cardDisplaySection.classList.add('hidden');
        if (this.fortuneSection) this.fortuneSection.classList.add('hidden');
        
        // Clear containers
        const tombstoneContainer = document.getElementById('tombstone-container');
        if (tombstoneContainer) tombstoneContainer.innerHTML = '';
        
        const tarotPromptContainer = document.getElementById('tarot-prompt-container');
        if (tarotPromptContainer) tarotPromptContainer.innerHTML = '';
        
        const questionContainer = document.getElementById('question-container');
        if (questionContainer) questionContainer.innerHTML = '';
        
        const cardDisplayContainer = document.getElementById('card-display-container');
        if (cardDisplayContainer) cardDisplayContainer.innerHTML = '';
        
        const fortuneContainer = document.getElementById('fortune-container');
        if (fortuneContainer) fortuneContainer.innerHTML = '';
        
        // Reset state
        this.setState('INPUT');
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
    
    /**
     * Show loading indicator with message
     * 
     * @param {string} message - Loading message
     */
    showLoading(message) {
        // Create or update loading overlay
        let loadingOverlay = document.getElementById('loading-overlay');
        
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loading-overlay';
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.setAttribute('role', 'status');
            loadingOverlay.setAttribute('aria-live', 'polite');
            document.body.appendChild(loadingOverlay);
        }
        
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner" aria-hidden="true"></div>
                <p>${this.escapeHtml(message)}</p>
            </div>
        `;
        
        loadingOverlay.classList.remove('hidden');
    }
    
    /**
     * Hide loading indicator
     */
    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }
    
    /**
     * Show error message for fortune generation with retry option
     * Requirements: 8.9, 8.10, 8.11
     * 
     * @param {string} message - Error message
     */
    showFortuneError(message) {
        // Show fortune section with error
        if (this.fortuneSection) {
            this.fortuneSection.classList.remove('hidden');
        }
        
        const fortuneContainer = document.getElementById('fortune-container');
        if (fortuneContainer) {
            fortuneContainer.innerHTML = `
                <div class="fortune-error" role="alert" aria-live="assertive">
                    <p class="error-message">${this.escapeHtml(message)}</p>
                    <div class="fortune-actions">
                        <button type="button" id="retry-fortune-btn" class="btn-primary">
                            Try Again
                        </button>
                        <button type="button" id="cancel-fortune-btn" class="btn-secondary">
                            Start Over
                        </button>
                    </div>
                </div>
            `;
            
            // Set up retry button
            const retryBtn = document.getElementById('retry-fortune-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', async () => {
                    // Clear error display
                    fortuneContainer.innerHTML = '';
                    this.fortuneSection.classList.add('hidden');
                    
                    // Retry fortune generation with current cards and question
                    if (this.currentCards && this.tarot.currentQuestion) {
                        this.showLoading('Generating your fortune...');
                        try {
                            const fortune = await this.tarot.generateFortune(
                                this.currentCards, 
                                this.tarot.currentQuestion
                            );
                            this.currentFortune = fortune;
                            this.hideLoading();
                            this.displayCompleteReading(this.currentCards, fortune);
                            this.setState('READING');
                        } catch (error) {
                            this.hideLoading();
                            this.showFortuneError(error.message || 'Failed to generate fortune. Please try again.');
                        }
                    }
                });
            }
            
            // Set up cancel button
            const cancelBtn = document.getElementById('cancel-fortune-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => this.reset());
            }
            
            // Scroll to error
            if (this.fortuneSection) {
                this.fortuneSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }
    
    /**
     * Show error message
     * 
     * @param {string} message - Error message
     */
    showError(message) {
        // Create or update error notification
        let errorNotification = document.getElementById('error-notification');
        
        if (!errorNotification) {
            errorNotification = document.createElement('div');
            errorNotification.id = 'error-notification';
            errorNotification.className = 'error-notification';
            errorNotification.setAttribute('role', 'alert');
            errorNotification.setAttribute('aria-live', 'assertive');
            document.body.appendChild(errorNotification);
        }
        
        errorNotification.innerHTML = `
            <div class="error-content">
                <p>${this.escapeHtml(message)}</p>
                <button type="button" id="dismiss-error-btn" class="btn-secondary" aria-label="Dismiss error">
                    Dismiss
                </button>
            </div>
        `;
        
        errorNotification.classList.remove('hidden');
        
        // Set up dismiss button
        const dismissBtn = document.getElementById('dismiss-error-btn');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                errorNotification.classList.add('hidden');
            });
        }
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            errorNotification.classList.add('hidden');
        }, 10000);
    }
    
    /**
     * Escape HTML to prevent XSS
     * 
     * @param {string} text - Text to escape
     * @returns {string} Escaped HTML-safe text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new LottoGraveyardApp();
    app.init().catch(error => {
        console.error('Failed to initialize app:', error);
        alert('Failed to load the application. Please refresh the page.');
    });
});
