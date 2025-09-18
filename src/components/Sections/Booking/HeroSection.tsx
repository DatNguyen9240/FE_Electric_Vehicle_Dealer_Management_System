import React from "react";

const HeroSection: React.FC = () => {
  return (
    <section
      className="relative h-screen flex items-start justify-start bg-cover bg-center"
      style={{ backgroundImage: "url('/banner/04.png')" }} // Đổi đường dẫn ảnh cho đúng
    >
      {/* Overlay nếu muốn làm mờ nhẹ */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-end w-full max-w-7xl">
        <div className="text-white text-right mt-80 md:mt-[420px]">
          <h1 className="text-2xl md:text-5xl font-bold mb-4">
            EV CHARGER BOOKING
          </h1>
          <p className="mb-8 text-base md:text-lg font-normal">
            Manage your charging sessions by booking a charger in advance.
          </p>
          <button className="bg-white text-black px-7 py-3 rounded-lg shadow hover:bg-gray-200 transition font-semibold">
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
