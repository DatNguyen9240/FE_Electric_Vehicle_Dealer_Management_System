import React, { useState, useEffect } from "react";
import CalendarPicker from "@components/Ui/CalendarPicker";
import UserTimeSlotBookingModal from "@components/Sections/Booking/Modal/UserTimeSlotBookingModal";
import { useTitle } from "@contexts";

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

type SlotStatus = { booked: number; total: number };

const slotStatus: Record<string, SlotStatus> = {
  "07:00": { booked: 1, total: 4 },
  "07:30": { booked: 4, total: 4 },
  "08:00": { booked: 0, total: 4 },
  "08:30": { booked: 1, total: 4 },
  "09:00": { booked: 3, total: 4 },
  "09:30": { booked: 4, total: 4 },
  "10:00": { booked: 1, total: 4 },
  "10:30": { booked: 2, total: 4 },
  "11:00": { booked: 2, total: 4 },
  "11:30": { booked: 0, total: 4 },
  "12:00": { booked: 1, total: 4 },
  "12:30": { booked: 3, total: 4 },
  "13:00": { booked: 2, total: 4 },
  "13:30": { booked: 1, total: 4 },
  "14:00": { booked: 0, total: 4 },
  "14:30": { booked: 2, total: 4 },
  "15:00": { booked: 3, total: 4 },
  "15:30": { booked: 1, total: 4 },
  "16:00": { booked: 0, total: 4 },
  "16:30": { booked: 2, total: 4 },
  "17:00": { booked: 4, total: 4 },
  "17:30": { booked: 3, total: 4 },
  "18:00": { booked: 1, total: 4 },
  "18:30": { booked: 2, total: 4 },
  "19:00": { booked: 0, total: 4 },
  "19:30": { booked: 1, total: 4 },
  "20:00": { booked: 3, total: 4 },
  "20:30": { booked: 2, total: 4 },
  "21:00": { booked: 1, total: 4 },
  "21:30": { booked: 0, total: 4 },
  "22:00": { booked: 2, total: 4 },
  "22:30": { booked: 1, total: 4 },
  "23:00": { booked: 3, total: 4 },
  "23:30": { booked: 2, total: 4 },
};

const UserBookingManager: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTimeSlot, setModalTimeSlot] = useState<string>("");
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle("Book Charging Slot");
  }, [setTitle]);

  const getSlot = (time: string) => slotStatus[time] || { booked: 0, total: 4 };

  const handleTimeSlotClick = (time: string) => {
    const { booked, total } = getSlot(time);
    if (booked < total) {
      setModalTimeSlot(time);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalTimeSlot("");
  };

  const handleTimeSlotChange = (newTimeSlot: string) => {
    setModalTimeSlot(newTimeSlot);
    setSelectedTime(newTimeSlot);
  };

  return (
    <>
      <div className="my-10 mx-15">
        <div className="mb-8 ms-5">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Charging Slot</h1>
          <p className="text-gray-600">Select a date and time slot for your charging session</p>
        </div>
        
        <div className="flex gap-12">
          <div className="grid grid-cols-4 gap-4 flex-1">
            {timeSlots.map((time) => {
              const { booked, total } = getSlot(time);
              const isFull = booked >= total;
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  onClick={() => {
                    setSelectedTime(time);
                    handleTimeSlotClick(time);
                  }}
                  disabled={isFull}
                  className={`
                    flex flex-col items-center justify-center border rounded-xl h-16
                    text-base font-semibold transition cursor-pointer
                    ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow"
                        : ""
                    }
                    ${
                      !isSelected && !isFull
                        ? "bg-white text-blue-600 border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                        : ""
                    }
                    ${
                      isFull
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : ""
                    }
                  `}
                >
                  <span>{time}</span>
                  <span
                    className={`text-xs mt-1 ${
                      isFull
                        ? "text-red-500"
                        : booked === 0
                        ? "text-blue-400"
                        : "text-green-500"
                    }`}
                  >
                    {booked}/{total}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Calendar */}
          <div>
            <CalendarPicker
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
            />
          </div>
        </div>
      </div>

      <UserTimeSlotBookingModal
        open={isModalOpen}
        onClose={handleCloseModal}
        selectedTimeSlot={modalTimeSlot}
        selectedDate={selectedDate}
        onTimeSlotChange={handleTimeSlotChange}
      />
    </>
  );
};

export default UserBookingManager;
