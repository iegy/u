# Changelog

## 1.0.0 — 2026-08-28

Initial production foundation for **U — Utility Studio**.

### Added

- Original U visual identity (`icon.svg` and `logo.svg`).
- Arabic/English interface with RTL/LTR support.
- Light/dark themes and responsive layout.
- 27+ browser-first utilities with search and category filters.
- Image Lab, security, developer, text, design, time, calculation and finance tools.
- Existing QR Studio integration via `qr.iegy.net`.
- Invoice and quotation maker with live preview, optional logo, multiple currencies, tax, discount, extras, local draft saving and browser Print/PDF.
- Portable invoice JSON backup and restore.
- Supplier offer comparison with landed cost, delivery time, supplier rating, weighted ranking, CSV export and print report.
- Supplier comparison local persistence.
- Safeguard preventing incomplete zero-price supplier rows from receiving a misleading ranking/export.
- PWA manifest, install affordance and offline cache.
- `Ctrl/Cmd + K` shortcut for tool search.
- SEO basics: canonical URL, metadata, robots and sitemap.
- GitHub Pages custom-domain file for `u.iegy.net`.
- `.nojekyll` for direct static hosting.
- Automated GitHub Actions quality checks.
- Production test report and project documentation.

### Architecture

No application backend is required. The current version uses static HTML/CSS/JavaScript and browser storage for local drafts and preferences.
