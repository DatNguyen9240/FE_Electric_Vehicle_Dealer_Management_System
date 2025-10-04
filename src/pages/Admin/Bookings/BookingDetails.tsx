import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BookingForm, {
  type BookingFormRef,
} from "@components/Sections/Booking/Modal/BookingForm";
import { useTitle } from "@contexts";

// Type definition for connector
interface Connector {
  id: number;
  name: string;
  type: string;
  power: string;
  status: string;
  remainingTime: string;
  booking?: {
    customerName: string;
    phone: string;
    email: string;
    carModel: string;
    bookedAt: string;
  };
}

// Mock data cho 2 connectors của charger
const getChargerConnectors = (chargerId: string): Connector[] => {
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
        booking: {
          customerName: "Nguyen Van A",
          phone: "0901234567",
          email: "nguyenvana@gmail.com",
          carModel: "Tesla Model 3",
          bookedAt: "2025-10-04 07:30",
        },
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
        booking: {
          customerName: "Tran Thi B",
          phone: "0912345678",
          email: "tranthib@gmail.com",
          carModel: "VinFast VF8",
          bookedAt: "2025-10-04 06:45",
        },
      },
    ],
  };

  return connectorsData[chargerId] || connectorsData["default"];
};

const BookingDetails: React.FC = () => {
  const navigate = useNavigate();
  const { stationId, chargerId, timeSlot } = useParams<{
    stationId: string;
    chargerId: string;
    timeSlot: string;
  }>();
  const [selectedDate] = useState<Date>(new Date());
  const selectedTimeSlot = timeSlot || "07:00";
  const bookingFormRef1 = useRef<BookingFormRef>(null);
  const bookingFormRef2 = useRef<BookingFormRef>(null);
  const [editingConnectorId, setEditingConnectorId] = useState<number | null>(null);
  const { setTitle } = useTitle();

  const connectors = getChargerConnectors(chargerId || "");

  useEffect(() => {
    setTitle("Booking Details");
  }, [setTitle]);

  const handleFormSubmit = (connectorId: number) => (data: any) => {
    const selectedConnectorData = connectors.find((c) => c.id === connectorId);
    console.log({
      ...data,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      stationId,
      chargerId,
      connectorId,
      connectorType: selectedConnectorData?.type,
      connectorPower: selectedConnectorData?.power,
    });
    alert(`Booking for Connector ${connectorId} submitted successfully!`);
  };

  const handleReset = (connectorId: number) => () => {
    if (connectorId === 1) {
      bookingFormRef1.current?.resetForm();
    } else {
      bookingFormRef2.current?.resetForm();
    }
  };

  const handleCancelBooking = (connector: Connector) => () => {
    if (confirm(`Cancel booking for ${connector.booking?.customerName}?`)) {
      alert(`Booking for ${connector.name} has been cancelled.`);
      // TODO: Implement actual cancel logic
    }
  };

  const handleEditBooking = (connector: Connector) => () => {
    setEditingConnectorId(connector.id);
  };

  const handleSaveBooking = (connectorId: number) => () => {
    // Get form ref
    const formRef = connectorId === 1 ? bookingFormRef1 : bookingFormRef2;
    formRef.current?.submitForm();
  };

  const handleCancelEdit = (connectorId: number) => () => {
    setEditingConnectorId(null);
    // Reset form to original values
    const formRef = connectorId === 1 ? bookingFormRef1 : bookingFormRef2;
    formRef.current?.resetForm();
  };

  const handleFormSubmitBooked = (connectorId: number) => (data: any) => {
    const connector = connectors.find((c) => c.id === connectorId);
    console.log("Updated booking data:", {
      ...data,
      connectorId,
      originalBooking: connector?.booking,
    });
    alert(`Booking updated successfully for ${connector?.name}!`);
    setEditingConnectorId(null);
    // TODO: Call API to update booking
  };

  return (
    <div className="px-6 py-6">
      {/* Header with back button */}
      <div className="mb-6">
        <button
          onClick={() =>
            navigate(`/admin/bookings/station/${stationId}/charger/${chargerId}`)
          }
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm ms-5 mb-4"
        >
          <ArrowLeft size={15} />
          <span className="font-medium">Back to Time Slots</span>
        </button>
        
        <p className="text-gray-600 mt-1 text-sm ms-5">
          Selected Time: {selectedTimeSlot} | Date:{" "}
          {selectedDate.toLocaleDateString()}
        </p>
      </div>

      {/* Main Content - Stack Layout */}
      <div className="space-y-6">
        {connectors.map((connector, index) => {
          const isAvailable = connector.status === "Available";
          const bookingFormRef = index === 0 ? bookingFormRef1 : bookingFormRef2;

          return (
            <div
              key={connector.id}
              className="bg-white rounded-2xl shadow-sm border"
            >
              <div className="flex flex-col lg:flex-row min-h-[500px]">
                {/* Left: Connector Card */}
                <div className="lg:w-1/3 w-full border-r">
                  <div className="p-6  ">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {connector.name}
                    </h3>
                    
                  </div>
                  <div className="p-6">
                    <div className="relative border-2 rounded-xl p-6 border-gray-200 bg-white">
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        {isAvailable ? (
                          <div className="bg-green-100 text-green-700 rounded-full p-1">
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
                        ) : (
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
                        )}
                      </div>

                      {/* Connector Icon */}
                      <div className="flex items-center justify-center mb-4">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            isAvailable ? "bg-blue-100" : "bg-gray-300"
                          }`}
                        >
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            className={
                              isAvailable ? "text-blue-600" : "text-gray-500"
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
                          <p className="text-sm text-gray-600">
                            Type:{" "}
                            <span className="font-semibold text-gray-900">
                              {connector.type}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Power:{" "}
                            <span className="font-semibold text-gray-900">
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
                  </div>
                </div>

                {/* Right: Booking Form */}
                <div className="lg:w-2/3 w-full flex flex-col">
                  <div className="p-6 ">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Booking Details 
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {isAvailable
                        ? "Fill in customer information to complete the booking"
                        : "This connector is currently unavailable"}
                    </p>
                  </div>
                  {isAvailable ? (
                    <>
                      <div className="flex-1 overflow-y-auto">
                        <BookingForm
                          ref={bookingFormRef}
                          onSubmit={handleFormSubmit(connector.id)}
                          onReset={handleReset(connector.id)}
                        />
                      </div>
                      <div className="p-6 border-t flex gap-3">
                        <button
                          type="button"
                          className="flex-1 py-2 px-4 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
                          onClick={() => {
                            bookingFormRef.current?.resetForm();
                          }}
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          className="flex-1 py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                          onClick={() => {
                            bookingFormRef.current?.submitForm();
                          }}
                        >
                          Submit Booking
                        </button>
                      </div>
                    </>
                  ) : connector.booking ? (
                    // Show Booking Information - Simple form with pre-filled data
                    <>
                      <div className="flex-1 overflow-y-auto">
                        <div className={`p-4 border-b ${editingConnectorId === connector.id ? 'bg-orange-50' : 'bg-blue-50'}`}>
                          <p className={`text-sm ${editingConnectorId === connector.id ? 'text-orange-700' : 'text-blue-700'}`}>
                            {editingConnectorId === connector.id ? (
                              <>
                                <span className="font-semibold">✏️ Editing Mode</span> - Make changes and click Save
                              </>
                            ) : (
                              <>
                                <span className="font-semibold">Booked at:</span> {connector.booking.bookedAt}
                                {connector.remainingTime && (
                                  <> • <span className="font-semibold">Remaining:</span> {connector.remainingTime}</>
                                )}
                              </>
                            )}
                          </p>
                        </div>
                        <BookingForm
                          ref={bookingFormRef}
                          initialValues={{
                            customerName: connector.booking.customerName,
                            phone: connector.booking.phone,
                            email: connector.booking.email,
                            carModel: connector.booking.carModel,
                          }}
                          isReadOnly={editingConnectorId !== connector.id}
                          onSubmit={editingConnectorId === connector.id ? handleFormSubmitBooked(connector.id) : handleFormSubmit(connector.id)}
                          onReset={handleReset(connector.id)}
                        />
                      </div>
                      <div className="p-6 border-t flex gap-3">
                        {editingConnectorId === connector.id ? (
                          <>
                            <button
                              type="button"
                              onClick={handleCancelEdit(connector.id)}
                              className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveBooking(connector.id)}
                              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                            >
                              Save Changes
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={handleEditBooking(connector)}
                              className="flex-1 py-2 px-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
                            >
                              Edit Booking
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelBooking(connector)}
                              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                            >
                              Cancel Booking
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    // Show Unavailable Message (no booking data)
                    <div className="flex-1 flex items-center justify-center p-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-gray-400"
                          >
                            <path
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          Connector Unavailable
                        </h4>
                        <p className="text-gray-600">
                          This connector is currently {connector.status.toLowerCase()}.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      
    </div>
  );
};

export default BookingDetails;
