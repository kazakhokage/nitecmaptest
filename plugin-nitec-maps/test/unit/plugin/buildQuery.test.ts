
import { buildQueryContext } from '@superset-ui/core';
import buildQuery from '../../../src/plugin/buildQuery';
import { NitecMapsFormData } from '../../../src/types';

describe('buildQuery', () => {
  const mockFormData: NitecMapsFormData = {
    layers: [
      {
        id: 'layer1',
        name: 'Test Layer',
        type: 'vector',
        visible: true,
        datasource: '1__table',
      },
    ],
    latitudeColumn: 'lat',
    longitudeColumn: 'lon',
    tooltipColumns: ['name', 'value'],
    centerLat: 40.7128,
    centerLon: -74.0060,
    zoom: 10,
    showLayerPanel: true,
    enableCrossFilter: false,
  };

  it('should build a query context for single layer', () => {
    const queryContext = buildQuery(mockFormData);

    expect(queryContext.queries).toHaveLength(1);
    expect(queryContext.queries[0]).toMatchObject({
      columns: expect.arrayContaining(['lat', 'lon', 'name', 'value']),
      orderby: [],
      row_limit: 10000,
    });
  });

  it('should include geometry column when specified', () => {
    const formDataWithGeometry: NitecMapsFormData = {
      ...mockFormData,
      geometryColumn: 'geom',
    };

    const queryContext = buildQuery(formDataWithGeometry);

    expect(queryContext.queries[0].columns).toContain('geom');
  });

  it('should build query for first layer with datasource', () => {
    const multiLayerFormData: NitecMapsFormData = {
      ...mockFormData,
      layers: [
        {
          id: 'layer1',
          name: 'Layer 1',
          type: 'vector',
          visible: true,
          datasource: '1__table',
        },
        {
          id: 'layer2',
          name: 'Layer 2',
          type: 'vector',
          visible: true,
          datasource: '2__table',
        },
      ],
    };

    const queryContext = buildQuery(multiLayerFormData);

    // The function returns only the first layer's query
    expect(queryContext.queries).toHaveLength(1);
    expect(queryContext.datasource).toBe('1__table');
  });

  it('should skip non-vector layers', () => {
    const mixedLayerFormData: NitecMapsFormData = {
      ...mockFormData,
      layers: [
        {
          id: 'layer1',
          name: 'Vector Layer',
          type: 'vector',
          visible: true,
          datasource: '1__table',
        },
        {
          id: 'layer2',
          name: 'WMS Layer',
          type: 'wms',
          visible: true,
          wmsParams: {
            url: 'https://example.com/wms',
            layers: 'test',
          },
        },
        {
          id: 'layer3',
          name: 'GeoJSON Layer',
          type: 'geojson',
          visible: true,
          geojsonData: {},
        },
      ],
    };

    const queryContext = buildQuery(mixedLayerFormData);

    expect(queryContext.queries).toHaveLength(1);
    expect(queryContext.queries[0].columns).toEqual(
      expect.arrayContaining(['lat', 'lon', 'name', 'value'])
    );
  });

  it('should handle empty tooltip columns', () => {
    const formDataNoTooltips: NitecMapsFormData = {
      ...mockFormData,
      tooltipColumns: [],
    };

    const queryContext = buildQuery(formDataNoTooltips);

    expect(queryContext.queries[0].columns).toEqual(['lat', 'lon']);
  });

  it('should include duplicate columns if specified', () => {
    const formDataDuplicates: NitecMapsFormData = {
      ...mockFormData,
      tooltipColumns: ['lat', 'lon', 'name', 'lat'],
    };

    const queryContext = buildQuery(formDataDuplicates);
    const columns = queryContext.queries[0].columns as string[];

    // Currently, the implementation doesn't deduplicate columns
    expect(columns).toEqual(['lat', 'lon', 'lat', 'lon', 'name', 'lat']);
  });

  it('should handle missing lat/lon columns', () => {
    const formDataNoLatLon: NitecMapsFormData = {
      ...mockFormData,
      latitudeColumn: undefined,
      longitudeColumn: undefined,
      geometryColumn: 'geom',
    };

    const queryContext = buildQuery(formDataNoLatLon);

    expect(queryContext.queries[0].columns).toContain('geom');
    expect(queryContext.queries[0].columns).toContain('name');
    expect(queryContext.queries[0].columns).toContain('value');
  });

  it('should apply custom row limit', () => {
    const formDataWithLimit: NitecMapsFormData = {
      ...mockFormData,
      row_limit: 5000,
    };

    const queryContext = buildQuery(formDataWithLimit);

    expect(queryContext.queries[0].row_limit).toBe(5000);
  });

  it('should handle layers without datasource', () => {
    const formDataNoDatasource: NitecMapsFormData = {
      ...mockFormData,
      layers: [
        {
          id: 'layer1',
          name: 'No Datasource',
          type: 'vector',
          visible: true,
        },
      ],
    };

    const queryContext = buildQuery(formDataNoDatasource);

    expect(queryContext.queries).toHaveLength(1);
  });

  it('should preserve other query properties', () => {
    const formDataWithExtras: NitecMapsFormData = {
      ...mockFormData,
      time_range: 'Last week',
      filters: [{ col: 'status', op: '==', val: 'active' }],
    };

    const queryContext = buildQuery(formDataWithExtras);

    expect(queryContext.queries[0]).toMatchObject({
      time_range: 'Last week',
      filters: [{ col: 'status', op: '==', val: 'active' }],
    });
  });
});