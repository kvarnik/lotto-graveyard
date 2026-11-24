#!/bin/bash
#
# Deploy Lotto Graveyard to GitHub Pages
#
# This script helps configure GitHub Pages deployment
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "================================================"
echo "  Lotto Graveyard - GitHub Pages Setup"
echo "================================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}ERROR: git is not installed${NC}"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}ERROR: Not in a git repository${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Git repository detected${NC}"
echo ""

# Get repository information
REPO_URL=$(git config --get remote.origin.url || echo "")
CURRENT_BRANCH=$(git branch --show-current)

if [ -z "$REPO_URL" ]; then
    echo -e "${RED}ERROR: No remote origin configured${NC}"
    echo "Add a remote: git remote add origin <repository-url>"
    exit 1
fi

# Parse GitHub username and repo name
if [[ $REPO_URL =~ github\.com[:/]([^/]+)/([^/\.]+) ]]; then
    GITHUB_USER="${BASH_REMATCH[1]}"
    REPO_NAME="${BASH_REMATCH[2]}"
else
    echo -e "${YELLOW}⚠ Could not parse GitHub username/repo from: $REPO_URL${NC}"
    read -p "Enter GitHub username: " GITHUB_USER
    read -p "Enter repository name: " REPO_NAME
fi

echo "Repository Information:"
echo "  User: $GITHUB_USER"
echo "  Repo: $REPO_NAME"
echo "  Branch: $CURRENT_BRANCH"
echo ""

# Verify required files exist
echo "Verifying project files..."
REQUIRED_FILES=(
    "index.html"
    "js/config.js"
    "css/main.css"
    "data/historical-data.json"
    ".github/workflows/deploy.yml"
)

MISSING_FILES=()
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo -e "${RED}ERROR: Missing required files:${NC}"
    for file in "${MISSING_FILES[@]}"; do
        echo "  - $file"
    done
    exit 1
fi

echo -e "${GREEN}✓ All required files present${NC}"
echo ""

# Check configuration
echo "Checking configuration..."
if grep -q "your-function-url" js/config.js; then
    echo -e "${YELLOW}⚠ WARNING: Lambda Function URL not configured in js/config.js${NC}"
    echo "  Fortune generation will not work until you update FORTUNE_LAMBDA_URL"
    echo ""
fi

# Check if paths need updating for GitHub Pages
if [[ "$REPO_NAME" != "${GITHUB_USER}.github.io" ]]; then
    echo -e "${BLUE}ℹ Your site will be at: https://${GITHUB_USER}.github.io/${REPO_NAME}${NC}"
    echo ""
    echo "You may need to update paths in js/config.js:"
    echo "  DATA_FILE_PATH: '/${REPO_NAME}/data/historical-data.json'"
    echo "  TAROT_IMAGES_PATH: '/${REPO_NAME}/assets/tarot'"
    echo ""
    echo "OR use relative paths (recommended):"
    echo "  DATA_FILE_PATH: 'data/historical-data.json'"
    echo "  TAROT_IMAGES_PATH: 'assets/tarot'"
    echo ""
    
    if grep -q "^/" js/config.js | grep -qv "^//${REPO_NAME}"; then
        echo -e "${YELLOW}⚠ Found absolute paths in js/config.js${NC}"
        echo "  Consider updating to relative paths or adding /${REPO_NAME}/ prefix"
        echo ""
    fi
fi

# Check git status
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠ You have uncommitted changes${NC}"
    echo ""
    git status --short
    echo ""
    read -p "Commit changes now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Commit message: " COMMIT_MSG
        git add .
        git commit -m "$COMMIT_MSG"
        echo -e "${GREEN}✓ Changes committed${NC}"
    else
        echo "Please commit your changes before deploying"
        exit 1
    fi
fi

# Push to GitHub
echo ""
echo "Pushing to GitHub..."
git push origin "$CURRENT_BRANCH"
echo -e "${GREEN}✓ Pushed to GitHub${NC}"
echo ""

# Check if GitHub Actions is enabled
echo "================================================"
echo "Next Steps:"
echo "================================================"
echo ""
echo "1. Enable GitHub Pages:"
echo "   • Go to: https://github.com/${GITHUB_USER}/${REPO_NAME}/settings/pages"
echo "   • Source: Deploy from a branch"
echo "   • Branch: gh-pages"
echo "   • Folder: / (root)"
echo "   • Click Save"
echo ""
echo "2. Enable GitHub Actions (if not already):"
echo "   • Go to: https://github.com/${GITHUB_USER}/${REPO_NAME}/settings/actions"
echo "   • Allow all actions and reusable workflows"
echo ""
echo "3. Monitor deployment:"
echo "   • Go to: https://github.com/${GITHUB_USER}/${REPO_NAME}/actions"
echo "   • Watch the 'Deploy Static Site' workflow"
echo ""
echo "4. Access your site (after deployment completes):"
if [[ "$REPO_NAME" == "${GITHUB_USER}.github.io" ]]; then
    echo "   • https://${GITHUB_USER}.github.io"
else
    echo "   • https://${GITHUB_USER}.github.io/${REPO_NAME}"
fi
echo ""
echo "5. Configure Lambda Function URL:"
echo "   • Deploy Lambda function (see cdk/DEPLOYMENT_GUIDE.md)"
echo "   • Update js/config.js with the Function URL"
echo "   • Commit and push changes"
echo ""
echo "================================================"
echo ""

# Offer to open GitHub Pages settings
if command -v open &> /dev/null || command -v xdg-open &> /dev/null; then
    read -p "Open GitHub Pages settings in browser? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        PAGES_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}/settings/pages"
        if command -v open &> /dev/null; then
            open "$PAGES_URL"
        elif command -v xdg-open &> /dev/null; then
            xdg-open "$PAGES_URL"
        fi
    fi
fi

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
