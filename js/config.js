// Configuration for Lotto Graveyard application

const CONFIG = {
    // Lambda Fortune Generator URL (update after deployment)
    FORTUNE_LAMBDA_URL: 'https://your-function-url.lambda-url.us-east-1.on.aws/',
    
    // Data file path
    DATA_FILE_PATH: 'data/historical-data.json',
    
    // Tarot images path
    TAROT_IMAGES_PATH: 'assets/tarot',
    
    // Timeouts
    FORTUNE_TIMEOUT_MS: 30000, // 30 seconds
    OCR_TIMEOUT_MS: 30000, // 30 seconds
    CDN_TIMEOUT_MS: 10000, // 10 seconds
    
    // Retry settings
    MAX_FORTUNE_RETRIES: 3,
    
    // Validation rules
    WHITE_BALL_MIN: 1,
    WHITE_BALL_MAX: 69,
    WHITE_BALL_COUNT: 5,
    POWERBALL_MIN: 1,
    POWERBALL_MAX: 26,
    QUESTION_MAX_LENGTH: 200,
    FORTUNE_MIN_LENGTH: 100,
    
    // Error messages
    ERROR_MESSAGES: {
        WRONG_WHITE_COUNT: 'Exactly 5 white ball numbers are required',
        WHITE_OUT_OF_RANGE: 'White ball numbers must be between 1 and 69',
        WHITE_DUPLICATES: 'All white ball numbers must be unique',
        POWERBALL_MISSING: 'A Powerball number is required',
        POWERBALL_OUT_OF_RANGE: 'Powerball must be between 1 and 26',
        EMPTY_INPUT: 'Numbers are required',
        QUESTION_EMPTY: 'A question is required',
        QUESTION_TOO_LONG: 'Question must be 200 characters or less',
        CAMERA_DENIED: 'Camera access is required for scanning. Please allow camera access or use manual input.',
        CAMERA_NOT_FOUND: 'No camera found. Please use manual input.',
        CAMERA_ERROR: 'Camera error occurred. Please use manual input.',
        OCR_TIMEOUT: 'Could not detect numbers from ticket. Please ensure the ticket is well-lit and in focus, or use manual input.',
        DATA_LOAD_ERROR: 'Historical lottery data is currently unavailable. Please try again later.',
        FORTUNE_TIMEOUT: 'Fortune generation timed out. Please try again.',
        FORTUNE_ERROR: 'Fortune generation failed. Please try again.',
        FORTUNE_UNAVAILABLE: 'Fortune service is unavailable. Please try again later.',
        RESOURCE_LOAD_ERROR: 'Required resource failed to load. Please refresh the page.'
    }
};

// Make config available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
