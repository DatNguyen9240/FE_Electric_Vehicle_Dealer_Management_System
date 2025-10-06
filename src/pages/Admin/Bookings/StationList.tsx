import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ChevronRight } from "lucide-react";
import { useTitle } from "@contexts";

interface Station {
  id: string;
  name: string;
  location: string;
  totalConnectors: number;
  availableConnectors: number;
}

const mockStations: Station[] = [
  {
    id: "ST001",
    name: "Downtown Charging Hub",
    location: "123 Main Street, District 1",
    totalConnectors: 8,
    availableConnectors: 5,
  },
  {
    id: "ST002",
    name: "Airport Charging Station",
    location: "Terminal 2, International Airport",
    totalConnectors: 12,
    availableConnectors: 8,
  },
  {
    id: "ST003",
    name: "Shopping Mall EV Center",
    location: "456 Shopping Avenue, District 3",
    totalConnectors: 6,
    availableConnectors: 2,
  },
  
];

const StationList: React.FC = () => {
  const navigate = useNavigate();
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle("Stations");
  }, [setTitle]);

  const handleStationClick = (stationId: string) => {
    navigate(`/admin/bookings/station/${stationId}`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Charging Stations</h2>
        <p className="text-gray-600 mt-1">Select a station to view connectors</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-hidden">
          {mockStations.map((station, index) => (
            <div
              key={station.id}
              onClick={() => handleStationClick(station.id)}
              className={`
                flex items-center justify-between p-5 cursor-pointer
                hover:bg-blue-50 transition-colors
                ${index !== mockStations.length - 1 ? "border-b border-gray-200" : ""}
              `}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="text-blue-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {station.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{station.location}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-gray-500">
                      Total Connectors: <span className="font-medium text-gray-700">{station.totalConnectors}</span>
                    </span>
                    <span className="text-sm">
                      Available: <span className={`font-medium ${station.availableConnectors > 0 ? "text-green-600" : "text-red-600"}`}>
                        {station.availableConnectors}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="text-gray-400" size={24} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StationList;


