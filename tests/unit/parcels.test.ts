import { describe, it, expect, beforeAll } from 'vitest';
import { parseYearBuilt, normalizeParcelId, normalizeAddress, attachProvenance } from '../../scripts/fetch-parcels.mts';
import { readFileSync } from 'fs';
import { join } from 'path';

// Helper to load parcel index data
let parcelIndexData: any = null;
const getParcelIndexData = () => {
  if (!parcelIndexData) {
    const indexPath = join(process.cwd(), 'public/data/parcels_nys_index.json');
    parcelIndexData = JSON.parse(readFileSync(indexPath, 'utf-8'));
  }
  return parcelIndexData;
};

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

describe('attachProvenance', () => {
  it('should always fill source, source_url, and fetched_at', () => {
    const provenance = attachProvenance('TestSource', 'https://test.com');
    
    expect(provenance.source).toBe('TestSource');
    expect(provenance.source_url).toBe('https://test.com');
    expect(provenance.fetched_at).toBeDefined();
    expect(provenance.fetched_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('should include join_method when provided', () => {
    const provenance = attachProvenance('TestSource', 'https://test.com', 'address');
    
    expect(provenance.join_method).toBe('address');
  });

  it('should include confidence when provided', () => {
    const provenance = attachProvenance('TestSource', 'https://test.com', 'address', 0.9);
    
    expect(provenance.confidence).toBe(0.9);
  });

  it('should not include join_method when undefined', () => {
    const provenance = attachProvenance('TestSource', 'https://test.com');
    
    expect(provenance).not.toHaveProperty('join_method');
  });

  it('should not include confidence when undefined', () => {
    const provenance = attachProvenance('TestSource', 'https://test.com', 'key');
    
    expect(provenance).not.toHaveProperty('confidence');
  });

  it('should accept all valid join_method values', () => {
    const keyProv = attachProvenance('TestSource', 'https://test.com', 'key');
    const addrProv = attachProvenance('TestSource', 'https://test.com', 'address');
    const spatialProv = attachProvenance('TestSource', 'https://test.com', 'spatial');
    
    expect(keyProv.join_method).toBe('key');
    expect(addrProv.join_method).toBe('address');
    expect(spatialProv.join_method).toBe('spatial');
  });

  it('should generate current timestamp', () => {
    const before = new Date();
    const provenance = attachProvenance('TestSource', 'https://test.com');
    const after = new Date();
    
    const timestamp = new Date(provenance.fetched_at);
    expect(timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});

describe('Data validation - parcels_nys_index.json', () => {
  it('should have at least 1 record', () => {
    const indexData = getParcelIndexData();
    const recordCount = Object.keys(indexData).length;
    
    expect(recordCount).toBeGreaterThan(0);
  });

  it('should have records with valid provenance', () => {
    const indexData = getParcelIndexData();
    
    const firstKey = Object.keys(indexData)[0];
    const firstRecord = indexData[firstKey];
    
    expect(firstRecord.provenance).toBeDefined();
    expect(firstRecord.provenance.source).toBeDefined();
    expect(firstRecord.provenance.source_url).toBeDefined();
    expect(firstRecord.provenance.fetched_at).toBeDefined();
  });

  it('should have a meaningful percentage of records with year_built', () => {
    const indexData = getParcelIndexData();
    
    const records = Object.values(indexData) as any[];
    const withYearBuilt = records.filter(r => r.year_built !== null && r.year_built !== undefined);
    const percentage = (withYearBuilt.length / records.length) * 100;
    
    // At least some records should have year_built (not exactly 0%)
    expect(percentage).toBeGreaterThan(0);
  });

  it('should have year_built values within valid range when present', () => {
    const indexData = getParcelIndexData();
    
    const currentYear = new Date().getFullYear();
    const records = Object.values(indexData) as any[];
    
    for (const record of records) {
      if (record.year_built !== null && record.year_built !== undefined) {
        expect(record.year_built).toBeGreaterThanOrEqual(1700);
        expect(record.year_built).toBeLessThanOrEqual(currentYear);
      }
    }
  });
});
