import { describe, it, expect } from 'vitest';
import { applyBatchUpdate } from '../../renderer/batchReducer';
import { makeBatch } from '../fixtures';

describe('applyBatchUpdate', () => {
  it('該当 id のバッチのみ更新される', () => {
    const batch1 = makeBatch({ id: 'a' });
    const batch2 = makeBatch({ id: 'b' });
    const result = applyBatchUpdate([batch1, batch2], {
      id: 'a',
      success: 3,
      error: 1,
      errorFiles: ['/path/to/bad.png'],
    });
    expect(result[0]).toMatchObject({ success: 3, error: 1, errorFiles: ['/path/to/bad.png'] });
    expect(result[1]).toMatchObject({ success: 0, error: 0 });
  });

  it('他のバッチは変更されない', () => {
    const batch1 = makeBatch({ id: 'a' });
    const batch2 = makeBatch({ id: 'b', success: 5 });
    const result = applyBatchUpdate([batch1, batch2], { id: 'a', success: 1, error: 0 });
    expect(result[1]).toBe(batch2);
  });

  it('存在しない id は配列に影響しない', () => {
    const batch = makeBatch({ id: 'a' });
    const result = applyBatchUpdate([batch], { id: 'zzz', success: 1, error: 0 });
    expect(result).toEqual([batch]);
  });

  it('errorFiles が undefined の場合も更新される', () => {
    const batch = makeBatch({ id: 'a', errorFiles: ['/old.png'] });
    const result = applyBatchUpdate([batch], { id: 'a', success: 1, error: 0 });
    expect(result[0].errorFiles).toBeUndefined();
  });

  it('transparentColor は更新後も保持される', () => {
    const batch = makeBatch({ id: 'a', transparentColor: [0, 128, 0] });
    const result = applyBatchUpdate([batch], { id: 'a', success: 1, error: 0 });
    expect(result[0].transparentColor).toEqual([0, 128, 0]);
  });
});
