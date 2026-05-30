/**
 * OutputPanel
 * - 顯示轉換後的 Markdown 目錄樹內容
 * - 提供操作功能：
 *   - 複製
 *   - 下載 Markdown
 *   - 下載圖片
 *   - 清除內容
 */

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
          <button onClick={onCopy} title={t("copy")} aria-label={t("copy")}>
            <img src={`./images/copy-solid.png`} alt="" className="icon" />
            <span className="button-label">{t("copy")}</span>
          </button>

          {/* Download Markdown */}
          <button
            onClick={onDownloadMarkdown}
            title={t("download")}
            aria-label={t("download")}
          >
            <img
              src={`./images/download-solid.png`}
              alt=""
              className="icon"
            />
            <span className="button-label">{t("download")}</span>
          </button>

          {/* Download Image */}
          <button
            onClick={onDownloadImage}
            title={t("downloadImage")}
            aria-label={t("downloadImage")}
          >
            <img
              src={`./images/image-solid.png`}
              alt=""
              className="icon"
            />
            <span className="button-label">{t("downloadImage")}</span>
          </button>

          {/* Clear */}
          <button
            onClick={onClear}
            disabled={!markdown?.trim()}
            title={t("clear")}
            aria-label={t("clear")}
          >
            <img
              src={`./images/trash-solid.png`}
              alt=""
              className="icon"
            />
            <span className="button-label">{t("clear")}</span>
          </button>
        </div>
      </div>

      <pre className="output" ref={textRef}>
        {markdown}
      </pre>
    </div>
  );
}
