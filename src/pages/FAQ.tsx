import React, { useState } from "react";

const faqs = [
  {
    question: "How can I book a charging slot?",
    answer:
      "You can book a charger through our website or mobile app by selecting your preferred time and station.",
  },
  {
    question: "What payment methods do you support?",
    answer:
      "We support e-wallets, credit/debit cards, and direct bank transfer.",
  },
  {
    question: "Can I cancel or reschedule my booking?",
    answer:
      "Yes, you can cancel or reschedule up to 30 minutes before your booking time without extra cost.",
  },
  {
    question: "What should I do if a charger stops working?",
    answer:
      "Please contact our support hotline immediately. Our staff will guide you or assign another available charger.",
  },
  {
    question: "How do I know if a charger is available?",
    answer: "Charger availability is shown in real-time on our booking system.",
  },
  {
    question: "Do I get an invoice after charging?",
    answer:
      "Yes, you can download your invoice from the app or request it via email.",
  },
  {
    question: "Is there a penalty for late arrival?",
    answer:
      "If you arrive more than 15 minutes late, your slot may be released for other users.",
  },
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white py-10 px-2">
      <h1 className="text-4xl font-bold text-center mb-2">
        Frequently Asked Questions
      </h1>
      <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
        Find answers to common questions about booking, charging, and payments.
        If you can’t find what you’re looking for, feel free to contact our
        support team.
      </p>
      <div className="max-w-2xl mx-auto space-y-2">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border-b">
            <button
              className="w-full flex justify-between items-center py-4 text-left font-semibold text-black focus:outline-none"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            >
              <span>{faq.question}</span>
              <svg
                className={`w-5 h-5 transform transition-transform duration-200 ${
                  openIndex === idx ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {openIndex === idx && (
              <div className="pb-4 pl-2 text-gray-500 text-[15px]">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
