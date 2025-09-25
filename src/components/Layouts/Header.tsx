import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "@assets/logo.png";

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="flex items-center px-20  py-2  bg-white shadow-md relative">
      <div className="flex items-center min-w-[120px] md:min-w-[320px] ps-10">
        <img
          src={logo}
          alt="Logo"
          className="h-15 w-15 object-contain"
        />
      </div>

      {/* Desktop menu */}
      <nav className="hidden md:flex gap-12 absolute left-1/2 -translate-x-1/2 z-[100]">
        <Link
          to="/"
          className="font-semibold text-xl  hover:text-blue-600"
        >
          Home
        </Link>
        <Link
          to="/about"
          className="font-semibold text-xl  hover:text-blue-600"
        >
          About Us
        </Link>

        {/* Dropdown Features */}
        <div
          className="relative"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <button className="font-semibold text-xl  hover:text-blue-600 flex items-center gap-1">
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
              <Link
                to="/booking"
                className="block px-4 py-2 text-lg font-semibold hover:bg-[#EFF6FF] hover:text-blue-600"
              >
                Booking
              </Link>
              <Link
                to="/pricing"
                className="block px-4 py-2 text-lg font-semibold hover:bg-[#EFF6FF] hover:text-blue-600"
              >
                Pricing
              </Link>
              <Link
                to="/faq"
                className="block px-4 py-2 text-lg font-semibold hover:bg-[#EFF6FF] hover:text-blue-600"
              >
                FAQ
              </Link>
            </div>
          )}
        </div>

        <Link
          to="/news"
          className="font-semibold text-xl  hover:text-blue-600"
        >
          News
        </Link>
        <Link
          to="/contact"
          className="font-semibold text-xl  hover:text-blue-600"
        >
          Contact Us
        </Link>
      </nav>

      <button
        className="hidden md:block bg-blue-600 text-white px-8 py-2 rounded-[10px] hover:bg-blue-700 transition ml-auto"
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
          <Link
            to="/"
            className="font-medium hover:text-blue-600 py-2 w-full text-center"
            onClick={() => setOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/about"
            className="font-medium hover:text-blue-600 py-2 w-full text-center"
            onClick={() => setOpen(false)}
          >
            About
          </Link>

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
                <Link
                  to="/booking"
                  className="py-2 text-xl hover:bg-[#EFF6FF]"
                  onClick={() => setOpen(false)}
                >
                  Booking
                </Link>
                <Link
                  to="/pricing"
                  className="py-2 text-xl hover:bg-[#EFF6FF]"
                  onClick={() => setOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  to="/faq"
                  className="py-2 text-xl hover:bg-[#EFF6FF]"
                  onClick={() => setOpen(false)}
                >
                  FAQ
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/news"
            className="font-medium hover:text-blue-600 py-2 w-full text-center"
            onClick={() => setOpen(false)}
          >
            News
          </Link>
          <Link
            to="/contact"
            className="font-medium hover:text-blue-600 py-2 w-full text-center"
            onClick={() => setOpen(false)}
          >
            Contact Us
          </Link>
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
