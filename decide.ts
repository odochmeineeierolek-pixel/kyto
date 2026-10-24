export type Mode = 'allow' | 'ask' | 'deny';
export type Decision = { decision: Mode; reason: string };
export const DEFAULTS: Record<string, { mode: Mode; rule: string }> = {
  'trading.live': { mode: 'ask', rule: 'confirm_each_transaction' },
  'mining': { mode: 'allow', rule: 'allow_with_safety_limits' },
  'plugins.install': { mode: 'allow', rule: 'allow_after_validation' },
  'files.approved': { mode: 'allow', rule: 'allow_within_approved_directories' },
};
export interface Ctx {
  paper?: boolean; dataFresh?: boolean; limitsOk?: boolean;
  tempOk?: boolean; approvedHardware?: boolean;
  validated?: boolean; criticalPerms?: boolean;
  path?: string; approvedDirs?: string[]; destructive?: boolean;
}
const norm = (p: string) => p.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();
export function inside(p: string, dirs: string[]) {
  if (p.includes('..')) return false;
  const n = norm(p);
  return dirs.some(d => n === norm(d) || n.startsWith(norm(d) + '/'));
}
/** Harte Regeln: der gespeicherte Modus kann sie nur verschärfen, nie lockern. */
export function decide(action: string, stored: Mode, c: Ctx = {}): Decision {
  if (stored === 'deny') return { decision: 'deny', reason: 'Vom Benutzer gesperrt' };
  switch (action) {
    case 'trading.live':
      if (c.paper) return { decision: 'allow', reason: 'Paper-Trading' };
      if (!c.dataFresh) return { decision: 'deny', reason: 'Kursdaten fehlen oder sind veraltet' };
      if (!c.limitsOk) return { decision: 'deny', reason: 'Risikolimit überschritten' };
      return { decision: 'ask', reason: 'Bestätigung pro Auftrag erforderlich' };
    case 'mining':
      if (!c.approvedHardware) return { decision: 'deny', reason: 'Hardware nicht freigegeben' };
      if (!c.tempOk) return { decision: 'deny', reason: 'Temperatur-/Leistungslimit verletzt' };
      return { decision: stored, reason: 'Mit Sicherheitslimits' };
    case 'plugins.install':
      if (!c.validated) return { decision: 'deny', reason: 'Sicherheitsprüfung nicht bestanden' };
      if (c.criticalPerms) return { decision: 'ask', reason: 'Kritische Berechtigungen brauchen separate Freigabe' };
      return { decision: stored, reason: 'Prüfung bestanden' };
    case 'files.approved':
      if (!c.path || !inside(c.path, c.approvedDirs ?? [])) return { decision: 'deny', reason: 'Außerhalb freigegebener Ordner' };
      if (c.destructive) return { decision: 'ask', reason: 'Destruktive Aktion braucht Bestätigung' };
      return { decision: stored, reason: 'In freigegebenem Ordner' };
  }
  return { decision: 'ask', reason: 'Unbekannte Aktion' };
}
