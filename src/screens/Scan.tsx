import { ChipGroup, chipsOf } from '../components/Chip';
import { CustomPlace, CustomTime } from '../components/CustomForms';
import { BackButton } from '../components/TopBar';
import { SCAN_DAY_PRESETS } from '../state/seed';
import { dayFmt, dayOpts, locations } from '../state/selectors';
import { useStore } from '../store';

export function Scan() {
  const { dispatch } = useStore();
  return (
    <div className="screen scan" style={{ background: '#1D3B28', color: '#FEF8EE' }}>
      <div className="topbar">
        <BackButton label="Close scanner" icon="close" style={{ color: '#FEF8EE' }} />
        <p className="title" style={{ color: '#FEF8EE' }}>Scan an item</p>
      </div>
      <div className="scroll" style={{ alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <div style={{ width: 260, height: 260, border: '3px dashed #BA9F38', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
          <span className="note" style={{ color: '#FCEBD0' }}>camera view goes here<br />(not in this prototype)</span>
        </div>
        <p style={{ margin: 0, textAlign: 'center', color: '#FEF8EE', maxWidth: 280 }}>Point at a barcode, label, or loose produce.</p>
        <button className="btn btn-block" style={{ background: '#FEF8EE', color: '#1D3B28' }} onClick={() => dispatch({ type: 'simScan' })}>Pretend to scan: baby spinach</button>
        <button className="btn btn-ghost" style={{ color: '#FEF8EE' }} onClick={() => dispatch({ type: 'goManualFromScan' })}>Type it in instead</button>
      </div>
    </div>
  );
}

export function ScanResult() {
  const { state, dispatch } = useStore();
  return (
    <div className="screen">
      <div className="topbar"><BackButton /><p className="title">We found</p></div>
      <div className="scroll">
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div className="ph" style={{ width: 88, height: 88 }}>spinach</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span className="h2">Baby spinach</span><span className="muted">1 bag</span></div>
        </div>
        <div className="field">
          <span className="label" id="s-where">Where will you keep it?</span>
          <ChipGroup labelledBy="s-where" options={chipsOf(locations(state), state.scanLoc)} onPick={(loc) => dispatch({ type: 'setScanLoc', loc })} />
          <CustomPlace />
        </div>
        <div className="field">
          <span className="label" id="s-days">Good for about</span>
          <ChipGroup labelledBy="s-days" options={chipsOf(dayOpts(SCAN_DAY_PRESETS, state.scanDays), state.scanDays, dayFmt)} onPick={(days) => dispatch({ type: 'setScanDays', days })} />
          <CustomTime />
          <span className="small muted">Our guess. Change it if needed.</span>
        </div>
        <button className="btn btn-primary btn-block" onClick={() => dispatch({ type: 'addScanned' })}>Add to my pantry</button>
        <button className="btn btn-ghost" onClick={() => dispatch({ type: 'rescan' })}>Scan again</button>
      </div>
    </div>
  );
}
