import React, { useState, useEffect, useRef } from "react";
import {  ChargingStationCardPopup } from "@components/Ui";
import BookingForm, { type BookingFormRef } from "./BookingForm";
import "react-day-picker/dist/style.css";

interface UserTimeSlotBookingModalProps {
  open: boolean;
  onClose: () => void;
  selectedTimeSlot?: string;
  selectedDate?: Date;
  onTimeSlotChange?: (timeSlot: string) => void;
}

// Định nghĩa kiểu dữ liệu cho form ở đầu file:
interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  vehicleId?: string;
  // Thêm các trường khác nếu cần
}

// Mock data cho charging stations
const chargingStations = [
  {
    id: 1,
    name: "Tesla Supercharger - Downtown",
    location: "123 Main St, Downtown",
    status: "Available",
    statusColor: "text-green-600",
    img: "/station/01.png",
    connectors: 2,
    power: "150kW",
    connector1: { status: "Available", remainingTime: "" },
    connector2: { status: "Charging", remainingTime: " " },
  },
  {
    id: 2,
    name: "EVGo Station - Mall",
    location: "456 Shopping Ave, Mall District",
    status: "Charging",
    statusColor: "text-red-500",
    img: "/station/01.png",
    connectors: 2,
    power: "100kW",
    connector1: { status: "Charging", remainingTime: " " },
    connector2: { status: "Charging", remainingTime: "" },
  },
  {
    id: 3,
    name: "ChargePoint - Airport",
    location: "789 Airport Blvd, Terminal 2",
    status: "Available",
    statusColor: "text-green-600",
    img: "/station/01.png",
    connectors: 2,
    power: "75kW",
    connector1: { status: "Available", remainingTime: "" },
    connector2: { status: "Charging", remainingTime: "" },
  },
];



const UserTimeSlotBookingModal: React.FC<UserTimeSlotBookingModalProps> = ({
  open,
  onClose,
  selectedTimeSlot,
  selectedDate: initialDate,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDate || new Date()
  );
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  const bookingFormRef = useRef<BookingFormRef>(null);

  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [open]);

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

  const modalRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleReset = () => {
    setSelectedDate(initialDate || new Date());
    setSelectedStation(null);
  };

  const handleFormSubmit = (data: BookingFormData) => {
    console.log({
      ...data,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      stationId: selectedStation,
    });
    alert("Booking submitted successfully! Check console for details.");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-2"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-6xl flex flex-col overflow-hidden relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-6 text-red-500 text-2xl font-bold z-10 hover:text-red-700"
          onClick={onClose}
        >
          ×
        </button>

        <div className="bg-white px-6 py-4 border-b ms-5">
          <h2 className="text-xl font-bold text-gray-800">
            Book Charging Slot
          </h2>
          <p className="text-gray-600 text-sm">
            Selected Time: {selectedTimeSlot} | Date:{" "}
            {selectedDate?.toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row min-h-[500px]">
          {/* Left: Station Selection */}
          <ChargingStationCardPopup
            stations={chargingStations}
            selectedStation={selectedStation}
            onStationSelect={setSelectedStation}
          />

          {/* Right: Booking Form */}
          <div className="lg:w-1/3 w-full flex flex-col">
            <div className="p-6 border-b flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-800">
                Booking Details
              </h3>
              <p className="text-gray-600 text-sm">
                Fill in your information to complete the booking
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <BookingForm
                ref={bookingFormRef}
                onSubmit={handleFormSubmit}
                onReset={handleReset}
              />
            </div>
            <div className="p-6 border-t flex gap-3">
              <button
                type="button"
                className="flex-1 py-2 px-4 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
                onClick={() => {
                  onClose();
                  bookingFormRef.current?.resetForm();
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                onClick={() => {
                  if (selectedStation) {
                    bookingFormRef.current?.submitForm();
                  } else {
                    alert("Please select a charging station first.");
                  }
                }}
                disabled={!selectedStation}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTimeSlotBookingModal;
