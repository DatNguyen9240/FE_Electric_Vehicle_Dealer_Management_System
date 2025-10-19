import { HeroSection, StationListSection } from "@components/Sections/Booking";
import React from "react";

const Booking: React.FC = () => {
  return (
    <>
      <HeroSection />
      <div className="max-w-[1700px] mx-auto px-4 md:px-12">
        <StationListSection />
      </div>
    </>
  );
};
export default Booking;
