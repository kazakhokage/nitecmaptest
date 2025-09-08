# Test Organization for Nitec Maps Plugin

## Overview
All tests are now organized in a single `test/` directory with clear categorization by test type.

## Directory Structure

```
test/
├── __mocks__/              # Mock files for assets
│   ├── fileMock.js         # Mock for images/files
│   └── styleMock.js        # Mock for CSS imports
├── unit/                   # Unit tests for individual components/functions
│   ├── components/         # Component unit tests
│   │   ├── LayerPanel.test.tsx
│   │   └── MapContainer.test.tsx
│   ├── plugin/             # Plugin function unit tests
│   │   ├── buildQuery.test.ts
│   │   └── transformProps.test.ts
│   ├── utils/              # Utility function unit tests
│   │   └── layerFactory.test.ts
│   └── NitecMaps.test.tsx  # Main component unit test
├── integration/            # Integration tests
│   └── cross-filtering.test.tsx  # Cross-filtering functionality
├── plugin-integration/     # Superset plugin integration tests
│   └── superset-integration.test.ts  # Plugin registration & metadata
├── e2e/                    # End-to-end tests
│   └── nitec-maps.spec.ts  # Playwright E2E tests
├── setup.ts                # Test environment setup
└── TEST_ORGANIZATION.md    # This file
```

## Test Categories

### 1. Unit Tests (`test/unit/`)
**Purpose**: Test individual components and functions in isolation

- **Component Tests**: Test React components with mocked dependencies
  - `LayerPanel.test.tsx` - Layer visibility panel component
  - `MapContainer.test.tsx` - Map container wrapper component
  - `NitecMaps.test.tsx` - Main map component (with mocked OpenLayers)

- **Plugin Tests**: Test plugin configuration functions
  - `buildQuery.test.ts` - Query building logic for multiple layers
  - `transformProps.test.ts` - Props transformation logic

- **Utility Tests**: Test helper functions
  - `layerFactory.test.ts` - Layer creation factory functions

### 2. Integration Tests (`test/integration/`)
**Purpose**: Test interactions between multiple components

- `cross-filtering.test.tsx` - Tests the cross-filtering feature with map selection

### 3. Plugin Integration Tests (`test/plugin-integration/`)
**Purpose**: Test integration with Superset framework

- `superset-integration.test.ts` - Tests plugin registration, metadata, and Superset APIs

### 4. E2E Tests (`test/e2e/`)
**Purpose**: Test complete user workflows in a real browser

- `nitec-maps.spec.ts` - Playwright tests for full UI interactions

## Running Tests

### Run all tests
```bash
npm test
```

### Run specific test category
```bash
# Unit tests only
npm test -- --selectProjects=unit

# Integration tests only
npm test -- --selectProjects=integration

# Plugin integration tests only
npm test -- --selectProjects=plugin-integration

# E2E tests
npm run test:playwright
```

### Run tests with coverage
```bash
npm test -- --coverage
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run specific test file
```bash
npm test -- test/unit/components/LayerPanel.test.tsx
```

## Test Guidelines

### Unit Tests
- Mock all external dependencies (OpenLayers, API calls)
- Test component behavior, not implementation
- Focus on user interactions and outputs
- Use React Testing Library for component tests

### Integration Tests
- Test feature workflows
- Mock only external systems (APIs, databases)
- Verify component interactions
- Test data flow between components

### Plugin Integration Tests
- Test Superset-specific integrations
- Verify plugin registration
- Test metadata and configuration
- Ensure compatibility with Superset APIs

### E2E Tests
- Test complete user workflows
- Run against real Superset instance
- Cover critical user paths
- Test cross-browser compatibility

## Coverage Goals

- **Overall**: 60% minimum (branches, functions, lines, statements)
- **Unit tests**: Should cover all exported functions/components
- **Integration tests**: Should cover major features
- **E2E tests**: Should cover critical user workflows

## Adding New Tests

1. Determine test type (unit, integration, e2e)
2. Place in appropriate directory
3. Follow naming convention: `[component/feature].test.[ts|tsx]`
4. Include proper imports for test utilities
5. Mock dependencies appropriately
6. Update this documentation if adding new test categories

## Maintenance

- Keep tests close to what users would do
- Avoid testing implementation details
- Update tests when features change
- Remove obsolete tests
- Keep test data realistic