const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  storeNsec: (nsec) => ipcRenderer.invoke('store-nsec', nsec),
  getNsec: () => ipcRenderer.invoke('get-nsec'),
  validateNsec: (nsec) => ipcRenderer.invoke('validate-nsec', nsec),
});