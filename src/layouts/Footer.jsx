import React, { useEffect, useRef } from "react";
import "../styles/Footer.css";

const Footer = () => {
  const footerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        document.body.classList.toggle("footer-pull", entry.isIntersecting);
      });
    });

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  const startYear = 2025;
  const currentYear = new Date().getFullYear();

  const yearText =
    startYear === currentYear ? `${startYear}` : `${startYear}-${currentYear}`;

  return (
    <footer id="footer" ref={footerRef} className="animated-footer">
      <p>
        © {yearText} All rights reserved. -{" "}
        <a
          href="https://github.com/DYC-DD"
          target="_blank"
          rel="noopener noreferrer"
        >
          DENG
        </a>
      </p>
    </footer>
  );
};

export default Footer;
