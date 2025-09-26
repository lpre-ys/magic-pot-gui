export type Batch = {
  files: string[];
  transparentColor: [number, number, number];
  outputPath: string;
  id: string;
  success: number;
  error: number;
  time: Date;
  errorFiles?: string[];
};
export type StoreType = {
  transparentColor: [number, number, number];
  outputPath: string;
};
