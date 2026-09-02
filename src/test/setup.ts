// src/test/setup.ts
// Justification: Configures global test environment for Vitest, DOM matchers, and localStorage mocks.

import '@testing-library/jest-dom';
// Justification: Extends Vitest assertions with DOM node matchers (toBeInTheDocument, toHaveClass, etc.).

// Justification: Mock localStorage for deterministic isolated store testing in NodeJS/JSDOM runtime.
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
