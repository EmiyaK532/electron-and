export interface IElectronAPI {
  windowControl: {
    minimize: () => void
    maximize: () => void
    close: () => void
  }
}

declare global {
  interface Window {
    api: IElectronAPI
    electron: any
  }
}
