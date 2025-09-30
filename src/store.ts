import Store from "electron-store";
import { StoreType } from "./types";

export const store = new Store<StoreType>({
  defaults: {
    transparentColor: [0, 255, 0],
    outputPath: "",
    lang: "ja",
  },
});
