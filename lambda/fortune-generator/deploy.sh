#!/bin/bash

# Lambda Fortune Generator Deployment Script
# This script packages and deploys the Lambda function to AWS

set -e  # Exit on any error

FUNCTION_NAME="lotto-graveyard-fortune-generator"
REGION="${AWS_REGION:-us-east-1}"
RUNTIME="python3.11"
HANDLER="index.handler"
TIMEOUT=30
MEMORY=512

echo "============================================"
echo "Lambda Fortune Generator Deployment"
echo "============================================"
echo "Function: $FUNCTION_NAME"
echo "Region: $REGION"
echo "Runtime: $RUNTIME"
echo "============================================"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ Error: AWS CLI is not installed"
    echo "   Install from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Error: AWS credentials not configured"
    echo "   Run: aws configure"
    exit 1
fi

echo "✓ AWS CLI configured"

# Clean up old package
echo ""
echo "📦 Packaging function..."
rm -rf package
rm -f function.zip

# Create package directory
mkdir -p package

# Install dependencies
if [ -f "requirements.txt" ]; then
    echo "   Installing dependencies..."
    pip3 install -r requirements.txt -t package/ --quiet
    echo "   ✓ Dependencies installed"
fi

# Copy handler
cp index.py package/
echo "   ✓ Handler copied"

# Create zip
cd package
zip -r ../function.zip . > /dev/null
cd ..
echo "   ✓ Package created: function.zip"

# Check if function exists
echo ""
echo "🔍 Checking if function exists..."
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" &> /dev/null; then
    echo "   Function exists, updating code..."
    
    # Update function code
    aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file fileb://function.zip \
        --region "$REGION" \
        > /dev/null
    
    echo "   ✓ Function code updated"
    
    # Update configuration
    echo "   Updating configuration..."
    aws lambda update-function-configuration \
        --function-name "$FUNCTION_NAME" \
        --timeout "$TIMEOUT" \
        --memory-size "$MEMORY" \
        --region "$REGION" \
        > /dev/null
    
    echo "   ✓ Configuration updated"
    
else
    echo "   Function does not exist, creating..."
    
    # Check for execution role
    ROLE_ARN="${LAMBDA_ROLE_ARN}"
    if [ -z "$ROLE_ARN" ]; then
        echo "   ❌ Error: Lambda execution role not specified"
        echo "      Set LAMBDA_ROLE_ARN environment variable with the IAM role ARN"
        echo "      Example: export LAMBDA_ROLE_ARN=arn:aws:iam::123456789012:role/lambda-execution-role"
        exit 1
    fi
    
    # Create function
    aws lambda create-function \
        --function-name "$FUNCTION_NAME" \
        --runtime "$RUNTIME" \
        --handler "$HANDLER" \
        --role "$ROLE_ARN" \
        --zip-file fileb://function.zip \
        --timeout "$TIMEOUT" \
        --memory-size "$MEMORY" \
        --region "$REGION" \
        > /dev/null
    
    echo "   ✓ Function created"
    
    # Create Function URL
    echo "   Creating Function URL..."
    aws lambda create-function-url-config \
        --function-name "$FUNCTION_NAME" \
        --auth-type NONE \
        --cors AllowOrigins="*",AllowMethods="POST,OPTIONS",AllowHeaders="Content-Type",MaxAge=86400 \
        --region "$REGION" \
        > /dev/null
    
    echo "   ✓ Function URL created"
    
    # Add permission for public access
    aws lambda add-permission \
        --function-name "$FUNCTION_NAME" \
        --statement-id FunctionURLAllowPublicAccess \
        --action lambda:InvokeFunctionUrl \
        --principal "*" \
        --function-url-auth-type NONE \
        --region "$REGION" \
        > /dev/null
    
    echo "   ✓ Public access permission added"
fi

# Get Function URL
echo ""
echo "🔗 Getting Function URL..."
FUNCTION_URL=$(aws lambda get-function-url-config \
    --function-name "$FUNCTION_NAME" \
    --region "$REGION" \
    --query 'FunctionUrl' \
    --output text)

echo ""
echo "============================================"
echo "✅ Deployment complete!"
echo "============================================"
echo "Function URL: $FUNCTION_URL"
echo ""
echo "Test with:"
echo "curl -X POST $FUNCTION_URL \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"question\": \"What does my future hold?\","
echo "    \"cards\": ["
echo "      {\"name\": \"The Fool\", \"position\": \"past\"},"
echo "      {\"name\": \"The Magician\", \"position\": \"present\"},"
echo "      {\"name\": \"The World\", \"position\": \"future\"}"
echo "    ]"
echo "  }'"
echo "============================================"

# Clean up
rm -rf package
echo ""
echo "🧹 Cleaned up temporary files"
