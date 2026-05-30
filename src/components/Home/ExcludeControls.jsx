import React from "react";

import { getExcludeTargetLabel } from "../../utils/excludeUtils";

/**
 * ExcludeControls
 * - 提供「資料夾模式」下的排除控制介面
 *   1. 內建項目快速切換（button）
 *   2. 自訂輸入排除（input + suggestion）
 *   3. 自訂排除標籤顯示與移除
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
  customExcludeTargets,
  onRemoveExcludeTag,
  t,
}) {
  // 非 folder 模式時不顯示任何內容
  if (uploadMode !== "folder") return null;

  return (
    <div className="checkbox">
      {/* 排除功能說明文字 */}
      <span>{t("hideLabel")}</span>

      {/* 自訂排除輸入區塊 */}
      <div className="custom-input-wrapper">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputValueChange(e.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder={t("inputPlaceholder")}
          className="custom-input"
        />

        {/* 當有輸入內容時，顯示建議清單 */}
        {inputValue && (
          <div className="suggestion-list">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((option, index) => (
                <div
                  key={option.id}
                  onClick={() => onSuggestionClick(option)}
                  className={`suggestion-item ${
                    highlightIndex === index ? "highlighted" : ""
                  } ${index % 2 === 0 ? "even" : "odd"}`}
                  title={option.displayPath}
                >
                  <span className="suggestion-name">
                    {option.type === "folder" ? `${option.name}/` : option.name}
                  </span>
                  <span className="suggestion-path">{option.displayPath}</span>
                </div>
              ))
            ) : (
              // 無任何符合的建議時顯示提示
              <div className="no-suggestions">{t("noSuggestions")}</div>
            )}
          </div>
        )}
      </div>

      {/* 排除項目標籤列 */}
      <div className="default-excludes">
        {Object.keys(excludedItems).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onToggleExcludedItem(item)}
            className={`exclude-button default-exclude-button ${
              excludedItems[item] ? "active" : ""
            }`}
          >
            {item}
          </button>
        ))}

        {customExcludeTargets.map((target) => (
          <button
            key={target.id}
            type="button"
            onClick={() => onRemoveExcludeTag(target.id)}
            className="exclude-button custom-exclude-button active"
            title={getExcludeTargetLabel(target)}
          >
            {getExcludeTargetLabel(target)}
          </button>
        ))}
      </div>
    </div>
  );
}
