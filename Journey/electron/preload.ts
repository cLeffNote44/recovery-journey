import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Type definitions for update events
interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes?: string;
}

interface ProgressInfo {
  total: number;
  delta: number;
  transferred: number;
  percent: number;
  bytesPerSecond: number;
}

// Expose protected APIs to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('get-app-version'),

  // Auto-update controls
  checkForUpdates: (): Promise<void> => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: (): Promise<void> => ipcRenderer.invoke('download-update'),
  installUpdate: (): Promise<void> => ipcRenderer.invoke('install-update'),

  // Update event listeners
  onUpdateStatus: (
    callback: (status: string, info?: UpdateInfo | string) => void
  ) => {
    const listener = (
      _event: IpcRendererEvent,
      status: string,
      info?: UpdateInfo | string
    ) => callback(status, info);
    ipcRenderer.on('update-status', listener);
    return () => ipcRenderer.removeListener('update-status', listener);
  },

  onUpdateProgress: (callback: (progress: ProgressInfo) => void) => {
    const listener = (_event: IpcRendererEvent, progress: ProgressInfo) =>
      callback(progress);
    ipcRenderer.on('update-progress', listener);
    return () => ipcRenderer.removeListener('update-progress', listener);
  },
});

// Type declaration for TypeScript
declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>;
      checkForUpdates: () => Promise<void>;
      downloadUpdate: () => Promise<void>;
      installUpdate: () => Promise<void>;
      onUpdateStatus: (
        callback: (status: string, info?: UpdateInfo | string) => void
      ) => () => void;
      onUpdateProgress: (callback: (progress: ProgressInfo) => void) => () => void;
    };
  }
}
