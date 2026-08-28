# U Utility Studio — Test Report

Date: 2026-08-28
Version: 1.0.0 production foundation

## Scope

Static GitHub Pages web application covering the Utility Deck, invoice/quotation maker, supplier comparison, PWA assets and the custom `u.iegy.net` configuration.

## Automated validation

GitHub Actions **Quality checks** has completed successfully through **run #6** on `main`.

The workflow checks:

- JavaScript syntax for `app.js`, all `ux-*.js` modules and `sw.js`.
- Required production files.
- `CNAME` = `u.iegy.net`.
- CSS/JS references in `index.html`.
- Requested developer credit in the footer.
- PWA manifest JSON validity.

Result: **PASS / success**.

## Completed checks

### Repository / deployment assets

- PASS — `index.html` exists at repository root.
- PASS — `CNAME` targets `u.iegy.net`.
- PASS — core CSS and JavaScript assets exist.
- PASS — logo and app icon assets exist.
- PASS — PWA manifest exists.
- PASS — service worker cache list includes the expanded CSS/JS modules.
- PASS — robots and sitemap files exist.
- PASS — `.nojekyll` is present for direct static serving.
- PASS — changelog and README document the current release.

### JavaScript validation

- PASS — `app.js`.
- PASS — `ux-core.js`.
- PASS — `ux-calc.js`.
- PASS — `ux-dev.js`.
- PASS — `ux-persist.js`.
- PASS — `sw.js`.

### Calculation smoke tests

- PASS — VAT addition: 1000 + 14% = 1140.
- PASS — VAT extraction: 1140 inclusive at 14% = 1000 net.
- PASS — profit margin: cost 800 / sell 1000 = 20% margin.
- PASS — markup: cost 800 / sell 1000 = 25% markup.
- PASS — installment formula returns a finite positive monthly payment.
- PASS — unit conversion: 1 km = 1000 m.
- PASS — temperature conversion: 32°F = 0°C.
- PASS — bill split: 1000 + 10% / 4 = 275 per person.

### Functional implementation review

- PASS — tool search and category filters are available.
- PASS — `Ctrl/Cmd + K` focuses the tool search.
- PASS — extended tools use the existing modal system.
- PASS — invoice/quotation builder retains live preview, local draft, logo, tax, discount, extras and Print/PDF workflow.
- PASS — invoice drafts can be exported to portable JSON and restored from JSON.
- PASS — imported invoice backups are schema-checked, line-item-limited and size-limited before storage.
- PASS — supplier comparison retains landed-cost ranking, CSV export and printable report.
- PASS — supplier comparison persists locally in the browser.
- PASS — incomplete zero-price supplier rows are prevented from producing/exporting a misleading ranking.
- PASS — Arabic/English and RTL/LTR hooks are retained.
- PASS — light/dark theme hooks are retained.
- PASS — QR Studio remains linked to `qr.iegy.net` rather than duplicating the existing QR project.
- PASS — requested footer credit is present: `Designed & Developed by Mohammed Hussein · iegy.net`.

## Final live-browser verification

The remaining verification is deployment-dependent and should be run once GitHub Pages is enabled for this repository and `u.iegy.net` resolves to it:

1. desktop and mobile layout;
2. every tool modal opens and closes;
3. invoice Print / Save as PDF output in Chrome/Edge/mobile;
4. invoice JSON export/import round trip;
5. supplier CSV download and print report;
6. service-worker update/offline behavior;
7. browser PWA install prompt on a supported browser;
8. custom-domain HTTPS certificate.

This repository contains no server-side application code, so there is no backend deployment or database migration to test.
