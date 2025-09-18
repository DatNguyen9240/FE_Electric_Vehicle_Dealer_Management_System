import React, { useState } from "react";
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
}));

const ChargingListSection: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <section className="w-full py-12 bg-white">
      <div>
        <h2 className="text-2xl md:text-4xl font-bold mb-8 text-center">
          Charging Station List
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {stations.map((station) => (
            <ChargingStationCard
              key={station.id}
              {...station}
              onBookNow={() => setOpenModal(true)}
            />
          ))}
        </div>
        <Pagination />
        <BookingModal open={openModal} onClose={() => setOpenModal(false)} />
      </div>
    </section>
  );
};

export default ChargingListSection;
