import { UserBookingManager } from "@components/Sections/Booking";
import React from "react";
import { useNavigate } from "react-router-dom";

const BookingSlots: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      
      <UserBookingManager />
      
        {/* Back button at bottom */}
        <div className="flex justify-end mb-20 me-30">
        <button 
          onClick={() => navigate("/booking")}
          className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
            Back to Charging Stations
          </button>
        </div>
    </div>
  );
};

export default BookingSlots;
