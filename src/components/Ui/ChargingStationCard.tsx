import React from "react";

interface ChargingStationCardProps {
  id: string | number;
  status: string;
  statusColor: string;
  img: string;
  bookUrl?: string;
  onBookNow?: () => void;
}

const ChargingStationCard: React.FC<ChargingStationCardProps> = ({
  id,
  status,
  img,
  onBookNow,
}) => (
  <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow pt-6 flex flex-col items-center">
    <img
      src={img}
      alt={`Charger ${id}`}
      className="w-[250px] h-[300px] object-contain mb-4"
    />
    <div className="text-center w-full">
      <div className="font-medium text-lg mb-2">Charger #{id}</div>
      <div className="font-semibold text-base mb-2 flex items-center justify-center gap-2">
        <span className="text-gray-600">Status:</span>
        {status === 'ONLINE' ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-semibold bg-green-50 text-green-700">
            ONLINE
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-semibold bg-red-50 text-red-700">
            OFFLINE
          </span>
        )}
      </div>
      
      <button
        type="button"
        onClick={onBookNow}
        className="w-full bg-[#E5F4FF] text-[#2465EA] font-semibold py-3 px-4  hover:bg-[#2465EA] hover:text-white transition-colors"
      >
        Book now
      </button>
    </div>
  </div>
);

export default ChargingStationCard;
