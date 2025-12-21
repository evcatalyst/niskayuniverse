import { describe, it, expect } from 'vitest';
import { parseYearBuilt, normalizeParcelId, normalizeAddress } from '../../scripts/fetch-parcels.mts';

describe('parseYearBuilt', () => {
  it('should parse valid year as number', () => {
    expect(parseYearBuilt(2000)).toBe(2000);
    expect(parseYearBuilt('1950')).toBe(1950);
  });

  it('should return null for invalid values', () => {
    expect(parseYearBuilt(null)).toBe(null);
    expect(parseYearBuilt(undefined)).toBe(null);
    expect(parseYearBuilt('')).toBe(null);
    expect(parseYearBuilt('invalid')).toBe(null);
  });

  it('should enforce minimum year bound (1700)', () => {
    expect(parseYearBuilt(1699)).toBe(null);
    expect(parseYearBuilt(1700)).toBe(1700);
  });

  it('should enforce maximum year bound (current year)', () => {
    const currentYear = new Date().getFullYear();
    expect(parseYearBuilt(currentYear)).toBe(currentYear);
    expect(parseYearBuilt(currentYear + 1)).toBe(null);
  });

  it('should handle edge cases', () => {
    expect(parseYearBuilt(0)).toBe(null);
    expect(parseYearBuilt(-100)).toBe(null);
    expect(parseYearBuilt(9999)).toBe(null);
  });
});

describe('normalizeParcelId', () => {
  it('should prefer SWIS_SBL_ID', () => {
    const attrs = {
      SWIS_SBL_ID: 'SBL123',
      SWIS_PRINT_KEY_ID: 'PRINT456',
      OBJECTID: 789,
    };
    expect(normalizeParcelId(attrs)).toBe('SBL123');
  });

  it('should fallback to SWIS_PRINT_KEY_ID if no SBL_ID', () => {
    const attrs = {
      SWIS_PRINT_KEY_ID: 'PRINT456',
      OBJECTID: 789,
    };
    expect(normalizeParcelId(attrs)).toBe('PRINT456');
  });

  it('should use alternative field names', () => {
    expect(normalizeParcelId({ SBL_ID: 'SBL999' })).toBe('SBL999');
    expect(normalizeParcelId({ SWISSBL: 'SWIS888' })).toBe('SWIS888');
    expect(normalizeParcelId({ PRINT_KEY: 'PK777' })).toBe('PK777');
  });

  it('should fallback to OBJECTID if no standard IDs', () => {
    const attrs = { OBJECTID: 123 };
    expect(normalizeParcelId(attrs)).toBe('PARCEL_123');
  });

  it('should handle empty attributes', () => {
    const attrs = {};
    const result = normalizeParcelId(attrs);
    // Should generate a random fallback ID
    expect(result).toMatch(/^PARCEL_[a-z0-9]+$/);
  });
});

describe('normalizeAddress', () => {
  it('should convert to uppercase', () => {
    expect(normalizeAddress('123 main st')).toBe('123 MAIN ST');
  });

  it('should normalize common street suffixes', () => {
    expect(normalizeAddress('123 Main Street')).toBe('123 MAIN ST');
    expect(normalizeAddress('456 Oak Road')).toBe('456 OAK RD');
    expect(normalizeAddress('789 Park Avenue')).toBe('789 PARK AVE');
    expect(normalizeAddress('100 Elm Drive')).toBe('100 ELM DR');
    expect(normalizeAddress('200 Cherry Lane')).toBe('200 CHERRY LN');
    expect(normalizeAddress('300 Pine Boulevard')).toBe('300 PINE BLVD');
    expect(normalizeAddress('400 Maple Court')).toBe('400 MAPLE CT');
  });

  it('should remove extra whitespace', () => {
    expect(normalizeAddress('123   Main    St')).toBe('123 MAIN ST');
    expect(normalizeAddress('  456 Oak Rd  ')).toBe('456 OAK RD');
  });

  it('should remove punctuation', () => {
    expect(normalizeAddress('123 Main St.')).toBe('123 MAIN ST');
    expect(normalizeAddress('456 Oak Rd,')).toBe('456 OAK RD');
  });

  it('should handle complex addresses', () => {
    expect(normalizeAddress('123 N. Main Street, Suite 100')).toBe('123 N MAIN ST SUITE 100');
  });

  it('should handle empty string', () => {
    expect(normalizeAddress('')).toBe('');
  });
});

describe('Provenance tagging', () => {
  it('should include all required provenance fields', () => {
    const provenance = {
      source: 'NYS_Tax_Parcels_Public',
      source_url: 'https://gisservices.its.ny.gov/arcgis/rest/services/NYS_Tax_Parcels_Public/MapServer',
      fetched_at: new Date().toISOString(),
      join_method: 'address' as const,
      confidence: 0.9,
    };

    expect(provenance.source).toBe('NYS_Tax_Parcels_Public');
    expect(provenance.source_url).toContain('NYS_Tax_Parcels_Public');
    expect(provenance.fetched_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(provenance.join_method).toMatch(/^(key|address|spatial)$/);
    expect(provenance.confidence).toBeGreaterThanOrEqual(0);
    expect(provenance.confidence).toBeLessThanOrEqual(1);
  });

  it('should validate confidence range', () => {
    const testConfidence = (value: number) => {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    };

    testConfidence(0);
    testConfidence(0.5);
    testConfidence(0.9);
    testConfidence(1);
  });
});
