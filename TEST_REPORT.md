# U Utility Studio — Test Report

Date: 2026-08-28

## Scope

Static GitHub Pages web application covering the Utility Deck, invoice/quotation maker, supplier comparison, PWA assets and the custom `u.iegy.net` configuration.

## Completed checks

### Repository / deployment assets

- PASS — `index.html` exists at repository root.
- PASS — `CNAME` targets `u.iegy.net`.
- PASS — core CSS and JavaScript assets exist.
- PASS — logo and app icon assets exist.
- PASS — PWA manifest exists.
- PASS — service worker cache list includes the expanded CSS/JS modules.
- PASS — robots and sitemap files exist.

### JavaScript validation

The newly added JavaScript modules were syntax-checked with Node.js:

- PASS — `ux-core.js`
- PASS — `ux-calc.js`
- PASS — `ux-dev.js`
- PASS — `ux-persist.js`

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

- PASS — tool search remains available.
- PASS — category filters are added without replacing the existing tools.
- PASS — extended tools use the existing modal system.
- PASS — invoice/quotation builder retains live preview, local draft, logo, tax, discount, extras and Print/PDF workflow.
- PASS — supplier comparison retains landed-cost ranking, CSV export and printable report.
- PASS — supplier comparison now persists locally in the browser.
- PASS — Arabic/English and RTL/LTR hooks are retained.
- PASS — light/dark theme hooks are retained.
- PASS — QR Studio remains linked to `qr.iegy.net` rather than duplicating the existing QR project.
- PASS — requested footer credit is present: `Designed & Developed by Mohammed Hussein · iegy.net`.

## Browser verification still recommended after GitHub Pages deployment

A final live smoke test should be performed once `u.iegy.net` resolves to the GitHub Pages deployment. Check:

1. desktop and mobile layout;
2. every tool modal opens and closes;
3. invoice Print / Save as PDF output;
4. CSV download;
5. service-worker update/offline behavior;
6. browser PWA install prompt on a supported browser;
7. custom-domain HTTPS certificate.

This repository contains no server-side application code, so there is no backend deployment or database migration to test.
