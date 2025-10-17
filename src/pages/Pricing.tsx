import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMembershipPlansThunk } from "@redux/slice/Membership/MembershipThunk";
import type { RootState, AppDispatch } from "@redux/store/store";
import { useNavigate } from "react-router-dom";

const Pricing: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { current, plans } = useSelector(
    (state: RootState) => state.membership
  );

  useEffect(() => {
    dispatch(fetchMembershipPlansThunk());
  }, [dispatch]);

  // Display plans, always include Free
  const displayPlans = [
    {
      name: "Freebie",
      price: "0đ",
      desc: "Free plan for everyone.",
      features: [
        { text: "Access to all public charging stations", included: true },
        { text: "Standard queue priority", included: true },
        { text: "No monthly fee", included: true },
        { text: "Basic customer support", included: true },
        { text: "No discounts on charging fees", included: false },
        { text: "No bonus minutes", included: false },
      ],
      highlight: current === "FREE",
    },
    ...plans.map((plan) => ({
      name: plan.name,
      price: `${plan.monthly_fee_vnd}đ`,
      desc: `The ${plan.name} plan with more benefits.`,
      features: [
        { text: `Discount ${plan.mods.pricePerKwhPctOff}% on electricity price`, included: true },
        { text: `Discount ${plan.mods.pricePerMinPctOff}% on minute price`, included: true },
        { text: `Discount ${plan.mods.idleFeePerMinPctOff}% on idle fee`, included: true },
        { text: `Extra ${plan.mods.graceMinBonus} free minutes`, included: true },
        { text: `Discount ${plan.mods.minBalancePctOff}% on minimum balance`, included: true },
        { text: `Queue priority x${plan.mods.queueBoost}`, included: true },
      ],
      highlight: plan.isCurrent,
    })),
  ];

  return (
    <div className="min-h-screen bg-white py-10 px-2 max-w-7xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
        Powerful features for{" "}
        <span className="text-blue-600">powerful creators</span>
      </h1>
      <p className="text-center text-gray-500 mb-8">
        Choose a plan that's right for you
      </p>
      <div className="flex flex-col md:flex-row gap-8 justify-center mt-6">
        {displayPlans.map((plan) => (
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
              onClick={() => {
                if (plan.name === "Freebie") {
                  navigate("/booking");
                } else {
                  navigate(`/membership/purchase/${plan.name.toUpperCase()}`);
                }
              }}
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
