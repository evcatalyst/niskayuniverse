import { defineConfig } from 'astro/config'
import { siteConfig } from './src/lib/siteConfig.js'

const normalizedBase = siteConfig.basePath.endsWith('/')
  ? siteConfig.basePath
  : `${siteConfig.basePath}/`

export default defineConfig({
  output: 'static',
  site: siteConfig.site ?? `https://example.com${normalizedBase}`,
  base: siteConfig.basePath,
})
