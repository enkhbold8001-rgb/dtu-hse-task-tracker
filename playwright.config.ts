import { defineConfig } from '@playwright/test';
export default defineConfig({
  testMatch: ['final_test.spec.ts'],
  timeout: 30000,
  use: { headless: true },
});
