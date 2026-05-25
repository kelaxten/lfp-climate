/**
 * loadData.js — fetch, parse, and join all CSVs for the LFP Emissions Dashboard.
 *
 * All CSVs are loaded at runtime from /data under the Vite BASE_URL so the
 * site works correctly on GitHub Pages (/lfp-climate/) and locally (/).
 *
 * Usage:
 *   import { loadAllData } from './loadData'
 *   const data = await loadAllData()
 */
import Papa from 'papaparse'
import { parseNumericField } from './format.js'

const BASE = import.meta.env.BASE_URL // '/lfp-climate/' in prod, '/' in dev

/** Build an absolute URL for a file in /data */
function dataUrl(filename) {
  return `${BASE}data/${filename}`
}

/**
 * Fetch and parse a CSV file.
 * Throws a descriptive error if the file is missing or unparseable.
 */
async function fetchCSV(filename) {
  const url = dataUrl(filename)
  let response
  try {
    response = await fetch(url)
  } catch (networkError) {
    throw new Error(`Network error loading ${filename}: ${networkError.message}`)
  }
  if (!response.ok) {
    throw new Error(
      `Could not load data file "${filename}" (HTTP ${response.status}). ` +
        `Expected it at: ${url}`
    )
  }
  const text = await response.text()
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => v.trim(),
  })
  if (result.errors.length > 0) {
    const msgs = result.errors.map((e) => e.message).join('; ')
    throw new Error(`Parse errors in "${filename}": ${msgs}`)
  }
  return result.data
}

/** Fetch and parse the manifest JSON */
async function fetchManifest() {
  const url = dataUrl('manifest.json')
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Could not load manifest.json (HTTP ${response.status})`)
  }
  return response.json()
}

/**
 * Build a lookup map from sources.csv: source_id → source object
 */
function buildSourceMap(sources) {
  const map = {}
  for (const row of sources) {
    map[row.source_id] = row
  }
  return map
}

/**
 * Enrich a row array by joining source objects from the source map.
 */
function joinSources(rows, sourceMap) {
  return rows.map((row) => ({
    ...row,
    _source: sourceMap[row.source_id] ?? null,
    value_mtco2e: parseNumericField(row.value_mtco2e),
  }))
}

/**
 * Parse wedge scenarios — value_pct_of_2019 is numeric, value_mtco2e may be blank.
 */
function parseWedgeRows(rows, sourceMap) {
  return rows.map((row) => ({
    ...row,
    _source: sourceMap[row.source_id] ?? null,
    year: parseInt(row.year, 10),
    value_pct_of_2019: parseNumericField(row.value_pct_of_2019),
    value_mtco2e: parseNumericField(row.value_mtco2e),
    confirmed: row.confirmed === 'yes',
  }))
}

/**
 * Parse consumption_based rows.
 */
function parseConsumptionRows(rows, sourceMap) {
  return rows.map((row) => ({
    ...row,
    _source: sourceMap[row.source_id] ?? null,
    value_mtco2e: parseNumericField(row.value_mtco2e),
    pct_of_cbei: parseNumericField(row.pct_of_cbei),
    confirmed: row.confirmed === 'yes',
  }))
}

/**
 * Parse canopy/AFOLU rows.
 */
function parseCanopyRows(rows, sourceMap) {
  return rows.map((row) => ({
    ...row,
    _source: sourceMap[row.source_id] ?? null,
    value: parseNumericField(row.value),
    confirmed: row.confirmed === 'yes',
  }))
}

/**
 * Main entry point — loads all data files and returns a typed data object.
 *
 * @returns {Promise<DataBundle>}
 */
export async function loadAllData() {
  // Load in parallel for performance
  const [manifest, sources, inv2019, inv2022, inv2023, wedge, consumption, canopy] =
    await Promise.all([
      fetchManifest(),
      fetchCSV('sources.csv'),
      fetchCSV('inventory_2019.csv'),
      fetchCSV('inventory_2022.csv'),
      fetchCSV('inventory_2023.csv'),
      fetchCSV('wedge_scenarios.csv'),
      fetchCSV('consumption_based.csv'),
      fetchCSV('canopy_afolu.csv'),
    ])

  const sourceMap = buildSourceMap(sources)

  return {
    manifest,
    sources,
    sourceMap,
    inventory: {
      2019: joinSources(inv2019, sourceMap),
      2022: joinSources(inv2022, sourceMap),
      2023: joinSources(inv2023, sourceMap),
    },
    wedge: parseWedgeRows(wedge, sourceMap),
    consumption: parseConsumptionRows(consumption, sourceMap),
    canopy: parseCanopyRows(canopy, sourceMap),
  }
}
