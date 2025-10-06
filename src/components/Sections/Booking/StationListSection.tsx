import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StationCard from "@components/Ui/StationCard";
import Pagination from "@components/Ui/Pagination";

const stations = [
  {
    id: 1,
    name: "EV Station Vincom",
    rating: 4.5,
    distance: "2.5km",
    address: "72 Le Thanh Ton, District 1, HCMC",
    pricePerKwh: "5,000đ/kWh",
    pricePerMin: "1,000đ/min",
    image: "/station/01.png",
    connectors: [
      { type: "CCS2", power: "60kW", status: "available" as const },
      { type: "CHAdeMO", power: "50kW", status: "in-use" as const },
      { type: "AC", power: "22kW", status: "booked" as const },
    ],
    operatingHours: "Unlimited",
    availableSlots: 8,
    totalSlots: 12,
  },
  {
    id: 2,
    name: "EV Station Diamond Plaza",
    rating: 4.7,
    distance: "1.8km",
    address: "34 Le Duan, District 1, HCMC",
    pricePerKwh: "4,500đ/kWh",
    pricePerMin: "900đ/min",
    image: "/station/01.png",
    connectors: [
      { type: "CCS2", power: "120kW", status: "available" as const },
      { type: "CHAdeMO", power: "50kW", status: "available" as const },
      { type: "AC", power: "22kW", status: "in-use" as const },
    ],
    operatingHours: "06:00 - 22:00",
    availableSlots: 10,
    totalSlots: 15,
  },
  {
    id: 3,
    name: "EV Station Saigon Centre",
    rating: 4.3,
    distance: "3.2km",
    address: "65 Le Loi, District 1, HCMC",
    pricePerKwh: "5,500đ/kWh",
    pricePerMin: "1,200đ/min",
    image: "/station/01.png",
    connectors: [
      { type: "CCS2", power: "150kW", status: "available" as const },
      { type: "CHAdeMO", power: "50kW", status: "booked" as const },
      { type: "Type 2", power: "43kW", status: "available" as const },
    ],
    operatingHours: "24/7",
    availableSlots: 6,
    totalSlots: 10,
  },
];

const StationListSection: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const itemsPerPage = 6;
  const totalPages = Math.ceil(stations.length / itemsPerPage);

  // Calculate which stations to show on current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStations = stations.slice(startIndex, endIndex);

  const handleBookNow = (stationId: number) => {
    navigate(`/booking/station/${stationId}`);
  };

  const handleViewDetails = (stationId: number) => {
    navigate(`/station/${stationId}`);
  };

  return (
    <section className="w-full py-12 bg-white">
      <div>
        <h2 className="text-2xl md:text-4xl font-bold mb-8 text-center">
          Charging Station List
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentStations.map((station) => (
            <StationCard
              key={station.id}
              {...station}
              onBookNow={() => handleBookNow(station.id)}
              onViewDetails={() => handleViewDetails(station.id)}
            />
          ))}
        </div>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </section>
  );
};

export default StationListSection;
