export interface ChipOption<T> { value: T; label: string; on: boolean }

/** A row of toggle chips. Pass `labelledBy` or `label` to expose it as a labelled group. */
export function ChipGroup<T>({ options, onPick, labelledBy, label }: {
  options: ChipOption<T>[]; onPick: (value: T) => void; labelledBy?: string; label?: string;
}) {
  const grouped = !!(labelledBy || label);
  return (
    <div className="chips" role={grouped ? 'group' : undefined} aria-labelledby={labelledBy} aria-label={label}>
      {options.map((o) => (
        <button key={String(o.value)} className={'chip ' + (o.on ? 'on' : '')} aria-pressed={o.on} onClick={() => onPick(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Builds chip options from plain values (the prototype's chipsOf). */
export function chipsOf<T>(values: T[], current: T, fmt: (v: T) => string = String): ChipOption<T>[] {
  return values.map((v) => ({ value: v, label: fmt(v), on: v === current }));
}
