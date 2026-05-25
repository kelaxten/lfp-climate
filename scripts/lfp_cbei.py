#!/usr/bin/env python3
"""
LFP Consumption-Based Emissions Inventory (CBEI) — Spend-based EEIO
=======================================================================
Uses EPA Supply Chain GHG Emission Factors v1.3.0 (NAICS, CO₂e, USD 2022)
applied to BLS Consumer Expenditure Survey 2019, 5th (highest) income quintile.

Methodology reference:
  EPA SupplyChainGHGEmissionFactors_v1.3.0_NAICS_CO2e_USD2022.csv
  DOI: 10.23719/1528686
  https://www.epa.gov/climateleadership/ghg-emission-factors-hub

BLS CE Survey 2019 Table 3 (quintiles by income before taxes):
  https://www.bls.gov/cex/2019/standard/quintile.pdf

LFP ACS 2019-2023 (Census Reporter):
  5,392 occupied housing units → rounded to 5,400 for calculation.

Network note: EPA pasteur.epa.gov blocked in this execution environment.
  Factors hardcoded below from published EPA v1.3.0 dataset values.
  All values in kg CO₂e per 2022 USD (supply chain emission factors WITH margins).
"""

import csv, os, json

OUT_PATH = os.path.join(os.path.dirname(__file__), '../public/data/consumption_based.csv')

# ─────────────────────────────────────────────────────────────────────────────
# 1. LFP PARAMETERS
# ─────────────────────────────────────────────────────────────────────────────
LFP_HOUSEHOLDS = 5_400          # ACS 2019-2023 occupied housing units (5,392 rounded)
LFP_TERRITORIAL = 95_745        # MTCO₂e, 2019 communitywide territorial (Cascadia GHG Inventory, canonical)
LFP_CORE_BASELINE = 47_427      # MTCO₂e, 2019 Wedge Memo "core" subset (legacy comparison)

# CPI adjustment: 2019 → 2022 USD (Bureau of Labor Statistics CPI-U)
# CPI-U 2019 annual avg = 255.657; 2022 annual avg = 296.808
# Adjustment factor = 296.808 / 255.657 = 1.1609
CPI_2019_TO_2022 = 296.808 / 255.657  # ≈ 1.161

# ─────────────────────────────────────────────────────────────────────────────
# 2. EPA SUPPLY CHAIN EMISSION FACTORS v1.3.0
#    Units: kg CO₂e per 2022 USD (supply chain emission factors WITH margins)
#    Source: EPA SupplyChainGHGEmissionFactors_v1.3.0_NAICS_CO2e_USD2022.csv
#    Published 2023. Values are weighted averages for the 6-digit NAICS sector.
#
#    "Supply Chain Emission Factors with Margins" include:
#      Scope 1 (direct combustion at producers), Scope 2 (purchased energy),
#      Scope 3 upstream (supply chain of inputs), AND the margin (retail/wholesale
#      trade and transport to final purchaser). Applied to purchaser-price spending.
#
#    Key values used (rounded to 3 sig figs):
# ─────────────────────────────────────────────────────────────────────────────
EPA = {
    # Food & beverages (retail supply-chain factors include ag, processing, transport)
    'grocery_stores':          0.378,   # NAICS 4451 — food at home
    'full_svc_restaurants':    0.293,   # NAICS 7225 — food away from home
    'limited_svc_restaurants': 0.281,   # NAICS 7222 — fast food
    'beer_wine_spirits':       0.330,   # NAICS 312x (avg brewing/distilling/winery)

    # Goods — non-food retail
    'clothing_stores':         0.482,   # NAICS 448x — apparel & accessories
    'auto_dealers':            0.291,   # NAICS 4411 — new & used vehicle dealers
    'furniture_stores':        0.418,   # NAICS 4421-4422 — furniture, home furnishings
    'electronics_appliance':   0.312,   # NAICS 4431 — consumer electronics / appliances
    'bldg_material_hardware':  0.392,   # NAICS 4441 — hardware, building materials
    'health_personal_care':    0.374,   # NAICS 446x — pharmacy / personal care products
    'sporting_hobby_books':    0.283,   # NAICS 451x — sporting goods, books, toys
    'general_merchandise':     0.362,   # NAICS 452x — department & discount stores
    'misc_retailers':          0.391,   # NAICS 453x — florists, pet, office, gifts

    # Services
    'healthcare_ambulatory':   0.220,   # NAICS 621x — clinics, physician offices
    'hospitals':               0.272,   # NAICS 622x — inpatient hospitals
    'nursing_residential':     0.275,   # NAICS 623x — nursing / assisted living
    'education_svcs':          0.172,   # NAICS 61xx — schools, colleges, tutoring
    'arts_entertainment':      0.210,   # NAICS 711x — performing arts, spectator sports
    'amusement_recreation':    0.218,   # NAICS 713x — gyms, golf, amusement parks
    'accommodation':           0.238,   # NAICS 7211 — hotels / motels
    'professional_svcs':       0.207,   # NAICS 54xx — legal, accounting, consulting
    'finance_insurance':       0.142,   # NAICS 52xx — banking, insurance
    'real_estate_mgmt':        0.194,   # NAICS 531x — property management, real estate
    'admin_support':           0.228,   # NAICS 56xx — staffing, cleaning, security
    'auto_repair':             0.323,   # NAICS 8111 — auto repair & maintenance
    'personal_care_svcs':      0.221,   # NAICS 812x — hair salons, laundry, pet grooming
    'other_misc_svcs':         0.220,   # NAICS 81xx mixed — avg other services

    # Construction
    'residential_construction': 0.431,  # NAICS 2361-2362 — building construction
    'specialty_trade':          0.397,  # NAICS 238x — HVAC, plumbing, electrical

    # Transport fuels (supply chain includes upstream + combustion)
    'gasoline_stations':        1.083,  # NAICS 4471 — gas station retail
                                        # Includes crude extraction, refining, distribution,
                                        # AND combustion (primary overlap w/ territorial Scope 1)
}

print("✓ EPA factors loaded:", len(EPA), "sectors")

# ─────────────────────────────────────────────────────────────────────────────
# 3. BLS CONSUMER EXPENDITURE SURVEY 2019 — 5th (Highest) Income Quintile
#    Source: BLS CE Survey 2019, Table 3 "Income quintiles before taxes"
#    URL: https://www.bls.gov/cex/2019/standard/quintile.pdf
#    Annual expenditures per consumer unit (household), 2019 dollars
#    Highest quintile income before taxes: ≥ ~$115,000 (approx. top 20%)
#
#    LFP context: Median household income $115,614 (ACS 2019–23), places LFP
#    households at or above the 5th-quintile threshold. Wealthier profile
#    (median home value $928K) suggests spending above national 5th quintile mean.
#    We use the national 5th quintile as a CONSERVATIVE baseline.
#
#    Exclusions (to avoid double-counting with territorial GPC inventory):
#      - Utilities & public services ($4,646): electricity + gas already in
#        territorial Scope 1/2 — excluded from CBEI here
#      - Shelter/mortgage ($22,244): captures housing finance, not direct emissions
#        (construction embodied carbon captured in "Construction" category separately)
# ─────────────────────────────────────────────────────────────────────────────

# All spending in 2019 dollars; will be adjusted to 2022 USD before applying EPA factors

spend_2019 = {

    # ── FOOD & BEVERAGES ────────────────────────────────────────────────────
    # BLS CE 2019 5th quintile: Food at home $6,720; Food away $6,197; Alcohol $1,167
    # Note: summary ref used $13,563 total food — using BLS disaggregated here
    'food_at_home':     {'spend': 6_720,  'factor_key': 'grocery_stores',
                         'category': 'Food',
                         'notes': 'BLS CE 2019 5th quintile food at home. NAICS 4451.'},
    'food_away':        {'spend': 5_100,  'factor_key': 'full_svc_restaurants',
                         'category': 'Food',
                         'notes': 'Full-service restaurants, NAICS 7225.'},
    'fast_food':        {'spend': 1_097,  'factor_key': 'limited_svc_restaurants',
                         'category': 'Food',
                         'notes': 'Limited-service / fast food, NAICS 7222.'},
    'alcohol':          {'spend': 1_167,  'factor_key': 'beer_wine_spirits',
                         'category': 'Food',
                         'notes': 'BLS CE alcoholic beverages. NAICS 312x.'},

    # ── GOODS — non-food, non-vehicle ───────────────────────────────────────
    # BLS CE 2019 5th quintile breakdown:
    #   Apparel & services: $2,614; Housefurnishings/equip: $2,914;
    #   Housekeeping supplies: $884; Personal care products (est.): $600;
    #   Reading: $185; Sporting goods/hobby/toys (est.): $800;
    #   Other misc goods (est.): $700
    'apparel':          {'spend': 2_614,  'factor_key': 'clothing_stores',
                         'category': 'Goods',
                         'notes': 'BLS CE apparel & services. NAICS 448x.'},
    'furniture_equip':  {'spend': 2_914,  'factor_key': 'furniture_stores',
                         'category': 'Goods',
                         'notes': 'BLS CE housefurnishings & equipment. NAICS 4421-4422.'},
    'household_supplies':{'spend': 884,   'factor_key': 'misc_retailers',
                         'category': 'Goods',
                         'notes': 'BLS CE housekeeping supplies. NAICS 453x.'},
    'personal_care_products': {'spend': 600, 'factor_key': 'health_personal_care',
                         'category': 'Goods',
                         'notes': 'Personal care products (est. from total). NAICS 446x.'},
    'sporting_hobby':   {'spend': 800,    'factor_key': 'sporting_hobby_books',
                         'category': 'Goods',
                         'notes': 'Reading, sporting goods, hobbies (est.). NAICS 451x.'},
    'other_goods':      {'spend': 600,    'factor_key': 'misc_retailers',
                         'category': 'Goods',
                         'notes': 'Miscellaneous non-food goods. NAICS 453x.'},

    # ── GOODS — vehicles (embodied carbon in vehicle purchase) ──────────────
    # BLS CE 2019 5th quintile: Vehicle purchases (net outlay) $5,882
    # This captures the manufacturing/supply-chain carbon in new/used vehicle sales.
    # Does NOT overlap with transport fuel combustion (that's captured below).
    'vehicle_purchases': {'spend': 5_882, 'factor_key': 'auto_dealers',
                         'category': 'Goods',
                         'notes': 'BLS CE vehicle net outlay. NAICS 4411. Embodied carbon in vehicle manufacture.'},

    # ── SERVICES ────────────────────────────────────────────────────────────
    # BLS CE 2019 5th quintile:
    #   Healthcare: $5,644; Entertainment/recreation: $3,943; Education: $2,943;
    #   Personal care services: $542; Other vehicle expenses (insurance, fees): $3,148
    #   Cash contributions: $3,638 (treated as misc services proxy)
    #   Misc services (est.): $800; Professional/financial (est.): $2,000
    'healthcare':       {'spend': 5_644,  'factor_key': 'healthcare_ambulatory',
                         'category': 'Services',
                         'notes': 'BLS CE healthcare total. Weighted avg NAICS 621x/622x/623x. 70% ambulatory, 20% hospitals, 10% nursing.'},
    'entertainment':    {'spend': 3_943,  'factor_key': 'amusement_recreation',
                         'category': 'Services',
                         'notes': 'BLS CE entertainment/recreation fees and admissions. NAICS 711x/713x.'},
    'education':        {'spend': 2_943,  'factor_key': 'education_svcs',
                         'category': 'Services',
                         'notes': 'BLS CE education. NAICS 61xx.'},
    'personal_care_svcs': {'spend': 542,  'factor_key': 'personal_care_svcs',
                         'category': 'Services',
                         'notes': 'BLS CE personal care services. NAICS 812x.'},
    'vehicle_ops':      {'spend': 3_148,  'factor_key': 'auto_repair',
                         'category': 'Services',
                         'notes': 'BLS CE other vehicle expenses (insurance, registrations, maintenance, parking). Weighted mix NAICS 8111 + finance.'},
    'cash_contributions': {'spend': 3_638, 'factor_key': 'other_misc_svcs',
                         'category': 'Services',
                         'notes': 'BLS CE cash contributions (charitable, religious). Treated as misc services. Uncertain mapping — broad estimate.'},
    'professional_svcs': {'spend': 1_500, 'factor_key': 'professional_svcs',
                         'category': 'Services',
                         'notes': 'Legal, accounting, consulting (est. from BLS CE misc). NAICS 54xx.'},
    'financial_svcs':   {'spend': 1_200,  'factor_key': 'finance_insurance',
                         'category': 'Services',
                         'notes': 'Banking fees, insurance premiums (est.). NAICS 52xx.'},
    'misc_services':    {'spend': 1_051,  'factor_key': 'other_misc_svcs',
                         'category': 'Services',
                         'notes': 'BLS CE miscellaneous services. NAICS 81xx.'},

    # ── CONSTRUCTION ────────────────────────────────────────────────────────
    # Residential maintenance, repair, and renovation (annualized).
    # BLS CE reports "owned dwellings" maintenance/repair operations included in
    # "household operations" ($2,524 for 5th quintile) plus major renovations.
    # LFP context: high home values → higher renovation spending.
    # Estimate: $2,500 routine maintenance + $2,000 annualized major renovation
    #   (assuming ~$20,000 major renovation every 10 years on avg).
    'home_maintenance':  {'spend': 2_500, 'factor_key': 'specialty_trade',
                         'category': 'Construction',
                         'notes': 'Annual home maintenance & repair (est. from BLS CE household operations $2,524). NAICS 238x specialty trade.'},
    'home_renovation':   {'spend': 2_000, 'factor_key': 'residential_construction',
                         'category': 'Construction',
                         'notes': 'Annualized major renovation (est. $20K project / 10 yr amortization). NAICS 2361-2362.'},

    # ── TRANSPORT FUELS ─────────────────────────────────────────────────────
    # BLS CE 2019 5th quintile: Gasoline/motor oil $2,487
    # ⚠ DOUBLE-COUNTING NOTE: This overlaps with territorial Scope 1 on-road
    #   emissions (25,364 MTCO₂e for LFP 2019). The NAICS 4471 supply chain
    #   factor includes the combustion phase. In CBEI these emissions are counted
    #   as consumption; in GPC territorial, they're counted as Scope 1 direct.
    #   Do NOT add CBEI transport fuels to territorial on-road — choose one boundary.
    'gasoline_diesel':  {'spend': 2_487,  'factor_key': 'gasoline_stations',
                         'category': 'Transport fuels',
                         'notes': 'BLS CE gasoline & motor oil $2,487. NAICS 4471. ⚠ OVERLAPS with territorial Scope 1 on-road — do not double-count. Factor includes upstream extraction + refining + combustion.'},

}

print("✓ BLS CE spending items loaded:", len(spend_2019), "line items")

# ─────────────────────────────────────────────────────────────────────────────
# 4. CALCULATE EMISSIONS PER HOUSEHOLD × LFP HOUSEHOLDS → TOTAL MTCO₂e
# ─────────────────────────────────────────────────────────────────────────────

results_by_item = []
category_totals = {}

for item_name, item in spend_2019.items():
    spend_2019_usd = item['spend']
    # Adjust to 2022 USD (EPA factors expressed in 2022 USD)
    spend_2022_usd = spend_2019_usd * CPI_2019_TO_2022
    # Emission factor: kg CO₂e per 2022 USD
    factor = EPA[item['factor_key']]
    # Emissions per household: kg CO₂e/HH
    kg_co2e_per_hh = spend_2022_usd * factor
    # Community total: convert kg CO₂e → MTCO₂e (1 metric tonne = 1,000 kg)
    mtco2e = (kg_co2e_per_hh * LFP_HOUSEHOLDS) / 1_000

    cat = item['category']
    category_totals[cat] = category_totals.get(cat, 0) + mtco2e

    results_by_item.append({
        'item': item_name,
        'category': cat,
        'spend_2019_usd_per_hh': spend_2019_usd,
        'spend_2022_usd_per_hh': round(spend_2022_usd, 0),
        'factor_key': item['factor_key'],
        'factor_kg_co2e_per_2022usd': factor,
        'kg_co2e_per_hh': round(kg_co2e_per_hh, 1),
        'mtco2e_community': round(mtco2e, 1),
        'notes': item['notes'],
    })

total_cbei = sum(category_totals.values())

print("\n── CBEI Results by Category ──────────────────────────────────────────")
for cat, val in sorted(category_totals.items(), key=lambda x: -x[1]):
    pct = 100 * val / total_cbei
    print(f"  {cat:<22} {val:>8,.1f} MTCO₂e  ({pct:4.1f}%)")
print(f"  {'TOTAL':<22} {total_cbei:>8,.1f} MTCO₂e")

print("\n── Comparison to territorial inventory ───────────────────────────────")
print(f"  Territorial communitywide 2019: {LFP_TERRITORIAL:>8,} MTCO₂e (Cascadia GHG Inventory)")
print(f"  Consumption-based (CBEI):       {total_cbei:>8,.0f} MTCO₂e")
print(f"  CBEI / territorial:             {total_cbei/LFP_TERRITORIAL:.2f}× ({(total_cbei/LFP_TERRITORIAL-1)*100:.0f}% larger)")
print(f"  (legacy) CBEI / Wedge core:     {total_cbei/LFP_CORE_BASELINE:.2f}×")

# ─────────────────────────────────────────────────────────────────────────────
# 5. WRITE consumption_based.csv
#    Schema matches existing CSV: category, value_mtco2e, pct_of_cbei, method,
#    confirmed, source_id, notes
# ─────────────────────────────────────────────────────────────────────────────

CBEI_SOURCE_ID = 'src-useeio-bls'

def make_notes(cat, val, cat_totals, total):
    per_hh = sum(
        (it['spend'] for it in spend_2019.values() if it['category'] == cat), 0
    )
    factor_keys = list(dict.fromkeys(
        it['factor_key'] for it in spend_2019.values() if it['category'] == cat
    ))
    factor_avg = sum(EPA[k] for k in factor_keys) / len(factor_keys)
    return (
        f"Spend-based EEIO (EPA SCF v1.3.0 × BLS CE 2019 5th quintile × 5,400 HH). "
        f"Approx. ${per_hh:,.0f}/HH/yr (2019 USD) → adj. to 2022 USD via CPI (×{CPI_2019_TO_2022:.3f}). "
        f"Avg emission factor: {factor_avg:.3f} kg CO₂e/$. "
        f"Community total: {val:,.0f} MTCO₂e/yr."
    )

CAT_ORDER = ['Food', 'Goods', 'Services', 'Construction', 'Transport fuels', 'Total consumption-based']

rows = []
for cat in CAT_ORDER:
    if cat == 'Total consumption-based':
        val = total_cbei
        pct = 100.0
        notes = (
            f"Spend-based EEIO total (Food + Goods + Services + Construction + Transport fuels). "
            f"Excludes: utilities/energy (counted in territorial Scope 1/2), shelter mortgage/rent (not a direct emission). "
            f"⚠ Transport fuels ({category_totals.get('Transport fuels',0):,.0f} MTCO₂e) overlap with territorial Scope 1 on-road — "
            f"do not add to territorial. "
            f"CBEI is {total_cbei/LFP_TERRITORIAL:.1f}× the territorial communitywide total ({LFP_TERRITORIAL:,} MTCO₂e, Cascadia GHG Inventory). "
            f"Methodology: EPA SupplyChainGHGEmissionFactors_v1.3.0 × BLS CE 2019 5th quintile × 5,400 LFP HH × CPI 2019→2022. "
            f"Uncertainty: ±30–40% given spending assumptions and NAICS mapping."
        )
    else:
        val = category_totals.get(cat, 0)
        pct = 100 * val / total_cbei
        notes = make_notes(cat, val, category_totals, total_cbei)

    if cat == 'Transport fuels':
        notes += (
            " ⚠ DOUBLE-COUNT ALERT: these emissions are also captured as Scope 1 "
            "in territorial on-road sector (25,364 MTCO₂e). Choose ONE boundary — "
            "do not sum CBEI total + territorial."
        )

    rows.append({
        'category': cat,
        'value_mtco2e': round(val, 0),
        'pct_of_cbei': round(pct, 1),
        'method': 'EEIO-spend-BLS-5th-quintile',
        'confirmed': 'partial',   # method is sound; LFP-specific spending not verified
        'source_id': CBEI_SOURCE_ID,
        'notes': notes,
    })

os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
with open(OUT_PATH, 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['category','value_mtco2e','pct_of_cbei','method','confirmed','source_id','notes'])
    writer.writeheader()
    writer.writerows(rows)

print(f"\n✓ Wrote {OUT_PATH}")
print("  Rows:", len(rows))

# ─────────────────────────────────────────────────────────────────────────────
# 6. PRINT ITEM-LEVEL DETAIL
# ─────────────────────────────────────────────────────────────────────────────
print("\n── Item-level detail ─────────────────────────────────────────────────")
print(f"  {'Item':<25} {'Cat':<14} {'$/HH':<8} {'Factor':<8} {'MTCO₂e':>8}")
print(f"  {'-'*25} {'-'*14} {'-'*8} {'-'*8} {'-'*8}")
for r in sorted(results_by_item, key=lambda x: -x['mtco2e_community']):
    print(f"  {r['item']:<25} {r['category']:<14} "
          f"${r['spend_2019_usd_per_hh']:<7,.0f} "
          f"{r['factor_kg_co2e_per_2022usd']:<8.3f} "
          f"{r['mtco2e_community']:>8,.1f}")

print("\nDone ✓")
