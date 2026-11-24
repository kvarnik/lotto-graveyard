// Validation module for lottery numbers

/**
 * Error message constants per requirements
 */
const ERROR_MESSAGES = {
    WRONG_WHITE_COUNT: 'Exactly 5 white ball numbers are required',
    WHITE_OUT_OF_RANGE: 'White ball numbers must be between 1 and 69',
    WHITE_DUPLICATES: 'All white ball numbers must be unique',
    POWERBALL_MISSING: 'A Powerball number is required',
    POWERBALL_OUT_OF_RANGE: 'Powerball must be between 1 and 26',
    EMPTY_INPUT: 'Numbers are required'
};

/**
 * Validates lottery numbers against Powerball rules
 * 
 * @param {Array<number>} whiteBalls - Array of white ball numbers
 * @param {number} powerball - Powerball number
 * @returns {Object} Validation result with structure:
 *   {
 *     valid: boolean,
 *     errors: {
 *       general: string[],
 *       whiteBalls: { [index]: string },
 *       powerball: string[]
 *     }
 *   }
 * 
 * Requirements validated:
 * - 1.5: Exactly 5 white balls and 1 powerball
 * - 1.6: White balls in range 1-69
 * - 1.7: Powerball in range 1-26
 * - 1.8: All white balls unique
 * - 1.9: Error for wrong white ball count
 * - 1.10: Error for white ball out of range
 * - 1.11: Error for powerball out of range
 * - 1.12: Error for duplicate white balls
 * - 1.13: Error for missing powerball
 * - 1.15: Error for empty input
 */
function validateLotteryNumbers(whiteBalls, powerball) {
    const result = {
        valid: true,
        errors: {
            general: [],
            whiteBalls: {},
            powerball: []
        }
    };
    
    // Handle null/undefined inputs
    if (whiteBalls === null || whiteBalls === undefined) {
        whiteBalls = [];
    }
    
    // Requirement 1.15: Check for empty input
    if (whiteBalls.length === 0 && (powerball === null || powerball === undefined)) {
        result.valid = false;
        result.errors.general.push(ERROR_MESSAGES.EMPTY_INPUT);
        return result;
    }
    
    // Requirement 1.9: Validate exactly 5 white balls
    if (whiteBalls.length !== 5) {
        result.valid = false;
        result.errors.general.push(ERROR_MESSAGES.WRONG_WHITE_COUNT);
    }
    
    // Requirement 1.13: Validate powerball is provided
    if (powerball === null || powerball === undefined || powerball === '') {
        result.valid = false;
        result.errors.powerball.push(ERROR_MESSAGES.POWERBALL_MISSING);
    }
    
    // Process white balls if we have some
    if (whiteBalls.length > 0) {
        const whiteBallSet = new Set();
        
        whiteBalls.forEach((ball, index) => {
            // Parse as integer if it's a string
            const ballNum = typeof ball === 'string' ? parseInt(ball, 10) : ball;
            
            // Requirement 1.10: Validate range 1-69
            if (isNaN(ballNum) || ballNum < 1 || ballNum > 69) {
                result.valid = false;
                result.errors.whiteBalls[index] = ERROR_MESSAGES.WHITE_OUT_OF_RANGE;
            }
            
            // Requirement 1.12: Check for duplicates
            if (!isNaN(ballNum)) {
                if (whiteBallSet.has(ballNum)) {
                    result.valid = false;
                    // Mark this as a duplicate
                    if (!result.errors.whiteBalls[index]) {
                        result.errors.whiteBalls[index] = ERROR_MESSAGES.WHITE_DUPLICATES;
                    }
                } else {
                    whiteBallSet.add(ballNum);
                }
            }
        });
    }
    
    // Requirement 1.11: Validate powerball range 1-26
    if (powerball !== null && powerball !== undefined && powerball !== '') {
        const powerballNum = typeof powerball === 'string' ? parseInt(powerball, 10) : powerball;
        
        if (isNaN(powerballNum) || powerballNum < 1 || powerballNum > 26) {
            result.valid = false;
            result.errors.powerball.push(ERROR_MESSAGES.POWERBALL_OUT_OF_RANGE);
        }
    }
    
    return result;
}

/**
 * Display inline error messages next to invalid fields
 * 
 * @param {Object} validationResult - Result from validateLotteryNumbers()
 * 
 * This function updates the DOM to show error messages inline next to
 * the input fields that have validation errors.
 */
function displayValidationErrors(validationResult) {
    // Clear all existing errors first
    clearValidationErrors();
    
    if (validationResult.valid) {
        return;
    }
    
    // Display general errors
    if (validationResult.errors.general.length > 0) {
        const formErrorElement = document.getElementById('form-error');
        if (formErrorElement) {
            formErrorElement.textContent = validationResult.errors.general.join('. ');
            formErrorElement.classList.add('visible');
        }
    }
    
    // Display white ball errors
    Object.keys(validationResult.errors.whiteBalls).forEach(index => {
        const errorMessage = validationResult.errors.whiteBalls[index];
        const inputElement = document.getElementById(`white-ball-${parseInt(index) + 1}`);
        const errorElement = document.getElementById(`white-ball-${parseInt(index) + 1}-error`);
        
        if (inputElement && errorElement) {
            inputElement.setAttribute('aria-invalid', 'true');
            inputElement.classList.add('error');
            errorElement.textContent = errorMessage;
            errorElement.classList.add('visible');
        }
    });
    
    // Display powerball errors
    if (validationResult.errors.powerball.length > 0) {
        const inputElement = document.getElementById('powerball');
        const errorElement = document.getElementById('powerball-error');
        
        if (inputElement && errorElement) {
            inputElement.setAttribute('aria-invalid', 'true');
            inputElement.classList.add('error');
            errorElement.textContent = validationResult.errors.powerball.join('. ');
            errorElement.classList.add('visible');
        }
    }
}

/**
 * Clear all validation error messages from the DOM
 */
function clearValidationErrors() {
    // Clear general form errors
    const formErrorElement = document.getElementById('form-error');
    if (formErrorElement) {
        formErrorElement.textContent = '';
        formErrorElement.classList.remove('visible');
    }
    
    // Clear white ball errors
    for (let i = 1; i <= 5; i++) {
        const inputElement = document.getElementById(`white-ball-${i}`);
        const errorElement = document.getElementById(`white-ball-${i}-error`);
        
        if (inputElement) {
            inputElement.setAttribute('aria-invalid', 'false');
            inputElement.classList.remove('error');
        }
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('visible');
        }
    }
    
    // Clear powerball errors
    const powerballInput = document.getElementById('powerball');
    const powerballError = document.getElementById('powerball-error');
    
    if (powerballInput) {
        powerballInput.setAttribute('aria-invalid', 'false');
        powerballInput.classList.remove('error');
    }
    
    if (powerballError) {
        powerballError.textContent = '';
        powerballError.classList.remove('visible');
    }
}

// Make functions available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        validateLotteryNumbers,
        displayValidationErrors,
        clearValidationErrors,
        ERROR_MESSAGES
    };
}
