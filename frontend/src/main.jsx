import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { createRoot } from 'react-dom/client';
import { store } from './app/store';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import './index.css';

// Global fetch interceptor for Capacitor/Android WebView
const originalFetch = window.fetch;
window.fetch = async function(resource, config) {
  // If running in Capacitor and the request is to a relative /api route
  if (
    typeof window !== 'undefined' && 
    window.Capacitor && 
    window.Capacitor.isNativePlatform() &&
    typeof resource === 'string' && 
    resource.startsWith('/api')
  ) {
    // Redirect the relative /api call directly to the live backend server
    resource = 'https://nexoria-backend-mt5e.onrender.com' + resource;
  }
  return originalFetch.call(this, resource, config);
};

window.deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
});

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

const root = createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <Provider store={store}>
      <HelmetProvider>
        <ThemeProvider>
          <SocketProvider>
            <App />
          </SocketProvider>
        </ThemeProvider>
      </HelmetProvider>
    </Provider>
  </ErrorBoundary>
);
