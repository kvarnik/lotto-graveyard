# Quick Deployment Guide

## Prerequisites Checklist

- [ ] AWS Account created
- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] Node.js 18+ installed (`node --version`)
- [ ] AWS Bedrock access enabled in your region

## Step-by-Step Deployment

### 1. Install Dependencies

```bash
cd cdk
npm install
```

### 2. Configure AWS Credentials

```bash
aws configure
# Enter your AWS credentials when prompted
```

### 3. Enable Bedrock Access

1. Go to AWS Console → Bedrock
2. Click "Model access" in the left sidebar
3. Click "Request model access"
4. Enable "Claude 3 Haiku" (or other Claude models)
5. Wait 5-10 minutes for approval

### 4. Deploy

```bash
./scripts/deploy.sh
```

This will:
- Check your AWS credentials
- Bootstrap CDK (if first time)
- Show you what will be deployed
- Ask for confirmation
- Deploy the Lambda function
- Display the Function URL

### 5. Copy Function URL

After deployment completes, you'll see:

```
Outputs:
LottoGraveyardStack.FunctionUrl = https://abc123xyz.lambda-url.us-east-1.on.aws/
```

Copy this URL.

### 6. Update Static Site

Edit `js/config.js` in the main project:

```javascript
const CONFIG = {
  FORTUNE_LAMBDA_URL: 'https://YOUR_FUNCTION_URL_HERE/',
  // ...
};
```

### 7. Test

```bash
# Test the Lambda function
curl -X POST https://YOUR_FUNCTION_URL_HERE/ \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Test question?",
    "cards": [
      {"name": "The Fool", "position": "past"},
      {"name": "The Magician", "position": "present"},
      {"name": "The World", "position": "future"}
    ]
  }'
```

You should receive a JSON response with a fortune.

## Common Issues

### "Unable to invoke model"

**Cause**: Bedrock access not enabled

**Fix**: 
1. Go to AWS Bedrock console
2. Request model access (see step 3 above)
3. Wait for approval
4. Redeploy: `./scripts/deploy.sh`

### "CDK is not bootstrapped"

**Cause**: First time using CDK in this account/region

**Fix**: The deploy script will automatically bootstrap CDK for you

### "No default region configured"

**Cause**: AWS CLI not configured with a region

**Fix**:
```bash
aws configure set region us-east-1
```

### Function times out

**Cause**: Bedrock service or network issue

**Fix**:
1. Check CloudWatch logs: `aws logs tail /aws/lambda/LottoGraveyardStack-FortuneGeneratorFunction... --follow`
2. Verify Bedrock status
3. Try again

## Destroying the Stack

To remove all AWS resources:

```bash
./scripts/destroy.sh
```

**Warning**: This permanently deletes the Lambda function and all logs.

## Cost

Expected monthly cost for moderate usage (~1,000 fortunes):
- Lambda: $0.20 (mostly free tier)
- Bedrock: $0.50
- CloudWatch: $0.10

**Total: ~$0.80/month**

## Next Steps

After deployment:
1. Test the Lambda function directly (see step 7)
2. Update your static site with the Function URL
3. Test the full application flow
4. Monitor CloudWatch logs for any issues
5. Consider setting up CloudWatch alarms for errors

## Resources

- Full documentation: See [README.md](README.md)
- AWS Bedrock regions: https://docs.aws.amazon.com/bedrock/latest/userguide/bedrock-regions.html
- CDK documentation: https://docs.aws.amazon.com/cdk/
