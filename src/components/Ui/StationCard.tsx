import React from "react";

interface StationCardProps {
  name: string;
  status: string;
  lat?: number;
  lng?: number;
  address: string;
  onBookNow?: () => void;
  // onViewDetails removed — details button intentionally omitted from station cards
  onShowMap?: () => void;
}

const StationCard: React.FC<StationCardProps> = ({
  name,
  status,
  lat,
  lng,
  address,
  onBookNow,
  onShowMap,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow border border-gray-100 overflow-hidden flex flex-col w-full max-w-xl mx-auto">
      {/* Header image with status badge */}
      <div className="relative w-full h-64 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
        <img
          src="/station/01.png"
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/station/01.png";
          }}
        />
        <span
          className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-semibold shadow ${
            status === "ONLINE"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {status === "ONLINE" ? "Online" : "Offline"}
        </span>
      </div>
      {/* Info */}
      <div className="p-8 flex-1 flex flex-col">
        <h3 className="text-2xl font-bold text-gray-900 mb-3 truncate">{name}</h3>
        {/* <div className="flex items-center gap-2 mb-6"> */}
          {/* <svg
            className="w-6 h-6 text-blue-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 12.414a4 4 0 10-5.657 5.657l4.243 4.243a8 8 0 0011.314-11.314l-4.243 4.243z"
            />
          </svg> */}
          {/* <span className="text-base text-gray-600">{address}</span> */}
        {/* </div> */}
        <div className="flex flex-wrap gap-4 mt-auto">
          <button
            onClick={onBookNow}
            className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors text-base shadow"
          >
            Book Now
          </button>
          {/* Removed Details button as per UI update request; keep Book Now and Show Map */}
          <button
            onClick={() => {
              // If consumer provided an onShowMap callback, call it. Otherwise open Google Maps.
              if (onShowMap) return onShowMap();
              // prefer coordinates if available
              if (typeof lat === "number" && typeof lng === "number") {
                const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${lat},${lng}`
                )}`;
                window.open(url, "_blank");
                return;
              }
              // fallback to address search
              if (address) {
                const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
                window.open(url, "_blank");
                return;
              }
            }}
            className="flex-1 min-w-[120px] border border-green-600 text-green-600 hover:bg-green-50 font-semibold py-3 px-6 rounded-lg transition-colors text-base shadow"
          >
            Show Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default StationCard;

