import React from "react";

const AboutSection: React.FC = () => {
  return (
    <section
      className="
        w-full
        flex flex-col md:flex-row
        items-start
        py-20 md:py-32
      "
    >
      {/* Hình ảnh bên trái – rộng vừa phải và căn trái */}
      <div className="w-full md:w-4/5 flex">
        <img
          src="/banner/02.png"
          alt="EV Charging"
          className="w-[780px] max-w-full h-auto rounded-lg shadow"
        />
      </div>

      {/* Nội dung bên phải – rộng thêm */}
      <div
        className="
          w-full md:w-3/5
          flex flex-col justify-start
          mt-6 sm:mt-8 md:mt-10
          md:pl-8
        "
      >
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 text-black">
          About Us
        </h2>
        <p className="mb-4 text-gray-700 text-sm sm:text-base md:text-lg">
          We are committed to building smart, reliable EV charging networks for
          a sustainable future.
        </p>
        <p className="mb-6 text-xs sm:text-sm text-gray-500">
          <span className="text-gray-600">developed by </span>
          <span className="font-bold text-black">E.V.C</span>
        </p>
        <hr className="mb-6" />
        <a
          href="#"
          className="text-blue-600 font-semibold flex items-center gap-2 hover:underline"
        >
          Read more
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </section>
  );
};

export default AboutSection;
