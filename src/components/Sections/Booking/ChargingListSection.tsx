import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChargingStationCard from "@components/Ui/ChargingStationCard";
import Pagination from "@components/Ui/Pagination";
import BookingModal from "@components/Sections/Booking/Modal/BookingModal";

const stations = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  status:
    i % 3 === 0 ? "Charging" : i % 3 === 1 ? "Available" : "Out of Service",
  statusColor:
    i % 3 === 0
      ? "text-red-500"
      : i % 3 === 1
      ? "text-green-600"
      : "text-yellow-500",
  bookUrl: "#",
  img: "/station/01.png",
  remainingTime: i % 3 === 0 ? "45 min" : i % 3 === 1 ? "Available" : "N/A",
}));

const ChargingListSection: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const itemsPerPage = 8;
  const totalPages = Math.ceil(stations.length / itemsPerPage);

  // Calculate which stations to show on current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStations = stations.slice(startIndex, endIndex);

  const handleBookNow = () => {
    navigate("/booking-slots");
  };

  return (
    <section className="w-full py-12 bg-white">
      <div>
        <h2 className="text-2xl md:text-4xl font-bold mb-8 text-center">
          Charging Station List
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {currentStations.map((station) => (
            <ChargingStationCard
              key={station.id}
              {...station}
              onBookNow={handleBookNow}
            />
          ))}
        </div>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
        <BookingModal open={openModal} onClose={() => setOpenModal(false)} />
      </div>
    </section>
  );
};

export default ChargingListSection;
