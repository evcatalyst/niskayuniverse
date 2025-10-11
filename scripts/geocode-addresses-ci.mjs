#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configurable delay from environment variables
const DELAY_MS = parseInt(process.env.GEOCODE_DELAY_MS || '500');
const BATCH_SIZE = parseInt(process.env.GEOCODE_BATCH_SIZE || '10');

console.log(`Using delay: ${DELAY_MS}ms, batch size: ${BATCH_SIZE}`);

// Rate limiting with configurable delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Try multiple geocoding services for better accuracy
async function geocodeWithNominatim(address, town, zip) {
  const query = `${address}, ${town}, NY ${zip}, USA`;
  const encodedQuery = encodeURIComponent(query);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1&countrycodes=US&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Niskayuna-Service-Markers/1.0 (https://github.com/evcatalyst/niskayuniverse)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        source: 'nominatim',
        confidence: 1.0
      };
    }
  } catch (error) {
    console.error(`Nominatim error for ${query}:`, error.message);
  }

  return null;
}

// Fallback: geocode by zip code centroid
async function geocodeByZip(zip) {
  // Niskayuna zip codes and their approximate centroids
  const zipCentroids = {
    '12309': { lat: 42.815, lng: -73.895 },
    '12304': { lat: 42.785, lng: -73.885 }
  };

  const centroid = zipCentroids[zip];
  if (centroid) {
    return {
      lat: centroid.lat + (Math.random() - 0.5) * 0.01, // Add small random offset
      lng: centroid.lng + (Math.random() - 0.5) * 0.01,
      source: 'zip_fallback',
      confidence: 0.5
    };
  }

  return null;
}

// Try simplified address (remove street suffixes, etc.)
async function geocodeSimplified(address, town, zip) {
  // Simplify address by removing common suffixes and numbers
  const simplified = address.replace(/\b(?:AVE|ST|RD|DR|LN|WAY|PL|CT|TER|BLVD|HWY)\s*(?:NO|NORTH|SOUTH|EAST|WEST)?\b/gi, '').trim();
  if (simplified !== address) {
    return await geocodeWithNominatim(simplified, town, zip);
  }
  return null;
}

// Main geocoding function with multiple fallbacks
async function geocodeAddress(address, town, zip) {
  console.log(`  Geocoding: ${address}, ${town}, NY ${zip}`);

  // Try full address first
  let result = await geocodeWithNominatim(address, town, zip);
  if (result) {
    console.log(`    ✓ Found via Nominatim: ${result.lat}, ${result.lng}`);
    return result;
  }

  // Try simplified address
  result = await geocodeSimplified(address, town, zip);
  if (result) {
    console.log(`    ✓ Found via simplified address: ${result.lat}, ${result.lng}`);
    return result;
  }

  // Fallback to zip code centroid
  result = await geocodeByZip(zip);
  if (result) {
    console.log(`    ✓ Found via zip fallback: ${result.lat}, ${result.lng}`);
    return result;
  }

  console.log(`    ✗ All geocoding methods failed`);
  return null;
}

async function geocodeAllAddresses() {
  const markersPath = path.join(__dirname, '..', 'data', 'markers.json');

  console.log('Reading markers data...');
  const markersData = JSON.parse(fs.readFileSync(markersPath, 'utf8'));

  // Filter to only ungeocoded addresses (no geocode_source field)
  const ungeocodedMarkers = markersData.filter(marker => !marker.geocode_source);
  console.log(`Found ${ungeocodedMarkers.length} ungeocoded addresses out of ${markersData.length} total`);

  if (ungeocodedMarkers.length === 0) {
    console.log('All addresses already geocoded!');
    return;
  }

  console.log('Starting geocoding process...\n');

  let successCount = 0;
  let fallbackCount = 0;
  let failureCount = 0;

  // Process in configurable batches
  for (let i = 0; i < ungeocodedMarkers.length; i += BATCH_SIZE) {
    const batch = ungeocodedMarkers.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(ungeocodedMarkers.length/BATCH_SIZE)} (${i + 1}-${Math.min(i + BATCH_SIZE, ungeocodedMarkers.length)})`);

    for (const marker of batch) {
      const result = await geocodeAddress(marker.address, marker.town, marker.zip);

      if (result) {
        // Update position: [longitude, latitude] format used in the app
        marker.position = [result.lng, result.lat];
        marker.geocode_source = result.source;
        marker.geocode_confidence = result.confidence;

        if (result.source === 'zip_fallback') {
          fallbackCount++;
        } else {
          successCount++;
        }
      } else {
        failureCount++;
        console.log(`    ✗ Keeping existing coordinates for ${marker.address}`);
      }

      // Rate limiting with configurable delay
      await delay(DELAY_MS);
    }

    // Save progress every batch
    console.log(`Saving progress... (${successCount + fallbackCount} successful, ${failureCount} failed)\n`);
    fs.writeFileSync(markersPath, JSON.stringify(markersData, null, 2));
  }

  console.log('\n🎉 Geocoding complete!');
  console.log(`✅ Successfully geocoded: ${successCount} addresses`);
  console.log(`⚠️  Used zip fallback: ${fallbackCount} addresses`);
  console.log(`❌ Failed to geocode: ${failureCount} addresses`);
  console.log(`📊 Total processed: ${ungeocodedMarkers.length} addresses`);

  console.log('\nData saved successfully!');
}

// Run the geocoding
geocodeAllAddresses().catch(console.error);