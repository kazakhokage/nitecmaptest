
import {
  t,
  ChartMetadata,
  ChartPlugin,
  Behavior,
} from '@superset-ui/core';
import controlPanel from './plugin/controlPanel';
import transformProps from './plugin/transformProps';
import buildQuery from './plugin/buildQuery';
import thumbnail from './images/thumbnail.png';

export default class NitecMapsChartPlugin extends ChartPlugin {
  constructor() {
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('./NitecMaps'),
      metadata: new ChartMetadata({
        behaviors: [
          Behavior.InteractiveChart,
          Behavior.DrillToDetail,
        ],
        category: t('Maps'),
        credits: ['https://openlayers.org/', 'https://viglino.github.io/ol-ext/'],
        description: t(
          'GIS map visualization with multiple layers, cross-filtering, and support for various data formats',
        ),
        exampleGallery: [],
        name: t('Nitec Maps'),
        tags: [
          t('Advanced Analytics'),
          t('Cross-filter'),
          t('GIS'),
          t('Maps'),
          t('Multi-Dimensional'),
        ],
        thumbnail,
        useLegacyApi: false,
      }),
      transformProps,
    });
  }
}