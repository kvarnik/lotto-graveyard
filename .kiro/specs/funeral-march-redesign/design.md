# Funeral March Redesign - Design Document

## Design Philosophy

The Funeral March design transforms the Lotto Graveyard from a solemn, mystical experience into a loud, shareable, darkly humorous memorial for lost lottery tickets. The design language draws from:

- **Funeral programs**: Bold headlines, procession imagery, memorial cards
- **Social media aesthetics**: Designed to be screenshotted and shared
- **Contemporary web brutalism**: Hard shadows, thick borders, no gradients
- **Playful typography**: Display fonts that command attention

The result is irreverent but never mean-spirited—the joke is about the impossible odds, not the dreamer.

## Visual System

### Color Strategy

**Mustard `#F2C230`**
- Role: Hero accent, attention-grabber, warmth
- Usage: Hero background, wordmark, CTA text, active states
- Psychology: Bold, optimistic (ironically), eye-catching
- Pairs with: Ink for maximum contrast

**Ink `#1B1A17`**
- Role: Primary text, structure, authority
- Usage: All text, all borders (3px), primary buttons
- Psychology: Final, permanent, printed
- Pairs with: Everything (high contrast)

**Cream `#FFF6DC`**
- Role: Page canvas, breathing room
- Usage: Body background, section backgrounds
- Psychology: Warm neutral, paper-like
- Pairs with: Ink text, paper panels

**Paper `#FFFFFF`**
- Role: Content surfaces, clean slates
- Usage: Tombstones, cards, inputs, fortune panels
- Psychology: Pure, blank, ready to be filled
- Pairs with: Ink borders, shadows

**Red `#C8402F`**
- Role: Powerball accent, urgent actions, punch
- Usage: Powerball input, CTA shadows, accents
- Psychology: Energy, urgency, the special number
- Pairs with: White text, ink borders

### Typography System

**Bungee** (Display)
- **Purpose**: Headlines, numbers, buttons—anything that needs to SHOUT
- **Character**: Bold, blocky, impossible to ignore
- **Usage**:
  - Wordmark: 16px
  - Main headline: 54px
  - Section headings: 22-26px
  - Button labels: 16-18px
  - Input numbers: 20px
  - Tarot card labels: 13px
- **Fallback stack**: `Bungee, Impact, 'Arial Black', sans-serif`

**Bricolage Grotesque** (Body)
- **Purpose**: Readable body text with personality
- **Weights**:
  - 500: Body copy, descriptions
  - 700: Emphasis, hints, labels
  - 800: Button text, strong emphasis
- **Usage**:
  - Body text: 15-17px
  - Labels: 14px
  - Buttons: 16px weight 800
  - Hints: 14px weight 700
- **Fallback stack**: `'Bricolage Grotesque', system-ui, sans-serif`

**Loading Strategy**:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bungee&family=Bricolage+Grotesque:wght@500;700;800&display=swap" rel="stylesheet">
```

### Shape Language

**Borders**:
- Weight: 3px solid everywhere
- Color: Always ink `#1B1A17`
- Purpose: Define, separate, make things feel printed and permanent

**Corners**:
- Default: 0 (square) for that printed, paper-cut feel
- Tombstones: `26px 26px 0 0` (rounded tops only)
- Balls: `50%` (perfect circles)
- Slight curves on crypts: `4px 4px 0 0`

**Shadows** (Hard Only):
- Primary CTA: `5px 5px 0 var(--red)` (dramatic, urgent)
- Cards/panels: `4px 4px 0 var(--ink)` (lifted off page)
- NO blur, NO spread—pure offset for that graphic novel feel
- Desktop hover: Grow by 2px (`6px 6px` or `6px 6px`)

**No Gradients**:
- Flat colors only
- Reinforces the printed, screen-printed aesthetic

## Component Design

### 1. Hero / Share Card

**Goal**: This is THE shareable moment. Users see it, laugh, screenshot it, post it.

**Composition**:
```
┌─────────────────────────────────────┐
│ LOTTO GRAVEYARD            [≡ MENU] │  ← Header row
│                                     │
│ RIP MY                              │  ← Headline (Bungee 54px)
│ NUMBERS                             │
│                                     │
│ They died as they lived:            │  ← Subline (Bricolage 700)
│ not matching.                       │
│                                     │
│         [SVG: Funeral procession]   │  ← Animated SVG
│                                     │
│ [SITE URL]        BURY YOURS →     │  ← Black footer strip
└─────────────────────────────────────┘
```

**Aspect Ratio**: 4:5 (Instagram/social optimal)
- Mobile: Full width
- Desktop: Max 480px wide

**Visual Details**:
- Background: Solid mustard
- Headline: Breaks across 2 lines, tight leading (0.92)
- Subline: Below headline, 19px
- SVG: Positioned absolute, 18px from sides, 44px from bottom
- Footer strip: 40px tall, solid black, mustard text

**SVG Procession**:
- Five white numbered balls (07, 14, 22, 31, 38) with top hats and legs
- Carrying a brown ticket-coffin marked "RIP"
- Red Powerball (09) waving a black flag
- All standing on a thick ground line
- Simple bob animation (2 frames, gentle)

**Animation**:
```css
@keyframes funeral-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.funeral-ball {
  animation: funeral-bob 2s ease-in-out infinite;
}

.funeral-ball:nth-child(2) { animation-delay: 0.1s; }
.funeral-ball:nth-child(3) { animation-delay: 0.2s; }
/* etc */

@media (prefers-reduced-motion: reduce) {
  .funeral-ball { animation: none; }
}
```

### 2. Share Buttons

**Layout**: Two equal columns, 10px gap
**Height**: 50px
**Style**: 
- White background
- 3px ink border
- Bricolage 800, 16px
- Share icon SVG (node with connecting lines) in first button

**Interaction**:
1. "Share the grief": Triggers `navigator.share()` or copy fallback
2. "Copy link": Clipboard API + toast notification

**Toast**:
```css
.share-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--paper);
  border: 3px solid var(--ink);
  padding: 12px 20px;
  font: 700 14px 'Bricolage Grotesque';
  box-shadow: 4px 4px 0 var(--ink);
  animation: toast-in 0.3s, toast-out 0.3s 2.7s;
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

### 3. Tombstone Inputs

**Concept**: Enter your numbers AS tombstones in a row

**Layout**:
```
┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐
│07│ │14│ │22│ │31│ │38│ │09│
└──┘ └──┘ └──┘ └──┘ └──┘ └──┘
══════════════════════════════  ← Ground line (4px border)
```

**Grid**:
```css
.tombstone-inputs {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 6px;
  align-items: end;
  border-bottom: 4px solid var(--ink);
  padding-bottom: 0;
}
```

**White Ball Stones** (5):
```css
.white-ball-input {
  height: var(--stone-height); /* 74, 84, 78, 88, 76px */
  border: 3px solid var(--ink);
  border-bottom: 0;
  border-radius: 26px 26px 0 0;
  background: var(--paper);
  font: 20px Bungee;
  text-align: center;
  padding: 6px 0 0;
  min-width: 0; /* Allow shrinking in grid */
}

.white-ball-input:nth-child(1) { --stone-height: 74px; }
.white-ball-input:nth-child(2) { --stone-height: 84px; }
.white-ball-input:nth-child(3) { --stone-height: 78px; }
.white-ball-input:nth-child(4) { --stone-height: 88px; }
.white-ball-input:nth-child(5) { --stone-height: 76px; }
```

**Powerball Crypt**:
```css
.powerball-input {
  height: 92px;
  border: 3px solid var(--ink);
  border-bottom: 0;
  border-radius: 4px 4px 0 0; /* Sharper, crypt-like */
  background: var(--red);
  color: var(--paper);
  font: 20px Bungee;
  text-align: center;
  padding: 6px 0 0;
  min-width: 0;
}
```

**Focus State**:
```css
.tombstone-input:focus {
  outline: 3px solid var(--red);
  outline-offset: 2px;
  z-index: 1;
}
```

### 4. Primary CTA

**"START THE PROCESSION"** button

**Style**:
```css
.btn-start-procession {
  width: 100%;
  min-height: 58px;
  border: 3px solid var(--ink);
  background: var(--ink);
  color: var(--mustard);
  font: 18px Bungee;
  text-align: center;
  cursor: pointer;
  box-shadow: 5px 5px 0 var(--red);
  transition: all 0.1s ease-out;
}

.btn-start-procession:hover {
  box-shadow: 6px 6px 0 var(--red);
}

.btn-start-procession:active {
  box-shadow: 1px 1px 0 var(--red);
  transform: translate(4px, 4px);
}

.btn-start-procession:focus {
  outline: 3px solid var(--red);
  outline-offset: 2px;
}
```

**Motion**:
- Hover: Shadow grows 1px
- Active: Shadow collapses to 1px, button moves 4px down-right
- Gives satisfying "press" feel

### 5. Result Tombstone

**Updated from grayscale to Funeral March style**

**Structure**:
```css
.tombstone-result {
  background: var(--paper);
  border: 3px solid var(--ink);
  border-radius: 26px 26px 0 0;
  box-shadow: 4px 4px 0 var(--ink);
  padding: 30px 20px;
  margin: 40px auto;
  max-width: 400px;
}
```

**Numbers Display**:
- Small circular balls (white + red Powerball)
- Bungee font for numbers
- Arranged horizontally

```css
.tombstone-numbers {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.number-ball {
  width: 44px;
  height: 44px;
  border: 3px solid var(--ink);
  border-radius: 50%;
  background: var(--paper);
  display: flex;
  align-items: center;
  justify-content: center;
  font: 16px Bungee;
}

.number-ball.powerball {
  background: var(--red);
  color: var(--paper);
}
```

**Epitaph**:
```css
.tombstone-epitaph {
  font: italic 15px 'Bricolage Grotesque';
  line-height: 1.6;
  color: var(--ink);
}
```

### 6. Tarot Cards

**Preserve**: Real Rider-Waite images in `assets/tarot/`

**Frame**:
```css
.tarot-card-container {
  display: inline-block;
  background: var(--paper);
  border: 3px solid var(--ink);
  box-shadow: 4px 4px 0 var(--ink);
  padding: 12px;
}

.tarot-card-container:nth-child(1) { transform: rotate(-2deg); }
.tarot-card-container:nth-child(2) { transform: rotate(0deg); }
.tarot-card-container:nth-child(3) { transform: rotate(2deg); }

.tarot-card img {
  display: block;
  width: 100%;
  height: auto;
}

.tarot-card-name {
  margin-top: 10px;
  font: 13px Bungee;
  text-align: center;
}

.tarot-card-position {
  margin-top: 4px;
  font: 11px 'Bricolage Grotesque';
  text-transform: uppercase;
  text-align: center;
  color: #666;
}
```

### 7. Fortune Panel

**Style**:
```css
.fortune-panel {
  background: var(--paper);
  border: 3px solid var(--ink);
  box-shadow: 4px 4px 0 var(--ink);
  padding: 30px 24px;
  margin: 30px auto;
  max-width: 600px;
}

.fortune-heading {
  font: 22px Bungee;
  margin-bottom: 16px;
}

.fortune-text {
  font: 500 16px 'Bricolage Grotesque';
  line-height: 1.6;
  margin-bottom: 24px;
}
```

## Responsive Strategy

### Mobile First (320px - 767px)

**Hero**:
- Full width
- `aspect-ratio: 4/5`
- SVG scales proportionally

**Tombstone Inputs**:
- 6-column grid
- Minimum column width: ~40px (fits on 320px)
- Font size: 20px (might scale down to 18px on 320px)

**Tarot Cards**:
- Stack vertically
- Full width (minus padding)
- Rotation still applied

### Tablet (768px - 959px)

- Single column layout
- Max width: 760px, centered
- Hero: Caps at viewport width
- Everything else: Full width within max-width

### Desktop (≥ 960px)

**Two-column hero**:
```css
.hero-layout {
  display: grid;
  grid-template-columns: 480px 1fr;
  gap: 60px;
  max-width: 1120px;
  margin: 0 auto;
  align-items: center;
}

.hero-card {
  width: 480px;
  aspect-ratio: 4/5;
}

.hero-form {
  /* Vertically centered by align-items: center */
}
```

**Below fold**:
- Single column, 760px max width, centered
- Tarot cards: Horizontal row of 3

**Hover effects**:
```css
@media (hover: hover) {
  .btn:hover { box-shadow: 6px 6px 0 var(--red); }
  .card:hover { box-shadow: 6px 6px 0 var(--ink); }
}
```

## Accessibility Implementation

### Contrast Ratios

**Verification Required**:
1. Ink (#1B1A17) on mustard (#F2C230): **Check with tool**
2. Mustard (#F2C230) on ink (#1B1A17): **Check with tool**
3. White (#FFFFFF) on red (#C8402F): **Check with tool**
4. Ink on cream: 15.8:1 ✓
5. Ink on white: 19.2:1 ✓

**If fails**: Darken mustard or lighten red until 4.5:1 achieved

### Focus Styles

**Enhanced visibility**:
```css
*:focus {
  outline: 3px solid var(--red);
  outline-offset: 2px;
}

/* Make sure it works on red backgrounds too */
.powerball-input:focus {
  outline-color: var(--paper);
}
```

### Touch Targets

**All interactive elements: 44px minimum**

Already met:
- Menu button: 44×44px
- Share buttons: 50px tall ✓
- Tombstone inputs: 74-92px tall ✓
- CTA: 58px tall ✓

### Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Reader Experience

**Hero SVG**:
```html
<svg role="img" aria-label="Five lottery balls in top hats march in a funeral procession, carrying a ticket-shaped coffin marked RIP. A red Powerball waves a tiny black flag behind them.">
```

**Share buttons**:
```html
<button aria-label="Share this page on social media or copy link">
  <svg aria-hidden="true"><!-- icon --></svg>
  Share the grief
</button>
```

**Loading/status announcements**:
```html
<div role="status" aria-live="polite" class="sr-only">
  Generating fortune...
</div>
```

## Implementation Notes

### CSS Architecture

**Variables**:
```css
:root {
  /* Colors */
  --mustard: #F2C230;
  --ink: #1B1A17;
  --cream: #FFF6DC;
  --paper: #FFFFFF;
  --red: #C8402F;
  
  /* Typography */
  --font-display: Bungee, Impact, 'Arial Black', sans-serif;
  --font-body: 'Bricolage Grotesque', system-ui, sans-serif;
  
  /* Borders */
  --border: 3px solid var(--ink);
  
  /* Shadows */
  --shadow-cta: 5px 5px 0 var(--red);
  --shadow-card: 4px 4px 0 var(--ink);
  
  /* Tombstone radii */
  --radius-tombstone: 26px 26px 0 0;
  --radius-crypt: 4px 4px 0 0;
}
```

**Selectors**: Use existing classes where possible, add new only when needed

**Cascading**: Override existing grayscale theme completely

### JavaScript Preservation

**DO NOT CHANGE**:
- Element IDs: `#manual-input-form`, `#submit-numbers-btn`, etc.
- Class toggles: `.hidden`, `.active`, etc.
- Data flow and event handlers

**CAN ADD**:
- Share button event listeners
- Toast notification creation
- Animation controls
- Responsive layout adjustments (if needed)

### HTML Additions

**Share card section**: New wrapper div
**Share buttons row**: New section with 2 buttons
**Procession SVG**: Inline in hero
**Social meta tags**: In `<head>`
**Wrapper divs**: For layout only, no semantic changes

### Performance

**Font Loading**:
- Preconnect to Google Fonts
- `display=swap` to prevent FOIT
- Subset if possible (Latin only)

**SVG**: Inline in HTML (not external file) for instant render

**Images**: Social cards generated offline, not at runtime

**CSS**: Single file, minified for production

### Browser Support

**Target**: Last 2 versions of major browsers + iOS Safari 14+

**Fallbacks**:
- CSS Grid: Supported everywhere we care about
- `aspect-ratio`: Fallback with padding-bottom hack
- Web Share API: Clipboard fallback
- CSS variables: Broadly supported

```css
.hero-card {
  aspect-ratio: 4 / 5;
}

/* Fallback for older browsers */
@supports not (aspect-ratio: 4 / 5) {
  .hero-card {
    padding-bottom: 125%; /* 5/4 * 100% */
  }
}
```

## Testing Strategy

### Visual Regression

**Viewports to test**:
- 320px (small mobile)
- 390px (reference mobile)
- 768px (tablet)
- 1280px (desktop)

**States to capture**:
- Initial load
- Tombstone inputs focused
- Result tombstone displayed
- Tarot cards shown
- Error messages
- Loading overlay

### Functional Testing

**Checklist**:
- [ ] Manual entry → validation → tombstone
- [ ] Webcam scan → confirmation → tombstone
- [ ] Mode toggle: manual ↔ webcam
- [ ] Validation errors display correctly
- [ ] Tarot prompt → question → cards → fortune
- [ ] Share button (Web Share + clipboard fallback)
- [ ] Copy link toast appears and disappears
- [ ] Keyboard navigation (tab through all interactions)
- [ ] Focus indicators visible on all backgrounds
- [ ] Screen reader: Meaningful labels, ARIA live regions

### Performance Testing

**Lighthouse scores** (target):
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 90
- SEO: ≥ 90

**Core Web Vitals**:
- LCP: < 2.5s (hero should paint fast)
- FID: < 100ms
- CLS: < 0.1 (font loading with display=swap should not cause major shift)

### Contrast Testing

Use WebAIM Contrast Checker or browser DevTools:
- Mustard/ink combinations
- White/red combinations
- All text/background pairs

Adjust colors if needed to meet 4.5:1 for normal text, 3:1 for large text.

## Deployment Plan

**Branch**: `redesign/funeral-march`

**Commit strategy** (small commits):
1. Setup: Fonts, CSS variables, base tokens
2. Hero: Share card structure and styling
3. Share: Share buttons + Web Share API + toast
4. Inputs: Tombstone-styled number inputs
5. Tombstone: Result display restyling
6. Tarot: Card frames and fortune panel
7. Desktop: Two-column layout, responsive adjustments
8. Meta: Social tags, OG images
9. QA: Tests, fixes, polish

**PR Review Checklist**:
- [ ] Screenshots (before/after)
- [ ] Video demo of key interactions
- [ ] Test results (pass/fail)
- [ ] Lighthouse scores
- [ ] Contrast ratios verified
- [ ] No console errors
- [ ] HTML/JS changes documented
- [ ] Accessibility audit complete

**Don't push to `main`**: Auto-deploys to production. Use PR workflow.
