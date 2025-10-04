import React from "react";
import { MapPin, Star, Clock, Zap } from "lucide-react";

interface Connector {
  type: string;
  power: string;
  status: "available" | "in-use" | "booked";
}

interface StationCardProps {
  name: string;
  rating: number;
  distance: string;
  address: string;
  pricePerKwh: string;
  pricePerMin: string;
  connectors: Connector[];
  operatingHours: string;
  availableSlots: number;
  totalSlots: number;
  image?: string;
  onBookNow?: () => void;
  onViewDetails?: () => void;
}

const StationCard: React.FC<StationCardProps> = ({
  name,
  rating,
  distance,
  address,
  pricePerKwh,
  pricePerMin,
  connectors,
  operatingHours,
  availableSlots,
  totalSlots,
  image = "/station/01.png",
  onBookNow,
  onViewDetails,
}) => {
  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Available";
      case "in-use":
        return "In Use";
      case "booked":
        return "Booked";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "text-gray-600";
      case "in-use":
        return "text-gray-600";
      case "booked":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  // Count connectors by status
  const availableCount = connectors.filter(c => c.status === "available").length;
  const totalCount = connectors.length;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden">
      {/* Station Image */}
      <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/station/01.png";
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">{name}</h3>
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg flex-shrink-0">
            <MapPin size={14} className="text-gray-600" />
            <span className="text-sm text-gray-700 font-medium">{distance}</span>
          </div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star size={16} className="fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-gray-700">{rating}</span>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 mb-3">
          <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600 line-clamp-1">{address}</p>
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1">
            <Zap size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">{pricePerKwh}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">{pricePerMin}</span>
          </div>
        </div>

        {/* Connectors Section */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Power ({availableCount}/{totalCount})
            </span>
          </div>
          
          <div className="space-y-2">
            {connectors.map((connector, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-700">{connector.type} {connector.power}</span>
                <span className={`${getStatusColor(connector.status)}`}>
                  {getStatusText(connector.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Operating Hours */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
          <Clock size={14} className="text-gray-400" />
          <span>{operatingHours}: {availableSlots}/{totalSlots}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onBookNow}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
          >
            Book Now
          </button>
          <button
            onClick={onViewDetails}
            className="flex items-center justify-center gap-1 border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default StationCard;

