#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// PDF file path
const PDF_PATH = path.join(rootDir, 'Service Line Inventory for website_updated 4_29_25.pdf');
const OUTPUT_PATH = path.join(rootDir, 'data', 'markers.json');

// Material type mapping for auto-repair
const MATERIAL_MAP = {
  'lead': 'lead',
  'copper': 'copper',
  'galvanized': 'galvanized',
  'plastic': 'plastic',
  'pvc': 'plastic',
  'unknown': 'unknown',
  // Add fuzzy matches
  'ld': 'lead',
  'cu': 'copper',
  'galv': 'galvanized',
  'plast': 'plastic'
};

// Normalize material type
function normalizeMaterial(material) {
  const normalized = material.toLowerCase().trim();
  return MATERIAL_MAP[normalized] || 'unknown';
}

// Auto-repair common issues in extracted text
function repairText(text) {
  return text
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/[^\w\s,.-]/g, '') // Remove unwanted punctuation
    .trim();
}

// Parse PDF and extract service line data
async function parsePDF(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);

  const text = data.text;
  const lines = text.split('\n').filter(line => line.trim() && line.length > 10);

  const markers = [];

  for (const line of lines) {
    const repaired = repairText(line);

    // Pattern: "123 STREET NAME Niskayuna  ZIP Material1 Material2"
    // Example: "671 ACORN DRIVE Niskayuna  12309 Copper Copper"
    const pattern = /^(\d+)\s+([A-Z\s]+?)Niskayuna\s+(\d{5})(Copper|Lead|Galvanized|Plastic|Unknown)(Copper|Lead|Galvanized|Plastic|Unknown)$/i;

    const match = repaired.match(pattern);
    if (match) {
      const [, streetNumber, streetName, zip, privateMaterial, publicMaterial] = match;

      const address = `${streetNumber} ${streetName.trim()}`;

      const marker = {
        id: `marker_${markers.length + 1}`,
        address: address,
        town: 'Niskayuna',
        zip: zip,
        private_type: normalizeMaterial(privateMaterial),
        public_type: normalizeMaterial(publicMaterial),
        verified: false,
        confidence: 0.8,
        last_verified: new Date().toISOString().split('T')[0]
      };

      try {
        validateServiceLine(marker);
        markers.push(marker);
      } catch (error) {
        console.warn(`Invalid marker: ${error.message}`);
      }
    } else {
      // Try alternative patterns for edge cases
      const altPattern = /(\d+)\s+([A-Z\s]+?)\s*(Niskayuna)?\s*(\d{5})?\s*(Copper|Lead|Galvanized|Plastic|Unknown)?\s*(Copper|Lead|Galvanized|Plastic|Unknown)?/i;
      const altMatch = repaired.match(altPattern);
      if (altMatch && altMatch[1] && altMatch[2]) {
        const [, streetNumber, streetName, town = 'Niskayuna', zip = '12309', privateMat = 'unknown', publicMat = 'unknown'] = altMatch;

        const address = `${streetNumber} ${streetName.trim()}`;

        const marker = {
          id: `marker_${markers.length + 1}`,
          address: address,
          town: town,
          zip: zip,
          private_type: normalizeMaterial(privateMat),
          public_type: normalizeMaterial(publicMat),
          verified: false,
          confidence: 0.5, // Lower confidence for partial matches
          last_verified: new Date().toISOString().split('T')[0]
        };

        try {
          validateServiceLine(marker);
          markers.push(marker);
        } catch (error) {
          // Skip invalid partial matches
        }
      }
    }
  }

  return markers;
}

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

// Main process
async function main() {
  try {
    console.log('Starting PDF ingestion...');

    if (!fs.existsSync(PDF_PATH)) {
      throw new Error(`PDF file not found: ${PDF_PATH}`);
    }

    const markers = await parsePDF(PDF_PATH);

    console.log(`Extracted ${markers.length} service line records`);

    // Merge with existing data if present
    let existingMarkers = [];
    if (fs.existsSync(OUTPUT_PATH)) {
      existingMarkers = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
      console.log(`Merging with ${existingMarkers.length} existing records`);
    }

    // Simple merge - in production, you'd want conflict resolution
    const mergedMarkers = [...existingMarkers, ...markers];

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(mergedMarkers, null, 2));
    console.log(`Saved ${mergedMarkers.length} records to ${OUTPUT_PATH}`);

    // Copy to public
    const publicPath = path.join(rootDir, 'public', 'data', 'markers.json');
    fs.copyFileSync(OUTPUT_PATH, publicPath);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();