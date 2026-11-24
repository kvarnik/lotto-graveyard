# Lotto Graveyard

A web application that analyzes Powerball lottery numbers against historical data and provides mystical tarot readings. The project features a 1909 Rider-Waite artistic theme throughout.

## Overview

The Lotto Graveyard allows users to:
- **Enter lottery numbers** manually or via webcam scanning
- **View historical analysis** showing if numbers ever won and closest near-misses
- **See frequency statistics** for how often each number appeared in the past year
- **Receive tarot readings** with AI-generated fortunes based on their numbers

## Architecture

### Frontend (Static Site)
- **Technology**: Vanilla HTML, CSS, JavaScript (ES6+)
- **Dependencies**: 
  - Tesseract.js v5+ (OCR for ticket scanning)
  - seedrandom (deterministic RNG for tarot cards)
- **Hosting**: GitHub Pages or S3 + CloudFront
- **Features**:
  - Manual number input with validation
  - Webcam-based lottery ticket scanning (client-side OCR)
  - Historical analysis with tombstone display
  - Deterministic three-card tarot spread
  - Responsive design (mobile, tablet, desktop)
  - Full WCAG 2.1 AA accessibility compliance

### Backend (AWS Lambda)
- **Runtime**: Python 3.11+
- **Function**: Fortune Generator
- **Deployment**: AWS Lambda with Function URL
- **Purpose**: Generates AI-powered tarot fortune interpretations
- **AI Integration**: AWS Bedrock or external AI API

### Data Pipeline
- **Storage**: Flat JSON file (`data/historical-data.json`)
- **Updates**: GitHub Actions cron job (nightly at 2am UTC)
- **Source**: Powerball official API or website scraping
- **Format**: Historical drawings with dates, numbers, and jackpot amounts

## Project Structure

```
lotto-graveyard/
├── index.html              # Main HTML page
├── css/                    # Stylesheets
│   └── main.css           # Main styles with Rider-Waite theme
├── js/                     # JavaScript modules
│   ├── input.js           # Input module (manual + webcam)
│   ├── webcam-scanner.js  # Webcam scanning with OCR
│   ├── validation.js      # Number validation
│   ├── data-loader.js     # Historical data fetching/caching
│   ├── analysis.js        # Historical analysis logic
│   ├── tombstone.js       # Tombstone renderer
│   ├── tarot.js           # Tarot card selection & display
│   ├── tarot-deck.js      # 78-card tarot deck data
│   ├── fortune-client.js  # Lambda client with retry logic
│   └── config.js          # Configuration (Lambda URL, etc.)
├── assets/                 # Static assets
│   └── tarot/             # 78 Rider-Waite tarot card images
├── data/                   # Historical data
│   └── historical-data.json # Powerball historical results
├── lambda/                 # AWS Lambda functions
│   └── fortune-generator/
│       ├── index.py       # Lambda handler
│       └── requirements.txt # Python dependencies
├── cdk/                    # AWS CDK infrastructure
│   ├── lib/               # CDK stack definitions
│   ├── bin/               # CDK app entry point
│   ├── scripts/           # Deployment scripts
│   ├── package.json       # CDK dependencies
│   ├── README.md          # CDK documentation
│   └── DEPLOYMENT_GUIDE.md # Quick start guide
├── scripts/                # Data pipeline scripts
│   └── fetch-powerball-data.js # Nightly data fetcher
├── .github/workflows/      # CI/CD
│   ├── update-lottery-data.yml # Nightly data update
│   └── deploy.yml         # Deployment workflow
└── README.md              # This file
```

## Setup Instructions

### Prerequisites
- Node.js 20+ (for scripts and development)
- Python 3.11+ (for Lambda function)
- AWS Account (for Lambda deployment)
- AWS CLI configured (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lotto-graveyard
   ```

2. **Install frontend dependencies** (if using npm for development)
   ```bash
   npm install
   ```

3. **Install Lambda dependencies**
   ```bash
   cd lambda/fortune-generator
   pip install -r requirements.txt
   cd ../..
   ```

4. **Configure Lambda URL**
   - Update `js/config.js` with your Lambda Function URL after deployment

5. **Serve the static site locally**
   ```bash
   # Using Python's built-in server
   python -m http.server 8000
   
   # Or using Node's http-server
   npx http-server -p 8000
   ```

6. **Access the application**
   - Open `http://localhost:8000` in your browser

### Deployment

#### Quick Start

For complete deployment instructions, see **[DEPLOYMENT.md](DEPLOYMENT.md)**.

#### Deploy Lambda Function (Backend)

The Lambda function provides AI-powered fortune generation. Deploy using AWS CDK:

1. **Navigate to CDK directory**
   ```bash
   cd cdk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run deployment script**
   ```bash
   ./scripts/deploy.sh
   ```

4. **Copy the Function URL** from the output and update `js/config.js`

For detailed Lambda deployment instructions, see [cdk/DEPLOYMENT_GUIDE.md](cdk/DEPLOYMENT_GUIDE.md).

#### Deploy Static Site (Frontend)

Choose one of two deployment options:

**Option 1: GitHub Pages (Recommended for Quick Start)**

Easiest deployment with free hosting:

```bash
# Run the setup helper script
./scripts/deploy-github-pages.sh

# Or manually:
# 1. Push code to GitHub
# 2. Enable GitHub Pages in repository settings
# 3. Wait for automatic deployment via GitHub Actions
```

Your site will be available at: `https://<username>.github.io/<repo-name>`

**Option 2: AWS S3 + CloudFront (Production)**

Best performance with global CDN:

```bash
# Run the deployment script
./scripts/deploy-s3.sh [bucket-name] [cloudfront-distribution-id]

# Example:
./scripts/deploy-s3.sh lotto-graveyard ABCDEFGHIJK
```

Your site will be available at: `https://<distribution-id>.cloudfront.net`

**For complete deployment documentation**, including:
- Detailed setup instructions for both options
- Custom domain configuration
- GitHub Actions automation
- Troubleshooting guide

See **[DEPLOYMENT.md](DEPLOYMENT.md)**

### Environment Variables

**Lambda Function:**
- `AI_API_KEY` - API key for AI service (Bedrock, OpenAI, etc.)
- `AI_MODEL_ENDPOINT` - (Optional) Custom AI endpoint URL

**Static Site:**
- Update `js/config.js` with:
  - `FORTUNE_LAMBDA_URL` - Your Lambda Function URL
  - `DATA_FILE_PATH` - Path to historical data JSON
  - `TAROT_IMAGES_PATH` - Path to tarot card images

## GitHub Actions

### Nightly Data Update
- **Schedule**: Daily at 2am UTC
- **Workflow**: `.github/workflows/update-lottery-data.yml`
- **Action**: Fetches latest Powerball results and commits to repository
- **Trigger**: Automatic (cron) or manual (workflow_dispatch)

### Deployment
- **Trigger**: Push to `main` branch
- **Workflow**: `.github/workflows/deploy.yml`
- **Action**: Deploys static site to hosting platform

## Testing

### Unit Tests
Run unit tests for data processing and validation:
```bash
npm test
```

### Property-Based Tests
Run property-based tests (requires fast-check):
```bash
npm run test:property
```

### Manual Testing
- Test manual number input with valid/invalid values
- Test webcam scanning with real lottery tickets
- Test responsive design on various devices
- Test accessibility with screen readers
- Test Lambda fortune generation end-to-end

## Features

### Number Input
- **Manual Entry**: 5 white balls (1-69) + 1 Powerball (1-26)
- **Validation**: Real-time validation with error messages
- **Webcam Scanning**: Client-side OCR using Tesseract.js
- **Camera Support**: Front/rear camera selection on mobile
- **Fallback**: Manual input if OCR fails

### Historical Analysis
- **Exact Matches**: Identifies if numbers ever won jackpot
- **Near Misses**: Finds closest match (most matching numbers)
- **Frequency Stats**: Past year occurrence for each number
- **Date Range**: Shows span of historical data analyzed

### Tombstone Display
- **Visual Design**: 1909 Rider-Waite themed tombstone
- **Epitaph**: Detailed performance history
- **Responsive**: Adapts to desktop, tablet, mobile
- **Typography**: Minimum 24pt for numbers, serif fonts
- **Grayscale Palette**: Black, white, grays

### Tarot Reading
- **Deterministic**: Same numbers + question = same cards
- **Three-Card Spread**: Past, Present, Future
- **Card Selection**: Seeded shuffle of 78-card deck
- **Imagery**: Authentic 1909 Rider-Waite card images
- **AI Fortune**: Generated interpretation via Lambda

### Accessibility
- **WCAG 2.1 AA Compliant**
- **Screen Reader Support**: ARIA labels, semantic HTML
- **Keyboard Navigation**: Full keyboard access
- **Touch Targets**: Minimum 44px for mobile
- **Contrast Ratio**: Minimum 4.5:1 for all text
- **Responsive Text**: Minimum 14px on mobile

## API Documentation

### Fortune Generator Lambda

**Endpoint**: POST `https://<function-url>.lambda-url.<region>.on.aws/`

**Request**:
```json
{
  "question": "Will I find success in my career?",
  "cards": [
    { "name": "The Fool", "position": "past" },
    { "name": "The Magician", "position": "present" },
    { "name": "The World", "position": "future" }
  ]
}
```

**Response** (200 OK):
```json
{
  "fortune": "The Fool in your past suggests...",
  "generatedAt": "2025-01-15T12:34:56Z"
}
```

**Error** (400 Bad Request):
```json
{
  "error": "ValidationError",
  "message": "Invalid question length"
}
```

**Error** (500 Internal Server Error):
```json
{
  "error": "ServerError",
  "message": "Fortune generation failed"
}
```

## Troubleshooting

### Webcam not working
- Check browser permissions for camera access
- Ensure HTTPS is enabled (required for camera API)
- Try different browser (Chrome, Firefox, Safari)
- Use manual input as fallback

### Historical data not loading
- Check network connection
- Verify `data/historical-data.json` exists
- Clear browser cache and reload
- Check browser console for errors

### Fortune generation timeout
- Check Lambda function logs in CloudWatch
- Verify Function URL is correct in `js/config.js`
- Check CORS configuration on Lambda
- Try retry button (up to 3 attempts)

### Cards not displaying
- Verify tarot images exist in `assets/tarot/`
- Check image file names match `tarot-deck.js` data
- Clear browser cache
- Check browser console for 404 errors

## License

This project uses public domain 1909 Rider-Waite tarot card imagery.

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section above
