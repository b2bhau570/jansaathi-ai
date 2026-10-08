# JANSAATHI AI - Testing & Quality Assurance

## 1. Automated Test Suite

Automated unit tests are implemented using **Vitest**:
- `tests/urgencyRules.test.ts`: Evaluates deterministic red-flag triggers, negative cases, malformed inputs, multilingual keyword detection, and multiple simultaneous signals.
- `tests/schemaValidator.test.ts`: Evaluates adherence to the strict triage schema and confirms rejection of forbidden clinical diagnoses or prescriptions.
- `tests/hardwareTelemetry.test.ts`: Verifies JSON and ASCII packet parsing from medical telemetry serial streams.

### Executing Tests:
```bash
# Run unit tests once
npm test

# Run tests in watch mode
npx vitest

# Run TypeScript typecheck
npm run typecheck
```

## 2. Test Results
- Total Tests: 17
- Pass Rate: 100% (17/17 passing)
- Zero LLM dependency during test execution.
