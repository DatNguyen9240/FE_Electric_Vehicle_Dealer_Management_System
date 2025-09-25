import React from "react";

const ManageSection: React.FC = () => {
  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="flex flex-col md:flex-row items-center">
        {/* Text content */}
        <div className="w-full md:w-3/7 mb-10 md:mb-0">
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-6 leading-tight">
            Manage your EV
            <br />
            charging stations
            <br />
            anywhere
          </h2>
          <p className="text-gray-600 text-base md:text-lg mb-8">
            Our platform lets you monitor, control, and optimize your charging
            stations in real time — on both web and mobile.
          </p>
          <button className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            Get Started
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        {/* Image content */}
        <div className="w-full md:w-3/5 flex justify-center">
          <div className="relative w-full max-w-xl">
            <img
              src="/frame/01.png"
              alt="Browser"
              className="w-full rounded-xl shadow-xl"
            />
            <img
              src="/frame/02.png"
              alt="Phone"
              className="absolute left-1/2 bottom-0 w-2/5 min-w-[160px] -translate-x-1/2 translate-y-8 rounded-xl shadow-xl"
              style={{ zIndex: 2 }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ManageSection;
