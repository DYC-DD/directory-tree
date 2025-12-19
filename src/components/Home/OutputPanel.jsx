import React from "react";

/**
 * OutputPanel
 * - 顯示轉換後的 Markdown 目錄樹內容
 * - 提供操作功能：
 *   - 複製
 *   - 下載 Markdown
 *   - 下載圖片
 *   - 清除內容
 */

function splitLineWithSizeSuffix(line) {
  const sizeRegex = /^(.*?)(\s\((?:0|\d+(?:\.\d+)?)\s(?:B|KB|MB|GB)\))$/;

  const match = line.match(sizeRegex);
  if (!match) return null;

  return {
    mainText: match[1],
    sizeText: match[2],
  };
}

function renderMarkdownWithColoredSize(markdown) {
  if (!markdown) return "";

  const lines = markdown.split("\n");

  return lines.map((line, idx) => {
    const parts = splitLineWithSizeSuffix(line);
    const isLastLine = idx === lines.length - 1;

    if (!parts) {
      return (
        <React.Fragment key={idx}>
          {line}
          {!isLastLine && <br />}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment key={idx}>
        {parts.mainText}
        <span className="size-info">{parts.sizeText}</span>
        {!isLastLine && <br />}
      </React.Fragment>
    );
  });
}

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
        {renderMarkdownWithColoredSize(markdown)}
      </pre>
    </div>
  );
}
