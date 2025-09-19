import React from "react";
import {
  AboutSection,
  HeroSection,
  FeedbackSection,
  ManageSection,
  TrustSection,
  ChargingStationsSection,
} from "@components/Sections/Home";

const Home: React.FC = () => {
  return (
    <>
      <HeroSection />
      <div className="max-w-[1400px] mx-auto px-4 md:px-12">
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
