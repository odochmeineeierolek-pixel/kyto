import type Database from 'better-sqlite3';
import { DEFAULTS, decide, Mode, Ctx, Decision } from './decide';
export class PermissionService {
  constructor(private db: Database.Database) {
    const ins = db.prepare('INSERT OR IGNORE INTO permissions(action,mode,rule) VALUES(?,?,?)');
    for (const [a, d] of Object.entries(DEFAULTS)) ins.run(a, d.mode, d.rule);
  }
  list() { return this.db.prepare('SELECT action,mode,rule FROM permissions').all(); }
  audit(module: string, action: string, result: string) {
    this.db.prepare('INSERT INTO audit(ts,module,action,result) VALUES(?,?,?,?)').run(Date.now(), module, action, result);
  }
  recent() { return this.db.prepare('SELECT * FROM audit ORDER BY id DESC LIMIT 100').all(); }
  /** Nur der Benutzer darf ändern. Live-Trading kann nie pauschal auf 'allow' gestellt werden. */
  setMode(action: string, mode: Mode, actor: 'user' | 'plugin' | 'ai'): { ok: boolean; error?: string } {
    if (actor !== 'user') { this.audit(actor, 'perm.set:' + action, 'blockiert'); return { ok: false, error: 'Nur der Benutzer darf Berechtigungen ändern' }; }
    if (!DEFAULTS[action]) return { ok: false, error: 'Unbekannte Aktion' };
    if (action === 'trading.live' && mode === 'allow') return { ok: false, error: 'Live-Trading kann nicht pauschal erlaubt werden' };
    this.db.prepare('UPDATE permissions SET mode=? WHERE action=?').run(mode, action);
    this.audit('user', 'perm.set:' + action, mode);
    return { ok: true };
  }
  check(module: string, action: string, ctx: Ctx = {}): Decision {
    const row = this.db.prepare('SELECT mode FROM permissions WHERE action=?').get(action) as { mode: Mode } | undefined;
    const r = decide(action, row?.mode ?? 'ask', ctx);
    this.audit(module, action, `${r.decision}: ${r.reason}`);
    return r;
  }
}
