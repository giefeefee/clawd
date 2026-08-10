const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

const STATE_DIR = path.join(process.env.LOCALAPPDATA, 'clawd');
const STATE_FILE = path.join(STATE_DIR, 'state.json');

let win = null;
let tray = null;
let stateWatcher = null;

function createWindow() {
  win = new BrowserWindow({
    width: 256,
    height: 256,
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

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  tray = new Tray(nativeImage.createFromPath(iconPath));
  tray.setToolTip('爪爪 — Claude Code Companion');

  const menu = Menu.buildFromTemplate([
    { label: '給爪爪咖啡 ☕', click: () => writeState('coffee') },
    { label: '拍拍手 👏', click: () => writeState('clap') },
    { type: 'separator' },
    { label: '離開', click: () => app.quit() }
  ]);
  tray.setContextMenu(menu);
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
