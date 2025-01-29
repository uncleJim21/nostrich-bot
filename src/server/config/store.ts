import Store from 'electron-store';
import { app } from 'electron';
import path from 'path';

interface StoreSchema {
  nsec: string | null;
}

const store = new Store<StoreSchema>({
  cwd: app.isPackaged ? app.getPath('userData') : undefined,
  schema: {
    nsec: {
      type: ['string', 'null'], // Allow both string and null
      default: null  // Set default as null
    }
  }
});

export default store;