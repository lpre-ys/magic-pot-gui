import { contextBridge, webUtils, ipcRenderer } from "electron";
import { Batch } from "./types";

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("api", {
      getPathForFile: (file: File) => webUtils.getPathForFile(file),
      execMagicPot: async (batch: Batch) => {
        return await ipcRenderer.invoke("exec-magic-pot", batch);
      },
      selectOutputDir: async () => {
        return await ipcRenderer.invoke("select-output-dir");
      },
      onBatchDone: (
        callback: (data: {
          id: string;
          success: number;
          error: number;
          errorFiles: string[];
        }) => void
      ) => {
        const handler = (
          _event: Electron.IpcRendererEvent,
          data: {
            id: string;
            success: number;
            error: number;
            errorFiles: string[];
          }
        ) => callback(data);
        ipcRenderer.on("batch-done", handler);

        return () => ipcRenderer.removeListener("batch-done", handler);
      },
      onBatchProgress: (
        callback: (data: {
          id: string;
          success: number;
          error: number;
          errorFiles: string[];
        }) => void
      ) => {
        const handler = (
          _event: Electron.IpcRendererEvent,
          data: {
            id: string;
            success: number;
            error: number;
            errorFiles: string[];
          }
        ) => callback(data);
        ipcRenderer.on("batch-progress", handler);

        return () => ipcRenderer.removeListener("batch-done", handler);
      },
      getSettings: async () => {
        return await ipcRenderer.invoke("get-settings");
      },
      setSettings: async (key: string, value: string | []) => {
        return await ipcRenderer.invoke("set-settings", { key, value });
      },
    });
  } catch (error) {
    console.error(error);
  }
}
