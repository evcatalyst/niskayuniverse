#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { siteConfig } from '../src/lib/siteConfig.js';
import { validateServiceLines, validateSubmissions } from './validators.mjs';

const outputs = {
  serviceLines: siteConfig.dataPaths.serviceLines,
  submissions: siteConfig.dataPaths.submissions,
};

const sources = {
  serviceLines: process.env.SERVICE_LINES_URL || siteConfig.dataSources.serviceLines,
  submissions: process.env.SUBMISSIONS_URL || siteConfig.dataSources.submissions,
};

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }
  return response.json();
}

async function writeOutput(relativePath, data) {
  const target = join(process.cwd(), 'public', relativePath);
  await mkdir(join(process.cwd(), 'public', 'data'), { recursive: true });
  await writeFile(target, JSON.stringify(data, null, 2));
  console.log(`✅ Wrote ${relativePath}`);
}

async function run() {
  const tasks = [];

  if (sources.serviceLines) {
    tasks.push(
      fetchJson(sources.serviceLines)
        .then(validateServiceLines)
        .then((data) => writeOutput(outputs.serviceLines, data))
    );
  } else {
    console.log('Skipping service lines fetch (SERVICE_LINES_URL not set).');
  }

  if (sources.submissions) {
    tasks.push(
      fetchJson(sources.submissions)
        .then(validateSubmissions)
        .then((data) => writeOutput(outputs.submissions, data))
    );
  } else {
    console.log('Skipping submissions fetch (SUBMISSIONS_URL not set).');
  }

  if (tasks.length === 0) {
    console.log('No remote data sources configured. Nothing to fetch.');
    return;
  }

  await Promise.all(tasks);
}

run().catch((error) => {
  console.error('Data fetch failed:', error.message);
  process.exit(1);
});
