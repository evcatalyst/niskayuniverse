import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { parseYearBuilt, normalizeParcelId, attachProvenance } from './parcel-utils.mjs'

describe('parseYearBuilt', () => {
  it('should return integer for valid year string', () => {
    expect(parseYearBuilt('2020')).toBe(2020)
    expect(parseYearBuilt('1900')).toBe(1900)
    expect(parseYearBuilt('1850')).toBe(1850)
  })

  it('should return integer for valid year number', () => {
    expect(parseYearBuilt(2020)).toBe(2020)
    expect(parseYearBuilt(1900)).toBe(1900)
  })

  it('should return null for null or empty values', () => {
    expect(parseYearBuilt(null)).toBe(null)
    expect(parseYearBuilt(undefined)).toBe(null)
    expect(parseYearBuilt('')).toBe(null)
  })

  it('should return null for non-numeric strings', () => {
    expect(parseYearBuilt('abc')).toBe(null)
    expect(parseYearBuilt('19xx')).toBe(null)
    expect(parseYearBuilt('not-a-year')).toBe(null)
  })

  it('should reject years before 1600', () => {
    expect(parseYearBuilt(1599)).toBe(null)
    expect(parseYearBuilt(1000)).toBe(null)
    expect(parseYearBuilt(500)).toBe(null)
    expect(parseYearBuilt(0)).toBe(null)
  })

  it('should reject years too far in the future', () => {
    const currentYear = new Date().getFullYear()
    const tooFarFuture = currentYear + 10
    const acceptableFuture = currentYear + 3

    expect(parseYearBuilt(tooFarFuture)).toBe(null)
    expect(parseYearBuilt(currentYear + 100)).toBe(null)
    expect(parseYearBuilt(acceptableFuture)).toBe(acceptableFuture)
  })

  it('should accept current year and reasonable future years', () => {
    const currentYear = new Date().getFullYear()
    expect(parseYearBuilt(currentYear)).toBe(currentYear)
    expect(parseYearBuilt(currentYear + 1)).toBe(currentYear + 1)
    expect(parseYearBuilt(currentYear + 5)).toBe(currentYear + 5)
  })

  it('should handle edge cases around valid range', () => {
    expect(parseYearBuilt(1600)).toBe(1600)
    const currentYear = new Date().getFullYear()
    expect(parseYearBuilt(currentYear + 5)).toBe(currentYear + 5)
    expect(parseYearBuilt(currentYear + 6)).toBe(null)
  })
})

describe('normalizeParcelId', () => {
  it('should prioritize SWIS_SBL_ID when present', () => {
    const parcel = {
      SWIS_SBL_ID: '40123-100-10',
      SWIS_PRINT_KEY_ID: '40123.100.10',
    }
    expect(normalizeParcelId(parcel)).toBe('40123-100-10')
  })

  it('should fallback to SWIS_PRINT_KEY_ID when SWIS_SBL_ID is missing', () => {
    const parcel = {
      SWIS_PRINT_KEY_ID: '40123.100.10',
    }
    expect(normalizeParcelId(parcel)).toBe('40123.100.10')
  })

  it('should fallback to SWIS_PRINT_KEY_ID when SWIS_SBL_ID is empty', () => {
    const parcel = {
      SWIS_SBL_ID: '',
      SWIS_PRINT_KEY_ID: '40123.100.10',
    }
    expect(normalizeParcelId(parcel)).toBe('40123.100.10')
  })

  it('should fallback to SWIS_PRINT_KEY_ID when SWIS_SBL_ID is only whitespace', () => {
    const parcel = {
      SWIS_SBL_ID: '   ',
      SWIS_PRINT_KEY_ID: '40123.100.10',
    }
    expect(normalizeParcelId(parcel)).toBe('40123.100.10')
  })

  it('should trim whitespace from IDs', () => {
    const parcel1 = {
      SWIS_SBL_ID: '  40123-100-10  ',
    }
    expect(normalizeParcelId(parcel1)).toBe('40123-100-10')

    const parcel2 = {
      SWIS_PRINT_KEY_ID: '  40123.100.10  ',
    }
    expect(normalizeParcelId(parcel2)).toBe('40123.100.10')
  })

  it('should return null when both IDs are missing', () => {
    const parcel = {
      OTHER_FIELD: 'value',
    }
    expect(normalizeParcelId(parcel)).toBe(null)
  })

  it('should return null when both IDs are empty', () => {
    const parcel = {
      SWIS_SBL_ID: '',
      SWIS_PRINT_KEY_ID: '',
    }
    expect(normalizeParcelId(parcel)).toBe(null)
  })

  it('should return null when parcel is null or undefined', () => {
    expect(normalizeParcelId(null)).toBe(null)
    expect(normalizeParcelId(undefined)).toBe(null)
  })
})

describe('attachProvenance', () => {
  let originalDate

  beforeEach(() => {
    // Mock Date to have consistent timestamps
    originalDate = global.Date
    const mockDate = new Date('2024-01-15T12:00:00.000Z')
    global.Date = class extends originalDate {
      constructor() {
        return mockDate
      }
      static now() {
        return mockDate.getTime()
      }
    }
    global.Date.prototype.toISOString = function () {
      return '2024-01-15T12:00:00.000Z'
    }
  })

  afterEach(() => {
    global.Date = originalDate
  })

  it('should attach source, fetched_at, and join_method to parcel', () => {
    const parcel = {
      parcel_id: '123',
      address: '123 Main St',
    }

    const result = attachProvenance(parcel, {
      source: 'NYS GIS',
      join_method: 'address_match',
    })

    expect(result.source).toBe('NYS GIS')
    expect(result.fetched_at).toBe('2024-01-15T12:00:00.000Z')
    expect(result.join_method).toBe('address_match')
    expect(result.parcel_id).toBe('123')
    expect(result.address).toBe('123 Main St')
  })

  it('should use default join_method when not provided', () => {
    const parcel = { parcel_id: '123' }
    const result = attachProvenance(parcel, { source: 'NYS GIS' })

    expect(result.join_method).toBe('direct')
  })

  it('should always fill fetched_at with current timestamp', () => {
    const parcel = { parcel_id: '123' }
    const result = attachProvenance(parcel, { source: 'Test Source' })

    expect(result.fetched_at).toBeTruthy()
    expect(typeof result.fetched_at).toBe('string')
    // Should be ISO 8601 format
    expect(result.fetched_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  it('should preserve all original parcel properties', () => {
    const parcel = {
      parcel_id: '123',
      owner: 'John Doe',
      year_built: 1950,
      value: 250000,
    }

    const result = attachProvenance(parcel, { source: 'Test' })

    expect(result.parcel_id).toBe('123')
    expect(result.owner).toBe('John Doe')
    expect(result.year_built).toBe(1950)
    expect(result.value).toBe(250000)
  })

  it('should throw error when parcel is null or undefined', () => {
    expect(() => {
      attachProvenance(null, { source: 'Test' })
    }).toThrow('Parcel cannot be null or undefined')

    expect(() => {
      attachProvenance(undefined, { source: 'Test' })
    }).toThrow('Parcel cannot be null or undefined')
  })

  it('should throw error when parcel is not an object', () => {
    expect(() => {
      attachProvenance('not an object', { source: 'Test' })
    }).toThrow('Parcel must be an object')

    expect(() => {
      attachProvenance(123, { source: 'Test' })
    }).toThrow('Parcel must be an object')
  })

  it('should throw error when source is missing', () => {
    const parcel = { parcel_id: '123' }

    expect(() => {
      attachProvenance(parcel, {})
    }).toThrow('Source is required for provenance')

    expect(() => {
      attachProvenance(parcel, { join_method: 'test' })
    }).toThrow('Source is required for provenance')
  })
})
