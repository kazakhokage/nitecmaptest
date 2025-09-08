# Nitec Maps Plugin - Test Suite

## Quick Start

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:plugin         # Plugin integration tests
npm run test:e2e            # End-to-end tests

# Development
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report
```

## Test Organization

All tests are organized in the `test/` directory:

```
test/
├── unit/                   # Isolated component/function tests
├── integration/            # Feature integration tests
├── plugin-integration/     # Superset framework tests
├── e2e/                    # Browser-based E2E tests
├── __mocks__/              # Mock files
└── setup.ts                # Test environment setup
```

## What Each Test Type Covers

### Unit Tests
- **Components**: LayerPanel, MapContainer, NitecMaps
- **Functions**: buildQuery, transformProps, layerFactory
- **Focus**: Individual units in isolation
- **Mocking**: All external dependencies

### Integration Tests
- **Cross-filtering**: Feature selection and data masking
- **Focus**: Component interactions
- **Mocking**: Only external systems

### Plugin Integration Tests
- **Superset Integration**: Plugin registration and APIs
- **Focus**: Framework compatibility
- **Mocking**: Minimal, test real integration

### E2E Tests
- **User Workflows**: Complete UI interactions
- **Focus**: Real browser testing
- **Mocking**: None, uses real Superset

## Coverage Requirements

- Minimum 60% coverage for all metrics
- Run `npm run test:coverage` to check
- Coverage report in `coverage/index.html`

## See Also

- [TEST_ORGANIZATION.md](./TEST_ORGANIZATION.md) - Detailed test structure
- [../MANUAL_TEST.md](../MANUAL_TEST.md) - Manual testing guide