import React from "react";
import { useNavigate } from "react-router-dom";

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const handleContactClick = () => {
    navigate("/contact");
  };

  return (
    <section
      className="relative min-h-[60vh] md:min-h-[80vh] lg:min-h-screen flex items-start justify-start bg-cover bg-center"
      style={{ backgroundImage: "url('/banner/04.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-end w-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-white text-right mt-40 sm:mt-56 md:mt-80 lg:mt-[420px] max-w-full sm:max-w-md md:max-w-xl">
          <h1 className="text-xl sm:text-3xl md:text-5xl font-bold mb-3 md:mb-4 leading-tight">
            EV CHARGER BOOKING
          </h1>
          <p className="mb-6 md:mb-8 text-sm sm:text-base md:text-lg font-normal">
            Manage your charging sessions by booking a charger in advance.
          </p>
          <button
            onClick={handleContactClick}
            className="bg-white text-black px-5 sm:px-7 py-2 sm:py-3 rounded-lg shadow hover:bg-gray-200 transition-all duration-200 font-semibold text-sm sm:text-base cursor-pointer"
          >
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
