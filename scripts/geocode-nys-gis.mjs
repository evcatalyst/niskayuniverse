#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// NYS GIS API for parcel-level accuracy
const GEOCODE_URL = 'https://gisservices.its.ny.gov/arcgis/rest/services/Locators/Street_and_Address_Composite/GeocodeServer/findAddressCandidates';
const BATCH_SIZE = 100;
const DELAY_MS = 500;

// Inline schema validation (simplified)
function validateServiceLine(marker) {
  const required = ['id', 'address', 'zip', 'private_type', 'public_type', 'verified', 'confidence', 'last_verified'];
  for (const field of required) {
    if (!(field in marker)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  if (!/^\d{5}$/.test(marker.zip)) {
    throw new Error(`Invalid ZIP format: ${marker.zip}`);
  }
  const materials = ['lead', 'copper', 'galvanized', 'plastic', 'unknown'];
  if (!materials.includes(marker.private_type) || !materials.includes(marker.public_type)) {
    throw new Error(`Invalid material type`);
  }
  return true;
}

// Normalize address
function normalizeAddress(address) {
  return address
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Geocode with NYS GIS API
function geocodeAddress(address) {
  return new Promise((resolve, reject) => {
    const parts = address.split(',');
    const street = parts[0]?.trim() || '';
    const city = parts[1]?.trim() || 'Niskayuna';
    const state = parts[2]?.trim() || 'NY';
    const zip = parts[3]?.trim() || '';

    const params = new URLSearchParams({
      SingleLine: `${street}, ${city}, ${state} ${zip}`,
      outFields: '*',
      f: 'json'
    });

    const url = `${GEOCODE_URL}?${params}`;
    console.log(`Geocoding: ${address}`);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Geocoding failed: ${response.statusCode}`));
        return;
      }

      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.candidates && result.candidates.length > 0) {
            const match = result.candidates[0];
            resolve({
              latitude: match.location.y,
              longitude: match.location.x,
              matchedAddress: match.address
            });
          } else {
            resolve(null);
          }
        } catch (error) {
          reject(new Error(`Failed to parse geocoding response: ${error.message}`));
        }
      });
    }).on('error', reject);
  });
}

// Fallback to zip centroid from geocode-addresses-ci.mjs
async function geocodeByZip(zip) {
  const zipCentroids = {
    '12309': { latitude: 42.815, longitude: -73.895 },
    '12304': { latitude: 42.785, longitude: -73.885 }
  };
  const centroid = zipCentroids[zip];
  if (centroid) {
    return {
      latitude: centroid.latitude + (Math.random() - 0.5) * 0.01,
      longitude: centroid.longitude + (Math.random() - 0.5) * 0.01
    };
  }
  return null;
}

// Process markers with validation
async function processMarkers(markers, startIndex = 0) {
  const endIndex = Math.min(startIndex + BATCH_SIZE, markers.length);
  const batch = markers.slice(startIndex, endIndex);

  console.log(`Processing batch ${Math.floor(startIndex / BATCH_SIZE) + 1}: addresses ${startIndex + 1}-${endIndex}`);

  for (const marker of batch) {
    try {
      // Validate against schema
      validateServiceLine(marker);

      let result = await geocodeAddress(marker.address);
      if (!result) {
        result = await geocodeByZip(marker.zip);
        if (result) console.log(`Fallback used for: ${marker.address}`);
      }
      if (result) {
        marker.position = [result.longitude, result.latitude];
        console.log(`✓ Geocoded: ${marker.address}`);
      } else {
        console.log(`✗ No match: ${marker.address}`);
      }
    } catch (error) {
      console.error(`Error for ${marker.address}: ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  }

  if (endIndex < markers.length) {
    await processMarkers(markers, endIndex);
  }
}

// Main process
async function main() {
  try {
    const markersPath = path.join(rootDir, 'data', 'markers.json');
    const markers = JSON.parse(fs.readFileSync(markersPath, 'utf8'));

    console.log(`Starting geocoding of ${markers.length} addresses using NYS GIS API...`);

    await processMarkers(markers);

    let geocoded = 0;
    let notGeocoded = 0;
    for (const marker of markers) {
      if (marker.position) {
        geocoded++;
      } else {
        notGeocoded++;
      }
    }

    fs.writeFileSync(markersPath, JSON.stringify(markers, null, 2));
    console.log(`Geocoding completed: ${geocoded} geocoded, ${notGeocoded} not geocoded`);

    const publicPath = path.join(rootDir, 'public', 'data', 'markers.json');
    fs.copyFileSync(markersPath, publicPath);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();