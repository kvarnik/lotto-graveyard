/**
 * Input Module
 * 
 * Orchestrates lottery number input via manual entry and webcam scanning.
 * Handles form submission, validation, normalization, and callbacks.
 * 
 * Requirements: 1.3, 1.5
 */
class InputModule {
    constructor() {
        this.mode = 'manual';
        this.whiteBalls = [];
        this.powerball = null;
        this.validationErrors = [];
        this.onNumbersValidatedCallback = null;
        this.form = null;
        this.containerElement = null;
    }
    
    /**
     * Initialize the input module
     * 
     * @param {HTMLElement} containerElement - Container element for input UI
     * 
     * Sets up event listeners for:
     * - Form submission
     * - Input field changes
     * - Mode toggle buttons
     */
    init(containerElement) {
        this.containerElement = containerElement;
        
        // Get the manual input form
        this.form = document.getElementById('manual-input-form');
        
        if (!this.form) {
            console.error('Manual input form not found');
            return;
        }
        
        // Set up form submission handler
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Clear validation errors when user starts typing
        this.setupInputListeners();
        
        // Set up mode toggle buttons
        this.setupModeToggle();
    }
    
    /**
     * Set up input field listeners to clear errors on change
     */
    setupInputListeners() {
        // White ball inputs
        for (let i = 1; i <= 5; i++) {
            const input = document.getElementById(`white-ball-${i}`);
            if (input) {
                input.addEventListener('input', () => {
                    // Clear error for this specific input
                    const errorElement = document.getElementById(`white-ball-${i}-error`);
                    if (errorElement) {
                        errorElement.textContent = '';
                        errorElement.classList.remove('visible');
                    }
                    input.setAttribute('aria-invalid', 'false');
                    input.classList.remove('error');
                });
            }
        }
        
        // Powerball input
        const powerballInput = document.getElementById('powerball');
        if (powerballInput) {
            powerballInput.addEventListener('input', () => {
                const errorElement = document.getElementById('powerball-error');
                if (errorElement) {
                    errorElement.textContent = '';
                    errorElement.classList.remove('visible');
                }
                powerballInput.setAttribute('aria-invalid', 'false');
                powerballInput.classList.remove('error');
            });
        }
    }
    
    /**
     * Set up mode toggle button handlers
     */
    setupModeToggle() {
        const manualBtn = document.getElementById('manual-mode-btn');
        const webcamBtn = document.getElementById('webcam-mode-btn');
        
        if (manualBtn) {
            manualBtn.addEventListener('click', () => this.toggleInputMode('manual'));
        }
        
        if (webcamBtn) {
            webcamBtn.addEventListener('click', () => this.toggleInputMode('webcam'));
        }
    }
    
    /**
     * Toggle between manual and webcam input modes
     * 
     * @param {string} mode - 'manual' or 'webcam'
     */
    toggleInputMode(mode) {
        this.mode = mode;
        
        const manualBtn = document.getElementById('manual-mode-btn');
        const webcamBtn = document.getElementById('webcam-mode-btn');
        const manualContainer = document.getElementById('manual-input-container');
        const webcamContainer = document.getElementById('webcam-scanner-container');
        
        if (mode === 'manual') {
            // Show manual input, hide webcam
            if (manualContainer) manualContainer.classList.remove('hidden');
            if (webcamContainer) webcamContainer.classList.add('hidden');
            
            // Update button states
            if (manualBtn) {
                manualBtn.classList.add('active');
                manualBtn.setAttribute('aria-pressed', 'true');
            }
            if (webcamBtn) {
                webcamBtn.classList.remove('active');
                webcamBtn.setAttribute('aria-pressed', 'false');
            }
            
        } else if (mode === 'webcam') {
            // Show webcam, hide manual input
            if (manualContainer) manualContainer.classList.add('hidden');
            if (webcamContainer) webcamContainer.classList.remove('hidden');
            
            // Update button states
            if (manualBtn) {
                manualBtn.classList.remove('active');
                manualBtn.setAttribute('aria-pressed', 'false');
            }
            if (webcamBtn) {
                webcamBtn.classList.add('active');
                webcamBtn.setAttribute('aria-pressed', 'true');
            }
        }
    }
    
    
    /**
     * Handle form submission
     * 
     * @param {Event} event - Form submit event
     * 
     * Validates input, normalizes white balls (sort, dedupe),
     * and triggers callback with validated numbers.
     * 
     * Requirements:
     * - 1.3: Manual input form submission
     * - 1.5: Validation of lottery numbers
     */
    handleFormSubmit(event) {
        event.preventDefault();
        
        // Clear previous validation errors
        if (typeof clearValidationErrors === 'function') {
            clearValidationErrors();
        }
        
        // Collect white ball numbers from form
        const whiteBalls = [];
        for (let i = 1; i <= 5; i++) {
            const input = document.getElementById(`white-ball-${i}`);
            if (input && input.value.trim() !== '') {
                whiteBalls.push(parseInt(input.value.trim(), 10));
            }
        }
        
        // Collect powerball number
        const powerballInput = document.getElementById('powerball');
        const powerball = powerballInput && powerballInput.value.trim() !== '' 
            ? parseInt(powerballInput.value.trim(), 10) 
            : null;
        
        // Validate lottery numbers using validation module
        const validationResult = validateLotteryNumbers(whiteBalls, powerball);
        
        if (!validationResult.valid) {
            // Display validation errors
            if (typeof displayValidationErrors === 'function') {
                displayValidationErrors(validationResult);
            }
            this.validationErrors = validationResult.errors;
            return;
        }
        
        // Normalize white balls: sort ascending and remove duplicates
        const normalizedWhiteBalls = this.normalizeWhiteBalls(whiteBalls);
        
        // Store validated and normalized numbers
        this.whiteBalls = normalizedWhiteBalls;
        this.powerball = powerball;
        this.validationErrors = [];
        
        // Trigger callback with validated lottery numbers
        if (this.onNumbersValidatedCallback) {
            this.onNumbersValidatedCallback({
                whiteBalls: this.whiteBalls,
                powerball: this.powerball
            });
        }
    }
    
    /**
     * Normalize white balls: sort ascending and remove duplicates
     * 
     * @param {Array<number>} whiteBalls - Array of white ball numbers
     * @returns {Array<number>} Sorted array with duplicates removed
     * 
     * Note: Validation already ensures uniqueness, but we dedupe as defensive measure.
     * Per design, white balls should always be stored sorted.
     */
    normalizeWhiteBalls(whiteBalls) {
        // Remove duplicates using Set, then sort ascending
        const unique = [...new Set(whiteBalls)];
        return unique.sort((a, b) => a - b);
    }
    
    /**
     * Set callback for validated lottery numbers
     * 
     * @param {Function} callback - Function to call with validated numbers
     *   Callback signature: (lotteryNumbers: { whiteBalls: number[], powerball: number }) => void
     */
    onNumbersValidated(callback) {
        this.onNumbersValidatedCallback = callback;
    }
    
    /**
     * Get current lottery numbers
     * 
     * @returns {Object} Current lottery numbers { whiteBalls: number[], powerball: number }
     */
    getLotteryNumbers() {
        return {
            whiteBalls: [...this.whiteBalls], // Return copy to prevent mutation
            powerball: this.powerball
        };
    }
    
    /**
     * Reset input state
     * 
     * Clears stored numbers, validation errors, and form inputs.
     */
    reset() {
        this.whiteBalls = [];
        this.powerball = null;
        this.validationErrors = [];
        
        // Clear form inputs
        if (this.form) {
            this.form.reset();
        }
        
        // Clear any displayed validation errors
        if (typeof clearValidationErrors === 'function') {
            clearValidationErrors();
        }
    }
}

// Make class available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputModule;
}
