import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the CSV file
const csvPath = path.join(__dirname, '..', 'niskayuna_service_lines_full_normalized.csv');
const csvData = fs.readFileSync(csvPath, 'utf8');

// Parse CSV
const lines = csvData.split('\n').filter(line => line.trim());
const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

// Convert CSV to JSON objects
const records = lines.slice(1).map((line, index) => {
  const values = line.split(',').map(v => v.replace(/"/g, '').trim());
  const record = {};

  headers.forEach((header, i) => {
    record[header] = values[i] || '';
  });

  // Add ID and other fields needed for the app
  record.id = index + 1;
  record.verified = Math.random() > 0.3; // Random verification status
  record.confidence = (0.7 + Math.random() * 0.3).toFixed(2); // Random confidence 0.7-1.0
  record.last_verified = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return record;
});

// Create items.json for the data list (first 100 records for demo)
const itemsData = records.slice(0, 100).map(record => ({
  id: record.id,
  name: record['street address'],
  email: `${record['street address'].toLowerCase().replace(/\s+/g, '.')}@niskayuna.ny.us`,
  username: record['street address'].split(' ')[0],
  address: record['street address'],
  town: record.town,
  zip: record.zip,
  road_side: record['road side'],
  private_side: record['private side'],
  verified: record.verified,
  confidence: record.confidence,
  last_verified: record.last_verified
}));

// Create markers.json for the map (all records with coordinates)
const markersData = records.map(record => ({
  id: `parcel_${record.id}`,
  address: record['street address'],
  town: record.town,
  zip: record.zip,
  private_type: record['private side'].toLowerCase(),
  public_type: record['road side'].toLowerCase(),
  verified: record.verified,
  confidence: parseFloat(record.confidence),
  last_verified: record.last_verified,
  // Add random coordinates around Niskayuna, NY area
  position: [
    -73.85 + (Math.random() - 0.5) * 0.1, // longitude around Niskayuna
    42.78 + (Math.random() - 0.5) * 0.1   // latitude around Niskayuna
  ]
}));

// Write the JSON files
const publicDataDir = path.join(__dirname, '..', 'public', 'data');

if (!fs.existsSync(publicDataDir)) {
  fs.mkdirSync(publicDataDir, { recursive: true });
}

fs.writeFileSync(
  path.join(publicDataDir, 'items.json'),
  JSON.stringify(itemsData, null, 2)
);

fs.writeFileSync(
  path.join(publicDataDir, 'markers.json'),
  JSON.stringify(markersData, null, 2)
);

console.log(`Converted ${records.length} CSV records to JSON`);
console.log(`Created items.json with ${itemsData.length} records for data list`);
console.log(`Created markers.json with ${markersData.length} records for map markers`);