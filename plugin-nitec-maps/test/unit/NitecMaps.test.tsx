
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, supersetTheme } from '@superset-ui/core';
import NitecMaps from '../../src/NitecMaps';
import { NitecMapsProps } from '../../src/types';

// Mock OpenLayers
jest.mock('ol/Map');
jest.mock('ol/View');
jest.mock('ol/layer/Tile');
jest.mock('ol/layer/Vector');
jest.mock('ol/source/OSM');
jest.mock('ol/proj', () => ({
  fromLonLat: jest.fn((coords) => coords),
}));
jest.mock('ol/interaction', () => ({
  Select: jest.fn(() => ({
    on: jest.fn(),
  })),
}));
jest.mock('ol/events/condition', () => ({
  click: jest.fn(),
}));
jest.mock('ol/Overlay');

// Mock layer factory
jest.mock('../../src/utils/layerFactory', () => ({
  createLayerFromConfig: jest.fn(() => ({
    layer: {
      setZIndex: jest.fn(),
      setVisible: jest.fn(),
      set: jest.fn(),
      get: jest.fn(),
      getVisible: jest.fn(() => true),
    },
    source: {
      getFeatures: jest.fn(() => []),
    },
  })),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={supersetTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('NitecMaps', () => {
  const mockProps: NitecMapsProps = {
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
      enableCrossFilter: false,
    },
    width: 800,
    height: 600,
    queriesData: [
      {
        data: [
          { lat: 40.7128, lon: -74.0060, name: 'Location 1', value: 100 },
          { lat: 40.7580, lon: -73.9855, name: 'Location 2', value: 200 },
        ],
        colnames: ['lat', 'lon', 'name', 'value'],
        coltypes: [2, 2, 1, 2],
      },
    ],
    setDataMask: jest.fn(),
    onContextMenu: jest.fn(),
    onFilterMenuOpen: jest.fn(),
    onFilterMenuClose: jest.fn(),
    setControlValue: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    renderWithTheme(<NitecMaps {...mockProps} />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('should render layer panel when showLayerPanel is true', () => {
    renderWithTheme(<NitecMaps {...mockProps} />);
    expect(screen.getByText('Layers')).toBeInTheDocument();
    expect(screen.getByText('layer1')).toBeInTheDocument();
  });

  it('should not render layer panel when showLayerPanel is false', () => {
    const propsWithoutPanel = {
      ...mockProps,
      formData: {
        ...mockProps.formData,
        showLayerPanel: false,
      },
    };
    renderWithTheme(<NitecMaps {...propsWithoutPanel} />);
    expect(screen.queryByText('Layers')).not.toBeInTheDocument();
  });

  it('should handle layer visibility toggle', async () => {
    renderWithTheme(<NitecMaps {...mockProps} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(checkbox).not.toBeChecked();
    });
  });

  it('should initialize map with correct center and zoom', () => {
    const Map = require('ol/Map').default;
    const View = require('ol/View').default;
    const { fromLonLat } = require('ol/proj');

    renderWithTheme(<NitecMaps {...mockProps} />);

    expect(Map).toHaveBeenCalled();
    expect(View).toHaveBeenCalledWith({
      center: [-74.0060, 40.7128],
      zoom: 10,
    });
    expect(fromLonLat).toHaveBeenCalledWith([-74.0060, 40.7128]);
  });

  it('should handle cross-filtering when enabled', () => {
    const propsWithCrossFilter = {
      ...mockProps,
      formData: {
        ...mockProps.formData,
        enableCrossFilter: true,
      },
    };

    renderWithTheme(<NitecMaps {...propsWithCrossFilter} />);

    // Simulate feature selection
    const Select = require('ol/interaction').Select;
    const selectInstance = Select.mock.results[0].value;
    const selectHandler = selectInstance.on.mock.calls[0][1];

    selectHandler({
      selected: [
        {
          getProperties: () => ({ id: 1, name: 'Feature 1' }),
        },
      ],
    });

    expect(mockProps.setDataMask).toHaveBeenCalledWith({
      extraFormData: {
        filters: [{ id: 1, name: 'Feature 1' }],
      },
      filterState: {
        value: [{ id: 1, name: 'Feature 1' }],
      },
    });
  });

  it('should handle empty queries data', () => {
    const propsWithEmptyData = {
      ...mockProps,
      queriesData: [
        {
          data: [],
          colnames: [],
          coltypes: [],
        },
      ],
    };

    renderWithTheme(<NitecMaps {...propsWithEmptyData} />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('should handle query errors gracefully', () => {
    const propsWithError = {
      ...mockProps,
      queriesData: [
        {
          error: 'Query failed',
          data: [],
          colnames: [],
          coltypes: [],
        },
      ],
    };

    renderWithTheme(<NitecMaps {...propsWithError} />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('should update layers when data changes', async () => {
    const { rerender } = renderWithTheme(<NitecMaps {...mockProps} />);

    const updatedProps = {
      ...mockProps,
      queriesData: [
        {
          data: [
            { lat: 51.5074, lon: -0.1278, name: 'London', value: 300 },
          ],
          colnames: ['lat', 'lon', 'name', 'value'],
          coltypes: [2, 2, 1, 2],
        },
      ],
    };

    rerender(
      <ThemeProvider theme={supersetTheme}>
        <NitecMaps {...updatedProps} />
      </ThemeProvider>
    );

    // Verify layer factory was called with new data
    const { createLayerFromConfig } = require('./utils/layerFactory');
    await waitFor(() => {
      expect(createLayerFromConfig).toHaveBeenCalledWith(
        expect.any(Object),
        expect.arrayContaining([
          expect.objectContaining({ name: 'London' }),
        ]),
        expect.any(Object),
      );
    });
  });

  it('should handle multiple layers', () => {
    const multiLayerProps = {
      ...mockProps,
      formData: {
        ...mockProps.formData,
        layers: [
          {
            id: 'layer1',
            name: 'Layer 1',
            type: 'vector',
            visible: true,
          },
          {
            id: 'layer2',
            name: 'Layer 2',
            type: 'vector',
            visible: false,
          },
        ],
      },
      queriesData: [
        mockProps.queriesData[0],
        {
          data: [
            { lat: 51.5074, lon: -0.1278, name: 'London', value: 300 },
          ],
          colnames: ['lat', 'lon', 'name', 'value'],
          coltypes: [2, 2, 1, 2],
        },
      ],
    };

    renderWithTheme(<NitecMaps {...multiLayerProps} />);

    expect(screen.getByText('layer1')).toBeInTheDocument();
    expect(screen.getByText('layer2')).toBeInTheDocument();
  });

  it('should clean up map on unmount', () => {
    const Map = require('ol/Map').default;
    const mapInstance = {
      setTarget: jest.fn(),
      getLayers: jest.fn(() => ({
        getArray: jest.fn(() => []),
      })),
      addLayer: jest.fn(),
      removeLayer: jest.fn(),
      addOverlay: jest.fn(),
      addInteraction: jest.fn(),
      on: jest.fn(),
    };
    Map.mockImplementation(() => mapInstance);

    const { unmount } = renderWithTheme(<NitecMaps {...mockProps} />);
    unmount();

    expect(mapInstance.setTarget).toHaveBeenCalledWith(undefined);
  });
});