#!/bin/bash
#
# Deploy Lotto Graveyard to AWS S3 + CloudFront
#
# Usage: ./scripts/deploy-s3.sh [bucket-name] [distribution-id]
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BUCKET_NAME="${1:-lotto-graveyard}"
DISTRIBUTION_ID="${2:-}"
REGION="us-east-1"

echo "================================================"
echo "  Lotto Graveyard - S3 Deployment Script"
echo "================================================"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}ERROR: AWS CLI is not installed${NC}"
    echo "Install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}ERROR: AWS credentials not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi

echo -e "${GREEN}✓ AWS CLI configured${NC}"
echo ""

# Confirm configuration
echo "Configuration:"
echo "  Bucket: $BUCKET_NAME"
echo "  Region: $REGION"
if [ -n "$DISTRIBUTION_ID" ]; then
    echo "  CloudFront: $DISTRIBUTION_ID"
else
    echo -e "  CloudFront: ${YELLOW}Not configured (skipping cache invalidation)${NC}"
fi
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

# Check if bucket exists
echo ""
echo "Checking S3 bucket..."
if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    echo -e "${YELLOW}⚠ Bucket does not exist. Creating...${NC}"
    aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
    
    # Enable static website hosting
    aws s3 website "s3://$BUCKET_NAME" \
        --index-document index.html \
        --error-document index.html
    
    # Set bucket policy for public read
    cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF
    
    aws s3api put-bucket-policy \
        --bucket "$BUCKET_NAME" \
        --policy file:///tmp/bucket-policy.json
    
    rm /tmp/bucket-policy.json
    
    echo -e "${GREEN}✓ Bucket created and configured${NC}"
else
    echo -e "${GREEN}✓ Bucket exists${NC}"
fi

# Verify required files exist
echo ""
echo "Verifying project files..."
REQUIRED_FILES=(
    "index.html"
    "js/config.js"
    "css/main.css"
    "data/historical-data.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}ERROR: Required file not found: $file${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✓ All required files present${NC}"

# Check configuration
echo ""
echo "Checking configuration..."
if grep -q "your-function-url" js/config.js; then
    echo -e "${YELLOW}⚠ WARNING: Lambda Function URL not configured in js/config.js${NC}"
    echo "  Fortune generation will not work until you update FORTUNE_LAMBDA_URL"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 0
    fi
fi

# Deploy to S3
echo ""
echo "Deploying to S3..."
aws s3 sync . "s3://$BUCKET_NAME" \
    --exclude ".git*" \
    --exclude ".github/*" \
    --exclude "lambda/*" \
    --exclude "scripts/*" \
    --exclude ".kiro/*" \
    --exclude "node_modules/*" \
    --exclude "cdk/*" \
    --exclude "*.md" \
    --exclude "bucket-policy.json" \
    --exclude "cloudfront-config.json" \
    --exclude "*.sh" \
    --cache-control "max-age=86400" \
    --delete

echo -e "${GREEN}✓ Files uploaded to S3${NC}"

# Set cache headers for static assets
echo ""
echo "Configuring cache headers..."

# Cache images for 1 year
aws s3 cp "s3://$BUCKET_NAME/assets" "s3://$BUCKET_NAME/assets" \
    --recursive \
    --metadata-directive REPLACE \
    --cache-control "max-age=31536000,public,immutable" \
    --quiet

# Cache CSS/JS for 1 day
aws s3 cp "s3://$BUCKET_NAME/css" "s3://$BUCKET_NAME/css" \
    --recursive \
    --metadata-directive REPLACE \
    --cache-control "max-age=86400,public" \
    --quiet

aws s3 cp "s3://$BUCKET_NAME/js" "s3://$BUCKET_NAME/js" \
    --recursive \
    --metadata-directive REPLACE \
    --cache-control "max-age=86400,public" \
    --quiet

# Don't cache HTML
aws s3 cp "s3://$BUCKET_NAME/index.html" "s3://$BUCKET_NAME/index.html" \
    --metadata-directive REPLACE \
    --cache-control "max-age=300,public" \
    --quiet

echo -e "${GREEN}✓ Cache headers configured${NC}"

# Invalidate CloudFront if distribution ID provided
if [ -n "$DISTRIBUTION_ID" ]; then
    echo ""
    echo "Invalidating CloudFront cache..."
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$DISTRIBUTION_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    echo -e "${GREEN}✓ Invalidation created: $INVALIDATION_ID${NC}"
    echo "  Cache will be cleared in 5-10 minutes"
fi

# Get S3 website URL
WEBSITE_URL=$(aws s3api get-bucket-website \
    --bucket "$BUCKET_NAME" \
    --query '{Endpoint:WebsiteConfiguration.IndexDocument}' \
    --output text 2>/dev/null || echo "")

echo ""
echo "================================================"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "================================================"
echo ""
echo "S3 Website URL:"
echo "  http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo ""

if [ -n "$DISTRIBUTION_ID" ]; then
    CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
        --id "$DISTRIBUTION_ID" \
        --query 'Distribution.DomainName' \
        --output text)
    echo "CloudFront URL:"
    echo "  https://$CLOUDFRONT_DOMAIN"
    echo ""
fi

echo "Next steps:"
if grep -q "your-function-url" js/config.js; then
    echo "  1. Update js/config.js with your Lambda Function URL"
    echo "  2. Run this script again to redeploy"
fi
echo "  - Test your site"
echo "  - Configure custom domain (see DEPLOYMENT.md)"
echo "  - Set up GitHub Actions for automatic deployments"
echo ""
