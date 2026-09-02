/// <reference types="vitest" />
// vite.config.ts
// Justification: Configures Vite bundling, React plugin, DOM testing environment, and test coverage thresholds.

import { defineConfig } from 'vitest/config';
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
  test: {
    // Justification: Vitest test runner configuration for unit and integration testing.
    globals: true,
    // Justification: Enables Jest/Vitest global test hooks (describe, it, expect) without repetitive manual imports.
    environment: 'jsdom',
    // Justification: Emulates browser Document Object Model (DOM) environment for testing React component rendering.
    setupFiles: ['./src/test/setup.ts'],
    // Justification: Global test environment setup file configuring jest-dom assertions and matchers.
    coverage: {
      // Justification: Code coverage collection settings to verify test quality.
      provider: 'v8',
      // Justification: Uses high-performance V8 engine native coverage inspector.
      reporter: ['text', 'json', 'html'],
      // Justification: Emits terminal summary, JSON machine-readable reports, and interactive HTML dashboards.
      include: ['src/engine/**/*.ts', 'src/store/**/*.ts'],
      // Justification: Strictly scopes coverage targets to core business rules and state logic for 100% threshold enforcement.
      exclude: ['src/test/**', 'src/vite-env.d.ts'],
      // Justification: Excludes test harness and type declarations from skewing coverage metrics.
      thresholds: {
        // Justification: Enforces the mandatory 100% coverage policy requested by the user.
        lines: 100,
        // Justification: 100% line coverage guarantees every executable line is exercised.
        functions: 100,
        // Justification: 100% function coverage guarantees every declared function/method is invoked.
        branches: 100,
        // Justification: 100% branch coverage guarantees every conditional evaluation path is validated.
        statements: 100,
        // Justification: 100% statement coverage ensures zero unexecuted statements.
      },
    },
  },
});
