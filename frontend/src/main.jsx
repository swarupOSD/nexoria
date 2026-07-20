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

window.deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
});

// Service worker will be registered by vite-plugin-pwa in App.jsx (via PwaUpdatePrompt)

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
