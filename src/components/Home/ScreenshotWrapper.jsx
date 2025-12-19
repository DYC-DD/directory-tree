import React from "react";

/**
 * ScreenshotWrapper
 * - 建立「程式碼截圖」專用的隱藏 DOM 結構
 * - 提供行號、視窗裝飾（macOS 風格）與內容區塊
 * - 僅在轉圖片 / 擷取畫面時使用
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

function renderLineWithColoredSize(line) {
  const parts = splitLineWithSizeSuffix(line);
  if (!parts) return line;

  return (
    <>
      {parts.mainText}
      <span className="size-info">{parts.sizeText}</span>
    </>
  );
}

export default function ScreenshotWrapper({ lines }) {
  return (
    <div id="screenshot-wrapper" style={{ display: "none" }}>
      <div className="codeSnap-wrapper">
        <div className="codeSnap-header">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
        </div>

        <div className="codeSnap-body-with-lines">
          <div className="line-numbers">
            {lines.map((_, idx) => (
              <div key={idx}>{idx + 1}</div>
            ))}
          </div>

          <div className="codeSnap-body">
            {lines.map((line, idx) => (
              <div key={idx} className="codeSnap-body-line">
                {renderLineWithColoredSize(line)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
