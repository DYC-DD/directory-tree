import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";
import { useEffect, useMemo, useRef } from "react";

import "./ScrambledText.css";

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

function isWideChar(ch) {
  if (!ch) return false;
  try {
    if (/\p{Extended_Pictographic}/u.test(ch)) return true;
  } catch {
    // 忽略
  }

  const wideRegex =
    /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFF01-\uFF60\uFFE0-\uFFE6]/;

  return wideRegex.test(ch);
}

const ScrambledText = ({
  radius = 100,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = ".:",
  className = "",
  style = {},
  children,
}) => {
  const rootRef = useRef(null);
  const charsRef = useRef([]);
  const splitsRef = useRef([]);

  const lines = useMemo(() => {
    const isString = typeof children === "string";
    return isString ? children.split("\n") : [children];
  }, [children]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const lineEls = root.querySelectorAll(".scrambled-line");
    if (!lineEls.length) return;

    const splits = [];
    const allChars = [];

    lineEls.forEach((el) => {
      const split = SplitText.create(el, {
        type: "chars",
        charsClass: "char",
      });
      splits.push(split);
      allChars.push(...split.chars);
    });

    splitsRef.current = splits;
    charsRef.current = allChars;

    charsRef.current.forEach((c) => {
      c.dataset.content = c.innerHTML;

      const originalChar = c.textContent ?? "";
      const width = isWideChar(originalChar) ? "1.8ch" : "1ch";

      gsap.set(c, {
        display: "inline-block",
        width,
        textAlign: "center",
      });
    });

    const handleMove = (e) => {
      const { clientX, clientY } = e;

      charsRef.current.forEach((c) => {
        const { left, top, width, height } = c.getBoundingClientRect();
        const cx = left + width / 2;
        const cy = top + height / 2;

        const dx = clientX - cx;
        const dy = clientY - cy;
        const dist = Math.hypot(dx, dy);

        if (dist < radius) {
          const d = duration * (1 - dist / radius);

          gsap.to(c, {
            overwrite: true,
            duration: d,
            ease: "none",
            scrambleText: {
              text: c.dataset.content || "",
              chars: scrambleChars,
              speed,
            },
          });
        }
      });
    };

    root.addEventListener("pointermove", handleMove);

    return () => {
      root.removeEventListener("pointermove", handleMove);

      splitsRef.current.forEach((s) => s.revert());
      splitsRef.current = [];
      charsRef.current = [];
    };
  }, [radius, duration, speed, scrambleChars]);

  return (
    <div ref={rootRef} className={`text-block ${className}`} style={style}>
      <p>
        {lines.map((line, idx) => (
          <span key={idx}>
            <span className="scrambled-line">{line}</span>
            {idx < lines.length - 1 ? <br /> : null}
          </span>
        ))}
      </p>
    </div>
  );
};

export default ScrambledText;
