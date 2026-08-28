# U — Utility Studio

A static, privacy-first web utility suite designed for **u.iegy.net** and hosted on GitHub Pages.

## Included

- Image Lab: resize, compress, WebP/JPEG/PNG export, EXIF stripping on re-export.
- Password generator using Web Crypto random values.
- UUID/GUID generator.
- JSON formatter/minifier/validator.
- Base64 UTF-8 encode/decode.
- SHA-256 generator.
- Text cleaner and text counter.
- URL encode/decode.
- HEX to RGB converter.
- Unix timestamp converter.
- Text case converter.
- Percentage calculator.
- Date difference calculator.
- Direct link to the existing `qr.iegy.net` QR Studio.
- Invoice and quotation builder with logo, tax, discount, extras, local draft saving and Print/PDF output.
- Supplier offer comparison with landed-cost calculation, weighted comparison, CSV export and printable report.
- Arabic/English interface.
- Light/dark themes.
- Responsive mobile layout.
- PWA/offline cache.

## Architecture

The app is static HTML/CSS/JavaScript. No backend is required for the current feature set. User-entered data and invoice drafts remain on the user's device unless they explicitly download or print a result.

## GitHub Pages

The repository contains `CNAME` for:

```text
u.iegy.net
```

Configure GitHub Pages to deploy from the `main` branch root, then create the DNS record:

```text
Type: CNAME
Name: u
Target: iegy.github.io
```

## Brand

The original U Utility Studio identity is included as:

- `icon.svg` — app icon / favicon / PWA icon.
- `logo.svg` — horizontal wordmark.

## Credits

Designed & Developed by Mohammed Hussein · **iegy.net**
