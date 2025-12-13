import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export function validateServiceLines(data) {
  if (!data || data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
    throw new Error('service_lines.geojson must be a FeatureCollection with features array');
  }

  data.features.forEach((feature, idx) => {
    if (feature.type !== 'Feature') {
      throw new Error(`Feature ${idx} is missing type=Feature`);
    }
    const geometry = feature.geometry || {};
    if (geometry.type !== 'Point' || !Array.isArray(geometry.coordinates)) {
      throw new Error(`Feature ${idx} must have Point geometry`);
    }
    const [lng, lat] = geometry.coordinates;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new Error(`Feature ${idx} has invalid coordinates`);
    }
    const props = feature.properties || {};
    if (!props.id || !props.address) {
      throw new Error(`Feature ${idx} is missing id or address`);
    }
  });

  return data;
}

export function validateSubmissions(data) {
  if (!Array.isArray(data)) {
    throw new Error('submissions.json must be an array');
  }

  data.forEach((entry, idx) => {
    if (!entry.id || !entry.address) {
      throw new Error(`Submission ${idx} is missing id or address`);
    }
    if (!entry.submittedAt) {
      throw new Error(`Submission ${idx} is missing submittedAt`);
    }
    if (entry.coordinates) {
      const { lat, lng } = entry.coordinates;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error(`Submission ${idx} has invalid coordinates`);
      }
    }
  });

  return data;
}

export async function readJson(relativePath) {
  const content = await readFile(join(process.cwd(), relativePath), 'utf8');
  return JSON.parse(content);
}
