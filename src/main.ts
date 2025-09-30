import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { Batch } from "./types";
import fs from "node:fs";
import paletteSorter from "./bridges/palette-sorter";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import i18n from "./i18n";
import { store } from "./store";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on("ready", createWindow);
app.whenReady().then(async () => {
  try {
    await checkImageMagick();
    createWindow();
  } catch (e) {
    dialog.showErrorBox(
      i18n.t("magickNotFound"),
      i18n.t("magickNotFoundDetail")
    );
    app.exit(1);
  }
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const queue: Array<{ batch: Batch; wc: Electron.WebContents }> = [];
let running = false;

const imagick = `magick`;
const execFileAsync = promisify(execFile);

// 起動時のImageMagickV7チェック
async function checkImageMagick(): Promise<string> {
  try {
    const { stdout } = await execFileAsync("magick", ["-version"]);
    const line = stdout.split(/\r?\n/)[0] ?? "";
    const m = line.match(/ImageMagick\s+(\d+)\./i);
    if (!m) throw new Error("version text not found.");
    const major = Number(m[1]);
    if (Number.isNaN(major) || major < 7) {
      throw new Error(`version check error.`);
    }
    return m[0];
  } catch (e) {
    throw new Error("Magick command not found.");
  }
}

ipcMain.handle("select-output-dir", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (result.canceled) return null;
  return result.filePaths[0]; // 選択されたフォルダの絶対パス
});

ipcMain.handle("get-settings", () => {
  const transparentColor = store.get("transparentColor");
  const outputPath = store.get("outputPath");
  const lang = store.get("lang");
  return { transparentColor, outputPath, lang };
});

ipcMain.handle("set-settings", async (event, { key, value }) => {
  store.set(key, value);
});

ipcMain.handle("exec-magic-pot", async (event, batch: Batch) => {
  const wc = event.sender;

  queue.push({ batch, wc });

  if (!running) {
    running = true;
    setImmediate(() => {
      void processQueue();
    });
  }

  return true; // 受付完了
});

async function processQueue() {
  while (queue.length > 0) {
    const { batch, wc } = queue.shift();
    try {
      const result = await runPaletteSorter(batch, wc);

      if (!wc.isDestroyed()) wc.send("batch-done", result);
    } catch (e) {
      if (!wc.isDestroyed()) {
        wc.send("batch-done", {
          id: batch.id,
          success: 0,
          error: batch.files.length,
          message: String(e),
        });
      }
    }
  }
  running = false;
}

async function runPaletteSorter(batch: Batch, wc: Electron.WebContents) {
  let success = 0;
  let error = 0;
  const errorFiles = [];
  const { id, files } = batch;

  for (const original of files) {
    const tmpFile = path.join(getTmpDir(), path.basename(original));
    await execFileAsync(`${imagick}`, [original, `png8:${tmpFile}`]);
    try {
      const result = await paletteSorter(
        tmpFile,
        getOutputPath(original, batch.outputPath),
        batch.transparentColor
      );
      if (result) {
        success++;
      } else {
        error++;
        errorFiles.push(original);
      }
      if (!wc.isDestroyed())
        wc.send("batch-progress", { id, success, error, errorFiles });
    } catch (e) {
      console.error(e); // TODO
      error++;
      errorFiles.push(original);
    }
  }
  return { id, success, error, errorFiles };
}

function getTmpDir() {
  const base = app.getPath("userData"); // ユーザーデータ用の領域
  const tmpDir = path.join(base, "tmp");
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  return tmpDir;
}

function getOutputPath(original: string, outputDir: string) {
  const rel = path.basename(original);
  const outputPath = path.join(outputDir, rel);

  return outputPath;
}
