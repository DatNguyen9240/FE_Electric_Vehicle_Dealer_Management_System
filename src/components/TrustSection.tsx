import React from "react";

const testimonials = [
  {
    text: (
      <>
        "Since using this system,
        <br />
        managing our charging stations has{" "}
        <span className="bg-blue-100 font-semibold px-1 rounded">
          become effortless.
        </span>
        "
      </>
    ),
    img: "/trust/01.png",
  },
  {
    text: (
      <>
        "Simple to use, reliable, and makes our EV business more efficient.{" "}
        <span className="bg-blue-100 font-semibold px-1 rounded">
          Highly recommended.
        </span>
        "
      </>
    ),
    img: "/trust/02.png",
  },
  {
    text: (
      <>
        Enjoy more than 10x revenue
        <br />
        with{" "}
        <span className="bg-blue-100 font-semibold px-1 rounded">
          real-time conversions.
        </span>
        <br />
        Grow your business.
      </>
    ),
    img: "/trust/03.png",
  },
];

const TrustSection: React.FC = () => {
  return (
    <section className="w-full py-10 md:py-20 bg-white">
      <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-black text-center mb-4">
        Over 1000+ people trust us
      </h2>
      <p className="text-gray-600 text-sm sm:text-base md:text-lg text-center mb-8 md:mb-10">
        Our users rely on us to ensure smooth operations, accurate analytics,
        and a seamless charging experience for drivers.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-full md:max-w-[1600px] mx-auto">
        {testimonials.map((item, idx) => (
          <div
            key={idx}
            className="bg-blue-50 rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col items-center shadow-md min-h-[340px] sm:min-h-[420px] md:min-h-[520px] max-w-full md:max-w-[480px] mx-auto"
          >
            <div className="mb-4 sm:mb-6 text-black text-base sm:text-lg md:text-xl font-semibold text-left w-full">
              {item.text}
            </div>
            <img
              src={item.img}
              alt="User testimonial"
              className="w-full h-48 sm:h-64 md:h-96 object-cover rounded-xl"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustSection;
