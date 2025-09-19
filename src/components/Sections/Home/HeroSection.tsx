import React from "react";

const HeroSection: React.FC = () => {
  return (
    <section className="relative w-full h-[320px] sm:h-[400px] md:h-[500px] xl:h-[600px] 2xl:h-[700px]">
      {/* Hình full width, cao theo đúng tỷ lệ gốc */}
      <img
        src="/banner/01.png"
        alt="EV Charging Station"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Lớp phủ đen mờ */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Nội dung chữ nằm trên ảnh */}
      <div className="absolute inset-0 z-10 flex flex-col items-start justify-center text-white pl-4 sm:pl-8 md:pl-12 xl:pl-24">
        <h1 className="text-2xl sm:text-3xl md:text-5xl xl:text-6xl font-bold mb-4 drop-shadow-lg">
          EV CHARGING SOLUTION
        </h1>
        <p className="mb-6 text-sm sm:text-base md:text-lg xl:text-xl drop-shadow-lg max-w-xl">
          Choosing EV efficiency to ensure compatibility, efficiency, and
          convenience.
        </p>
        <button className="bg-white text-black font-medium px-4 sm:px-6 py-2 rounded shadow hover:bg-gray-200 transition text-xs sm:text-sm md:text-base">
          Try it now
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
