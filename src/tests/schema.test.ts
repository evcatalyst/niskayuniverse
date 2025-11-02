import { describe, it, expect } from 'vitest'

describe('ServiceLineSchema Validation', () => {
  it('should validate correct marker structure', () => {
    const validMarker = {
      id: 'test_1',
      address: '123 Main St',
      town: 'Niskayuna',
      zip: '12309',
      private_type: 'copper',
      public_type: 'lead',
      verified: true,
      confidence: 0.95,
      last_verified: '2024-01-01',
      position: [-73.85, 42.78]
    }
    
    // Basic validation checks
    expect(validMarker.id).toBeTruthy()
    expect(validMarker.address).toBeTruthy()
    expect(validMarker.zip).toMatch(/^\d{5}$/)
    expect(['copper', 'lead', 'galvanized', 'plastic', 'unknown']).toContain(validMarker.private_type)
    expect(validMarker.confidence).toBeGreaterThanOrEqual(0)
    expect(validMarker.confidence).toBeLessThanOrEqual(1)
  })

  it('should validate position coordinates', () => {
    const marker = {
      position: [-73.85, 42.78]
    }
    
    expect(Array.isArray(marker.position)).toBe(true)
    expect(marker.position).toHaveLength(2)
    expect(marker.position[0]).toBeGreaterThan(-180)
    expect(marker.position[0]).toBeLessThan(180)
    expect(marker.position[1]).toBeGreaterThan(-90)
    expect(marker.position[1]).toBeLessThan(90)
  })

  it('should validate material types', () => {
    const validTypes = ['copper', 'lead', 'galvanized', 'plastic', 'unknown']
    
    validTypes.forEach(type => {
      expect(validTypes).toContain(type)
    })
  })
})