import React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface CalendarPickerProps {
  selectedDate: Date | undefined;
  onSelect: (date?: Date) => void;
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({
  selectedDate,
  onSelect,
}) => (
  <div className="bg-white rounded-lg shadow-md p-4">
    <DayPicker
      mode="single"
      selected={selectedDate}
      onSelect={onSelect}
      className="rounded-lg"
      captionLayout="dropdown"
      // prettier styling via modifier classname overrides
      modifiersClassNames={{
        selected: "bg-blue-600 text-white rounded-full",
        today: "text-blue-600 font-semibold",
        disabled: "opacity-50 pointer-events-none",
        outside: "text-gray-400",
      }}
      // display prettier month navigation with dropdown
      // Disable days before today (allow selection of today and future)
      disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
      // display one month with compact spacing
      numberOfMonths={1}
    />
  </div>
);

export default CalendarPicker;
