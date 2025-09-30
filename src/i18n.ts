import i18n from "i18next";
import ja from "./locales/ja.json";
import en from "./locales/en.json";
import { store } from "./store";

// eslint-disable-next-line
i18n.init({
  resources: {
    ja: { translation: ja },
    en: { translation: en },
  },
  lng: store.get("lang"),
  fallbackLng: "en",
});

export default i18n;
