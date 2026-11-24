# Deployment Quick Start

This is a quick reference guide. For complete documentation, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Prerequisites

- [ ] Lambda function deployed (see `cdk/DEPLOYMENT_GUIDE.md`)
- [ ] Lambda Function URL copied to `js/config.js`
- [ ] All code committed to git

## GitHub Pages (Easiest)

### Option A: Automated Script

```bash
./scripts/deploy-github-pages.sh
```

Then follow the on-screen instructions.

### Option B: Manual Setup

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to: `https://github.com/<username>/<repo>/settings/pages`
   - Source: Deploy from a branch
   - Branch: `gh-pages`
   - Click Save

3. **Wait for deployment** (1-2 minutes)
   - Monitor at: `https://github.com/<username>/<repo>/actions`

4. **Access your site**
   ```
   https://<username>.github.io/<repo-name>
   ```

### Update Paths for GitHub Pages

If using repository name in URL (not `username.github.io`), update `js/config.js`:

```javascript
// Use relative paths (recommended)
DATA_FILE_PATH: 'data/historical-data.json',
TAROT_IMAGES_PATH: 'assets/tarot',

// OR absolute paths with repo name
DATA_FILE_PATH: '/lotto-graveyard/data/historical-data.json',
TAROT_IMAGES_PATH: '/lotto-graveyard/assets/tarot',
```

---

## AWS S3 + CloudFront (Production)

### Quick Deploy

```bash
# First time setup (creates bucket and uploads files)
./scripts/deploy-s3.sh my-bucket-name

# With CloudFront (creates bucket, uploads, and invalidates cache)
./scripts/deploy-s3.sh my-bucket-name E1234567890ABC
```

### Manual Setup

#### 1. Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://lotto-graveyard --region us-east-1

# Enable static website hosting
aws s3 website s3://lotto-graveyard \
  --index-document index.html \
  --error-document index.html
```

#### 2. Set Bucket Policy

Create `bucket-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::lotto-graveyard/*"
  }]
}
```

Apply policy:
```bash
aws s3api put-bucket-policy \
  --bucket lotto-graveyard \
  --policy file://bucket-policy.json
```

#### 3. Upload Files

```bash
aws s3 sync . s3://lotto-graveyard \
  --exclude ".git*" \
  --exclude ".github/*" \
  --exclude "lambda/*" \
  --exclude "scripts/*" \
  --exclude ".kiro/*" \
  --exclude "node_modules/*" \
  --exclude "cdk/*" \
  --delete
```

#### 4. Create CloudFront Distribution (Optional but Recommended)

```bash
# Use the template (update bucket name first)
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config-template.json
```

Get distribution domain:
```bash
aws cloudfront list-distributions \
  --query "DistributionList.Items[0].DomainName" \
  --output text
```

#### 5. Invalidate Cache (After Updates)

```bash
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

---

## Automated Deployment via GitHub Actions

### For GitHub Pages

Already configured! Just push to `main`:

```bash
git push origin main
```

Workflow runs automatically at: `https://github.com/<username>/<repo>/actions`

### For S3 + CloudFront

1. **Add GitHub Secrets**
   
   Go to: `https://github.com/<username>/<repo>/settings/secrets/actions`
   
   Add:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `S3_BUCKET_NAME` (optional, default: lotto-graveyard)
   - `CLOUDFRONT_DISTRIBUTION_ID`

2. **Enable S3 Deployment**
   
   Edit `.github/workflows/deploy.yml`:
   
   ```yaml
   # Change this line:
   if: false  # Set to true to enable S3 deployment
   
   # To:
   if: true  # Enabled!
   ```
   
   Also comment out the `deploy-github-pages` job.

3. **Push Changes**
   
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Enable S3 deployment"
   git push origin main
   ```

---

## Post-Deployment Testing

### Quick Tests

```bash
# Test site is accessible
curl -I https://your-site-url.com

# Test required resources
curl -sf https://your-site-url.com/css/main.css
curl -sf https://your-site-url.com/js/config.js
curl -sf https://your-site-url.com/data/historical-data.json
```

### Manual Testing

1. Visit your deployed site
2. Enter lottery numbers (e.g., 5, 12, 23, 45, 67, PB: 15)
3. View tombstone analysis
4. Request tarot reading
5. Enter a question
6. Verify fortune generates

### Check Browser Console

Open Developer Tools (F12) and check for:
- ✅ No 404 errors (missing files)
- ✅ No CORS errors (Lambda configuration)
- ✅ No JavaScript errors

---

## Troubleshooting

### Fortune Generation Not Working

```bash
# Check Lambda URL in config
grep FORTUNE_LAMBDA_URL js/config.js

# Test Lambda directly
curl -X POST https://your-function-url.lambda-url.us-east-1.on.aws/ \
  -H "Content-Type: application/json" \
  -d '{"question":"Test","cards":[{"name":"The Fool","position":"past"},{"name":"The Magician","position":"present"},{"name":"The World","position":"future"}]}'
```

**Fix:** Update `js/config.js` with correct Lambda URL

### Assets Not Loading (GitHub Pages)

**Problem:** 404 errors for CSS, JS, or images

**Fix:** Use relative paths in `js/config.js`:
```javascript
DATA_FILE_PATH: 'data/historical-data.json',  // Not /data/...
TAROT_IMAGES_PATH: 'assets/tarot',           // Not /assets/...
```

### CloudFront Showing Old Content

**Problem:** Changes not appearing after deployment

**Fix:** Invalidate cache:
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

Wait 5-10 minutes for invalidation to complete.

### CORS Errors

**Problem:** Browser console shows CORS error when calling Lambda

**Fix:** Update Lambda CORS configuration to allow your domain:
```python
# In lambda/fortune-generator/index.py
'Access-Control-Allow-Origin': 'https://your-actual-domain.com'
```

Redeploy Lambda function.

---

## Common Commands

```bash
# GitHub Pages: Push and deploy
git push origin main

# S3: Quick sync
aws s3 sync . s3://lotto-graveyard --exclude ".git*" --delete

# CloudFront: Invalidate cache
aws cloudfront create-invalidation --distribution-id E123 --paths "/*"

# Test site
curl -I https://your-site-url.com

# Check GitHub Actions status
# Visit: https://github.com/<username>/<repo>/actions

# Local testing
npm run serve
# Visit: http://localhost:8000
```

---

## Need Help?

- **Complete documentation**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Lambda deployment**: [cdk/DEPLOYMENT_GUIDE.md](cdk/DEPLOYMENT_GUIDE.md)
- **GitHub Issues**: Report bugs or ask questions
- **AWS Support**: For AWS-specific issues

