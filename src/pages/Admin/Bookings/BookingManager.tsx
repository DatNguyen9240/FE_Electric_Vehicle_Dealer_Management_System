import React, { useState } from "react";
import CalendarPicker from "@components/Ui/CalendarPicker";

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
  // ...các slot khác...
};

const BookingManager: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Lấy trạng thái slot cho ngày đã chọn (ở đây demo cứng)
  const getSlot = (time: string) => slotStatus[time] || { booked: 0, total: 4 };

  return (
    <div className="flex gap-8 p-8">
      {/* Time slots */}
      <div className="grid grid-cols-4 gap-4 flex-1">
        {timeSlots.map((time) => {
          const { booked, total } = getSlot(time);
          const isFull = booked >= total;
          const isSelected = selectedTime === time;
          return (
            <button
              key={time}
              disabled={isFull}
              onClick={() => setSelectedTime(time)}
              className={`
                flex flex-col items-center justify-center border rounded-xl h-16
                text-base font-semibold transition
                ${
                  isFull
                    ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                    : ""
                }
                ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow"
                    : ""
                }
                ${
                  !isFull && !isSelected
                    ? "bg-white text-blue-600 border-blue-300 hover:border-blue-500"
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
  );
};

export default BookingManager;
