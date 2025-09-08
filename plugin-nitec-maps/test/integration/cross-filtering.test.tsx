
import { render, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, supersetTheme } from '@superset-ui/core';
import NitecMaps from '../../src/NitecMaps';
import { NitecMapsProps } from '../../src/types';

// This integration test focuses on cross-filtering functionality
describe('NitecMaps Cross-Filtering Integration', () => {
  const mockSetDataMask = jest.fn();

  const createProps = (overrides = {}): NitecMapsProps => ({
    formData: {
      layers: [
        {
          id: 'layer1',
          name: 'Test Layer',
          type: 'vector',
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
      enableCrossFilter: true,
    },
    width: 800,
    height: 600,
    queriesData: [
      {
        data: [
          { lat: 40.7128, lon: -74.0060, name: 'Location 1', value: 100, id: 1 },
          { lat: 40.7580, lon: -73.9855, name: 'Location 2', value: 200, id: 2 },
        ],
        colnames: ['lat', 'lon', 'name', 'value', 'id'],
        coltypes: [2, 2, 1, 2, 2],
      },
    ],
    setDataMask: mockSetDataMask,
    onContextMenu: jest.fn(),
    onFilterMenuOpen: jest.fn(),
    onFilterMenuClose: jest.fn(),
    setControlValue: jest.fn(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock OpenLayers map interaction
    const mockSelect = {
      on: jest.fn((event, handler) => {
        if (event === 'select') {
          // Simulate selection after a delay
          setTimeout(() => {
            handler({
              selected: [
                {
                  getProperties: () => ({ id: 1, name: 'Location 1', value: 100 }),
                },
              ],
            });
          }, 100);
        }
      }),
    };

    require('ol/interaction').Select.mockImplementation(() => mockSelect);
  });

  it('should emit cross-filter data when feature is selected', async () => {
    render(
      <ThemeProvider theme={supersetTheme}>
        <NitecMaps {...createProps()} />
      </ThemeProvider>
    );

    // Wait for cross-filter event
    await waitFor(() => {
      expect(mockSetDataMask).toHaveBeenCalled();
    });

    expect(mockSetDataMask).toHaveBeenCalledWith({
      extraFormData: {
        filters: [{ id: 1, name: 'Location 1', value: 100 }],
      },
      filterState: {
        value: [{ id: 1, name: 'Location 1', value: 100 }],
      },
    });
  });

  it('should not emit cross-filter when disabled', async () => {
    const props = createProps({
      formData: {
        ...createProps().formData,
        enableCrossFilter: false,
      },
    });

    render(
      <ThemeProvider theme={supersetTheme}>
        <NitecMaps {...props} />
      </ThemeProvider>
    );

    // Wait to ensure no cross-filter is emitted
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(mockSetDataMask).not.toHaveBeenCalled();
  });

  it('should handle multi-select when enabled', async () => {
    const mockMultiSelect = {
      on: jest.fn((event, handler) => {
        if (event === 'select') {
          setTimeout(() => {
            handler({
              selected: [
                { getProperties: () => ({ id: 1, name: 'Location 1' }) },
                { getProperties: () => ({ id: 2, name: 'Location 2' }) },
              ],
            });
          }, 100);
        }
      }),
    };

    require('ol/interaction').Select.mockImplementation(() => mockMultiSelect);

    render(
      <ThemeProvider theme={supersetTheme}>
        <NitecMaps {...createProps()} />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(mockSetDataMask).toHaveBeenCalledWith({
        extraFormData: {
          filters: [
            { id: 1, name: 'Location 1' },
            { id: 2, name: 'Location 2' },
          ],
        },
        filterState: {
          value: [
            { id: 1, name: 'Location 1' },
            { id: 2, name: 'Location 2' },
          ],
        },
      });
    });
  });

  it('should clear filters when no features selected', async () => {
    const mockClearSelect = {
      on: jest.fn((event, handler) => {
        if (event === 'select') {
          setTimeout(() => {
            handler({ selected: [] });
          }, 100);
        }
      }),
    };

    require('ol/interaction').Select.mockImplementation(() => mockClearSelect);

    render(
      <ThemeProvider theme={supersetTheme}>
        <NitecMaps {...createProps()} />
      </ThemeProvider>
    );

    // Should not call setDataMask when no features selected
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(mockSetDataMask).not.toHaveBeenCalled();
  });
});