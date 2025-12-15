# CHANGELOG

This changelog follows the [Keep a Changelog](https://keepachangelog.com/zh-TW/1.1.0/) format to track version updates.

## [2.0.0] - 2025-12-

### Changed

- 將專案建置工具由 **Create React App（CRA）** 全面遷移至 **Vite**，大幅提升開發啟動速度與建置效率
- 重構 `Home` 頁面結構，將可重複使用的 UI 拆分為獨立元件，降低單一元件複雜度
  - 共用邏輯與輔助函式集中移至 `utils`，強化職責分離並提升整體可維護性
  - 改善整體程式碼可讀性，調整檔案與模組責任邊界，使後續擴充與除錯更容易

### Removed

- 移除所有隱藏的 **網頁彩蛋（Console Easter Egg）** 相關邏輯與程式碼
- 移除 **網站計數器（Visit Counter）** 元件及其對外 API 呼叫，確保專案為純前端、零追蹤設計

### Added

- 將原本分離的 **folder / JSON / YAML** 三種模式整合為單一輸入模式，並可自動偵測使用者輸入的檔案類型
- 新增操作方式支援：
  - **左鍵點擊**：選擇整個資料夾
  - **右鍵點擊**：選擇單一檔案
- 新增 **「清除」按鈕**，可一鍵清空目前產出的樹狀結果與輸出內容，提升使用流程順暢度
