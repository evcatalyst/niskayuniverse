#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Input/output paths
const MARKERS_PATH = path.join(rootDir, 'data', 'markers.json');
const GEOJSON_PATH = path.join(rootDir, 'data', 'service-lines.geojson');
const PMTILES_PATH = path.join(rootDir, 'public', 'tiles', 'service-lines.pmtiles');

// Convert markers.json to GeoJSON
function markersToGeoJSON(markersPath, geojsonPath) {
  console.log('Converting markers to GeoJSON...');

  const markers = JSON.parse(fs.readFileSync(markersPath, 'utf8'));

  const geojson = {
    type: 'FeatureCollection',
    features: markers
      .filter(m => m.position && m.position.length === 2) // Only geocoded markers
      .map((marker, index) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: marker.position // [lng, lat]
        },
        properties: {
          id: marker.id || `marker_${index}`,
          address: marker.address,
          town: marker.town || 'Niskayuna',
          zip: marker.zip,
          private_type: marker.private_type,
          public_type: marker.public_type,
          verified: marker.verified,
          confidence: marker.confidence,
          last_verified: marker.last_verified
        }
      }))
  };

  fs.writeFileSync(geojsonPath, JSON.stringify(geojson, null, 2));
  console.log(`Created GeoJSON with ${geojson.features.length} features`);
}

// Generate PMTiles using Tippecanoe
function generatePMTiles(geojsonPath, pmtilesPath) {
  console.log('Generating PMTiles...');

  // Ensure tiles directory exists
  const tilesDir = path.dirname(pmtilesPath);
  if (!fs.existsSync(tilesDir)) {
    fs.mkdirSync(tilesDir, { recursive: true });
  }

  // Tippecanoe command for vector tiles
  const cmd = `tippecanoe \
    -o "${pmtilesPath}" \
    -Z10 -z18 \
    --drop-densest-as-needed \
    --extend-zooms-if-still-dropping \
    --force \
    --layer=service-lines \
    "${geojsonPath}"`;

  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`PMTiles generated at ${pmtilesPath}`);
  } catch (error) {
    console.error('Tippecanoe failed:', error.message);
    throw error;
  }
}

// Main process
async function main() {
  try {
    console.log('Starting PMTiles generation...');

    if (!fs.existsSync(MARKERS_PATH)) {
      throw new Error(`Markers file not found: ${MARKERS_PATH}`);
    }

    // Convert to GeoJSON
    markersToGeoJSON(MARKERS_PATH, GEOJSON_PATH);

    // Generate PMTiles
    generatePMTiles(GEOJSON_PATH, PMTILES_PATH);

    console.log('PMTiles generation completed successfully');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();