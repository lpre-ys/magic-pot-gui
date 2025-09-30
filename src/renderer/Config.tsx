import React, { useMemo } from "react";
import { colord } from "colord";
import { useTranslation } from "react-i18next";

type Props = {
  outputPath: string;
  setOutputPath: React.Dispatch<React.SetStateAction<string>>;
  transparentColor: [number, number, number];
  setTransparentColor: React.Dispatch<
    React.SetStateAction<[number, number, number]>
  >;
  lang: string;
  setLang: React.Dispatch<React.SetStateAction<string>>;
};

export default function Config({
  outputPath,
  setOutputPath,
  transparentColor,
  setTransparentColor,
  lang,
  setLang,
}: Props) {
  const { t, i18n } = useTranslation();

  const hex = useMemo<string>(() => {
    return colord({
      r: transparentColor[0],
      g: transparentColor[1],
      b: transparentColor[2],
    }).toHex();
  }, [transparentColor]);
  const handleChangeColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rgb = colord(e.target.value).toRgb();
    setTransparentColor([rgb.r, rgb.g, rgb.b]);
    window.api.setSettings("transparentColor", [rgb.r, rgb.g, rgb.b]);
  };
  const handleSelectOutputDir = async () => {
    const dir = await window.api.selectOutputDir();
    if (dir) {
      setOutputPath(dir);
      window.api.setSettings("outputPath", dir);
    }
  };
  const handleSelectLang = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLang(e.target.value);
    i18n.changeLanguage(e.target.value);
    window.api.setSettings("lang", e.target.value);
  };
  return (
    <section className="config">
      <div className="color">
        <h3>{t("transparentColor")}</h3>
        <p>
          <input type="color" value={hex} onChange={handleChangeColor} />
          RGB({transparentColor.join(",")})
        </p>
      </div>
      <div className="output">
        <h3>{t("outputPath")}</h3>
        <p
          onClick={handleSelectOutputDir}
          style={{
            color: outputPath ? "#111" : "darkred",
          }}
        >
          {outputPath ? outputPath : t("notSelected")}
          <button>{t("selectFolder")}</button>
        </p>
      </div>
      <div className="language">
        <h3>{t("lang")}</h3>
        <select name="lang" onChange={handleSelectLang} value={lang}>
          <option value="ja">日本語</option>
          <option value="en">English</option>
        </select>
      </div>
    </section>
  );
}
