# Lotto Graveyard CDK Infrastructure

This directory contains AWS CDK infrastructure code for deploying the Fortune Generator Lambda function.

## Overview

The CDK stack creates:
- **Lambda Function**: Python 3.11 runtime with the fortune generation code
- **IAM Role**: With permissions to invoke AWS Bedrock AI models
- **Function URL**: Public HTTPS endpoint with CORS configuration
- **CloudWatch Logs**: 7-day retention for monitoring

## Architecture

```
┌─────────────────┐
│  Static Site    │
│ (GitHub Pages)  │
└────────┬────────┘
         │
         │ HTTPS POST
         │ (CORS enabled)
         ▼
┌─────────────────────────┐
│  Lambda Function URL    │
│  (Public endpoint)      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Lambda Function        │
│  - Python 3.11          │
│  - 30s timeout          │
│  - 256MB memory         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  AWS Bedrock            │
│  (Claude 3 Haiku)       │
└─────────────────────────┘
```

## Prerequisites

1. **AWS Account**: You need an AWS account with appropriate permissions
2. **AWS CLI**: Installed and configured with credentials
3. **Node.js**: Version 18+ (for CDK)
4. **AWS Bedrock Access**: Ensure AWS Bedrock is available in your region

### Install AWS CLI

```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Windows
# Download and run: https://awscli.amazonaws.com/AWSCLIV2.msi
```

### Configure AWS Credentials

```bash
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
# - Default output format (json)
```

### Verify Bedrock Access

AWS Bedrock is available in limited regions. Verify it's available in your chosen region:
- us-east-1 (N. Virginia) ✓
- us-west-2 (Oregon) ✓
- ap-southeast-1 (Singapore) ✓
- eu-central-1 (Frankfurt) ✓

You may need to request model access in the AWS Bedrock console.

## Installation

Navigate to the CDK directory and install dependencies:

```bash
cd cdk
npm install
```

## Deployment

### Option 1: Using the deployment script (Recommended)

```bash
./scripts/deploy.sh
```

This script will:
1. Check AWS credentials
2. Install dependencies
3. Bootstrap CDK (if needed)
4. Show you what will change
5. Ask for confirmation
6. Deploy the stack
7. Display the Function URL

### Option 2: Manual deployment

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Bootstrap CDK (first time only)
npx cdk bootstrap

# Preview changes
npx cdk diff

# Deploy
npx cdk deploy
```

## Post-Deployment

After deployment, you'll see output like:

```
Outputs:
LottoGraveyardStack.FunctionUrl = https://abc123xyz.lambda-url.us-east-1.on.aws/
LottoGraveyardStack.FunctionName = LottoGraveyardStack-FortuneGeneratorFunction...
LottoGraveyardStack.FunctionArn = arn:aws:lambda:us-east-1:123456789012:function:...
```

**Important**: Copy the `FunctionUrl` and update it in your static site:

```javascript
// js/config.js
const CONFIG = {
  FORTUNE_LAMBDA_URL: 'https://abc123xyz.lambda-url.us-east-1.on.aws/',
  // ... other config
};
```

## Configuration

### Environment Variables

The Lambda function uses these environment variables (set in the CDK stack):

- `AWS_REGION`: AWS region (auto-populated)
- `BEDROCK_MODEL_ID`: Claude model to use (default: `anthropic.claude-3-haiku-20240307-v1:0`)

### Runtime Configuration

Modify `lib/lotto-graveyard-stack.ts` to change:

- **Timeout**: Currently 30 seconds (per requirements)
- **Memory**: Currently 256MB (adjust based on usage)
- **Model**: Change `BEDROCK_MODEL_ID` to use different Claude models:
  - `anthropic.claude-3-haiku-20240307-v1:0` (fastest, cheapest)
  - `anthropic.claude-3-sonnet-20240229-v1:0` (balanced)
  - `anthropic.claude-3-opus-20240229-v1:0` (most capable)

### CORS Configuration

Currently set to allow all origins (`*`). For production, restrict to your domain:

```typescript
cors: {
  allowedOrigins: ['https://yourdomain.com'], // Change this
  allowedMethods: [lambda.HttpMethod.POST, lambda.HttpMethod.OPTIONS],
  allowedHeaders: ['Content-Type', 'Accept'],
  maxAge: cdk.Duration.hours(24)
}
```

## Monitoring

### View CloudWatch Logs

```bash
# Get the log group name from stack outputs
aws logs tail /aws/lambda/LottoGraveyardStack-FortuneGeneratorFunction... --follow
```

Or view in the AWS Console:
1. Go to CloudWatch → Log Groups
2. Find `/aws/lambda/LottoGraveyardStack-FortuneGeneratorFunction...`
3. View log streams

### Key Metrics to Monitor

- **Invocations**: Number of fortune generation requests
- **Duration**: How long each request takes (should be < 30s)
- **Errors**: Failed requests (validation errors, AI service errors)
- **Throttles**: Requests rejected due to concurrency limits

## Testing

Test the deployed Lambda function:

```bash
# Replace with your Function URL
curl -X POST https://YOUR_FUNCTION_URL.lambda-url.us-east-1.on.aws/ \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What does my future hold?",
    "cards": [
      {"name": "The Fool", "position": "past"},
      {"name": "The Magician", "position": "present"},
      {"name": "The World", "position": "future"}
    ]
  }'
```

Expected response:

```json
{
  "fortune": "Your question \"What does my future hold?\" is reflected in the cards...",
  "generatedAt": "2025-01-15T12:34:56.789Z"
}
```

## Cost Estimates

Approximate AWS costs (us-east-1 pricing):

- **Lambda**: Free tier 1M requests/month, then $0.20 per 1M requests
  - Compute: $0.0000166667 per GB-second (256MB = ~$0.00042 per 30s invocation)
- **CloudWatch Logs**: $0.50 per GB ingested (logs minimal for this function)
- **Bedrock (Claude 3 Haiku)**: 
  - Input: $0.25 per 1M tokens (~$0.0001 per request)
  - Output: $1.25 per 1M tokens (~$0.0004 per fortune)

**Example**: 1,000 fortunes/month ≈ **$0.60-$1.00/month**

## Updating the Lambda Function

After making changes to `lambda/fortune-generator/`:

```bash
# Rebuild and redeploy
npm run build
npx cdk deploy
```

CDK will detect changes and update only the Lambda function.

## Troubleshooting

### "Unable to invoke model"

**Problem**: Lambda can't access Bedrock models

**Solutions**:
1. Verify Bedrock is available in your region
2. Request model access in AWS Bedrock console (Model access → Request access)
3. Wait 5-10 minutes for access approval

### "Timeout after 30 seconds"

**Problem**: Fortune generation taking too long

**Solutions**:
1. Check CloudWatch logs for errors
2. Verify Bedrock service status
3. Consider using a faster model (Claude 3 Haiku)
4. Increase timeout in `lib/lotto-graveyard-stack.ts` (not recommended)

### "403 Forbidden" from Function URL

**Problem**: CORS or permissions issue

**Solutions**:
1. Verify CORS headers in Lambda response
2. Check browser console for CORS errors
3. Ensure Function URL auth type is NONE (public)

### "CDK is not bootstrapped"

**Problem**: First-time CDK deployment

**Solution**:
```bash
npx cdk bootstrap aws://ACCOUNT_ID/REGION
```

## Destroying the Stack

To remove all resources and stop incurring charges:

```bash
./scripts/destroy.sh
```

Or manually:

```bash
npx cdk destroy
```

**Warning**: This will permanently delete the Lambda function and all logs.

## Security Considerations

1. **CORS**: Restrict `allowedOrigins` to your domain in production
2. **Rate Limiting**: Consider adding API Gateway for rate limiting
3. **Secrets**: API keys stored in environment variables (consider AWS Secrets Manager for production)
4. **IAM**: Lambda role has minimal permissions (Bedrock + CloudWatch only)
5. **Function URL**: Public endpoint (no authentication required)

## Development Workflow

1. Make changes to Lambda code in `lambda/fortune-generator/`
2. Test locally (see testing section)
3. Build CDK: `npm run build`
4. Preview changes: `npx cdk diff`
5. Deploy: `npx cdk deploy`
6. Test deployed function
7. Monitor CloudWatch logs

## Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Lambda Function URLs](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html)

## Support

For issues with this CDK infrastructure:
1. Check CloudWatch logs for Lambda errors
2. Review CDK stack events in CloudFormation console
3. Verify IAM permissions and Bedrock access
4. Check AWS service status

## License

MIT
