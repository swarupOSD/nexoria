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
  if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform()) {
    const backendUrl = 'https://nexoria-backend-mt5e.onrender.com';
    
    if (typeof resource === 'string') {
      if (resource.startsWith('/api')) {
        resource = backendUrl + resource;
      } else if (resource.startsWith(window.location.origin + '/api')) {
        resource = resource.replace(window.location.origin, backendUrl);
      }
    } else if (resource instanceof Request) {
      let newUrl = resource.url;
      if (newUrl.startsWith('/api')) {
        newUrl = backendUrl + newUrl;
      } else if (newUrl.startsWith(window.location.origin + '/api')) {
        newUrl = newUrl.replace(window.location.origin, backendUrl);
      } else if (newUrl.startsWith('capacitor://localhost/api') || newUrl.startsWith('http://localhost/api')) {
         newUrl = newUrl.replace(/^(capacitor:\/\/localhost|http:\/\/localhost)/, backendUrl);
      }
      
      if (newUrl !== resource.url) {
        resource = new Request(newUrl, resource);
      }
    }
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
