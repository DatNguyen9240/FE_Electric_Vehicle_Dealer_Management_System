import {
  HeroSection,
  OurMissionSection,
  OurMissionSectionV2,
  MeetOurTeam,
} from "@components/Sections/AboutUs";
import React from "react";

const AboutUs: React.FC = () => {
  return (
    <>
      <HeroSection />
      <div className="max-w-[1500px] mx-auto px-4 md:px-12">
        <OurMissionSection />
        <OurMissionSectionV2 />
      </div>
      <MeetOurTeam />
    </>
  );
};
export default AboutUs;
