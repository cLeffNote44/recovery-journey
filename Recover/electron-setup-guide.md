# Adding Electron for Desktop Apps

## Quick Setup

### 1. Install Electron

```bash
npm install --save-dev electron electron-builder
```

### 2. Create electron.js

Create `electron.js` in the source folder:

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'public/icons/icon-512x512.png')
  });

  // In production, load the built files
  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  } else {
    // In development, load from dev server
    win.loadURL('http://localhost:5173');
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

### 3. Update package.json

Add these scripts and config:

```json
{
  "main": "electron.js",
  "scripts": {
    "electron:dev": "electron .",
    "electron:build": "npm run build && electron-builder",
    "electron:build:win": "electron-builder --win",
    "electron:build:mac": "electron-builder --mac",
    "electron:build:linux": "electron-builder --linux"
  },
  "build": {
    "appId": "io.getrecover.app",
    "productName": "Recover",
    "files": [
      "dist/**/*",
      "electron.js"
    ],
    "directories": {
      "output": "electron-dist"
    },
    "win": {
      "target": ["nsis"],
      "icon": "public/icons/icon-512x512.png"
    },
    "mac": {
      "target": ["dmg"],
      "icon": "public/icons/icon-512x512.png"
    },
    "linux": {
      "target": ["AppImage"],
      "icon": "public/icons/icon-512x512.png"
    }
  }
}
```

### 4. Build Desktop Apps

```bash
# Windows installer
npm run electron:build:win

# Mac DMG
npm run electron:build:mac

# Linux AppImage
npm run electron:build:linux
```

### Output

You'll get installers in the `electron-dist/` folder:
- Windows: `.exe` installer
- Mac: `.dmg` disk image
- Linux: `.AppImage` executable

### File Sizes

Expect ~100-150 MB installers (includes Chromium browser).
