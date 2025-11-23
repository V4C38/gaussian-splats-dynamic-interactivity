const DB_NAME = 'splat-interactivity-db';
const STORE_NAME = 'files';
const DB_VERSION = 1;

import type { Scene } from '@/types/scene';

export const FILE_KEYS = {
  SPLAT: 'splat-file',
  MESH: 'mesh-file',
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function saveFile(key: string, file: File | Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(file, key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function loadFile(key: string): Promise<File | Blob | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function deleteFile(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function clearFiles(): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
  
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

const SCENE_PREFIX = 'scene:';

export async function saveSceneJSON(scene: Scene): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const key = `${SCENE_PREFIX}${scene.id}`;
    const request = store.put(JSON.stringify(scene), key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function loadSceneJSON(id: string): Promise<Scene | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const key = `${SCENE_PREFIX}${id}`;
    const request = store.get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = async () => {
      const result = request.result;
      if (!result) {
        resolve(undefined);
        return;
      }
      if (typeof result === 'string') {
        try {
          resolve(JSON.parse(result) as Scene);
        } catch {
          resolve(undefined);
        }
        return;
      }
      // If stored as Blob by mistake, try to parse as text
      if (result instanceof Blob) {
        (result as Blob)
          .text()
          .then((t) => {
            try {
              resolve(JSON.parse(t) as Scene);
            } catch {
              resolve(undefined);
            }
          })
          .catch(() => resolve(undefined));
        return;
      }
      resolve(undefined);
    };
  });
}

export async function deleteSceneJSON(id: string): Promise<void> {
  return deleteFile(`${SCENE_PREFIX}${id}`);
}

