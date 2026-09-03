/// <reference types="vitest" />
// vite.config.ts
// Justification: Configures Vite bundling, React plugin, DOM testing environment, and test coverage thresholds.

import { configDefaults, defineConfig } from 'vitest/config';
// Justification: Imports Vitest configuration helper providing full TypeScript typing for build, server, and test options.

import react from '@vitejs/plugin-react';
// Justification: Enables Fast Refresh and JSX/TSX compilation for React 19 components.

import path from 'path';
// Justification: Node.js path module used for reliable cross-platform path resolution.

export default defineConfig({
  // Justification: Main Vite configuration export using functional definition.
  plugins: [
    // Justification: Plugin pipeline for Vite processing.
    react(),
    // Justification: Mounts official React plugin for transforming modern React code.
  ],
  resolve: {
    // Justification: Configures path aliases to keep import statements clean and avoid fragile relative traversals.
    alias: {
      // Justification: Map '@' directly to the 'src' directory.
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Three.js is isolated behind a lazy route. Its minified chunk is expected
    // to be slightly above Vite's generic 500 kB warning; gzip budgets are
    // enforced separately by scripts/check_bundle_size.ts.
    chunkSizeWarningLimit: 550,
  },
  test: {
    // Justification: Vitest test runner configuration for unit and integration testing.
    globals: true,
    // Justification: Enables Jest/Vitest global test hooks (describe, it, expect) without repetitive manual imports.
    environment: 'jsdom',
    // Justification: Emulates browser Document Object Model (DOM) environment for testing React component rendering.
    setupFiles: ['./src/test/setup.ts'],
    exclude: [...configDefaults.exclude, 'tests/e2e/**'],
    // Justification: Global test environment setup file configuring jest-dom assertions and matchers.
    coverage: {
      // Justification: Code coverage collection settings to verify test quality.
      provider: 'v8',
      // Justification: Uses high-performance V8 engine native coverage inspector.
      reporter: ['text', 'json', 'html'],
      // Justification: Emits terminal summary, JSON machine-readable reports, and interactive HTML dashboards.
      include: ['src/engine/**/*.ts', 'src/store/**/*.ts'],
      // Scope coverage to deterministic business rules and state logic.
      exclude: ['src/test/**', 'src/vite-env.d.ts'],
      // Justification: Excludes test harness and type declarations from skewing coverage metrics.
      thresholds: {
        // Enforce the documented core-domain thresholds.
        lines: 90,
        // Core-domain line threshold.
        functions: 90,
        // Core-domain function threshold.
        branches: 85,
        // Core-domain branch threshold.
        statements: 90,
        // Core-domain statement threshold.
      },
    },
  },
});
