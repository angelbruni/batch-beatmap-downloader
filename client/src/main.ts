import { app, BrowserWindow, nativeTheme } from "electron";
import isDev from "electron-is-dev";
import Store from "electron-persist-secure/lib/store";
import updateElectronApp from 'update-electron-app'
import log from 'electron-log'
updateElectronApp({ logger: log })

// Import all IPCs to make sure they register their respective listeners
import "./app/ipc/main";
// import "./app/ipc/anything";

// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

// Make sure to call this ONCE.
const createStores = (): void => {
  new Store({
    configName: "config", // The stores name
  });
};

export let window: BrowserWindow;
export const name: string = "james"

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 720,
    width: 1280,
    minHeight: 720,
    minWidth: 1280,
    title: "Batch Beatmap Downloader",
    titleBarStyle: "hidden",
    icon: "./render/assets/bbd.ico",
    backgroundColor: "#fff",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  window = mainWindow;
  mainWindow.setMenu(null);
  mainWindow.on("close", () => {
    mainWindow.destroy();
  });

  // enable dev tools
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
};

app.on("activate", () => {
  app.disableHardwareAcceleration();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createStores();
  createWindow();
  nativeTheme.themeSource = "dark";
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
