import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import dotenv from 'dotenv';
import started from 'electron-squirrel-startup';
import { createServer } from './server/createServer.ts'; // Adjust the path based on your folder structure

dotenv.config(); // Load environment variables from .env


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let server = null;

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY, // Provided by Webpack
    },
  });

  // Load the main HTML or React app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY); // Provided by Webpack

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  // Start the server
  try {
    server = createServer();
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
