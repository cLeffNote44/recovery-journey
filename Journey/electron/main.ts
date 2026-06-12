import { app, BrowserWindow, ipcMain, dialog, shell, session } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import { pathToFileURL } from 'url';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// The single origin the renderer is allowed to navigate within: the dev
// server in development, or the packaged renderer directory in production.
// Navigation anywhere else (incl. arbitrary file:// paths) is blocked.
const APP_ORIGIN = isDev
  ? 'http://localhost:5173'
  : pathToFileURL(path.join(__dirname, '../renderer')).toString();

function isAllowedNavigation(targetUrl: string): boolean {
  return targetUrl.startsWith(APP_ORIGIN);
}

// ============================================================================
// SECURITY HARDENING
// ============================================================================

/**
 * Lock down a webContents: block in-app navigation away from the app origin,
 * deny new-window creation (open safe external links in the OS browser), and
 * deny all permission/device requests. Applied to every webContents created.
 */
function hardenWebContents(contents: Electron.WebContents): void {
  // Block navigations to anything other than the app's own origin.
  contents.on('will-navigate', (event, url) => {
    if (!isAllowedNavigation(url)) {
      event.preventDefault();
    }
  });

  // Never let the renderer spawn new Electron windows pointing at remote
  // content. http(s) links open in the user's real browser. The app's own
  // blank popups (used to build the print/export view) are allowed but
  // inherit the parent's hardened webPreferences.
  contents.setWindowOpenHandler(({ url }) => {
    if (url === '' || url === 'about:blank') {
      return { action: 'allow' };
    }
    if (/^https?:\/\//i.test(url)) {
      void shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Block <webview> embedding entirely.
  contents.on('will-attach-webview', (event) => {
    event.preventDefault();
  });

  // Deny redirects that leave the app origin.
  contents.on('will-redirect', (event, url) => {
    if (!isAllowedNavigation(url)) {
      event.preventDefault();
    }
  });
}

// ============================================================================
// AUTO-UPDATER CONFIGURATION
// ============================================================================

function setupAutoUpdater() {
  if (isDev) {
    console.log('Auto-updater disabled in development mode');
    return;
  }

  // SECURITY: electron-updater only verifies update-package signatures when
  // the app itself is code-signed. Before shipping auto-updates, the macOS
  // build MUST be signed + notarized and the Windows build MUST be
  // Authenticode-signed (configure signing identities in electron-builder via
  // CI secrets). Do NOT enable auto-update from an unsigned/ad-hoc build —
  // an unsigned channel can ship malicious updates.

  // Configure auto-updater
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  // Check for updates on startup
  autoUpdater.checkForUpdates();

  // Check for updates every 4 hours
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 4 * 60 * 60 * 1000);

  // Auto-updater events
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...');
    sendToRenderer('update-status', 'checking');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
    sendToRenderer('update-status', 'available', info);

    // Show dialog to user
    dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available. Would you like to download it now?`,
      buttons: ['Download', 'Later'],
      defaultId: 0,
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
  });

  autoUpdater.on('update-not-available', () => {
    console.log('No updates available');
    sendToRenderer('update-status', 'not-available');
  });

  autoUpdater.on('download-progress', (progress) => {
    console.log(`Download progress: ${Math.round(progress.percent)}%`);
    sendToRenderer('update-progress', progress);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version);
    sendToRenderer('update-status', 'downloaded', info);

    // Show dialog to restart
    dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title: 'Update Ready',
      message: `Version ${info.version} has been downloaded. Restart now to apply the update?`,
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall(false, true);
      }
    });
  });

  autoUpdater.on('error', (error) => {
    console.error('Auto-updater error:', error);
    sendToRenderer('update-status', 'error', error.message);
  });
}

function sendToRenderer(channel: string, ...args: any[]) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send(channel, ...args);
  }
}

// ============================================================================
// WINDOW CREATION
// ============================================================================

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    show: false,
    backgroundColor: '#1e3a8a',
    icon: path.join(__dirname, '../../assets/icon.png'),
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  hardenWebContents(mainWindow.webContents);

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ============================================================================
// APP LIFECYCLE
// ============================================================================

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // Deny all permission/device requests (camera, mic, geolocation, USB, …);
    // this clinical app needs none of them.
    session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => {
      callback(false);
    });
    session.defaultSession.setPermissionCheckHandler(() => false);

    // Harden every webContents that gets created (defense in depth).
    app.on('web-contents-created', (_event, contents) => {
      hardenWebContents(contents);
    });

    createWindow();
    setupAutoUpdater();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (app.isReady() && BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}

// ============================================================================
// IPC HANDLERS
// ============================================================================

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('check-for-updates', () => {
  if (!isDev) {
    autoUpdater.checkForUpdates();
  }
});

ipcMain.handle('download-update', () => {
  if (!isDev) {
    autoUpdater.downloadUpdate();
  }
});

ipcMain.handle('install-update', () => {
  if (!isDev) {
    autoUpdater.quitAndInstall(false, true);
  }
});
