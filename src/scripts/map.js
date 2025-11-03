// Map initialization and functionality
export function initMap() {
  // Import Leaflet dynamically
  import('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js').then(() => {
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
    }).catch(() => {});

    // Poll for new submissions every 30 seconds
    const isLocalhost = window.location.hostname === 'localhost';
    if (!isLocalhost) {
      setInterval(async () => {
        try {
          const response = await fetch('https://script.google.com/macros/s/AKfycbyBZ0cIYn8LhD97R2xw7YEqcsbVy6Bx4XAUGUCaGpyR6W7pQza89Sa-egAlIuwAPgbkxA/exec?' + Date.now());
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
  });
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