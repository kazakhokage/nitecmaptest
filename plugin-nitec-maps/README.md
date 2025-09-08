# @superset-ui/plugin-chart-nitec-maps

GIS map visualization plugin for Apache Superset using OpenLayers.

## Features

- Multiple layer types: vector points, WMS tiles, GeoJSON
- Cross-filtering support
- Interactive tooltips
- Auto-detection of latitude/longitude columns
- Collapsible layer panel
- Customizable styling

## Installation

```bash
npm install
```

## Development

```bash
# Build the plugin
npm run build

# Development mode with watch
npm run dev

# Run tests
npm test

# Verify integration
npm run verify
```

## Project Structure

```
plugin-nitec-maps/
├── src/
│   ├── index.ts              # Plugin entry point
│   ├── NitecMaps.tsx         # Main React component
│   ├── types.ts              # TypeScript interfaces
│   ├── plugin/
│   │   ├── index.ts          # Plugin class
│   │   ├── buildQuery.ts     # Query builder
│   │   ├── controlPanel.tsx  # Control panel config
│   │   └── transformProps.ts # Props transformer
│   ├── components/
│   │   ├── LayerPanel.tsx    # Layer control panel
│   │   └── MapContainer.tsx  # Map container
│   └── utils/
│       └── layerFactory.ts   # Layer creation utilities
├── test/
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── e2e/                  # End-to-end tests
└── scripts/
    └── verify.js             # Integration verification

```

## Usage in Superset

1. Build the plugin: `npm run build`
2. Start Superset dev server
3. Create a new chart and select "Nitec Maps"
4. Configure data sources and layers

## Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Browser testing
# Open http://localhost:8088/static/assets/test/browser-test.html
```

