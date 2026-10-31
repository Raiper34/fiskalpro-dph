# FiskalPro DPH – CSV Export Tool

A lightweight desktop application for filtering and exporting CSV columns. Built with Angular 21 and Neutralinojs, it lets you load any CSV file, select the columns you want to keep, preview the result, and save a clean export — all without a browser or a backend server.

## Features

- **CSV loading** – drag-and-drop or file-picker; UTF-8 parsed via PapaParse
- **Column selection** – check/uncheck individual columns; order is preserved
- **Live preview** – paginated table showing exactly what will be exported
- **One-click export** – saves a filtered CSV via the native save dialog (or browser download in dev mode)
- **Named profiles** – save/load column configurations by name; last-used profile is restored automatically on next launch
- **Cross-platform** – ships pre-built binaries for Linux (x64, arm64, armhf), macOS (arm64, universal, x64), and Windows (x64)

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | [Neutralinojs](https://neutralino.js.org/) 6.8.0 |
| Frontend | Angular 21 |
| UI components | PrimeNG 21 |
| CSV parsing | PapaParse 5 |
| Styling | SCSS |
| Build | Angular CLI + `neu` CLI |

## Project Structure

```
fiskalpro-dph/
├── bin/                        # Pre-built Neutralinojs binaries (all platforms)
├── frontend/                   # Angular application
│   └── src/app/
│       ├── components/
│       │   ├── csv-loader/     # File input / drag-and-drop
│       │   ├── column-selector/# Column checkboxes + profile management
│       │   └── preview-table/  # Filtered data preview
│       ├── pages/main/         # Main page (3-step stepper flow)
│       ├── services/
│       │   ├── csv.service.ts  # Parse & export CSV
│       │   └── settings.service.ts # Profiles + Neutralino storage
│       └── models/
│           └── csv.model.ts    # CsvData, ColumnSettings, AppSettings
├── www/                        # Angular build output (served by Neutralino)
├── neutralino.config.json      # Neutralinojs configuration
└── package.json                # Root scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 11+
- Neutralinojs CLI: `npm install -g @neutralinojs/neu`

### Development

```bash
# Install frontend dependencies
cd frontend && npm install

# Run Angular dev server (browser, no Neutralino APIs)
npm run dev

# Or run the full desktop app
npm run app:run
```

### Production Build

```bash
npm run start
# Equivalent to: cd frontend && ng build --configuration production && neu run
```

### Package Desktop Binaries

```bash
npm run package
# Equivalent to: cd frontend && ng build --configuration production && neu build
# Output → dist/fiskalpro-dph/ (binaries for all platforms including Windows x64)
```

The Angular output is placed in `www/browser/`. Neutralino picks it up from there per `neutralino.config.json`.

## Application Flow

The UI is a 3-step stepper:

1. **Load** – select or drop a CSV file
2. **Select columns** – check the columns to include; optionally save/load a named profile
3. **Preview & Export** – inspect the filtered data, then export to a new CSV file

## Profiles

Column selections can be saved as named profiles and reloaded on future runs. The last used profile is automatically applied when a new file is loaded (matching column names are restored; unrecognised columns are ignored).

Settings are persisted via `Neutralino.storage` (desktop) or `localStorage` (browser dev mode), keyed as `fiskalpro_dph_settings`.

## License

See [LICENSE](LICENSE).
