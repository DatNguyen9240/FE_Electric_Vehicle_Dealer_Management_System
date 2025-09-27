import React, { useState, useEffect, useRef } from "react";
import { CalendarPicker } from "@components/Ui";
import BookingForm, {
  type FormValues,
  type BookingFormRef,
} from "@components/Sections/Booking/Modal/BookingForm";
import "react-day-picker/dist/style.css";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
}

const times = [
  { time: "5:30 PM", disabled: true },
  { time: "6:30 PM", disabled: true },
  { time: "7:30 PM", disabled: false },
  { time: "8:30 PM", disabled: false },
  { time: "9:30 PM", disabled: false },
];

const BookingModal: React.FC<BookingModalProps> = ({ open, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTime, setSelectedTime] = useState("9:30 PM");
  const bookingFormRef = useRef<BookingFormRef>(null);

  // Khóa scroll khi mở modal
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

  // Để bắt sự kiện click ngoài modal
  const modalRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleFormSubmit = (data: FormValues) => {
    console.log({ ...data, date: selectedDate, time: selectedTime });
    alert("Booking submitted! Check console for details.");
    onClose();
  };

  const handleFormReset = () => {
    setSelectedDate(new Date());
    setSelectedTime("9:30 PM");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden relative overflow-y-auto max-h-[95vh]"
        onClick={(e) => e.stopPropagation()} // Ngăn nổi bọt khi click vào modal
      >
        {/* Close button */}
        <button
          className="absolute top-2 right-4 md:top-4 md:right-6 text-red-500 text-xl font-bold z-10"
          onClick={onClose}
        >
          ×
        </button>
        {/* Left: Info */}

        <div className="md:w-1/3 w-full">
          <BookingForm
            ref={bookingFormRef}
            onSubmit={handleFormSubmit}
            onReset={handleFormReset}
          />
        </div>
        {/* Right: Calendar & Time */}
        <div className="md:w-2/3 w-full flex flex-col items-center justify-center py-8 px-4 md:py-10 md:px-7 bg-white">
          <div className="w-full flex flex-col items-center">
            <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 text-center ">
              Please specify the time to commence using the service.
            </h2>
            <div className="flex flex-col md:flex-row w-full gap-4 md:gap-8">
              {/* Calendar */}
              <div className="flex flex-col items-center mb-4 md:mb-0">
                <CalendarPicker
                  selectedDate={selectedDate}
                  onSelect={setSelectedDate}
                />
              </div>
              {/* Time slots */}
              <div className="flex flex-col items-center flex-1">
                <div className="mb-3 font-semibold text-gray-700 text-base text-center">
                  {selectedDate
                    ? selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Please select a date"}
                </div>
                <div className="flex flex-col gap-2 md:gap-3 w-40 mx-auto">
                  {times.map((t) => (
                    <button
                      key={t.time}
                      type="button"
                      disabled={t.disabled}
                      onClick={() => setSelectedTime(t.time)}
                      className={`w-full py-2 rounded-lg border text-base font-semibold transition
                        ${
                          t.disabled
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : t.time === selectedTime
                            ? "bg-[#2465EA] text-white border-blue-600"
                            : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
                        }`}
                    >
                      {t.time}
                    </button>
                  ))}
                </div>
                <form

                  className="flex flex-col md:flex-row gap-2 md:gap-4 mt-6 w-full max-w-xs"
                  onSubmit={(e) => {
                    e.preventDefault();
                    // Form submission will be handled by BookingForm component
                  }}
                >
                  <button
                    type="button"
                    className="flex-1 py-1 rounded-lg bg-gray-100 text-gray-700 font-semibold"
                    onClick={() => {
                      onClose();
                      bookingFormRef.current?.resetForm();
                    }}
                  >
                    Clear
                  </button>
                  <button
<<<<<<< HEAD
                    type="submit"
                    className="flex-1 py-1 rounded-lg bg-[#2465EA] text-white font-semibold"
=======

                    type="button"
                    className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold"
                    onClick={() => {
                      bookingFormRef.current?.submitForm();
                    }}
>>>>>>> develop
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
