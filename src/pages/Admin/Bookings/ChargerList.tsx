import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AdminChargerCard, Pagination } from "@components/Ui";
import { useTitle } from "@contexts";

const initialChargers = Array.from({ length: 16 }, (_, i) => ({
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
  remainingTime: "",
  isPowerOn: i % 4 !== 3, // Some chargers are off by default
}));



const ChargerList: React.FC = () => {
  const navigate = useNavigate();
  const { stationId } = useParams<{ stationId: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [chargers, setChargers] = useState(initialChargers);
  const { setTitle } = useTitle();
  
  const itemsPerPage = 8;
  const totalPages = Math.ceil(chargers.length / itemsPerPage);

  useEffect(() => {
    setTitle("Chargers");
  }, [setTitle]);

  // Calculate which chargers to show on current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentChargers = chargers.slice(startIndex, endIndex);

  const handleBookNow = (chargerId: string) => {
    navigate(`/admin/bookings/station/${stationId}/charger/${chargerId}`);
  };

  const handleTogglePower = (chargerId: string | number, isOn: boolean) => {
    setChargers(prevChargers => 
      prevChargers.map(charger => 
        charger.id === chargerId 
          ? { ...charger, isPowerOn: isOn }
          : charger
      )
    );
    console.log(`Charger ${chargerId} power ${isOn ? 'ON' : 'OFF'}`);
    // TODO: Call API to toggle charger power
  };

  return (
    <div className="p-6">
      {/* Header with back button */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/bookings")}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm ms-5 mb-4"
        >
          <ArrowLeft size={15} />
          <span className="font-medium">Back to Stations</span>
        </button>
        
      </div>

      <section className="w-full">
        <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                {currentChargers.map((charger) => (
                  <AdminChargerCard
                    key={charger.id}
                    {...charger}
                    onClick={() => handleBookNow(charger.id)}
                    onTogglePower={handleTogglePower}
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
  );
};

export default ChargerList;


