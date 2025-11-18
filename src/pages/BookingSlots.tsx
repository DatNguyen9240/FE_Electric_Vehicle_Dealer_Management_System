import { UserBookingManager } from "@components/Sections/Booking";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const BookingSlots: React.FC = () => {
  const navigate = useNavigate();
  const { stationId, chargerId } = useParams<{ stationId: string; chargerId: string }>();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1500px] mx-auto px-4 md:px-12 py-8">
        {/* Header with back button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/booking/station/${stationId}`)}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-4 ms-5 text-sm font-medium"
          >
            <ArrowLeft size={15} />
            <span>Back to Chargers</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 ms-5 mb-2">
            Select Time Slot
          </h1>
          <p className="text-gray-600 text-md ms-5">
            Choose your preferred charging time
          </p>
        </div>

        <UserBookingManager />
      </div>
    </div>
  );
};

export default BookingSlots;
