#!/usr/bin/env node

/**
 * Parcel ingestion script
 * Generates parcels_nys_index.json with sample NYS parcel data
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { parseYearBuilt, normalizeParcelId, attachProvenance } from './parcel-utils.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Generate sample parcel data for testing
 * In production, this would fetch from NYS GIS or other data sources
 */
function generateSampleParcels(count = 100) {
  const parcels = []
  const currentYear = new Date().getFullYear()

  for (let i = 0; i < count; i++) {
    // Generate a mix of parcels with various year_built values
    let yearBuilt
    if (i < count * 0.7) {
      // 70% have valid year_built between 1850 and current year
      yearBuilt = 1850 + Math.floor(Math.random() * (currentYear - 1850))
    } else if (i < count * 0.85) {
      // 15% have null/empty year_built
      yearBuilt = null
    } else {
      // 15% have various edge cases
      const edgeCases = [null, '', 0, currentYear + 1, 1700]
      yearBuilt = edgeCases[i % edgeCases.length]
    }

    const swisCode = `${40000 + Math.floor(Math.random() * 1000)}`
    const sblId = `${swisCode}-${100 + i}-${10 + (i % 90)}`
    const printKeyId = `${swisCode}.${100 + i}.${10 + (i % 90)}`

    parcels.push({
      SWIS_SBL_ID: i % 10 === 0 ? '' : sblId, // 10% missing SWIS_SBL_ID
      SWIS_PRINT_KEY_ID: printKeyId,
      OWNER_NAME: `Property Owner ${i + 1}`,
      STREET_ADDRESS: `${100 + i} Main Street`,
      CITY: 'Niskayuna',
      ZIP: '12309',
      YEAR_BUILT: yearBuilt,
      PROPERTY_CLASS: Math.random() > 0.3 ? '210' : '220', // Mostly residential
      LAND_VALUE: 50000 + Math.floor(Math.random() * 200000),
      TOTAL_VALUE: 150000 + Math.floor(Math.random() * 500000),
      LATITUDE: 42.78 + (Math.random() - 0.5) * 0.1,
      LONGITUDE: -73.85 + (Math.random() - 0.5) * 0.1,
    })
  }

  return parcels
}

/**
 * Process and normalize parcels
 */
function processParcels(rawParcels) {
  return rawParcels.map((parcel) => {
    // Normalize parcel ID
    const parcelId = normalizeParcelId(parcel)

    // Parse year_built
    const yearBuilt = parseYearBuilt(parcel.YEAR_BUILT)

    // Create normalized parcel
    const normalized = {
      parcel_id: parcelId,
      owner_name: parcel.OWNER_NAME,
      street_address: parcel.STREET_ADDRESS,
      city: parcel.CITY,
      zip: parcel.ZIP,
      year_built: yearBuilt,
      property_class: parcel.PROPERTY_CLASS,
      land_value: parcel.LAND_VALUE,
      total_value: parcel.TOTAL_VALUE,
      latitude: parcel.LATITUDE,
      longitude: parcel.LONGITUDE,
    }

    // Attach provenance
    return attachProvenance(normalized, {
      source: 'NYS GIS',
      join_method: 'address_match',
    })
  })
}

/**
 * Main ingestion function
 */
async function main() {
  try {
    console.log('Starting parcel ingestion...')

    // Generate sample data (in production, this would fetch from API)
    const rawParcels = generateSampleParcels(100)
    console.log(`Generated ${rawParcels.length} sample parcels`)

    // Process and normalize
    const processedParcels = processParcels(rawParcels)
    console.log(`Processed ${processedParcels.length} parcels`)

    // Calculate statistics
    const withYearBuilt = processedParcels.filter((p) => p.year_built !== null).length
    const percentage = ((withYearBuilt / processedParcels.length) * 100).toFixed(1)
    console.log(`Parcels with year_built: ${withYearBuilt} (${percentage}%)`)

    // Ensure output directory exists
    const outputDir = join(__dirname, '..', 'public', 'data')
    mkdirSync(outputDir, { recursive: true })

    // Write to file
    const outputPath = join(outputDir, 'parcels_nys_index.json')
    writeFileSync(outputPath, JSON.stringify(processedParcels, null, 2))

    console.log(`Successfully wrote parcels to ${outputPath}`)
    console.log('Parcel ingestion complete!')
  } catch (error) {
    console.error('Error during parcel ingestion:', error)
    process.exit(1)
  }
}

// Only run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { generateSampleParcels, processParcels }
