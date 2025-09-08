
import { VizType } from '@superset-ui/core';
import NitecMapsChartPlugin from '../../src';

describe('Superset Plugin Integration', () => {
  it('should export a valid plugin class', () => {
    expect(NitecMapsChartPlugin).toBeDefined();
    expect(NitecMapsChartPlugin.prototype.constructor.name).toBe('NitecMapsChartPlugin');
  });

  it('should have correct metadata', () => {
    const plugin = new NitecMapsChartPlugin();
    const metadata = plugin.metadata;

    expect(metadata.name).toBe('Nitec Maps');
    expect(metadata.description).toContain('GIS map visualization');
    expect(metadata.category).toBe('Maps');
    expect(metadata.thumbnail).toBeDefined();
    expect(metadata.useLegacyApi).toBe(false);
  });

  it('should have required plugin methods', () => {
    const plugin = new NitecMapsChartPlugin();

    expect(plugin.buildQuery).toBeDefined();
    expect(plugin.transformProps).toBeDefined();
    expect(plugin.controlPanel).toBeDefined();
    expect(plugin.loadChart).toBeDefined();
  });

  it('should configure with VizType key', () => {
    const plugin = new NitecMapsChartPlugin();
    const configured = plugin.configure({ key: VizType.NitecMaps });

    expect(configured.key).toBe('nitec_maps');
  });

  it('should have correct behaviors', () => {
    const plugin = new NitecMapsChartPlugin();
    const behaviors = plugin.metadata.behaviors;

    expect(behaviors).toContain('InteractiveChart');
    expect(behaviors).toContain('DrillToDetail');
  });

  it('should have correct tags', () => {
    const plugin = new NitecMapsChartPlugin();
    const tags = plugin.metadata.tags;

    expect(tags).toContain('GIS');
    expect(tags).toContain('Maps');
    expect(tags).toContain('Cross-filter');
    expect(tags).toContain('Multi-Dimensional');
  });

  it('should load chart component dynamically', async () => {
    const plugin = new NitecMapsChartPlugin();
    const ChartComponent = await plugin.loadChart();

    expect(ChartComponent).toBeDefined();
    expect(ChartComponent.default).toBeDefined();
  });

  it('should have control panel configuration', () => {
    const plugin = new NitecMapsChartPlugin();
    const controlPanel = plugin.controlPanel;

    expect(controlPanel.controlPanelSections).toBeDefined();
    expect(controlPanel.controlPanelSections.length).toBeGreaterThan(0);

    // Check for required sections
    const sectionLabels = controlPanel.controlPanelSections.map(s => s.label);
    expect(sectionLabels).toContain('Data');
    expect(sectionLabels).toContain('Layers');
    expect(sectionLabels).toContain('Map Options');
  });

  it('should build queries for multiple layers', () => {
    const plugin = new NitecMapsChartPlugin();
    const formData = {
      layers: [
        { id: 'layer1', type: 'vector', datasource: '1__table' },
        { id: 'layer2', type: 'vector', datasource: '2__table' },
      ],
      latitudeColumn: 'lat',
      longitudeColumn: 'lon',
    };

    const queryContext = plugin.buildQuery(formData);

    expect(queryContext.queries).toHaveLength(2);
    expect(queryContext.queries[0].columns).toContain('lat');
    expect(queryContext.queries[0].columns).toContain('lon');
  });

  it('should transform props correctly', () => {
    const plugin = new NitecMapsChartPlugin();
    const chartProps = {
      width: 800,
      height: 600,
      formData: { layers: [] },
      queriesData: [{ data: [] }],
      hooks: {},
    };

    const transformed = plugin.transformProps(chartProps);

    expect(transformed.width).toBe(800);
    expect(transformed.height).toBe(600);
    expect(transformed.setDataMask).toBeDefined();
    expect(transformed.onContextMenu).toBeDefined();
  });
});