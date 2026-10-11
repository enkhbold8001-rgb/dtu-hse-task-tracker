import { defineConfig } from '@playwright/test';
export default defineConfig({
  testMatch: ['final_test.spec.ts', 'regression_test.spec.ts', 'rules_unit.spec.ts'],
  timeout: 30000,
  use: { headless: true },
});
