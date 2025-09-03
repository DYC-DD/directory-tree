import React, { useEffect } from "react";
import "./i18n";
import Footer from "./layouts/Footer";
import Home from "./pages/Home";
import "./styles/App.css";
import showConsoleEasterEgg from "./utils/consoleEasterEgg";
import detectAndApplyLanguageAlias from "./utils/detectLanguageAlias";

function App() {
  useEffect(() => {
    showConsoleEasterEgg();
    detectAndApplyLanguageAlias();
  }, []);

  return (
    <>
      <main className="container">
        <Home />
      </main>
      <Footer />
    </>
  );
}

export default App;
