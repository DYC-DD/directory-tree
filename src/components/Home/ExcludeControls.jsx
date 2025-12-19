import React from "react";

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

      {Object.keys(excludedItems).map((item) => (
        <button
          key={item}
          onClick={() => onToggleExcludedItem(item)}
          className={`exclude-button ${excludedItems[item] ? "active" : ""}`}
        >
          {item}
        </button>
      ))}

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
