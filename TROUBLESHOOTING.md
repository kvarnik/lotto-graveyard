# Troubleshooting Guide - Lotto Graveyard

## Recent Fixes Applied

### 1. Missing Scripts (Fixed)
- ✅ Added `js/fortune-client.js` to index.html
- ✅ Added `js/share.js` for share button functionality
- ✅ Added loading overlay HTML element

### 2. Path Issues (Fixed)
- ✅ Changed `DATA_FILE_PATH` from `/data/historical-data.json` to `data/historical-data.json`
- ✅ Changed `TAROT_IMAGES_PATH` from `/assets/tarot` to `assets/tarot`
- These paths are now relative to work correctly on GitHub Pages

### 3. CSS Variables (Fixed)
- ✅ Updated loading overlay to use correct CSS variables
- ✅ Changed undefined `--color-*` variables to defined `--mustard`, `--ink`, `--paper`, `--cream`

## Diagnostic Tools

### Check What's Working
Visit: https://kvarnik.github.io/lotto-graveyard/diagnostics.html

This page will show you:
- ✓/✗ Which external libraries loaded (Tesseract, seedrandom)
- ✓/✗ Which core modules loaded (CONFIG, validation, etc.)
- ✓/✗ Which classes are defined
- ✓/✗ Whether historical data can be loaded
- Configuration values being used

### Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Look for red error messages
4. Common errors and what they mean:

| Error | Meaning | Fix |
|-------|---------|-----|
| `Uncaught ReferenceError: X is not defined` | Script didn't load or loaded in wrong order | Check script tags order in HTML |
| `Failed to fetch` | Network request failed | Check file path is correct |
| `404 Not Found` | File doesn't exist | Verify file exists in repository |
| `Unexpected token` | JavaScript syntax error | Check for syntax errors in JS file |

## Common Issues

### Issue: Page shows only hero card, no form
**Symptoms**: Only the hero section displays, rest of page is blank
**Cause**: JavaScript error preventing app initialization
**Check**: 
1. Browser console for errors
2. Diagnostics page at /diagnostics.html
3. Verify all scripts in index.html are loading

### Issue: Form displays but doesn't submit
**Symptoms**: Can see form, but clicking "Start the Procession" does nothing
**Causes**:
- Validation module not loaded
- InputModule not initialized
- Event listener not attached
**Check**:
```javascript
// In browser console:
typeof validateLotteryNumbers === 'function'  // Should be true
typeof InputModule === 'function'  // Should be true
```

### Issue: "Data load error" message
**Symptoms**: Error about historical data
**Causes**:
- data/historical-data.json not found
- JSON file is malformed
- Network timeout
**Check**:
1. Visit https://kvarnik.github.io/lotto-graveyard/data/historical-data.json directly
2. Should show JSON data, not 404
3. Check browser console for network errors (Network tab)

### Issue: Share buttons don't work
**Symptoms**: Clicking share/copy link buttons does nothing
**Cause**: share.js not loaded or navigator.clipboard not available
**Check**:
```javascript
// In browser console:
typeof navigator.clipboard !== 'undefined'  // Should be true
typeof navigator.share !== 'undefined'  // May be false (not all browsers)
```

## Script Load Order

The scripts MUST load in this order (as defined in index.html):

1. External libraries (Tesseract, seedrandom)
2. navigation.js
3. share.js
4. config.js ← Must load before anything that uses CONFIG
5. validation.js
6. input.js
7. webcam-scanner.js
8. data-loader.js
9. analysis.js
10. tombstone.js
11. tarot-deck.js
12. tarot.js
13. fortune-client.js
14. app-simplified.js ← Must load LAST

## GitHub Pages Deployment

### Check Deployment Status
1. Go to repository settings
2. Click "Pages" in sidebar
3. Check deployment status
4. Click "View deployment" to see live site

### Force Refresh
GitHub Pages caches aggressively:
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Try incognito/private window
- Wait 2-3 minutes after pushing changes

### Verify Files Deployed
Check key files are accessible:
- https://kvarnik.github.io/lotto-graveyard/
- https://kvarnik.github.io/lotto-graveyard/js/config.js
- https://kvarnik.github.io/lotto-graveyard/js/app-simplified.js
- https://kvarnik.github.io/lotto-graveyard/data/historical-data.json
- https://kvarnik.github.io/lotto-graveyard/diagnostics.html

## Still Having Issues?

1. **Check the diagnostics page first**: /diagnostics.html
2. **Look at browser console**: Press F12 → Console tab
3. **Check Network tab**: Press F12 → Network tab → Reload page
   - Look for red/failed requests
   - Check if files are 404ing
4. **Verify file paths**: All paths should be relative (no leading /)
5. **Clear cache**: Hard refresh (Ctrl+Shift+R)

## Developer Tools

### Test Individual Module
```javascript
// In browser console after page loads:

// Test validation
validateLotteryNumbers([1,2,3,4,5], 10)

// Test data loader
const loader = new DataLoader();
loader.loadHistoricalData().then(data => console.log(data))

// Test analysis
const analysis = new HistoricalAnalysis();
await analysis.loadData();
analysis.analyze({whiteBalls: [1,2,3,4,5], powerball: 10})
```

### Check Module Status
```javascript
// In browser console:
console.log({
  CONFIG: typeof CONFIG !== 'undefined',
  validateLotteryNumbers: typeof validateLotteryNumbers === 'function',
  InputModule: typeof InputModule === 'function',
  DataLoader: typeof DataLoader === 'function',
  HistoricalAnalysis: typeof HistoricalAnalysis === 'function',
  TombstoneRenderer: typeof TombstoneRenderer === 'function',
  TarotModule: typeof TarotModule === 'function',
  FortuneClient: typeof FortuneClient === 'function'
});
```

## Contact

If you're still experiencing issues after trying these steps, please provide:
1. Screenshot of browser console errors
2. Screenshot of diagnostics page results
3. Browser name and version
4. Device type (desktop/mobile)
