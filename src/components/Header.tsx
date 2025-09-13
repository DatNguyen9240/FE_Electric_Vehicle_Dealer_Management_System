import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);
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
      <nav className="hidden md:flex gap-12 absolute left-1/2 -translate-x-1/2">
        <a
          href="#"
          className="font-semibold text-sm xl:text-base 2xl:text-lg hover:text-blue-600"
        >
          Home
        </a>
        <a
          href="#"
          className="font-semibold text-sm xl:text-base 2xl:text-lg hover:text-blue-600"
        >
          Features
        </a>
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
        {/* Hamburger icon with thicker lines for clarity */}
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
          <a
            href="#"
            className="font-medium hover:text-blue-600 py-2 w-full text-center"
            onClick={() => setOpen(false)}
          >
            Features
          </a>
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
