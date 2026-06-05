# Oasis scrape output

This folder stores local snapshots scraped from `https://www.oasishealth.app`.

Run a full refresh with tap water locations and image auditing:

```bash
npm run scrape:oasis -- --include-tap-water
```

The scraper writes timestamped folders and updates `data/oasis/latest` to point at the newest successful scrape.

The tap water location export is large. Omit `--include-tap-water` if you only need products, filters, ingredients, brands, lab references, UI notes, and image audit data.
