#!/bin/bash
# Destroy script for Lotto Graveyard Lambda Function
# This script removes all AWS resources created by the CDK stack

set -e  # Exit on error

echo "======================================="
echo "Lotto Graveyard Lambda Destruction"
echo "======================================="
echo ""
echo "WARNING: This will delete the Lambda function and all associated resources."
echo ""

# Navigate to CDK directory
cd "$(dirname "$0")/.."

# Confirm destruction
read -p "Are you sure you want to destroy the stack? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Destruction cancelled."
    exit 0
fi

# Destroy the stack
echo ""
echo "Destroying Lambda function..."
npx cdk destroy --force

echo ""
echo "======================================="
echo "Destruction Complete!"
echo "======================================="
