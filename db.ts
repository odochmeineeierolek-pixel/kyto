import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
const MIGRATIONS = [`
CREATE TABLE settings(k TEXT PRIMARY KEY, v TEXT);
CREATE TABLE permissions(action TEXT PRIMARY KEY, mode TEXT NOT NULL, rule TEXT NOT NULL);
CREATE TABLE audit(id INTEGER PRIMARY KEY, ts INTEGER, module TEXT, action TEXT, result TEXT);
CREATE TABLE approved_dirs(path TEXT PRIMARY KEY);`];
export function openDb() {
  const db = new Database(path.join(app.getPath('userData'), 'kyto.db'));
  db.pragma('journal_mode=WAL');
  const v = db.pragma('user_version', { simple: true }) as number;
  for (let i = v; i < MIGRATIONS.length; i++) { db.exec(MIGRATIONS[i]); db.pragma(`user_version=${i + 1}`); }
  return db;
}
