import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import api from "../libs/axios";


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
  // server returns statuses in UPPERCASE; mirror that here
  // server shape: billing, booking, station, chargingPredictions
  billing?: { totalAmount?: number; breakdown?: { energyKwh?: number } };
  chargingPredictions?: { energyChargedKwh?: number };
  chargeDurationMinutes?: number;
  totalChargingMinutes?: number;
  id?: string;
  booking?: { id?: string; _id?: string } | null;
  bookingId?: string;
  status: "RESERVED" | "COMPLETED" | "CANCELLED" | "IN_PROGRESS" | "CHECKED_IN" | "EXPIRED";
  station?: { id?: string; name?: string; code?: string };
  createdAt: string; 
  updatedAt: string; 
}

const ChargingHistory: React.FC = () => {
  // const { user } = useSelector((state: RootState) => state.auth);
  // UI status filter that maps to server `status` param (includes `all` to clear filter)
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");

  const [chargingSessions, setChargingSessions] = useState<ChargingSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  // removed duplicate `filter` state — use `statusFilter` everywhere

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { page, limit };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const res = await api.get("/sessions", { params });
      const body = res.data || {};
      setChargingSessions(body.items || []);
      setTotalPages(body.pagination?.pages || 0);
    } catch (err: unknown) {
      setError(typeof err === 'string' ? err : (err as any)?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [page, searchQuery, statusFilter, fromDate, toDate]);
  // End effect

  const filteredSessions = chargingSessions; // already filtered server side

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "IN_PROGRESS":
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

    const formatStatus = (status: string) => {
      if (!status) return '';
      // to lower, replace underscores with spaces, then title case
      const s = status.toLowerCase().split('_').join(' ');
      return s.replace(/\b\w/g, (ch) => ch.toUpperCase());
    };

  return (
      <div className=" p-10 mb-10">
        <div className=" px-5 ">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Charging History</h1>
          
          {/* Filter controls */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search (booking id, session id, station)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="date"
                value={fromDate ?? ''}
                onChange={(e) => setFromDate(e.target.value || null)}
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="date"
                value={toDate ?? ''}
                onChange={(e) => setToDate(e.target.value || null)}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex-1 flex justify-end">
              <div className="flex gap-2">
                <button
                  onClick={() => { setStatusFilter('all'); setPage(1); setSearchQuery(''); setFromDate(null); setToDate(null); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    statusFilter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  All Sessions
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => { setStatusFilter("all"); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                statusFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Sessions
            </button>
            <button
              onClick={() => { setStatusFilter("RESERVED"); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                statusFilter === "RESERVED"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Reserved
            </button>
            <button
              onClick={() => { setStatusFilter("CHECKED_IN"); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                statusFilter === "CHECKED_IN"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Checked In
            </button>
            <button
              onClick={() => { setStatusFilter("COMPLETED"); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                statusFilter === "COMPLETED"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => { setStatusFilter("CANCELLED"); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                statusFilter === "CANCELLED"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Cancelled
            </button>
            <button
              onClick={() => { setStatusFilter("EXPIRED"); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                statusFilter === "EXPIRED"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Expired
            </button>
          </div>

          {/* Sessions list */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">{error}</div>
            ) : filteredSessions.length === 0 ? (
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
                          <h3 className="text-lg font-semibold text-gray-900">{session.station?.name || `Station ${session.stationId}`}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                          {formatStatus(session.status)}
                        </span>
                        <Link
                          to={`/sessions/view/${session.id || session._id}`}
                          className="inline-block ml-3 text-sm text-blue-600 hover:underline"
                        >
                          View details
                        </Link>
                      </div>
                      <p className="text-gray-600 mb-2">{session.station?.code || `Station ID: ${session.stationId}`} · <span className="text-gray-500">Booking: {(() => {
                        const bid = session.booking?.id || session.bookingId;
                        if (!bid) return '—';
                        return (
                          <Link to={`/my-bookings?highlight=${encodeURIComponent(bid)}`} className="text-blue-600 hover:underline">{bid}</Link>
                        );
                      })()}</span></p>
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
                           <span className="">Duration (min):</span>
                           <p className="text-gray-500">{session.chargeDurationMinutes || session.totalChargingMinutes || 'N/A'}</p>
                         </div>
                         {(session.billing?.breakdown?.energyKwh || session.chargingPredictions?.energyChargedKwh) && (
                           <div>
                             <span className="">Energy Used:</span>
                             <p className="text-gray-500">{session.billing?.breakdown?.energyKwh ?? session.chargingPredictions?.energyChargedKwh} kWh</p>
                           </div>
                         )}
                       </div>
                     
                    </div>
                    { (session.billing?.totalAmount || session.cost) && (
                      <div className="mt-4 md:mt-0 md:ml-6 text-right">
                        <p className="text-sm text-center pe-5">Total Cost</p>
                        <div className="text-2xl font-bold text-green-600 text-center pe-5">${Number(session.billing?.totalAmount ?? session.cost ?? 0).toFixed(2)}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border bg-white"
              >
                Prev
              </button>
              <span className="px-3 py-1">Page {page} / {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded border bg-white"
              >
                Next
              </button>
            </div>
          )}
          </div>
        </div>
  );
};

export default ChargingHistory;
