import { describe, it, expect } from 'vitest';
import { decide, inside } from '../electron/decide';
describe('Permission-Regeln', () => {
  it('Live-Trading fragt immer, auch bei gespeichertem allow', () => expect(decide('trading.live', 'allow', { dataFresh: true, limitsOk: true }).decision).toBe('ask'));
  it('Trading blockiert ohne frische Daten', () => expect(decide('trading.live', 'ask', { limitsOk: true }).decision).toBe('deny'));
  it('Paper-Trading ohne Bestätigung', () => expect(decide('trading.live', 'ask', { paper: true }).decision).toBe('allow'));
  it('Mining stoppt bei Überhitzung', () => expect(decide('mining', 'allow', { approvedHardware: true, tempOk: false }).decision).toBe('deny'));
  it('Plugin ohne Prüfung blockiert', () => expect(decide('plugins.install', 'allow', {}).decision).toBe('deny'));
  it('Kritische Plugin-Rechte fragen', () => expect(decide('plugins.install', 'allow', { validated: true, criticalPerms: true }).decision).toBe('ask'));
  it('Dateien nur in freigegebenen Ordnern', () => { expect(decide('files.approved', 'allow', { path: 'C:/x/a.txt', approvedDirs: ['D:/k'] }).decision).toBe('deny'); expect(inside('D:/k/../x', ['D:/k'])).toBe(false); });
  it('Löschen fragt nach', () => expect(decide('files.approved', 'allow', { path: 'D:/k/a', approvedDirs: ['D:/k'], destructive: true }).decision).toBe('ask'));
});
