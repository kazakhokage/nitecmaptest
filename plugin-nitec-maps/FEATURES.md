# Nitec Maps Plugin - Features & User Interface

## Overview
The Nitec Maps plugin is a powerful GIS visualization tool for Apache Superset that enables multi-layer geospatial data visualization with interactive features and cross-filtering capabilities.

## Core Features

### 1. Multi-Layer Support
- Multiple Independent Layers: Create and manage multiple map layers, each with its own data source
- Layer Types:
  - Vector Layers: Points, lines, and polygons from database queries
  - WMS Layers: Web Map Service integration for external map services
  - GeoJSON Layers: Direct GeoJSON data input or URL references
- Layer Stacking: Control layer order with z-index configuration
- Dynamic Layer Management: Add, remove, and configure layers on the fly

### 2. Data Source Integration
- Database Integration: 
  - Connect to any Superset datasource
  - Support for latitude/longitude columns
  - Support for geometry columns (WKT, GeoJSON)
- Column Mapping:
  - Flexible latitude/longitude column selection
  - Optional geometry column for complex shapes
  - Multiple tooltip columns for rich data display
- Data Formats:
  - Point data from lat/lon coordinates
  - GeoJSON geometries (Point, LineString, Polygon, MultiPolygon)
  - WKT (Well-Known Text) geometries
  - External WMS tile services

### 3. Visualization Capabilities
- Geometry Types:
  - Points: Markers, circles, or custom icons
  - Lines: Paths, routes, connections
  - Polygons: Areas, regions, boundaries
  - Multi-geometries: Complex composite shapes
- Styling Options:
  - Customizable colors (fill and stroke)
  - Adjustable opacity and stroke width
  - Icon support with URL-based images
  - Circle markers with configurable radius
  - Layer-specific style configurations

### 4. Interactive Features
- Hover Tooltips:
  - Display data on mouse hover
  - Customizable tooltip columns
  - Formatted data presentation
  - Multi-line tooltips with all selected fields
- Feature Selection:
  - Click to select features
  - Visual feedback for selected items
  - Multi-select support
  - Selection state persistence
- Pan and Zoom:
  - Smooth map navigation
  - Mouse wheel zoom
  - Double-click zoom
  - Keyboard navigation support

### 5. Cross-Filtering Integration
- Superset Dashboard Integration:
  - Emit filter events on feature selection
  - Respond to external filter changes
  - Synchronized filtering across charts
  - Support for multi-value filters
- Filter Behavior:
  - Single-select mode
  - Multi-select with Ctrl/Cmd key
  - Clear selection support
  - Filter state visualization

### 6. Layer Panel UI
- Layer Visibility Control:
  - Checkbox toggles for each layer
  - Show/hide layers independently
  - Visual layer status indicators
- Layer Information:
  - Layer names and identifiers
  - Data source indicators
  - Feature count display
- Responsive Design:
  - Collapsible panel option
  - Adjustable panel width
  - Mobile-friendly layout

## User Interface Components

### 1. Map Canvas
- Main Visualization Area:
  - Full-width, full-height map display
  - OpenLayers-powered rendering
  - Hardware-accelerated performance
  - Responsive to container size changes

### 2. Layer Panel
- Location: Right side of map (configurable)
- Width: 250px (default)
- Features:
  - Layer name display
  - Visibility checkboxes
  - Hover highlighting
  - Themed with Superset colors

### 3. Control Panel Configuration

#### Data Section
- Latitude Column: Dropdown selector for lat values
- Longitude Column: Dropdown selector for lon values
- Geometry Column: Optional geometry data column
- Tooltip Columns: Multi-select for hover display data

#### Layers Section
- Dynamic Layer Configuration:
  - Add/Remove layer buttons
  - Layer ID and name fields
  - Layer type selector (Vector/WMS/GeoJSON)
  - Data source selector (for vector layers)
  - WMS parameters (for WMS layers)
  - GeoJSON data input (for GeoJSON layers)
  - Visibility toggle
  - Style configuration (JSON)
  - Z-index ordering

#### Map Options Section
- Center Coordinates:
  - Initial latitude
  - Initial longitude
- Zoom Level: Slider control (1-20)
- UI Options:
  - Show/Hide layer panel
  - Enable/Disable cross-filtering

### 4. Tooltip Display
- Positioning: Follow mouse cursor
- Styling: Semi-transparent background
- Content: Dynamic based on selected columns

### 5. Interaction Feedback
- Hover Effects:
  - Feature highlighting
  - Cursor change (pointer)
  - Subtle glow effect
- Selection Visualization:
  - Selected feature highlighting
  - Different style for selected items
  - Clear visual distinction

## Advanced Features

### 1. Performance Optimization
- Clustering: Automatic point clustering for large datasets
- Level of Detail: Zoom-based feature filtering
- Lazy Loading: Load data as needed
- Canvas Rendering: Hardware acceleration

### 2. Data Processing
- Coordinate Transformation: Automatic projection handling
- Data Validation: Skip invalid geometries gracefully
- Error Handling: Graceful degradation for missing data

### 3. Extensibility
- Custom Styling Functions: JavaScript-based dynamic styling
- Event Hooks: Custom interaction handlers
- Plugin Architecture: Easy to extend and modify

## User Workflows

### Creating a Map Visualization
1. Select "Nitec Maps" from visualization gallery
2. Choose a datasource
3. Configure data columns (lat/lon or geometry)
4. Add and configure layers
5. Set initial map view (center, zoom)
6. Configure interaction options
7. Save and add to dashboard

### Managing Layers
1. Click "Add Layer" in control panel
2. Set layer ID and display name
3. Choose layer type
4. Configure data source or parameters
5. Set visual style
6. Adjust layer order if needed
7. Toggle visibility as required

### Using Cross-Filtering
1. Enable cross-filtering in map options
2. Click on map features to select
3. Other dashboard charts update automatically
4. Use Ctrl/Cmd for multi-select
5. Click empty area to clear selection

## Configuration Examples

### Basic Point Map
```javascript
{
  latitudeColumn: 'lat',
  longitudeColumn: 'lon',
  tooltipColumns: ['name', 'value'],
  layers: [{
    id: 'stores',
    name: 'Store Locations',
    type: 'vector',
    visible: true,
    style: {
      type: 'circle',
      fillColor: '#007bff',
      radius: 8
    }
  }]
}
```

### Multi-Layer Regional Map
```javascript
{
  geometryColumn: 'boundary',
  tooltipColumns: ['region', 'population', 'revenue'],
  layers: [
    {
      id: 'regions',
      name: 'Sales Regions',
      type: 'vector',
      visible: true,
      style: {
        fillColor: 'rgba(0,123,255,0.3)',
        strokeColor: '#007bff',
        strokeWidth: 2
      }
    },
    {
      id: 'stores',
      name: 'Store Locations',
      type: 'vector',
      visible: true,
      style: {
        type: 'icon',
        iconUrl: '/static/store-icon.png',
        iconScale: 0.8
      }
    }
  ]
}
```

### WMS Background Layer
```javascript
{
  layers: [
    {
      id: 'basemap',
      name: 'Base Map',
      type: 'wms',
      visible: true,
      wmsParams: {
        url: 'https://maps.example.com/wms',
        layers: 'base:roads',
        params: {
          FORMAT: 'image/png',
          TRANSPARENT: true
        }
      },
      zIndex: 0
    }
  ]
}
```

