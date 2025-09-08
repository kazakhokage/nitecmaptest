
import VectorLayer from 'ol/layer/Vector';
import TileLayer from 'ol/layer/Tile';
import VectorSource from 'ol/source/Vector';
import TileWMS from 'ol/source/TileWMS';
import { DataRecord } from '@superset-ui/core';
import { createLayerFromConfig } from '../../../src/utils/layerFactory';
import { LayerConfig, NitecMapsFormData } from '../../../src/types';

// Mock OpenLayers modules
jest.mock('ol/layer/Vector');
jest.mock('ol/layer/Tile');
jest.mock('ol/source/Vector');
jest.mock('ol/source/TileWMS');
jest.mock('ol/format/GeoJSON');
jest.mock('ol/Feature');
jest.mock('ol/geom/Point');
jest.mock('ol/proj', () => ({
  fromLonLat: jest.fn((coords) => coords),
}));
jest.mock('ol/style', () => ({
  Style: jest.fn(),
  Fill: jest.fn(),
  Stroke: jest.fn(),
  Circle: jest.fn(),
  Icon: jest.fn(),
}));

describe('layerFactory', () => {
  const mockFormData: NitecMapsFormData = {
    layers: [],
    latitudeColumn: 'lat',
    longitudeColumn: 'lon',
    tooltipColumns: ['name', 'value'],
    centerLat: 0,
    centerLon: 0,
    zoom: 4,
    showLayerPanel: true,
    enableCrossFilter: false,
  };

  const mockData: DataRecord[] = [
    { lat: 40.7128, lon: -74.0060, name: 'New York', value: 100 },
    { lat: 51.5074, lon: -0.1278, name: 'London', value: 200 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createLayerFromConfig', () => {
    it('should create a vector layer with point features', () => {
      const layerConfig: LayerConfig = {
        id: 'points',
        name: 'Points Layer',
        type: 'vector',
        visible: true,
        style: {
          type: 'circle',
          fillColor: '#007bff',
          radius: 8,
        },
      };

      const { layer, source } = createLayerFromConfig(
        layerConfig,
        mockData,
        mockFormData,
      );

      expect(layer).toBeInstanceOf(VectorLayer);
      expect(source).toBeInstanceOf(VectorSource);
      expect((layer as any).set).toHaveBeenCalledWith('id', 'points');
    });

    it('should create a WMS layer', () => {
      const layerConfig: LayerConfig = {
        id: 'wms',
        name: 'WMS Layer',
        type: 'wms',
        visible: true,
        wmsParams: {
          url: 'https://example.com/wms',
          layers: 'test:layer',
          params: {
            FORMAT: 'image/png',
            TRANSPARENT: true,
          },
        },
      };

      const { layer, source } = createLayerFromConfig(
        layerConfig,
        [],
        mockFormData,
      );

      expect(layer).toBeInstanceOf(TileLayer);
      expect(source).toBeInstanceOf(TileWMS);
      expect((layer as any).set).toHaveBeenCalledWith('id', 'wms');
    });

    it('should create a GeoJSON layer', () => {
      const layerConfig: LayerConfig = {
        id: 'geojson',
        name: 'GeoJSON Layer',
        type: 'geojson',
        visible: true,
        geojsonData: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [-74.0060, 40.7128],
              },
              properties: {
                name: 'Test Point',
              },
            },
          ],
        },
      };

      const { layer, source } = createLayerFromConfig(
        layerConfig,
        [],
        mockFormData,
      );

      expect(layer).toBeInstanceOf(VectorLayer);
      expect(source).toBeInstanceOf(VectorSource);
    });

    it('should handle geometry column data', () => {
      const formDataWithGeom: NitecMapsFormData = {
        ...mockFormData,
        geometryColumn: 'geom',
      };

      const dataWithGeom: DataRecord[] = [
        {
          geom: JSON.stringify({
            type: 'Point',
            coordinates: [-74.0060, 40.7128],
          }),
          name: 'Geometry Point',
        },
      ];

      const layerConfig: LayerConfig = {
        id: 'geom',
        name: 'Geometry Layer',
        type: 'vector',
        visible: true,
      };

      const { layer, source } = createLayerFromConfig(
        layerConfig,
        dataWithGeom,
        formDataWithGeom,
      );

      expect(layer).toBeInstanceOf(VectorLayer);
      expect(source).toBeInstanceOf(VectorSource);
    });

    it('should apply custom styles', () => {
      const layerConfig: LayerConfig = {
        id: 'styled',
        name: 'Styled Layer',
        type: 'vector',
        visible: true,
        style: {
          type: 'icon',
          iconUrl: 'https://example.com/icon.png',
          iconScale: 0.5,
        },
      };

      const { layer } = createLayerFromConfig(
        layerConfig,
        mockData,
        mockFormData,
      );

      expect(layer).toBeInstanceOf(VectorLayer);
    });

    it('should handle invalid coordinates gracefully', () => {
      const invalidData: DataRecord[] = [
        { lat: 'invalid', lon: -74.0060, name: 'Invalid Lat' },
        { lat: 40.7128, lon: null, name: 'Null Lon' },
        { lat: null, lon: null, name: 'Both Null' },
      ];

      const layerConfig: LayerConfig = {
        id: 'invalid',
        name: 'Invalid Data Layer',
        type: 'vector',
        visible: true,
      };

      const { layer, source } = createLayerFromConfig(
        layerConfig,
        invalidData,
        mockFormData,
      );

      expect(layer).toBeInstanceOf(VectorLayer);
      expect(source).toBeInstanceOf(VectorSource);
    });

    it('should return null for unknown layer type', () => {
      const layerConfig: LayerConfig = {
        id: 'unknown',
        name: 'Unknown Layer',
        type: 'unknown' as any,
        visible: true,
      };

      const { layer, source } = createLayerFromConfig(
        layerConfig,
        mockData,
        mockFormData,
      );

      expect(layer).toBeNull();
      expect(source).toBeNull();
    });

    it('should handle polygon style configuration', () => {
      const layerConfig: LayerConfig = {
        id: 'polygon',
        name: 'Polygon Layer',
        type: 'vector',
        visible: true,
        style: {
          fillColor: 'rgba(0, 123, 255, 0.3)',
          strokeColor: '#007bff',
          strokeWidth: 2,
        },
      };

      const { layer } = createLayerFromConfig(
        layerConfig,
        mockData,
        mockFormData,
      );

      expect(layer).toBeInstanceOf(VectorLayer);
    });

    it('should handle missing style configuration', () => {
      const layerConfig: LayerConfig = {
        id: 'nostyler',
        name: 'No Style Layer',
        type: 'vector',
        visible: true,
      };

      const { layer } = createLayerFromConfig(
        layerConfig,
        mockData,
        mockFormData,
      );

      expect(layer).toBeInstanceOf(VectorLayer);
    });

    it('should parse GeoJSON geometry objects correctly', () => {
      const dataWithGeoJSONObject: DataRecord[] = [
        {
          geom: {
            type: 'LineString',
            coordinates: [
              [-74.0060, 40.7128],
              [-73.9855, 40.7580],
            ],
          },
          name: 'Line Feature',
        },
      ];

      const formDataWithGeom: NitecMapsFormData = {
        ...mockFormData,
        geometryColumn: 'geom',
      };

      const layerConfig: LayerConfig = {
        id: 'geojsonobj',
        name: 'GeoJSON Object Layer',
        type: 'vector',
        visible: true,
      };

      const { layer, source } = createLayerFromConfig(
        layerConfig,
        dataWithGeoJSONObject,
        formDataWithGeom,
      );

      expect(layer).toBeInstanceOf(VectorLayer);
      expect(source).toBeInstanceOf(VectorSource);
    });
  });
});