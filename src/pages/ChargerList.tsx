import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ChargingStationCard from "@components/Ui/ChargingStationCard";
import Pagination from "@components/Ui/Pagination";

const chargers = Array.from({ length: 16 }, (_, i) => ({
  id: `C${String(i + 1).padStart(3, '0')}`,
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
  remainingTime: i % 3 === 0 ? "00:25:34" : "",
}));

const getStationName = (stationId: string) => {
  const names: Record<string, string> = {
    "1": "EV Station Vincom",
    "2": "EV Station Diamond Plaza",
    "3": "EV Station Saigon Centre",
  };
  return names[stationId] || "EV Charging Station";
};

const ChargerList: React.FC = () => {
  const navigate = useNavigate();
  const { stationId } = useParams<{ stationId: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 8;
  const totalPages = Math.ceil(chargers.length / itemsPerPage);

  // Calculate which chargers to show on current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentChargers = chargers.slice(startIndex, endIndex);

  const handleBookNow = (chargerId: string) => {
    navigate(`/booking/station/${stationId}/charger/${chargerId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-8">
        {/* Header with back button */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/booking")}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-4 ms-5 text-sm font-medium"
          >
            <ArrowLeft size={15} />
            <span>Back to Stations</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 ms-5 mb-1">
            {getStationName(stationId || "")}
          </h1>
          <p className="text-gray-600 text-md ms-5">Select a charger to view available time slots</p>
        </div>

        <section className="w-full">
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {currentChargers.map((charger) => (
                <ChargingStationCard
                  key={charger.id}
                  {...charger}
                  onBookNow={() => handleBookNow(charger.id)}
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
      </div>
    </div>
  );
};

export default ChargerList;

