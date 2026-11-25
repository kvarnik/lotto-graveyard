# Lotto Graveyard - Quick Reference

## 🚀 Running the Application

```bash
cd /Users/kvarnik/Documents/dev/lotto-graveyard
python3 -m http.server 8080
```

Visit: **http://localhost:8080**

## 📁 File Structure

```
lotto-graveyard/
├── index.html              # Main application page
├── about.html              # About page (editable)
├── privacy.html            # Privacy policy page (editable)
├── css/
│   └── main.css           # All styles including navigation
├── js/
│   ├── navigation.js      # Menu open/close logic
│   ├── app-simplified.js  # Main app without AI fortunes
│   ├── input.js           # Manual number input
│   ├── webcam-scanner.js  # Ticket scanning (OCR)
│   ├── analysis.js        # Historical data analysis
│   ├── tombstone.js       # Epitaph generation
│   ├── tarot.js           # Tarot card selection
│   └── ...               # Other modules
├── data/
│   └── historical-data.json  # Powerball draws since 2015
└── assets/
    └── tarot/             # 78 tarot card images
```

## 🧭 Navigation System

### Menu Structure
- **Hamburger Icon (☰)** - Top-right corner of homepage
- **Menu Items:**
  - Enter Numbers → Scrolls to #main-content
  - About → Goes to about.html
  - Privacy → Goes to privacy.html

### User Interactions
- Click hamburger → Menu slides in from right
- Click X or overlay → Menu closes
- Press Escape → Menu closes
- Click "BURY YOURS →" → Scrolls to form

## ✏️ Editing Content

### About Page
1. Open `about.html` in any text editor
2. Find sections marked with `<!-- EDIT THIS -->`
3. Edit text between markers
4. Save and refresh browser

### Privacy Page
1. Open `privacy.html` in any text editor
2. Find sections marked with `<!-- EDIT THIS SECTION -->`
3. Edit text between markers
4. Save and refresh browser

No build process needed - changes are immediate!

## 🎯 Key Features

### Current Prototype
✅ Manual number input (5 white + 1 powerball)
✅ Webcam ticket scanning with OCR
✅ Historical analysis against 1,497 draws (2015-2024)
✅ Frequency analysis (hot/cold numbers)
✅ Tombstone epitaph generation
✅ Deterministic tarot card selection
✅ Card interpretation display
✅ Responsive design (mobile + desktop)
✅ About and Privacy pages

### Removed from Full Version
❌ AI-powered fortune generation (AWS Lambda + Bedrock)
❌ Backend infrastructure
❌ Fortune text generation

## 🧪 Testing Checklist

```
☐ Homepage loads at localhost:8080
☐ Menu button opens/closes
☐ All menu links work
☐ "BURY YOURS" scrolls to form
☐ Footer links navigate correctly
☐ About page loads with back link
☐ Privacy page loads with back link
☐ Enter numbers manually (validation works)
☐ Scan ticket with webcam (if camera available)
☐ View tombstone and historical analysis
☐ View tarot cards and interpretations
☐ Test on mobile (resize browser < 768px)
☐ Test keyboard navigation (Tab, Escape)
```

## 🎨 Design Tokens

```css
--ink: #1a1a1a           /* Dark text */
--paper: #f5f1e8         /* Cream background */
--red: #e63946           /* Powerball red */
--gold: #ffd700          /* Accent gold */
--stone: #95989a         /* Tombstone gray */
```

## 📦 Dependencies

### CDN Libraries
- **Tesseract.js v5** - OCR for ticket scanning
- **seedrandom v3** - Deterministic RNG for tarot
- **Google Fonts** - Bungee + Bricolage Grotesque

### No Build Tools Required
- Pure HTML/CSS/JavaScript
- No npm, webpack, or bundlers
- No server-side processing
- Static file hosting compatible

## 🚢 Deployment Options

### GitHub Pages
```bash
git add .
git commit -m "Add navigation pages"
git push origin main
# Enable GitHub Pages in repo settings
```

### Netlify
1. Drag and drop `lotto-graveyard` folder
2. Site goes live immediately

### AWS S3
```bash
aws s3 sync . s3://your-bucket-name --exclude "*.md" --exclude ".git/*"
```

## 🔒 Privacy & Legal

- No user data collected
- No cookies used
- No analytics tracking (yet)
- Client-side only processing
- Powerball data from NYC Open Data (public domain)
- Tarot images from 1909 Rider-Waite deck (public domain)

## 📝 Notes

- Historical data covers Jan 2015 - present
- Data updates via manual fetch script (not automated yet)
- Prototype version for demonstration
- Full version requires AWS infrastructure for AI fortunes

## 🆘 Troubleshooting

**Menu not opening?**
- Check browser console for JavaScript errors
- Verify navigation.js is loading
- Clear browser cache

**Pages not loading?**
- Verify server is running on port 8080
- Check file paths are correct
- Ensure files have read permissions

**OCR not working?**
- Camera permissions required
- Tesseract.js needs good lighting
- Fallback to manual entry available

## 📚 Documentation

- `NAVIGATION_IMPLEMENTATION.md` - Detailed implementation notes
- `NAVIGATION_TEST.md` - Testing checklist
- `PROTOTYPE_NOTES.md` - Simplified prototype changes
- `README.md` - Original project documentation
