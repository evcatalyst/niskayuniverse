/**
 * Parcel data utilities for processing NYS parcel data
 */

/**
 * Parse year_built from raw data and return an integer or null
 * Rejects out-of-range values (e.g., before 1600 or future dates)
 * @param {any} value - Raw year_built value
 * @returns {number | null} - Parsed year as integer or null
 */
export function parseYearBuilt(value) {
  if (value == null || value === '') {
    return null
  }

  const parsed = parseInt(value, 10)

  // Check if parsing failed
  if (isNaN(parsed)) {
    return null
  }

  // Reasonable range: 1600 to current year + 5 (for planned construction)
  const currentYear = new Date().getFullYear()
  const MIN_YEAR = 1600
  const MAX_YEAR = currentYear + 5

  if (parsed < MIN_YEAR || parsed > MAX_YEAR) {
    return null
  }

  return parsed
}

/**
 * Normalize parcel ID by choosing SWIS_SBL_ID first, then SWIS_PRINT_KEY_ID
 * @param {object} parcel - Parcel object with ID fields
 * @returns {string | null} - Normalized parcel ID
 */
export function normalizeParcelId(parcel) {
  if (!parcel) {
    return null
  }

  // Prioritize SWIS_SBL_ID
  if (parcel.SWIS_SBL_ID && parcel.SWIS_SBL_ID.trim() !== '') {
    return parcel.SWIS_SBL_ID.trim()
  }

  // Fallback to SWIS_PRINT_KEY_ID
  if (parcel.SWIS_PRINT_KEY_ID && parcel.SWIS_PRINT_KEY_ID.trim() !== '') {
    return parcel.SWIS_PRINT_KEY_ID.trim()
  }

  return null
}

/**
 * Attach provenance metadata to a parcel record
 * Always fills source, fetched_at, and join_method
 * @param {object} parcel - Parcel object to attach provenance to
 * @param {object} options - Provenance options
 * @param {string} options.source - Data source identifier
 * @param {string} [options.join_method] - Method used to join/match data
 * @returns {object} - Parcel with provenance attached
 */
export function attachProvenance(parcel, options = {}) {
  if (parcel === null || parcel === undefined) {
    throw new Error('Parcel cannot be null or undefined')
  }

  if (typeof parcel !== 'object') {
    throw new Error('Parcel must be an object, received: ' + typeof parcel)
  }

  if (!options.source) {
    throw new Error('Source is required for provenance')
  }

  return {
    ...parcel,
    source: options.source,
    fetched_at: new Date().toISOString(),
    join_method: options.join_method || 'direct',
  }
}
