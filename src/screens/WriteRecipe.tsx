import { ChipGroup, chipsOf } from '../components/Chip';
import { ErrLine } from '../components/CustomForms';
import { Icon } from '../components/Icon';
import { BackButton } from '../components/TopBar';
import { TIME_PRESETS, UNITS } from '../state/seed';
import { draftView, sortedPantry } from '../state/selectors';
import type { Unit } from '../state/types';
import { useStore } from '../store';

/** "New recipe": 4 steps (Basics, Ingredients, Steps, Review). */
export function WriteRecipe() {
  const { state, dispatch } = useStore();
  const d = state.d;
  const c = draftView(d, state.cStep);
  const next = () => dispatch({ type: 'cNext' });
  return (
    <div className="screen">
      <div className="topbar">
        <BackButton /><p className="title">New recipe</p>
        <button className="link" style={{ padding: '0 10px', fontSize: 15 }} onClick={() => dispatch({ type: 'exitCreate' })}>Cancel</button>
      </div>
      <div style={{ padding: '0 20px 6px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span className="small muted" style={{ fontWeight: 600 }}>Step {c.step} of 4 · {c.stepName}</span>
        <div className="bar"><span style={{ width: c.pct }} /></div>
      </div>
      <div className="scroll">
        {c.step === 1 && (
          <>
            <div className="field">
              <label className="label" htmlFor="d-title">Recipe name</label>
              <input id="d-title" className="input" placeholder="e.g. Spinach pie" value={d.title} onChange={(e) => dispatch({ type: 'setD', patch: { title: e.target.value } })} />
            </div>
            <button className="ph" style={{ height: 120, width: '100%', cursor: 'pointer', border: 'none' }} onClick={() => dispatch({ type: 'photoNope' })}>+ add a photo</button>
            <div className="field">
              <span className="label">About how long?</span>
              <ChipGroup options={chipsOf(TIME_PRESETS, d.time, (v) => v + ' min')} onPick={(time) => dispatch({ type: 'setD', patch: { time } })} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="label">Serves</span>
              <div className="stepper">
                <button className="icon-btn" onClick={() => dispatch({ type: 'serves', delta: -1 })} aria-label="Fewer servings"><Icon name="minus" /></button>
                <span style={{ fontWeight: 700, fontSize: 18, minWidth: 28, textAlign: 'center' }} aria-live="polite">{d.serves}</span>
                <button className="icon-btn" onClick={() => dispatch({ type: 'serves', delta: 1 })} aria-label="More servings"><Icon name="plus" /></button>
              </div>
            </div>
            <button className="btn btn-primary btn-block" disabled={c.noTitle} onClick={next}>Next: ingredients</button>
            {c.noTitle && <span className="why">Name your recipe to continue</span>}
          </>
        )}

        {c.step === 2 && (
          <>
            <div className="field">
              <span className="label" id="d-from">From your pantry</span>
              <ChipGroup labelledBy="d-from" options={sortedPantry(state.pantry).map((p) => ({ value: p.name, label: p.name, on: d.ings.indexOf(p.name) >= 0 }))}
                onPick={(name) => dispatch({ type: 'toggleIng', name })} />
            </div>
            <div className="field">
              <label className="label" htmlFor="d-other">Something else?</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input id="d-other" className="input" placeholder="e.g. Feta" value={d.other} onChange={(e) => dispatch({ type: 'setD', patch: { other: e.target.value } })} />
                <button className="btn" disabled={c.noOther} onClick={() => dispatch({ type: 'addOther' })}>Add</button>
              </div>
            </div>
            {c.hasIngs && (
              <div className="section" style={{ gap: 0 }}>
                <div className="inggrid inghead"><span>In this recipe ({c.ingCount})</span><span>Amount</span><span>Unit</span><span /></div>
                {c.rows.map((t) => (
                  <div key={t.name} className="inggrid ingrow">
                    <span style={{ fontWeight: 600, minWidth: 0 }}>{t.name}</span>
                    <span>
                      <label className="sr" htmlFor={'amt-' + t.i}>Amount of {t.name}</label>
                      <input id={'amt-' + t.i} className="input" type="number" inputMode="decimal" min={0} max={999} step="any" value={t.q}
                        onChange={(e) => dispatch({ type: 'setAmt', name: t.name, patch: { q: e.target.value } })}
                        aria-invalid={t.bad} aria-describedby={'amterr-' + t.i} />
                    </span>
                    <span>
                      <label className="sr" htmlFor={'unit-' + t.i}>Unit for {t.name}</label>
                      <select id={'unit-' + t.i} className="input" value={t.u} onChange={(e) => dispatch({ type: 'setAmt', name: t.name, patch: { u: e.target.value as Unit } })}>
                        {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </span>
                    <button className="icon-btn" onClick={() => dispatch({ type: 'toggleIng', name: t.name })} aria-label={'Remove ' + t.name}><Icon name="close" size="sm" /></button>
                    {t.bad && <ErrLine id={'amterr-' + t.i}>Enter an amount above 0, up to 999.</ErrLine>}
                  </div>
                ))}
              </div>
            )}
            <button className="btn btn-primary btn-block" disabled={c.blockIngs} onClick={next}>Next: steps</button>
            {c.blockIngs && <span className="why">{c.blockText}</span>}
          </>
        )}

        {c.step === 3 && (
          <>
            {d.steps.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span className="num">{i + 1}</span><span style={{ flex: 1, paddingTop: 3 }}>{t}</span>
                <button className="icon-btn" onClick={() => dispatch({ type: 'removeStep', index: i })} aria-label={'Remove step ' + (i + 1)}><Icon name="close" size="sm" /></button>
              </div>
            ))}
            <div className="field">
              <label className="label" htmlFor="d-step">Step {c.nextStepN}</label>
              <textarea id="d-step" className="input" placeholder="What happens next?" value={d.stepText} onChange={(e) => dispatch({ type: 'setD', patch: { stepText: e.target.value } })} />
              <button className="btn" disabled={c.noStepText} onClick={() => dispatch({ type: 'addStep' })}>Add step</button>
            </div>
            <button className="btn btn-primary btn-block" disabled={c.noSteps} onClick={next}>Next: review</button>
            {c.noSteps && <span className="why">Add at least one step</span>}
          </>
        )}

        {c.step === 4 && (
          <>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="ph" style={{ height: 110 }}>your photo</div>
              <span className="h2">{d.title}</span>
              <span className="small muted">{c.timeText} · Serves {d.serves} · {c.stepCount} steps</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{c.rows.map((t) => <span key={t.name}>{t.label}</span>)}</div>
            </div>
            <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'saveRecipe' })}>Save to my recipes</button>
            <button className="btn btn-ghost btn-block" onClick={() => dispatch({ type: 'back' })}>Go back and edit</button>
          </>
        )}
      </div>
    </div>
  );
}
