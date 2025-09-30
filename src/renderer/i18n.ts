import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ja from "../locales/ja.json";
import en from "../locales/en.json";

// eslint-disable-next-line
i18n.use(initReactI18next).init({
  resources: {
    ja: { translation: ja },
    en: { translation: en },
  },
  lng: "ja", // 初期言語
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
