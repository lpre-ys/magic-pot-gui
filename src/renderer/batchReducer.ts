import { Batch } from '../types';

export type BatchUpdate = Pick<Batch, 'id' | 'success' | 'error' | 'errorFiles'>;

export function applyBatchUpdate(prev: Batch[], update: BatchUpdate): Batch[] {
  const { id, success, error, errorFiles } = update;
  return prev.map((b) => (b.id === id ? { ...b, success, error, errorFiles } : b));
}
