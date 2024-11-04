// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Import Routes instead of Switch
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import About from "./components/About";
import Contact from "./components/Contact";
import Auth from "./components/Auth";
import LandingPage from "./components/LandingPage"; // Create this component
import { AuthProvider } from "./components/AuthContext"; // Import the AuthContext
import BuyStocks from "./components/BuyStocks";
import MyProfile from "./components/MyProfile";
import MyPortfolio from "./components/MyPortfolio";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/landing" element={<LandingPage />} /> 
          <Route path="/buy-stocks" element={<BuyStocks />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/buy-stocks" element={<BuyStocks />} />
          <Route path="/my-portfolio" element={<MyPortfolio />} />
     
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
