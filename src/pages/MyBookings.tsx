import React, { useEffect, useRef } from "react";
import { useLocation } from 'react-router-dom';
import api from "@libs/axios";
// removed modal/close icon by request
import { useUi } from "../contexts/uiContextCore";
import { useTitle } from "@contexts";

type Booking = {
  id?: string;
  _id?: string;
  reference?: string;
  station?: { name?: string } | null;
  connector?: { code?: string } | null;
  stationName?: string;
  chargerName?: string;
  connectorName?: string;
  slotStart?: string | null;
  slotEnd?: string | null;
  status?: string;
  vehicle?: { make?: string; model?: string; licensePlate?: string } | null;
  isPaid?: boolean;
  paymentMethod?: string | null;
  checkInDeadline?: string | null;
  createdAt?: string;
};

const MyBookings: React.FC = () => {
  const [list, setList] = React.useState<Booking[]>([]);
  const [highlightedBooking, setHighlightedBooking] = React.useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const [loading, setLoading] = React.useState(true);
  // selection and details removed — actions are disabled

  const { showToast, confirm } = useUi();
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle("My Bookings");
  }, [setTitle]);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/bookings/me`);
      const bookings = res.data?.bookings ?? res.data?.data ?? [];
      if (Array.isArray(bookings)) setList(bookings);
      else setList([]);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch bookings", "error");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  // read highlight param from URL (e.g. /my-bookings?highlight=bookingId)
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlight = params.get('highlight');
    if (!highlight) return;
    // clear any previous highlights
    setHighlightedBooking(null);
    // wait for table to render
    setTimeout(() => {
      // scroll to row and set highlight
      const el = rowRefs.current[highlight];
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setHighlightedBooking(highlight);
      const t = setTimeout(() => setHighlightedBooking(null), 2000);
      return () => clearTimeout(t);
    }, 120);
  }, [location.search]);

  // Restore cancel action only (user requested cancel button visible)
  const cancelBooking = async (id?: string) => {
    if (!id) return showToast("Missing booking id", "error");
    const ok = await confirm("Cancel this booking?");
    if (!ok) return;
    try {
      await api.post(`/bookings/${id}/cancel`);
      showToast("Booking cancelled", "success");
      fetch();
    } catch (err) {
      console.error(err);
      showToast("Failed to cancel booking", "error");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Bookings</h1>
        <button onClick={fetch} className="px-3 py-1 border rounded">Refresh</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500 animate-pulse">Loading bookings...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Station</th>
                  <th className="p-3 text-left">Connector</th>
                  <th className="p-3 text-left">Slot</th>
                  <th className="p-3 text-left">Vehicle</th>
                  <th className="p-3 text-left">Plate</th>
                  <th className="p-3 text-left">Payment</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                  {/* Actions column removed */}
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                      <td colSpan={7} className="text-center py-6 text-gray-500">No bookings found.</td>
                  </tr>
                ) : (
                  list.map((b, i) => (
                    <tr
                      key={b.id ?? b._id ?? i}
                      ref={(el) => { if (b.id || b._id) rowRefs.current[b.id ?? b._id ?? String(i)] = el; }}
                      className={`border-t hover:bg-gray-50 transition ${
                        highlightedBooking && (highlightedBooking === b.id || highlightedBooking === b._id) ? 'bg-yellow-100 animate-pulse' : ''
                      }`}
                    >
                      <td className="p-3">{b.station?.name ?? b.stationName ?? '-'}</td>
                      <td className="p-3">{b.connector?.code ?? b.connectorName ?? b.chargerName ?? '-'}</td>
                      <td className="p-3">{b.slotStart ? `${new Date(b.slotStart).toLocaleString()} - ${new Date(b.slotEnd ?? b.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '-'}</td>
                      <td className="p-3">{b.vehicle ? `${b.vehicle.make ?? ''} ${b.vehicle.model ?? ''}`.trim() : '-'}</td>
                      <td className="p-3">{b.vehicle?.licensePlate ?? '-'}</td>
                      <td className="p-3">{b.isPaid ? <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Paid</span> : <span className="px-2 py-1 rounded-full text-xs bg-yellow-50 text-yellow-700">Unpaid</span>}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${b.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          {b.status}
                        </span>
                        {b.checkInDeadline && (
                          <div className="text-xs text-gray-500 mt-1">Check-in: {new Date(b.checkInDeadline).toLocaleString()}</div>
                        )}
                      </td>
                      <td className="p-3">
                        {b.status === 'RESERVED' ? (
                          <button className="px-3 py-1 border rounded text-xs" onClick={() => cancelBooking(b.id)}>Cancel</button>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Details modal removed - actions are intentionally omitted */}
    </div>
  );
};

export default MyBookings;
