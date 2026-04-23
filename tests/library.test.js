import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock db.js
const mockDB = {
  transaction: vi.fn(),
  get: vi.fn(),
  getAll: vi.fn(),
  delete: vi.fn(),
  done: Promise.resolve()
};

vi.mock('../src/js/storage/db.js', () => ({
  initDB: vi.fn(() => Promise.resolve(mockDB))
}));

import { saveSongData, getSongData, getAllMetadata, deleteSongData } from '../src/js/storage/library.js';

describe('library.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves song data', async () => {
    const mockObjectStore = {
      put: vi.fn()
    };
    mockDB.transaction.mockReturnValue({
      objectStore: vi.fn(() => mockObjectStore),
      done: Promise.resolve()
    });

    await saveSongData('test-id', new Blob(), { title: 'Test' });

    expect(mockDB.transaction).toHaveBeenCalledWith(['songs', 'metadata'], 'readwrite');
    expect(mockObjectStore.put).toHaveBeenCalledTimes(2);
  });

  it('gets song data', async () => {
    mockDB.get.mockImplementation((store, id) => {
      if (store === 'songs') return Promise.resolve({ id, file: 'blob' });
      if (store === 'metadata') return Promise.resolve({ id, title: 'Test' });
    });

    const result = await getSongData('test-id');
    expect(result.song).toEqual({ id: 'test-id', file: 'blob' });
    expect(result.metadata).toEqual({ id: 'test-id', title: 'Test' });
  });

  it('gets all metadata', async () => {
    mockDB.getAll.mockReturnValue(Promise.resolve([{ id: '1' }, { id: '2' }]));
    const result = await getAllMetadata();
    expect(result).toHaveLength(2);
    expect(mockDB.getAll).toHaveBeenCalledWith('metadata');
  });

  it('deletes song data', async () => {
    const mockObjectStore = {
      delete: vi.fn()
    };
    mockDB.transaction.mockReturnValue({
      objectStore: vi.fn(() => mockObjectStore),
      done: Promise.resolve()
    });

    await deleteSongData('test-id');
    expect(mockDB.transaction).toHaveBeenCalledWith(['songs', 'metadata'], 'readwrite');
    expect(mockObjectStore.delete).toHaveBeenCalledWith('test-id');
  });
});
