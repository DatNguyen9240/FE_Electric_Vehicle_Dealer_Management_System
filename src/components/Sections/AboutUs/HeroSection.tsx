import React from "react";
import { Link } from "react-router-dom";

const HeroSection: React.FC = () => {
  return (
    <section
      className="relative h-screen flex items-start justify-start bg-cover bg-center"
      style={{ backgroundImage: "url('/banner/03.png')" }}
    >
      {/* Overlay mờ nếu muốn */}
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 text-white px-8  md:pl-32 md:pt-35 max-w-5xl w-full">
        <h1 className="text-2xl md:text-5xl font-bold mb-4 text-left md:text-left">
          CHARGE YOUR CAR – REFRESH <br />
          <span className="block mx-auto md:ml-60 text-center md:text-center w-fit">
            YOUR LIFE
          </span>
        </h1>
        <button className="mt-100  bg-white text-black px-8 py-2 rounded-md shadow hover:bg-black hover:text-white transition">
          <Link to="/contact">Contact Us</Link>
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
