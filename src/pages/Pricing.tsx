import React, { useState } from "react";

const plans = [
  {
    name: "Freebie",
    price: "$0",
    desc: "Ideal for individuals who need quick access to basic features.",
    features: [
      { text: "20,000+ of PNG & SVG graphics", included: true },
      { text: "Access to 100 million stock images", included: true },
      { text: "Upload custom icons and fonts", included: false },
      { text: "Unlimited Sharing", included: false },
      { text: "Upload graphics & video in up to 4k", included: false },
      { text: "Unlimited Projects", included: false },
      { text: "Instant Access to our design system", included: false },
      { text: "Create teams to collaborate on designs", included: false },
    ],
    highlight: false,
  },
  {
    name: "Professional",
    price: "$25",
    desc: "Ideal for individuals who need advanced features and tools for client work.",
    features: [
      { text: "20,000+ of PNG & SVG graphics", included: true },
      { text: "Access to 100 million stock images", included: true },
      { text: "Upload custom icons and fonts", included: true },
      { text: "Unlimited Sharing", included: true },
      { text: "Upload graphics & video in up to 4k", included: true },
      { text: "Unlimited Projects", included: true },
      { text: "Instant Access to our design system", included: true },
      { text: "Create teams to collaborate on designs", included: true },
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "$100",
    desc: "Ideal for businesses who need personalized services and security for large teams.",
    features: [
      { text: "20,000+ of PNG & SVG graphics", included: true },
      { text: "Access to 100 million stock images", included: true },
      { text: "Upload custom icons and fonts", included: true },
      { text: "Unlimited Sharing", included: true },
      { text: "Upload graphics & video in up to 4k", included: true },
      { text: "Unlimited Projects", included: true },
      { text: "Instant Access to our design system", included: true },
      { text: "Create teams to collaborate on designs", included: true },
    ],
    highlight: false,
  },
];

const Pricing: React.FC = () => {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="min-h-screen bg-white py-10 px-2 max-w-7xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
        Powerful features for{" "}
        <span className="text-blue-600">powerful creators</span>
      </h1>
      <p className="text-center text-gray-500 mb-8">
        Choose a plan that's right for you
      </p>
      <div className="flex flex-col items-center justify-center mb-2 relative">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={!yearly}
              onChange={() => setYearly(false)}
              className="accent-blue-600"
            />
            <span className="font-medium text-gray-700">Pay Monthly</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={yearly}
              onChange={() => setYearly(true)}
              className="accent-blue-600"
            />
            <span className="font-medium text-gray-700">Pay Yearly</span>
          </label>
        </div>
        {yearly && (
          <div className="flex items-center relative left-[60px] margin-top-[20px] xl:left-[200px] xl:-mt-[35px]">
            <img
              src="/arrow/01.png"
              alt="arrow"
              className="w-22 h-22 object-contain mr-1 hidden xl:block" // Tăng kích thước hình
            />
            <span className="text-blue-600 font-medium text-base ml-0">
              Save 25%
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col md:flex-row gap-8 justify-center mt-6">
        {plans.map((plan, idx) => (
          <div
            key={plan.name}
            className={`flex-1 max-w-sm mx-auto rounded-2xl border
							${
                plan.highlight
                  ? "border-blue-700 bg-blue-700 text-white shadow-lg scale-105 z-10"
                  : "border-gray-200 bg-white text-gray-900"
              }
							p-8 flex flex-col transition-all`}
            style={
              plan.highlight
                ? { boxShadow: "0 8px 32px 0 rgba(37,99,235,0.10)" }
                : {}
            }
          >
            <div
              className={`mb-2 font-semibold text-lg ${
                plan.highlight ? "text-white" : ""
              }`}
            >
              {plan.name}
            </div>
            <div
              className={`mb-4 text-sm ${
                plan.highlight ? "text-blue-100" : "text-gray-500"
              }`}
            >
              {plan.desc}
            </div>
            <div className="flex items-end mb-6">
              <span
                className={`text-3xl font-bold ${
                  plan.highlight ? "text-white" : "text-gray-900"
                }`}
              >
                {plan.price}
              </span>
              <span
                className={`ml-1 text-base font-medium ${
                  plan.highlight ? "text-blue-100" : "text-gray-400"
                }`}
              >
                /Month
              </span>
            </div>
            <button
              className={`mb-6 py-2 rounded-lg font-semibold transition
								${
                  plan.highlight
                    ? "bg-white text-blue-700 hover:bg-blue-50"
                    : "bg-white border border-blue-600 text-blue-600 hover:bg-blue-50"
                }
							`}
            >
              Get Started Now
            </button>
            <ul className="flex-1 flex flex-col gap-3">
              {plan.features.map((f, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-3 text-sm
        ${
          f.included
            ? plan.highlight
              ? "text-white"
              : "text-gray-700"
            : "text-gray-400 line-through"
        }
      `}
                >
                  {f.included ? (
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        plan.highlight ? "bg-white" : "bg-blue-200"
                      }`}
                    >
                      <svg
                        className={`w-4 h-4 ${
                          plan.highlight ? "text-blue-600" : "text-blue-500"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                  {f.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
