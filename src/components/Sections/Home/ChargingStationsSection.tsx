import React, { useState } from "react";
import ChargingStationCard from "@components/Ui/ChargingStationCard";
import { Link, useNavigate } from "react-router-dom";

const stations = [
  {
    id: 1,
    status: "Charging",
    statusColor: "text-red-500",
    bookUrl: "#",
    img: "/station/01.png",
    remainingTime: "00:25:34",
  },
  {
    id: 2,
    status: "Available",
    statusColor: "text-green-600",
    bookUrl: "#",
    img: "/station/01.png",
    remainingTime: "00:25:34",
  },
  {
    id: 3,
    status: "Out of Service",
    statusColor: "text-yellow-500",
    bookUrl: "#",
    img: "/station/01.png",
    remainingTime: "00:25:34",
  },
  {
    id: 4,
    status: "Available",
    statusColor: "text-green-600",
    bookUrl: "#",
    img: "/station/01.png",
    remainingTime: "00:25:34",
  },
];

const ChargingStationsSection: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const totalPages = 5;

  const handleBookNow = () => {
    navigate("/booking-slots");
  };

  return (
    <section className="w-full bg-white">
      <div>
        {/* Title & subtitle */}
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-2 text-center">
            Active Charging Stations
          </h2>
          <p className="text-gray-600 text-base md:text-lg text-center">
            Monitor real-time status of your EV chargers and slots availability.
          </p>
        </div>
        {/* Cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 flex-1">
          {stations.map((station) => (
            <ChargingStationCard
              key={station.id}
              {...station}
              onBookNow={handleBookNow}
            />
          ))}
        </div>
        
        {/* Pagination */}
        <div className="flex justify-end pe-20 mt-8 gap-4">
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  currentPage === page
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <Link
            to="/booking"
            className="text-blue-600 font-semibold text-lg flex items-center gap-2 hover:underline ml-4"
          >
            Get all
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ChargingStationsSection;
