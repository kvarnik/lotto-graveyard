# Fortune Client Implementation - Task 12.1

## Overview
The FortuneClient class provides client-side integration with the AWS Lambda Fortune Generator. It handles request formatting, timeout management, retry logic with exponential backoff, and UI display of fortunes and errors.

## Implementation Details

### File Created
- **`js/fortune-client.js`**: Main client class for Lambda communication

### File Updated
- **`js/tarot.js`**: Updated `generateFortune()` method to use FortuneClient

### Test File Created
- **`fortune-client-test.html`**: Manual test page for fortune generation

## Features Implemented

### 1. FortuneClient Class

#### Constructor
```javascript
new FortuneClient(lambdaUrl = CONFIG.FORTUNE_LAMBDA_URL)
```
- Accepts optional Lambda URL (defaults to config)
- Configures timeout (30 seconds) and max retries (3)

#### generateFortune Method
```javascript
async generateFortune(question, cards, attempt = 1)
```

**Input Validation:**
- Question: Required string, max 200 characters
- Cards: Array of exactly 3 cards with `name` and `position` properties

**Request Format:**
```json
{
  "question": "What does my future hold?",
  "cards": [
    { "name": "The Fool", "position": "past" },
    { "name": "The Magician", "position": "present" },
    { "name": "The World", "position": "future" }
  ]
}
```

**Response Handling:**
- Success (200): Returns fortune string
- Error (4xx/5xx): Throws error with appropriate message
- Validates fortune is at least 100 characters

**Timeout Management:**
- Uses AbortController with 30-second timeout
- Clears timeout on success or error
- Throws timeout error after all retries exhausted

**Retry Logic:**
- Max 3 retry attempts (per requirements)
- Exponential backoff: 1s, 2s, 4s
- Shows retry message to user
- Different error messages for timeout vs server errors

### 2. UI Integration Methods

#### displayFortune(fortune)
- Clears fortune container
- Splits text into paragraphs (on `\n\n`)
- Sets proper ARIA attributes
- Shows fortune section
- Smooth scrolls to fortune

#### displayError(errorMessage, retryCallback)
- Displays error message with ARIA alert
- Optionally shows retry button
- Shows fortune section
- Smooth scrolls to error

#### showRetryMessage(attempt)
- Displays "Retrying (X/3)..." message during retry attempts
- Appends to fortune container

### 3. Error Handling

**Error Types:**
- `FORTUNE_TIMEOUT`: 30-second timeout exceeded (all retries exhausted)
- `FORTUNE_ERROR`: Server error (HTTP 500/502/503) after retries
- `FORTUNE_UNAVAILABLE`: Network error (fetch failed) after retries
- Validation errors: Invalid inputs

**Error Flow:**
1. First attempt fails → Show "Retrying (1/3)" → Wait 1s → Retry
2. Second attempt fails → Show "Retrying (2/3)" → Wait 2s → Retry
3. Third attempt fails → Show "Retrying (3/3)" → Wait 4s → Retry
4. All retries exhausted → Show final error with retry button

### 4. Configuration

All configuration values come from `CONFIG` object in `js/config.js`:

```javascript
CONFIG.FORTUNE_LAMBDA_URL      // Lambda Function URL
CONFIG.FORTUNE_TIMEOUT_MS      // 30000 (30 seconds)
CONFIG.MAX_FORTUNE_RETRIES     // 3 attempts
CONFIG.QUESTION_MAX_LENGTH     // 200 characters
CONFIG.FORTUNE_MIN_LENGTH      // 100 characters
CONFIG.ERROR_MESSAGES          // All error message strings
```

## Integration with Tarot Module

The `TarotModule.generateFortune()` method now uses FortuneClient:

```javascript
async generateFortune(cards, question) {
    const fortuneClient = new FortuneClient();
    const fortune = await fortuneClient.generateFortune(question, cards);
    return fortune;
}
```

## Testing

### Manual Testing with Test Page

1. Open `fortune-client-test.html` in a browser
2. Verify Lambda URL is displayed from config
3. Modify the test question if desired
4. Click "Generate Fortune" button
5. Observe the response (fortune or error)

**Note:** The Lambda function must be deployed and the URL configured in `js/config.js` for the test to work.

### Expected Behavior

**Success Case:**
- Request sent to Lambda
- Fortune returned within 30 seconds
- Fortune displayed in formatted paragraphs
- Fortune section shown and scrolled into view

**Timeout Case:**
- Request sent to Lambda
- No response within 30 seconds
- Shows "Retrying (1/3)..." message
- Waits 1 second, retries
- After 3 failed attempts, shows timeout error with retry button

**Server Error Case:**
- Request sent to Lambda
- Server returns 500 error
- Shows "Retrying (1/3)..." message
- After 3 failed attempts, shows generation error with retry button

**Network Error Case:**
- Request sent to Lambda
- Network request fails
- After 3 failed attempts, shows unavailable error

## Requirements Satisfied

✅ **Requirement 9.2**: WHEN the System invokes the Fortune_Generator, THE System SHALL send an HTTPS request containing question text, card identities, and card positions

✅ **Requirement 9.6**: IF the Fortune_Generator does not respond within 30 seconds, THEN THE System SHALL terminate the request and display a timeout message indicating the fortune could not be generated

Additional requirements met:
- 30-second timeout per request
- Max 3 retry attempts (from Requirement 8.11)
- Exponential backoff between retries
- Display fortune in UI within 2 seconds of generation (Requirement 8.8)
- Display error messages when generation fails (Requirement 8.10)
- Provide retry option after errors (Requirements 8.9, 9.7)

## Next Steps (Task 12.2)

Task 12.2 will enhance the retry logic and potentially add:
- More sophisticated error classification
- User feedback during retries
- Cancel option during generation
- Loading states and animations

## Code Quality

- Full JSDoc comments on all methods
- Input validation with clear error messages
- Proper error handling and cleanup (timeout clearing)
- ARIA attributes for accessibility
- Module export for both browser and Node.js environments
- Follows existing code style and patterns
