import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { CalendarPicker } from "@components/Ui";
import "react-day-picker/dist/style.css";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
}

const carModels = ["Vinfast VF9", "Vinfast VF8", "Hyundai Ioniq 5", "Kia EV6"];
const times = [
  { time: "5:30 PM", disabled: true },
  { time: "6:30 PM", disabled: true },
  { time: "7:30 PM", disabled: false },
  { time: "8:30 PM", disabled: false },
  { time: "9:30 PM", disabled: false },
];

type FormValues = {
  name: string;
  email: string;
  phone: string;
  carModel: string;
};

const BookingModal: React.FC<BookingModalProps> = ({ open, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTime, setSelectedTime] = useState("9:30 PM");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      carModel: carModels[0],
    },
  });

  if (!open) return null;

  const onSubmit = (data: FormValues) => {
    console.log({ ...data, date: selectedDate, time: selectedTime });
    alert("Booking submitted! Check console for details.");
    onClose();
    reset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-2">
      <div className="bg-white rounded-2xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden relative overflow-y-auto max-h-[95vh]">
        {/* Close button */}
        <button
          className="absolute top-2 right-4 md:top-4 md:right-6 text-red-500 text-xl font-bold z-10"
          onClick={onClose}
        >
          ×
        </button>
        {/* Left: Info */}
        <div className="md:w-1/3 w-full flex flex-col items-center py-8 px-4 md:py-10 md:px-6 border-b md:border-b-0 md:border-r">
          <img
            src="/logo/01.png"
            alt="Logo"
            className="mb-6 md:mb-8 object-contain"
          />
          <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Contact Name
              </label>
              <input
                type="text"
                className="w-full border-b border-gray-300 outline-none py-1 text-sm"
                placeholder="|"
                {...register("name", { required: "Contact name is required" })}
              />
              {errors.name && (
                <span className="text-xs text-red-500">
                  {errors.name.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Email</label>
              <input
                type="email"
                className="w-full border-b border-gray-300 outline-none py-1 text-sm"
                placeholder="abc@gmail.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <span className="text-xs text-red-500">
                  {errors.email.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full border-b border-gray-300 outline-none py-1 text-sm"
                placeholder="+0123456789"
                {...register("phone", { required: "Phone number is required" })}
              />
              {errors.phone && (
                <span className="text-xs text-red-500">
                  {errors.phone.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Car Model
              </label>
              <select
                className="w-full border-b border-gray-300 outline-none py-1 text-sm bg-white"
                {...register("carModel", { required: true })}
              >
                {carModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
            {/* Ẩn nút submit ở đây, chuyển xuống dưới */}
          </form>
        </div>
        {/* Right: Calendar & Time */}
        <div className="md:w-2/3 w-full flex flex-col items-center justify-center py-8 px-4 md:py-10 md:px-6 bg-white">
          <div className="w-full flex flex-col items-center">
            <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 text-center">
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
                <div className="mb-2 font-semibold text-gray-700 text-base text-center">
                  {selectedDate
                    ? selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Please select a date"}
                </div>
                <div className="flex flex-col gap-2 md:gap-3 w-full max-w-xs">
                  {times.map((t) => (
                    <button
                      key={t.time}
                      type="button"
                      disabled={t.disabled}
                      onClick={() => setSelectedTime(t.time)}
                      className={`w-full py-3 rounded-lg border text-base font-semibold transition
                        ${
                          t.disabled
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : t.time === selectedTime
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
                        }`}
                    >
                      {t.time}
                    </button>
                  ))}
                </div>
                <form
                  className="flex flex-col md:flex-row gap-2 md:gap-4 mt-6 w-full max-w-xs"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <button
                    type="button"
                    className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold"
                    onClick={() => {
                      onClose();
                      reset();
                    }}
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold"
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
