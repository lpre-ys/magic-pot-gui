/* eslint-disable @typescript-eslint/no-var-requires */
// CJSをrequireで読み、ESMとしてdefault再輸出する
// const sorter = require("../../submodules/magic-pot/src/palette-sorter.js");
import sorter from "../../submodules/magic-pot/src/palette-sorter.js";

type PaletteSorter = (
  inputPath: string,
  outputPath: string,
  transparentColor: [number, number, number]
) => Promise<boolean>;

export default sorter as PaletteSorter;
