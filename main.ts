import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path'; import os from 'os';
import { openDb } from './db'; import { PinService } from './pin'; import { PermissionService } from './permissions';
let unlocked = false;
const guard = <T>(f: (...a: any[]) => T) => (_e: unknown, ...a: any[]) => { if (!unlocked) throw new Error('Gesperrt'); return f(...a); };
app.whenReady().then(() => {
  const db = openDb(), pin = new PinService(db), perms = new PermissionService(db);
  ipcMain.handle('pin:status', () => pin.status());
  ipcMain.handle('pin:verify', (_e, p: string) => { const r = pin.verify(String(p)); if (r.ok) unlocked = true; return r; });
  ipcMain.handle('pin:change', (_e, o: string, n: string) => pin.change(String(o), String(n)));
  ipcMain.handle('perm:list', guard(() => perms.list()));
  ipcMain.handle('perm:set', guard((a: string, m: any) => perms.setMode(a, m, 'user')));
  ipcMain.handle('perm:audit', guard(() => perms.recent()));
  ipcMain.handle('sys:info', guard(() => ({ cpu: os.cpus()[0]?.model, cores: os.cpus().length, totalMem: os.totalmem(), freeMem: os.freemem() })));
  const win = new BrowserWindow({ width: 1200, height: 780, minWidth: 800, minHeight: 560, backgroundColor: '#0b0b0f', title: 'Kyto Task',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  process.env.VITE_DEV ? win.loadURL('http://localhost:5173') : win.loadFile(path.join(__dirname, '../dist/index.html'));
});
app.on('window-all-closed', () => app.quit());
