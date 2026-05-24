/**
 * Formatting utilities for the LFP Emissions Dashboard.
 * All emission values are in MTCO₂e (metric tons CO₂-equivalent) unless noted.
 */

/**
 * Format a MTCO₂e value for display.
 * @param {number|null|undefined} value
 * @param {object} [opts]
 * @param {number} [opts.decimals=0] - decimal places
 * @param {boolean} [opts.compact=false] - use 'k' suffix for thousands
 */
export function fmtMTCO2e(value, { decimals = 0, compact = false } = {}) {
  if (value == null || isNaN(value)) return '—'
  if (compact && Math.abs(value) >= 1000) {
    return (value / 1000).toFixed(1) + 'k MTCO₂e'
  }
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }) + ' MTCO₂e'
}

/**
 * Format a plain number with comma separators.
 */
export function fmtNumber(value, decimals = 0) {
  if (value == null || isNaN(value)) return '—'
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format a percentage change (positive = increase, negative = decrease).
 * @param {number} value - as decimal fraction (0.15 = 15%) or whole pct
 * @param {boolean} [asWhole=false] - true if value is already 0-100
 */
export function fmtPctChange(value, asWhole = false) {
  if (value == null || isNaN(value)) return '—'
  const pct = asWhole ? value : value * 100
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toFixed(1)}%`
}

/**
 * Convert carbon (tonnes C) to CO₂e (MTCO₂e).
 * CO₂e = C × (44/12) ≈ 3.6667
 * Per IPCC AR5; also documented in manifest.json carbon_to_co2e_factor.
 *
 * @param {number} carbonTonnes - measured tonnes of carbon (C)
 * @returns {number} MTCO₂e (same numeric scale as input tonnes → MTCO₂e)
 */
export const C_TO_CO2E = 44 / 12 // ≈ 3.6667

export function carbonToMTCO2e(carbonTonnes) {
  if (carbonTonnes == null || isNaN(carbonTonnes)) return null
  return carbonTonnes * C_TO_CO2E
}

/**
 * Apply a percent-of-2019 wedge value to a known 2019 absolute.
 * Returns null if either argument is missing.
 */
export function pctOf2019ToAbsolute(pct, baseline2019) {
  if (pct == null || baseline2019 == null) return null
  return (pct / 100) * baseline2019
}

/**
 * Parse a CSV numeric field, returning null for empty / notation keys.
 * @param {string} raw
 */
export function parseNumericField(raw) {
  if (!raw || raw.trim() === '') return null
  const n = parseFloat(raw)
  return isNaN(n) ? null : n
}

/**
 * Returns true if a row has a notation key (IE/NE/NO/C) instead of a value.
 */
export function hasNotationKey(row) {
  return !!(row.notation_key && row.notation_key.trim() !== '')
}

/**
 * Format a year string for display
 */
export function fmtYear(year) {
  return String(year)
}
