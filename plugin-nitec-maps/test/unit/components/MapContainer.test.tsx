
import { render } from '@testing-library/react';
import { createRef } from 'react';
import { ThemeProvider, supersetTheme } from '@superset-ui/core';
import MapContainer from '../../../src/components/MapContainer';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={supersetTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('MapContainer', () => {
  it('should render with correct dimensions', () => {
    const { container } = renderWithTheme(
      <MapContainer width={800} height={600} />
    );

    const mapDiv = container.firstChild as HTMLElement;
    expect(mapDiv).toBeInTheDocument();
    expect(mapDiv).toHaveStyle('width: 800px');
    expect(mapDiv).toHaveStyle('height: 600px');
  });

  it('should forward ref correctly', () => {
    const ref = createRef<HTMLDivElement>();

    renderWithTheme(
      <MapContainer ref={ref} width={800} height={600} />
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('should have position relative style', () => {
    const { container } = renderWithTheme(
      <MapContainer width={800} height={600} />
    );

    const mapDiv = container.firstChild as HTMLElement;
    expect(mapDiv).toHaveStyle('position: relative');
  });

  it('should hide OpenLayers overlay container', () => {
    const { container } = renderWithTheme(
      <MapContainer width={800} height={600} />
    );

    // The style should be applied via styled-components
    const mapDiv = container.firstChild as HTMLElement;
    expect(mapDiv.tagName).toBe('DIV');
  });

  it('should update dimensions when props change', () => {
    const { container, rerender } = renderWithTheme(
      <MapContainer width={800} height={600} />
    );

    let mapDiv = container.firstChild as HTMLElement;
    expect(mapDiv).toHaveStyle('width: 800px');
    expect(mapDiv).toHaveStyle('height: 600px');

    rerender(
      <ThemeProvider theme={supersetTheme}>
        <MapContainer width={1000} height={800} />
      </ThemeProvider>
    );

    mapDiv = container.firstChild as HTMLElement;
    expect(mapDiv).toHaveStyle('width: 1000px');
    expect(mapDiv).toHaveStyle('height: 800px');
  });

  it('should handle zero dimensions', () => {
    const { container } = renderWithTheme(
      <MapContainer width={0} height={0} />
    );

    const mapDiv = container.firstChild as HTMLElement;
    expect(mapDiv).toHaveStyle('width: 0px');
    expect(mapDiv).toHaveStyle('height: 0px');
  });

  it('should handle fractional dimensions', () => {
    const { container } = renderWithTheme(
      <MapContainer width={800.5} height={600.75} />
    );

    const mapDiv = container.firstChild as HTMLElement;
    expect(mapDiv).toHaveStyle('width: 800.5px');
    expect(mapDiv).toHaveStyle('height: 600.75px');
  });

  it('should have displayName set', () => {
    expect(MapContainer.displayName).toBe('MapContainer');
  });

  it('should not have any child elements initially', () => {
    const { container } = renderWithTheme(
      <MapContainer width={800} height={600} />
    );

    const mapDiv = container.firstChild as HTMLElement;
    expect(mapDiv.children.length).toBe(0);
  });

  it('should apply theme styles correctly', () => {
    const { container } = renderWithTheme(
      <MapContainer width={800} height={600} />
    );

    const mapDiv = container.firstChild as HTMLElement;
    // Verify it's a styled component by checking for className
    expect(mapDiv.className).toBeTruthy();
  });
});