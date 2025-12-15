import React from "react";

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
