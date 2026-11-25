# Lotto Graveyard - Prototype Version

## Changes for Prototype Release

This is a **reduced functionality prototype** that removes the AI fortune generation capability.

### What's Included:
✅ Manual lottery number entry (5 white balls + 1 Powerball)
✅ Webcam ticket scanning with OCR
✅ Historical analysis against 1,497 Powerball drawings (Jan 2015 - present)
✅ Mystical tombstone display with epitaph
✅ Frequency analysis (past year)
✅ **Deterministic 3-card tarot reading based on lottery numbers**
✅ Card interpretations (Past, Present, Future)

### What's Removed:
❌ AI-powered fortune generation
❌ AWS Lambda integration
❌ AWS Bedrock/Claude API
❌ Question collection interface
❌ Personalized fortune text

### Technical Changes:
- Using `js/app-simplified.js` instead of `js/app.js`
- Removed `js/fortune-client.js` dependency
- No backend/Lambda required - fully client-side
- Tarot cards are shown with basic interpretations
- Simple "Start Over" functionality

### Running the Prototype:

```bash
# Start local server
python3 -m http.server 8080

# Open in browser
open http://localhost:8080/
```

### Deployment:
This prototype can be deployed to:
- GitHub Pages (free, no backend needed)
- Any static hosting (Netlify, Vercel, S3, etc.)

No AWS Lambda or Bedrock configuration required!

### To Restore Full Version:
1. Replace `index.html` with `index-full.html.backup`
2. Update `js/config.js` with Lambda URL
3. Deploy Lambda function from `lambda/fortune-generator/`

