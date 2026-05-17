const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const youtubedl = require('youtube-dl-exec');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 650,
    height: 650,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });0

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('select-folder', async (event) => {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Écoute de l'événement de téléchargement demandé par le front-end
ipcMain.handle('download-video', async (event, { url, format, directory, filename }) => {
  try {
    const nameTemplate = filename ? `${filename}.%(ext)s` : `%(title)s.%(ext)s`;
    const outputPath = path.join(directory, nameTemplate);

    const options = {
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: [
        'referer:youtube.com',
        'user-agent:Mozilla/5.0'
      ]
    };

    if (format === 'mp3') {
      options.extractAudio = true;
      options.audioFormat = 'mp3';
      options.output = outputPath;
    } else {
      options.format = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
      options.mergeOutputFormat = 'mp4';
      options.output = outputPath;
    }

    await youtubedl(url, options);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
});
