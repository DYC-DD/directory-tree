import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ja from "./locales/ja.json";
import zhhant from "./locales/zh-hant.json";

function normalizeToSupportedLng(rawLng) {
  if (!rawLng) return null;
  const lng = String(rawLng).trim().replace(/_/g, "-").toLowerCase();

  // 英文
  if (lng === "en" || lng.startsWith("en-")) return "en";
  // 日文
  if (lng === "ja" || lng.startsWith("ja-")) return "ja";
  // 繁體中文
  if (lng === "zhhant" || lng === "zh-hant" || lng.startsWith("zh-hant"))
    return "zhhant";
  if (lng === "zh-tw" || lng === "zh-hk" || lng === "zh-mo") return "zhhant";

  return null;
}

// 從網址 querystring 取得 lng（若有）
function getLngFromQuerystring() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("lng");
  } catch {
    return null;
  }
}

// 取得瀏覽器偏好語言（依序嘗試 navigator.languages → navigator.language）
function getLngFromBrowser() {
  const langs = Array.isArray(navigator.languages)
    ? navigator.languages
    : [navigator.language];

  for (const l of langs) {
    const normalized = normalizeToSupportedLng(l);
    if (normalized) return normalized;
  }

  return null;
}

// 決定初始語言
function resolveInitialLanguage() {
  // 1) URL 優先
  const urlLng = getLngFromQuerystring();
  if (urlLng) {
    return normalizeToSupportedLng(urlLng) || "en";
  }

  // 2) 瀏覽器語言
  const browserLng = getLngFromBrowser();
  if (browserLng) return browserLng;

  // 3) 最後 fallback
  return "en";
}

const initialLng = resolveInitialLanguage();

i18n.use(initReactI18next).init({
  resources: {
    zhhant: { translation: zhhant },
    en: { translation: en },
    ja: { translation: ja },
  },

  // 直接指定初始語言（避免先英文再切換）
  lng: initialLng,
  // 不支援的語言一律英文
  fallbackLng: "en",
  // 明確限制只允許三種
  supportedLngs: ["zhhant", "en", "ja"],

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
