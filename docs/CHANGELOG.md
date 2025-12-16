# CHANGELOG

This changelog follows the [Keep a Changelog](https://keepachangelog.com/zh-TW/1.1.0/) format to track version updates.

## [2.0.0] - 2025-12-

### Added

- 將原本分離的 **folder / JSON / YAML** 三種模式整合為單一輸入模式，並可自動偵測使用者輸入的檔案類型
- 新增操作方式支援：
  - **左鍵點擊**：選擇整個資料夾
  - **右鍵點擊**：選擇單一檔案
- 新增 **「清除」按鈕**，可一鍵清空目前產出的樹狀結果與輸出內容，提升使用流程順暢度

### Changed

- 將專案建置工具由 **Create React App（CRA）** 全面遷移至 **Vite**，大幅提升開發啟動速度與建置效率
- 重構 `Home` 頁面結構，將可重複使用的 UI 拆分為獨立元件，降低單一元件複雜度
  - 共用邏輯與輔助函式集中移至 `utils`，強化職責分離並提升整體可維護性
  - 改善整體程式碼可讀性，調整檔案與模組責任邊界，使後續擴充與除錯更容易
- 語言切換改為「自動判斷 + 參數覆寫」策略：
  - **預設自動判斷瀏覽器語言**（例如 `navigator.language` / `navigator.languages`），並對應到 `zh-Hant` / `en` / `ja` 其中之一。
  - 支援透過網址參數強制指定語言：`/?lng=...`
    - `/?lng=zh-Hant` → 繁體中文
    - `/?lng=en` → 英文
    - `/?lng=ja` → 日文
- 若「瀏覽器語言」與「網址 `lng` 參數」都無法匹配以上三種語言，則 **一律回落為英文（en）**，確保可用性與一致性。

### Removed

- 移除所有隱藏的 **網頁彩蛋（Console Easter Egg）** 相關邏輯與程式碼
- 移除 **網站計數器（Visit Counter）** 元件及其對外 API 呼叫，確保專案為純前端、零追蹤設計
- 移除 **GooeyNav** 導航列的 UI 動畫效果與相關元件／樣式，簡化介面與依賴。
- 移除頁面底部（或原本位置）的「語言選擇按鈕」與相關切換 UI。
- 移除非必要語系資源與設定，語言僅保留：
  - 繁體中文（zh-Hant）
  - 英文（en）
  - 日文（ja）
