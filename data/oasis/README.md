# Oasis scrape output

This folder stores local snapshots scraped from `https://www.oasishealth.app`.

Run a full refresh with tap water locations and image auditing:

```bash
npm run scrape:oasis
```

The scraper writes timestamped folders and updates `data/oasis/latest` to point at the newest successful scrape.

The tap water location export is large. Use `--skip-tap-water` if you only need products, filters, ingredients, brands, lab references, UI notes, research, certs, and image audit data.

## Supabase import

The live frontend currently ships generated files from `src/data/*.json`; it does not query Supabase at runtime.

Supabase is used as the durable archive for the richer scrape:

```bash
npm run import:oasis:supabase
```

Tap water is imported separately because `tap_water_locations.json` is hundreds of MB:

```bash
npm run import:oasis:tap-water
```

Useful overrides:

```bash
OASIS_DATA_DIR=data/oasis/latest npm run import:oasis:supabase
OASIS_TAP_WATER_FILE=data/oasis/2026-06-05T03-55-47-924Z/tap_water_locations.json npm run import:oasis:tap-water
OASIS_TAP_WATER_IDS_FILE=/tmp/missing-tap-ids.txt npm run import:oasis:tap-water
```
