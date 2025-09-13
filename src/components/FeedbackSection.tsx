import React from "react";

const FeedbackSection: React.FC = () => {
  return (
    <section className="relative w-full h-[400px] md:h-[520px] xl:h-[600px] mb-20 md:mb-20 rounded-lg overflow-hidden">
      {/* Background image */}
      <img
        src="/feedback/01.png"
        alt="EV Charging Feedback"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />
      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end">
        <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-16 xl:px-32 pb-10">
          {/* Text */}
          <div className="max-w-lg text-white">
            <h2 className="text-2xl md:text-4xl xl:text-5xl font-bold mb-2">
              Your feedback is
              <br />
              valuable to our.
            </h2>
            <p className="text-base md:text-lg text-white/80 mb-4">
              We&apos;d love to hear from you.
            </p>
          </div>
          {/* Button */}
          <div className="mt-6 md:mt-0">
            <a
              href="#"
              className="border-2 border-white text-white px-10 py-3 rounded-xl text-lg font-medium hover:bg-white hover:text-black transition"
            >
              FILL FORM
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeedbackSection;
