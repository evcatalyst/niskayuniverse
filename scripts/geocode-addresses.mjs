#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Rate limiting: 1 request per second to respect API limits
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
  try {
    // Use a simple zip code to coordinate mapping for Niskayuna area
    // This is a fallback when address geocoding fails
    const zipCoordinates = {
      '12309': { lat: 42.8136, lng: -73.8292 }, // Niskayuna
      '12304': { lat: 42.7836, lng: -73.8792 }, // Schenectady area
      '12302': { lat: 42.8336, lng: -73.9292 }, // Scotia
      '12308': { lat: 42.8136, lng: -73.9192 }, // Schenectady
    };

    if (zipCoordinates[zip]) {
      return {
        lat: zipCoordinates[zip].lat + (Math.random() - 0.5) * 0.01, // Add small random offset
        lng: zipCoordinates[zip].lng + (Math.random() - 0.5) * 0.01,
        source: 'zip_fallback',
        confidence: 0.3
      };
    }
  } catch (error) {
    console.error(`Zip fallback error for ${zip}:`, error.message);
  }

  return null;
}

// Try multiple geocoding approaches
async function geocodeAddress(address, town, zip) {
  console.log(`  Geocoding: ${address}, ${town}, NY ${zip}`);

  // Try Nominatim first
  let result = await geocodeWithNominatim(address, town, zip);
  if (result) {
    console.log(`    ✓ Found via Nominatim: ${result.lat}, ${result.lng}`);
    return result;
  }

  // Try with simplified address (remove house number)
  const simplifiedAddress = address.replace(/^\d+\s+/, '');
  result = await geocodeWithNominatim(simplifiedAddress, town, zip);
  if (result) {
    console.log(`    ✓ Found via simplified address: ${result.lat}, ${result.lng}`);
    return result;
  }

  // Fallback to zip code centroid
  result = await geocodeByZip(zip);
  if (result) {
    console.log(`    ⚠ Using zip code fallback: ${result.lat}, ${result.lng}`);
    return result;
  }

  console.log(`    ✗ All geocoding methods failed`);
  return null;
}

async function geocodeAllAddresses() {
  const markersPath = path.join(__dirname, '..', 'data', 'markers.json');

  console.log('Reading markers data...');
  const markersData = JSON.parse(fs.readFileSync(markersPath, 'utf8'));

  console.log(`Found ${markersData.length} addresses to geocode`);
  console.log('Starting geocoding process...\n');

  let successCount = 0;
  let fallbackCount = 0;
  let failureCount = 0;

  // Process in batches to show progress
  const batchSize = 10;
  for (let i = 0; i < markersData.length; i += batchSize) {
    const batch = markersData.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(markersData.length/batchSize)} (${i + 1}-${Math.min(i + batchSize, markersData.length)})`);

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

      // Rate limiting: wait 1 second between requests
      await delay(1000);
    }

    // Save progress every batch
    console.log(`Saving progress... (${successCount + fallbackCount} successful, ${failureCount} failed)\n`);
    fs.writeFileSync(markersPath, JSON.stringify(markersData, null, 2));
  }

  console.log('\n🎉 Geocoding complete!');
  console.log(`✅ Successfully geocoded: ${successCount} addresses`);
  console.log(`⚠️  Used zip fallback: ${fallbackCount} addresses`);
  console.log(`❌ Failed to geocode: ${failureCount} addresses`);
  console.log(`📊 Total processed: ${markersData.length} addresses`);

  console.log('\nData saved successfully!');
}

// Run the geocoding
geocodeAllAddresses().catch(console.error);