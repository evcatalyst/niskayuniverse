import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('Parcel Data Validation', () => {
  let parcels

  beforeEach(() => {
    const dataPath = join(__dirname, '..', 'public', 'data', 'parcels_nys_index.json')
    const data = readFileSync(dataPath, 'utf8')
    parcels = JSON.parse(data)
  })

  it('should load parcels_nys_index.json successfully', () => {
    expect(parcels).toBeDefined()
    expect(Array.isArray(parcels)).toBe(true)
  })

  it('should have at least a minimum number of records', () => {
    const MIN_RECORDS = 50 // Reasonable minimum for testing
    expect(parcels.length).toBeGreaterThanOrEqual(MIN_RECORDS)
  })

  it('should have a reasonable percentage of parcels with year_built', () => {
    const withYearBuilt = parcels.filter(
      (p) => p.year_built !== null && p.year_built !== undefined
    ).length
    const percentage = (withYearBuilt / parcels.length) * 100

    // Ensure at least some parcels have year_built data (not 0%)
    // Using 30% as a minimum threshold to be realistic
    const MIN_PERCENTAGE = 30
    expect(percentage).toBeGreaterThanOrEqual(MIN_PERCENTAGE)

    console.log(
      `Parcels with year_built: ${withYearBuilt}/${parcels.length} (${percentage.toFixed(1)}%)`
    )
  })

  it('should have valid year_built values when present', () => {
    const currentYear = new Date().getFullYear()
    const MIN_YEAR = 1600
    const MAX_YEAR = currentYear + 5

    parcels.forEach((parcel) => {
      if (parcel.year_built !== null && parcel.year_built !== undefined) {
        expect(parcel.year_built).toBeGreaterThanOrEqual(MIN_YEAR)
        expect(parcel.year_built).toBeLessThanOrEqual(MAX_YEAR)
      }
    })
  })

  it('should have required provenance fields', () => {
    parcels.forEach((parcel) => {
      expect(parcel.source).toBeDefined()
      expect(parcel.source).not.toBe('')

      expect(parcel.fetched_at).toBeDefined()
      expect(parcel.fetched_at).not.toBe('')

      expect(parcel.join_method).toBeDefined()
      expect(parcel.join_method).not.toBe('')
    })
  })

  it('should have valid parcel_id for all records', () => {
    parcels.forEach((parcel) => {
      expect(parcel.parcel_id).toBeDefined()
      expect(parcel.parcel_id).not.toBe('')
      expect(parcel.parcel_id).not.toBe(null)
    })
  })

  it('should have valid coordinates', () => {
    parcels.forEach((parcel) => {
      if (parcel.latitude !== null && parcel.latitude !== undefined) {
        expect(parcel.latitude).toBeGreaterThanOrEqual(-90)
        expect(parcel.latitude).toBeLessThanOrEqual(90)
      }

      if (parcel.longitude !== null && parcel.longitude !== undefined) {
        expect(parcel.longitude).toBeGreaterThanOrEqual(-180)
        expect(parcel.longitude).toBeLessThanOrEqual(180)
      }
    })
  })
})
