import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BookingForm, {
  type BookingFormRef,
  type FormValues, // Thêm dòng này
} from "@components/Sections/Booking/Modal/BookingForm";

// Type definition for connector
interface Connector {
  id: number;
  name: string;
  type: string;
  power: string;
  status: string;
  remainingTime: string;
}

// Mock data cho 2 connectors của charger
const getChargerConnectors = (chargerId: string): Connector[] => {
  // Mock data - trong thực tế sẽ fetch từ API dựa vào chargerId
  const connectorsData: Record<string, Connector[]> = {
    C001: [
      {
        id: 1,
        name: "Connector 1",
        type: "CCS2",
        power: "150kW",
        status: "Available",
        remainingTime: "",
      },
      {
        id: 2,
        name: "Connector 2",
        type: "CHAdeMO",
        power: "100kW",
        status: "Charging",
        remainingTime: "00:45:23",
      },
    ],
    C007: [
      {
        id: 1,
        name: "Connector 1",
        type: "Type 2",
        power: "22kW",
        status: "Available",
        remainingTime: "",
      },
      {
        id: 2,
        name: "Connector 2",
        type: "CCS2",
        power: "150kW",
        status: "Available",
        remainingTime: "",
      },
    ],
    // Default for other chargers
    default: [
      {
        id: 1,
        name: "Connector 1",
        type: "CCS2",
        power: "150kW",
        status: "Available",
        remainingTime: "",
      },
      {
        id: 2,
        name: "Connector 2",
        type: "Type 2",
        power: "43kW",
        status: "Charging",
        remainingTime: "01:15:30",
      },
    ],
  };

  return connectorsData[chargerId] || connectorsData["default"];
};

const UserBookingDetails: React.FC = () => {
  const navigate = useNavigate();
  const { stationId, chargerId, timeSlot } = useParams<{
    stationId: string;
    chargerId: string;
    timeSlot: string;
  }>();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const selectedTimeSlot = timeSlot || "07:00"; // Get from URL params
  const [selectedConnector, setSelectedConnector] = useState<number | null>(
    null
  );
  const bookingFormRef = useRef<BookingFormRef>(null);

  const connectors = getChargerConnectors(chargerId || "");

  const handleReset = () => {
    setSelectedDate(new Date());
    setSelectedConnector(null);
  };

  const handleFormSubmit = (data: FormValues) => {
    const selectedConnectorData = connectors.find(
      (c: Connector) => c.id === selectedConnector
    );
    console.log({
      ...data,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      stationId,
      chargerId,
      connectorId: selectedConnector,
      connectorType: selectedConnectorData?.type,
      connectorPower: selectedConnectorData?.power,
    });
    alert("Booking submitted successfully! Check console for details.");
    navigate(`/booking/station/${stationId}/charger/${chargerId}`);
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
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* Left: Connector Selection */}
            <div className="lg:w-2/3 w-full border-r">
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
                  {connectors.map((connector: Connector) => {
                    const isAvailable = connector.status === "Available";
                    const isSelected = selectedConnector === connector.id;

                      return (
                        <div
                          key={connector.id}
                          onClick={() => {
                            if (isAvailable) {
                              setSelectedConnector(
                                isSelected ? null : connector.id
                              );
                            }
                          }}
                        className={`
                          relative border-2 rounded-xl p-6 transition-all
                          ${
                            !isAvailable
                              ? "opacity-50 cursor-not-allowed bg-gray-50"
                              : "cursor-pointer hover:shadow-md"
                          }
                          ${
                            isSelected
                              ? "border-blue-600 bg-blue-50 shadow-lg"
                              : "border-gray-200 hover:border-blue-300"
                          }
                        `}
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
                        {!isAvailable && (
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
                              !isAvailable
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
                                !isAvailable
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
                          <div className="space-y-1">
                            <p
                              className={`text-sm ${
                                !isAvailable ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              Type:{" "}
                              <span
                                className={`font-semibold ${
                                  !isAvailable
                                    ? "text-gray-500"
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
                                  isAvailable
                                    ? "bg-green-100 text-green-700"
                                    : connector.status === "Charging"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {connector.status}
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
                  })}
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
                          All connectors are currently in use. Please try
                          another time slot or charger.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

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
                    navigate(
                      `/booking/station/${stationId}/charger/${chargerId}`
                    );
                    bookingFormRef.current?.resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  onClick={() => {
                    if (selectedConnector) {
                      bookingFormRef.current?.submitForm();
                    } else {
                      alert("Please select a connector first.");
                    }
                  }}
                  disabled={!selectedConnector}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default UserBookingDetails;
