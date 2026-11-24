# Implementation Plan: Lotto Graveyard

## Overview

The Lotto Graveyard is a static web application that analyzes Powerball lottery numbers against historical data and provides mystical tarot readings. Implementation uses vanilla JavaScript for the frontend, Python for the AWS Lambda fortune generator, and GitHub Actions for nightly data updates. The application features deterministic tarot card selection, in-browser OCR, and 1909 Rider-Waite artistic styling throughout.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Create directory structure for static site (`index.html`, `css/`, `js/`, `assets/`, `data/`)
  - Create Lambda function directory (`lambda/fortune-generator/`)
  - Create scripts directory for data pipeline (`scripts/`)
  - Initialize `package.json` for Lambda dependencies (Python runtime)
  - Create `.github/workflows/` for CI/CD
  - Set up `.gitignore` for node_modules, Python virtual environments, and sensitive files
  - Create `README.md` with project overview and setup instructions
  - _Requirements: 11.1, 11.2, 11.3, 11.8_

- [x] 2. Create base HTML structure with Rider-Waite styling
  - [x] 2.1 Build responsive HTML layout with semantic elements
    - Create `index.html` with header, main sections, and footer
    - Add viewport meta tag for responsive design
    - Include section placeholders for input, tombstone, and tarot reading
    - Add ARIA landmarks and accessibility attributes
    - _Requirements: 10.1, 10.2, 10.3, 12.1_
  
  - [x] 2.2 Implement CSS styling with 1909 Rider-Waite theme
    - Create `css/main.css` with grayscale color palette and serif typography
    - Implement responsive breakpoints (768px, 1024px)
    - Style tombstone component with decorative borders
    - Ensure minimum 4.5:1 contrast ratio for all text
    - Set minimum font sizes (24pt for numbers, 14pt for body text)
    - Add minimum 44px touch targets for mobile
    - _Requirements: 4.8, 4.9, 4.10, 4.11, 10.4, 10.5, 10.9, 12.1, 12.3, 12.4, 12.6, 12.7_
  
  - [x] 2.3 Add tarot card images and decorative assets
    - Source or create 78 Rider-Waite tarot card images (public domain 1909 versions)
    - Optimize images for web (<100KB each, 400x700px minimum)
    - Place images in `assets/tarot/` directory
    - Create tarot deck data structure in `js/tarot-deck.js` with all 78 cards
    - Add decorative border SVGs or images for tombstone
    - _Requirements: 7.6, 12.2, 12.5_

- [x] 3. Implement Input Module
  - [x] 3.1 Create manual number input form
    - Build HTML form with 5 white ball inputs (1-69) and 1 powerball input (1-26)
    - Add input labels with accessible markup (label, aria-required, aria-invalid)
    - Create submit button and mode toggle (manual/webcam)
    - Implement input field styling with focus indicators
    - _Requirements: 1.1, 1.3_
  
  - [x] 3.2 Implement lottery number validation
    - Create `js/validation.js` with `validateLotteryNumbers()` function
    - Validate exactly 5 white balls in range 1-69, all unique
    - Validate exactly 1 powerball in range 1-26
    - Return structured validation result with error messages
    - Display inline error messages next to invalid fields
    - _Requirements: 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.15_
  
  - [ ]* 3.3 Write property test for lottery number validation
    - **Property 1: Lottery Number Validation**
    - **Validates: Requirements 1.5, 1.6, 1.7, 1.8**
    - Use fast-check to generate random valid/invalid lottery numbers
    - Test that all valid inputs (5 unique numbers 1-69, 1 powerball 1-26) are accepted
    - Test that all invalid inputs are rejected with appropriate errors
    - Run minimum 100 iterations
  
  - [x] 3.4 Create InputModule class and wire manual input flow
    - Create `js/input.js` with `InputModule` class
    - Implement `init()`, `onNumbersValidated()`, `getLotteryNumbers()`, `reset()` methods
    - Handle form submission with validation
    - Normalize white balls (sort ascending, remove duplicates)
    - Trigger callback with validated lottery numbers
    - _Requirements: 1.3, 1.5_

- [x] 4. Implement Webcam Scanner Module
  - [x] 4.1 Set up webcam access and video stream
    - Create `js/webcam-scanner.js` with `WebcamScanner` class
    - Implement `startCamera()` to request camera permissions
    - Display live video feed in HTML video element
    - Handle permission denial with error message and manual input fallback
    - Implement `stopCamera()` to release camera resources
    - Support front/rear camera selection on mobile
    - _Requirements: 2.1, 2.2, 2.3, 10.7_
  
  - [x] 4.2 Integrate Tesseract.js for OCR
    - Install Tesseract.js v5+ via CDN or npm
    - Configure OCR settings (lang: 'eng', oem: 1, psm: 6, whitelist: '0123456789 ')
    - Implement `scanFrame()` to capture and process current video frame
    - _Requirements: 2.4_
  
  - [x] 4.3 Implement image preprocessing pipeline
    - Create `preprocessImage()` function with grayscale conversion
    - Apply contrast enhancement (factor 1.5)
    - Implement adaptive thresholding for binarization
    - Add morphological closing to reduce noise
    - _Requirements: 2.4_
  
  - [x] 4.4 Build number extraction and validation
    - Parse Tesseract OCR text output for digit sequences
    - Apply heuristics to identify 5 white balls (1-69) and 1 powerball (1-26)
    - Validate extracted numbers using `validateLotteryNumbers()`
    - Implement 30-second timeout for continuous scanning
    - Display extracted numbers for user confirmation
    - Provide retry and manual input fallback options
    - _Requirements: 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 1.14_
  
  - [ ]* 4.5 Write unit tests for OCR preprocessing
    - Test grayscale conversion with sample images
    - Test contrast enhancement produces expected values
    - Test adaptive thresholding edge cases
    - Mock Tesseract.js and test number extraction logic

- [x] 5. Create historical data pipeline
  - [x] 5.1 Design historical data JSON schema
    - Create `data/historical-data.json` with schema: `{ lastUpdated, totalDrawings, drawings[] }`
    - Each drawing: `{ drawDate: "YYYY-MM-DD", whiteBalls: [n1, n2, n3, n4, n5], powerball: n, jackpot?: n }`
    - Sort white balls ascending in each drawing
    - Sort drawings by date (newest first)
    - _Requirements: 11.4_
  
  - [x] 5.2 Create data fetcher script
    - Create `scripts/fetch-powerball-data.js` (or `.py`) to fetch Powerball results
    - Use lottery API or scrape official Powerball website
    - Transform raw data to our JSON schema
    - Handle errors gracefully with exit codes
    - Write updated data to `data/historical-data.json`
    - _Requirements: 11.5_
  
  - [x] 5.3 Set up GitHub Actions workflow for nightly updates
    - Create `.github/workflows/update-lottery-data.yml`
    - Configure cron schedule: `0 2 * * *` (2am UTC daily)
    - Add manual workflow_dispatch trigger
    - Install dependencies, run fetch script, commit/push if changed
    - Use github-actions bot for commits
    - _Requirements: 11.5_
  
  - [ ]* 5.4 Write unit tests for data fetcher
    - Mock API/scraping responses
    - Test data transformation to JSON schema
    - Test error handling (network failures, malformed data)
    - Test file writing and sorting logic

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Historical Analysis Module
  - [x] 7.1 Create data loader with caching
    - Create `js/data-loader.js` with `DataLoader` class
    - Implement `loadHistoricalData()` to fetch `data/historical-data.json`
    - Check localStorage cache validity (per browsing session)
    - Cache fetched data in localStorage
    - Handle fetch errors with timeout and error messages
    - _Requirements: 11.6, 11.7, 11.10_
  
  - [x] 7.2 Implement historical match analysis
    - Create `js/analysis.js` with `HistoricalAnalysis` class
    - Implement `analyze(lotteryNumbers)` function
    - Query drawings for exact matches (all 5 white + powerball)
    - Calculate match counts for each drawing (white matches + powerball match)
    - Identify closest near-miss (maximum total matches)
    - Determine date range (earliest to latest drawing)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ]* 7.3 Write property test for historical match detection
    - **Property 3: Historical Match Detection**
    - **Validates: Requirements 3.1, 3.2, 3.3**
    - Generate random lottery numbers and historical drawings
    - Verify match counts are correct (0-5 white balls, true/false powerball)
    - Verify exact matches are detected when all 6 numbers match
    - Run minimum 100 iterations
  
  - [ ]* 7.4 Write property test for closest match identification
    - **Property 4: Closest Match Identification**
    - **Validates: Requirements 3.4**
    - Generate random lottery numbers and drawings with known best match
    - Verify system identifies drawing with maximum total matches
    - Test with ties (multiple drawings with same match count)
    - Run minimum 100 iterations
  
  - [x] 7.5 Implement frequency calculation for past year
    - Filter drawings to past 365 days from latest drawing date
    - Count occurrences of each white ball from lottery numbers
    - Count occurrences of powerball from lottery numbers
    - Track white balls and powerball separately
    - Return frequency object: `{ whiteBalls: { [num]: count }, powerball: count }`
    - _Requirements: 3.6, 3.7, 3.8, 3.9, 3.10_
  
  - [ ]* 7.6 Write property test for frequency calculation accuracy
    - **Property 5: Frequency Calculation Accuracy**
    - **Validates: Requirements 3.6, 3.7, 3.8**
    - Generate random past-year drawings and lottery numbers
    - Manually count expected frequencies
    - Verify calculated frequencies match expected counts
    - Verify white balls and powerball tracked separately
    - Run minimum 100 iterations

- [x] 8. Build Tombstone Renderer
  - [x] 8.1 Implement epitaph text generation
    - Create `js/tombstone.js` with `TombstoneRenderer` class
    - Implement `generateEpitaph(analysisResult)` function
    - Format lottery numbers prominently
    - Include win status (exact match or never won)
    - Include closest match statistics (white matches + powerball)
    - Include date range analyzed
    - Include past year frequency for each number
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7_
  
  - [x] 8.2 Render tombstone with responsive layout
    - Implement `render(analysisResult, containerElement)` function
    - Display lottery numbers at minimum 24pt font (or 150% of body)
    - Display epitaph text with minimum 14pt font
    - Apply grayscale styling and serif typography
    - Add Rider-Waite decorative border elements
    - Implement vertical layout for desktop (>=768px, min 400px width)
    - Implement single-column layout for mobile (<768px, viewport width - 32px)
    - Handle empty analysis data with error message
    - _Requirements: 4.1, 4.2, 4.8, 4.9, 4.10, 4.11, 4.12_
  
  - [ ]* 8.3 Write unit tests for tombstone rendering
    - Test epitaph generation with various analysis results
    - Test exact match formatting
    - Test never-won formatting
    - Test frequency display formatting
    - Test responsive layout rendering at different viewport sizes

- [x] 9. Implement Tarot Module
  - [x] 9.1 Create deterministic card selection algorithm
    - Create `js/tarot.js` with `TarotModule` class
    - Install seedrandom library via CDN or npm
    - Implement `createSeed(lotteryNumbers, question)` to generate deterministic seed
    - Implement `selectCards(lotteryNumbers, question)` using Fisher-Yates shuffle with seeded RNG
    - Select first 3 unique cards from shuffled deck
    - Return cards with positions: ['past', 'present', 'future']
    - _Requirements: 7.2, 7.3_
  
  - [ ]* 9.2 Write property test for deterministic card selection
    - **Property 6: Deterministic Card Selection**
    - **Validates: Requirements 7.2, 7.3**
    - Generate random lottery numbers and questions
    - Run card selection multiple times with same seed
    - Verify identical card sequences produced
    - Run minimum 100 iterations
  
  - [ ]* 9.3 Write property test for card uniqueness
    - **Property 7: Card Uniqueness**
    - **Validates: Requirements 7.4**
    - Generate random seeds (lottery numbers + questions)
    - Verify selected 3 cards have distinct IDs
    - Verify no card ID appears more than once
    - Run minimum 100 iterations
  
  - [ ]* 9.4 Write property test for valid card selection
    - **Property 8: Valid Card Selection**
    - **Validates: Requirements 7.2**
    - Generate random seeds
    - Verify all selected card IDs are in range [0, 77]
    - Verify cards correspond to valid tarot deck positions
    - Run minimum 100 iterations
  
  - [x] 9.5 Implement tarot reading prompt and question collection
    - Implement `showPrompt(lotteryNumbers, containerElement)` after tombstone display
    - Display message prompting user for tarot reading
    - Show lottery numbers in prompt
    - Add accept and decline buttons with Rider-Waite styling
    - Implement `collectQuestion()` with text input (200 char max)
    - Validate question has at least 1 non-whitespace character
    - Display validation errors for empty or too-long questions
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3_
  
  - [ ]* 9.6 Write property test for question validation
    - **Property 2: Question Validation**
    - **Validates: Requirements 6.4, 6.5, 6.6**
    - Generate random strings with varying lengths and content
    - Verify strings with 1-200 non-whitespace chars are accepted
    - Verify empty, whitespace-only, or >200 char strings are rejected
    - Run minimum 100 iterations
  
  - [x] 9.7 Implement tarot reading display
    - Implement `displayReading(cards, fortune, containerElement)`
    - Display 3 cards with Rider-Waite imagery (400x700px minimum)
    - Show card names and position labels (Past, Present, Future)
    - Display fortune text below cards
    - Apply Rider-Waite styling throughout
    - Add alt text for card images (accessibility)
    - _Requirements: 7.6, 7.7, 8.12_

- [x] 10. Create AWS Lambda Fortune Generator
  - [x] 10.1 Set up Lambda function structure
    - Create `lambda/fortune-generator/index.py` with handler function
    - Create `lambda/fortune-generator/requirements.txt` for Python dependencies
    - Add dependencies: boto3 (for AWS Bedrock), requests (for external APIs)
    - _Requirements: 9.1_
  
  - [x] 10.2 Implement fortune generation handler
    - Parse JSON request body for question and 3 cards with positions
    - Validate question length (1-200 chars) and card count (exactly 3)
    - Return 400 error for invalid input
    - Build AI prompt with question, cards, and positions
    - Call AI service (AWS Bedrock, OpenAI, Anthropic, etc.)
    - Validate fortune length (minimum 100 characters)
    - Ensure fortune mentions question topic, all 3 card names, and positions
    - Return JSON response with fortune and timestamp
    - Return 500 error for generation failures
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.8_
  
  - [x] 10.3 Configure CORS for static site access
    - Add CORS headers to all responses: Access-Control-Allow-Origin, Methods, Headers
    - Support preflight OPTIONS requests
    - Set MaxAge to 24 hours
    - _Requirements: 9.2_
  
  - [x] 10.4 Implement error handling and logging
    - Wrap generation in try-catch with structured error responses
    - Log all requests and errors to CloudWatch
    - Include request ID for tracing
    - Set Lambda timeout to 30 seconds
    - _Requirements: 8.3, 8.9_
  
  - [ ]* 10.5 Write unit tests for Lambda function
    - Mock AI service responses
    - Test valid request returns fortune >= 100 chars
    - Test invalid requests return 400 errors (bad question, wrong card count)
    - Test AI service errors return 500 errors
    - Test CORS headers present in all responses
    - Test timeout handling

- [x] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement Fortune Client
  - [x] 12.1 Create client for Lambda function URL
    - Create `js/fortune-client.js` with `FortuneClient` class
    - Implement `generateFortune(question, cards, attempt)` with fetch API
    - Set 30-second timeout using AbortController
    - Parse JSON response and extract fortune text
    - _Requirements: 8.7, 9.2_
  
  - [x] 12.2 Add retry logic with exponential backoff
    - Implement retry on timeout or network errors (max 3 attempts)
    - Use exponential backoff: 1s, 2s, 4s delays
    - Display retry progress to user
    - After 3 failures, display error message with manual retry button
    - _Requirements: 8.9, 8.10, 8.11, 9.7_
  
  - [ ]* 12.3 Write integration tests for Fortune Client
    - Mock Lambda responses (success, timeout, errors)
    - Test successful fortune generation
    - Test timeout handling with retry
    - Test max retry exhaustion
    - Test HTTP error responses (400, 500)
    - Test network unavailability

- [x] 13. Wire complete user flows
  - [x] 13.1 Integrate manual input flow
    - Connect InputModule to HistoricalAnalysis
    - Trigger analysis when valid numbers submitted
    - Pass analysis result to TombstoneRenderer
    - Display tombstone in main container
    - _Requirements: 1.1, 1.3, 1.5, 3.1, 4.1_
  
  - [x] 13.2 Integrate webcam scanning flow
    - Connect WebcamScanner to InputModule
    - Display extracted numbers for confirmation
    - Trigger analysis on confirmation
    - Handle scan failures with manual input fallback
    - _Requirements: 1.2, 1.4, 2.1, 2.3, 2.9, 2.10_
  
  - [x] 13.3 Integrate tarot reading flow
    - Display tarot prompt after tombstone renders
    - Collect user question on accept
    - Select cards deterministically using lottery numbers + question
    - Call Lambda to generate fortune
    - Display complete reading (cards + fortune)
    - Handle decline by resetting to input screen
    - Validate lottery numbers available before tarot reading
    - _Requirements: 5.1, 5.4, 5.5, 6.7, 7.1, 7.5, 7.8, 8.1, 8.7, 8.8_
  
  - [x] 13.4 Implement state management and navigation
    - Create app state machine: INPUT → ANALYSIS → TOMBSTONE → TAROT_PROMPT → QUESTION → READING
    - Add reset/back navigation controls
    - Preserve state during orientation changes
    - Clear sensitive data on reset
    - _Requirements: 10.6, 5.5_
  
  - [ ]* 13.5 Write end-to-end integration tests
    - Test complete manual input flow
    - Test complete webcam flow with mocked OCR
    - Test complete tarot flow with mocked Lambda
    - Test error recovery paths
    - Test navigation and state transitions

- [x] 14. Implement accessibility features
  - [x] 14.1 Add ARIA labels and semantic HTML
    - Use semantic elements: header, nav, main, section, article
    - Add ARIA labels to custom controls
    - Add alt text to all images (tarot cards, decorative elements)
    - Use descriptive link text and button labels
    - Add skip links for main content
    - _Requirements: 10.9_
  
  - [x] 14.2 Ensure keyboard navigation
    - Test all interactive elements accessible via Tab key
    - Verify logical tab order through form fields and buttons
    - Add visible focus indicators (outline, highlight)
    - Support Enter/Space for button activation
    - Test webcam controls with keyboard
    - _Requirements: 10.8, 10.9_
  
  - [x] 14.3 Validate color contrast and responsive text
    - Verify minimum 4.5:1 contrast ratio for all text
    - Test tombstone text contrast against background
    - Ensure minimum 14px font size on mobile
    - Test text scaling with browser zoom (up to 200%)
    - Verify no horizontal scrolling at any breakpoint
    - _Requirements: 12.3, 12.6, 12.7, 10.1, 10.2, 10.3_
  
  - [ ]* 14.4 Manual accessibility testing
    - Test with screen reader (VoiceOver, NVDA, or JAWS)
    - Test keyboard-only navigation
    - Test with browser zoom and text scaling
    - Test on mobile with assistive touch
    - Verify touch target sizes (44x44px minimum)

- [x] 15. Set up deployment infrastructure
  - [x] 15.1 Deploy Lambda function with CDK
    - Create `cdk/` directory with AWS CDK app
    - Define Lambda function in `lib/lotto-graveyard-stack.ts` (or Python CDK)
    - Configure Function URL with CORS settings
    - Set environment variables (AI_MODEL_ENDPOINT, AI_API_KEY from Secrets Manager)
    - Set timeout to 30 seconds and memory to 512MB
    - Configure CloudWatch log retention (7 days)
    - Deploy stack and capture Function URL
    - _Requirements: 9.1, 9.2_
  
  - [x] 15.2 Configure static site hosting
    - Choose GitHub Pages or AWS S3+CloudFront
    - If GitHub Pages: Enable in repository settings, set source branch
    - If S3: Create bucket, enable static website hosting, configure CloudFront distribution
    - Set up custom domain with SSL (optional)
    - _Requirements: 11.1, 11.2, 11.3_
  
  - [x] 15.3 Create deployment workflow
    - Create `.github/workflows/deploy.yml` for CI/CD
    - Trigger on push to main branch
    - Build static assets (if needed)
    - Deploy to GitHub Pages or S3
    - Run smoke tests after deployment
    - _Requirements: 11.3, 11.11_
  
  - [x] 15.4 Configure environment variables for static site
    - Create `js/config.js` with Lambda URL and data file path
    - Inject FORTUNE_LAMBDA_URL at build time or hardcode for single deployment
    - Set DATA_FILE_PATH to `/data/historical-data.json`
    - Set TAROT_IMAGES_PATH to `/assets/tarot`
    - _Requirements: 9.2, 11.6_

- [x] 16. Set up monitoring and security
  - [x] 16.1 Configure CloudWatch monitoring for Lambda
    - Set up CloudWatch alarms: error rate >5%, duration >25s, throttles >0
    - Configure structured JSON logging in Lambda handler
    - Create dashboard with key metrics (invocations, duration, errors, throttles)
    - _Requirements: 9.1_
  
  - [x] 16.2 Implement rate limiting and security measures
    - Set Lambda reserved concurrency to prevent abuse
    - Store AI API keys in AWS Secrets Manager (not environment variables)
    - Restrict CORS to specific domain in production (not '*')
    - Add Content Security Policy headers to static site
    - Implement input sanitization for user questions
    - _Requirements: 9.4_
  
  - [x] 16.3 Add privacy and security documentation
    - Document that webcam OCR runs entirely client-side
    - Add privacy policy noting questions sent to Lambda
    - Add disclaimer about question content
    - Document data retention (no PII stored)
    - Create security.md with responsible disclosure

- [x] 17. Final checkpoint and polish
  - [x] 17.1 Cross-browser testing
    - Test on Chrome/Edge (latest)
    - Test on Firefox (latest)
    - Test on Safari (macOS and iOS latest)
    - Test on mobile browsers (iOS Safari, Chrome Android)
    - Verify WebRTC camera access works on all platforms
    - _Requirements: 10.1, 10.2, 10.3, 10.7_
  
  - [x] 17.2 Performance optimization
    - Measure page load time (<5s on broadband)
    - Optimize historical data fetch (<2s)
    - Optimize analysis computation (<500ms)
    - Optimize tombstone render (<100ms)
    - Compress tarot images if needed
    - Add loading indicators for async operations
    - _Requirements: 11.11, 8.7_
  
  - [x] 17.3 Final end-to-end testing
    - Test complete user journey: input → analysis → tombstone → tarot → fortune
    - Test all error paths and recovery
    - Test with real lottery ticket scanning
    - Test Lambda fortune generation with real AI model
    - Verify nightly data update GitHub Action runs successfully
    - Test responsive design on real devices
  
  - [x] 17.4 Documentation and README
    - Update README with setup instructions, architecture overview, deployment steps
    - Document environment variables and configuration
    - Add screenshots of key features
    - Document API schema for Lambda function
    - Add troubleshooting guide for common issues

- [x] 18. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based and unit test tasks that can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation at logical breaks
- The implementation uses Python for the Lambda function (backend) and vanilla JavaScript for the frontend
- Tesseract.js and seedrandom libraries are essential dependencies
- All styling follows 1909 Rider-Waite artistic theme with grayscale palette and serif typography
- Historical data updates nightly via GitHub Actions without manual intervention
- Lambda function uses AWS Bedrock or external AI API for fortune generation
- Complete WCAG 2.1 AA compliance for accessibility

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "5.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "5.2"] },
    { "id": 3, "tasks": ["3.1"] },
    { "id": 4, "tasks": ["3.2"] },
    { "id": 5, "tasks": ["3.3", "3.4", "4.1", "5.3"] },
    { "id": 6, "tasks": ["4.2", "5.4"] },
    { "id": 7, "tasks": ["4.3"] },
    { "id": 8, "tasks": ["4.4"] },
    { "id": 9, "tasks": ["4.5"] },
    { "id": 10, "tasks": ["6"] },
    { "id": 11, "tasks": ["7.1"] },
    { "id": 12, "tasks": ["7.2"] },
    { "id": 13, "tasks": ["7.3", "7.4"] },
    { "id": 14, "tasks": ["7.5"] },
    { "id": 15, "tasks": ["7.6", "8.1"] },
    { "id": 16, "tasks": ["8.2"] },
    { "id": 17, "tasks": ["8.3", "9.1"] },
    { "id": 18, "tasks": ["9.2", "9.3", "9.4"] },
    { "id": 19, "tasks": ["9.5"] },
    { "id": 20, "tasks": ["9.6"] },
    { "id": 21, "tasks": ["9.7", "10.1"] },
    { "id": 22, "tasks": ["10.2"] },
    { "id": 23, "tasks": ["10.3", "10.4"] },
    { "id": 24, "tasks": ["10.5"] },
    { "id": 25, "tasks": ["11"] },
    { "id": 26, "tasks": ["12.1"] },
    { "id": 27, "tasks": ["12.2"] },
    { "id": 28, "tasks": ["12.3", "13.1", "13.2"] },
    { "id": 29, "tasks": ["13.3"] },
    { "id": 30, "tasks": ["13.4"] },
    { "id": 31, "tasks": ["13.5", "14.1"] },
    { "id": 32, "tasks": ["14.2", "14.3"] },
    { "id": 33, "tasks": ["14.4", "15.1"] },
    { "id": 34, "tasks": ["15.2"] },
    { "id": 35, "tasks": ["15.3"] },
    { "id": 36, "tasks": ["15.4", "16.1"] },
    { "id": 37, "tasks": ["16.2", "16.3"] },
    { "id": 38, "tasks": ["17.1", "17.2"] },
    { "id": 39, "tasks": ["17.3"] },
    { "id": 40, "tasks": ["17.4"] },
    { "id": 41, "tasks": ["18"] }
  ]
}
```
