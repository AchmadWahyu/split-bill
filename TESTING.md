# Testing Guide

This repository includes both unit tests and end-to-end tests to ensure code quality and functionality.

## Unit Testing with React Testing Library + Vitest

### Setup
Unit tests use React Testing Library with Vitest as the test runner. The setup includes:
- `@testing-library/react` for component testing
- `@testing-library/jest-dom` for additional matchers
- `@testing-library/user-event` for user interactions
- `vitest` as the test runner
- `jsdom` for DOM environment

### Running Unit Tests
```bash
# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- Tests are located in `src/**/__tests__/` directories
- Test utilities are in `src/test/`
- Test setup is configured in `vitest.config.ts`

### Writing Unit Tests
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../test/test-utils'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## End-to-End Testing with Playwright

### Setup
E2E tests use Playwright for browser automation:
- Supports Chromium, Firefox, and WebKit
- Includes mobile device testing
- Automatic browser installation

### Running E2E Tests
```bash
# Run all e2e tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run in headed mode (visible browser)
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug
```

### Test Structure
- Tests are located in `tests/e2e/`
- Test utilities are in `tests/e2e/utils/`
- Configuration is in `playwright.config.ts`

### Writing E2E Tests
```typescript
import { test, expect } from '@playwright/test'

test('should navigate to home page', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Split Bareng' })).toBeVisible()
})
```

## Test Coverage

### Unit Tests
- Component rendering and behavior
- User interactions (clicks, form inputs)
- Props and state changes
- Error handling

### E2E Tests
- User workflows
- Navigation between pages
- Form submissions
- Cross-browser compatibility
- Mobile responsiveness

## CI/CD Integration

Tests run automatically on:
- Push to main/develop branches
- Pull requests
- Both unit and e2e tests are executed
- Test results and artifacts are preserved

## Best Practices

### Unit Tests
- Test component behavior, not implementation details
- Use semantic queries (getByRole, getByText)
- Mock external dependencies
- Test error states and edge cases

### E2E Tests
- Test complete user workflows
- Use page objects for complex interactions
- Keep tests independent and isolated
- Test across multiple browsers

### General
- Write descriptive test names
- Use beforeEach/afterEach for setup/cleanup
- Mock time-sensitive operations
- Test accessibility features

## Troubleshooting

### Common Issues
1. **Tests failing in CI**: Check browser dependencies
2. **Mock issues**: Verify mock implementations
3. **Timing issues**: Use proper wait conditions
4. **Browser compatibility**: Test across different browsers

### Debug Mode
```bash
# Unit tests
npm run test:ui

# E2E tests
npm run test:e2e:debug
```

## Additional Resources

- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)