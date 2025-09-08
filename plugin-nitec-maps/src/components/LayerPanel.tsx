
import { useState } from 'react';
import { styled } from '@superset-ui/core';
import { LayerState } from '../types';

const PanelContainer = styled.div<{ collapsed: boolean }>`
  position: absolute;
  top: 10px;
  left: 10px;
  width: ${({ collapsed }) => (collapsed ? '40px' : '280px')};
  max-height: 400px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transition: width 0.3s ease;
  overflow: hidden;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
  background: ${({ theme }) => theme.colors.grayscale.light5};
  cursor: pointer;
`;

const PanelTitle = styled.h4<{ collapsed: boolean }>`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.grayscale.dark1};
  display: ${({ collapsed }) => (collapsed ? 'none' : 'block')};
`;

const CollapseButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.grayscale.dark1};
  font-size: 16px;
  line-height: 1;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary.base};
  }
`;

const LayerList = styled.div<{ collapsed: boolean }>`
  display: ${({ collapsed }) => (collapsed ? 'none' : 'block')};
  padding: 12px;
  max-height: 320px;
  overflow-y: auto;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.grayscale.light4};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.grayscale.light2};
    border-radius: 3px;
    
    &:hover {
      background: ${({ theme }) => theme.colors.grayscale.light1};
    }
  }
`;

const LayerItem = styled.div`
  padding: 8px 12px;
  margin-bottom: 8px;
  background: ${({ theme }) => theme.colors.grayscale.light4};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.grayscale.light3};
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const LayerName = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.grayscale.dark1};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
`;

const VisibilityToggle = styled.input`
  cursor: pointer;
  margin: 0;
`;

interface LayerPanelProps {
  layers: LayerState[];
  onToggleVisibility: (layerId: string) => void;
}

export default function LayerPanel({ layers, onToggleVisibility }: LayerPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <PanelContainer collapsed={collapsed}>
      <PanelHeader onClick={() => setCollapsed(!collapsed)}>
        <PanelTitle collapsed={collapsed}>Layers ({layers.length})</PanelTitle>
        <CollapseButton>
          {collapsed ? '☰' : '◀'}
        </CollapseButton>
      </PanelHeader>
      <LayerList collapsed={collapsed}>
        {layers.map((layer) => (
          <LayerItem key={layer.id}>
            <LayerName title={layer.id}>{layer.id}</LayerName>
            <VisibilityToggle
              type="checkbox"
              checked={layer.visible}
              onChange={() => onToggleVisibility(layer.id)}
              onClick={(e) => e.stopPropagation()}
            />
          </LayerItem>
        ))}
        {layers.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#999',
            fontSize: '13px',
            padding: '20px 0'
          }}>
            No layers configured
          </div>
        )}
      </LayerList>
    </PanelContainer>
  );
}