import React from "react";

interface ChargingStationCardProps {
  id: number;
  status: string;
  statusColor: string;
  bookUrl: string;
  img: string;
}

const ChargingStationCard: React.FC<ChargingStationCardProps> = ({
  id,
  status,
  statusColor,
  bookUrl,
  img,
}) => (
  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col items-center">
    <img
      src={img}
      alt={`Charger ${id}`}
      className="w-[220px] h-[320px] object-contain mb-4"
    />
    <div className="text-center">
      <div className="font-medium text-lg mb-1">Charger #{id}</div>
      <div className="font-semibold text-base mb-2">
        Status: <span className={statusColor}>{status}</span>
      </div>
      <a
        href={bookUrl}
        className="text-blue-600 font-semibold hover:underline flex items-center justify-center gap-1"
      >
        Book now
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <path
            d="M5 12h14M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </div>
  </div>
);

export default ChargingStationCard;
