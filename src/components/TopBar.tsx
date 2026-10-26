import type { CSSProperties, ReactNode } from 'react';
import { useStore } from '../store';
import { Icon } from './Icon';

export function TopBar({ children }: { children: ReactNode }) {
  return <div className="topbar">{children}</div>;
}

export function Title({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return <p className="title" style={style}>{children}</p>;
}

/** Back (chevron) or close (x) button. Dispatches `back` unless given another handler. */
export function BackButton({ label = 'Back', icon = 'back', onClick, style }: {
  label?: string; icon?: 'back' | 'close'; onClick?: () => void; style?: CSSProperties;
}) {
  const { dispatch } = useStore();
  return (
    <button className="icon-btn" style={style} onClick={onClick ?? (() => dispatch({ type: 'back' }))} aria-label={label}>
      <Icon name={icon} />
    </button>
  );
}
