# Deployment Checklist

Use this checklist to ensure a smooth deployment of the Lotto Graveyard application.

## Pre-Deployment

### Code Preparation
- [ ] All code changes committed to git
- [ ] All tests passing (run `npm test`)
- [ ] Code reviewed and approved
- [ ] No sensitive data in code (API keys, passwords, etc.)
- [ ] `.gitignore` properly configured

### Lambda Function (Backend)
- [ ] Lambda function deployed (see `cdk/DEPLOYMENT_GUIDE.md`)
- [ ] Lambda Function URL obtained from deployment output
- [ ] Lambda CORS configured to allow your domain
- [ ] Lambda timeout set to 30 seconds
- [ ] Lambda memory set to at least 256MB
- [ ] Lambda has IAM permissions for Bedrock/AI service
- [ ] Lambda tested manually with curl or Postman
- [ ] AI API key/credentials configured in Lambda environment

### Configuration Files
- [ ] `js/config.js` updated with Lambda Function URL
- [ ] `js/config.js` paths are correct (relative vs absolute)
- [ ] Lambda URL does not contain "your-function-url"
- [ ] All required files present (index.html, CSS, JS, assets, data)
- [ ] Historical data file exists (`data/historical-data.json`)
- [ ] All 78 tarot card images present in `assets/tarot/`

### GitHub Setup
- [ ] Code pushed to GitHub repository
- [ ] Repository is public (or GitHub Pro for private)
- [ ] GitHub Actions enabled in repository settings
- [ ] `.github/workflows/deploy.yml` configured correctly

---

## Deployment: GitHub Pages

### Initial Setup
- [ ] Run `./scripts/deploy-github-pages.sh` OR
- [ ] Manually enable GitHub Pages in repository settings
  - [ ] Source: Deploy from a branch
  - [ ] Branch: `gh-pages`
  - [ ] Folder: `/ (root)`
- [ ] GitHub Actions workflow "Deploy Static Site" runs successfully
- [ ] No errors in Actions tab

### Verification
- [ ] Site accessible at `https://<username>.github.io/<repo-name>`
- [ ] HTTPS enabled (automatic with GitHub Pages)
- [ ] All pages load without 404 errors
- [ ] CSS styles applied correctly
- [ ] JavaScript loads without errors (check browser console)
- [ ] Images display correctly

### Path Configuration (if needed)
- [ ] If using repository name in URL, paths updated in `js/config.js`:
  - [ ] `DATA_FILE_PATH` uses relative or prefixed path
  - [ ] `TAROT_IMAGES_PATH` uses relative or prefixed path
- [ ] Or all paths are relative (recommended)

---

## Deployment: AWS S3 + CloudFront

### S3 Bucket Setup
- [ ] S3 bucket created (`aws s3 mb s3://bucket-name`)
- [ ] Static website hosting enabled
- [ ] Bucket policy allows public read access
- [ ] Files uploaded to S3
- [ ] Cache headers configured correctly
- [ ] S3 website URL accessible

### CloudFront Setup
- [ ] CloudFront distribution created
- [ ] Distribution points to S3 bucket origin
- [ ] Default root object set to `index.html`
- [ ] Error pages (404, 403) redirect to `index.html`
- [ ] HTTPS enabled (automatic with CloudFront)
- [ ] Compression enabled
- [ ] Cache behaviors configured:
  - [ ] Assets cached for 1 year
  - [ ] CSS/JS cached for 1 day
  - [ ] HTML cached for 5 minutes
- [ ] Distribution status is "Deployed"

### DNS & Domain (Optional)
- [ ] Custom domain configured in CloudFront
- [ ] SSL certificate requested and validated in ACM (us-east-1)
- [ ] DNS CNAME record points to CloudFront distribution
- [ ] DNS propagated (can take up to 24 hours)
- [ ] Domain accessible via HTTPS

### GitHub Actions for S3 (Optional)
- [ ] AWS credentials added to GitHub Secrets:
  - [ ] `AWS_ACCESS_KEY_ID`
  - [ ] `AWS_SECRET_ACCESS_KEY`
  - [ ] `S3_BUCKET_NAME` (optional)
  - [ ] `CLOUDFRONT_DISTRIBUTION_ID`
- [ ] S3 deployment job enabled in `.github/workflows/deploy.yml`
- [ ] GitHub Pages job disabled (or delete the job)
- [ ] Workflow runs successfully on push to main

---

## Post-Deployment Testing

### Automated Tests
- [ ] Smoke tests pass in GitHub Actions
- [ ] No failed workflow runs
- [ ] Deployment completes in reasonable time (<5 minutes)

### Manual Functional Testing
- [ ] **Homepage loads**
  - [ ] No JavaScript errors in console
  - [ ] No 404 errors for resources
  - [ ] Rider-Waite styling applied correctly

- [ ] **Number Input**
  - [ ] Manual input form displays
  - [ ] Can enter 5 white balls and 1 powerball
  - [ ] Validation works (try invalid numbers)
  - [ ] Error messages display correctly

- [ ] **Webcam Scanner** (if supported)
  - [ ] Can access camera (if permissions granted)
  - [ ] OCR functionality works
  - [ ] Fallback to manual input works

- [ ] **Historical Analysis**
  - [ ] Data loads from `data/historical-data.json`
  - [ ] Analysis completes successfully
  - [ ] Tombstone displays with numbers and epitaph

- [ ] **Tarot Reading**
  - [ ] Prompt appears after tombstone
  - [ ] Question input accepts text (1-200 chars)
  - [ ] Validation works (try empty question)
  - [ ] Cards display correctly
  - [ ] Card images load (all 3 cards)

- [ ] **Fortune Generation**
  - [ ] Fortune request sent to Lambda
  - [ ] Loading indicator shows
  - [ ] Fortune returns successfully (within 30 seconds)
  - [ ] Fortune displays correctly
  - [ ] No CORS errors in console

### Responsive Design Testing
- [ ] Desktop (1920x1080)
  - [ ] Layout correct
  - [ ] All elements visible
  - [ ] No horizontal scrolling

- [ ] Tablet (768x1024)
  - [ ] Layout adapts correctly
  - [ ] Touch targets at least 44x44px
  - [ ] All elements accessible

- [ ] Mobile (375x667)
  - [ ] Single-column layout
  - [ ] Font size minimum 14px
  - [ ] Tombstone fits width
  - [ ] No horizontal scrolling

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (macOS/iOS)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome (Android)

### Performance Testing
- [ ] Page loads in <5 seconds on broadband
- [ ] Historical data loads in <2 seconds
- [ ] Analysis completes in <500ms
- [ ] Fortune generates in <30 seconds
- [ ] Google PageSpeed score >90

### Accessibility Testing
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Color contrast ratio ≥4.5:1
- [ ] Keyboard navigation works
- [ ] Screen reader compatible (test with VoiceOver/NVDA)
- [ ] Focus indicators visible
- [ ] ARIA landmarks present

### Security Testing
- [ ] HTTPS enabled
- [ ] No mixed content warnings
- [ ] No exposed API keys or secrets
- [ ] Lambda CORS properly configured
- [ ] No XSS vulnerabilities
- [ ] Input validation working

---

## Monitoring & Maintenance

### Setup Monitoring
- [ ] CloudWatch alarms configured for Lambda:
  - [ ] Error rate >5%
  - [ ] Duration >25 seconds
  - [ ] Throttles >0
- [ ] GitHub Actions notifications enabled
- [ ] Error tracking configured (optional: Sentry, etc.)

### Documentation
- [ ] README.md up to date
- [ ] DEPLOYMENT.md reviewed and accurate
- [ ] Lambda Function URL documented
- [ ] Custom domain documented (if applicable)
- [ ] Known issues documented

### Backup & Recovery
- [ ] Repository backed up (GitHub provides this)
- [ ] Lambda function code backed up
- [ ] Historical data backed up
- [ ] Deployment scripts tested
- [ ] Rollback procedure documented

---

## Go-Live Checklist

### Final Pre-Launch
- [ ] All above checklists complete
- [ ] No critical bugs or errors
- [ ] Performance acceptable
- [ ] Accessibility compliant
- [ ] All stakeholders approve

### Launch
- [ ] Update any external links to new URL
- [ ] Announce launch (social media, email, etc.)
- [ ] Monitor for first few hours
- [ ] Watch CloudWatch logs for errors
- [ ] Check GitHub Actions runs

### Post-Launch
- [ ] Monitor performance for 24-48 hours
- [ ] Address any user-reported issues
- [ ] Document any lessons learned
- [ ] Plan for future updates
- [ ] Set up regular data updates (GitHub Actions cron job)

---

## Troubleshooting Quick Links

If you encounter issues, check these resources:

- **General Deployment Issues**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Quick Commands**: [DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md)
- **Lambda Issues**: [cdk/DEPLOYMENT_GUIDE.md](cdk/DEPLOYMENT_GUIDE.md)
- **GitHub Actions Logs**: `https://github.com/<username>/<repo>/actions`
- **AWS CloudWatch Logs**: Check Lambda function logs
- **Browser Console**: Press F12, check for errors

---

## Sign-Off

Deployment completed by: ___________________________

Date: ___________________________

Production URL: ___________________________

Lambda Function URL: ___________________________

CloudFront Distribution ID (if applicable): ___________________________

Notes:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

