# Security Audit Report - Lotto Graveyard

**Date**: January 2025  
**Auditor**: Kiro AI  
**Scope**: Frontend application and AWS Lambda backend

---

## Executive Summary

The Lotto Graveyard application is a static website with minimal attack surface. Overall security posture is **GOOD** with several areas requiring immediate attention. The application properly validates inputs, escapes user content, and implements security best practices in most areas.

### Risk Summary
- **Critical**: 1 issue
- **High**: 2 issues
- **Medium**: 3 issues
- **Low**: 4 issues
- **Informational**: 3 issues

---

## Critical Issues ❌

### 1. CORS Wildcard on Lambda Function

**File**: `lambda/fortune-generator/index.py`  
**Line**: 468

**Issue**:
```python
'Access-Control-Allow-Origin': '*',  # TODO: Configure specific domain in production
```

The Lambda function accepts requests from ANY origin, allowing malicious sites to call your fortune generation API and consume your AWS credits.

**Impact**:
- **API abuse**: Attackers can call your Lambda function from their own sites
- **Cost**: Could result in unexpected AWS bills
- **Rate limiting bypass**: No origin-based rate limiting possible

**Recommendation**:
```python
# Configure allowed origins
ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', 'https://kvarnik.github.io').split(',')

def get_cors_headers(request_origin=None):
    """Get CORS headers with origin validation"""
    origin = '*'  # Default for preflight
    
    if request_origin in ALLOWED_ORIGINS:
        origin = request_origin
    
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Origin'  # Important for caching
    }

# In handler:
def handler(event, context):
    request_origin = event.get('headers', {}).get('origin') or \
                    event.get('headers', {}).get('Origin')
    # Use request_origin in CORS responses
```

**Timeline**: Fix immediately before deploying to production

---

## High Issues 🔴

### 2. No Rate Limiting on Lambda Function

**File**: `lambda/fortune-generator/index.py`

**Issue**: The Lambda function has no rate limiting. An attacker could spam requests and drain your AWS budget.

**Impact**:
- **Cost**: Expensive AI model (Claude) calls add up quickly
- **DoS**: Could overwhelm the service
- **No circuit breaker**: Failed requests retry without backoff limits

**Recommendation**:

**Option A - API Gateway Rate Limiting** (Recommended):
```yaml
# If using API Gateway, add rate limiting:
Resources:
  FortuneAPI:
    Type: AWS::ApiGatewayV2::Api
    Properties:
      ThrottleSettings:
        RateLimit: 10    # 10 requests per second
        BurstLimit: 20   # Burst up to 20
```

**Option B - Lambda-based Rate Limiting**:
```python
import time
from functools import lru_cache

# Simple in-memory rate limiter (works for single Lambda instance)
rate_limits = {}

def check_rate_limit(identifier, max_requests=10, window_seconds=60):
    """
    Rate limit by identifier (IP, session, etc.)
    Returns: (allowed: bool, retry_after: int|None)
    """
    now = time.time()
    
    # Clean old entries
    rate_limits[identifier] = [
        ts for ts in rate_limits.get(identifier, [])
        if now - ts < window_seconds
    ]
    
    if len(rate_limits[identifier]) >= max_requests:
        oldest = rate_limits[identifier][0]
        retry_after = int(window_seconds - (now - oldest))
        return False, retry_after
    
    rate_limits[identifier].append(now)
    return True, None

# In handler:
def handler(event, context):
    # Use source IP as identifier
    ip = event.get('requestContext', {}).get('http', {}).get('sourceIp', 'unknown')
    
    allowed, retry_after = check_rate_limit(ip, max_requests=10, window_seconds=60)
    
    if not allowed:
        return {
            'statusCode': 429,
            'headers': {
                **get_cors_headers(),
                'Retry-After': str(retry_after)
            },
            'body': json.dumps({
                'error': 'RateLimitExceeded',
                'message': f'Too many requests. Retry after {retry_after} seconds.'
            })
        }
```

**Option C - Use DynamoDB for Distributed Rate Limiting** (Best for scale):
```python
# Use DynamoDB to track request counts across Lambda instances
# See AWS documentation for implementation
```

**Timeline**: Implement within 1 week

---

### 3. Lambda Function URL Exposed in Frontend Code

**File**: `js/config.js`  
**Line**: 7

**Issue**:
```javascript
FORTUNE_LAMBDA_URL: 'https://your-function-url.lambda-url.us-east-1.on.aws/',
```

The Lambda URL is hardcoded and visible to anyone. Combined with CORS wildcard (#1), this is a security risk.

**Impact**:
- **API discovery**: Attackers know exactly where to send requests
- **No obscurity**: Can't rotate URLs without redeploying frontend

**Recommendation**:

**Option A - Use CloudFront + API Gateway** (Best):
```javascript
// Use your own domain
FORTUNE_LAMBDA_URL: 'https://api.lotto-graveyard.com/fortune',
```
- Hides Lambda URL behind CloudFront
- Enables WAF (Web Application Firewall)
- Better DDoS protection
- Professional appearance

**Option B - Add API Key** (Medium):
```javascript
// Require API key (still public but adds friction)
async generateFortune(question, cards) {
    const response = await fetch(this.lambdaUrl, {
        headers: {
            'X-API-Key': 'your-rotating-key',
            'Content-Type': 'application/json'
        },
        // ...
    });
}
```
Then validate in Lambda:
```python
API_KEY = os.environ.get('API_KEY')

def handler(event, context):
    provided_key = event.get('headers', {}).get('x-api-key')
    if provided_key != API_KEY:
        return error_response(403, 'Forbidden')
```

**Note**: API keys in frontend code are **not secure** but add friction for casual attackers.

**Timeline**: Implement within 2 weeks

---

## Medium Issues ⚠️

### 4. Insufficient Input Sanitization in Fortune Display

**File**: `js/fortune-client.js`  
**Lines**: 152-166

**Issue**:
```javascript
displayFortune(fortune) {
    const fortuneDiv = document.createElement('div');
    // ...
    const paragraphs = fortune.split('\n\n');
    paragraphs.forEach(paragraph => {
        if (paragraph.trim()) {
            const p = document.createElement('p');
            p.textContent = paragraph.trim();  // ✅ GOOD - uses textContent
            fortuneDiv.appendChild(p);
        }
    });
}
```

**Current Status**: ✅ This is actually GOOD - uses `textContent`

However, in `app.js` there are unsafe uses of `innerHTML`:

**File**: `js/app.js`  
**Lines**: 692, 823, 896

```javascript
// UNSAFE - if fortune contains HTML
fortuneContainer.innerHTML = fortuneHTML;
```

**Impact**:
- **XSS**: If Lambda returns malicious HTML (e.g., AI prompt injection), it could execute scripts
- **Unlikely but possible**: AI models can be manipulated to output HTML

**Recommendation**:
```javascript
// Always use textContent or escapeHtml()
fortuneContainer.textContent = fortune;

// OR if you need formatting:
function displayFortune(fortune) {
    const container = document.getElementById('fortune-container');
    container.innerHTML = '';  // Clear first
    
    const div = document.createElement('div');
    div.className = 'fortune-text';
    
    // Safely create paragraphs
    fortune.split('\n\n').forEach(para => {
        const p = document.createElement('p');
        p.textContent = para.trim();  // Safe
        div.appendChild(p);
    });
    
    container.appendChild(div);
}
```

**Grep for all innerHTML usage**:
```bash
grep -rn "innerHTML" js/ --include="*.js" | grep -v "test.js"
```

Audit each usage to ensure user input is escaped.

**Timeline**: Fix within 2 weeks

---

### 5. No Content Security Policy (CSP)

**File**: `index.html`  
**Missing**: CSP meta tag or headers

**Issue**: No CSP headers to prevent inline script injection.

**Impact**:
- **XSS amplification**: If XSS occurs, attacker has full access
- **Third-party script injection**: No restrictions on what scripts can run

**Recommendation**:

Add to `index.html` `<head>`:
```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' https://cdn.jsdelivr.net https://fonts.googleapis.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data:;
    connect-src 'self' https://*.lambda-url.*.on.aws https://*.github.io;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
">
```

**OR** (better) configure GitHub Pages headers:

Create `_headers` file:
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self' https://*.lambda-url.*.on.aws; frame-ancestors 'none'
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=(self)
```

**Note**: GitHub Pages may not support custom headers. Use meta tag as fallback.

**Timeline**: Implement within 1 month

---

### 6. Webcam Permissions - Privacy Concerns

**File**: `js/webcam-scanner.js`

**Issue**: Webcam is requested without clear user consent flow. Users should understand WHY camera access is needed BEFORE the browser prompt.

**Impact**:
- **Privacy**: Users may deny permission thinking it's suspicious
- **Accessibility**: No clear explanation for screen reader users

**Recommendation**:

Add a consent dialog BEFORE requesting camera:
```javascript
class WebcamScanner {
    async startCamera() {
        // Show consent dialog first
        const consent = await this.showConsentDialog();
        if (!consent) {
            throw new Error('Camera access denied by user');
        }
        
        // Then request actual permission
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            // ...
        } catch (error) {
            this.handleCameraError(error);
        }
    }
    
    async showConsentDialog() {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'camera-consent-dialog';
            dialog.innerHTML = `
                <div class="dialog-content">
                    <h3>Camera Access Needed</h3>
                    <p>We need access to your camera to scan lottery tickets. The image is processed locally on your device and never sent to a server.</p>
                    <p><strong>Your privacy:</strong> Images are not stored or transmitted.</p>
                    <button class="btn-primary" id="allow-camera">Allow Camera</button>
                    <button class="btn-secondary" id="deny-camera">Use Manual Entry</button>
                </div>
            `;
            document.body.appendChild(dialog);
            
            document.getElementById('allow-camera').addEventListener('click', () => {
                dialog.remove();
                resolve(true);
            });
            
            document.getElementById('deny-camera').addEventListener('click', () => {
                dialog.remove();
                resolve(false);
            });
        });
    }
}
```

**Timeline**: Implement within 1 month

---

## Low Issues 💡

### 7. No Subresource Integrity (SRI) for CDN Resources

**File**: `index.html`  
**Lines**: CDN script tags

**Issue**:
```html
<script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/seedrandom@3/seedrandom.min.js"></script>
```

No SRI hashes. If CDN is compromised, malicious code could be injected.

**Impact**:
- **Supply chain attack**: Compromised CDN could serve malicious JS
- **Low probability**: jsDelivr is reputable but SRI is best practice

**Recommendation**:
```html
<script 
    src="https://cdn.jsdelivr.net/npm/tesseract.js@5.1.0/dist/tesseract.min.js"
    integrity="sha384-[HASH-HERE]"
    crossorigin="anonymous"
></script>
```

Generate SRI hashes:
```bash
curl https://cdn.jsdelivr.net/npm/tesseract.js@5.1.0/dist/tesseract.min.js | \
    openssl dgst -sha384 -binary | \
    openssl base64 -A
```

Or use: https://www.srihash.org/

**Timeline**: Implement within 2 months

---

### 8. Error Messages Leak Implementation Details

**File**: `js/config.js`, `lambda/fortune-generator/index.py`

**Issue**: Error messages reveal internal implementation:
```javascript
DATA_LOAD_ERROR: 'Historical lottery data is currently unavailable. Please try again later.'
```
```python
except ClientError as e:
    error_code = e.response.get('Error', {}).get('Code', 'Unknown')
    print(f'AWS Bedrock ClientError: {error_code} - {str(e)}')  # ⚠️ Logs full error
```

**Impact**:
- **Information disclosure**: Attackers learn about backend (AWS Bedrock, error codes)
- **Low severity**: Logs are on Lambda, not visible to users

**Recommendation**:
- Keep user-facing errors vague
- Log detailed errors server-side only
- Don't expose AWS service names in client errors

```python
except ClientError as e:
    # Log full details server-side
    print(f'AWS Bedrock error: {str(e)}')
    # Return generic message to client
    raise Exception('Fortune generation failed')  # Generic
```

**Timeline**: Low priority, address when refactoring

---

### 9. No HTTPS Enforcement

**File**: Various

**Issue**: No explicit HTTPS enforcement in code or headers.

**Impact**:
- **MITM**: HTTP requests could be intercepted
- **GitHub Pages default**: HTTPS is enforced by default, but good to be explicit

**Recommendation**:

Add to index.html:
```html
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
```

This forces all HTTP requests to upgrade to HTTPS.

**Timeline**: Low priority (GitHub Pages handles this)

---

### 10. Local Storage Data Not Encrypted

**File**: `js/data-loader.js`

**Issue**: Historical data cached in localStorage is not encrypted.

**Impact**:
- **Low**: Lottery data is public information
- **Privacy**: If you later store user preferences, consider encryption

**Current Implementation**:
```javascript
localStorage.setItem(this.cacheKey, JSON.stringify(cacheEntry));
```

**Recommendation**:
- Current data: No action needed (public data)
- Future user data: Use encryption:

```javascript
// Use Web Crypto API for sensitive data
async function encryptData(data, key) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: /* ... */ },
        key,
        dataBuffer
    );
    
    return encrypted;
}
```

**Timeline**: No action required for current data

---

## Informational ℹ️

### 11. Clipboard API Fallback

**File**: `js/app.js`

**Current Implementation**:
```javascript
await navigator.clipboard.writeText(window.location.href);
```

**Note**: This may fail on HTTP (requires HTTPS). Already handled since GitHub Pages uses HTTPS.

**Status**: ✅ OK

---

### 12. Lambda Timeout is 30 Seconds

**File**: `lambda/fortune-generator/index.py`, `js/config.js`

**Current**:
```javascript
FORTUNE_TIMEOUT_MS: 30000, // 30 seconds
```

**Recommendation**: Consider reducing to 10-15 seconds for better UX. 30 seconds is very long for a web request.

```javascript
FORTUNE_TIMEOUT_MS: 15000, // 15 seconds
```

Also update Lambda configuration to match.

**Timeline**: Consider when optimizing performance

---

### 13. No Analytics or Monitoring

**Files**: All

**Issue**: No error tracking, usage analytics, or monitoring.

**Recommendation**: Add Sentry or similar for error tracking:

```html
<script src="https://js.sentry-cdn.com/[PROJECT-ID].min.js" crossorigin="anonymous"></script>
```

```javascript
Sentry.init({
    dsn: 'https://[KEY]@sentry.io/[PROJECT]',
    beforeSend(event, hint) {
        // Filter sensitive data
        return event;
    }
});
```

**Benefits**:
- Track errors in production
- Understand user issues
- Monitor Lambda failures

**Timeline**: Nice-to-have for future

---

## Positive Security Practices ✅

### What You're Doing Right:

1. **Input Validation**: Excellent validation in `validation.js` and Lambda
2. **XSS Prevention**: Using `textContent` in most places (fix remaining innerHTML)
3. **No SQL Injection**: Static site, no SQL database
4. **HTTPS**: GitHub Pages enforces HTTPS
5. **No Secrets in Code**: Lambda URL is not a secret (but should be protected with CORS)
6. **Deterministic RNG**: Using seedrandom for reproducible tarot readings (not security-critical but good)
7. **Timeout Handling**: All network requests have timeouts
8. **Error Handling**: Graceful degradation throughout
9. **Accessibility**: ARIA labels, focus management (security through usability)
10. **Data Minimization**: Not collecting or storing user data

---

## Priority Action Items

### Immediate (Critical - Fix before production):
1. ✅ **Fix CORS wildcard** - Restrict to your domain
2. ✅ **Add rate limiting** - Prevent API abuse

### High Priority (1-2 weeks):
3. ✅ **Audit all innerHTML usage** - Ensure XSS protection
4. ✅ **Add CSP headers** - Defense in depth

### Medium Priority (1-2 months):
5. ✅ **Add SRI hashes** - CDN integrity
6. ✅ **Webcam consent dialog** - Better UX and privacy
7. ✅ **Review error messages** - Don't leak internals

### Low Priority (Nice-to-have):
8. ✅ **Add monitoring** - Sentry or similar
9. ✅ **Reduce Lambda timeout** - Better UX
10. ✅ **Consider API Gateway** - Better control and monitoring

---

## Implementation Checklist

```markdown
- [ ] 1. Update Lambda CORS to whitelist only kvarnik.github.io
- [ ] 2. Implement rate limiting on Lambda (IP-based, 10 req/min)
- [ ] 3. Add API key to Lambda (rotate monthly)
- [ ] 4. Audit and fix all innerHTML usages in js/app.js
- [ ] 5. Add CSP meta tag to index.html
- [ ] 6. Add SRI hashes to CDN scripts
- [ ] 7. Add webcam consent dialog
- [ ] 8. Review and sanitize error messages
- [ ] 9. Add upgrade-insecure-requests directive
- [ ] 10. Consider adding Sentry for monitoring
```

---

## Testing Commands

```bash
# Check for XSS vulnerabilities
grep -rn "innerHTML\|outerHTML" js/ --include="*.js" | grep -v test

# Check for unsafe eval
grep -rn "eval\|Function(" js/ --include="*.js"

# Check for exposed secrets
grep -rn "password\|secret\|key\|token" . --include="*.js" --include="*.json"

# Test CORS
curl -H "Origin: https://evil.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://your-lambda-url

# Test rate limiting (after implementation)
for i in {1..20}; do 
    curl -X POST https://your-lambda-url -d '{"question":"test","cards":[...]}' 
done
```

---

## Conclusion

The Lotto Graveyard application has a solid security foundation. The main concerns are:

1. **CORS wildcard** allowing API abuse (critical)
2. **No rate limiting** allowing cost attacks (high)
3. **Minor XSS risks** from innerHTML usage (medium)

Fixing these three issues will significantly improve the security posture. The other recommendations are defense-in-depth measures that should be implemented over time.

**Overall Grade**: B+ (Good, with room for improvement)

After implementing critical fixes: **A- (Excellent)**
