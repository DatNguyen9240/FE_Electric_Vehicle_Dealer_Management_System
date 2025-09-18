import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="flex items-center px-4 md:px-8 py-3 md:py-4 bg-white shadow-md relative">
      <div className="flex items-center min-w-[120px] md:min-w-[320px]">
        <img
          src="/logo/01.png"
          alt="Logo"
          className="h-10 w-25 md:h-10 md:w-30 object-contain"
        />
      </div>

      {/* Desktop menu */}
      <nav className="hidden md:flex gap-12 absolute left-1/2 -translate-x-1/2 z-[100]">
        <a
          href="#"
          className="font-semibold text-sm xl:text-base 2xl:text-lg hover:text-blue-600"
        >
          Home
        </a>

        {/* Dropdown Features */}
        <div
          className="relative"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <button className="font-semibold text-sm xl:text-base 2xl:text-lg hover:text-blue-600 flex items-center gap-1">
            Features
            <svg
              className="w-4 h-4"
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

          {dropdownOpen && (
            <div className="absolute top-full left-0 w-40 bg-white shadow-md rounded-md z-[9999]">
              <a
                href="/booking"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                Booking
              </a>
              <a
                href="/pricing"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                Pricing
              </a>
              <a
                href="/faq"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                FAQ
              </a>
            </div>
          )}
        </div>

        <a
          href="#"
          className="font-semibold text-sm xl:text-base 2xl:text-lg hover:text-blue-600"
        >
          News
        </a>
        <a
          href="#"
          className="font-semibold text-sm xl:text-base 2xl:text-lg hover:text-blue-600"
        >
          Contact Us
        </a>
      </nav>

      <button
        className="hidden md:block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition ml-auto"
        onClick={() => navigate("/login")}
      >
        Login
      </button>

      {/* Mobile menu button */}
      <button
        className="md:hidden ml-auto text-blue-600"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open menu"
      >
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
          <rect
            x="4"
            y="7"
            width="16"
            height="2.5"
            rx="1.25"
            fill="currentColor"
          />
          <rect
            x="4"
            y="12"
            width="16"
            height="2.5"
            rx="1.25"
            fill="currentColor"
          />
          <rect
            x="4"
            y="17"
            width="16"
            height="2.5"
            rx="1.25"
            fill="currentColor"
          />
        </svg>
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-center py-4 z-50 md:hidden">
          <a
            href="#"
            className="font-medium hover:text-blue-600 py-2 w-full text-center"
            onClick={() => setOpen(false)}
          >
            Home
          </a>

          {/* Dropdown in mobile */}
          <div className="w-full text-center">
            <button
              className="font-medium hover:text-blue-600 py-2 w-full flex justify-center items-center gap-1"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              Features
              <svg
                className={`w-4 h-4 transform ${
                  dropdownOpen ? "rotate-180" : ""
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
            {dropdownOpen && (
              <div className="flex flex-col bg-gray-50 rounded-md mx-4 mb-2">
                <a
                  href="#"
                  className="py-2 text-sm hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Feature 1
                </a>
                <a
                  href="#"
                  className="py-2 text-sm hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Feature 2
                </a>
                <a
                  href="#"
                  className="py-2 text-sm hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Feature 3
                </a>
              </div>
            )}
          </div>

          <a
            href="#"
            className="font-medium hover:text-blue-600 py-2 w-full text-center"
            onClick={() => setOpen(false)}
          >
            News
          </a>
          <a
            href="#"
            className="font-medium hover:text-blue-600 py-2 w-full text-center"
            onClick={() => setOpen(false)}
          >
            Contact Us
          </a>
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition mt-2 w-3/4"
            onClick={() => {
              setOpen(false);
              navigate("/login");
            }}
          >
            Login
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
