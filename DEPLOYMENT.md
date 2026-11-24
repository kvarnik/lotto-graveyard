# Deployment Guide: Lotto Graveyard

This guide covers deploying the Lotto Graveyard static website using either GitHub Pages or AWS S3 + CloudFront.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Option 1: GitHub Pages (Recommended for Quick Start)](#option-1-github-pages)
3. [Option 2: AWS S3 + CloudFront (Production)](#option-2-aws-s3--cloudfront)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [Custom Domain Setup](#custom-domain-setup)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### For All Deployments
- Git repository with code pushed to GitHub
- Lambda Function URL from Lambda deployment (see `cdk/DEPLOYMENT_GUIDE.md`)
- Updated `js/config.js` with your Lambda Function URL

### For GitHub Pages
- GitHub account with repository access
- Repository must be public (or GitHub Pro for private repos)

### For AWS S3 + CloudFront
- AWS account with appropriate permissions
- AWS CLI installed and configured
- S3 bucket creation permissions
- CloudFront distribution creation permissions

---

## Option 1: GitHub Pages

GitHub Pages is the simplest deployment option, ideal for quick start and development.

### Advantages
- ✅ Free hosting
- ✅ Automatic HTTPS with github.io domain
- ✅ Easy setup (one-click in settings)
- ✅ Automatic deployments via GitHub Actions
- ✅ No server management

### Disadvantages
- ❌ Limited to 1GB storage
- ❌ 100GB bandwidth per month
- ❌ Slower than CDN for global users
- ❌ Limited custom domain options (single domain)

### Setup Instructions

#### Method A: Enable in Repository Settings (Manual)

1. **Navigate to Repository Settings**
   ```
   https://github.com/<username>/lotto-graveyard/settings/pages
   ```

2. **Configure GitHub Pages**
   - **Source**: Select "Deploy from a branch"
   - **Branch**: Select `gh-pages` (recommended) or `main`
   - **Folder**: Select `/ (root)`
   - Click **Save**

3. **Wait for Deployment**
   - GitHub will build and deploy your site
   - Check the status at the top of the Pages settings
   - Deployment typically takes 1-2 minutes

4. **Access Your Site**
   ```
   https://<username>.github.io/lotto-graveyard
   ```

#### Method B: Automatic Deployment via GitHub Actions (Recommended)

The repository already includes a deployment workflow at `.github/workflows/deploy.yml`.

1. **Verify Workflow Configuration**
   
   The workflow is already configured to deploy to GitHub Pages on every push to `main`:
   
   ```yaml
   on:
     push:
       branches:
         - main
   ```

2. **Enable GitHub Actions**
   
   - Go to repository **Settings** → **Actions** → **General**
   - Ensure "Allow all actions and reusable workflows" is selected
   - Click **Save**

3. **Configure GitHub Pages for Actions**
   
   - Go to repository **Settings** → **Pages**
   - **Source**: Select "GitHub Actions" (if available) or "Deploy from a branch"
   - If using branch deployment, select `gh-pages` branch

4. **Push to Main Branch**
   
   ```bash
   git add .
   git commit -m "Configure deployment"
   git push origin main
   ```

5. **Monitor Deployment**
   
   - Go to the **Actions** tab in your repository
   - Click on the latest workflow run
   - Wait for all steps to complete (green checkmarks)

6. **Access Your Deployed Site**
   
   ```
   https://<username>.github.io/lotto-graveyard
   ```

#### Update Base Path (If Using Repository Name in URL)

If your site is at `https://username.github.io/lotto-graveyard`, you need to update paths:

1. **Update `js/config.js`**
   
   ```javascript
   const CONFIG = {
       // Update paths to include repository name
       DATA_FILE_PATH: '/lotto-graveyard/data/historical-data.json',
       TAROT_IMAGES_PATH: '/lotto-graveyard/assets/tarot',
       // ... rest of config
   };
   ```

2. **Update `index.html` (if needed)**
   
   Update any absolute paths in `<link>` and `<script>` tags:
   
   ```html
   <link rel="stylesheet" href="/lotto-graveyard/css/main.css">
   <script src="/lotto-graveyard/js/config.js"></script>
   ```

   Or use relative paths (recommended):
   
   ```html
   <link rel="stylesheet" href="css/main.css">
   <script src="js/config.js"></script>
   ```

---

## Option 2: AWS S3 + CloudFront

AWS S3 with CloudFront provides production-grade hosting with global CDN distribution.

### Advantages
- ✅ Fast global delivery via CloudFront CDN
- ✅ Scalable (handles high traffic)
- ✅ Custom domain with SSL support
- ✅ Advanced caching and compression
- ✅ DDoS protection via AWS Shield

### Disadvantages
- ❌ Costs money (small but not free)
- ❌ More complex setup
- ❌ Requires AWS account management

### Cost Estimate
- S3 storage: ~$0.023/GB/month
- CloudFront data transfer: ~$0.085/GB (first 10TB)
- For typical traffic: **$1-5/month**

### Setup Instructions

#### Step 1: Create S3 Bucket

1. **Create the Bucket**
   
   ```bash
   aws s3 mb s3://lotto-graveyard --region us-east-1
   ```
   
   Or use a unique name:
   
   ```bash
   aws s3 mb s3://lotto-graveyard-<unique-id> --region us-east-1
   ```

2. **Configure Bucket for Static Website Hosting**
   
   ```bash
   aws s3 website s3://lotto-graveyard \
     --index-document index.html \
     --error-document index.html
   ```

3. **Create Bucket Policy for Public Read Access**
   
   Create `bucket-policy.json`:
   
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::lotto-graveyard/*"
       }
     ]
   }
   ```
   
   Apply the policy:
   
   ```bash
   aws s3api put-bucket-policy \
     --bucket lotto-graveyard \
     --policy file://bucket-policy.json
   ```

4. **Upload Files to S3**
   
   ```bash
   aws s3 sync . s3://lotto-graveyard \
     --exclude ".git*" \
     --exclude ".github/*" \
     --exclude "lambda/*" \
     --exclude "scripts/*" \
     --exclude ".kiro/*" \
     --exclude "node_modules/*" \
     --exclude "cdk/*" \
     --exclude "*.md" \
     --delete
   ```

#### Step 2: Create CloudFront Distribution

1. **Create CloudFront Distribution**
   
   Create `cloudfront-config.json`:
   
   ```json
   {
     "CallerReference": "lotto-graveyard-2025",
     "Comment": "Lotto Graveyard Static Site",
     "DefaultRootObject": "index.html",
     "Origins": {
       "Quantity": 1,
       "Items": [
         {
           "Id": "S3-lotto-graveyard",
           "DomainName": "lotto-graveyard.s3-website-us-east-1.amazonaws.com",
           "CustomOriginConfig": {
             "HTTPPort": 80,
             "HTTPSPort": 443,
             "OriginProtocolPolicy": "http-only"
           }
         }
       ]
     },
     "DefaultCacheBehavior": {
       "TargetOriginId": "S3-lotto-graveyard",
       "ViewerProtocolPolicy": "redirect-to-https",
       "AllowedMethods": {
         "Quantity": 2,
         "Items": ["GET", "HEAD"],
         "CachedMethods": {
           "Quantity": 2,
           "Items": ["GET", "HEAD"]
         }
       },
       "ForwardedValues": {
         "QueryString": false,
         "Cookies": {
           "Forward": "none"
         }
       },
       "MinTTL": 0,
       "DefaultTTL": 86400,
       "MaxTTL": 31536000,
       "Compress": true
     },
     "Enabled": true,
     "PriceClass": "PriceClass_100",
     "CustomErrorResponses": {
       "Quantity": 1,
       "Items": [
         {
           "ErrorCode": 404,
           "ResponsePagePath": "/index.html",
           "ResponseCode": "200",
           "ErrorCachingMinTTL": 300
         }
       ]
     }
   }
   ```
   
   Create distribution:
   
   ```bash
   aws cloudfront create-distribution \
     --distribution-config file://cloudfront-config.json
   ```

2. **Get CloudFront URL**
   
   ```bash
   aws cloudfront list-distributions \
     --query "DistributionList.Items[?Comment=='Lotto Graveyard Static Site'].DomainName" \
     --output text
   ```
   
   Your site will be available at:
   ```
   https://d1234567890abc.cloudfront.net
   ```

3. **Wait for Distribution to Deploy**
   
   CloudFront deployment takes 15-20 minutes. Check status:
   
   ```bash
   aws cloudfront get-distribution --id <distribution-id> \
     --query "Distribution.Status" \
     --output text
   ```
   
   Wait until status is "Deployed".

#### Step 3: Configure Automatic Deployment via GitHub Actions

1. **Create AWS IAM User for GitHub Actions**
   
   ```bash
   aws iam create-user --user-name github-actions-lotto-graveyard
   ```

2. **Create IAM Policy**
   
   Create `github-actions-policy.json`:
   
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::lotto-graveyard",
           "arn:aws:s3:::lotto-graveyard/*"
         ]
       },
       {
         "Effect": "Allow",
         "Action": [
           "cloudfront:CreateInvalidation"
         ],
         "Resource": "*"
       }
     ]
   }
   ```
   
   Attach policy:
   
   ```bash
   aws iam put-user-policy \
     --user-name github-actions-lotto-graveyard \
     --policy-name S3CloudFrontAccess \
     --policy-document file://github-actions-policy.json
   ```

3. **Create Access Keys**
   
   ```bash
   aws iam create-access-key --user-name github-actions-lotto-graveyard
   ```
   
   Save the `AccessKeyId` and `SecretAccessKey` from the output.

4. **Add Secrets to GitHub Repository**
   
   - Go to repository **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Add:
     - `AWS_ACCESS_KEY_ID`: Your access key ID
     - `AWS_SECRET_ACCESS_KEY`: Your secret access key

5. **Update `.github/workflows/deploy.yml`**
   
   Uncomment the S3 deployment section and update with your bucket name and CloudFront distribution ID:
   
   ```yaml
   - name: Configure AWS credentials
     uses: aws-actions/configure-aws-credentials@v4
     with:
       aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
       aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
       aws-region: us-east-1
   
   - name: Deploy to S3
     run: |
       aws s3 sync . s3://lotto-graveyard \
         --exclude ".git*" \
         --exclude ".github/*" \
         --exclude "lambda/*" \
         --exclude "scripts/*" \
         --exclude ".kiro/*" \
         --delete
   
   - name: Invalidate CloudFront
     run: |
       aws cloudfront create-invalidation \
         --distribution-id YOUR_DISTRIBUTION_ID \
         --paths "/*"
   ```

6. **Commit and Push**
   
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Configure S3 + CloudFront deployment"
   git push origin main
   ```

---

## Post-Deployment Configuration

### 1. Update Lambda Function URL

If you haven't already, update `js/config.js` with your Lambda Function URL:

```javascript
const CONFIG = {
    FORTUNE_LAMBDA_URL: 'https://your-actual-function-url.lambda-url.us-east-1.on.aws/',
    // ... rest of config
};
```

Commit and push:

```bash
git add js/config.js
git commit -m "Update Lambda Function URL"
git push origin main
```

### 2. Test Your Deployment

1. **Visit your deployed site**
   - GitHub Pages: `https://<username>.github.io/lotto-graveyard`
   - CloudFront: `https://<distribution-id>.cloudfront.net`

2. **Test core functionality**
   - Enter lottery numbers manually
   - View tombstone analysis
   - Request tarot reading
   - Verify fortune generation works

3. **Check browser console for errors**
   - Open Developer Tools (F12)
   - Look for 404 errors (missing resources)
   - Look for CORS errors (Lambda configuration)

### 3. Verify HTTPS

Both GitHub Pages and CloudFront provide automatic HTTPS. Verify:

```bash
curl -I https://your-site-url.com
```

Look for:
```
HTTP/2 200
```

### 4. Test Responsive Design

Test on multiple devices and screen sizes:
- Desktop (1920x1080, 1366x768)
- Tablet (768x1024)
- Mobile (375x667, 414x896)

### 5. Monitor Performance

Use Google PageSpeed Insights:
```
https://pagespeed.web.dev/
```

Target scores:
- Performance: >90
- Accessibility: 100
- Best Practices: >90
- SEO: >90

---

## Custom Domain Setup

### For GitHub Pages

1. **Add Custom Domain in GitHub Settings**
   
   - Go to repository **Settings** → **Pages**
   - Under "Custom domain", enter your domain (e.g., `lotto-graveyard.com`)
   - Click **Save**

2. **Configure DNS Records**
   
   Add these records with your DNS provider:
   
   **For apex domain (lotto-graveyard.com):**
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
   Value: 185.199.109.153
   Value: 185.199.110.153
   Value: 185.199.111.153
   ```
   
   **For subdomain (www.lotto-graveyard.com):**
   ```
   Type: CNAME
   Name: www
   Value: <username>.github.io
   ```

3. **Enable HTTPS**
   
   - Wait for DNS propagation (up to 24 hours)
   - In GitHub Pages settings, check "Enforce HTTPS"

### For CloudFront

1. **Request SSL Certificate in AWS Certificate Manager (ACM)**
   
   ```bash
   aws acm request-certificate \
     --domain-name lotto-graveyard.com \
     --subject-alternative-names www.lotto-graveyard.com \
     --validation-method DNS \
     --region us-east-1
   ```
   
   Note: Certificates for CloudFront must be in `us-east-1` region.

2. **Validate Domain Ownership**
   
   - Check your email for validation email from AWS
   - Or add DNS CNAME records (recommended)
   
   ```bash
   aws acm describe-certificate \
     --certificate-arn <certificate-arn> \
     --region us-east-1
   ```
   
   Add the CNAME record shown in the output to your DNS.

3. **Update CloudFront Distribution**
   
   ```bash
   aws cloudfront update-distribution \
     --id <distribution-id> \
     --distribution-config file://updated-cloudfront-config.json
   ```
   
   Add to your config:
   ```json
   {
     "Aliases": {
       "Quantity": 2,
       "Items": ["lotto-graveyard.com", "www.lotto-graveyard.com"]
     },
     "ViewerCertificate": {
       "ACMCertificateArn": "arn:aws:acm:us-east-1:...",
       "SSLSupportMethod": "sni-only",
       "MinimumProtocolVersion": "TLSv1.2_2021"
     }
   }
   ```

4. **Configure DNS**
   
   Add CNAME record:
   ```
   Type: CNAME
   Name: lotto-graveyard.com (or www)
   Value: d1234567890abc.cloudfront.net
   ```

5. **Wait for Propagation**
   
   DNS changes take 1-24 hours to propagate globally.

---

## Troubleshooting

### GitHub Pages Issues

**Problem: Site not accessible after deployment**

✅ **Solution:**
- Check GitHub Actions workflow status (Actions tab)
- Verify branch and folder settings in Pages configuration
- Wait 1-2 minutes for deployment to complete
- Clear browser cache and try incognito mode

**Problem: 404 errors for assets**

✅ **Solution:**
- Verify file paths in HTML are correct (relative vs absolute)
- Check case sensitivity (GitHub Pages is case-sensitive)
- Ensure files are committed and pushed to repository
- Update base path if using repository name in URL

**Problem: Fortune generation not working**

✅ **Solution:**
- Verify Lambda Function URL is correct in `js/config.js`
- Check browser console for CORS errors
- Verify Lambda CORS configuration allows your GitHub Pages domain
- Test Lambda function directly with curl

### S3 + CloudFront Issues

**Problem: S3 bucket access denied**

✅ **Solution:**
- Check bucket policy allows public read access
- Verify IAM permissions for GitHub Actions user
- Check bucket region matches your configuration

**Problem: CloudFront shows S3 403 errors**

✅ **Solution:**
- Verify S3 bucket policy is correct
- Check CloudFront origin configuration
- Ensure default root object is set to `index.html`
- Wait for cache invalidation to complete

**Problem: Changes not appearing after deployment**

✅ **Solution:**
- Create CloudFront invalidation:
  ```bash
  aws cloudfront create-invalidation \
    --distribution-id <distribution-id> \
    --paths "/*"
  ```
- Wait 5-10 minutes for invalidation
- Clear browser cache
- Try incognito mode

**Problem: Custom domain not working with CloudFront**

✅ **Solution:**
- Verify ACM certificate is in `us-east-1` region
- Check certificate is validated (green checkmark in ACM)
- Verify DNS CNAME points to CloudFront distribution
- Wait for DNS propagation (up to 24 hours)
- Check CloudFront distribution alternate domain names

### General Issues

**Problem: Lambda CORS errors in browser console**

✅ **Solution:**
- Update Lambda CORS configuration to allow your domain
- Verify `Access-Control-Allow-Origin` header in Lambda response
- If using custom domain, update Lambda CORS to include it
- Test with `*` temporarily to isolate issue

**Problem: Historical data not loading**

✅ **Solution:**
- Verify `data/historical-data.json` exists in deployment
- Check file path in `js/config.js` is correct
- Look for 404 errors in browser console
- Verify GitHub Actions data update workflow ran successfully

**Problem: Tarot images not displaying**

✅ **Solution:**
- Verify `assets/tarot/` directory is in deployment
- Check image paths in `js/tarot-deck.js`
- Ensure images are not in `.gitignore`
- Look for 404 errors in browser console

---

## Deployment Checklist

Before going live, verify:

- [ ] Lambda Function URL is configured and working
- [ ] `js/config.js` has correct Lambda URL
- [ ] Historical data file exists and is up to date
- [ ] All tarot card images are present
- [ ] HTTPS is enabled
- [ ] GitHub Actions workflows are working
- [ ] Manual number input works
- [ ] Tombstone displays correctly
- [ ] Tarot reading generates fortunes
- [ ] Site is responsive on mobile/tablet/desktop
- [ ] All tests pass
- [ ] Browser console shows no errors
- [ ] Custom domain is configured (if applicable)
- [ ] DNS records are correct
- [ ] SSL certificate is valid

---

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/latest/)
- [Lambda Deployment Guide](cdk/DEPLOYMENT_GUIDE.md)

---

## Support

For issues related to:
- **Static site deployment**: Check this document
- **Lambda function deployment**: See `cdk/DEPLOYMENT_GUIDE.md`
- **Code issues**: Check GitHub repository issues
- **AWS billing**: Check AWS Cost Explorer dashboard

