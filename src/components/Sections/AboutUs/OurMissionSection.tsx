import React from "react";

const OurMissionSection: React.FC = () => {
  return (
    <section className="w-full bg-white py-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-4">
        {/* Text */}
        <div className="md:w-2/5 w-full">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-700 text-base md:text-md leading-relaxed">
            "Contribute to accelerating the development of electric vehicle
            charging station infrastructure and welcoming the era of electric
            vehicle boom in the Vietnamese market. BY ONE has a mission to
            create a convenient, reliable and reasonably priced charging station
            network that meets everyone’s fast and convenient charging needs."
          </p>
        </div>
        {/* Image */}
        <div className="md:w-3/5 w-full flex justify-center">
          <img
            src="/about/02.png"
            alt="EV Chargers"
            className="w-full object-contain"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
};

export default OurMissionSection;
