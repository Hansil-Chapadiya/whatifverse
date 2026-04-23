import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@google/model-viewer';
import App from './App';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
