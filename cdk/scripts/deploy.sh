#!/bin/bash
# Deploy script for Lotto Graveyard Lambda Function
# This script bootstraps AWS CDK (if needed) and deploys the Lambda function

set -e  # Exit on error

echo "======================================="
echo "Lotto Graveyard Lambda Deployment"
echo "======================================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed."
    echo "Please install AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "Error: AWS credentials are not configured."
    echo "Please run: aws configure"
    exit 1
fi

# Get AWS account information
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region)
REGION=${REGION:-us-east-1}  # Default to us-east-1 if not set

echo "AWS Account: $ACCOUNT_ID"
echo "AWS Region: $REGION"
echo ""

# Navigate to CDK directory
cd "$(dirname "$0")/.."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing CDK dependencies..."
    npm install
    echo ""
fi

# Build TypeScript
echo "Building CDK app..."
npm run build
echo ""

# Check if CDK is bootstrapped
echo "Checking CDK bootstrap status..."
if ! aws cloudformation describe-stacks --stack-name CDKToolkit --region "$REGION" &> /dev/null; then
    echo "CDK is not bootstrapped. Bootstrapping now..."
    npx cdk bootstrap "aws://$ACCOUNT_ID/$REGION"
    echo ""
else
    echo "CDK is already bootstrapped."
    echo ""
fi

# Synthesize the CloudFormation template
echo "Synthesizing CloudFormation template..."
npx cdk synth
echo ""

# Display the diff
echo "Showing changes to be deployed..."
npx cdk diff || true
echo ""

# Confirm deployment
read -p "Do you want to proceed with deployment? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

# Deploy the stack
echo ""
echo "Deploying Lambda function..."
npx cdk deploy --require-approval never

echo ""
echo "======================================="
echo "Deployment Complete!"
echo "======================================="
echo ""
echo "The Function URL will be displayed above."
echo "Copy it and update js/config.js in the static site."
