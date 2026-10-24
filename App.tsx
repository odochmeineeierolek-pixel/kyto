import { useEffect, useState } from 'react';
declare global { interface Window { kyto: any } }
const K = () => window.kyto;
function Lock({ onOpen }: { onOpen: () => void }) {
  const [pin, setPin] = useState(''); const [err, setErr] = useState(''); const [must, setMust] = useState(false); const [np, setNp] = useState('');
  const submit = async (p: string) => {
    const r = await K().pinVerify(p); setPin('');
    if (r.ok) { r.mustChange ? (setMust(true), setPin(p)) : onOpen(); }
    else setErr(r.lockedMs ? `Gesperrt für ${Math.ceil(r.lockedMs / 1000)} s` : `Falsche PIN (${r.left} Versuche übrig)`);
  };
  useEffect(() => { const h = (e: KeyboardEvent) => { if (must) return; if (/^\d$/.test(e.key)) setPin(p => p.length < 6 ? p + e.key : p); if (e.key === 'Backspace') setPin(p => p.slice(0, -1)); if (e.key === 'Enter') setPin(p => (submit(p), p)); }; addEventListener('keydown', h); return () => removeEventListener('keydown', h); });
  if (must) return <div className="lock"><h2>PIN festlegen</h2><p className="note">Die Standard-PIN muss beim ersten Start geändert werden.</p>
    <input type="password" inputMode="numeric" placeholder="Neue PIN (4–12 Ziffern)" value={np} onChange={e => setNp(e.target.value)} />
    <button onClick={async () => { const r = await K().pinChange('6894', np); r.ok ? onOpen() : setErr(r.error); }}>Speichern</button><div className="err">{err}</div></div>;
  return <div className="lock"><h2 style={{ letterSpacing: '.4em' }}>KYTO</h2>
    <div className="dots">{Array.from({ length: Math.max(4, pin.length) }).map((_, i) => <span key={i} className={'dot' + (i < pin.length ? ' on' : '')} />)}</div>
    <div className="pad">{[1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '⏎'].map(k => <button key={k} onClick={() => k === '⌫' ? setPin(pin.slice(0, -1)) : k === '⏎' ? submit(pin) : setPin(p => p + k)}>{k}</button>)}</div>
    <div className="err">{err}</div><p className="note">Die PIN ist ein App-Sperrmechanismus und ersetzt keine Windows-Kontosicherheit.</p></div>;
}
const STATES = ['standby', 'listening', 'thinking', 'speaking', 'working', 'error'];
function Home() { const [s, setS] = useState('standby'); return <><div className={'ring ' + s}>KYTO</div><div className="states">{STATES.map(x => <button key={x} onClick={() => setS(x)}>{x}</button>)}</div><p className="note" style={{ margin: '20px auto' }}>Demo der Kreiszustände. KI/Sprache sind noch nicht angebunden.</p></>; }
function Perms() {
  const [l, setL] = useState<any[]>([]); const [a, setA] = useState<any[]>([]); const [msg, setMsg] = useState('');
  const load = async () => { setL(await K().permList()); setA(await K().audit()); }; useEffect(() => { load(); }, []);
  const set = async (act: string, m: string) => { const r = await K().permSet(act, m); setMsg(r.ok ? '' : r.error); load(); };
  return <><h2>Permission Center</h2><div className="err">{msg}</div>
    {l.map(p => <div className="row" key={p.action}><div><b>{p.action}</b><div className="note" style={{ textAlign: 'left' }}>Regel: {p.rule}</div></div>
      <select value={p.mode} onChange={e => set(p.action, e.target.value)}><option value="allow">Erlauben</option><option value="ask">Fragen</option><option value="deny">Sperren</option></select></div>)}
    <h3>Protokoll</h3>{a.map(r => <div key={r.id} className="note" style={{ textAlign: 'left' }}>{new Date(r.ts).toLocaleTimeString()} · {r.module} · {r.action} · {r.result}</div>)}</>;
}
function Sys() { const [i, setI] = useState<any>(); useEffect(() => { K().sysInfo().then(setI); }, []); if (!i) return null; const g = (b: number) => (b / 2 ** 30).toFixed(1) + ' GB';
  return <><h2>PC-Übersicht</h2><div className="row">CPU<span>{i.cpu} ({i.cores} Kerne)</span></div><div className="row">RAM<span>{g(i.totalMem - i.freeMem)} / {g(i.totalMem)}</span></div></>; }
const NAV = [['🏠', 'Start', Home], ['🖥', 'PC-Übersicht', Sys], ['🛡', 'Permission Center', Perms]] as const;
export default function App() {
  const [ok, setOk] = useState(false); const [t, setT] = useState(0);
  if (!ok) return <Lock onOpen={() => setOk(true)} />;
  const V = NAV[t][2];
  return <div className="shell"><nav className="side">{NAV.map((n, i) => <button key={i} title={n[1]} className={i === t ? 'act' : ''} onClick={() => setT(i)}>{n[0]}</button>)}</nav><main className="main"><V /></main></div>;
}
