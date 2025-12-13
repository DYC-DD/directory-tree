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

  return (
    <footer id="footer" ref={footerRef} className="animated-footer">
      <p>© 2025 DYC. All rights reserved.</p>
      <p>
        Developed and maintained by{" "}
        <a
          href="https://github.com/DYC-DD"
          target="_blank"
          rel="noopener noreferrer"
        >
          DYC-DD
        </a>
      </p>
      <p>
        <a href="mailto:dyccc01@gmail.com">Contact Us</a>
      </p>
    </footer>
  );
};

export default Footer;
