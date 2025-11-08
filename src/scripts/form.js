// Form initialization and functionality
export function initForm() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFormInternal);
  } else {
    initFormInternal();
  }
}

function initFormInternal() {
  try {
    const form = document.getElementById('submit-form');
    if (!form) {
      console.error('Form element not found');
      return;
    }

    const addressInput = document.getElementById('address');
    const emailInput = document.getElementById('email');
    const phInput = document.getElementById('ph');
    const submitBtn = document.getElementById('submit-btn');

    if (!addressInput || !emailInput || !phInput || !submitBtn) {
      console.error('Required form elements not found');
      return;
    }

    // Address autocomplete
    addressInput.addEventListener('input', async (e) => {
      try {
        const query = e.target.value;
        if (query.length < 3) return;

        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=us`);
        const results = await response.json();

        // Clear existing suggestions
        const suggestionsDiv = document.getElementById('address-suggestions');
        suggestionsDiv.innerHTML = '';
        suggestionsDiv.style.display = 'none';

        if (results.length > 0) {
          results.forEach(result => {
            const suggestion = document.createElement('div');
            suggestion.textContent = result.display_name;
            suggestion.style.cssText = 'padding: 8px; cursor: pointer; border-bottom: 1px solid #eee;';
            suggestion.addEventListener('click', () => {
              addressInput.value = result.display_name;
              suggestionsDiv.style.display = 'none';
              suggestionsDiv.innerHTML = '';
            });
            suggestionsDiv.appendChild(suggestion);
          });

          suggestionsDiv.style.display = 'block';
        }
      } catch (error) {
        console.log('Address autocomplete failed:', error);
      }
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();
      const address = addressInput.value.trim();
      const ph = parseFloat(phInput.value);

      if (!email || !address || isNaN(ph)) {
        alert('Please fill in all fields correctly.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      try {
        // Geocode the address
        const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
        const geocodeResults = await geocodeResponse.json();

        if (geocodeResults.length === 0) {
          alert('Could not find coordinates for this address. Please try a different address.');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Test';
          return;
        }

        const lat = parseFloat(geocodeResults[0].lat);
        const lon = parseFloat(geocodeResults[0].lon);

        // Submit to Google Apps Script
        const submitResponse = await fetch('https://script.google.com/macros/s/AKfycbyTuL-uqaZnb4z9SjPBDi5yjSFvj7kc5ymTKa7zNkLNDAWeNaWHFevLt4VR606qs5G4/exec', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            address: address,
            latitude: lat,
            longitude: lon,
            pH: ph,
            tds: parseFloat(document.getElementById('tds').value) || '',
            temperature: parseFloat(document.getElementById('temperature').value) || '',
            lead: parseFloat(document.getElementById('lead').value) || '',
            notes: document.getElementById('notes').value || '',
            timestamp: new Date().toISOString()
          })
        });

        const result = await submitResponse.json();

        if (result.ok) {
          alert('Test submitted successfully! It will appear on the map shortly.');
          form.reset();
          // Add marker immediately to map
          if (window.addMarkerToMap) {
            window.addMarkerToMap({ latitude: lat, longitude: lon, pH: ph, email: email });
          }
        } else {
          alert('Submission failed: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Submission error:', error);
        alert('Submission failed. Please try again.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Test';
      }
    });
  } catch (error) {
    console.error('Form initialization failed:', error);
  }
}