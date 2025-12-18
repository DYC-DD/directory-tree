import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";

import "./ScrambledText.css";

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

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

  useEffect(() => {
    if (!rootRef.current) return;

    const lineEls = rootRef.current.querySelectorAll(".scrambled-line");

    if (!lineEls.length) return;

    const allChars = [];
    const splits = [];

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
      const rect = c.getBoundingClientRect();
      const fixedWidth = rect.width;

      gsap.set(c, {
        display: "inline-block",
        width: fixedWidth,
        textAlign: "center",
        attr: { "data-content": c.innerHTML },
      });
    });

    const handleMove = (e) => {
      charsRef.current.forEach((c) => {
        const { left, top, width, height } = c.getBoundingClientRect();
        const dx = e.clientX - (left + width / 2);
        const dy = e.clientY - (top + height / 2);
        const dist = Math.hypot(dx, dy);

        if (dist < radius) {
          gsap.to(c, {
            overwrite: true,
            duration: duration * (1 - dist / radius),
            scrambleText: {
              text: c.dataset.content || "",
              chars: scrambleChars,
              speed,
            },
            ease: "none",
          });
        }
      });
    };

    const el = rootRef.current;
    el.addEventListener("pointermove", handleMove);

    return () => {
      el.removeEventListener("pointermove", handleMove);

      splitsRef.current.forEach((s) => s.revert());

      splitsRef.current = [];
      charsRef.current = [];
    };
  }, [radius, duration, speed, scrambleChars]);

  const isString = typeof children === "string";
  const lines = isString ? children.split("\n") : [children];

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
