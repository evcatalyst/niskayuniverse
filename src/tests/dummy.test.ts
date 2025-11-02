import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

describe('Data Loading', () => {
  it('should have items.json file', () => {
    const filePath = resolve(__dirname, '../../public/data/items.json')
    expect(existsSync(filePath)).toBe(true)
  })

  it('should have markers.json file', () => {
    const filePath = resolve(__dirname, '../../public/data/markers.json')
    expect(existsSync(filePath)).toBe(true)
  })

  it('items.json should be valid JSON array', () => {
    const filePath = resolve(__dirname, '../../public/data/items.json')
    const fileContent = readFileSync(filePath, 'utf-8')
    const data = JSON.parse(fileContent)
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
  })

  it('markers.json should be valid JSON array', () => {
    const filePath = resolve(__dirname, '../../public/data/markers.json')
    const fileContent = readFileSync(filePath, 'utf-8')
    const data = JSON.parse(fileContent)
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
  })

  it('markers should have required properties', () => {
    const filePath = resolve(__dirname, '../../public/data/markers.json')
    const fileContent = readFileSync(filePath, 'utf-8')
    const data = JSON.parse(fileContent)
    const marker = data[0]
    
    expect(marker).toHaveProperty('id')
    expect(marker).toHaveProperty('address')
    expect(marker).toHaveProperty('private_type')
    expect(marker).toHaveProperty('public_type')
    expect(marker).toHaveProperty('verified')
    expect(marker).toHaveProperty('confidence')
    expect(marker).toHaveProperty('position')
  })
})