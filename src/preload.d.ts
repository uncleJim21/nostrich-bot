export interface ElectronAPI {
  storeNsec: (nsec: string) => Promise<boolean>;
  getNsec: () => Promise<string | null>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}