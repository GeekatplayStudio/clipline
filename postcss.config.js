// postcss.config.js
// Justification: Configures PostCSS transformations including Tailwind CSS and vendor autoprefixing.

export default {
  // Justification: PostCSS plugin pipeline.
  plugins: {
    // Justification: Processes Tailwind utility classes into pure CSS.
    tailwindcss: {},
    // Justification: Automatically injects browser vendor prefixes to ensure cross-browser styling parity.
    autoprefixer: {},
  },
};
