import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../src/app/store';
import App from '../src/App';
import { HelmetProvider } from 'react-helmet-async';
import { describe, it, expect } from 'vitest';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(
      <Provider store={store}>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </Provider>
    );
    expect(document.body).toBeDefined();
  });
});
