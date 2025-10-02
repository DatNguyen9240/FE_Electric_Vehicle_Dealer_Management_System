import React from "react";

interface ChargingStationCardProps {
  id: number;
  status: string;
  statusColor: string;
  img: string;
  bookUrl?: string;
  remainingTime?: string;
  onBookNow?: () => void;
}

const ChargingStationCard: React.FC<ChargingStationCardProps> = ({
  id,
  status,
  statusColor,
  img,
  remainingTime,
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
      <div className="font-semibold text-base mb-2">
        Status: <span className={statusColor}>{status}</span>
      </div>
      <div className="font-semibold text-base mb-4">
        Remaining Time: <span className="text-gray-600">{remainingTime}</span>
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
