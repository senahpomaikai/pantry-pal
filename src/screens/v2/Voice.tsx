// v2: say a grocery out loud; we pick out the item, brand, amount, size and expiration.
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/Icon';
import { Photo, foodPhoto } from '../../components/Photo';
import { BackButton } from '../../components/TopBar';
import { DupWarning } from '../../components/V2Fields';
import { findFood } from '../../state/foods';
import { dayFmt } from '../../state/selectors';
import { VOICE_SAMPLES, duplicateOf, parseVoice, voiceQty } from '../../state/v2';
import { useStore } from '../../store';

interface Recognizer {
  lang: string; interimResults: boolean; start(): void; stop(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null; onend: (() => void) | null;
}
type RecognizerCtor = new () => Recognizer;
const SpeechCtor = (window as unknown as { SpeechRecognition?: RecognizerCtor; webkitSpeechRecognition?: RecognizerCtor });
const Ctor = SpeechCtor.SpeechRecognition ?? SpeechCtor.webkitSpeechRecognition;

const PRETEND_MS = 1400;
let sample = 0;

const expiresText = (days: number) => (days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : 'In ' + dayFmt(days));

export function Voice() {
  const { state, dispatch } = useStore();
  const [listening, setListening] = useState(false);
  const rec = useRef<Recognizer | null>(null);
  const timer = useRef<number>(0);
  const setText = (text: string) => dispatch({ type: 'setVoiceText', text });

  useEffect(() => () => { rec.current?.stop(); clearTimeout(timer.current); }, []);

  // Without a real recognizer (or if it fails), pretend: listen briefly, then "hear" a sample sentence.
  const pretend = () => {
    setListening(true);
    timer.current = window.setTimeout(() => { setText(VOICE_SAMPLES[sample++ % VOICE_SAMPLES.length]); setListening(false); }, PRETEND_MS);
  };

  const listen = () => {
    if (listening) { rec.current?.stop(); clearTimeout(timer.current); setListening(false); return; }
    if (!Ctor) return pretend();
    try {
      const r = new Ctor();
      let heard = false;
      r.lang = 'en-US';
      r.interimResults = true;
      r.onresult = (e) => { heard = true; setText(Array.from(e.results).map((x) => x[0].transcript).join(' ')); };
      r.onerror = () => { r.onend = null; setListening(false); if (!heard) pretend(); };
      r.onend = () => setListening(false);
      rec.current = r;
      r.start();
      setListening(true);
    } catch { pretend(); }
  };

  const item = parseVoice(state.voiceText);
  const food = item ? findFood(item.name) : undefined;
  const fields: [string, string][] = item ? [
    ['Item', item.name],
    ['Brand', item.brand || '—'],
    ['Amount', voiceQty(item) || '1'],
    ['Expires', item.days !== null ? expiresText(item.days) : 'Auto-filled'],
    ['Place', food?.loc ?? 'Fridge'],
  ] : [];

  return (
    <div className="screen">
      <div className="topbar"><BackButton /><p className="title">Say it</p></div>
      <div className="scroll" style={{ gap: 18 }}>
        <div className="mic-wrap">
          <button className={'mic' + (listening ? ' on' : '')} aria-pressed={listening} aria-label={listening ? 'Stop listening' : 'Start listening'} onClick={listen}>
            <Icon name="mic" />
          </button>
          <span className="small muted" aria-live="polite">{listening ? 'Listening…' : 'Tap and say what you bought'}</span>
        </div>
        <div className="field">
          <label className="label" htmlFor="v-text">Heard</label>
          <textarea id="v-text" className="input voice-text" rows={2} placeholder="“Two half gallons of Horizon milk, expires Friday”"
            value={state.voiceText} onChange={(e) => setText(e.target.value)} />
        </div>
        {item && (
          <div className="card voice-card">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Photo src={foodPhoto(item.name)} style={{ width: 52, height: 52, borderRadius: 12 }} />
              <span className="h3">{(item.brand ? item.brand + ' ' : '') + item.name}</span>
            </div>
            <dl className="vfields">
              {fields.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </div>
        )}
        {item && <DupWarning item={duplicateOf(state.pantry, item.name)} />}
        <button className="btn btn-primary btn-block" disabled={!item} onClick={() => item && dispatch({ type: 'addVoice', item })}>Add to my pantry</button>
        {state.addedNow > 0 && <button className="btn btn-ghost btn-block" onClick={() => dispatch({ type: 'doneAdding' })}>Done</button>}
      </div>
    </div>
  );
}
