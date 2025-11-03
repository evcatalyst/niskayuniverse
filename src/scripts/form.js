// Form initialization and functionality
export function initForm() {
  // Show form
  const form = document.getElementById('submit-form');
  form.style.display = 'block';

  // Address autocomplete functionality
  const addressInput = document.getElementById('address');
  const suggestionsDiv = document.getElementById('address-suggestions');
  let debounceTimer;
  let selectedSuggestion = -1;

  // Debounced search function
  function debounceSearch(query) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => searchAddresses(query), 300);
  }

  // Search addresses using Nominatim
  async function searchAddresses(query) {
    if (query.length < 3) {
      suggestionsDiv.style.display = 'none';
      return;
    }

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Niskayuna, NY')}&limit=5&countrycodes=us`);
      const data = await response.json();

      suggestionsDiv.innerHTML = '';
      if (data.length > 0) {
        data.forEach((item, index) => {
          const div = document.createElement('div');
          div.textContent = item.display_name;
          div.style.padding = '8px';
          div.style.cursor = 'pointer';
          div.style.borderBottom = '1px solid #eee';
          div.onmouseover = () => {
            div.style.backgroundColor = '#f0f0f0';
            selectedSuggestion = index;
          };
          div.onmouseout = () => {
            div.style.backgroundColor = 'white';
          };
          div.onclick = () => {
            addressInput.value = item.display_name;
            suggestionsDiv.style.display = 'none';
            // Store coordinates for submission
            addressInput.dataset.lat = item.lat;
            addressInput.dataset.lon = item.lon;
          };
          suggestionsDiv.appendChild(div);
        });
        suggestionsDiv.style.display = 'block';
      } else {
        suggestionsDiv.style.display = 'none';
      }
    } catch (error) {
      console.error('Address search error:', error);
      suggestionsDiv.style.display = 'none';
    }
  }

  // Address input event listeners
  addressInput.addEventListener('input', (e) => {
    debounceSearch(e.target.value);
  });

  addressInput.addEventListener('keydown', (e) => {
    const items = suggestionsDiv.children;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedSuggestion = Math.min(selectedSuggestion + 1, items.length - 1);
      updateSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedSuggestion = Math.max(selectedSuggestion - 1, -1);
      updateSelection();
    } else if (e.key === 'Enter' && selectedSuggestion >= 0) {
      e.preventDefault();
      items[selectedSuggestion].click();
    } else if (e.key === 'Escape') {
      suggestionsDiv.style.display = 'none';
      selectedSuggestion = -1;
    }
  });

  function updateSelection() {
    const items = suggestionsDiv.children;
    for (let i = 0; i < items.length; i++) {
      items[i].style.backgroundColor = i === selectedSuggestion ? '#e0e0e0' : 'white';
    }
  }

  // Hide suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!addressInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
      suggestionsDiv.style.display = 'none';
      selectedSuggestion = -1;
    }
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    try {
      // Get coordinates from address input or geocode if needed
      let latitude, longitude;
      if (addressInput.dataset.lat && addressInput.dataset.lon) {
        latitude = parseFloat(addressInput.dataset.lat);
        longitude = parseFloat(addressInput.dataset.lon);
      } else {
        // Fallback geocoding
        const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput.value)}&limit=1`);
        const geocodeData = await geocodeResponse.json();
        if (geocodeData.length > 0) {
          latitude = parseFloat(geocodeData[0].lat);
          longitude = parseFloat(geocodeData[0].lon);
        } else {
          throw new Error('Could not geocode address');
        }
      }

      const formData = new FormData(form);
      const data = {
        email: formData.get('email'),
        address: formData.get('address'),
        latitude,
        longitude,
        pH: formData.get('ph') || '',
        tds: formData.get('tds') || '',
        temperature: formData.get('temperature') || '',
        lead: formData.get('lead') || '',
        notes: formData.get('notes') || ''
      };

      // Submit to Google Apps Script
      const isLocalhost = window.location.hostname === 'localhost';
      const submitUrl = isLocalhost
        ? 'http://localhost:3000/submit' // Local development endpoint
        : 'https://script.google.com/macros/s/AKfycbyBZ0cIYn8LhD97R2xw7YEqcsbVy6Bx4XAUGUCaGpyR6W7pQza89Sa-egAlIuwAPgbkxA/exec';

      const response = await fetch(submitUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.ok) {
        alert('Test submitted successfully!');
        form.reset();
        // Clear stored coordinates
        delete addressInput.dataset.lat;
        delete addressInput.dataset.lon;
        // Add marker to map if function exists
        if (window.addMarkerToMap) {
          window.addMarkerToMap(data);
        }
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting test: ' + error.message);
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}