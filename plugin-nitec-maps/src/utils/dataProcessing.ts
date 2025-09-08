import { Feature } from 'ol';
import { Point, Polygon } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import { DataRecord } from '@superset-ui/core';

/**
 * Converts row data to OpenLayers features
 * Handles both point (lat/lon) and geometry column data
 */
export function processDataToFeatures(
  data: DataRecord[],
  latitudeColumn?: string,
  longitudeColumn?: string,
  geometryColumn?: string,
): Feature[] {
  const features: Feature[] = [];

  data.forEach((row, index) => {
    try {
      let geometry;

      // Handle geometry column (GeoJSON)
      if (geometryColumn && row[geometryColumn]) {
        const geojson = typeof row[geometryColumn] === 'string' 
          ? JSON.parse(row[geometryColumn] as string)
          : row[geometryColumn];
        
        if (geojson.type === 'Point') {
          geometry = new Point(fromLonLat(geojson.coordinates));
        } else if (geojson.type === 'Polygon') {
          const coords = geojson.coordinates[0].map((coord: number[]) => fromLonLat(coord));
          geometry = new Polygon([coords]);
        }
        // Add support for other geometry types as needed
      }
      // Handle lat/lon columns
      else if (latitudeColumn && longitudeColumn) {
        const lat = parseFloat(String(row[latitudeColumn]));
        const lon = parseFloat(String(row[longitudeColumn]));
        
        if (!isNaN(lat) && !isNaN(lon)) {
          geometry = new Point(fromLonLat([lon, lat]));
        }
      }

      if (geometry) {
        const feature = new Feature({
          geometry,
          ...row, // Store all row data as feature properties
          _id: index, // Add unique identifier
        });
        features.push(feature);
      }
    } catch (error) {
      console.warn(`Failed to process row ${index}:`, error);
    }
  });

  return features;
}

/**
 * Auto-detect latitude and longitude columns from data
 */
export function detectLatLonColumns(data: DataRecord[]): {
  latitudeColumn?: string;
  longitudeColumn?: string;
} {
  if (!data || data.length === 0) {
    return {};
  }

  const firstRow = data[0];
  const columns = Object.keys(firstRow);

  // Common latitude column names
  const latPatterns = [
    /^lat(itude)?$/i,
    /^y$/i,
    /^coord.*lat/i,
    /^geo.*lat/i,
  ];

  // Common longitude column names
  const lonPatterns = [
    /^lon(gitude)?$/i,
    /^lng$/i,
    /^x$/i,
    /^coord.*lon/i,
    /^geo.*lon/i,
  ];

  let latitudeColumn: string | undefined;
  let longitudeColumn: string | undefined;

  // Find matching columns
  columns.forEach(col => {
    if (!latitudeColumn && latPatterns.some(pattern => pattern.test(col))) {
      latitudeColumn = col;
    }
    if (!longitudeColumn && lonPatterns.some(pattern => pattern.test(col))) {
      longitudeColumn = col;
    }
  });

  return { latitudeColumn, longitudeColumn };
}

/**
 * Extract unique values from a column for filtering
 */
export function getUniqueValues(data: DataRecord[], column: string): any[] {
  const uniqueSet = new Set();
  data.forEach(row => {
    if (row[column] !== null && row[column] !== undefined) {
      uniqueSet.add(row[column]);
    }
  });
  return Array.from(uniqueSet).sort();
}