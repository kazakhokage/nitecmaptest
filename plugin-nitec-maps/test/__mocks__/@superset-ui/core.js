const React = require('react');

module.exports = {
  VizType: {
    NitecMaps: 'nitec_maps'
  },
  ThemeProvider: ({ children }) => children,
  supersetTheme: {
    colors: {
      primary: {
        base: '#20A7C9'
      },
      grayscale: {
        light2: '#e0e0e0',
        light5: '#f5f5f5'
      }
    },
    gridUnit: 4,
    typography: {
      families: {
        sansSerif: '"Inter", Helvetica, Arial, sans-serif'
      }
    }
  },
  buildQueryContext: (formData, options = {}) => {
    const columns = formData.columns || [];
    const query = {
      columns,
      orderby: [],
      metrics: formData.metrics || [],
      row_limit: formData.row_limit || 10000,
      time_range: formData.time_range,
      filters: formData.filters || [],
      ...formData
    };
    return {
      datasource: formData.datasource,
      force: false,
      queries: [query],
      form_data: formData
    };
  },
  QueryFormData: {},
  ControlPanelConfig: {},
  ControlSetRow: [],
  sharedControls: {
    datasource: {},
    groupby: {},
    row_limit: {},
    adhoc_filters: {},
    time_range: {}
  },
  getControlsState: () => ({}),
  sections: {
    advancedAnalyticsControls: []
  },
  ColumnOption: ({ column }) => column.column_name || column,
  Dataset: {},
  DatasourceType: {
    Table: 'table'
  },
  legacyValidateInteger: () => null,
  legacyValidateNumber: () => null,
  ensureIsArray: (val) => Array.isArray(val) ? val : [val],
  DataMask: {},
  InteractionState: {},
  CROSS_FILTER: 'CROSS_FILTER',
  Behavior: {
    NATIVE_FILTER: 'NATIVE_FILTER',
    CROSS_FILTER: 'CROSS_FILTER'
  },
  // Translation function
  t: (str) => str,
  // Styled components
  styled: new Proxy({}, {
    get: (target, prop) => {
      return (strings, ...values) => {
        const Component = React.forwardRef((props, ref) => 
          React.createElement(prop.toString(), { ...props, ref })
        );
        Component.displayName = `Styled${prop.toString()}`;
        return Component;
      };
    }
  })
};