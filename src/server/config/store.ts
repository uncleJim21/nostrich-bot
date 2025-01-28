import Store from 'electron-store';

interface StoreSchema {
  nsec: string | null;
}

const store = new Store<StoreSchema>({
  schema: {
    nsec: {
      type: ['string', 'null'], // Allow both string and null
      default: null  // Set default as null
    }
  }
});

export default store;