import React from "react";

export default function HomeHeader({
  titleMode,
  isFolderMode,
  showFileSize,
  onToggleFileSize,
  t,
}) {
  return (
    <>
      <h1>
        {t(`title.prefix.${titleMode}`)}
        {t("title.suffix")}
      </h1>

      {isFolderMode && (
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
