// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Log from '../../renderer/Log';
import { makeBatch } from '../fixtures';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { changeLanguage: vi.fn() } }),
}));

describe('Log - Clear ボタンの disabled 状態', () => {
  it('batchs が空のとき disabled', () => {
    render(<Log batchs={[]} setBatchs={vi.fn()} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('未着手バッチがあるとき disabled（success+error=0）', () => {
    render(<Log batchs={[makeBatch()]} setBatchs={vi.fn()} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('処理中バッチがあるとき disabled（success+error < files.length）', () => {
    const batch = makeBatch({ files: ['/a.png', '/b.png'], success: 1, error: 0 });
    render(<Log batchs={[batch]} setBatchs={vi.fn()} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('すべて完了しているとき enabled', () => {
    const batch = makeBatch({ success: 1, error: 0 });
    render(<Log batchs={[batch]} setBatchs={vi.fn()} />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('エラーありでも合計が files.length に達すれば enabled', () => {
    const batch = makeBatch({ files: ['/a.png', '/b.png'], success: 1, error: 1 });
    render(<Log batchs={[batch]} setBatchs={vi.fn()} />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });
});

describe('Log - ステータスアイコン', () => {
  it('success+error=0 のときアイコンなし', () => {
    const { container } = render(<Log batchs={[makeBatch()]} setBatchs={vi.fn()} />);
    expect(container.querySelector('[data-icon="hourglass"]')).toBeNull();
    expect(container.querySelector('[data-icon="check"]')).toBeNull();
  });

  it('処理中（0 < success+error < files.length）のとき hourglass', () => {
    const batch = makeBatch({ files: ['/a.png', '/b.png'], success: 1, error: 0 });
    const { container } = render(<Log batchs={[batch]} setBatchs={vi.fn()} />);
    expect(container.querySelector('[data-icon="hourglass"]')).not.toBeNull();
  });

  it('完了（success+error === files.length）のとき check', () => {
    const batch = makeBatch({ success: 1, error: 0 });
    const { container } = render(<Log batchs={[batch]} setBatchs={vi.fn()} />);
    expect(container.querySelector('[data-icon="check"]')).not.toBeNull();
  });
});

describe('Log - ファイル名表示', () => {
  it('フルパスではなくファイル名のみ表示される', () => {
    const batch = makeBatch({ files: ['/long/path/to/image.png'] });
    render(<Log batchs={[batch]} setBatchs={vi.fn()} />);
    expect(screen.getByText(/image\.png/)).toBeInTheDocument();
  });
});

describe('Log - エラー表示', () => {
  it('error > 0 のとき error リンクが表示される', () => {
    const batch = makeBatch({ success: 0, error: 1 });
    render(<Log batchs={[batch]} setBatchs={vi.fn()} />);
    expect(screen.getByText('error')).toBeInTheDocument();
  });

  it('error = 0 のとき - が表示される', () => {
    const batch = makeBatch({ success: 1, error: 0 });
    render(<Log batchs={[batch]} setBatchs={vi.fn()} />);
    const cells = screen.getAllByText('-');
    expect(cells.length).toBeGreaterThan(0);
  });
});

describe('Log - Clear ボタン操作', () => {
  it('クリックで setBatchs が [] で呼ばれる', async () => {
    const setBatchs = vi.fn();
    const batch = makeBatch({ success: 1, error: 0 });
    render(<Log batchs={[batch]} setBatchs={setBatchs} />);
    await userEvent.click(screen.getByRole('button'));
    expect(setBatchs).toHaveBeenCalledWith([]);
  });
});
