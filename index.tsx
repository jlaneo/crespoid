import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- API Key Bootstrapping ---
// This script runs before the app mounts. It ensures that the Gemini API key
// is available in a consistent way (process.env.API_KEY), whether it's
// provided by Vercel's environment variables or stored in sessionStorage
// for local development.

// 1. Polyfill `process.env` if it doesn't exist.
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
}

// 2. Load the API key from sessionStorage into the polyfilled process.env.
// This allows local development without exposing the key in the code.
// On Vercel, process.env.API_KEY will already be set, so this won't overwrite it.
const apiKeyFromSession = sessionStorage.getItem('gemini-api-key');
if (apiKeyFromSession && !(window as any).process.env.API_KEY) {
  (window as any).process.env.API_KEY = apiKeyFromSession;
}
// --- End of Bootstrapping ---


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);