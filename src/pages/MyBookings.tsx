import React, { useEffect } from "react";
import api from "@libs/axios";
import { X } from "lucide-react";
import { useUi } from "../contexts/uiContextCore";
import { useTitle } from "@contexts";

type Booking = {
  id?: string;
  _id?: string;
  reference?: string;
  station?: { name?: string } | null;
  connector?: { code?: string } | null;
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
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<Booking | null>(null);

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

  const tryCheckIn = async (id?: string, paymentMethod?: string | null) => {
    if (!id) return showToast("Missing booking id", "error");
    try {
      await api.post(`/sessions/start`, { bookingId: id, paymentMethod: paymentMethod ?? "WALLET" });
      showToast("Session started", "success");
      fetch();
    } catch (err: any) {
      console.error(err);
      showToast(err?.response?.data?.msg ?? err?.message ?? "Failed to start session", "error");
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
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-gray-500">No bookings found.</td>
                  </tr>
                ) : (
                  list.map((b, i) => (
                    <tr key={b.id ?? b._id ?? i} className="border-t hover:bg-gray-50 transition">
                      <td className="p-3">{b.station?.name ?? '-'}</td>
                      <td className="p-3">{b.connector?.code ?? '-'}</td>
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
                      <td className="p-3 flex gap-2">
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs" onClick={() => setSelected(b)}>Details</button>
                        {b.status === 'RESERVED' && (
                          <>
                            <button className="px-3 py-1 border rounded text-xs" onClick={() => cancelBooking(b.id)}>Cancel</button>
                            {b.checkInDeadline && new Date(b.checkInDeadline).getTime() > Date.now() && (
                              <button className="px-3 py-1 bg-emerald-600 text-white rounded text-xs" onClick={() => tryCheckIn(b.id, b.paymentMethod)}>Check-in</button>
                            )}
                          </>
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

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[95%] max-w-2xl relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close"
              title="Close"
            >
              <X size={22} className="text-gray-600" />
            </button>
            <h3 className="text-lg font-semibold mb-4">Booking details</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <div><strong>Station:</strong> {selected.station?.name ?? '-'}</div>
              <div><strong>Connector:</strong> {selected.connector?.code ?? '-'}</div>
              <div><strong>Slot start:</strong> {selected.slotStart ? new Date(selected.slotStart).toLocaleString() : '-'}</div>
              <div><strong>Slot end:</strong> {selected.slotEnd ? new Date(selected.slotEnd).toLocaleString() : '-'}</div>
              <div><strong>Vehicle:</strong> {selected.vehicle ? `${selected.vehicle.make ?? ''} ${selected.vehicle.model ?? ''}`.trim() : '-'}</div>
              <div><strong>License plate:</strong> {selected.vehicle?.licensePlate ?? '-'}</div>
              <div><strong>Payment:</strong> {selected.isPaid ? 'Paid' : 'Unpaid'} {selected.paymentMethod ? ` · ${selected.paymentMethod}` : ''}</div>
              {selected.checkInDeadline && (
                <div><strong>Check-in deadline:</strong> {new Date(selected.checkInDeadline).toLocaleString()}</div>
              )}
              <div><strong>Status:</strong> {selected.status}</div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {selected.status === 'RESERVED' && selected.checkInDeadline && new Date(selected.checkInDeadline).getTime() > Date.now() && (
                <button className="px-3 py-1 bg-emerald-600 text-white rounded" onClick={() => { tryCheckIn(selected.id, selected.paymentMethod); setSelected(null); }}>Check-in / Start</button>
              )}

              {selected.status === 'RESERVED' && (
                <button className="px-3 py-1 border rounded" onClick={() => { cancelBooking(selected.id); setSelected(null); }}>Cancel</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
