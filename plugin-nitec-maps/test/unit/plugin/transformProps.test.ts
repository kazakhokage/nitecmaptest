
import { ChartProps } from '@superset-ui/core';
import transformProps from '../../../src/plugin/transformProps';

describe('transformProps', () => {
  const mockFormData = {
    layers: [
      {
        id: 'layer1',
        name: 'Test Layer',
        type: 'vector' as const,
        visible: true,
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

  const mockQueryData = {
    data: [
      { lat: 40.7128, lon: -74.0060, name: 'Location 1', value: 100 },
      { lat: 40.7580, lon: -73.9855, name: 'Location 2', value: 200 },
    ],
    colnames: ['lat', 'lon', 'name', 'value'],
    coltypes: [2, 2, 1, 2], // numeric, numeric, string, numeric
  };

  const createMockChartProps = (overrides = {}): ChartProps => ({
    width: 800,
    height: 600,
    formData: mockFormData,
    queriesData: [mockQueryData],
    hooks: {
      onContextMenu: jest.fn(),
      setControlValue: jest.fn(),
      setDataMask: jest.fn(),
      onFilterMenuOpen: jest.fn(),
      onFilterMenuClose: jest.fn(),
    },
    ...overrides,
  });

  it('should transform basic chart props correctly', () => {
    const chartProps = createMockChartProps();
    const result = transformProps(chartProps);

    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
    expect(result.formData).toEqual(mockFormData);
    expect(result.queriesData).toHaveLength(1);
    expect(result.queriesData[0].data).toHaveLength(2);
    expect(result.setDataMask).toBeDefined();
    expect(result.onContextMenu).toBeDefined();
  });

  it('should handle missing hooks gracefully', () => {
    const chartProps = createMockChartProps({ hooks: {} });
    const result = transformProps(chartProps);

    expect(result.setDataMask).toBeDefined();
    expect(result.onContextMenu).toBeDefined();
    expect(result.onFilterMenuOpen).toBeDefined();
    expect(result.onFilterMenuClose).toBeDefined();
    expect(result.setControlValue).toBeDefined();
  });

  it('should handle empty queries data', () => {
    const chartProps = createMockChartProps({
      queriesData: [{ data: [], colnames: [], coltypes: [] }],
    });
    const result = transformProps(chartProps);

    expect(result.queriesData[0].data).toEqual([]);
    expect(result.queriesData[0].colnames).toEqual([]);
    expect(result.queriesData[0].coltypes).toEqual([]);
  });

  it('should handle array queriesData format', () => {
    const chartProps = createMockChartProps({
      queriesData: [[mockQueryData]],
    });
    const result = transformProps(chartProps);

    expect(result.queriesData).toHaveLength(1);
    expect(result.queriesData[0].data).toHaveLength(2);
  });

  it('should handle missing data in queries', () => {
    const chartProps = createMockChartProps({
      queriesData: [{ error: 'Query failed' }],
    });
    const result = transformProps(chartProps);

    expect(result.queriesData[0].data).toEqual([]);
    expect(result.queriesData[0].error).toBe('Query failed');
  });

  it('should preserve all form data fields', () => {
    const customFormData = {
      ...mockFormData,
      customField: 'test',
      anotherField: 123,
    };
    const chartProps = createMockChartProps({ formData: customFormData });
    const result = transformProps(chartProps);

    expect(result.formData).toEqual(customFormData);
  });

  it('should handle multiple queries data', () => {
    const secondQueryData = {
      data: [{ lat: 41, lon: -73, name: 'Location 3', value: 300 }],
      colnames: ['lat', 'lon', 'name', 'value'],
      coltypes: [2, 2, 1, 2],
    };

    const chartProps = createMockChartProps({
      queriesData: [mockQueryData, secondQueryData],
    });
    const result = transformProps(chartProps);

    expect(result.queriesData).toHaveLength(2);
    expect(result.queriesData[0].data).toHaveLength(2);
    expect(result.queriesData[1].data).toHaveLength(1);
  });
});