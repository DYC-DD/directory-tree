import React from "react";

/**
 * ExcludeControls
 * - folder 模式才會顯示
 *  - 內建排除項目按鈕（.git / .DS_Store / node_modules）
 *  - 自訂排除 input（含 suggestion 與鍵盤上下選擇 Enter 加入）
 *  - 已加入的排除 tag（點擊移除）
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
  return (
    <div className={`checkbox ${uploadMode !== "folder" ? "hidden" : ""}`}>
      <span>{t("hideLabel")}</span>

      {Object.keys(excludedItems).map((item) => (
        <button
          key={item}
          onClick={() => onToggleExcludedItem(item)}
          className={`exclude-button ${excludedItems[item] ? "active" : ""}`}
        >
          {item}
        </button>
      ))}

      <div className="custom-input-wrapper">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputValueChange(e.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder={t("inputPlaceholder")}
          className="custom-input"
        />

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

      {customExcludesExact.length > 0 && (
        <div className="custom-excludes">
          {customExcludesExact.map((name) => (
            <span
              key={name}
              onClick={() => onRemoveExcludeTag(name)}
              className="exclude-tag"
            >
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
