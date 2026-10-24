import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';
import type Database from 'better-sqlite3';
export class PinService {
  constructor(private db: Database.Database) {
    if (!this.get('pin')) { this.store('6894'); this.set('mustChange', '1'); }
  }
  private get(k: string) { return (this.db.prepare('SELECT v FROM settings WHERE k=?').get(k) as any)?.v as string | undefined; }
  private set(k: string, v: string) { this.db.prepare('INSERT OR REPLACE INTO settings VALUES(?,?)').run(k, v); }
  private store(pin: string) { const s = randomBytes(16); this.set('pin', s.toString('hex') + ':' + scryptSync(pin, s, 32).toString('hex')); }
  private matches(pin: string) {
    const [s, h] = this.get('pin')!.split(':');
    return timingSafeEqual(scryptSync(pin, Buffer.from(s, 'hex'), 32), Buffer.from(h, 'hex'));
  }
  status() { return { mustChange: this.get('mustChange') === '1', lockedMs: Math.max(0, Number(this.get('lockUntil') ?? 0) - Date.now()) }; }
  verify(pin: string) {
    const st = this.status(); if (st.lockedMs > 0) return { ok: false, lockedMs: st.lockedMs };
    if (this.matches(pin)) { this.set('fails', '0'); return { ok: true, mustChange: st.mustChange }; }
    const f = Number(this.get('fails') ?? 0) + 1; this.set('fails', String(f));
    if (f >= 5) { const ms = 30000 * 2 ** Math.min(f - 5, 6); this.set('lockUntil', String(Date.now() + ms)); return { ok: false, lockedMs: ms }; }
    return { ok: false, left: 5 - f };
  }
  change(oldPin: string, newPin: string) {
    if (!/^\d{4,12}$/.test(newPin)) return { ok: false, error: 'PIN: 4–12 Ziffern' };
    if (newPin === '6894') return { ok: false, error: 'Standard-PIN nicht erlaubt' };
    if (!this.matches(oldPin)) return { ok: false, error: 'Alte PIN falsch' };
    this.store(newPin); this.set('mustChange', '0'); return { ok: true };
  }
}
