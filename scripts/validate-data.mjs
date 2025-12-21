#!/usr/bin/env node
import { join } from 'node:path'
import { siteConfig } from '../src/lib/siteConfig.js'
import { readJson, validateServiceLines, validateSubmissions } from './validators.mjs'

async function validateFile(label, relativePath, validator) {
  const path = join('public', relativePath)
  const data = await readJson(path)
  validator(data)
  console.log(`✅ ${label} valid (${path})`)
}

async function run() {
  try {
    await validateFile('Service lines', siteConfig.dataPaths.serviceLines, validateServiceLines)
    await validateFile('Submissions', siteConfig.dataPaths.submissions, validateSubmissions)
  } catch (error) {
    console.error('Validation failed:', error.message)
    process.exit(1)
  }
}

run()
