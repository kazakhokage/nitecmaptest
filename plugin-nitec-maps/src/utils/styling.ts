import { Style, Fill, Stroke, Circle, Text } from 'ol/style';
import { Feature } from 'ol';
import { getCategoricalSchemeRegistry, getNumberFormatter } from '@superset-ui/core';

export interface StyleConfig {
  color?: string;
  colorColumn?: string;
  colorScheme?: string;
  size?: number;
  sizeColumn?: string;
  opacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

/**
 * Creates OpenLayers styles for features
 * Handles dynamic styling based on data values
 */
export function createFeatureStyle(config: StyleConfig): (feature: Feature) => Style {
  const {
    color = '#1f77b4',
    colorColumn,
    colorScheme = 'default',
    size = 8,
    sizeColumn,
    opacity = 0.8,
    strokeColor = '#ffffff',
    strokeWidth = 2,
  } = config;

  // Get color scheme if using dynamic colors
  const colorScale = colorColumn 
    ? getCategoricalSchemeRegistry().get(colorScheme)?.colors || [color]
    : null;

  return (feature: Feature) => {
    // Dynamic color based on column value
    let fillColor = color;
    if (colorColumn && colorScale) {
      const value = feature.get(colorColumn);
      const index = Math.abs(hashCode(String(value))) % colorScale.length;
      fillColor = colorScale[index];
    }

    // Dynamic size based on column value
    let radius = size;
    if (sizeColumn) {
      const value = parseFloat(feature.get(sizeColumn));
      if (!isNaN(value)) {
        // Scale between min and max size
        radius = Math.min(Math.max(value, 5), 30);
      }
    }

    // Apply opacity to color
    const rgbaColor = hexToRgba(fillColor, opacity);

    return new Style({
      image: new Circle({
        radius,
        fill: new Fill({ color: rgbaColor }),
        stroke: new Stroke({
          color: strokeColor,
          width: strokeWidth,
        }),
      }),
      fill: new Fill({ color: rgbaColor }),
      stroke: new Stroke({
        color: strokeColor,
        width: strokeWidth,
      }),
    });
  };
}

/**
 * Creates a heatmap style for point density visualization
 */
export function createHeatmapStyle(config: {
  radius?: number;
  blur?: number;
  gradient?: string[];
}): Style {
  // Heatmap styling would be handled by a separate Heatmap layer
  // This is a placeholder for consistent API
  return new Style({
    image: new Circle({
      radius: config.radius || 15,
      fill: new Fill({ color: 'rgba(255, 0, 0, 0.5)' }),
    }),
  });
}

/**
 * Creates label style for features
 */
export function createLabelStyle(
  labelColumn: string,
  config: {
    fontSize?: number;
    fontColor?: string;
    offsetY?: number;
  } = {},
): (feature: Feature) => Style {
  const {
    fontSize = 12,
    fontColor = '#000000',
    offsetY = -20,
  } = config;

  const formatter = getNumberFormatter();

  return (feature: Feature) => {
    const value = feature.get(labelColumn);
    let text = '';
    
    if (value !== null && value !== undefined) {
      text = typeof value === 'number' ? formatter(value) : String(value);
    }

    return new Style({
      text: new Text({
        text,
        font: `${fontSize}px sans-serif`,
        fill: new Fill({ color: fontColor }),
        stroke: new Stroke({
          color: '#ffffff',
          width: 3,
        }),
        offsetY,
        textAlign: 'center',
      }),
    });
  };
}

/**
 * Helper function to convert hex color to rgba
 */
function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
}

/**
 * Simple hash function for consistent color assignment
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}