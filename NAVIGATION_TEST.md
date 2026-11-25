# Navigation Testing Checklist

## Test on localhost:8080

### Homepage (index.html)
- [ ] Menu button (☰) in top-right corner visible
- [ ] Clicking menu button opens navigation overlay
- [ ] Navigation menu shows:
  - Enter Numbers
  - About
  - Privacy
- [ ] Close button (×) works in menu
- [ ] Clicking overlay background closes menu
- [ ] Escape key closes menu
- [ ] "BURY YOURS →" link scrolls to #main-content
- [ ] Footer links work:
  - About → about.html
  - Privacy → privacy.html

### About Page (about.html)
- [ ] Page loads correctly
- [ ] "Back to Lotto Graveyard" link returns to index.html
- [ ] Content is editable (marked with <!-- EDIT THIS -->)

### Privacy Page (privacy.html)
- [ ] Page loads correctly
- [ ] "Back to Lotto Graveyard" link returns to index.html
- [ ] Content is editable (marked with <!-- EDIT THIS SECTION -->)

### Mobile Responsive
- [ ] Menu works on mobile viewport (< 768px)
- [ ] Menu slides in from right
- [ ] Overlay covers entire screen
- [ ] Touch interactions work

## Expected Behavior

1. **Menu Open**: 
   - Overlay appears with slide-in animation
   - Body scroll locked
   - Focus moves to close button

2. **Menu Close**: 
   - Menu slides out
   - Body scroll restored
   - Focus returns to menu button

3. **Navigation Links**:
   - "Enter Numbers" (#main-content) closes menu and scrolls
   - "About" and "Privacy" navigate to respective pages
   - Footer links navigate to respective pages

4. **Accessibility**:
   - Keyboard navigation works
   - ARIA labels present
   - Focus management correct
   - Screen reader friendly
