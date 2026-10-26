import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { PhoneFrame } from './components/PhoneFrame';
import { StoreProvider } from './store';
import { FlagsContext, readFlags } from './variants';
import './styles/tokens.css';
import './styles/prototype.css';
import './styles/app.css';

const flags = readFlags();
document.documentElement.dataset.variant = flags.variant;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FlagsContext.Provider value={flags}>
      <StoreProvider flags={flags}>
        <PhoneFrame>
          <App />
        </PhoneFrame>
      </StoreProvider>
    </FlagsContext.Provider>
  </StrictMode>,
);
