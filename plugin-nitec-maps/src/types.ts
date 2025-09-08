
import { DataRecord, QueryFormData } from '@superset-ui/core';
import { Feature } from 'ol';
import VectorSource from 'ol/source/Vector';
import TileWMS from 'ol/source/TileWMS';

export interface LayerConfig {
  id: string;
  name: string;
  type: 'vector' | 'wms' | 'geojson';
  datasource_id?: number | string;  // ID датасорса для слоя
  datasource_name?: string;  // Имя датасорса для слоя (альтернатива ID)
  visible: boolean;
  // Настройки колонок для векторных слоев
  latitudeColumn?: string;
  longitudeColumn?: string;
  geometryColumn?: string;
  tooltipColumns?: string[];
  // Стиль слоя
  style?: StyleConfig;
  // Параметры для WMS слоев
  wmsParams?: {
    url: string;
    layers: string;
    params?: Record<string, any>;
  };
  // URL для GeoJSON слоев
  url?: string;
  geojsonData?: any;
  vectorData?: DataRecord[];
  zIndex?: number;
}

export interface StyleConfig {
  type?: 'icon' | 'path' | 'polygon' | 'circle';
  iconUrl?: string;
  iconScale?: number;
  color?: string;  // Основной цвет
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  radius?: number;
  size?: number;  // Размер для точек
  opacity?: number;  // Прозрачность
  fillOpacity?: number;  // Прозрачность заливки
  weight?: number;  // Толщина линии
}

export interface NitecMapsFormData extends QueryFormData {
  layers: LayerConfig[] | string;
  latitudeColumn?: string;
  longitudeColumn?: string;
  geometryColumn?: string;
  tooltipColumns?: string[];
  centerLat?: number;
  centerLon?: number;
  zoom?: number;
  mapStyle?: string;
  enableCrossFilter?: boolean;
  showLayerPanel?: boolean;
}

export interface NitecMapsProps {
  formData: NitecMapsFormData;
  width: number;
  height: number;
  queriesData: Array<{
    data: DataRecord[];
    colnames: string[];
    coltypes: number[];
    error?: string;
  }>;
  onContextMenu: (clientX: number, clientY: number, filters?: any[]) => void;
  onFilterMenuOpen: (
    chartId: string,
    dataMask: any,
    event: React.MouseEvent<any>,
  ) => void;
  onFilterMenuClose: (chartId: string, dataMask: any) => void;
  setControlValue: (value: any) => void;
  setDataMask: (dataMask: any) => void;
}

export interface LayerState {
  id: string;
  visible: boolean;
  source: VectorSource | TileWMS;
  features?: Feature[];
}

export interface MapContextValue {
  layers: LayerState[];
  selectedFeatures: Feature[];
  toggleLayerVisibility: (layerId: string) => void;
  selectFeature: (feature: Feature) => void;
  clearSelection: () => void;
}