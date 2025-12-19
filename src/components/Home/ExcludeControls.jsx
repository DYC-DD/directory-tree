import React from "react";

/**
 * ExcludeControls
 *
 * 顯示「排除項目」相關控制：
 * - 只在 uploadMode === "folder" 時顯示
 * - 桌面版順序：說明文字 → input → 預設按鈕 → 自訂 tags
 * - 非 folder 模式：完全不 render（不佔任何版面空間）
 */
export default function ExcludeControls({
  uploadMode,
  excludedItems,
  onToggleExcludedItem,
  inputValue,
  onInputValueChange,
  onInputKeyDown,
  filteredSuggestions,
  highlightIndex,
  onSuggestionClick,
  customExcludesExact,
  onRemoveExcludeTag,
  t,
}) {
  // ✅ 非資料夾模式，直接不 render
  if (uploadMode !== "folder") return null;

  return (
    <div className="checkbox">
      {/* 說明文字 */}
      <span>{t("hideLabel")}</span>

      {/* 🔹 自訂輸入框（放在按鈕前面） */}
      <div className="custom-input-wrapper">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputValueChange(e.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder={t("inputPlaceholder")}
          className="custom-input"
        />

        {/* 建議清單 */}
        {inputValue && (
          <div className="suggestion-list">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((name, index) => (
                <div
                  key={name}
                  onClick={() => onSuggestionClick(name)}
                  className={`suggestion-item ${
                    highlightIndex === index ? "highlighted" : ""
                  } ${index % 2 === 0 ? "even" : "odd"}`}
                >
                  {name}
                </div>
              ))
            ) : (
              <div className="no-suggestions">{t("noSuggestions")}</div>
            )}
          </div>
        )}
      </div>

      {/* 🔹 預設排除按鈕 */}
      {Object.keys(excludedItems).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onToggleExcludedItem(item)}
          className={`exclude-button ${excludedItems[item] ? "active" : ""}`}
        >
          {item}
        </button>
      ))}

      {/* 🔹 自訂排除 tags */}
      {customExcludesExact.length > 0 && (
        <div className="custom-excludes">
          {customExcludesExact.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onRemoveExcludeTag(name)}
              className="exclude-button active"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
