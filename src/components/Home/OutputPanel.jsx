import React from "react";

/**
 * OutputPanel
 * - 顯示 Markdown 輸出區
 * - 提供 Copy / Download Markdown / Download Image 三個按鈕
 */
export default function OutputPanel({
  markdown,
  textRef,
  onCopy,
  onDownloadMarkdown,
  onDownloadImage,
  t,
}) {
  return (
    <div className="output-container">
      <div className="output-header">
        <span>Markdown</span>
        <div className="button-group">
          <button onClick={onCopy}>
            <img src={`./images/copy-solid.png`} alt="copy" className="icon" />
            {t("copy")}
          </button>

          <button onClick={onDownloadMarkdown}>
            <img
              src={`./images/download-solid.png`}
              alt="download"
              className="icon"
            />
            {t("download")}
          </button>

          <button onClick={onDownloadImage}>
            <img
              src={`./images/image-solid.png`}
              alt="image"
              className="icon"
            />
            {t("downloadImage")}
          </button>
        </div>
      </div>

      <pre className="output" ref={textRef}>
        {markdown}
      </pre>
    </div>
  );
}
