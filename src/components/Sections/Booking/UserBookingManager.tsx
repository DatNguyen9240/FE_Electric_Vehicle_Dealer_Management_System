import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CalendarPicker from "@components/Ui/CalendarPicker";
import { useTitle } from "@contexts";
import api from "@libs/axios";
import { useUi } from "../../../contexts/uiContextCore";

const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
  const hour = String(Math.floor(i / 2)).padStart(2, "0");
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour}:${minute}`;
});

// removed static slot type
const UserBookingManager: React.FC = () => {
  const navigate = useNavigate();
  const { stationId, chargerId } = useParams<{ stationId: string; chargerId: string }>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [availableMap, setAvailableMap] = useState<Record<string, number>>({});
  const [connectorCount, setConnectorCount] = useState<number>(0);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const { setTitle } = useTitle();
  const { showToast } = useUi();

  useEffect(() => {
    setTitle("Book Charging Slot");
  }, [setTitle]);

  // removed static slot lookup

  // API-driven slot availability
  const getApiSlot = (time: string) => {
    const available = availableMap[time] ?? 0;
    const total = connectorCount || 4;
    return { booked: Math.max(0, total - available), total };
  };

  const handleTimeSlotClick = (time: string) => {
    // Prevent selecting past time for today
    if (selectedDate) {
      const today = new Date();
      const sel = new Date(selectedDate);
      if (
        sel.getFullYear() === today.getFullYear() &&
        sel.getMonth() === today.getMonth() &&
        sel.getDate() === today.getDate()
      ) {
        const [hh, mm] = time.split(":").map((t) => parseInt(t, 10));
        const slotDate = new Date(sel);
        slotDate.setHours(hh, mm, 0, 0);
        if (slotDate <= today) {
          showToast("Cannot book past time", "error");
          return;
        }
      }
    }
    const { booked, total } = getApiSlot(time);
    if (booked < total) {
      // Pass selected date as query param (YYYY-MM-DD)
      const sel = selectedDate || new Date();
      const yyyy = sel.getFullYear();
      const mm = String(sel.getMonth() + 1).padStart(2, "0");
      const dd = String(sel.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      navigate(`/booking/station/${stationId}/charger/${chargerId}/book/${time}?date=${dateStr}`);
    }
  };

  useEffect(() => {
    const fetchSlots = async () => {
      if (!stationId || !selectedDate) return;
      setLoadingSlots(true);
      try {
        const sel = selectedDate;
        const yyyy = sel.getFullYear();
        const mm = String(sel.getMonth() + 1).padStart(2, "0");
        const dd = String(sel.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const [slotsRes, chargerRes] = await Promise.all([
          api.get(`/bookings/available-slots`, { params: { stationId, date: dateStr } }),
          api.get(`/chargers/${chargerId}`),
        ]);

        const slots = slotsRes.data?.availableSlots ?? [];
        const map: Record<string, number> = {};

        for (const s of slots) {
          try {
            const d = new Date(s.slotStart);
            const h = String(d.getHours()).padStart(2, "0");
            const m = String(d.getMinutes()).padStart(2, "0");
            const key = `${h}:${m}`;
            map[key] = (s.availableConnectors || []).length;
          } catch (e) {
            continue;
          }
        }

        setAvailableMap(map);

        const chargerData = chargerRes.data;
        const connectors = chargerData?.connectors ?? [];
        setConnectorCount(connectors.length || 0);
      } catch (err) {
        console.error('Error fetching available slots', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, stationId, chargerId]);

  return (
    <>
       
        
        <div className="flex gap-12 items-start">
          <div className="grid grid-cols-4 gap-4 flex-1">
            {(() => {
              const displayed = timeSlots.filter((time) => {
                if (!selectedDate) return true;
                const today = new Date();
                const sel = new Date(selectedDate);
                if (
                  sel.getFullYear() === today.getFullYear() &&
                  sel.getMonth() === today.getMonth() &&
                  sel.getDate() === today.getDate()
                ) {
                  const [hh, mm] = time.split(":").map((t) => parseInt(t, 10));
                  const slotDate = new Date(sel);
                  slotDate.setHours(hh, mm, 0, 0);
                  return slotDate > today; // only future times
                }
                // show all 24h for the selected day (hide only while loading slots so loading UI renders)
                if (loadingSlots) return false;
                return true;
              });
              if (loadingSlots) {
                return (
                  <div className="col-span-4 text-center p-6">Loading available slots...</div>
                );
              }

              if (displayed.length === 0) {
                return (
                  <div className="col-span-4 text-center text-gray-500 p-4">
                    No available time slots for this day.
                  </div>
                );
              }
              if (loadingSlots) {
                return (
                  <div className="col-span-4 text-center p-6">Loading available slots...</div>
                );
              }

              return displayed.map((time) => {
                const { booked, total } = getApiSlot(time);
                const usedBooked = booked;
                const usedTotal = total;
                const isFull = usedBooked >= usedTotal;
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
                          : usedBooked === 0
                          ? "text-blue-400"
                          : "text-green-500"
                      }`}
                    >
                      {usedBooked}/{usedTotal}
                    </span>
                  </button>
                );
              });
            })()}
          </div>
          {/* Calendar */}
          <div>
            <CalendarPicker
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
            />
          </div>
        </div>
    </>
  );
};

export default UserBookingManager;
