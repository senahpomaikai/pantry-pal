import { Icon } from './Icon';

export function Check({ on }: { on: boolean }) {
  return <span className={'check ' + (on ? 'on' : '')}><Icon name="check" size="sm" /></span>;
}

export function Switch({ on, label, onToggle }: { on: boolean; label: string; onToggle: () => void }) {
  return <button className={'switch ' + (on ? 'on' : '')} aria-pressed={on} aria-label={label} onClick={onToggle}><span /></button>;
}
