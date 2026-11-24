# Fortune Generator Lambda Function

AI-powered tarot fortune generation using AWS Bedrock Claude.

## Overview

This Lambda function generates personalized tarot fortunes based on:
- User's question (1-200 characters)
- Three tarot cards with names and positions (past, present, future)

The function uses AWS Bedrock with Claude 3 Haiku model to generate mystical, contextual fortunes that interpret the cards in relation to the user's question.

## Implementation Details

### AI Service Integration

**Model**: Claude 3 Haiku (anthropic.claude-3-haiku-20240307-v1:0)
- Cost-effective for this use case
- Good quality mystical/creative writing
- Fast response times

**Configuration**: 
- `temperature: 0.8` - Higher temperature for more creative, mystical responses
- `max_tokens: 1000` - Sufficient for detailed fortunes (typically 150-300 words)

### Key Features

1. **AI-Powered Generation**: Uses AWS Bedrock Claude to generate unique fortunes
2. **Retry Logic**: Automatically retries up to 3 times on API failures
3. **Validation**: Ensures fortunes meet requirements:
   - Minimum 100 characters
   - Mentions at least one card name
   - Generated within 30 seconds
4. **Error Handling**: Graceful degradation on API failures
5. **CORS Support**: Configured for static site integration

### Fortune Quality Requirements

Each generated fortune:
- ✓ Addresses the user's question directly
- ✓ Explains significance of each card in its position
- ✓ Weaves cards into a cohesive past → present → future narrative
- ✓ Uses mystical language befitting 1909 Rider-Waite tradition
- ✓ Minimum 150 words (100 characters enforced)

## Environment Variables

Configure these environment variables in AWS Lambda:

```bash
AWS_REGION=us-east-1                                        # AWS region for Bedrock
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0   # Claude model ID (optional)
```

## Deployment

### Prerequisites

1. AWS account with Bedrock access
2. Claude model access enabled in AWS Bedrock
3. IAM role with permissions:
   - `bedrock:InvokeModel`
   - Lambda execution role permissions

### Install Dependencies

```bash
pip install -r requirements.txt -t .
```

### Deploy to AWS Lambda

1. **Create deployment package**:
```bash
zip -r function.zip index.py boto3/ botocore/ ...
```

2. **Upload to Lambda**:
   - Runtime: Python 3.11
   - Handler: `index.handler`
   - Timeout: 30 seconds
   - Memory: 256 MB

3. **Configure Function URL**:
   - Enable Function URL
   - Auth type: NONE (for public access)
   - CORS: Enabled

4. **Set Environment Variables** (see above)

### IAM Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
      ]
    }
  ]
}
```

## API Reference

### Request

```json
POST /
Content-Type: application/json

{
  "question": "Will I find success in my new career?",
  "cards": [
    {
      "name": "The Fool",
      "position": "past"
    },
    {
      "name": "The Magician",
      "position": "present"
    },
    {
      "name": "The World",
      "position": "future"
    }
  ]
}
```

### Success Response (200)

```json
{
  "fortune": "Your question about career success is woven into the cards before you. The Fool in your past speaks of bold beginnings and leaps of faith that brought you to this moment...",
  "generatedAt": "2025-01-15T12:34:56.789Z"
}
```

### Error Response (400 - Validation)

```json
{
  "error": "ValidationError",
  "message": "Question must be 200 characters or less"
}
```

### Error Response (500 - Server)

```json
{
  "error": "ServerError",
  "message": "Fortune generation failed"
}
```

## Validation Rules

### Question Validation
- Required
- Must be a string
- 1-200 characters (after trimming)
- Cannot be empty or only whitespace

### Cards Validation
- Required
- Must be an array
- Exactly 3 cards
- Each card must have:
  - `name` (string, required)
  - `position` (string, one of: 'past', 'present', 'future')
- All positions must be unique

## Testing

### Local Validation Tests

```bash
python3 test_validation.py
```

Validates:
- Implementation completeness
- Requirements compliance
- Error handling
- Prompt structure

### Manual Testing

You can test the deployed Lambda using curl:

```bash
curl -X POST https://YOUR_FUNCTION_URL.lambda-url.us-east-1.on.aws/ \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What does my future hold?",
    "cards": [
      {"name": "The Fool", "position": "past"},
      {"name": "The Star", "position": "present"},
      {"name": "The Sun", "position": "future"}
    ]
  }'
```

## Error Handling

### Client Errors (400)
- Invalid JSON
- Missing required fields
- Question too long (>200 chars)
- Wrong number of cards (not 3)
- Invalid card positions
- Duplicate positions

### Server Errors (500)
- AWS Bedrock API failures
- Timeout (>30 seconds)
- Generated fortune too short (<100 chars)
- Unexpected errors

### Retry Strategy
- Max retries: 2 (3 total attempts)
- Retries on: `ClientError`, `BotoCoreError`
- No exponential backoff (Lambda timeout handles this)
- No retry on validation errors

## Cost Estimation

**Claude 3 Haiku Pricing** (as of Jan 2025):
- Input: ~$0.25 per 1M tokens
- Output: ~$1.25 per 1M tokens

**Per Fortune**:
- Input: ~300 tokens (prompt + cards + question)
- Output: ~200 tokens (fortune)
- Cost: ~$0.0003 per fortune ($0.30 per 1000 fortunes)

**Lambda Costs**:
- Invocations: $0.20 per 1M requests
- Duration: ~1-3 seconds @ 256MB
- Cost: ~$0.000005 per invocation

**Total**: ~$0.0003 per fortune

## Monitoring

Key CloudWatch metrics to monitor:
- Invocation count
- Error rate
- Duration (should be <5 seconds)
- Throttles (if rate limited)

Logs to watch:
- `AWS Bedrock error` - API failures
- `Fortune validation error` - Quality issues
- `Fortune generation error` - Unexpected failures

## Future Enhancements

Possible improvements:
- [ ] Support for other AI models (OpenAI, Anthropic direct, etc.)
- [ ] Caching for identical question+cards combinations
- [ ] A/B testing different prompts
- [ ] Fortune quality scoring
- [ ] Multi-language support
- [ ] Rate limiting per IP
- [ ] Usage analytics

## References

- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Claude Model Documentation](https://docs.anthropic.com/claude/docs)
- [Lambda Function URLs](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html)
