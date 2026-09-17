/**
 * Builds src/features/matches/airportRegistry.json from OurAirports data.
 *
 * Source: https://ourairports.com/data/ (public domain)
 * Filter: IATA code present, type large_airport or medium_airport
 *
 * Usage: npm run build:airports
 */

import { createWriteStream } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { get } from 'node:https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outputPath = join(root, 'src/features/matches/airportRegistry.json');
const cachePath = join(root, 'scripts/.cache/airports.csv');

const AIRPORTS_CSV_URL =
  'https://davidmegginson.github.io/ourairports-data/airports.csv';

function download(url, destination) {
  return new Promise((resolve, reject) => {
    get(url, (response) => {
      if (
        response.statusCode &&
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        download(response.headers.location, destination)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download airports.csv (${response.statusCode})`));
        return;
      }

      const file = createWriteStream(destination);
      pipeline(response, file).then(resolve).catch(reject);
    }).on('error', reject);
  });
}

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0]);
  const rows = [];

  for (let index = 1; index < lines.length; index += 1) {
    const values = parseCsvLine(lines[index]);
    const row = {};
    for (let column = 0; column < headers.length; column += 1) {
      row[headers[column]] = values[column] ?? '';
    }
    rows.push(row);
  }

  return rows;
}

async function loadAirportsCsv() {
  await mkdir(dirname(cachePath), { recursive: true });

  try {
    return await readFile(cachePath, 'utf8');
  } catch {
    console.log('Downloading OurAirports airports.csv…');
    await download(AIRPORTS_CSV_URL, cachePath);
    return readFile(cachePath, 'utf8');
  }
}

function buildRegistry(rows) {
  const allowedTypes = new Set(['large_airport', 'medium_airport']);
  const registry = {};

  for (const row of rows) {
    if (!allowedTypes.has(row.type)) continue;

    const iata = row.iata_code?.trim().toUpperCase();
    if (!iata || iata === '\\N' || iata.length !== 3) continue;

    const lat = Number(row.latitude_deg);
    const lon = Number(row.longitude_deg);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    registry[iata] = {
      lat: Math.round(lat * 10000) / 10000,
      lon: Math.round(lon * 10000) / 10000,
    };
  }

  return registry;
}

const csv = await loadAirportsCsv();
const registry = buildRegistry(parseCsv(csv));
const json = JSON.stringify(registry);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${json}\n`, 'utf8');

console.log(
  `Wrote ${Object.keys(registry).length} airports to ${outputPath} (${json.length} bytes)`,
);
