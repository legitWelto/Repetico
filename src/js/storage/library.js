import { initDB } from './db.js';

export async function saveSongData(id, fileBlob, metadata) {
  const db = await initDB();
  const tx = db.transaction(['songs', 'metadata'], 'readwrite');
  await tx.objectStore('songs').put({ id, file: fileBlob });
  await tx.objectStore('metadata').put({ id, ...metadata });
  await tx.done;
}

export async function getSongData(id) {
  const db = await initDB();
  const song = await db.get('songs', id);
  const metadata = await db.get('metadata', id);
  return { song, metadata };
}

export async function getAllMetadata() {
  const db = await initDB();
  return await db.getAll('metadata');
}

export async function checkAndLoadDemo() {
  const db = await initDB();
  const existing = await db.get('metadata', 'demo');
  if (!existing) {
    try {
      const [mp3Res, jsonRes] = await Promise.all([
        fetch('/song.mp3'),
        fetch('/song.json')
      ]);
      if (mp3Res.ok && jsonRes.ok) {
        const mp3Blob = await mp3Res.blob();
        const metadata = await jsonRes.json();
        await saveSongData('demo', mp3Blob, metadata);
        return true;
      }
    } catch(e) {
      console.warn("Could not load demo files", e);
    }
  }
  return false;
}

export async function deleteSongData(id) {
  const db = await initDB();
  const tx = db.transaction(['songs', 'metadata'], 'readwrite');
  await tx.objectStore('songs').delete(id);
  await tx.objectStore('metadata').delete(id);
  await tx.done;
}
