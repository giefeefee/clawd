const { app, BrowserWindow, Tray, ipcMain, nativeImage, nativeTheme } = require('electron');
nativeTheme.themeSource = 'dark';
const path = require('path');
const fs = require('fs');

const STATE_DIR = path.join(process.env.LOCALAPPDATA, 'clawd');
const STATE_FILE = path.join(STATE_DIR, 'state.json');

let win = null;
let tray = null;
let menuWin = null;
let stateWatcher = null;

function createWindow() {
  win = new BrowserWindow({
    width: 128,
    height: 128,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  pollState();
  stateWatcher = setInterval(pollState, 1000);
}

function pollState() {
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf8');
    const state = JSON.parse(raw);
    if (win && !win.isDestroyed()) {
      win.webContents.send('state-change', state);
    }
  } catch (e) {
    if (win && !win.isDestroyed()) {
      win.webContents.send('state-change', { event: 'none', timestamp: 0 });
    }
  }
}

function writeState(event) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify({ event, timestamp: Date.now() }));
  pollState();
}

function showTrayMenu(bounds) {
  if (menuWin && !menuWin.isDestroyed()) {
    menuWin.close();
    menuWin = null;
    return;
  }

  const menuWidth = 160;
  const menuHeight = 222;
  const x = Math.round(bounds.x + bounds.width / 2 - menuWidth / 2);
  const y = Math.round(bounds.y - menuHeight);

  menuWin = new BrowserWindow({
    width: menuWidth,
    height: menuHeight,
    x, y,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    focusable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  menuWin.loadFile(path.join(__dirname, 'tray-menu.html'));
  menuWin.on('blur', () => {
    if (menuWin && !menuWin.isDestroyed()) {
      menuWin.close();
      menuWin = null;
    }
  });
}

ipcMain.on('tray-menu-action', (event, action) => {
  if (menuWin && !menuWin.isDestroyed()) {
    menuWin.close();
    menuWin = null;
  }
  if (action === 'quit') {
    app.quit();
  } else {
    writeState(action);
  }
});

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  tray = new Tray(nativeImage.createFromPath(iconPath));
  tray.setToolTip('爪爪 — Claude Code Companion');
  tray.on('click', (event, bounds) => showTrayMenu(bounds));
  tray.on('right-click', (event, bounds) => showTrayMenu(bounds));
}

ipcMain.on('window-drag', (event, { dx, dy }) => {
  if (!win) return;
  const [x, y] = win.getPosition();
  win.setPosition(x + dx, y + dy);
});

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => app.quit());
