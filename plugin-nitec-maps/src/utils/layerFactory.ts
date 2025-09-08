
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Style, Fill, Stroke, Circle, Icon } from 'ol/style';
import { DataRecord } from '@superset-ui/core';

import { LayerConfig, StyleConfig, NitecMapsFormData } from '../types';

function createStyleFromConfig(styleConfig?: StyleConfig): Style {
  if (!styleConfig) {
    return new Style({
      fill: new Fill({
        color: 'rgba(0, 123, 255, 0.3)',
      }),
      stroke: new Stroke({
        color: '#007bff',
        width: 2,
      }),
      image: new Circle({
        radius: 6,
        fill: new Fill({
          color: '#007bff',
        }),
        stroke: new Stroke({
          color: '#ffffff',
          width: 2,
        }),
      }),
    });
  }

  const style: any = {};

  // Обработка заливки
  if (styleConfig.fillColor) {
    const opacity = styleConfig.fillOpacity ?? styleConfig.opacity ?? 1;
    style.fill = new Fill({
      color: addOpacityToColor(styleConfig.fillColor, opacity),
    });
  }

  // Обработка обводки
  if (styleConfig.strokeColor || styleConfig.weight || styleConfig.strokeWidth) {
    style.stroke = new Stroke({
      color: styleConfig.strokeColor || styleConfig.color || '#000000',
      width: styleConfig.weight || styleConfig.strokeWidth || 2,
    });
  }

  // Обработка изображения (точки, иконки)
  if (styleConfig.type === 'icon' && styleConfig.iconUrl) {
    style.image = new Icon({
      src: styleConfig.iconUrl,
      scale: styleConfig.iconScale || 1,
    });
  } else {
    // По умолчанию круг для точек
    const radius = styleConfig.size || styleConfig.radius || 6;
    const fillColor = styleConfig.color || styleConfig.fillColor || '#007bff';
    const opacity = styleConfig.opacity ?? 0.8;
    
    style.image = new Circle({
      radius: radius,
      fill: new Fill({
        color: addOpacityToColor(fillColor, opacity),
      }),
      stroke: new Stroke({
        color: styleConfig.strokeColor || '#ffffff',
        width: styleConfig.strokeWidth || 2,
      }),
    });
  }

  return new Style(style);
}

// Вспомогательная функция для добавления прозрачности к цвету
function addOpacityToColor(color: string, opacity: number): string {
  if (color.startsWith('rgba')) {
    return color;
  }
  
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }
  
  // Для hex цветов
  if (color.startsWith('#')) {
    // Проверяем формат hex цвета
    let hex = color.slice(1);
    
    // Поддержка короткого формата (#RGB -> #RRGGBB)
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    // Проверяем, что hex имеет правильную длину
    if (hex.length !== 6) {
      console.error('Invalid hex color:', color);
      return `rgba(0, 0, 0, ${opacity})`; // Возвращаем черный цвет по умолчанию
    }
    
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    // Проверяем, что значения валидны
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      console.error('Invalid hex color values:', color, { r, g, b });
      return `rgba(0, 0, 0, ${opacity})`; // Возвращаем черный цвет по умолчанию
    }
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // Если цвет не распознан, возвращаем его как есть
  return color;
}

function createFeaturesFromData(
  data: DataRecord[],
  layerConfig: LayerConfig,
  formData: NitecMapsFormData,
): Feature[] {
  const features: Feature[] = [];

  data.forEach((record) => {
    let geometry;

    if (formData.geometryColumn && record[formData.geometryColumn]) {
      // Parse geometry from WKT or GeoJSON
      try {
        const geomData = record[formData.geometryColumn];
        if (typeof geomData === 'string') {
          // Try to parse as GeoJSON
          const geojson = JSON.parse(geomData);
          geometry = new GeoJSON().readGeometry(geojson, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857',
          });
        } else if (geomData && typeof geomData === 'object' && 'type' in geomData) {
          // Already a GeoJSON geometry object
          geometry = new GeoJSON().readGeometry(geomData, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857',
          });
        }
      } catch (e) {
        console.error('Error parsing geometry:', e);
      }
    } else if (
      formData.latitudeColumn &&
      formData.longitudeColumn &&
      record[formData.latitudeColumn] &&
      record[formData.longitudeColumn]
    ) {
      // Create point from lat/lon
      const latValue = record[formData.latitudeColumn];
      const lonValue = record[formData.longitudeColumn];
      
      if (latValue !== null && lonValue !== null) {
        const lat = parseFloat(String(latValue));
        const lon = parseFloat(String(lonValue));
        
        if (!isNaN(lat) && !isNaN(lon)) {
          geometry = new Point(fromLonLat([lon, lat]));
        }
      }
    }

    if (geometry) {
      const feature = new Feature({
        geometry,
        ...record,
      });
      
      features.push(feature);
    }
  });

  return features;
}

export function createLayerFromConfig(
  layerConfig: LayerConfig,
  data: DataRecord[],
  formData: NitecMapsFormData,
): { layer: VectorLayer | TileLayer | null; source: any } {
  
  if (layerConfig.type === 'wms') {
    // Используем url напрямую или из wmsParams
    const url = layerConfig.url || layerConfig.wmsParams?.url;
    const layers = layerConfig.wmsParams?.layers || layerConfig.wmsParams?.params?.LAYERS;
    
    if (!url || !layers) {
      console.error('WMS layer requires url and layers parameters');
      return { layer: null, source: null };
    }
    
    const source = new TileWMS({
      url: url,
      params: {
        LAYERS: layers,
        ...(layerConfig.wmsParams?.params || {}),
      },
    });

    const opacity = layerConfig.style?.opacity ?? 0.8;
    const layer = new TileLayer({
      source,
      opacity: opacity,
    });
    
    layer.set('id', layerConfig.id);

    return { layer, source };
  }

  if (layerConfig.type === 'geojson') {
    let source;
    
    if (layerConfig.url) {
      // Загрузка GeoJSON из URL
      source = new VectorSource({
        format: new GeoJSON(),
        url: layerConfig.url,
      });
    } else if (layerConfig.geojsonData) {
      // Использование предоставленных данных
      source = new VectorSource({
        features: new GeoJSON().readFeatures(layerConfig.geojsonData, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        }),
      });
    } else {
      source = new VectorSource();
    }

    const layer = new VectorLayer({
      source,
      style: createStyleFromConfig(layerConfig.style),
    });
    
    layer.set('id', layerConfig.id);

    return { layer, source };
  }

  if (layerConfig.type === 'vector') {
    const features = createFeaturesFromData(data, layerConfig, formData);
    const source = new VectorSource({ features });

    const layer = new VectorLayer({
      source,
      style: createStyleFromConfig(layerConfig.style),
    });
    
    layer.set('id', layerConfig.id);

    return { layer, source };
  }

  return { layer: null, source: null };
}
