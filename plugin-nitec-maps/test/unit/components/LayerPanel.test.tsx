
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, supersetTheme } from '@superset-ui/core';
import LayerPanel from '../../../src/components/LayerPanel';
import { LayerState } from '../../../src/types';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={supersetTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('LayerPanel', () => {
  const mockLayers: LayerState[] = [
    {
      id: 'layer1',
      visible: true,
    },
    {
      id: 'layer2',
      visible: false,
    },
    {
      id: 'layer3',
      visible: true,
    },
  ];

  const mockOnToggleVisibility = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the panel title', () => {
    renderWithTheme(
      <LayerPanel
        layers={mockLayers}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    expect(screen.getByText('Layers')).toBeInTheDocument();
  });

  it('should render all layers', () => {
    renderWithTheme(
      <LayerPanel
        layers={mockLayers}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    expect(screen.getByText('layer1')).toBeInTheDocument();
    expect(screen.getByText('layer2')).toBeInTheDocument();
    expect(screen.getByText('layer3')).toBeInTheDocument();
  });

  it('should render checkboxes with correct state', () => {
    renderWithTheme(
      <LayerPanel
        layers={mockLayers}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).toBeChecked();
  });

  it('should call onToggleVisibility when checkbox is clicked', () => {
    renderWithTheme(
      <LayerPanel
        layers={mockLayers}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(mockOnToggleVisibility).toHaveBeenCalledWith('layer1');
    expect(mockOnToggleVisibility).toHaveBeenCalledTimes(1);
  });

  it('should handle empty layers array', () => {
    renderWithTheme(
      <LayerPanel
        layers={[]}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    expect(screen.getByText('Layers')).toBeInTheDocument();
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('should render layer items with labels', () => {
    renderWithTheme(
      <LayerPanel
        layers={mockLayers}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    // Check that all layer names are rendered as labels
    const labels = screen.getAllByLabelText(/layer\d/);
    expect(labels).toHaveLength(3);
  });

  it('should handle rapid toggle clicks', () => {
    renderWithTheme(
      <LayerPanel
        layers={mockLayers}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    const checkbox = screen.getAllByRole('checkbox')[0];

    fireEvent.click(checkbox);
    fireEvent.click(checkbox);
    fireEvent.click(checkbox);

    expect(mockOnToggleVisibility).toHaveBeenCalledTimes(3);
    expect(mockOnToggleVisibility).toHaveBeenCalledWith('layer1');
  });

  it('should render with custom layer names', () => {
    const customLayers: LayerState[] = [
      {
        id: 'custom-layer-with-long-name-that-should-wrap',
        visible: true,
      },
      {
        id: '特殊字符层',
        visible: false,
      },
    ];

    renderWithTheme(
      <LayerPanel
        layers={customLayers}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    expect(screen.getByText('custom-layer-with-long-name-that-should-wrap')).toBeInTheDocument();
    expect(screen.getByText('特殊字符层')).toBeInTheDocument();
  });

  it('should maintain correct checkbox states after re-render', () => {
    const { rerender } = renderWithTheme(
      <LayerPanel
        layers={mockLayers}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    const updatedLayers = [
      ...mockLayers,
      { id: 'layer4', visible: false },
    ];

    rerender(
      <ThemeProvider theme={supersetTheme}>
        <LayerPanel
          layers={updatedLayers}
          onToggleVisibility={mockOnToggleVisibility}
        />
      </ThemeProvider>
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(4);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).toBeChecked();
    expect(checkboxes[3]).not.toBeChecked();
  });

  it('should have proper accessibility attributes', () => {
    renderWithTheme(
      <LayerPanel
        layers={mockLayers}
        onToggleVisibility={mockOnToggleVisibility}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox, index) => {
      expect(checkbox).toHaveAttribute('type', 'checkbox');
      expect(checkbox.tagName).toBe('INPUT');
    });
  });
});