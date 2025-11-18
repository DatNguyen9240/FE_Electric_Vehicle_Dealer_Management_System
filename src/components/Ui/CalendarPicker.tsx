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
  <DayPicker
    mode="single"
    selected={selectedDate}
    onSelect={onSelect}
    className="rounded-lg"
    modifiersClassNames={{
      selected: "custom-selected-day",
    }}
    // Disable days before today (allow selection of today and future)
    disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
  />
);

export default CalendarPicker;
