
import { buildQueryContext } from '@superset-ui/core';
import { NitecMapsFormData, LayerConfig } from '../types';

export default function buildQuery(formData: NitecMapsFormData) {
  // Parse layers if it's a string
  let parsedLayers: LayerConfig[] = [];
  if (typeof formData.layers === 'string') {
    try {
      // Trim the string to remove any extra whitespace
      let trimmedLayers = formData.layers.trim();
      console.log('Parsing layers string:', trimmedLayers);
      console.log('String length:', trimmedLayers.length);
      console.log('First 100 chars:', trimmedLayers.substring(0, 100));
      console.log('Last 100 chars:', trimmedLayers.substring(trimmedLayers.length - 100));
      
      // Handle case where multiple JSON arrays are concatenated
      // This can happen due to a bug in TextAreaControl
      const match = trimmedLayers.match(/^\[[\s\S]*?\](?=\[|$)/);
      if (match) {
        trimmedLayers = match[0];
        console.log('Extracted first JSON array, new length:', trimmedLayers.length);
      }
      
      parsedLayers = JSON.parse(trimmedLayers);
    } catch (e) {
      console.error('Error parsing layers JSON in buildQuery:', e);
      console.error('Raw layers value:', formData.layers);
      parsedLayers = [];
    }
  } else if (Array.isArray(formData.layers)) {
    parsedLayers = formData.layers;
  }
  
  console.log('NitecMaps buildQuery - formData:', formData);
  console.log('NitecMaps buildQuery - parsed layers:', parsedLayers);
  
  // Найти главный векторный слой, который использует основной датасорс
  const mainVectorLayer = parsedLayers.find(layer => 
    layer.type === 'vector' && 
    (!layer.datasource_id && !layer.datasource_name) // Слой без указания datasource использует основной
  );
  
  // Если есть главный векторный слой, используем его настройки колонок
  if (mainVectorLayer) {
    const columns = [
      ...(mainVectorLayer.latitudeColumn ? [mainVectorLayer.latitudeColumn] : []),
      ...(mainVectorLayer.longitudeColumn ? [mainVectorLayer.longitudeColumn] : []),
      ...(mainVectorLayer.geometryColumn ? [mainVectorLayer.geometryColumn] : []),
      ...(mainVectorLayer.tooltipColumns || []),
    ].filter(Boolean);

    const queryFormData = {
      ...formData,
      columns: columns.length > 0 ? columns : formData.columns || [],
    };

    console.log('NitecMaps buildQuery - using layer columns:', queryFormData.columns);

    return buildQueryContext(queryFormData, {
      queryFields: {
        columns: 'columns',
        metrics: 'metrics',
      },
    });
  }
  
  // Если нет слоев с основным датасорсом, создаем пустой запрос
  // (данные будут загружаться через отдельные API запросы для каждого слоя)
  console.log('NitecMaps buildQuery - no main vector layer, returning minimal query');
  
  return buildQueryContext(formData, {
    queryFields: {
      columns: 'columns',
      metrics: 'metrics',
    },
  });
}