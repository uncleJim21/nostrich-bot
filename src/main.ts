import { app, BrowserWindow,nativeImage } from 'electron';
import path from 'node:path';
import dotenv from 'dotenv';
import started from 'electron-squirrel-startup';
import { createServer } from './server/createServer.ts'; // Adjust the path based on your folder structure

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
    icon: icon,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
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
          "default-src 'self'; connect-src 'self' http://localhost:6001; script-src 'self' 'unsafe-inline' 'unsafe-eval';",
        ],
      },
    });
  });

  mainWindow.webContents.openDevTools();
};


app.whenReady().then(async () => {
  // Start the server
  try {
    server = await createServer();
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
