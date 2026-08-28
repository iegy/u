# U — Utility Studio

A static, privacy-first web utility suite for **u.iegy.net**, designed to run on GitHub Pages with no application backend.

## Main products

### Utility Deck — 27+ tools

Core tools include:

- Image Lab: resize, compress, WebP/JPEG/PNG export and EXIF stripping on re-export.
- Secure password generator using Web Crypto.
- UUID/GUID generator.
- JSON formatter, minifier and validator.
- Base64 UTF-8 encode/decode.
- SHA-256 text hash and file checksum tools.
- Text cleaner, word/character counter, text-case converter and line toolkit.
- URL encode/decode.
- HEX/RGB color converter.
- Unix timestamp and date-difference tools.
- Percentage calculator.
- Unit converter for length, mass and temperature.
- VAT add/extract calculator.
- Profit, margin and markup calculator.
- Installment/loan calculator.
- Age calculator.
- Bill splitter with tip calculation.
- Random picker/shuffler.
- Regex tester.
- JWT payload/header decoder (decode only; no signature verification).
- CSV ↔ JSON converter.
- Direct integration link to the existing **qr.iegy.net** QR Studio.
- Search plus category filters for fast access to the tool deck.
- `Ctrl/Cmd + K` shortcut to jump directly to tool search.

### Invoice & quotation maker

- Invoice or quotation mode.
- Document number and date.
- EGP, USD, AED, SAR, EUR and GBP.
- Company/client details.
- Optional logo.
- Unlimited line items.
- Tax, discount and extra/shipping charges.
- Notes and terms.
- Local draft saving.
- Portable JSON backup/export and restore/import.
- Live document preview.
- Print / Save as PDF through the browser.

### Supplier offer comparison

- Multiple supplier offers.
- Base cost, shipping, tax, discount, lead time and rating.
- Landed-cost calculation.
- Weighted value ranking.
- Incomplete zero-price offers are blocked from ranking/export so they cannot incorrectly appear as the best value.
- CSV export.
- Printable report.
- Automatic local persistence in the browser.

## Product characteristics

- Arabic / English.
- RTL / LTR.
- Light / dark themes.
- Responsive desktop, tablet and mobile layouts.
- PWA manifest and offline cache.
- Optional browser install prompt when supported.
- Most utilities execute entirely inside the browser; files used by local tools are not uploaded to a server.
- No Firebase is required for the current feature set.

## Architecture

The project is plain HTML, CSS and JavaScript to keep deployment small and GitHub Pages friendly.

Main files:

- `index.html` — application shell and the invoice/supplier workspaces.
- `styles.css` — core visual system.
- `enhancements.css` — expanded tool-deck styles.
- `app.js` — core utilities, invoice builder and supplier comparison.
- `ux-core.js` — extended tool registry, categories and filtering.
- `ux-calc.js` — calculation and finance utilities.
- `ux-dev.js` — developer/text/data utilities.
- `ux-persist.js` — local persistence, portable invoice backups, comparison safeguards and PWA install affordance.
- `sw.js` — offline cache.
- `icon.svg` / `logo.svg` — original U Utility Studio identity.

## Quality checks

`.github/workflows/quality.yml` runs automatically on pushes and pull requests and validates JavaScript syntax, required production files, the PWA manifest, `CNAME`, asset references and the requested footer credit.

## GitHub Pages

The repository contains a `CNAME` for:

```text
u.iegy.net
```

GitHub Pages should deploy from the `main` branch root. DNS should contain:

```text
Type: CNAME
Name: u
Target: iegy.github.io
```

## Privacy note

The current application has no account system and no server-side database. Local drafts and supplier comparisons are stored in the user's browser. Clearing browser storage removes those saved drafts unless the user exported a portable invoice JSON backup.

## Credits

Designed & Developed by Mohammed Hussein · **iegy.net**
