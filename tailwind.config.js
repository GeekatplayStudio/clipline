/** @type {import('tailwindcss').Config} */
// Justification: Tailwind CSS configuration delivering the restrained enterprise palette defined in PRD Section 7.

export default {
  // Justification: Enables class-based dark mode toggling if needed in enterprise environments.
  darkMode: ['class'],
  // Justification: Configures content purge paths covering all React components and index.html.
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Justification: Extends colors with muted enterprise tiers (slate -> amber -> rust -> deep red).
      colors: {
        // Justification: Enterprise neutral slate base for high contrast scannability.
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Justification: Tier 1 Low Risk - Muted slate/steel blue (NOT pure green; low risk isn't 'safe').
        tier1: {
          bg: '#f1f5f9',
          text: '#334155',
          border: '#cbd5e1',
          badge: '#e2e8f0',
        },
        // Justification: Tier 2 Moderate Risk - Subdued amber for advisory awareness.
        tier2: {
          bg: '#fef3c7',
          text: '#92400e',
          border: '#fde68a',
          badge: '#fef3c7',
        },
        // Justification: Tier 3 High Risk - Rust/burnt orange signaling legal & security intervention.
        tier3: {
          bg: '#ffedd5',
          text: '#9a3412',
          border: '#fed7aa',
          badge: '#ffedd5',
        },
        // Justification: Tier 4 Prohibited Risk - Deep crimson red for regulatory prohibitions.
        tier4: {
          bg: '#ffe4e6',
          text: '#9f1239',
          border: '#fecdd3',
          badge: '#ffe4e6',
        },
      },
      fontFamily: {
        // Justification: Humanist sans-serif typography optimized for enterprise scannability.
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        // Justification: Monospace font for human-quotable workflow IDs (e.g. AIW-0001).
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
