import React from "react";

/**
 * HiddenFileInput
 * - 根據 uploadMode 動態切換 input[type="file"] 的行為
 * - 作為「隱藏的檔案選擇器」，由外部按鈕以 ref 觸發點擊
 *
 * 支援模式：
 * - auto  ：自動判斷 JSON / YAML（限制單一檔案）
 * - folder：選擇整個資料夾（含多檔案）
 * - json  ：僅允許 JSON 檔案
 * - yaml  ：僅允許 YAML / YML 檔案
 */

export default function HiddenFileInput({
  fileInputRef,
  uploadMode,
  onFolderSelect,
  onJsonSelect,
  onYamlSelect,
}) {
  const isFolder = uploadMode === "folder";
  const isAutoFile = uploadMode === "auto";

  return (
    <input
      ref={fileInputRef}
      type="file"
      {...(isFolder
        ? { webkitdirectory: "true", directory: "", multiple: true }
        : isAutoFile
        ? { accept: ".json,.yaml,.yml", multiple: false }
        : uploadMode === "json"
        ? { accept: ".json", multiple: false }
        : { accept: ".yaml,.yml", multiple: false })}
      onChange={
        isFolder
          ? onFolderSelect
          : isAutoFile
          ? onJsonSelect
          : uploadMode === "json"
          ? onJsonSelect
          : onYamlSelect
      }
      style={{ display: "none" }}
    />
  );
}
