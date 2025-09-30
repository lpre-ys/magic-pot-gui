import { useDropzone, FileWithPath, DropEvent } from "react-dropzone";
import { useCallback } from "react";
import { Batch } from "../types";
import { useTranslation } from "react-i18next";

type Props = {
  setBatchs: React.Dispatch<React.SetStateAction<Batch[]>>;
  transparentColor: [number, number, number];
  outputPath: string;
};

export default function Loader({
  setBatchs,
  transparentColor,
  outputPath,
}: Props) {
  const { t } = useTranslation();

  async function getFilesFromEvent(event: DropEvent): Promise<FileWithPath[]> {
    const files: File[] = await new Promise((resolve) => {
      const dtFiles = (event as DragEvent).dataTransfer?.files;
      if (dtFiles) {
        resolve(Array.from(dtFiles));
        return;
      }

      const input = (event as InputEvent).target as HTMLInputElement;
      if (input?.files) {
        resolve(Array.from(input.files));
        return;
      }

      resolve([]);
    });
    return files.map((file) => {
      const path = window.api.getPathForFile(file);
      return Object.assign(file, { path }) as FileWithPath;
    });
  }

  const onDrop = useCallback(
    async (accepted: FileWithPath[]) => {
      if (!accepted.length) {
        alert(t("noFile"));
        return;
      }
      const batch: Batch = {
        files: accepted.map((file) => file.path as string),
        id: crypto.randomUUID(),
        success: 0,
        error: 0,
        transparentColor: transparentColor,
        outputPath: outputPath,
        time: new Date(),
      };
      const result = await window.api.execMagicPot(batch);
      if (result) {
        setBatchs((prev) => [...prev, batch]);
      }
    },
    [t]
  );

  const { getRootProps, getInputProps } = useDropzone({
    getFilesFromEvent,
    onDrop,
    accept: {
      "image/png": [],
    },
    multiple: true,
  });

  return (
    <div className="loader">
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <div className="inner">
          <p>{t("loaderInfo")}</p>
        </div>
      </div>
    </div>
  );
}
