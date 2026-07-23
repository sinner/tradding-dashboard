import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { logger } from '@/services/loggerService';
import '@/styles/index.css';

window.addEventListener('error', (e) => {
  logger.error('window', e.message, e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  logger.error('promise', 'unhandled rejection', e.reason);
});

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element #root not found');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

logger.info('app', 'bootstrapped');
