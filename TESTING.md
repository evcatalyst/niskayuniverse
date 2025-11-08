# Testing Guide for Niskayuna Water Quality Atlas

## What Was Fixed

### Issue
The JavaScript modules for the form and map functionality were not being properly bundled by Astro, causing:
- Address autocomplete not working
- Form submissions failing
- No JavaScript functionality on the deployed site

### Solution
Changed the script tag in `src/pages/index.astro` from `type="module"` to a regular script tag, which allows Astro to properly bundle the JavaScript modules into the `dist/_astro/` folder.

## Testing Checklist

### 1. Address Autocomplete
- [ ] Open the deployed site: https://evcatalyst.github.io/niskayuniverse/
- [ ] Click in the "Address" field
- [ ] Type at least 3 characters (e.g., "1000 Main")
- [ ] **Expected**: A dropdown should appear with address suggestions from OpenStreetMap
- [ ] Click on a suggestion
- [ ] **Expected**: The address field should populate with the selected address

### 2. Form Submission
- [ ] Fill in all required fields:
  - Email: test@example.com
  - Address: (use autocomplete or type manually)
  - pH: 7.2
- [ ] Optionally fill in TDS, Temperature, Lead, Notes
- [ ] Click "Submit Test"
- [ ] **Expected**: Button should show "Submitting..." briefly
- [ ] **Expected**: Alert should show "Test submitted successfully!"
- [ ] **Expected**: A new marker should appear on the map at the submitted location
- [ ] **Expected**: Form should reset to empty

### 3. Map Functionality
- [ ] Verify the map loads with Niskayuna centered
- [ ] **Expected**: Sample data markers should appear on the map
- [ ] Click on a marker
- [ ] **Expected**: Popup should show pH, TDS, Temperature, Lead, Address, Notes, and submission date
- [ ] Marker colors:
  - Red: pH < 6.5
  - Green: 6.5 ≤ pH ≤ 8.5
  - Blue: pH > 8.5

### 4. Data Persistence
- [ ] Wait 30 seconds after submission
- [ ] Refresh the page
- [ ] **Expected**: Previously submitted data should still appear on the map

## Verification Commands

### Check Google Apps Script is responding:
```bash
curl -sL "https://script.google.com/macros/s/AKfycbyTuL-uqaZnb4z9SjPBDi5yjSFvj7kc5ymTKa7zNkLNDAWeNaWHFevLt4VR606qs5G4/exec" | jq .
```

### Local testing:
```bash
npm run build
npm run preview
# Open http://localhost:4321/niskayuniverse/
```

## Browser Console Checks

### Should see (in browser DevTools):
- No JavaScript errors in the Console
- The bundled script loading: `/niskayuniverse/_astro/hoisted.*.js`
- Successful Nominatim API calls when typing in address field
- Successful Google Apps Script POST when submitting

### Debugging:
If autocomplete isn't working:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Type in the address field
4. Look for any errors related to:
   - "address-suggestions"
   - "Form element not found"
   - "Required form elements not found"
   - Nominatim API errors

If form submission fails:
1. Check Console for errors
2. Verify the Google Apps Script URL is correct
3. Check Network tab for the POST request to script.google.com
4. Look at the response - should be `{"ok":true}` or an error message

## Known Issues
- Google Apps Script has rate limiting (5 requests per minute per user)
- Nominatim API requires delay between requests (use responsibly)
- Form requires valid coordinates from Nominatim geocoding

## Success Criteria
✅ Address autocomplete dropdown appears and works
✅ Form submits successfully with valid data
✅ New markers appear on map after submission
✅ Data persists in Google Sheets and appears on page refresh
