import React from "react";

export default function OutputPanel({
  markdown,
  textRef,
  onCopy,
  onDownloadMarkdown,
  onDownloadImage,
  onClear,
  t,
}) {
  return (
    <div className="output-container">
      <div className="output-header">
        <span>Markdown</span>
        <div className="button-group">
          {/* Copy */}
          <button onClick={onCopy}>
            <img src={`./images/copy-solid.png`} alt="copy" className="icon" />
            {t("copy")}
          </button>

          {/* Download Markdown */}
          <button onClick={onDownloadMarkdown}>
            <img
              src={`./images/download-solid.png`}
              alt="download"
              className="icon"
            />
            {t("download")}
          </button>

          {/* Download Image */}
          <button onClick={onDownloadImage}>
            <img
              src={`./images/image-solid.png`}
              alt="image"
              className="icon"
            />
            {t("downloadImage")}
          </button>

          {/* Clear */}
          <button
            onClick={onClear}
            disabled={!markdown?.trim()}
            title={t("clear")}
          >
            <img
              src={`./images/trash-solid.png`}
              alt="clear"
              className="icon"
            />
            {t("clear")}
          </button>
        </div>
      </div>

      <pre className="output" ref={textRef}>
        {markdown}
      </pre>
    </div>
  );
}
