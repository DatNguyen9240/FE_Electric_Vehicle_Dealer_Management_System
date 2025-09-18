import React, { useState } from "react";
import ChargingStationCard from "@components/Ui/ChargingStationCard";
import BookingModal from "@components/Sections/Booking/Modal/BookingModal";
import { Link } from "react-router-dom";

const stations = [
  {
    id: 1,
    status: "Charging",
    statusColor: "text-red-500",
    bookUrl: "#",
    img: "/station/01.png",
  },
  {
    id: 2,
    status: "Available",
    statusColor: "text-green-600",
    bookUrl: "#",
    img: "/station/01.png",
  },
  {
    id: 3,
    status: "Out of Service",
    statusColor: "text-yellow-500",
    bookUrl: "#",
    img: "/station/01.png",
  },
  {
    id: 4,
    status: "Available",
    statusColor: "text-green-600",
    bookUrl: "#",
    img: "/station/01.png",
  },
];

const ChargingStationsSection: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);

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
              onBookNow={() => setOpenModal(true)}
            />
          ))}
        </div>
        <BookingModal open={openModal} onClose={() => setOpenModal(false)} />
        {/* Get all link */}
        <div className="flex justify-center mt-8">
          <Link
            to="/booking"
            className="text-blue-600 font-semibold text-lg flex items-center gap-2 hover:underline"
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
