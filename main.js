const { app, BrowserWindow, Tray, ipcMain, nativeImage, nativeTheme } = require('electron');
nativeTheme.themeSource = 'dark';
const path = require('path');
const fs = require('fs');
const LANG = require('./lang');

const STATE_DIR = path.join(process.env.LOCALAPPDATA, 'clawd');
const STATE_FILE = path.join(STATE_DIR, 'state.json');
const SPEECH_FILE = path.join(STATE_DIR, 'speech.json');
const USAGE_FILE = path.join(STATE_DIR, 'usage.json');
const CONFIG_FILE = path.join(STATE_DIR, 'config.json');

function readLang() {
  try {
    const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    if (LANG[cfg.lang]) return cfg.lang;
  } catch (e) {}
  return 'zh';
}

function saveLang(lang) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  let cfg = {};
  try { cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); } catch (e) {}
  cfg.lang = lang;
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg));
}

let currentLang = readLang();
let win = null;
let tray = null;
let menuWin = null;
let stateWatcher = null;

function createWindow() {
  win = new BrowserWindow({
    width: 200,
    height: 238,
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

  win.loadFile(path.join(__dirname, 'index.html'), { query: { lang: currentLang } });
  win.setIgnoreMouseEvents(true, { forward: true });
  pollState();
  stateWatcher = setInterval(pollState, 1000);
}

ipcMain.on('mouse-enter-opaque', () => {
  if (win && !win.isDestroyed()) win.setIgnoreMouseEvents(false);
});
ipcMain.on('mouse-leave-opaque', () => {
  if (win && !win.isDestroyed()) win.setIgnoreMouseEvents(true, { forward: true });
});

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
  try {
    const raw = fs.readFileSync(SPEECH_FILE, 'utf8');
    const speech = JSON.parse(raw);
    if (win && !win.isDestroyed()) {
      win.webContents.send('dynamic-speech', speech);
    }
  } catch (e) {}
  try {
    const raw = fs.readFileSync(USAGE_FILE, 'utf8');
    const usage = JSON.parse(raw);
    if (win && !win.isDestroyed()) {
      win.webContents.send('usage-update', usage);
    }
  } catch (e) {}
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
  const menuHeight = 310;
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

  menuWin.loadFile(path.join(__dirname, 'tray-menu.html'), { query: { lang: currentLang } });
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
  } else if (action.startsWith('lang:')) {
    const lang = action.split(':')[1];
    if (LANG[lang]) {
      saveLang(lang);
      app.relaunch();
      app.exit(0);
    }
  } else {
    writeState(action);
  }
});

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  tray = new Tray(nativeImage.createFromPath(iconPath));
  tray.setToolTip(LANG[currentLang].tooltip);
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
