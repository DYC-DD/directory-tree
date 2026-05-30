/**
 * ScreenshotWrapper
 * - 建立「程式碼截圖」專用的隱藏 DOM 結構
 * - 提供行號、視窗裝飾（macOS 風格）與內容區塊
 * - 僅在轉圖片 / 擷取畫面時使用
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
