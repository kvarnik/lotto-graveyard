/**
 * Client-side Example: Calling the Fortune Generator Lambda Function
 * 
 * This file demonstrates how the static site's JavaScript will interact
 * with the Lambda function. This code will be integrated into the main
 * tarot module in future tasks.
 */

class FortuneClient {
  /**
   * @param {string} lambdaUrl - The Lambda Function URL
   * @param {number} maxRetries - Maximum retry attempts (default: 3 per requirements)
   * @param {number} timeout - Request timeout in ms (default: 30000 per requirements)
   */
  constructor(lambdaUrl, maxRetries = 3, timeout = 30000) {
    this.lambdaUrl = lambdaUrl;
    this.maxRetries = maxRetries;
    this.timeout = timeout;
  }

  /**
   * Generate a fortune from the Lambda function
   * 
   * @param {string} question - User's question (1-200 characters)
   * @param {Array} cards - Array of 3 card objects with name and position
   * @returns {Promise<string>} - Generated fortune text
   * @throws {Error} - If generation fails after all retries
   */
  async generateFortune(question, cards, attempt = 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.lambdaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: question,
          cards: cards
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Parse response
      const data = await response.json();

      // Handle error responses
      if (!response.ok) {
        throw new Error(`${data.error}: ${data.message}`);
      }

      return data.fortune;

    } catch (error) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (error.name === 'AbortError') {
        console.error(`Fortune generation timeout (attempt ${attempt}/${this.maxRetries})`);
        
        if (attempt < this.maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
          return this.generateFortune(question, cards, attempt + 1);
        }
        
        throw new Error('Fortune generation timed out after 3 attempts. Please try again later.');
      }

      // Handle network errors
      if (error.name === 'TypeError' || !navigator.onLine) {
        throw new Error('Fortune service is unavailable. Please check your connection and try again.');
      }

      // Handle validation errors (don't retry)
      if (error.message.includes('ValidationError')) {
        throw error;
      }

      // Handle server errors with retry
      if (attempt < this.maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`Server error, retrying in ${delay}ms...`);
        await this.sleep(delay);
        return this.generateFortune(question, cards, attempt + 1);
      }

      throw new Error('Fortune generation failed. Please try again later.');
    }
  }

  /**
   * Sleep helper for exponential backoff
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}


// ============================================
// Usage Examples
// ============================================

// Initialize client (Function URL will be configured after deployment)
const fortuneClient = new FortuneClient('https://YOUR_FUNCTION_URL.lambda-url.us-east-1.on.aws/');

// Example 1: Successful fortune generation
async function example1_success() {
  console.log('Example 1: Successful Fortune Generation');
  
  try {
    const fortune = await fortuneClient.generateFortune(
      'What does my future hold?',
      [
        { name: 'The Fool', position: 'past' },
        { name: 'The Magician', position: 'present' },
        { name: 'The World', position: 'future' }
      ]
    );
    
    console.log('Fortune received:', fortune);
    // Display fortune to user
    document.getElementById('fortune-text').textContent = fortune;
    
  } catch (error) {
    console.error('Error:', error.message);
    // Display error to user
    document.getElementById('error-message').textContent = error.message;
  }
}

// Example 2: Validation error
async function example2_validation_error() {
  console.log('Example 2: Validation Error');
  
  try {
    const fortune = await fortuneClient.generateFortune(
      '', // Empty question - will fail validation
      [
        { name: 'The Fool', position: 'past' },
        { name: 'The Magician', position: 'present' },
        { name: 'The World', position: 'future' }
      ]
    );
  } catch (error) {
    console.error('Validation error:', error.message);
    // Expected: "ValidationError: Question cannot be empty"
  }
}

// Example 3: With loading indicator
async function example3_with_loading() {
  console.log('Example 3: With Loading Indicator');
  
  const loadingEl = document.getElementById('loading-indicator');
  const fortuneEl = document.getElementById('fortune-text');
  const errorEl = document.getElementById('error-message');
  
  // Show loading
  loadingEl.style.display = 'block';
  errorEl.style.display = 'none';
  fortuneEl.style.display = 'none';
  
  try {
    const fortune = await fortuneClient.generateFortune(
      'Will my numbers bring me luck?',
      [
        { name: 'Ace of Cups', position: 'past' },
        { name: 'The Tower', position: 'present' },
        { name: 'The Sun', position: 'future' }
      ]
    );
    
    // Hide loading, show fortune
    loadingEl.style.display = 'none';
    fortuneEl.textContent = fortune;
    fortuneEl.style.display = 'block';
    
  } catch (error) {
    // Hide loading, show error
    loadingEl.style.display = 'none';
    errorEl.textContent = error.message;
    errorEl.style.display = 'block';
  }
}

// Example 4: Integration with retry button
async function example4_with_retry() {
  console.log('Example 4: With Retry Button');
  
  const retryBtn = document.getElementById('retry-button');
  
  async function generateWithRetry(question, cards) {
    retryBtn.disabled = true;
    retryBtn.textContent = 'Generating...';
    
    try {
      const fortune = await fortuneClient.generateFortune(question, cards);
      
      // Success
      document.getElementById('fortune-text').textContent = fortune;
      retryBtn.style.display = 'none';
      
    } catch (error) {
      // Failure
      document.getElementById('error-message').textContent = error.message;
      retryBtn.disabled = false;
      retryBtn.textContent = 'Retry';
      retryBtn.style.display = 'inline-block';
    }
  }
  
  // Attach to retry button
  retryBtn.addEventListener('click', () => {
    const question = document.getElementById('question-input').value;
    const cards = JSON.parse(document.getElementById('cards-data').textContent);
    generateWithRetry(question, cards);
  });
}


// ============================================
// Configuration Notes
// ============================================

/**
 * After Lambda deployment:
 * 
 * 1. Get the Function URL from AWS:
 *    aws lambda get-function-url-config \
 *      --function-name lotto-graveyard-fortune-generator \
 *      --region us-east-1 \
 *      --query 'FunctionUrl' \
 *      --output text
 * 
 * 2. Update the Lambda URL in your config:
 *    - Create js/config.js with:
 *      export const LAMBDA_FUNCTION_URL = 'https://YOUR_URL.lambda-url.us-east-1.on.aws/';
 * 
 * 3. Import and use in your tarot module:
 *    import { LAMBDA_FUNCTION_URL } from './config.js';
 *    const fortuneClient = new FortuneClient(LAMBDA_FUNCTION_URL);
 * 
 * 4. CORS is already configured in the Lambda function for '*' origins
 *    For production, update the Lambda CORS to allow only your domain
 */


// ============================================
// Error Handling Reference
// ============================================

/**
 * Error Types:
 * 
 * 1. ValidationError (400) - Bad request data
 *    - Don't retry
 *    - Display validation message to user
 *    - Examples:
 *      - "Question is required"
 *      - "Question must be 200 characters or less"
 *      - "Must provide exactly 3 cards"
 * 
 * 2. ServerError (500) - Lambda failure
 *    - Retry with exponential backoff
 *    - Display "try again later" message
 *    - Max 3 attempts
 * 
 * 3. Network Error - No connection
 *    - Check navigator.onLine
 *    - Display "check your connection" message
 *    - Provide retry button
 * 
 * 4. Timeout Error - 30 second timeout
 *    - Retry with exponential backoff
 *    - Max 3 attempts
 *    - Display timeout message after all attempts
 */
