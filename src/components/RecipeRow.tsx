import type { RecipeCard } from '../state/selectors';
import { Icon } from './Icon';

/** The `.rcard` row used on Home, Recipes, Item detail and Shared with me. */
export function RecipeRow({ r, onOpen, showSoon = false, showFrom = false }: {
  r: RecipeCard; onOpen: () => void; showSoon?: boolean; showFrom?: boolean;
}) {
  return (
    <button className="rcard" onClick={onOpen}>
      <div className="ph" style={{ width: 64, height: 64 }}>photo</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0, flex: 1 }}>
        {showFrom && <span className="small muted" style={{ fontWeight: 600 }}>From {r.by}</span>}
        <span className="h3">{r.title}</span>
        <span className="small muted">{r.timeText} · {r.matchText}</span>
        {showSoon && r.usesSoon && <span className="soonline"><Icon name="clock" size="xs" />{r.soonText}</span>}
      </div>
      <Icon name="chevron" size="sm" className="muted" />
    </button>
  );
}
