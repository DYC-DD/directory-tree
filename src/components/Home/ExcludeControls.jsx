import React, { useEffect, useState } from "react";

import { getExcludeTargetLabel } from "../../utils/excludeUtils";

/**
 * ExcludeControls
 * - 提供「資料夾模式」下的排除控制介面
 *   1. 內建項目快速切換（button）
 *   2. 自訂輸入排除（input + suggestion）
 *   3. 自訂排除標籤顯示與移除
 */

const COLLAPSED_EXCLUDE_LIMIT = 6;

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
  const [isExcludeListExpanded, setIsExcludeListExpanded] = useState(false);

  const excludeChips = [
    ...Object.keys(excludedItems).map((item) => ({
      id: `default:${item}`,
      kind: "default",
      label: item,
      isActive: excludedItems[item],
      onClick: () => onToggleExcludedItem(item),
    })),
    ...customExcludeTargets.map((target) => {
      const label = getExcludeTargetLabel(target);

      return {
        id: target.id,
        kind: "custom",
        label,
        title: label,
        isActive: true,
        onClick: () => onRemoveExcludeTag(target.id),
      };
    }),
  ];
  const shouldCollapseExcludeList =
    excludeChips.length > COLLAPSED_EXCLUDE_LIMIT;
  const hiddenExcludeCount = excludeChips.length - COLLAPSED_EXCLUDE_LIMIT;
  const visibleExcludeChips =
    shouldCollapseExcludeList && !isExcludeListExpanded
      ? excludeChips.slice(0, COLLAPSED_EXCLUDE_LIMIT)
      : excludeChips;

  useEffect(() => {
    if (!shouldCollapseExcludeList && isExcludeListExpanded) {
      setIsExcludeListExpanded(false);
    }
  }, [isExcludeListExpanded, shouldCollapseExcludeList]);

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
        {visibleExcludeChips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={chip.onClick}
            className={`exclude-button ${
              chip.kind === "default"
                ? "default-exclude-button"
                : "custom-exclude-button"
            } ${chip.isActive ? "active" : ""}`}
            title={chip.title}
          >
            {chip.label}
          </button>
        ))}

        {shouldCollapseExcludeList && (
          <button
            type="button"
            className={`exclude-button exclude-list-toggle ${
              isExcludeListExpanded ? "active" : ""
            }`}
            onClick={() => setIsExcludeListExpanded((current) => !current)}
            aria-expanded={isExcludeListExpanded}
          >
            {isExcludeListExpanded
              ? t("hideListCollapse")
              : t("hideListShowMore", { count: hiddenExcludeCount })}
          </button>
        )}
      </div>
    </div>
  );
}
