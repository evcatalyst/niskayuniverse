const normalizeBasePath = (value) => {
  if (!value) return '/'
  const prefixed = value.startsWith('/') ? value : `/${value}`
  return prefixed !== '/' && prefixed.endsWith('/') ? prefixed.slice(0, -1) : prefixed
}

const defaultBasePath = normalizeBasePath(process.env.BASE_PATH || '/niskayuniverse')
const withTrailingSlash = (value) => (value.endsWith('/') ? value : `${value}/`)

export const siteConfig = {
  municipalityName: 'MunicipalityName',
  basePath: defaultBasePath,
  site: `https://evcatalyst.github.io${withTrailingSlash(defaultBasePath)}`,
  map: {
    center: [42.8073, -73.8945],
    zoom: 13,
  },
  dataPaths: {
    serviceLines: 'data/service_lines.geojson',
    submissions: 'data/submissions.json',
  },
  dataSources: {
    serviceLines: process.env.SERVICE_LINES_URL || '',
    submissions: process.env.SUBMISSIONS_URL || '',
  },
  submissionEndpoint: process.env.SUBMISSION_ENDPOINT || 'https://httpbin.org/post',
  nominatimEndpoint: process.env.NOMINATIM_ENDPOINT || 'https://nominatim.openstreetmap.org/search',
}

export function withBasePath(path = '') {
  const normalizedBase = withTrailingSlash(siteConfig.basePath || '/')
  const cleanedPath = path.startsWith('/') ? path.slice(1) : path
  return `${normalizedBase}${cleanedPath}`
}
