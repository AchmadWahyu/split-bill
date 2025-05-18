import './instrument.ts';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { reactErrorHandler } from '@sentry/react';
import App from './App.tsx';
import './index.css';
import ErrorBoundary from './ErrorBoundary.tsx';
import { BrowserRouter } from 'react-router';

createRoot(document.getElementById('root')!, {
  // Callback called when an error is thrown and not caught by an ErrorBoundary.
  onUncaughtError: reactErrorHandler((error, errorInfo) => {
    console.warn('Uncaught error', error, errorInfo.componentStack);
  }),
  // Callback called when React catches an error in an ErrorBoundary.
  onCaughtError: reactErrorHandler(),
  // Callback called when React automatically recovers from errors.
  onRecoverableError: reactErrorHandler(),
}).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
);
