import { useState, useCallback } from 'react';
import { snapshotStorage } from '../services/storageManager';
import { BannerElement } from '../types';
import { CanvasFormatId } from '../constants';

export interface SnapshotRecord {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;

  // Canvas State
  bgImage: string | null;
  elements: BannerElement[];
  canvasFormatId: CanvasFormatId;

  // Optional thumbnail for future use (base64)
  thumbnail?: string;
}

const STORAGE_KEY = 'list';

export const useCanvasSnapshots = () => {
  const [snapshots, setSnapshots] = useState<SnapshotRecord[]>(() => {
    return snapshotStorage.get<SnapshotRecord[]>(STORAGE_KEY) || [];
  });

  const saveSnapshotsToStorage = useCallback((list: SnapshotRecord[]) => {
    snapshotStorage.set(STORAGE_KEY, list);
    setSnapshots(list);
  }, []);

  /**
   * Save current canvas state as a new snapshot
   */
  const saveSnapshot = useCallback(
    (
      name: string,
      bgImage: string | null,
      elements: BannerElement[],
      canvasFormatId: CanvasFormatId,
    ) => {
      const loaded = snapshotStorage.get<SnapshotRecord[]>(STORAGE_KEY) || [];

      const newSnapshot: SnapshotRecord = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        bgImage,
        elements,
        canvasFormatId,
      };

      const updated = [newSnapshot, ...loaded];
      saveSnapshotsToStorage(updated);
      return newSnapshot;
    },
    [saveSnapshotsToStorage],
  );

  /**
   * Delete a snapshot
   */
  const deleteSnapshot = useCallback(
    (id: string) => {
      const loaded = snapshotStorage.get<SnapshotRecord[]>(STORAGE_KEY) || [];
      const updated = loaded.filter((s) => s.id !== id);
      saveSnapshotsToStorage(updated);
    },
    [saveSnapshotsToStorage],
  );

  /**
   * Rename a snapshot
   */
  const renameSnapshot = useCallback(
    (id: string, newName: string) => {
      const loaded = snapshotStorage.get<SnapshotRecord[]>(STORAGE_KEY) || [];
      const updated = loaded.map((s) =>
        s.id === id ? { ...s, name: newName, updatedAt: Date.now() } : s,
      );
      saveSnapshotsToStorage(updated);
    },
    [saveSnapshotsToStorage],
  );

  /**
   * Update an existing snapshot with current state (Overwrite)
   */
  const updateSnapshot = useCallback(
    (
      id: string,
      bgImage: string | null,
      elements: BannerElement[],
      canvasFormatId: CanvasFormatId,
    ) => {
      const loaded = snapshotStorage.get<SnapshotRecord[]>(STORAGE_KEY) || [];
      const updated = loaded.map((s) =>
        s.id === id
          ? {
              ...s,
              bgImage,
              elements,
              canvasFormatId,
              updatedAt: Date.now(),
            }
          : s,
      );
      saveSnapshotsToStorage(updated);
    },
    [saveSnapshotsToStorage],
  );

  return {
    snapshots,
    saveSnapshot,
    deleteSnapshot,
    renameSnapshot,
    updateSnapshot,
  };
};
