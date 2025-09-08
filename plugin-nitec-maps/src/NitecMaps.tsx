
import { useEffect, useRef, useState } from 'react';
import { styled } from '@superset-ui/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Select as SelectInteraction } from 'ol/interaction';
import { click } from 'ol/events/condition';
import Overlay from 'ol/Overlay';
import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css';

import LayerPanel from './components/LayerPanel';
import MapContainer from './components/MapContainer';
import { createLayerFromConfig } from './utils/layerFactory';
import { NitecMapsProps, LayerState, LayerConfig } from './types';

const StyledContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const MapWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const TooltipContainer = styled.div`
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
  pointer-events: none;
  max-width: 250px;
  position: absolute;
  z-index: 1000;
  display: none;
  line-height: 1.5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  div {
    margin: 2px 0;
  }
  
  strong {
    color: #40a9ff;
    font-weight: 600;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid rgba(0, 0, 0, 0.9);
  }
`;

export default function NitecMaps({
  formData,
  width,
  height,
  queriesData = [],
  setDataMask,
  onContextMenu,
}: NitecMapsProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<Overlay | null>(null);
  
  const [layers, setLayers] = useState<LayerState[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([
          formData.centerLon || 0,
          formData.centerLat || 0,
        ]),
        zoom: formData.zoom || 4,
      }),
    });

    // Wait for next tick to ensure tooltip element is in DOM
    setTimeout(() => {
      if (tooltipRef.current) {
        // Create tooltip overlay
        const tooltipOverlay = new Overlay({
          element: tooltipRef.current,
          positioning: 'bottom-center',
          offset: [0, -15],
          stopEvent: false,
        });
        map.addOverlay(tooltipOverlay);
        overlayRef.current = tooltipOverlay;
      }
    }, 0);

    // Add select interaction
    const select = new SelectInteraction({
      condition: click,
      multi: formData.enableCrossFilter,
    });

    select.on('select', (e) => {
      const features = e.selected;
      // setSelectedFeatures(features);
      
      if (formData.enableCrossFilter && features.length > 0) {
        // Extract filter values from selected features
        const filters = features.map(f => f.getProperties());
        setDataMask({
          extraFormData: {
            filters,
          },
          filterState: {
            value: filters,
          },
        });
      }
    });

    map.addInteraction(select);

    // Add hover interaction
    map.on('pointermove', (e) => {
      const features = map.getFeaturesAtPixel(e.pixel);
      
      // Change cursor on hover
      map.getTargetElement().style.cursor = features && features.length > 0 ? 'pointer' : '';
      
      if (features && features.length > 0) {
        const feature = features[0];
        const properties = feature.getProperties();
        
        console.log('Hover over feature:', properties); // Debug log
        
        // Build tooltip content
        let tooltipContent = '';
        if (formData.tooltipColumns && formData.tooltipColumns.length > 0) {
          tooltipContent = formData.tooltipColumns
            .map(col => `<div><strong>${col}:</strong> ${properties[col] || 'N/A'}</div>`)
            .join('');
        } else {
          // Show all properties if no specific columns selected
          tooltipContent = Object.entries(properties)
            .filter(([key]) => key !== 'geometry')
            .slice(0, 5) // Limit to first 5 properties
            .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
            .join('');
        }
        
        if (tooltipRef.current && tooltipContent && overlayRef.current) {
          tooltipRef.current.innerHTML = tooltipContent;
          tooltipRef.current.style.display = 'block';
          overlayRef.current.setPosition(e.coordinate);
        }
      } else {
        if (tooltipRef.current) {
          tooltipRef.current.style.display = 'none';
        }
        if (overlayRef.current) {
          overlayRef.current.setPosition(undefined);
        }
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  // Update layers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    
    // Remove existing layers (except base layer)
    map.getLayers().getArray()
      .filter(layer => layer instanceof VectorLayer)
      .forEach(layer => map.removeLayer(layer));

    // Create new layers from config
    const newLayers: LayerState[] = [];
    
    // Parse layers if it's a string
    let parsedLayers: LayerConfig[] = [];
    if (typeof formData.layers === 'string') {
      try {
        // Trim the string to remove any extra whitespace
        let trimmedLayers = formData.layers.trim();
        console.log('NitecMaps parsing layers string:', trimmedLayers);
        console.log('String length:', trimmedLayers.length);
        
        // Handle case where multiple JSON arrays are concatenated
        // This can happen due to a bug in TextAreaControl
        const match = trimmedLayers.match(/^\[[\s\S]*?\](?=\[|$)/);
        if (match) {
          trimmedLayers = match[0];
          console.log('Extracted first JSON array, new length:', trimmedLayers.length);
        }
        
        parsedLayers = JSON.parse(trimmedLayers);
      } catch (e) {
        console.error('Error parsing layers JSON:', e);
        console.error('Raw layers value:', formData.layers);
        parsedLayers = [];
      }
    } else if (Array.isArray(formData.layers)) {
      parsedLayers = formData.layers;
    }
    
    console.log('NitecMaps: Processing layers:', parsedLayers);
    console.log('NitecMaps: Available data:', queriesData[0]?.data?.length, 'rows');
    
    // Process configured layers
    parsedLayers.forEach((layerConfig, index) => {
      console.log(`Processing layer ${layerConfig.id}:`, layerConfig);
      
      // Для векторных слоев нужны данные
      if (layerConfig.type === 'vector') {
        // Если datasource не указан - используем основные данные
        if (!layerConfig.datasource_id && !layerConfig.datasource_name) {
          const data = queriesData[0]?.data || [];
          console.log(`Layer ${layerConfig.id} using main data:`, data.length, 'rows');
          
          const { layer, source } = createLayerFromConfig(
            layerConfig,
            data,
            {
              ...formData,
              // Используем настройки колонок из слоя
              latitudeColumn: layerConfig.latitudeColumn || formData.latitudeColumn,
              longitudeColumn: layerConfig.longitudeColumn || formData.longitudeColumn,
              geometryColumn: layerConfig.geometryColumn || formData.geometryColumn,
              tooltipColumns: layerConfig.tooltipColumns || formData.tooltipColumns,
            },
          );

          if (layer) {
            layer.set('id', layerConfig.id);
            layer.setZIndex(layerConfig.zIndex || index + 1);
            layer.setVisible(layerConfig.visible);
            map.addLayer(layer);
            
            newLayers.push({
              id: layerConfig.id,
              visible: layerConfig.visible,
              source,
              features: source.getFeatures ? source.getFeatures() : undefined,
            });
          }
        } else {
          // TODO: Загрузка данных из другого datasource
          const datasourceInfo = layerConfig.datasource_name || layerConfig.datasource_id;
          console.log(`Layer ${layerConfig.id} requires separate datasource: ${datasourceInfo}`);
        }
      } else {
        // Для WMS и GeoJSON слоев данные не нужны
        const { layer, source } = createLayerFromConfig(
          layerConfig,
          [],
          formData,
        );

        if (layer) {
          layer.set('id', layerConfig.id);
          layer.setZIndex(layerConfig.zIndex || index + 1);
          layer.setVisible(layerConfig.visible);
          map.addLayer(layer);
          
          newLayers.push({
            id: layerConfig.id,
            visible: layerConfig.visible,
            source,
          });
        }
      }
    });

    setLayers(newLayers);
  }, [formData, queriesData]);

  const toggleLayerVisibility = (layerId: string) => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const layers = map.getLayers().getArray();
    
    layers.forEach((layer) => {
      if (layer.get('id') === layerId) {
        const visible = !layer.getVisible();
        layer.setVisible(visible);
        
        setLayers(prev => prev.map(l => 
          l.id === layerId ? { ...l, visible } : l
        ));
      }
    });
  };

  // Parse layers to check configuration
  let parsedLayers: LayerConfig[] = [];
  if (typeof formData.layers === 'string') {
    try {
      let trimmedLayers = formData.layers.trim();
      
      // Handle case where multiple JSON arrays are concatenated
      const match = trimmedLayers.match(/^\[[\s\S]*?\](?=\[|$)/);
      if (match) {
        trimmedLayers = match[0];
      }
      
      parsedLayers = JSON.parse(trimmedLayers);
    } catch (e) {
      parsedLayers = [];
    }
  } else if (Array.isArray(formData.layers)) {
    parsedLayers = formData.layers;
  }
  
  // Check for errors
  const hasError = queriesData && queriesData[0]?.error;
  const hasNoLayers = parsedLayers.length === 0;

  if (hasError) {
    return (
      <StyledContainer>
        <div style={{ padding: 20, textAlign: 'center' }}>
          <h3>Error loading data</h3>
          <p>{queriesData[0].error}</p>
        </div>
      </StyledContainer>
    );
  }

  if (hasNoLayers) {
    return (
      <StyledContainer>
        <div style={{ padding: 20, textAlign: 'center' }}>
          <h3>No Layers Configured</h3>
          <p>Please configure layers in the Customize tab.</p>
        </div>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <MapWrapper>
        <MapContainer ref={mapRef} width={width} height={height} />
        <TooltipContainer ref={tooltipRef} />
        {formData.showLayerPanel && layers.length > 0 && (
          <LayerPanel
            layers={layers}
            onToggleVisibility={toggleLayerVisibility}
          />
        )}
      </MapWrapper>
    </StyledContainer>
  );
}