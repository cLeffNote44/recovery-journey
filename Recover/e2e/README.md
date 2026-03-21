# End-to-End Tests

This directory contains E2E tests for the Recover app using Playwright.

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug
```

## Test Files

- `onboarding.spec.ts` - Tests the onboarding flow for new users
- `check-in.spec.ts` - Tests daily check-in functionality
- `navigation.spec.ts` - Tests navigation and keyboard shortcuts
- `analytics.spec.ts` - Tests analytics screen and data visualization

## Writing Tests

Follow Playwright best practices:

1. Use `data-testid` attributes for stable selectors
2. Wait for elements to be visible before interacting
3. Use `expect` assertions from `@playwright/test`
4. Keep tests independent and isolated
5. Clean up test data in `afterEach` hooks

## Configuration

See `playwright.config.ts` for configuration options including:
- Browser targets (Chromium, Firefox, WebKit)
- Mobile device emulation
- Screenshots and traces
- Timeouts and retries
