import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { StoreProvider } from './store';
import { FlagsContext, readFlags } from './variants';
import './styles/prototype.css';

const flags = readFlags();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FlagsContext.Provider value={flags}>
      <StoreProvider flags={flags}>
        <App />
      </StoreProvider>
    </FlagsContext.Provider>
  </StrictMode>,
);
