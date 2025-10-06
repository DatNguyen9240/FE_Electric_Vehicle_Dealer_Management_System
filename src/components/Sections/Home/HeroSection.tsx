import React from "react";

const HeroSection: React.FC = () => {
  return (
    <section className="relative w-full h-[320px] sm:h-[400px] md:h-[500px] xl:h-[600px] 2xl:h-[700px] ">
      {/* Hình full width, cao theo đúng tỷ lệ gốc */}
      <img
        src="/banner/01.png"
        alt="EV Charging Station"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Lớp phủ đen mờ */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Nội dung chữ nằm trên ảnh */}
      <div className="absolute inset-0 z-10 flex flex-col items-start justify-end pb-35 ps-15">
        {/* Khung text với blur 50 */}
        <div className="bg-white/5 backdrop-blur-[3px] rounded-4xl p-15 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl origin-left">
          <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
            EV CHARGING SOLUTION
          </h1>
          <p className="mb-6 text-md font-light text-white drop-shadow-lg">
            Choosing EV efficiency to ensure compatibility, efficiency, and
            convenience.
          </p>
          <button className="bg-white text-black font-medium px-[50px] py-2 mt-5 rounded-[10px] shadow hover:bg-black hover:text-white transition text-lg">
            Try it now
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
