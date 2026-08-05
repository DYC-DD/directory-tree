import { useMemo } from "react";

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
  treeLines = [],
  textRef,
  onTreeItemClick,
  hashtagEnabled,
  onToggleHashtags,
  onCopy,
  onDownloadMarkdown,
  onDownloadImage,
  onClear,
  t,
}) {
  const hasInteractiveTree =
    treeLines.length > 0 && typeof onTreeItemClick === "function";
  const markdownLines = useMemo(() => markdown.split("\n"), [markdown]);

  const getTreeLineIndexFromEvent = (event) => {
    if (!(event.target instanceof Element)) return -1;

    const lineElement = event.target.closest(".output-tree-line");
    if (!lineElement || !event.currentTarget.contains(lineElement)) return -1;

    const lineIndex = Number.parseInt(
      lineElement.dataset.treeLineIndex,
      10
    );
    return Number.isInteger(lineIndex) ? lineIndex : -1;
  };

  const handleTreeClick = (event) => {
    if (!hasInteractiveTree) return;
    if (window.getSelection()?.toString()) return;

    const lineIndex = getTreeLineIndexFromEvent(event);
    const line = treeLines[lineIndex];
    if (!line) return;

    onTreeItemClick(line.target);
  };

  return (
    <div className="output-container">
      <div className="output-header">
        <span>Markdown</span>
        <div className="button-group">
          {/* Hashtag */}
          <button
            className={hashtagEnabled ? "active" : ""}
            onClick={onToggleHashtags}
            disabled={!markdown?.trim()}
            title={t("hashtag")}
            aria-label={t("hashtag")}
            aria-pressed={hashtagEnabled}
          >
            <img src={`./images/hashtag-solid.png`} alt="" className="icon" />
            <span className="button-label">{t("hashtag")}</span>
          </button>

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

      <pre
        className={`output ${hasInteractiveTree ? "output--tree" : ""}`}
        ref={textRef}
        onClick={handleTreeClick}
      >
        {hasInteractiveTree
          ? markdownLines.map((line, index) => (
              <span
                key={index}
                className="output-tree-line"
                data-tree-line-index={index}
              >
                <span className="output-tree-line-text">
                  {line || "\u00A0"}
                </span>
              </span>
            ))
          : markdown}
      </pre>
    </div>
  );
}
