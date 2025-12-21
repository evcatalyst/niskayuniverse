#!/usr/bin/env tsx

/**
 * Fetch and process NYS Tax Parcel data for Niskayuna area
 *
 * Data Sources (NYS authoritative):
 * - NYS Parcels Program: https://gis.ny.gov/parcels
 * - NYS Parcel Data Dictionary: https://gis.ny.gov/standardized-tax-parcel-data-dictionary
 * - NYS Public Parcels MapServer: https://gisservices.its.ny.gov/arcgis/rest/services/NYS_Tax_Parcels_Public/MapServer
 */

import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { join } from 'path'

// Niskayuna town extent (approximate bounds in WGS84)
const NISKAYUNA_BOUNDS = {
  xmin: -73.95,
  ymin: 42.75,
  xmax: -73.84,
  ymax: 42.85,
}

// NYS SWIS code for Niskayuna (Schenectady County)
const NISKAYUNA_SWIS = '4633' // Town of Niskayuna

const NYS_PARCELS_MAPSERVER_URL =
  'https://gisservices.its.ny.gov/arcgis/rest/services/NYS_Tax_Parcels_Public/MapServer'
const PARCELS_LAYER_ID = 0 // Tax parcels layer

interface ParcelFeature {
  type: 'Feature'
  properties: {
    parcel_id: string
    swis_code?: string
    swis_sbl_id?: string
    swis_print_key_id?: string
    year_built?: number | null
    owner_name?: string
    street_addr?: string
    city?: string
    zip?: string
    provenance: {
      source: string
      source_url: string
      fetched_at: string
      join_method?: 'key' | 'address' | 'spatial'
      confidence?: number
    }
  }
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: any
  }
}

interface ParcelIndex {
  [parcel_id: string]: {
    parcel_id: string
    year_built?: number | null
    owner_name?: string
    address?: string
    swis_code?: string
    provenance: {
      source: string
      source_url: string
      fetched_at: string
    }
  }
}

interface ServiceLineRecord {
  street_address: string
  town: string
  zip: string
  road_side: string
  private_side: string
}

/**
 * Parse year built from various formats, ensuring valid range
 */
export function parseYearBuilt(value: any): number | null {
  if (!value) return null

  // Ensure we're working with a number
  let year: number
  if (typeof value === 'string') {
    year = parseInt(value, 10)
  } else if (typeof value === 'number') {
    year = Math.floor(value) // Ensure integer
  } else {
    return null // Invalid type
  }

  if (isNaN(year)) return null

  const currentYear = new Date().getFullYear()
  if (year < 1700 || year > currentYear) return null

  return year
}

/**
 * Normalize parcel ID: prefer SWIS_SBL_ID, fallback to SWIS_PRINT_KEY_ID
 */
export function normalizeParcelId(attributes: any): string {
  const sblId = attributes.SWIS_SBL_ID || attributes.SBL_ID || attributes.SWISSBL
  const printKeyId = attributes.SWIS_PRINT_KEY_ID || attributes.PRINT_KEY
  const objectId = attributes.OBJECTID

  if (sblId) return sblId
  if (printKeyId) return printKeyId
  if (objectId !== undefined && objectId !== null) return `PARCEL_${objectId}`

  // Generate a random ID as final fallback for invalid data
  return `PARCEL_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Normalize address for matching
 */
export function normalizeAddress(address: string): string {
  return address
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/\./g, '')
    .replace(/,/g, '')
    .replace(/\bSTREET\b/g, 'ST')
    .replace(/\bROAD\b/g, 'RD')
    .replace(/\bAVENUE\b/g, 'AVE')
    .replace(/\bDRIVE\b/g, 'DR')
    .replace(/\bBOULEVARD\b/g, 'BLVD')
    .replace(/\bLANE\b/g, 'LN')
    .replace(/\bCOURT\b/g, 'CT')
    .trim()
}

/**
 * Check if point is inside polygon (simple ray casting algorithm)
 */
function pointInPolygon(point: [number, number], polygon: number[][][]): boolean {
  const [x, y] = point
  const ring = polygon[0] // Use outer ring

  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0],
      yi = ring[i][1]
    const xj = ring[j][0],
      yj = ring[j][1]

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }

  return inside
}

/**
 * Fetch parcels from NYS MapServer via ArcGIS REST API
 */
async function fetchParcels(): Promise<any> {
  const { xmin, ymin, xmax, ymax } = NISKAYUNA_BOUNDS
  const geometry = `${xmin},${ymin},${xmax},${ymax}`

  // Build query URL
  const params = new URLSearchParams({
    where: `SWIS_CODE = '${NISKAYUNA_SWIS}'`,
    geometry,
    geometryType: 'esriGeometryEnvelope',
    inSR: '4326', // WGS84
    spatialRel: 'esriSpatialRelIntersects',
    outFields: '*',
    returnGeometry: 'true',
    outSR: '4326', // WGS84 output
    f: 'geojson', // Try GeoJSON first
  })

  const url = `${NYS_PARCELS_MAPSERVER_URL}/${PARCELS_LAYER_ID}/query?${params}`

  console.log('Fetching parcels from NYS MapServer...')
  console.log('Query URL:', url)

  const response = await fetch(url)

  if (!response.ok) {
    // Fallback: try with Esri JSON format
    params.set('f', 'json')
    const fallbackUrl = `${NYS_PARCELS_MAPSERVER_URL}/${PARCELS_LAYER_ID}/query?${params}`
    console.log('GeoJSON not supported, trying Esri JSON format...')

    const fallbackResponse = await fetch(fallbackUrl)
    if (!fallbackResponse.ok) {
      throw new Error(`Failed to fetch parcels: ${fallbackResponse.status}`)
    }

    const esriData = await fallbackResponse.json()
    return convertEsriJsonToGeoJson(esriData)
  }

  return response.json()
}

/**
 * Convert Esri JSON to GeoJSON
 */
function convertEsriJsonToGeoJson(esriData: any): any {
  if (!esriData.features || esriData.features.length === 0) {
    return {
      type: 'FeatureCollection',
      features: [],
    }
  }

  const features = esriData.features
    .map((feature: any) => {
      const geometry = feature.geometry
      let geoJsonGeometry

      if (geometry.rings) {
        // Polygon
        geoJsonGeometry = {
          type: 'Polygon',
          coordinates: geometry.rings,
        }
      } else if (geometry.x && geometry.y) {
        // Point
        geoJsonGeometry = {
          type: 'Point',
          coordinates: [geometry.x, geometry.y],
        }
      } else {
        return null
      }

      return {
        type: 'Feature',
        properties: feature.attributes,
        geometry: geoJsonGeometry,
      }
    })
    .filter(Boolean)

  return {
    type: 'FeatureCollection',
    features,
  }
}

/**
 * Load and parse service line CSV data
 */
function loadServiceLines(): ServiceLineRecord[] {
  const csvPath = join(process.cwd(), 'niskayuna_service_lines_full.csv')
  const csvContent = readFileSync(csvPath, 'utf-8')

  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',')

  return lines.slice(1).map((line) => {
    const values = line.split(',')
    return {
      street_address: values[0] || '',
      town: values[1] || '',
      zip: values[2] || '',
      road_side: values[3] || '',
      private_side: values[4] || '',
    }
  })
}

/**
 * Join parcels to service line data
 */
function joinParcelsToServiceLines(
  parcels: any,
  serviceLines: ServiceLineRecord[]
): { geojson: any; index: ParcelIndex; stats: any } {
  const features: ParcelFeature[] = []
  const index: ParcelIndex = {}

  const stats = {
    total: 0,
    withYearBuilt: 0,
    joinedByKey: 0,
    joinedByAddress: 0,
    joinedBySpatial: 0,
    notJoined: 0,
    yearBuiltRange: { min: Infinity, max: -Infinity },
  }

  const normalizedServiceLines = serviceLines.map((sl) => ({
    ...sl,
    normalizedAddress: normalizeAddress(sl.street_address),
  }))

  for (const feature of parcels.features) {
    stats.total++

    const attrs = feature.properties
    const parcelId = normalizeParcelId(attrs)
    const yearBuilt = parseYearBuilt(attrs.YR_BLT || attrs.YEAR_BUILT || attrs.YEARBUILT)

    if (yearBuilt) {
      stats.withYearBuilt++
      stats.yearBuiltRange.min = Math.min(stats.yearBuiltRange.min, yearBuilt)
      stats.yearBuiltRange.max = Math.max(stats.yearBuiltRange.max, yearBuilt)
    }

    // Try to join to service lines
    let joinMethod: 'key' | 'address' | 'spatial' | undefined
    let confidence = 1.0

    // Method 1: Try exact key match (if we had parcel IDs in service line data)
    // For now, we'll use address matching

    // Method 2: Address matching
    const parcelAddress = attrs.STREET_ADDR || attrs.STREET_ADDRESS || attrs.ADDRESS || ''
    const normalizedParcelAddr = normalizeAddress(parcelAddress)

    const addressMatch = normalizedServiceLines.find(
      (sl) =>
        sl.normalizedAddress &&
        normalizedParcelAddr &&
        sl.normalizedAddress === normalizedParcelAddr
    )

    if (addressMatch) {
      joinMethod = 'address'
      confidence = 0.9
      stats.joinedByAddress++
    } else {
      // Method 3: Spatial join (for service lines with coordinates)
      // This is a fallback - we'd need geocoded service line data
      // For now, mark as not joined
      stats.notJoined++
    }

    const normalizedFeature: ParcelFeature = {
      type: 'Feature',
      properties: {
        parcel_id: parcelId,
        swis_code: attrs.SWIS_CODE || attrs.SWIS,
        swis_sbl_id: attrs.SWIS_SBL_ID || attrs.SBL_ID,
        swis_print_key_id: attrs.SWIS_PRINT_KEY_ID || attrs.PRINT_KEY,
        year_built: yearBuilt,
        owner_name: attrs.OWNER_NAME || attrs.OWNER,
        street_addr: parcelAddress,
        city: attrs.CITY || attrs.MUNICIPALITY || 'Niskayuna',
        zip: attrs.ZIP || attrs.ZIP_CODE,
        provenance: {
          source: 'NYS_Tax_Parcels_Public',
          source_url: NYS_PARCELS_MAPSERVER_URL,
          fetched_at: new Date().toISOString(),
          join_method: joinMethod,
          confidence: joinMethod ? confidence : undefined,
        },
      },
      geometry: feature.geometry,
    }

    features.push(normalizedFeature)

    // Add to index
    index[parcelId] = {
      parcel_id: parcelId,
      year_built: yearBuilt,
      owner_name: normalizedFeature.properties.owner_name,
      address: parcelAddress,
      swis_code: normalizedFeature.properties.swis_code,
      provenance: {
        source: normalizedFeature.properties.provenance.source,
        source_url: normalizedFeature.properties.provenance.source_url,
        fetched_at: normalizedFeature.properties.provenance.fetched_at,
      },
    }
  }

  return {
    geojson: {
      type: 'FeatureCollection',
      features,
      crs: {
        type: 'name',
        properties: {
          name: 'EPSG:4326', // WGS84
        },
      },
    },
    index,
    stats,
  }
}

/**
 * Validate the processed data
 */
function validateData(stats: any, totalServiceLines: number): void {
  console.log('\n=== Validation Report ===')
  console.log(`Total parcels fetched: ${stats.total}`)
  console.log(
    `Parcels with year_built: ${stats.withYearBuilt} (${((stats.withYearBuilt / stats.total) * 100).toFixed(1)}%)`
  )

  if (stats.withYearBuilt > 0) {
    console.log(`Year built range: ${stats.yearBuiltRange.min} - ${stats.yearBuiltRange.max}`)

    // Sanity check
    const currentYear = new Date().getFullYear()
    if (stats.yearBuiltRange.min < 1700 || stats.yearBuiltRange.max > currentYear) {
      console.warn('⚠️  Warning: Year built values outside expected range (1700-current)')
    }
  }

  console.log(`\nJoin Statistics:`)
  console.log(`  - Joined by key: ${stats.joinedByKey}`)
  console.log(`  - Joined by address: ${stats.joinedByAddress}`)
  console.log(`  - Joined by spatial: ${stats.joinedBySpatial}`)
  console.log(`  - Not joined: ${stats.notJoined}`)

  const totalJoined = stats.joinedByKey + stats.joinedByAddress + stats.joinedBySpatial
  const joinCoverage = totalServiceLines > 0 ? (totalJoined / totalServiceLines) * 100 : 0
  console.log(
    `  - Join coverage: ${totalJoined}/${totalServiceLines} service lines (${joinCoverage.toFixed(1)}%)`
  )

  console.log(`\nCRS: EPSG:4326 (WGS84) - suitable for web mapping`)
  console.log('=========================\n')
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('Starting NYS parcel data fetch for Niskayuna...\n')

    // Fetch parcel data
    const parcelsData = await fetchParcels()
    console.log(`Fetched ${parcelsData.features?.length || 0} parcel features\n`)

    if (!parcelsData.features || parcelsData.features.length === 0) {
      console.warn('⚠️  No parcels returned from the query. Check SWIS code or bounds.')
      process.exit(0)
    }

    // Load service line data
    console.log('Loading service line data...')
    const serviceLines = loadServiceLines()
    console.log(`Loaded ${serviceLines.length} service line records\n`)

    // Join and normalize
    console.log('Joining parcels to service lines...')
    const { geojson, index, stats } = joinParcelsToServiceLines(parcelsData, serviceLines)

    // Validate
    validateData(stats, serviceLines.length)

    // Ensure output directory exists
    const outputDir = join(process.cwd(), 'public', 'data')
    mkdirSync(outputDir, { recursive: true })

    // Write GeoJSON
    const geojsonPath = join(outputDir, 'parcels_nys.geojson')
    writeFileSync(geojsonPath, JSON.stringify(geojson, null, 2))
    console.log(`✓ Written: ${geojsonPath}`)

    // Write index
    const indexPath = join(outputDir, 'parcels_nys_index.json')
    writeFileSync(indexPath, JSON.stringify(index, null, 2))
    console.log(`✓ Written: ${indexPath}`)

    console.log('\n✅ Parcel data fetch complete!')
  } catch (error) {
    console.error('❌ Error fetching parcel data:', error)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
