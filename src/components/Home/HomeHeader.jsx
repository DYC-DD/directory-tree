import React from "react";

/**
 * HomeHeader
 * - 顯示標題 + 模式切換（folder/json/yaml）
 * - folder 模式時顯示「檔案大小顯示」切換按鈕
 */
export default function HomeHeader({
  uploadMode,
  onUploadModeChange,
  showFileSize,
  onToggleFileSize,
  t,
}) {
  return (
    <>
      <h1>
        {t(`title.prefix.${uploadMode}`)}

        <span style={{ display: "inline-block" }}>
          <select
            value={uploadMode}
            onChange={(e) => onUploadModeChange(e.target.value)}
            className="title-mode-select"
          >
            <option value="folder">{t("modeOptionFolder")}</option>
            <option value="json">{t("modeOptionJson")}</option>
            <option value="yaml">{t("modeOptionYaml")}</option>
          </select>
        </span>

        {t("title.suffix")}
      </h1>

      {uploadMode === "folder" && (
        <div className="file-size">
          <div>{t("toggleSizeHint")}</div>
          <button
            onClick={onToggleFileSize}
            className={`file-size-button ${showFileSize ? "active" : ""}`}
          >
            {t(showFileSize ? "toggleSizeOn" : "toggleSizeOff")}
          </button>
        </div>
      )}
    </>
  );
}
