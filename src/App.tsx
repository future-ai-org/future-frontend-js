import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Web3Provider, useWeb3 } from "./contexts/Web3ModalContext";

import { Home } from "./components/Home";
import { Footer } from "./components/Footer";
import About from "./components/About";
import { Invest } from "./components/Invest";
import { Trading } from "./components/Trading";
import Header from "./components/Header";
import Astrology from "./components/Astrology";
import Dashboard from "./components/Dashboard";

import "./styles/global.css";

const AppContent: React.FC = () => {
  const { isConnected } = useWeb3();

  return (
    <div className="App">
      <Header />
      <main className="App-header">
        <Routes>
          <Route path="/" element={isConnected ? <Dashboard /> : <Home />} />
          <Route path="/astrology" element={<Astrology />} />
          <Route path="/invest" element={<Invest />} />
          <Route path="/about" element={<About />} />
          <Route path="/trading/:assetId" element={<Trading />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Web3Provider>
        <Router>
          <AppContent />
        </Router>
      </Web3Provider>
    </ThemeProvider>
  );
};

export default App;
