import type { ReactNode } from 'react';
import { Icon } from './Icon';

/** Bottom sheet over a dimmed overlay. Tapping the overlay closes it; taps inside do not. */
export function Sheet({ title, onClose, children, label }: { title: ReactNode; onClose: () => void; children: ReactNode; label?: string }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <h2 className="h2">{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
