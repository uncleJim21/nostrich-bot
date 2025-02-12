import { app, BrowserWindow,nativeImage, ipcMain} from 'electron';
import path from 'node:path';
import dotenv from 'dotenv';
import started from 'electron-squirrel-startup';
import { createServer } from './server/createServer.ts'; 
import store from './server/config/store.ts';
import { NostrService } from './server/services/nostrService.ts';
import fetch from 'node-fetch';




const iconPath = process.platform === 'win32'
  ? path.join(__dirname, 'icons/win/icon.ico')
  : process.platform === 'darwin'
    ? path.join(__dirname, 'icons/mac/icon.icns')
    : path.join(__dirname, 'icons/png/64x64.png');
console.log('Icon path:', iconPath);
console.log('Icon exists:', require('fs').existsSync(iconPath));


dotenv.config(); // Load environment variables from .env

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let server = null;

const createWindow = () => {
  // Create the icon
  const iconPath = path.join(__dirname, 'icons/png/512x512.png');
  console.log('Loading icon from:', iconPath);
  console.log('Icon exists:', require('fs').existsSync(iconPath));
  
  const icon = nativeImage.createFromPath(iconPath);
  console.log('Icon is empty:', icon.isEmpty());

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
      }
    });

  // Still try setting the window icon explicitly for Linux
  if (process.platform === 'linux') {
    mainWindow.setIcon(icon);
  }

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; connect-src 'self' http://localhost:* ws://localhost:*; script-src 'self' 'unsafe-inline' 'unsafe-eval';"
        ]
      }
    });
  });

  // mainWindow.webContents.openDevTools();
};

async function checkServerAndStart() {
  try {
    // Try to reach the health endpoint
    await fetch('http://localhost:6002/health');
    console.log('Server already running');
  } catch (error) {
    console.log('Server not running, starting...');
    await createServer();
  }
}


ipcMain.handle('store-nsec', async (_, nsec: string) => {
  store.set('nsec', nsec);
  return true;
});

ipcMain.handle('get-nsec', async () => {
  return store.get('nsec');
});

ipcMain.handle('validate-nsec', async (_, nsec: string) => {
  try {
    const nostrService = new NostrService();
    return nostrService.validateNsec(nsec);
  } catch (error) {
    console.error('Error validating nsec:', error);
    return false;
  }
});

app.whenReady().then(async () => {
  // Start the server
  try {
    server = await checkServerAndStart();
    console.log('Express server started successfully.');
  } catch (error) {
    console.error('Failed to start Express server:', error);
  }

  // Create the main window
  createWindow();

  // macOS-specific behavior: Re-create a window in the app when the dock icon is clicked
  // and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Clean up the server when the app quits
app.on('before-quit', () => {
  if (server) {
    server.close(() => {
      console.log('Express server stopped.');
    });
  }
});
