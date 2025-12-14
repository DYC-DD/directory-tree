import React from "react";

/**
 * ScreenshotWrapper
 * - 給 downloadImage() 用的「截圖用 DOM」
 * - 必須維持 id="screenshot-wrapper"，否則 html-to-image 找不到
 * - lines 由外部計算後傳入（避免這個元件自己拆 markdown）
 */
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
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
