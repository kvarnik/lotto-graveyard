# Funeral March Redesign Requirements

## Overview

Reskin the Lotto Graveyard from its current grayscale "1909 Rider-Waite" theme to a bold, loud, shareable "Funeral March" aesthetic. This is a visual redesign that **must not break any existing functionality**. The design prioritizes social shareability, with the hero section serving as a 4:5 social media card.

## Design Goals

1. **Laudability**: Bold, memorable visual style that stands out in social feeds
2. **Shareability**: The top section works as a standalone social card people want to screenshot and post
3. **Codeable**: Clean implementation using modern CSS without frameworks
4. **Functional Preservation**: All existing features continue to work identically

## Visual Design System

### Color Palette

- **Mustard** `#F2C230`: Hero background, wordmark, primary accents
- **Ink** `#1B1A17`: Text, borders (3px solid), primary buttons
- **Cream** `#FFF6DC`: Page background
- **Paper** `#FFFFFF`: Tombstones, cards, input fields
- **Red** `#C8402F`: Powerball, CTA shadows, accents

### Typography

**Display Font: Bungee**
- Use for: Wordmark, headings, numbers, button labels
- Fallback: `Impact, 'Arial Black', sans-serif`
- Load from: Google Fonts with `preconnect` and `display=swap`

**Body Font: Bricolage Grotesque**
- Weights: 500, 700, 800
- Use for: Body text, descriptions, labels
- Fallback: `system-ui, sans-serif`
- Load from: Google Fonts with `preconnect` and `display=swap`

### Shape Language

- **Borders**: 3px solid ink borders everywhere
- **Corners**: Square by default, except:
  - Tombstone tops: 26px radius
  - Number balls: 50% (perfect circles)
- **Shadows**: Hard offset only (no blur)
  - Primary CTA: `5px 5px 0 var(--red)`
  - Cards: `4px 4px 0 var(--ink)`
- **No gradients**: Flat colors only

### Motion

- **Funeral procession bob**: Gentle 2-frame animation on SVG balls
- **Disabled**: Automatically via `prefers-reduced-motion`
- **Button press**: Shadow collapses, button moves 4px down-right

## Page Structure

### 1. Hero / Share Card Section

**Purpose**: First screen, designed as a 4:5 social media card

**Dimensions**: 
- Mobile (390px): Full width, `aspect-ratio: 4/5`
- Desktop: Max 480px wide, maintains 4:5 ratio

**Layout** (top to bottom):
1. Header row (flex, space-between)
   - Wordmark: "LOTTO GRAVEYARD" (Bungee 16px)
   - Menu button: 44×44px, 3px border, hamburger icon
2. Headline: "RIP MY NUMBERS" (Bungee 54px, line-height 0.92)
3. Subline: "They died as they lived: not matching." (Bricolage 19px, weight 700)
4. Procession SVG: Five numbered balls in top hats carrying coffin-ticket, red Powerball with flag
5. Footer strip: 40px black bar with site URL (left) and "BURY YOURS →" (right)

**Visual Details**:
- Background: Mustard `#F2C230`
- Border bottom: 4px solid ink
- SVG positioned absolute, bottom 44px
- `role="img"` with descriptive `aria-label` on SVG

### 2. Share Buttons Row

Two equal-width buttons below share card:
- "Share the grief" (Web Share API + fallback)
- "Copy link" (clipboard API)
- Height: 50px
- Border: 3px solid ink
- Background: white paper
- Font: Bricolage 800, 16px
- Share icon SVG in first button

### 3. Number Input Section

**Title**: "JOIN THE MARCH" (Bungee 26px)

**Description**: Body text explaining to enter 5 numbers + Powerball

**Tombstone Inputs**: Six input fields styled as tombstones
- Layout: `display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px`
- Align to bottom: `align-items: end`
- Ground line: 4px solid ink border-bottom on container

**White Ball Inputs** (5):
- Varied heights: 74px, 84px, 78px, 88px, 76px
- Border: 3px solid ink, **no bottom border**
- Border radius: `26px 26px 0 0` (tombstone shape)
- Background: white paper
- Font: Bungee 20px, centered
- Padding: `6px 0 0` (top padding only)

**Powerball Input**:
- Height: 92px (tallest)
- Border radius: `4px 4px 0 0` (square crypt shape)
- Background: red `#C8402F`
- Color: white text
- Border: 3px solid ink, no bottom

**Hint Text**: "Five stones 1–69 · red crypt is the Powerball 1–26"
- Font: Bricolage 700, 14px
- Below tombstone row

**Mode Toggle**: Manual / Webcam switcher
- Two-segment toggle, active segment: ink background + mustard text
- Font: Bricolage 800

**Submit Button**: "START THE PROCESSION"
- Full width, 58px tall
- Background: ink `#1B1A17`
- Color: mustard `#F2C230`
- Font: Bungee 18px
- Shadow: `5px 5px 0 var(--red)`
- Pressed: shadow → `1px 1px 0 var(--red)`, button moves 4px

### 4. Tombstone Section

**Styling Updates**:
- White paper background
- 3px ink border
- Rounded top: 26px radius (matches input tombstones)
- Hard shadow: `4px 4px 0 var(--ink)`
- Numbers displayed as small balls (white + red Powerball)
- Epitaph in Bricolage italic
- Share button below

### 5. Tarot Flow

**Prompt, Question, Cards, Fortune**:
- Cream background panels
- 3px ink borders
- Ink hard shadows `4px 4px 0 var(--ink)`
- Headings: Bungee
- Body: Bricolage

**Tarot Cards**:
- Real Rider-Waite images preserved
- White paper mat, 3px ink frame
- Slight rotation: -2°, 0°, 2° (alternating)
- Card name + position: Bungee 13px below each

**Fortune Panel**:
- White paper "card"
- Share button: "Share my fortune"

### 6. What You Get Section

Short paragraph section with Bungee heading, Bricolage body. Cream background.

### 7. Footer

- 4px ink top border
- Cream background
- Keep existing: About, Privacy links, Rider-Waite attribution
- Add: "For entertainment only. If playing stops being fun, call [HELPLINE NUMBER]."

## Desktop Layout (≥ 960px)

**Two-column layout**:
- Max width: 1120px, centered
- **Left column**: Share card (max 480px, maintains 4:5)
- **Right column**: "JOIN THE MARCH" section, vertically centered

**Below fold**:
- Single column, 760px max width
- Tombstone, tarot, footer stack vertically
- Three tarot cards in a row (instead of stacked)

**Hover states**:
- Shadows grow by 2px on interactive elements

## Social Sharing

### Open Graph / Twitter Meta Tags

```html
<meta property="og:title" content="RIP my numbers · Lotto Graveyard">
<meta property="og:description" content="[Funny one-line about lost lottery tickets]">
<meta property="og:image" content="https://[domain]/assets/social/og-1200x630.png">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://[domain]/assets/social/card-1080x1350.png">
```

### Static Social Images

Generate two PNG images from hero design:
1. `assets/social/og-1200x630.png` (link preview format)
2. `assets/social/card-1080x1350.png` (4:5 Instagram format)

**Script**: Node.js script in `scripts/generate-social-cards.js` that:
- Renders the hero SVG to PNG using a headless rendering library
- Not included in runtime bundle
- Run manually or in build step

### Web Share API

```javascript
if (navigator.share) {
  await navigator.share({
    title: 'RIP my numbers',
    text: 'They died as they lived: not matching.',
    url: window.location.href
  })
} else {
  // Fallback: copy to clipboard
  await navigator.clipboard.writeText(window.location.href)
  showToast('Link copied')
}
```

**Toast notification**:
- Small white panel, bottom center
- "Link copied" message
- Fades in/out
- `aria-live="polite"`

## Implementation Constraints

### Must Preserve (DO NOT BREAK)

1. **All element IDs** in `index.html` that JavaScript references
2. **All CSS classes** that JavaScript creates or toggles:
   - `.hidden`, `.active`, `.error-message`
   - `.btn-primary`, `.btn-secondary`
   - `.tombstone`, `.tombstone-header`, `.tombstone-numbers`, `.tombstone-epitaph`
   - `.prompt-container`, `.prompt-numbers`, `.prompt-actions`
   - `.question-form`, `.form-group`, `.character-count`
   - `.tarot-card-container`, `.tarot-card`, `.tarot-card-name`, `.tarot-card-position`
   - `.fortune-text`, `.fortune-actions`
   - `.loading-overlay`, `.loading-spinner`
   - `.error-notification`
   - `.scanned-numbers-confirmation`, `.white-balls`, `.powerball`, `.confirmation-buttons`
3. **WCAG 2.1 AA compliance**:
   - Skip link
   - Labels, `aria-*` attributes
   - Live regions
   - Focus styles (make MORE visible, not less)
   - 44px touch targets
   - 4.5:1 text contrast
4. **Real Rider-Waite tarot images** in `assets/tarot/`
5. **Public domain attribution** in footer
6. **All JavaScript logic**: validation, analysis, tarot, fortune, OCR
7. **Lambda function**, data pipeline, workflows

### CSS-Only Changes Preferred

- Change HTML only to add:
  - Wrapper divs for layout
  - Decorative SVG elements (procession, icons)
  - Share buttons
  - Social meta tags
- **Never** rename or remove IDs/classes that JavaScript uses

### JS Template Updates

If `tombstone.js` or other modules generate HTML that needs visual changes:
- Keep all data attributes
- Keep all classes
- Preserve behavior
- Update tests if template changed

## Accessibility Requirements

### Contrast Ratios

Must meet WCAG 2.1 AA (4.5:1 for normal text):
- **Ink on mustard**: Check and adjust if needed
- **Mustard on ink**: Check and adjust if needed  
- **White on red**: Check and adjust if needed
- **Ink on cream**: Should pass
- **Ink on white**: Should pass

### Focus Indicators

Make focus styles **more visible**, not less:
- 3px solid red outline
- 2px offset
- High contrast against all backgrounds

```css
input:focus,
button:focus {
  outline: 3px solid var(--red);
  outline-offset: 2px;
}
```

### Touch Targets

All interactive elements: **44px minimum** in both dimensions

### Screen Readers

- Preserve all existing `aria-*` attributes
- Add `role="img"` and descriptive `aria-label` to procession SVG
- Ensure share buttons have accessible labels
- Toast uses `aria-live="polite"`

### Motion

```css
@media (prefers-reduced-motion: reduce) {
  .procession-animation {
    animation: none;
  }
}
```

## Tone and Content

### Copy Rules

1. **Jokes about odds/numbers**, never mock the player
2. **Never encourage buying more tickets**
3. **No real lottery logos** or brand styling
4. **"Powerball"** as plain text field label only
5. **Placeholders where real data not wired**: Use `[HELPLINE NUMBER]`, `[SITE URL]`

### Headline/Subline Examples

✅ Good:
- "RIP MY NUMBERS" / "They died as they lived: not matching."
- "THE FUNERAL MARCH" / "Every ticket gets the send-off it deserves."

❌ Bad:
- "YOU LOST LOL" / "Better luck next time, sucker."
- "BUY MORE TICKETS" / "Maybe next time you'll win!"

## Quality Assurance

### Before Opening PR

1. **Run existing tests**: All `*.test.js` files must pass
2. **Manual testing**:
   - Full flow: manual entry → validation → tombstone → tarot → fortune
   - Webcam path + switch to manual
   - Keyboard-only navigation
   - Widths: 320px, 390px, 768px, 1280px
3. **Contrast check**: Ink on mustard, mustard on ink, white on red
4. **Console**: No errors
5. **Lighthouse**:
   - Accessibility ≥ 95
   - Performance: no worse than current

### PR Requirements

**Screenshots**: Before/after at 390px and 1280px

**List changes**:
- Every HTML change with reason
- Every JS template change with reason
- CSS file changes summary

**Testing notes**:
- Which tests were updated and why
- Manual test results
- Contrast ratios verified
- Lighthouse scores

## Success Criteria

✅ **Visual transformation complete**: Matches Funeral March reference design

✅ **Functionality preserved**: All features work identically to before

✅ **Accessible**: WCAG 2.1 AA maintained or improved

✅ **Shareable**: Hero section works as standalone 4:5 social card

✅ **Tests pass**: No regressions in existing test suite

✅ **Performance**: Lighthouse scores maintained
