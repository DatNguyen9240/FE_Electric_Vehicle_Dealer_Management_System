import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
// Booking form removed from right column per request
import api from "@libs/axios";
import axios from "axios";
import { toast } from "react-toastify";

// Type definition for connector
interface Connector {
  id: string;
  name: string;
  type: string;
  power: string;
  status: string;
  remainingTime: string;
  chargerName?: string; // Thêm
  stationName?: string; // Thêm
}

// Raw shape returned by backend for a connector
interface RawConnector {
  _id: string;
  code?: string;
  type?: string;
  connectorType?: string;
  powerKw?: number;
  power?: string;
  status?: string;
}

const UserBookingDetails: React.FC = () => {
  const navigate = useNavigate();
  const { stationId, chargerId, timeSlot } = useParams<{
    stationId: string;
    chargerId: string;
    timeSlot: string;
  }>();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const selectedTimeSlot = timeSlot || "07:00"; // Get from URL params
  const [selectedConnector, setSelectedConnector] = useState<string | null>(
    null
  );
  

  const [connectors, setConnectors] = useState<Connector[]>([]);
  // Previously we tracked blocked connectors from available-slots; now we allow selecting any connector
  const [loadingConnectors, setLoadingConnectors] = useState(false);
  const [connectorsError, setConnectorsError] = useState<string | null>(null);
  useEffect(() => {
    async function loadAvailableConnectors() {
      if (!stationId || !chargerId || !selectedTimeSlot || !selectedDate) return;
      setLoadingConnectors(true);
      setConnectorsError(null);
      try {
        // Parse startTime từ timeSlot + date
        const [hourStr, minuteStr] = selectedTimeSlot.split(":");
        const startDate = new Date(selectedDate);
        startDate.setHours(Number(hourStr), Number(minuteStr), 0, 0);
        // Cộng 7 tiếng cho timezone
        startDate.setHours(startDate.getHours() + 7);
        const startTime = startDate.toISOString();

        // Gọi API available-by-time với params
        const res = await api.get(`/stations/available-by-time`, {
          params: {
            startTime,
            durationMinutes: 30, // Mặc định 30 phút
            stationId,
            stationStatus: 'ONLINE', // Chỉ ONLINE stations
            chargerId, // Lọc đúng trụ
            // connectorType: 'CCS', // Có thể thêm nếu biết từ vehicle, tạm bỏ
          },
        });

        const availableConnectors = res.data?.availableConnectors ?? [];
        
        // Map thành format Connector
        const mapped: Connector[] = availableConnectors.map((c: any) => ({
          id: c.id,
          name: c.code ?? `Connector ${c.id}`,
          type: c.type ?? "-",
          power: c.powerKw ? `${c.powerKw}kW` : "-",
          status: c.isAvailable ? "Available" : "Reserved", // Dựa trên isAvailable
          remainingTime: "",
          chargerName: c.charger?.name || "Unknown Charger",
          stationName: c.station?.name || "Unknown Station",
        }));

        setConnectors(mapped);
      } catch (err: unknown) {
        // Fallback: Load từ /chargers nếu API mới lỗi
        console.warn('Available-by-time API failed, falling back to charger connectors', err);
        try {
          const res = await api.get(`/chargers/${chargerId}`);
          const data = res.data;
          const mapped: Connector[] = (data.connectors ?? []).map((c: RawConnector) => ({
            id: c._id,
            name: c.code ?? c.type ?? `Connector ${c._id}`,
            type: c.type ?? c.connectorType ?? "-",
            power: c.powerKw ? `${c.powerKw}kW` : c.power ?? "-",
            status: "Available", // Fallback không check slot, nhưng set Available để user có thể thử book
            remainingTime: "",
            chargerName: data.name || "Unknown Charger",
            stationName: "Unknown Station", // Không có trong fallback
          }));
          setConnectors(mapped);
        } catch (fallbackErr: unknown) {
          const message = axios.isAxiosError(fallbackErr)
            ? (fallbackErr.response?.data?.msg as string) || fallbackErr.message
            : (fallbackErr as Error)?.message || "Lỗi tải connector";
          setConnectorsError(message);
          toast.error(message);
        }
      } finally {
        setLoadingConnectors(false);
      }
    }
    loadAvailableConnectors();
  }, [stationId, chargerId, selectedTimeSlot, selectedDate]);

  // read date from query param passed from slots page
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      // parse as local date: YYYY-MM-DD
      const parsed = new Date(dateParam + "T00:00:00");
      setSelectedDate(parsed);
    }
  }, [searchParams]);

  // helper to reset selection
  const clearSelection = () => {
    setSelectedDate(new Date());
    setSelectedConnector(null);
  };

  const [booking, setBooking] = useState(false);

  // Block logic removed — allow selection and attempt to book any connector.

  const bookConnector = async () => {
    if (!selectedConnector) {
      toast.error("Please select a connector first.");
      return;
    }

    // Removed block guard: allow booking attempt — server will enforce availability and return an error if required.

    // build slotStart from selectedDate + selectedTimeSlot (HH:mm)
    try {
      const [hourStr, minuteStr] = (selectedTimeSlot || "07:00").split(":");
      const slotDate = new Date(selectedDate);
      slotDate.setHours(Number(hourStr || 0), Number(minuteStr || 0), 0, 0);
      // Cộng 7 tiếng cho timezone
      slotDate.setHours(slotDate.getHours() + 7);
      const slotStart = slotDate.toISOString();

      setBooking(true);
      const payload = { connectorId: selectedConnector, slotStart };
  await api.post("/bookings", payload);
  toast.success("Booking successful!");
      // optionally redirect back to charger page
      navigate(`/booking/station/${stationId}/charger/${chargerId}`);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.msg as string) || err.message
        : (err as Error)?.message || "Booking failed";
      console.error(err);
      toast.error(message);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-12 pt-10 pb-20">
        {/* Header with back button */}
        <div className="mb-6">
          <button
            onClick={() =>
              navigate(`/booking/station/${stationId}/charger/${chargerId}`)
            }
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-4 ms-5 text-sm font-medium"
          >
            <ArrowLeft size={15} />
            <span>Back to Time Slots</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 ms-5 mb-2">
            Book Charging Slot
          </h1>
          <p className="text-gray-600 text-md ms-5">
            Selected Time: {selectedTimeSlot} | Date:{" "}
            {selectedDate.toLocaleDateString()}
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="flex flex-col min-h-[600px]">
            {/* Connector Selection (full width) */}
            <div className="w-full">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-800">
                  Select Connector
                </h3>
                <p className="text-gray-600 text-sm">
                  Choose an available connector for charging
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {loadingConnectors ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={`skeleton-${i}`} className="animate-pulse border-2 rounded-xl p-6 bg-gray-50 h-40" />
                    ))
                  ) : connectorsError ? (
                    <div className="col-span-1 md:col-span-2 text-center text-red-600 py-6">{connectorsError}</div>
                  ) : connectors.length === 0 ? (
                    <div className="col-span-1 md:col-span-2 text-center text-gray-500 py-6">No connectors found for this charger.</div>
                  ) : (
                    connectors.map((connector: Connector) => {
                      const isAvailable = connector.status === "Available";
                      // Block tracking removed — any connector can be selected
                      const isBlocked = connector.status === "Reserved"; // Disable nếu Reserved
                      const isSelected = selectedConnector === connector.id;

                      return (
                        <div
                          key={connector.id}
                          onClick={() => {
                            if (isBlocked) return; // Không cho chọn nếu Reserved
                            // Always allow selecting a connector to view details; do not show any toast or message.
                            setSelectedConnector(isSelected ? null : connector.id);
                          }}
                          className={`relative border-2 rounded-xl p-6 transition-all ${
                             !isAvailable ? "opacity-80 bg-gray-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md"
                          } ${isSelected ? "border-blue-600 bg-blue-50 shadow-lg" : "border-gray-200 hover:border-blue-300"}`}
                        >
                        {/* Selected Badge or Disabled Badge */}
                        {isSelected && isAvailable && (
                          <div className="absolute top-4 right-4">
                            <div className="bg-blue-600 text-white rounded-full p-1">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                        {/* Booked indicator removed — connectors are selectable regardless of blocked state. */}
                        {!isBlocked && !isAvailable && (
                          <div className="absolute top-4 right-4">
                            <div className="bg-gray-400 text-white rounded-full p-1">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M6 18L18 6M6 6l12 12"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </div>
                        )}

                        {/* Connector Icon */}
                        <div className="flex items-center justify-center mb-4">
                          <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center ${
                              !isAvailable || isBlocked
                                ? "bg-gray-300"
                                  : isSelected
                                  ? "bg-blue-600"
                                  : "bg-gray-100"
                            }`}
                          >
                            <svg
                              width="32"
                              height="32"
                              viewBox="0 0 24 24"
                              fill="none"
                              className={
                                !isAvailable || isBlocked
                                  ? "text-gray-500"
                                  : isSelected
                                  ? "text-white"
                                  : "text-gray-600"
                              }
                            >
                              <path
                                d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M12 11v6m-3-3h6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        </div>

                        {/* Connector Info */}
                        <div className="text-center">
                          <h4 className="text-xl font-bold text-gray-900 mb-2">
                            {connector.name}
                          </h4>
                          <p className="text-sm text-gray-600">Charger: {connector.chargerName}</p>
                          <div className="space-y-1">
                            <p
                              className={`text-sm ${
                                !isAvailable ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              Type:{" "}
                              <span
                                className={`font-semibold ${
                                  isAvailable && !isBlocked
                                    ? "bg-green-100 text-green-700"
                                    : "text-gray-900"
                                }`}
                              >
                                {connector.type}
                              </span>
                            </p>
                            <p
                              className={`text-sm ${
                                !isAvailable ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              Power:{" "}
                              <span
                                className={`font-semibold ${
                                  !isAvailable
                                    ? "text-gray-500"
                                    : "text-gray-900"
                                }`}
                              >
                                {connector.power}
                              </span>
                            </p>
                            <div className="mt-3">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                  isAvailable && !isBlocked
                                    ? "bg-green-100 text-green-700"
                                    : connector.status === "Charging"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {isBlocked ? "Booked" : connector.status}
                              </span>
                            </div>
                            {connector.remainingTime && (
                              <p className="text-xs text-gray-500 mt-2">
                                Remaining: {connector.remainingTime}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Clear selection
                    </button>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                      onClick={bookConnector}
                      disabled={!selectedConnector || booking}
                    >
                      {booking ? "Booking..." : "Book selected connector"}
                    </button>
                  </div>
                </div>

                {/* Warning message if no available connectors */}
                {connectors.every(
                  (c: Connector) => c.status !== "Available"
                ) && (
                  <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-yellow-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          No available connectors
                        </h3>
                        <p className="text-sm text-yellow-700 mt-1">
                          All connectors are currently reserved for this slot. Please try
                          another time slot or charger.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBookingDetails;
