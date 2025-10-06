import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import StationCard from "@components/Ui/StationCard";

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

const ActiveStationsSection: React.FC = () => {
  const navigate = useNavigate();

  const handleBookNow = (stationId: number) => {
    navigate(`/booking/${stationId}`);
  };

  const handleViewDetails = (stationId: number) => {
    navigate(`/station/${stationId}`);
  };

  const handleViewAll = () => {
    navigate("/stations");
  };

  return (
    <section className="w-full py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">
              Active Charging Stations
            </h2>
          </div>
          <button
            onClick={handleViewAll}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            View All
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Station Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map((station) => (
            <StationCard
              key={station.id}
              {...station}
              onBookNow={() => handleBookNow(station.id)}
              onViewDetails={() => handleViewDetails(station.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActiveStationsSection;

