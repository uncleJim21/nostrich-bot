declare global {
  interface Window {
    electron: {
      storeNsec: (nsec: string) => Promise<void>;
      getNsec: () => Promise<string | null>;
      validateNsec: (nsec: string) => Promise<boolean>;
    };
  }
}

// Prevents TypeScript from treating this as a global script
export {};
