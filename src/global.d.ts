export {};

declare global {
  interface Window {
    api: {
      getPathForFile: (file: File) => string;
      execMagicPot: (batch: Batch) => Promise<boolean>;
      selectOutputDir: () => Promise<string | null>;
      onBatchDone: (callback: (data: Batch) => void) => () => void;
      onBatchProgress: (callback: (data: Batch) => void) => () => void;
      getSettings: () => {
        transparentColor: [number, number, number];
        outputPath: string;
        lang: string;
      };
      setSettings: (
        key: string,
        value: string | [number, number, number]
      ) => void;
    };
  }
}
