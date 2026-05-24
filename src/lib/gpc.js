/**
 * GPC (Global Protocol for Community-Scale GHG Inventories) constants.
 * Version 1.1 — BASIC and BASIC+ reporting levels.
 */

export const GPC_VERSION = '1.1'

export const SECTORS = {
  'Stationary Energy': { color: '#1565c0', abbr: 'SE' },
  Transportation: { color: '#e65100', abbr: 'TR' },
  Waste: { color: '#6a1b9a', abbr: 'WA' },
  IPPU: { color: '#00695c', abbr: 'IP' },
  AFOLU: { color: '#2e7d32', abbr: 'AF' },
}

export const SCOPES = {
  1: { label: 'Scope 1', description: 'Emissions occurring within the city boundary', color: '#c62828' },
  2: { label: 'Scope 2', description: 'Grid electricity consumed in the city (generated outside boundary)', color: '#f57f17' },
  3: { label: 'Scope 3', description: 'Transboundary emissions induced by activity in the city', color: '#4527a0' },
}

/**
 * GPC Notation Keys — used when a numeric value is not available or applicable.
 * Must be shown in any compliant inventory table.
 */
export const NOTATION_KEYS = {
  IE: {
    label: 'IE',
    full: 'Included Elsewhere',
    description: 'The emission source exists and is quantified, but is included in another category to avoid double counting.',
    color: '#0277bd',
  },
  NE: {
    label: 'NE',
    full: 'Not Estimated',
    description: 'The emission source exists but has not been estimated in this inventory. Data collection or methodology work is needed.',
    color: '#e65100',
  },
  NO: {
    label: 'NO',
    full: 'Not Occurring',
    description: 'The emission source does not occur within the city.',
    color: '#37474f',
  },
  C: {
    label: 'C',
    full: 'Confidential',
    description: 'Data exists but is withheld for confidentiality reasons.',
    color: '#880e4f',
  },
}

export const REPORTING_LEVELS = {
  BASIC: 'Stationary Energy (Scope 1+2) + Transportation (Scope 1+3 on-road) + Waste (Scope 1+3)',
  'BASIC+': 'BASIC plus aviation, off-road transport, IPPU, AFOLU, transboundary freight',
}

/** GPC reference number → human readable label */
export const GPC_REF_LABELS = {
  'I.1.1': 'Residential energy',
  'I.1.2': 'Residential fuel oil',
  'I.2.1': 'Commercial energy',
  'I.x.x': 'Stationary energy (aggregate)',
  'II.1.1': 'On-road passenger vehicles',
  'II.1.3': 'On-road (transboundary)',
  'II.x.x': 'On-road total',
  'II.4.1': 'Aviation (allocated)',
  'II.5.1': 'Off-road equipment',
  'III.1.1': 'Solid waste disposal',
  'III.3.1': 'Wastewater treatment',
  'IV.1': 'Refrigerants (HFCs)',
  'V.1': 'AFOLU / Urban canopy',
}
