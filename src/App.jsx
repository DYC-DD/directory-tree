import React, { useEffect } from "react";
import "./i18n";
import Footer from "./layouts/Footer";
import Home from "./pages/Home";
import "./styles/App.css";

function App() {
  useEffect(() => {}, []);

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
