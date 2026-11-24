// Fortune Client Module
// Handles communication with the Lambda Fortune Generator

class FortuneClient {
    constructor(lambdaUrl = CONFIG.FORTUNE_LAMBDA_URL) {
        this.lambdaUrl = lambdaUrl;
        this.maxRetries = CONFIG.MAX_FORTUNE_RETRIES;
        this.timeout = CONFIG.FORTUNE_TIMEOUT_MS;
    }
    
    /**
     * Generate a fortune by calling the Lambda function
     * @param {string} question - User's question (1-200 characters)
     * @param {Array} cards - Array of 3 cards with name and position
     * @param {number} attempt - Current attempt number (default: 1)
     * @returns {Promise<string>} The generated fortune text
     * @throws {Error} If fortune generation fails after all retries
     */
    async generateFortune(question, cards, attempt = 1) {
        // Validate inputs
        if (!question || typeof question !== 'string') {
            throw new Error('Question is required');
        }
        
        if (question.length > CONFIG.QUESTION_MAX_LENGTH) {
            throw new Error(`Question must be ${CONFIG.QUESTION_MAX_LENGTH} characters or less`);
        }
        
        if (!Array.isArray(cards) || cards.length !== 3) {
            throw new Error('Must provide exactly 3 cards');
        }
        
        // Prepare request data
        const requestData = {
            question: question.trim(),
            cards: cards.map(card => ({
                name: card.name,
                position: card.position
            }))
        };
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        try {
            // Make the request
            const response = await fetch(this.lambdaUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData),
                signal: controller.signal
            });
            
            // Clear timeout on success
            clearTimeout(timeoutId);
            
            // Check response status
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
            
            // Parse response
            const data = await response.json();
            
            // Validate fortune
            if (!data.fortune || typeof data.fortune !== 'string') {
                throw new Error('Invalid fortune response');
            }
            
            if (data.fortune.length < CONFIG.FORTUNE_MIN_LENGTH) {
                throw new Error('Fortune too short');
            }
            
            return data.fortune;
            
        } catch (error) {
            // Clear timeout on error
            clearTimeout(timeoutId);
            
            // Handle timeout specifically
            if (error.name === 'AbortError') {
                if (attempt < this.maxRetries) {
                    // Show retry message
                    this.showRetryMessage(attempt);
                    
                    // Exponential backoff
                    const delay = Math.pow(2, attempt - 1) * 1000;
                    await this.sleep(delay);
                    
                    // Retry
                    return this.generateFortune(question, cards, attempt + 1);
                } else {
                    // Max retries reached
                    throw new Error(CONFIG.ERROR_MESSAGES.FORTUNE_TIMEOUT);
                }
            }
            
            // Handle other errors with retry
            if (attempt < this.maxRetries) {
                // Show retry message
                this.showRetryMessage(attempt);
                
                // Exponential backoff
                const delay = Math.pow(2, attempt - 1) * 1000;
                await this.sleep(delay);
                
                // Retry
                return this.generateFortune(question, cards, attempt + 1);
            } else {
                // Max retries reached - determine error type
                if (error.message.includes('HTTP 500') || error.message.includes('HTTP 502') || error.message.includes('HTTP 503')) {
                    throw new Error(CONFIG.ERROR_MESSAGES.FORTUNE_ERROR);
                } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                    throw new Error(CONFIG.ERROR_MESSAGES.FORTUNE_UNAVAILABLE);
                } else {
                    throw new Error(error.message || CONFIG.ERROR_MESSAGES.FORTUNE_ERROR);
                }
            }
        }
    }
    
    /**
     * Display a retry message to the user
     * @param {number} attempt - Current attempt number
     */
    showRetryMessage(attempt) {
        const fortuneContainer = document.getElementById('fortune-container');
        if (fortuneContainer) {
            const retryMsg = document.createElement('p');
            retryMsg.className = 'retry-message';
            retryMsg.textContent = `Fortune generation timed out. Retrying (${attempt}/${this.maxRetries})...`;
            fortuneContainer.appendChild(retryMsg);
        }
    }
    
    /**
     * Display the fortune in the UI
     * @param {string} fortune - The fortune text to display
     */
    displayFortune(fortune) {
        const fortuneContainer = document.getElementById('fortune-container');
        if (!fortuneContainer) {
            console.error('Fortune container not found');
            return;
        }
        
        // Clear existing content
        fortuneContainer.innerHTML = '';
        
        // Create fortune text container
        const fortuneDiv = document.createElement('div');
        fortuneDiv.className = 'fortune-text';
        fortuneDiv.setAttribute('role', 'article');
        fortuneDiv.setAttribute('aria-label', 'Your generated fortune');
        
        // Split fortune into paragraphs if it contains line breaks
        const paragraphs = fortune.split('\n\n');
        paragraphs.forEach(paragraph => {
            if (paragraph.trim()) {
                const p = document.createElement('p');
                p.textContent = paragraph.trim();
                fortuneDiv.appendChild(p);
            }
        });
        
        fortuneContainer.appendChild(fortuneDiv);
        
        // Show the fortune section
        const fortuneSection = document.getElementById('fortune-section');
        if (fortuneSection) {
            fortuneSection.classList.remove('hidden');
        }
        
        // Scroll to fortune
        fortuneSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    /**
     * Display an error message in the UI with retry option
     * @param {string} errorMessage - The error message to display
     * @param {Function} retryCallback - Callback function for retry button
     */
    displayError(errorMessage, retryCallback = null) {
        const fortuneContainer = document.getElementById('fortune-container');
        if (!fortuneContainer) {
            console.error('Fortune container not found');
            return;
        }
        
        // Clear existing content
        fortuneContainer.innerHTML = '';
        
        // Create error container
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fortune-error';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.setAttribute('aria-live', 'assertive');
        
        // Error message
        const errorP = document.createElement('p');
        errorP.className = 'error-message';
        errorP.textContent = errorMessage;
        errorDiv.appendChild(errorP);
        
        // Add retry button if callback provided
        if (retryCallback) {
            const retryBtn = document.createElement('button');
            retryBtn.type = 'button';
            retryBtn.className = 'btn-primary retry-btn';
            retryBtn.textContent = 'Try Again';
            retryBtn.addEventListener('click', retryCallback);
            errorDiv.appendChild(retryBtn);
        }
        
        fortuneContainer.appendChild(errorDiv);
        
        // Show the fortune section
        const fortuneSection = document.getElementById('fortune-section');
        if (fortuneSection) {
            fortuneSection.classList.remove('hidden');
        }
        
        // Scroll to error
        fortuneSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    /**
     * Sleep utility for exponential backoff
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise<void>}
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Make class available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FortuneClient;
}
