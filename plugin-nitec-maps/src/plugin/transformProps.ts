
import { ChartProps } from '@superset-ui/core';
import { NitecMapsFormData, NitecMapsProps } from '../types';

export default function transformProps(chartProps: ChartProps): NitecMapsProps {
  const {
    width,
    height,
    formData,
    queriesData,
    hooks,
  } = chartProps;

  const {
    onContextMenu = () => { },
    setControlValue = () => { },
    setDataMask = () => { },
    onFilterMenuOpen = () => { },
    onFilterMenuClose = () => { },
  } = hooks;

  // Transform form data
  const nitecMapsFormData = formData as NitecMapsFormData;

  // Transform queries data - ensure it's always an array
  const safeQueriesData = queriesData || [];
  const transformedQueriesData = Array.isArray(safeQueriesData[0])
    ? safeQueriesData
    : safeQueriesData[0] ? [safeQueriesData[0]] : [];

  const finalQueriesData = transformedQueriesData.map((qd: any) => ({
    data: qd?.data || [],
    colnames: qd?.colnames || [],
    coltypes: qd?.coltypes || [],
    error: qd?.error,
  }));

  return {
    formData: nitecMapsFormData,
    width,
    height,
    queriesData: finalQueriesData,
    onContextMenu,
    onFilterMenuOpen,
    onFilterMenuClose,
    setControlValue,
    setDataMask,
  };
}
