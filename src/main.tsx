// src/main.tsx
// Justification: Application bootstrap entry point mounting React 19 root into DOM.

import React from 'react';
// Justification: React framework import.

import ReactDOM from 'react-dom/client';
// Justification: React DOM client for root creation.

import { App } from './App.js';
// Justification: Root App component.

import './index.css';
// Justification: Tailwind and enterprise typography styling.

const rootElement = document.getElementById('root');
// Justification: Acquire mount DOM node.

if (!rootElement) {
  throw new Error("Failed to find root DOM element with id 'root'.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
