// Form initialization and functionality
function initForm() {
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
        
        if (!geocodeResponse.ok) {
          throw new Error(`Geocoding failed with status: ${geocodeResponse.status}`);
        }
        
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

        if (!submitResponse.ok) {
          console.error('Server responded with status:', submitResponse.status);
          throw new Error(`Server error: ${submitResponse.status}`);
        }

        const result = await submitResponse.json();

        if (result.ok) {
          alert('Test submitted successfully! It will appear on the map shortly.');
          form.reset();
          // Add marker immediately to map
          if (window.addMarkerToMap) {
            window.addMarkerToMap({ latitude: lat, longitude: lon, pH: ph, email: email });
          }
        } else {
          const errorMsg = result.error || 'Unknown error';
          console.error('Submission failed:', errorMsg);
          alert('Submission failed: ' + errorMsg);
        }
      } catch (error) {
        console.error('Submission error:', error);
        let userMessage = 'Submission failed. Please try again.';
        
        // Provide more specific error messages
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          userMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('Geocoding failed')) {
          userMessage = 'Unable to validate address. Please try again.';
        } else if (error.message.includes('Server error')) {
          userMessage = 'Server temporarily unavailable. Please try again in a few moments.';
        }
        
        alert(userMessage);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Test';
      }
    });
  } catch (error) {
    console.error('Form initialization failed:', error);
  }
}

// Map initialization and functionality
function initMap() {
  try {
    const map = L.map('map').setView([42.7851, -73.8949], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // Load prebuilt data
    fetch('/niskayuniverse/data/tests.json').then(r => r.json()).then(points => {
      points.forEach(p => {
        if (!isFinite(p.latitude) || !isFinite(p.longitude)) return;
        addMarker(map, p);
      });
    }).catch((error) => {
      console.log('Failed to load sample data:', error);
    });

    // Poll for new submissions every 30 seconds
    const isLocalhost = window.location.hostname === 'localhost';
    if (!isLocalhost) {
      setInterval(async () => {
        try {
          const response = await fetch('https://script.google.com/macros/s/AKfycbyTuL-uqaZnb4z9SjPBDi5yjSFvj7kc5ymTKa7zNkLNDAWeNaWHFevLt4VR606qs5G4/exec?' + Date.now());
          const newData = await response.json();

          if (Array.isArray(newData)) {
            // Clear existing markers and re-add all
            map.eachLayer((layer) => {
              if (layer instanceof L.CircleMarker) {
                map.removeLayer(layer);
              }
            });

            newData.forEach(p => {
              if (!isFinite(p.latitude) || !isFinite(p.longitude)) return;
              addMarker(map, p);
            });
          }
        } catch (e) {
          console.log('Polling failed:', e);
        }
      }, 30000); // Poll every 30 seconds
    }

    // Make addMarker function globally available
    window.addMarkerToMap = (data) => addMarker(map, data);
  } catch (error) {
    console.error('Map initialization failed:', error);
    document.getElementById('map').innerHTML = '<p style="padding: 20px; text-align: center; color: red;">Map failed to load. Please refresh the page.</p>';
  }
}

// Add marker to map with pH-based color coding
function addMarker(map, p) {
  const getColor = (ph) => {
    if (ph === null || ph === undefined || ph === '') return 'gray';
    if (ph < 6.5) return 'red';
    if (ph > 8.5) return 'blue';
    return 'green';
  };

  const marker = L.circleMarker([p.latitude, p.longitude], {
    color: getColor(p.ph),
    fillColor: getColor(p.ph),
    fillOpacity: 0.8,
    radius: 8
  });

  const popupContent = `
    <strong>pH: ${p.ph || 'N/A'}</strong><br>
    TDS: ${p.tds || 'N/A'} ppm<br>
    Temp: ${p.temperature || 'N/A'}°F<br>
    Lead: ${p.lead || 'N/A'} ppb<br>
    Address: ${p.address || 'N/A'}<br>
    Notes: ${p.notes || 'N/A'}<br>
    <small>Submitted: ${new Date(p.timestamp).toLocaleDateString()}</small>
  `;

  marker.bindPopup(popupContent);
  marker.addTo(map);
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initForm();
});
