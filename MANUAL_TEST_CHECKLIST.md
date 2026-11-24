# Manual Test Checklist for Task 13.3

## Prerequisites

1. Start local server:
   ```bash
   npm run serve
   ```

2. Open browser and navigate to:
   ```
   http://localhost:8000
   ```

3. Open browser developer console (F12) to monitor for errors

## Test 1: Happy Path - Manual Input to Tarot Reading

### Steps:
1. ✅ Enter 5 unique white ball numbers (1-69)
   - Example: 5, 12, 23, 45, 67
2. ✅ Enter 1 powerball number (1-26)
   - Example: 13
3. ✅ Click "Analyze Numbers"
4. ✅ Wait for analysis to complete
5. ✅ Verify tombstone is displayed with:
   - Your lottery numbers prominently shown
   - Win status (never won or exact match date)
   - Closest match statistics
   - Date range analyzed
   - Frequency statistics for past year
6. ✅ Verify tarot prompt appears below tombstone with:
   - Message: "Your numbers have been laid to rest..."
   - Your lottery numbers displayed in prompt
   - "Accept Reading" button
   - "Decline" button
7. ✅ Click "Accept Reading"
8. ✅ Verify question input form appears with:
   - Label: "What question would you like the cards to illuminate?"
   - Textarea with 200 character limit
   - Character count display (0 / 200 characters)
   - "Reveal My Cards" button
9. ✅ Type a question (e.g., "Will I find happiness?")
10. ✅ Verify character count updates as you type
11. ✅ Click "Reveal My Cards"
12. ✅ Verify loading indicator shows "Selecting your cards..."
13. ✅ Verify loading changes to "Generating your fortune..."
14. ✅ Verify error appears (Lambda URL is placeholder):
    - Error message displayed
    - "Try Again" button visible
    - "Start Over" button visible
15. ✅ Click "Try Again"
16. ✅ Verify retry attempts (should retry 3 times with delays)
17. ✅ Click "Start Over"
18. ✅ Verify app resets to input screen

### Expected Results:
- ✅ All sections transition smoothly
- ✅ No JavaScript errors in console
- ✅ Tarot prompt appears after tombstone
- ✅ Question form validates properly
- ✅ Error handling works (expected due to placeholder Lambda URL)
- ✅ Retry logic executes with exponential backoff
- ✅ "Start Over" resets the entire app

---

## Test 2: Decline Path

### Steps:
1. ✅ Enter lottery numbers (same as Test 1 steps 1-2)
2. ✅ Click "Analyze Numbers"
3. ✅ Wait for tombstone to display
4. ✅ Verify tarot prompt appears
5. ✅ Click "Decline"
6. ✅ Verify tombstone disappears
7. ✅ Verify tarot prompt disappears
8. ✅ Verify input section reappears
9. ✅ Verify input fields are reset/empty

### Expected Results:
- ✅ Decline immediately returns to input screen
- ✅ User can enter new numbers
- ✅ No JavaScript errors

---

## Test 3: Question Validation

### Steps:
1. ✅ Complete Test 1 steps 1-7 to reach question form
2. ✅ Click "Reveal My Cards" without entering text
3. ✅ Verify error message: "A question is required"
4. ✅ Verify textarea marked as invalid (aria-invalid="true")
5. ✅ Type only whitespace (spaces, tabs)
6. ✅ Click "Reveal My Cards"
7. ✅ Verify error message: "A question is required"
8. ✅ Type more than 200 characters
9. ✅ Verify character count shows limit (should stop at 200)
10. ✅ Type a valid question (1-200 characters)
11. ✅ Verify error message clears
12. ✅ Verify submission proceeds

### Expected Results:
- ✅ Empty question rejected
- ✅ Whitespace-only question rejected
- ✅ Character limit enforced
- ✅ Valid questions accepted
- ✅ Error messages clear when fixed

---

## Test 4: Deterministic Card Selection

### Steps:
1. ✅ Enter lottery numbers: 5, 12, 23, 45, 67, PB: 13
2. ✅ Click "Analyze Numbers"
3. ✅ Accept tarot reading
4. ✅ Enter question: "Will I find happiness?"
5. ✅ Submit question
6. ✅ Note which cards are selected (view in console or error message)
7. ✅ Click "Start Over"
8. ✅ Repeat steps 1-5 with SAME numbers and SAME question
9. ✅ Verify SAME cards are selected

### Expected Results:
- ✅ Same lottery numbers + same question = identical cards
- ✅ Card order is consistent
- ✅ Positions remain: past, present, future

---

## Test 5: Console Verification

### Check Browser Console for:

✅ **Info Messages:**
```
Initializing Lotto Graveyard...
Loading historical lottery data...
Loaded X drawings (last updated: ...)
Numbers validated: {...}
Analysis complete: {...}
Displaying tombstone...
Showing tarot prompt...
Question submitted: "..."
Cards selected: [...]
```

✅ **Error Messages (Expected):**
```
Failed to generate fortune: [error message]
```

✅ **No Unexpected Errors:**
- No syntax errors
- No undefined variable errors
- No null reference errors
- No missing function errors

---

## Test 6: State Management

### Verify State Transitions:

1. ✅ Start: state = 'INPUT'
2. ✅ After number validation: state = 'ANALYSIS'
3. ✅ After analysis: state = 'TOMBSTONE'
4. ✅ After tombstone: state = 'TAROT_PROMPT'
5. ✅ After question submit: state = 'QUESTION'
6. ✅ After cards selected: state remains during generation
7. ✅ After error: appropriate error handling
8. ✅ After reset: state = 'INPUT'

### Check State in Console:
```javascript
// In browser console:
// Find the app instance and check state
// (You may need to store it globally for debugging)
```

---

## Test 7: Accessibility

### Keyboard Navigation:
1. ✅ Tab through all form fields
2. ✅ Verify focus indicators visible
3. ✅ Verify logical tab order
4. ✅ Press Enter on "Accept Reading" button
5. ✅ Press Enter on "Decline" button
6. ✅ Press Enter on "Reveal My Cards" button

### Screen Reader Testing (Optional):
1. ✅ Enable screen reader (VoiceOver, NVDA, JAWS)
2. ✅ Verify ARIA labels read correctly
3. ✅ Verify role="alert" announces errors
4. ✅ Verify role="status" announces loading states

---

## Test 8: Responsive Design

### Desktop (>= 768px):
1. ✅ Verify tombstone displayed in vertical layout
2. ✅ Verify minimum 400px width
3. ✅ Verify all text readable
4. ✅ Verify buttons properly sized

### Mobile (< 768px):
1. ✅ Resize browser to mobile width
2. ✅ Verify single-column layout
3. ✅ Verify tombstone fits viewport width - 32px
4. ✅ Verify all text remains readable (min 14pt)
5. ✅ Verify touch targets >= 44px

---

## Test 9: Error Recovery

### Test Retry Logic:
1. ✅ Reach fortune generation step
2. ✅ Verify automatic retries occur (observe delays)
3. ✅ Count retry attempts (should be 3 total)
4. ✅ Verify exponential backoff delays:
   - 1st retry after ~1 second
   - 2nd retry after ~2 seconds
   - 3rd retry after ~4 seconds
5. ✅ After 3 failures, verify error UI appears
6. ✅ Click "Try Again" - manual retry
7. ✅ Verify retry executes with same cards/question
8. ✅ Click "Start Over" - full reset
9. ✅ Verify clean state

---

## Success Criteria

### Must Pass:
- ✅ No JavaScript syntax errors
- ✅ No runtime errors in console (except expected Lambda failures)
- ✅ All state transitions work correctly
- ✅ Tarot prompt appears after tombstone
- ✅ Accept/decline buttons work
- ✅ Question validation works
- ✅ Card selection is deterministic
- ✅ Error handling displays appropriate messages
- ✅ Retry logic executes correctly
- ✅ "Start Over" resets app completely

### Nice to Have:
- ✅ Smooth animations/transitions
- ✅ Good performance (no lag)
- ✅ Responsive design works on all sizes
- ✅ Accessibility features work

---

## Known Expected Failures

### Fortune Generation Will Fail:
**Reason:** Lambda URL is placeholder
**Expected Behavior:** 
- Error message after 3 retries
- "Try Again" and "Start Over" buttons appear
- No crash or undefined errors

**When This Will Work:**
- After Lambda deployment (Task 15.1)
- After updating `js/config.js` with real Lambda URL

---

## Debugging Tips

### If Something Doesn't Work:

1. **Check Browser Console** - Look for specific error messages
2. **Check Network Tab** - Verify fortune request is made
3. **Check Elements Tab** - Verify section visibility classes
4. **Check Application Tab** - Verify localStorage has historical data
5. **Clear Cache** - Sometimes old code gets cached
6. **Hard Refresh** - Ctrl+Shift+R or Cmd+Shift+R

### Common Issues:

**Issue:** Tombstone doesn't appear
- **Fix:** Check historical data loaded (console message)
- **Fix:** Verify `analysis.loadData()` succeeded

**Issue:** Tarot prompt doesn't appear
- **Fix:** Verify `currentLotteryNumbers` is set
- **Fix:** Check console for errors in `showTarotPrompt()`

**Issue:** Question form doesn't appear
- **Fix:** Verify "Accept Reading" button click event fires
- **Fix:** Check `handleAccept()` in tarot.js

**Issue:** Cards don't get selected
- **Fix:** Verify seedrandom library loaded (check Network tab)
- **Fix:** Verify `TAROT_DECK` is defined in tarot-deck.js

---

## Next Steps After Testing

1. ✅ Confirm all tests pass (except expected Lambda failure)
2. ✅ Document any unexpected issues
3. ✅ Proceed to Task 13.4 (State Management)
4. ✅ Deploy Lambda (Task 15.1)
5. ✅ Retest with real Lambda URL
6. ✅ Implement automated tests (Task 13.5)

---

## Test Completion Checklist

- [ ] Test 1: Happy Path - PASSED
- [ ] Test 2: Decline Path - PASSED
- [ ] Test 3: Question Validation - PASSED
- [ ] Test 4: Deterministic Card Selection - PASSED
- [ ] Test 5: Console Verification - PASSED
- [ ] Test 6: State Management - PASSED
- [ ] Test 7: Accessibility - PASSED (at least keyboard nav)
- [ ] Test 8: Responsive Design - PASSED
- [ ] Test 9: Error Recovery - PASSED

**Overall Status:** _______________

**Tester:** _______________

**Date:** _______________

**Notes:** _______________________________________________
