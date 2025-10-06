import React, { useState } from "react";


interface ChargingSession {
  _id: string; 
  userId: string; 
  stationId: string; 
  connectorId: string; 
  stationName?: string; 
  location?: string; 
  slotStart: string; 
  slotEnd: string; 
  checkInDeadline: string; 
  duration?: string; 
  energyUsed?: number; 
  cost?: number; 
  status: "RESERVED" | "completed" | "cancelled" | "in-progress" | "CHECKED_IN" | "EXPIRED"; 
  createdAt: string; 
  updatedAt: string; 
}

const ChargingHistory: React.FC = () => {
  // const { user } = useSelector((state: RootState) => state.auth);
  const [filter, setFilter] = useState<"all" | "RESERVED" | "completed" | "cancelled" | "in-progress" | "CHECKED_IN" | "EXPIRED">("all");

  // Mock data - replace with actual API call
  const chargingSessions: ChargingSession[] = [
    {
      _id: "1",
      userId: "user123",
      stationId: "station001",
      connectorId: "connector001",
      stationName: "Tesla Supercharger - Downtown",
      location: "123 Main St, Downtown",
      slotStart: "2024-01-15T10:30:00Z",
      slotEnd: "2024-01-15T11:45:00Z",
      checkInDeadline: "2024-01-15T10:45:00Z",
      duration: "1h 15m",
      energyUsed: 45.2,
      cost: 12.50,
      status: "completed",
      createdAt: "2024-01-15T09:00:00Z",
      updatedAt: "2024-01-15T11:45:00Z"
    },
    {
      _id: "2",
      userId: "user123",
      stationId: "station002",
      connectorId: "connector002",
      stationName: "EVGo Station - Mall",
      location: "456 Shopping Ave, Mall District",
      slotStart: "2024-01-14T14:15:00Z",
      slotEnd: "2024-01-14T15:30:00Z",
      checkInDeadline: "2024-01-14T14:30:00Z",
      duration: "1h 15m",
      energyUsed: 38.7,
      cost: 10.25,
      status: "completed",
      createdAt: "2024-01-14T13:00:00Z",
      updatedAt: "2024-01-14T15:30:00Z"
    },
    {
      _id: "3",
      userId: "user123",
      stationId: "station003",
      connectorId: "connector003",
      stationName: "ChargePoint - Airport",
      location: "789 Airport Blvd, Terminal 2",
      slotStart: "2024-01-13T08:00:00Z",
      slotEnd: "2024-01-13T08:45:00Z",
      checkInDeadline: "2024-01-13T08:15:00Z",
      duration: "45m",
      energyUsed: 25.1,
      cost: 6.75,
      status: "RESERVED",
      createdAt: "2024-01-13T07:30:00Z",
      updatedAt: "2024-01-13T07:30:00Z"
    }
  ];

  const filteredSessions = chargingSessions.filter(session => 
    filter === "all" || session.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "RESERVED":
        return "bg-yellow-100 text-yellow-800";
      case "CHECKED_IN":
        return "bg-purple-100 text-purple-800";
      case "EXPIRED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
      <div className=" p-10 mb-10">
        <div className=" px-5 ">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Charging History</h1>
          
          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Sessions
            </button>
            <button
              onClick={() => setFilter("RESERVED")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === "RESERVED"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Reserved
            </button>
            <button
              onClick={() => setFilter("CHECKED_IN")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === "CHECKED_IN"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Checked In
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === "completed"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter("cancelled")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === "cancelled"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Cancelled
            </button>
            <button
              onClick={() => setFilter("EXPIRED")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === "EXPIRED"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Expired
            </button>
          </div>

          {/* Sessions list */}
          <div className="space-y-4">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No charging sessions found</h3>
                <p className="">No sessions match your current filter.</p>
              </div>
            ) : (
              filteredSessions.map((session) => (
                <div key={session._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{session.stationName || `Station ${session.stationId}`}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{session.location || `Station ID: ${session.stationId}`}</p>
                       <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                         <div>
                           <span className="">Slot Start:</span>
                           <p className="text-gray-500">{new Date(session.slotStart).toLocaleString()}</p>
                         </div>
                         <div>
                           <span className="">Slot End:</span>
                           <p className="text-gray-500">{new Date(session.slotEnd).toLocaleString()}</p>
                         </div>
                         <div>
                           <span className="">Check-in Deadline:</span>
                           <p className="text-gray-500">{new Date(session.checkInDeadline).toLocaleString()}</p>
                         </div>
                         <div>
                           <span className="">Duration:</span>
                           <p className="text-gray-500">{session.duration || 'N/A'}</p>
                         </div>
                         {session.energyUsed && (
                           <div>
                             <span className="">Energy Used:</span>
                             <p className="text-gray-500">{session.energyUsed} kWh</p>
                           </div>
                         )}
                       </div>
                     
                    </div>
                    {session.cost && (
                      <div className="mt-4 md:mt-0 md:ml-6 text-right">
                        <p className="text-sm text-center pe-5">Total Cost</p>
                        <div className="text-2xl font-bold text-green-600 text-center pe-5">${session.cost.toFixed(2)}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
  );
};

export default ChargingHistory;
