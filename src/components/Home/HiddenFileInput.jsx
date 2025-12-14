import React from "react";

/**
隱藏的 <input type="file" /> 元件
 */
export default function HiddenFileInput({
  fileInputRef,
  uploadMode,
  onFolderSelect,
  onJsonSelect,
  onYamlSelect,
}) {
  return (
    <input
      ref={fileInputRef}
      type="file"
      {...(uploadMode === "folder"
        ? { webkitdirectory: "true", directory: "", multiple: true }
        : uploadMode === "json"
        ? { accept: ".json", multiple: false }
        : { accept: ".yaml, .yml", multiple: false })}
      onChange={
        uploadMode === "folder"
          ? onFolderSelect
          : uploadMode === "json"
          ? onJsonSelect
          : onYamlSelect
      }
      style={{ display: "none" }}
    />
  );
}
