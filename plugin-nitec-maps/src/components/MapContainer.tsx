
import { forwardRef } from 'react';
import { styled } from '@superset-ui/core';

const StyledMapContainer = styled.div<{ width: number; height: number }>`
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  position: relative;
  
  .ol-overlaycontainer-stopevent {
    display: none;
  }
`;

interface MapContainerProps {
  width: number;
  height: number;
}

const MapContainer = forwardRef<HTMLDivElement, MapContainerProps>(
  ({ width, height }, ref) => {
    return <StyledMapContainer ref={ref} width={width} height={height} />;
  },
);

MapContainer.displayName = 'MapContainer';

export default MapContainer;