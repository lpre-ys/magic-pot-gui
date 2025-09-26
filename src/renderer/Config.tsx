import React, { useMemo } from "react";
import { colord } from "colord";

type Props = {
  outputPath: string;
  setOutputPath: React.Dispatch<React.SetStateAction<string>>;
  transparentColor: [number, number, number];
  setTransparentColor: React.Dispatch<
    React.SetStateAction<[number, number, number]>
  >;
};

export default function Config({
  outputPath,
  setOutputPath,
  transparentColor,
  setTransparentColor,
}: Props) {
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
  return (
    <section className="config">
      <div className="color">
        <h3>透過色</h3>
        <p>
          <input type="color" value={hex} onChange={handleChangeColor} />
          RGB({transparentColor.join(",")})
        </p>
      </div>
      <div className="output">
        <h3>出力先</h3>
        <p
          onClick={handleSelectOutputDir}
          style={{
            color: outputPath ? "#111" : "darkred",
          }}
        >
          {outputPath ? outputPath : "未選択"}
          <button onClick={handleSelectOutputDir}>フォルダ選択</button>
        </p>
      </div>
    </section>
  );
}
