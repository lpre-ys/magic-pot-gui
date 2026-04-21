import { useState, useEffect } from "react";
import "./App.css";
import Config from "./Config";
import Loader from "./Loader";
import { Batch } from "../types";
import Log from "./Log";
import { useTranslation } from "react-i18next";
import { applyBatchUpdate } from "./batchReducer";

export default function App() {
  const { i18n } = useTranslation();
  const [outputPath, setOutputPath] = useState<string>("");
  const [transparentColor, setTransparentColor] = useState<
    [number, number, number]
  >([0, 255, 0]);
  const [batchs, setBatchs] = useState<Batch[]>([]);
  const [lang, setLang] = useState<string>("ja");

  useEffect(() => {
    (async () => {
      const settings = await window.api.getSettings();
      setOutputPath(settings.outputPath ?? "");
      settings.transparentColor &&
        setTransparentColor(settings.transparentColor);
      if (settings.lang) {
        setLang(settings.lang);
        i18n.changeLanguage(settings.lang);
      }
    })();
  }, []);

  useEffect(() => {
    const remove = window.api.onBatchDone((batch) => {
      setBatchs((prev) => applyBatchUpdate(prev, batch));
    });

    return () => remove();
  }, [batchs]);
  useEffect(() => {
    const remove = window.api.onBatchProgress((batch) => {
      setBatchs((prev) => applyBatchUpdate(prev, batch));
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
          lang={lang}
          setLang={setLang}
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
