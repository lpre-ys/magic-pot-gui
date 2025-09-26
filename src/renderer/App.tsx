import { useState, useEffect } from "react";
import "./App.css";
import Config from "./Config";
import Loader from "./Loader";
import { Batch } from "../types";
import Log from "./Log";

export default function App() {
  const [outputPath, setOutputPath] = useState<string>("");
  const [transparentColor, setTransparentColor] = useState<
    [number, number, number]
  >([0, 255, 0]);
  const [batchs, setBatchs] = useState<Batch[]>([]);

  useEffect(() => {
    (async () => {
      const settings = await window.api.getSettings();
      setOutputPath(settings.outputPath ?? "");
      settings.transparentColor &&
        setTransparentColor(settings.transparentColor);
    })();
  }, []);

  useEffect(() => {
    const remove = window.api.onBatchDone((batch) => {
      const { id, success, error, errorFiles } = batch;
      setBatchs((prev) => {
        return prev.map((batch) => {
          return batch.id === id
            ? { ...batch, success, error, errorFiles }
            : batch;
        });
      });
    });

    return () => remove();
  }, [batchs]);
  useEffect(() => {
    const remove = window.api.onBatchProgress((batch) => {
      const { id, success, error, errorFiles } = batch;
      setBatchs((prev) => {
        return prev.map((batch) => {
          return batch.id === id
            ? { ...batch, success, error, errorFiles }
            : batch;
        });
      });
    });

    return () => remove();
  }, [batchs]);
  return (
    <div className="App">
      <header>
        <Config
          outputPath={outputPath}
          setOutputPath={setOutputPath}
          transparentColor={transparentColor}
          setTransparentColor={setTransparentColor}
        />
      </header>
      {!!outputPath && (
        <>
          <Loader
            setBatchs={setBatchs}
            transparentColor={transparentColor}
            outputPath={outputPath}
          />
          <Log batchs={batchs} setBatchs={setBatchs} />
        </>
      )}
    </div>
  );
}
