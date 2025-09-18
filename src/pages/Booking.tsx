import { HeroSection, ChargingListSection } from "@components/Sections/Booking";
import React from "react";

const Booking: React.FC = () => {
  return (
    <>
      <HeroSection />
      <div className="max-w-[1300px] mx-auto px-4 md:px-12">
        <ChargingListSection />
      </div>
    </>
  );
};
export default Booking;
