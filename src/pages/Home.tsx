import React from "react";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import ChargingStationsSection from "../components/ChargingStationsSection";
import ManageSection from "../components/ManageSection";
import TrustSection from "../components/TrustSection";
import FeedbackSection from "../components/FeedbackSection";

const Home: React.FC = () => {
  return (
    <>
      <HeroSection />
      <div className="max-w-[1500px] mx-auto px-4 md:px-12">
        <AboutSection />
        <ChargingStationsSection />
        <ManageSection />
        <TrustSection />
        {/* Các section khác */}
      </div>
      <FeedbackSection />
    </>
  );
};

export default Home;
