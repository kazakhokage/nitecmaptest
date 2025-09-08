import { t } from '@superset-ui/core';
import {
  ControlPanelConfig,
} from '@superset-ui/chart-controls';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Layers'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'layers',
            config: {
              type: 'TextAreaControl',
              label: t('Map Layers'),
              description: t(`Configure layers as JSON array. Each layer can have:
- id: unique identifier
- name: display name
- type: vector/wms/geojson
- visible: true/false
- datasource_id: datasource id (optional, uses main datasource if not specified)
- datasource_name: datasource name (optional, alternative to datasource_id)
- latitudeColumn: column name for latitude (vector layers)
- longitudeColumn: column name for longitude (vector layers)
- geometryColumn: column name for geometry (vector layers)
- tooltipColumns: array of column names for tooltips
- style: styling options (color, size, opacity, etc.)
- url: URL for WMS/GeoJSON layers
- wmsParams: WMS specific parameters`),
              renderTrigger: true,
              validators: [],
              default: `[
  {
    "id": "main-layer",
    "name": "Data Points",
    "type": "vector",
    "visible": true,
    "datasource_name": null,
    "latitudeColumn": "latt",
    "longitudeColumn": "long",
    "tooltipColumns": ["properties"],
    "style": {
      "color": "#1890ff",
      "size": 8,
      "opacity": 0.8
    }
  }
]`,
              language: 'json',
              minLines: 10,
              maxLines: 30,
            },
          },
        ],
      ],
    },
    {
      label: t('Map Options'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'centerLat',
            config: {
              type: 'TextControl',
              label: t('Center Latitude'),
              description: t('Initial map center latitude'),
              default: 48.8,
              renderTrigger: true,
            },
          },
          {
            name: 'centerLon',
            config: {
              type: 'TextControl',
              label: t('Center Longitude'),
              description: t('Initial map center longitude'),
              default: 68.0,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'zoom',
            config: {
              type: 'SliderControl',
              label: t('Zoom Level'),
              description: t('Initial zoom level'),
              default: 5,
              min: 1,
              max: 20,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'showLayerPanel',
            config: {
              type: 'CheckboxControl',
              label: t('Show Layer Panel'),
              description: t('Display layer control panel'),
              default: true,
              renderTrigger: true,
            },
          },
          {
            name: 'enableCrossFilter',
            config: {
              type: 'CheckboxControl',
              label: t('Enable Cross-Filtering'),
              description: t('Allow map selections to filter other charts'),
              default: false,
              renderTrigger: true,
            },
          },
        ],
      ],
    },
  ],
  controlOverrides: {
    row_limit: {
      default: 10000,
    },
  },
};

export default config;