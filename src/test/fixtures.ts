import { Batch } from '../types';

export const makeBatch = (overrides: Partial<Batch> = {}): Batch => ({
  id: 'test-id',
  files: ['/some/path/image.png'],
  transparentColor: [0, 255, 0],
  outputPath: '/out',
  success: 0,
  error: 0,
  time: new Date('2024-01-01T00:00:00'),
  ...overrides,
});
