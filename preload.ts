import { contextBridge, ipcRenderer as r } from 'electron';
contextBridge.exposeInMainWorld('kyto', {
  pinStatus: () => r.invoke('pin:status'), pinVerify: (p: string) => r.invoke('pin:verify', p), pinChange: (o: string, n: string) => r.invoke('pin:change', o, n),
  permList: () => r.invoke('perm:list'), permSet: (a: string, m: string) => r.invoke('perm:set', a, m), audit: () => r.invoke('perm:audit'), sysInfo: () => r.invoke('sys:info'),
});
