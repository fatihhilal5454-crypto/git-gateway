import { Product } from '../types';

const DB_NAME = 'asv_shop_db';
const DB_VERSION = 1;
const STORE_NAME = 'products_store';
const CATALOG_KEY = 'catalog';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

export async function saveProductsToDB(products: Product[]): Promise<void> {
  try {
    localStorage.setItem('asv_products', JSON.stringify(products));
  } catch {
    // Ignore localStorage quota exceeded when large base64 images are present
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(products, CATALOG_KEY);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error || new Error('Failed to write products to IndexedDB'));
    };
  });
}

export async function loadProductsFromDB(): Promise<Product[] | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(CATALOG_KEY);
    request.onsuccess = () => {
      db.close();
      const result = request.result;
      resolve(Array.isArray(result) ? (result as Product[]) : null);
    };
    request.onerror = () => {
      db.close();
      reject(request.error || new Error('Failed to read products from IndexedDB'));
    };
  });
}
