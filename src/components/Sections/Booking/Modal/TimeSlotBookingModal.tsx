import React, { useState, useEffect, useRef } from "react";
import { CalendarPicker, ChargingStationCard } from "@components/Ui";
import BookingForm, { type BookingFormRef } from "./BookingForm";
import "react-day-picker/dist/style.css";

interface TimeSlotBookingModalProps {
  open: boolean;
  onClose: () => void;
  selectedTimeSlot?: string;
  selectedDate?: Date;
  onTimeSlotChange?: (timeSlot: string) => void;
}

// Mock data cho charging stations
const chargingStations = [
  {
    id: 1,
    status: "Charging",
    statusColor: "text-green-500",
    img: "/station/01.png",
  },
  {
    id: 2,
    status: "Available",
    statusColor: "text-blue-500",
    img: "/station/01.png",
  },
  {
    id: 3,
    status: "Charging",
    statusColor: "text-green-500",
    img: "/station/01.png",
  },
  {
    id: 4,
    status: "Available",
    statusColor: "text-blue-500",
    img: "/station/01.png",
  },
];

const timeSlots = [
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
  "22:30",
  "23:00",
  "23:30",
];

const TimeSlotBookingModal: React.FC<TimeSlotBookingModalProps> = ({
  open,
  onClose,
  selectedTimeSlot,
  selectedDate: initialDate,
  onTimeSlotChange,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDate || new Date()
  );
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
  };

  const getCurrentTimeIndex = () => {
    return timeSlots.findIndex((time) => time === selectedTimeSlot);
  };

  const handlePreviousTime = () => {
    const currentIndex = getCurrentTimeIndex();
    if (currentIndex > 0) {
      const previousTime = timeSlots[currentIndex - 1];
      onTimeSlotChange?.(previousTime);
    }
  };

  const handleNextTime = () => {
    const currentIndex = getCurrentTimeIndex();
    if (currentIndex < timeSlots.length - 1) {
      const nextTime = timeSlots[currentIndex + 1];
      onTimeSlotChange?.(nextTime);
    }
  };

  const canGoPrevious = getCurrentTimeIndex() > 0;
  const canGoNext = getCurrentTimeIndex() < timeSlots.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-7xl flex flex-col overflow-hidden relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-6 text-red-500 text-2xl font-bold z-10 hover:text-red-700"
          onClick={onClose}
        >
          ×
        </button>

        <div className="bg-white px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Admin - Booking Management
          </h2>
        </div>

        <div className="flex flex-col xl:flex-row min-h-[600px] max-h-[600px]">
          <div className="xl:w-2/3 w-full flex flex-col border-r overflow-hidden">
            <div className="p-6 border-b flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-800">
                Charging Stations & Booking Forms
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <div className="space-y-6">
                {chargingStations.map((station) => (
                  <div
                    key={station.id}
                    className="border rounded-xl p-4 bg-white shadow-sm"
                  >
                    {/* Station Card */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0">
                        <ChargingStationCard
                          id={station.id}
                          status={station.status}
                          statusColor={station.statusColor}
                          img={station.img}
                          onBookNow={() => {}}
                        />
                      </div>

                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-3">
                          Charger #{station.id} Booking Details
                        </h4>
                        <BookingForm
                          ref={station.id === 1 ? bookingFormRef : undefined}
                          onSubmit={(data) => {
                            const bookingData = {
                              ...data,
                              date: selectedDate,
                              timeSlot: selectedTimeSlot,
                              chargerId: station.id,
                            };
                            console.log(
                              `Booking for Charger #${station.id}:`,
                              bookingData
                            );
                            alert(
                              `Booking for Charger #${station.id} submitted!`
                            );
                          }}
                          onReset={handleReset}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="xl:w-1/3 w-full flex flex-col bg-gray-50 overflow-hidden">
            <div className="flex flex-col items-center justify-center flex-1 p-6">
              <div className="text-center mb-4 text-gray-600">
                {selectedDate
                  ? selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Please select a date"}
              </div>

              <CalendarPicker
                selectedDate={selectedDate}
                onSelect={setSelectedDate}
              />

              <h3 className="text-lg font-semibold mt-4 text-gray-800">
                Time Slot: {selectedTimeSlot}
              </h3>

              <div className="flex gap-3 mt-8 w-full max-w-sm">
                <button
                  type="button"
                  disabled={!canGoPrevious}
                  className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                    canGoPrevious
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={handlePreviousTime}
                >
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M15 18l-6-6 6-6v12z" />
                  </svg>
                  Previous
                </button>

                <button
                  type="button"
                  disabled={!canGoNext}
                  className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                    canGoNext
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={handleNextTime}
                >
                  Next
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 18l6-6-6-6v12z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotBookingModal;
