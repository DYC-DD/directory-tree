import { useRef } from "react";

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
  onCopy,
  onDownloadMarkdown,
  onDownloadImage,
  onClear,
  t,
}) {
  const hasInteractiveTree =
    treeLines.length > 0 && typeof onTreeItemClick === "function";
  const hoverLineRef = useRef(null);

  const getTreeLineFromEvent = (event) => {
    const node = event.currentTarget;
    const styles = window.getComputedStyle(node);
    const lineHeight = Number.parseFloat(styles.lineHeight);
    const paddingTop = Number.parseFloat(styles.paddingTop);

    if (!Number.isFinite(lineHeight) || lineHeight <= 0) return null;

    const y =
      event.clientY - node.getBoundingClientRect().top + node.scrollTop;
    const lineIndex = Math.floor((y - (paddingTop || 0)) / lineHeight);
    const line = treeLines[lineIndex];

    if (!line) return null;

    return {
      line,
      lineHeight,
      lineIndex,
      paddingLeft: Number.parseFloat(styles.paddingLeft) || 0,
      paddingTop: paddingTop || 0,
    };
  };

  const handleTreeMouseMove = (event) => {
    if (!hasInteractiveTree || !hoverLineRef.current) return;

    const match = getTreeLineFromEvent(event);
    if (!match) {
      hoverLineRef.current.hidden = true;
      return;
    }

    hoverLineRef.current.hidden = false;
    hoverLineRef.current.textContent = match.line.text;
    hoverLineRef.current.style.height = `${match.lineHeight}px`;
    hoverLineRef.current.style.left = `${match.paddingLeft}px`;
    hoverLineRef.current.style.lineHeight = `${match.lineHeight}px`;
    hoverLineRef.current.style.top = `${
      match.paddingTop + match.lineIndex * match.lineHeight
    }px`;
  };

  const handleTreeMouseLeave = () => {
    if (!hoverLineRef.current) return;
    hoverLineRef.current.hidden = true;
  };

  const handleTreeClick = (event) => {
    if (!hasInteractiveTree) return;
    if (window.getSelection()?.toString()) return;

    const match = getTreeLineFromEvent(event);
    if (!match) return;

    onTreeItemClick(match.line.target);
  };

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

      <pre
        className={`output ${hasInteractiveTree ? "output--tree" : ""}`}
        ref={textRef}
        onClick={handleTreeClick}
        onMouseLeave={handleTreeMouseLeave}
        onMouseMove={handleTreeMouseMove}
      >
        {markdown}
        {hasInteractiveTree && (
          <span
            ref={hoverLineRef}
            className="output-tree-hover-line"
            aria-hidden="true"
            hidden
          />
        )}
      </pre>
    </div>
  );
}
