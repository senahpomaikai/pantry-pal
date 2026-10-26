import type { CSSProperties, ReactNode } from 'react';

// Stroke icons copied from Main.dc.html. All use the prototype's `.i` class (22px, 1.8 stroke).
const PATHS = {
  logo: <><path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15" /><path d="M5 19l8-8" /></>,
  bell: <><path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" /><path d="M10 21h4" /></>,
  scan: <><path d="M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3" /><path d="M8 12h8" /></>,
  chevron: <path d="M9 5l7 7-7 7" />,
  back: <path d="M15 5l-7 7 7 7" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  filter: <><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></>,
  goals: <path d="M4 6l1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17M11 6h9M11 12h9M11 18h9" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  clockWarn: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l2.5 1.5" /></>,
  check: <path d="M5 12l5 5 9-10" />,
  trash: <path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 16.5v.5" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.5" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
  bookmark: <path d="M7 4h10a1 1 0 011 1v15l-6-4-6 4V5a1 1 0 011-1z" />,
  share: <><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" /></>,
  pot: <><path d="M4 11h16v3a6 6 0 01-6 6h-4a6 6 0 01-6-6z" /><path d="M2 11h20" /></>,
  task: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 12l3 3 5-6" /></>,
  home: <><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></>,
  pantry: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M5 10h14M9 6v2M9 13v3" /></>,
  book: <><path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3z" /><path d="M5 17a3 3 0 013-3h11" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
  pencil: <path d="M4 20h4L19 9l-4-4L4 16z" />,
  link: <><path d="M10 14a4 4 0 006 0l3-3a4 4 0 00-6-6l-1 1" /><path d="M14 10a4 4 0 00-6 0l-3 3a4 4 0 006 6l1-1" /></>,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

interface Props {
  name: IconName;
  size?: 'sm' | 'xs';
  className?: string;
  style?: CSSProperties;
}

export function Icon({ name, size, className, style }: Props) {
  const cls = ['i', size && 'i-' + size, className].filter(Boolean).join(' ');
  return <svg className={cls} viewBox="0 0 24 24" aria-hidden="true" style={style}>{PATHS[name]}</svg>;
}
