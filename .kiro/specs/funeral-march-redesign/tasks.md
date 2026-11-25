# Funeral March Redesign - Tasks

## Overview

This is a **CSS reskin + minimal HTML additions** to transform the Lotto Graveyard from grayscale Rider-Waite to the bold Funeral March aesthetic. The existing HTML structure, JavaScript, and all functionality stay intact.

**Reference**: `design/funeral-march-reference.html` - copy visual styles from this mockup

---

## Task 1: Setup Branch & Fonts
**Estimated Time**: 20 minutes

Create branch and add Google Fonts to `index.html`:

```bash
git checkout main
git pull
git checkout -b redesign/funeral-march
```

**In `index.html` `<head>`, add before `main.css`:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bungee&family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&display=swap" rel="stylesheet">
```

**Commit**: "Setup: Add Bungee and Bricolage Grotesque fonts"

---

## Task 2: CSS Variables & Base Styles  
**Estimated Time**: 30 minutes

**Replace entire `:root` section in `css/main.css`:**

```css
:root {
    /* Funeral March Colors */
    --mustard: #F2C230;
    --ink: #1B1A17;
    --cream: #FFF6DC;
    --paper: #FFFFFF;
    --red: #C8402F;
    
    /* Typography */
    --font-display: Bungee, Impact, 'Arial Black', sans-serif;
    --font-body: 'Bricolage Grotesque', system-ui, sans-serif;
    
    /* Borders & Shadows */
    --border: 3px solid var(--ink);
    --shadow-cta: 5px 5px 0 var(--red);
    --shadow-card: 4px 4px 0 var(--ink);
    
    /* Radii */
    --radius-tombstone: 26px 26px 0 0;
    --radius-crypt: 4px 4px 0 0;
    
    /* Spacing (keep existing) */
    --spacing-xs: 8px;
    --spacing-sm: 16px;
    --spacing-md: 24px;
    --spacing-lg: 32px;
    --spacing-xl: 48px;
    --touch-target-min: 44px;
}
```

**Update body styles:**
```css
body {
    font-family: var(--font-body);
    font-size: 16px;
    font-weight: 500;
    line-height: 1.6;
    color: var(--ink);
    background-color: var(--cream);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}
```

**Update all headings:**
```css
h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    font-weight: 400;
    line-height: 1;
}
```

**Commit**: "CSS: Add Funeral March design tokens and base styles"

---

## Task 3: Hero Section HTML
**Estimated Time**: 45 minutes

**Wrap the existing `<header>` in `index.html` with a hero container and add procession SVG:**

Replace:
```html
<header role="banner">
    <h1>Lotto Graveyard</h1>
    <p class="tagline">Where lottery dreams find their final rest</p>
</header>
```

With:
```html
<section id="hero-card" aria-label="Share card">
    <div class="hero-header">
        <a href="#main-content" class="wordmark">LOTTO GRAVEYARD</a>
        <button type="button" id="menu-btn" aria-label="Open menu">
            <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true">
                <path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" stroke-width="3"/>
            </svg>
        </button>
    </div>
    
    <h1>RIP MY<br>NUMBERS</h1>
    <p class="hero-tagline">They died as they lived: not matching.</p>
    
    <svg class="funeral-procession" viewBox="0 0 354 190" role="img" aria-label="Five lottery balls in top hats march in a funeral procession carrying a ticket-shaped coffin, followed by a red Powerball waving a tiny black flag">
        <path d="M0 176h354" stroke="var(--ink)" stroke-width="4"/>
        <rect x="76" y="62" width="150" height="40" rx="4" fill="#5A3E22" stroke="var(--ink)" stroke-width="3.5"/>
        <path d="M90 74h40M90 84h60M90 94h30" stroke="#E8C79A" stroke-width="3"/>
        <text x="196" y="90" text-anchor="middle" font-family="Bungee, sans-serif" font-size="13" fill="#E8C79A">RIP</text>
        <g stroke="var(--ink)" stroke-width="3" stroke-linecap="round">
            <path d="M28 156l-6 20M40 156l6 20M98 156l-8 20M110 156l8 20M150 156l-6 20M162 156l6 20M206 156l-8 20M218 156l8 20M262 156l-6 20M274 156l6 20M314 156l-6 20M326 156l6 20"/>
            <path d="M100 120l8-18M158 120v-18M212 120l-6-18"/>
        </g>
        <g fill="var(--paper)" stroke="var(--ink)" stroke-width="3.5">
            <circle class="funeral-ball" cx="34" cy="138" r="22"/>
            <circle class="funeral-ball" cx="104" cy="138" r="22"/>
            <circle class="funeral-ball" cx="156" cy="138" r="22"/>
            <circle class="funeral-ball" cx="212" cy="138" r="22"/>
            <circle class="funeral-ball" cx="268" cy="138" r="22"/>
        </g>
        <circle class="funeral-ball" cx="320" cy="138" r="22" fill="var(--red)" stroke="var(--ink)" stroke-width="3.5"/>
        <g font-family="Bungee, sans-serif" font-size="15" text-anchor="middle" fill="var(--ink)">
            <text x="34" y="144">07</text>
            <text x="104" y="144">14</text>
            <text x="156" y="144">22</text>
            <text x="212" y="144">31</text>
            <text x="268" y="144">38</text>
        </g>
        <text x="320" y="144" text-anchor="middle" font-family="Bungee, sans-serif" font-size="15" fill="var(--paper)">09</text>
        <g fill="var(--ink)">
            <rect x="20" y="104" width="28" height="12"/>
            <rect x="14" y="114" width="40" height="4"/>
            <rect x="254" y="104" width="28" height="12"/>
            <rect x="248" y="114" width="40" height="4"/>
            <rect x="306" y="104" width="28" height="12"/>
            <rect x="300" y="114" width="40" height="4"/>
        </g>
        <g fill="var(--ink)">
            <circle cx="27" cy="134" r="2.5"/>
            <circle cx="41" cy="134" r="2.5"/>
            <circle cx="261" cy="134" r="2.5"/>
            <circle cx="275" cy="134" r="2.5"/>
            <circle cx="313" cy="134" r="2.5"/>
            <circle cx="327" cy="134" r="2.5"/>
        </g>
        <path d="M28 128l5 2M40 128l-5 2" stroke="var(--ink)" stroke-width="2"/>
        <path d="M342 132l6-50" stroke="var(--ink)" stroke-width="3"/>
        <path d="M348 82l-26 8 24 10z" fill="var(--ink)"/>
    </svg>
    
    <div class="hero-footer">
        <span class="site-url">lotto-graveyard.github.io</span>
        <span>BURY YOURS →</span>
    </div>
</section>

<div id="share-buttons">
    <button type="button" id="share-btn">
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <circle cx="4" cy="9" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/>
            <circle cx="14" cy="3.5" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/>
            <circle cx="14" cy="14.5" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/>
            <path d="M6 8l6-3.5M6 10l6 3.5" stroke="currentColor" stroke-width="2"/>
        </svg>
        Share the grief
    </button>
    <button type="button" id="copy-link-btn">Copy link</button>
</div>
```

**Commit**: "HTML: Add hero share card and procession SVG"

---

## Task 4: Hero Section CSS
**Estimated Time**: 1 hour

**Add to `css/main.css`:**

```css
/* Hero / Share Card */
#hero-card {
    background: var(--mustard);
    border-bottom: 4px solid var(--ink);
    padding: 18px 18px 0;
    position: relative;
    overflow: hidden;
    aspect-ratio: 4 / 5;
}

.hero-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 22px;
}

.wordmark {
    font-family: var(--font-display);
    font-size: 16px;
    color: var(--ink);
    text-decoration: none;
}

#menu-btn {
    width: 44px;
    height: 44px;
    border: 3px solid var(--ink);
    background: var(--mustard);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--ink);
}

#hero-card h1 {
    font-size: 54px;
    line-height: 0.92;
    letter-spacing: -0.01em;
    margin-bottom: 10px;
}

.hero-tagline {
    font-size: 19px;
    font-weight: 700;
    margin: 0;
}

.funeral-procession {
    position: absolute;
    left: 18px;
    bottom: 44px;
    width: calc(100% - 36px);
    height: auto;
}

.funeral-ball {
    animation: funeral-bob 2s ease-in-out infinite;
}

.funeral-ball:nth-child(2) { animation-delay: 0.1s; }
.funeral-ball:nth-child(3) { animation-delay: 0.2s; }
.funeral-ball:nth-child(4) { animation-delay: 0.3s; }
.funeral-ball:nth-child(5) { animation-delay: 0.4s; }
.funeral-ball:nth-child(6) { animation-delay: 0.5s; }

@keyframes funeral-bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
}

@media (prefers-reduced-motion: reduce) {
    .funeral-ball { animation: none; }
}

.hero-footer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 40px;
    background: var(--ink);
    color: var(--mustard);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px;
    font-family: var(--font-display);
    font-size: 13px;
}

/* Share Buttons */
#share-buttons {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    padding: 14px 18px 0;
    background: var(--cream);
}

#share-buttons button {
    min-height: 50px;
    border: 3px solid var(--ink);
    background: var(--paper);
    font-family: var(--font-body);
    font-weight: 800;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
}

#share-buttons button svg {
    width: 18px;
    height: 18px;
}

#share-buttons button:focus {
    outline: 3px solid var(--red);
    outline-offset: 2px;
}
```

**Commit**: "CSS: Style hero card and share buttons"

---

## Task 5: Tombstone Input Styling
**Estimated Time**: 1 hour

**Update form section in `css/main.css`:**

```css
/* Input Section */
#input-section {
    padding: 32px 18px 0;
}

#input-section h2 {
    font-size: 26px;
    margin-bottom: 12px;
}

#input-section > p {
    font-size: 17px;
    line-height: 1.4;
    margin-bottom: 12px;
}

/* Tombstone Inputs */
.white-balls-inputs {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 6px;
    align-items: end;
    margin-bottom: 0;
}

.white-balls-inputs input {
    min-width: 0;
    border: 3px solid var(--ink);
    border-bottom: 0;
    border-radius: var(--radius-tombstone);
    background: var(--paper);
    font-family: var(--font-display);
    font-size: 20px;
    text-align: center;
    padding: 6px 0 0;
}

.white-balls-inputs > div:nth-child(1) input { height: 74px; }
.white-balls-inputs > div:nth-child(2) input { height: 84px; }
.white-balls-inputs > div:nth-child(3) input { height: 78px; }
.white-balls-inputs > div:nth-child(4) input { height: 88px; }
.white-balls-inputs > div:nth-child(5) input { height: 76px; }

.powerball-input input {
    height: 92px;
    border: 3px solid var(--ink);
    border-bottom: 0;
    border-radius: var(--radius-crypt);
    background: var(--red);
    color: var(--paper);
    font-family: var(--font-display);
    font-size: 20px;
    text-align: center;
    padding: 6px 0 0;
    width: 100%;
}

/* Container for all 6 inputs with ground line */
.manual-input-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.form-group:has(.white-balls-inputs),
.form-group.powerball-input {
    margin-bottom: 0;
}

.manual-input-form > .form-group:first-of-type {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 6px;
    align-items: end;
    border-bottom: 4px solid var(--ink);
    padding-bottom: 0;
}

/* Move powerball into grid */
.manual-input-form > .form-group:first-of-type .white-balls-inputs {
    grid-column: 1 / 6;
    display: contents;
}

.manual-input-form > .form-group.powerball-input {
    grid-column: 6;
}

/* Focus states */
input[type="number"]:focus {
    outline: 3px solid var(--red);
    outline-offset: 2px;
    z-index: 1;
}

.powerball-input input:focus {
    outline-color: var(--paper);
}

/* Hint text below tombstones */
.form-group + p {
    font-size: 14px;
    font-weight: 700;
    margin: 8px 0 0;
}
```

**Note**: The HTML structure needs minor adjustment to get all 6 inputs in one grid. This may require wrapping changes in `index.html`.

**Commit**: "CSS: Style tombstone inputs with ground line"

---

## Task 6: Buttons & Submit CTA
**Estimated Time**: 45 minutes

```css
/* Mode Toggle */
.input-mode-toggle {
    display: flex;
    border: 3px solid var(--ink);
    margin-bottom: 12px;
}

.input-mode-toggle button {
    flex: 1;
    padding: 12px;
    border: none;
    background: var(--paper);
    color: var(--ink);
    font-family: var(--font-body);
    font-weight: 800;
    font-size: 16px;
    cursor: pointer;
}

.input-mode-toggle button.active {
    background: var(--ink);
    color: var(--mustard);
}

.input-mode-toggle button:focus {
    outline: 3px solid var(--red);
    outline-offset: -3px;
    z-index: 1;
}

/* Submit Button */
#submit-numbers-btn {
    width: 100%;
    min-height: 58px;
    border: 3px solid var(--ink);
    background: var(--ink);
    color: var(--mustard);
    font-family: var(--font-display);
    font-size: 18px;
    cursor: pointer;
    box-shadow: var(--shadow-cta);
    transition: all 0.1s ease-out;
}

#submit-numbers-btn:hover {
    box-shadow: 6px 6px 0 var(--red);
}

#submit-numbers-btn:active {
    box-shadow: 1px 1px 0 var(--red);
    transform: translate(4px, 4px);
}

#submit-numbers-btn:focus {
    outline: 3px solid var(--red);
    outline-offset: 2px;
}

/* Error messages */
.error-message {
    color: var(--red);
    font-weight: 700;
    font-size: 14px;
    display: block;
    margin-top: 4px;
}
```

**Update button text** in HTML to "START THE PROCESSION"

**Commit**: "CSS: Style mode toggle and submit button with shadow"

---

## Task 7: Results Tombstone & All Sections
**Estimated Time**: 1.5 hours

```css
/* Tombstone Results */
#tombstone-container {
    background: var(--paper);
    border: 3px solid var(--ink);
    border-radius: var(--radius-tombstone);
    box-shadow: var(--shadow-card);
    padding: 30px 20px;
    max-width: 400px;
    margin: 0 auto;
}

.tombstone-numbers {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.tombstone-numbers .number {
    width: 44px;
    height: 44px;
    border: 3px solid var(--ink);
    border-radius: 50%;
    background: var(--paper);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: 16px;
}

.tombstone-numbers .number.powerball {
    background: var(--red);
    color: var(--paper);
}

.tombstone-epitaph {
    font-style: italic;
    font-size: 15px;
    line-height: 1.6;
    color: var(--ink);
}

/* Tarot Sections */
.section h2 {
    font-size: 22px;
    margin-bottom: 16px;
}

.prompt-container,
.question-container,
#card-display-container,
#fortune-container {
    background: var(--paper);
    border: 3px solid var(--ink);
    box-shadow: var(--shadow-card);
    padding: 24px;
}

/* Tarot Cards */
.tarot-card-container {
    display: inline-block;
    background: var(--paper);
    border: 3px solid var(--ink);
    box-shadow: var(--shadow-card);
    padding: 12px;
    margin: 8px;
}

.tarot-card-container:nth-child(1) { transform: rotate(-2deg); }
.tarot-card-container:nth-child(2) { transform: rotate(0deg); }
.tarot-card-container:nth-child(3) { transform: rotate(2deg); }

.tarot-card img {
    display: block;
    width: 100%;
    max-width: 200px;
    height: auto;
}

.tarot-card-name {
    margin-top: 10px;
    font-family: var(--font-display);
    font-size: 13px;
    text-align: center;
}

.tarot-card-position {
    font-size: 11px;
    text-transform: uppercase;
    text-align: center;
    color: var(--ink);
    opacity: 0.6;
}

/* Fortune Text */
.fortune-text {
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 20px;
}

/* Buttons in sections */
.btn-primary,
.btn-secondary {
    padding: 14px 24px;
    border: 3px solid var(--ink);
    font-family: var(--font-body);
    font-weight: 800;
    font-size: 16px;
    cursor: pointer;
    min-height: 44px;
}

.btn-primary {
    background: var(--ink);
    color: var(--mustard);
    box-shadow: var(--shadow-cta);
}

.btn-secondary {
    background: var(--paper);
    color: var(--ink);
}

.btn-primary:focus,
.btn-secondary:focus {
    outline: 3px solid var(--red);
    outline-offset: 2px;
}
```

**Commit**: "CSS: Style tombstone results and tarot sections"

---

## Task 8: Footer & Utility Classes
**Estimated Time**: 30 minutes

```css
/* Footer */
footer {
    border-top: 4px solid var(--ink);
    background: var(--cream);
    padding: 26px 18px 30px;
    font-size: 14px;
    line-height: 1.45;
}

footer nav {
    display: flex;
    gap: 18px;
    margin-bottom: 10px;
}

footer a {
    color: var(--ink);
    text-decoration: underline;
}

footer a:hover {
    color: var(--red);
}

/* Hidden utility */
.hidden {
    display: none !important;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

.text-center {
    text-align: center;
}

/* Loading overlay */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 246, 220, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.loading-spinner {
    border: 4px solid var(--ink);
    border-top-color: var(--mustard);
    border-radius: 50%;
    width: 48px;
    height: 48px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
```

**Add helpline text to footer HTML:**
```html
<p>For entertainment only. If playing stops being fun, call 1-800-522-4700.</p>
```

**Commit**: "CSS: Style footer and utility classes"

---

## Task 9: Desktop Responsive Layout
**Estimated Time**: 1 hour

```css
/* Desktop Layout (≥ 960px) */
@media (min-width: 960px) {
    #hero-card {
        max-width: 480px;
        aspect-ratio: 4 / 5;
    }
    
    /* Two-column layout for hero + form */
    body {
        display: block;
    }
    
    .hero-layout-wrapper {
        display: grid;
        grid-template-columns: 480px 1fr;
        gap: 60px;
        max-width: 1120px;
        margin: 0 auto;
        align-items: center;
        padding: 40px 20px;
    }
    
    #share-buttons {
        margin-top: 20px;
    }
    
    /* Below-fold content */
    main {
        max-width: 760px;
    }
    
    /* Tarot cards in a row */
    #card-display-container {
        display: flex;
        justify-content: center;
        gap: 16px;
    }
    
    .tarot-card-container {
        margin: 0;
    }
    
    /* Hover states */
    @media (hover: hover) {
        button:hover {
            box-shadow: 6px 6px 0 var(--red);
        }
        
        .tarot-card-container:hover {
            box-shadow: 6px 6px 0 var(--ink);
        }
    }
}
```

**Note**: May need HTML wrapper div `.hero-layout-wrapper` around hero + input section

**Commit**: "CSS: Add desktop two-column responsive layout"

---

## Task 10: JavaScript for Share Buttons
**Estimated Time**: 30 minutes

**Add to end of `js/app.js` or create new `js/share.js`:**

```javascript
// Share functionality
document.getElementById('share-btn')?.addEventListener('click', async () => {
    const shareData = {
        title: 'RIP my numbers · Lotto Graveyard',
        text: 'They died as they lived: not matching.',
        url: window.location.href
    };
    
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard.writeText(window.location.href);
            showToast('Link copied');
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Share failed:', err);
        }
    }
});

document.getElementById('copy-link-btn')?.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link copied');
    } catch (err) {
        console.error('Copy failed:', err);
    }
});

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'share-toast';
    toast.textContent = message;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
```

**Add toast CSS:**
```css
.share-toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--paper);
    border: 3px solid var(--ink);
    padding: 12px 20px;
    font-weight: 700;
    box-shadow: var(--shadow-card);
    animation: toast-in 0.3s, toast-out 0.3s 2.7s;
    z-index: 1001;
}

@keyframes toast-in {
    from { opacity: 0; transform: translate(-50%, 20px); }
    to { opacity: 1; transform: translate(-50%, 0); }
}

@keyframes toast-out {
    from { opacity: 1; }
    to { opacity: 0; }
}
```

**Commit**: "JS: Add Web Share API and toast notifications"

---

## Task 11: Social Meta Tags
**Estimated Time**: 20 minutes

**Add to `<head>` in `index.html`:**

```html
<!-- Open Graph -->
<meta property="og:title" content="RIP my numbers · Lotto Graveyard">
<meta property="og:description" content="They died as they lived: not matching. Give your lottery tickets the send-off they deserve.">
<meta property="og:image" content="https://kvarnik.github.io/lotto-graveyard/assets/social/og-1200x630.png">
<meta property="og:url" content="https://kvarnik.github.io/lotto-graveyard/">
<meta property="og:type" content="website">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="RIP my numbers · Lotto Graveyard">
<meta name="twitter:description" content="They died as they lived: not matching.">
<meta name="twitter:image" content="https://kvarnik.github.io/lotto-graveyard/assets/social/card-1080x1350.png">

<!-- Update existing description -->
<meta name="description" content="They died as they lived: not matching. Give your lottery tickets the send-off they deserve with historical analysis and tarot readings.">
```

Create placeholder images or leave for later.

**Commit**: "Meta: Add Open Graph and Twitter Card tags"

---

## Task 12: QA & Testing
**Estimated Time**: 2 hours

**Manual Testing Checklist:**
- [ ] Load page - fonts load, no console errors
- [ ] Hero card is 4:5 aspect ratio
- [ ] Procession animation works (and stops with prefers-reduced-motion)
- [ ] Share buttons: Web Share (mobile) or clipboard copy
- [ ] Toast appears on copy
- [ ] Type in tombstone inputs - focus visible
- [ ] Submit form - validation errors show
- [ ] Mode toggle works
- [ ] Full flow: input → tombstone → tarot → fortune
- [ ] Responsive: 320px, 390px, 768px, 1280px
- [ ] Desktop two-column layout
- [ ] All sections styled correctly
- [ ] Skip link works
- [ ] Keyboard navigation (tab through all)
- [ ] Screen reader test (VoiceOver/NVDA)

**Run any existing tests:**
```bash
npm test
```

**Lighthouse audit:**
- Performance ≥ 90
- Accessibility ≥ 95
- Best Practices ≥ 90

**Contrast check:** Use WebAIM tool for mustard/ink, white/red combinations

**Commit**: "QA: Manual testing complete, all flows work"

---

## Task 13: PR Preparation
**Estimated Time**: 1 hour

1. **Screenshots**: Before (main branch) and after (redesign branch) at 390px and 1280px
2. **Document changes:**
   - HTML: Hero section, share buttons, procession SVG, meta tags
   - CSS: Complete reskin, new variables, all component styles
   - JS: Share functionality, toast
3. **Write PR description** (see requirements doc for template)
4. **Push branch and open PR**

```bash
git push -u origin redesign/funeral-march
```

Then create PR on GitHub with screenshots and documentation.

**Do NOT merge to main yet** - wait for review.

---

## Summary

**Total Time Estimate**: 10-12 hours

**Commits**: ~13 small, focused commits

**What Changed**:
- ✅ CSS: Complete visual reskin
- ✅ HTML: Hero section, share buttons, procession SVG, meta tags
- ✅ JS: Share button handlers, toast notification
- ❌ No changes to: validation, analysis, tarot logic, data loading, existing functionality

**What Stayed The Same**:
- All element IDs and classes used by JavaScript
- All sections and flow
- All functionality
- All accessibility attributes
- Skip link
- Real Rider-Waite tarot images
