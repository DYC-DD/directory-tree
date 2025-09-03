import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import hi from "./locales/hi.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import zhhans from "./locales/zh-hans.json";
import zhhant from "./locales/zh-hant.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      zhhant: { translation: zhhant },
      en: { translation: en },
      ja: { translation: ja },
      ko: { translation: ko },
      es: { translation: es },
      zhhans: { translation: zhhans },
      fr: { translation: fr },
      de: { translation: de },
      hi: { translation: hi },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["navigator", "htmlTag", "path", "subdomain"],
      lookupNavigator: true,
    },
  });

export default i18n;
