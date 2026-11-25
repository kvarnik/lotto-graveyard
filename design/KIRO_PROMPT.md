# Reskin Lotto Graveyard as "The Funeral March"

## Context
Repo: https://github.com/kvarnik/lotto-graveyard (live at https://kvarnik.github.io/lotto-graveyard/).
It's a vanilla HTML/CSS/JS static site: `index.html`, one stylesheet `css/main.css` (grayscale "1909 Rider-Waite" theme, CSS variables in `:root`), and modules in `js/` (`app.js`, `input.js`, `webcam-scanner.js`, `validation.js`, `analysis.js`, `tombstone.js`, `tarot.js`, `fortune-client.js`, ...). `.github/workflows/deploy.yml` deploys to GitHub Pages on every push to `main`. Existing specs live in `.kiro/specs/`.

## Goal
Give the whole site the look and feel of the "Funeral March" concept, a loud, funny, shareable style, **without changing how the app works**. The top of the homepage must also work as a 4:5 social card that people screenshot and share.

The design reference is `design/funeral-march-reference.html` (I'll add it to the repo). It is a mockup from a design tool: ignore the `<x-dc>`, `<helmet>`, `support.js` and `data-props` wrappers, and copy only the visuals: markup, inline styles, SVG and copy.

## How to work
1. Create a new spec in `.kiro/specs/funeral-march-redesign/` (requirements, design, tasks) based on this prompt. Read the existing specs and `js/` first so the design respects them. Show me the task list before you implement.
2. Work on a branch `redesign/funeral-march`. **Don't push to `main`.** It auto-deploys. Open a PR instead.
3. Keep commits small: tokens and base, hero/share card, entry form, results/tombstone, tarot and fortune, footer and meta, desktop layout, QA.

## Hard constraints (don't break the app)
- Keep every `id` in `index.html` and every class the JS creates or toggles. That includes at least: `.hidden`, `.active`, `.error-message`, `.btn-primary`, `.btn-secondary`, `.tombstone`, `.tombstone-header`, `.tombstone-numbers`, `.tombstone-epitaph`, `.prompt-container`, `.prompt-numbers`, `.prompt-actions`, `.question-form`, `.form-group`, `.character-count`, `.tarot-card-container`, `.tarot-card`, `.tarot-card-name`, `.tarot-card-position`, `.fortune-text`, `.fortune-actions`, `.loading-overlay`, `.loading-spinner`, `.error-notification`, `.scanned-numbers-confirmation`, `.white-balls`, `.powerball`, `.confirmation-buttons`. Grep `js/` to confirm the full list before restyling.
- Prefer CSS-only changes. Change HTML only to add wrappers or decoration (the share card, the SVG procession, share buttons), never to rename or remove what the JS needs. If a JS template must change for the look (for example `tombstone.js` markup), keep its data and behaviour the same and update its tests.
- Don't touch `lambda/`, `scripts/`, `data/`, the workflows, `config.js`, or the validation, analysis and fortune logic.
- Keep the WCAG 2.1 AA work: skip link, labels, `aria-*`, live regions, focus styles (make them more visible, not less), 44px touch targets, 4.5:1 text contrast.
- Keep the real Rider-Waite tarot images in `assets/tarot/` and the footer's public-domain attribution.

## Design tokens (replace the grayscale variables)
- Colours:
  - `--mustard: #F2C230` (hero and share-card background)
  - `--ink: #1B1A17` (text, 3px borders, primary buttons)
  - `--cream: #FFF6DC` (page background)
  - `--paper: #FFFFFF` (stones, cards, inputs)
  - `--red: #C8402F` (Powerball, CTA shadow, accents)
- Fonts, loaded from Google Fonts with `preconnect` and `display=swap`:
  - Display: **Bungee**, fallback Impact/Arial Black. Use it for the wordmark, headings, numbers and button labels.
  - Body: **Bricolage Grotesque** 500/700/800, fallback system-ui.
- Shape language:
  - **Borders and corners:** 3px solid ink borders everywhere. Corners are square, except tombstone tops (26px radius) and balls (50%).
  - **Shadows:** hard offset only, never blurred (`5px 5px 0 var(--red)` on the main CTA, `4px 4px 0 var(--ink)` on cards).
  - **No gradients.**

## Page structure (mobile first, 390px wide)
1. **Hero = share card.** A mustard panel with a 4:5 aspect ratio (`aspect-ratio: 4/5`), full width on mobile, separated from the page by a 4px ink bottom border. Inside it, top to bottom:
   - **Header row:** "LOTTO GRAVEYARD" wordmark (Bungee, 16px) and a 44px square menu button with a 3px border. Keep the existing H1 for accessibility, but present it like this.
   - **Headline:** "RIP MY NUMBERS" in Bungee, about 54px, line-height 0.92, on two lines.
   - **Subline:** "They died as they lived: not matching." 19px, weight 700.
   - **Procession:** the inline SVG from the reference, near the bottom. Five white numbered balls with legs and top hats carry a brown ticket-coffin marked "RIP", and a red Powerball waves a small black flag, all on a thick ground line. Give it `role="img"` and a descriptive `aria-label`.
   - **Footer strip:** 40px black, with the site URL on the left and "BURY YOURS →" on the right, both mustard Bungee 13px.
   - **Optional motion:** a gentle 2-frame bob on the balls (CSS keyframes), disabled under `prefers-reduced-motion`.
2. **Share row** directly under the card: two equal buttons, "Share the grief" (Web Share API with a copy-link fallback) and "Copy link". White, 3px ink border, 50px tall.
3. **"JOIN THE MARCH"**: the existing manual-entry form (`#manual-input-form`), restyled.
   - **Number inputs as tombstones:** the five white-ball inputs and the Powerball input sit as six tombstones in one row on a 4px ink "ground" line (`display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; align-items: end`). Bungee 20px, centred.
   - **White balls:** white stones of slightly different heights (74, 84, 78, 88, 76px), with a 3px border, no bottom border and `border-radius: 26px 26px 0 0`.
   - **Powerball:** a red crypt with square shoulders (`border-radius: 4px 4px 0 0`), 92px tall, white text.
   - Keep visible labels (short ones are fine, like "1" to "5" and "PB"), or keep the current labels visually hidden. Under the row add the hint "Five stones 1–69 · red crypt is the Powerball 1–26". Error messages appear under the row in red, 700 weight.
   - **Mode toggle** (`#manual-mode-btn` / `#webcam-mode-btn`): a two-segment chunky toggle. The active segment is ink with mustard text.
   - **Submit** (`#submit-numbers-btn`): full width, 58px, ink background, mustard Bungee 18px text "START THE PROCESSION", red hard shadow. Pressed state: shadow collapses to 1px and the button moves 4px down and right.
   - **Webcam scanner:** same frame language. The video sits in a 3px-bordered box, and its buttons use the secondary style.
4. **"Your Numbers' Fate"** (`#tombstone-section`, rendered by `tombstone.js`): one big white tombstone with a 3px border, rounded top, the drawn numbers as small balls (Powerball red) and the epitaph in Bricolage italic. It gets a "Share this tombstone" button.
5. **Tarot flow** (prompt → question → cards → fortune):
   - **Panels:** cream with 3px borders and an ink hard shadow, headings in Bungee.
   - **Tarot cards:** the real images in a white mat with a 3px ink frame, slight alternating rotation (-2°, 0°, 2°), name and position under each in Bungee 13px.
   - **Fortune:** a white "card" with a "Share my fortune" button.
6. **"What you get"**: a short paragraph section. Leave its copy close to the reference.
7. **Footer:** 4px ink top border. Keep the About and Privacy links and the Rider-Waite attribution, and add: "For entertainment only. If playing stops being fun, call [HELPLINE NUMBER]." I'll supply the number.

## Desktop (≥ 960px)
- **Two columns, max-width 1120px, centred:** the share card on the left (max 480px wide, still 4:5), and "JOIN THE MARCH" on the right, vertically centred.
- **Below the fold:** results, tarot and footer in a single 760px column. The three tarot cards sit in a row.
- **Hover states:** the shadow grows by 2px on hover.

## Social sharing
- Add Open Graph and Twitter meta: `og:title` "RIP my numbers · Lotto Graveyard", a funny one-line `og:description`, `og:image` and `twitter:card=summary_large_image`.
- Create two static images from the hero design in `assets/social/`: `og-1200x630.png` (link previews) and `card-1080x1350.png` (4:5 posts). A small Node script in `scripts/` that renders the hero SVG to PNG is fine. Don't add it to the runtime bundle.
- The share buttons use `navigator.share({ title, text, url })` where available, and otherwise copy the URL and show a small "Link copied" toast with `aria-live="polite"`.

## Tone and content rules
- The jokes are about the odds and the numbers, never mocking the player. Never encourage buying more tickets.
- No real lottery logos or brand styling. "Powerball" stays as a plain field label only.
- Don't invent statistics. Use placeholders where real data isn't wired up.

## QA before opening the PR
- Run the existing tests (`*.test.js`, the test HTML pages, anything in `package.json` scripts) and fix only what the reskin broke.
- Test the full flow manually: manual entry → validation errors → tombstone → tarot prompt → question → 3 cards → fortune; the webcam path including "Switch to manual entry"; the keyboard-only path; widths 320px, 390px, 768px and 1280px.
- Check contrast (ink on mustard, mustard on ink, white on red), and that there are no console errors.
- Check Lighthouse: accessibility ≥ 95, and performance no worse than the current site.
- In the PR description, include before/after screenshots at 390px and 1280px, and list any HTML or JS template changes with the reason for each.
