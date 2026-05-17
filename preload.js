const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  downloadVideo: (url, format, directory, filename) => ipcRenderer.invoke('download-video', { url, format, directory, filename }),
  selectFolder: () => ipcRenderer.invoke('select-folder')
});
