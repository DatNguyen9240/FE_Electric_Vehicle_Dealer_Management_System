import React, { useEffect } from "react";
import api from "@libs/axios";
import { useUi } from "../../contexts/uiContextCore";
import { useTitle } from "../../contexts";

type Booking = {
  id?: string;
  _id?: string;
  reference?: string;
  user?: { name?: string; fullName?: string };
  customerName?: string;
  vehicle?: { make?: string; model?: string } | null;
  vehicleId?: string;
  station?: { name?: string } | null;
  stationName?: string;
  connector?: { code?: string; type?: string } | null;
  slotStart?: string | null;
  slotEnd?: string | null;
  booking?: { slotStart?: string; slotEnd?: string; id?: string } | null;
  session?: { id?: string; status?: string } | null;
  sessionId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

const Bookings: React.FC = () => {
  const [list, setList] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState<number>(1);
  const [limit] = React.useState<number>(20);
  const [pagination, setPagination] = React.useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [selected, setSelected] = React.useState<Booking | null>(null);
  
  const { showToast, confirm } = useUi();
  
    const { setTitle } = useTitle();
  
    useEffect(() => {
      setTitle("Staff Bookings");
    }, [setTitle]);

  const fetch = React.useCallback((p: number) => {
    setLoading(true);
    api
      .get("/staff/bookings", { params: { page: p, limit } })
      .then((res) => {
        const d = res.data as unknown;
        if (typeof d === "object" && d && !Array.isArray(d)) {
          const rec = d as Record<string, unknown>;
          const pag = rec["pagination"] as Record<string, unknown> | undefined;
          if (pag) {
            setPagination({
              page: (pag["page"] as number) || p,
              limit: (pag["limit"] as number) || limit,
              total: (pag["total"] as number) || 0,
              pages: (pag["pages"] as number) || 0,
            });
          }

          const tryArrays = ["items", "data", "bookings"] as const;
          for (const key of tryArrays) {
            const val = rec[key];
            if (Array.isArray(val)) return setList(val as Booking[]);
          }
        }
        if (Array.isArray(d)) return setList(d as Booking[]);
        setList([]);
      })
      .catch((err: unknown) => {
        // keep simple: log and toast
        console.error(err);
        showToast("Failed to load bookings", "error");
      })
      .finally(() => setLoading(false));
  }, [limit, showToast]);

  React.useEffect(() => { fetch(1); }, [fetch]);
  React.useEffect(() => { fetch(page); }, [page, fetch]);

  // Proxy booking modal state
  const [proxyOpen, setProxyOpen] = React.useState(false);
  const [connectors, setConnectors] = React.useState<Array<any>>([]);
  const [proxyForm, setProxyForm] = React.useState({
    connectorId: '',
    slotStart: '',
    durationMinutes: 30,
    customerName: '',
    paymentMethod: 'ONSITE',
    userId: '',
  });
  const [proxyLoading, setProxyLoading] = React.useState(false);

  const openProxy = () => {
    setProxyOpen(true);
    // fetch connectors online
    api
      .get('/connectors', { params: { status: 'ONLINE', limit: 100} })
      .then((res) => {
        const d = res.data as any;
        // try to find items or data
        const list = d?.items || d?.data || d?.connectors || d || [];
        if (Array.isArray(list)) setConnectors(list);
      })
      .catch((err) => {
        console.error(err);
        showToast('Failed to load connectors', 'error');
      });
  };

  const closeProxy = () => {
    setProxyOpen(false);
    setProxyForm({ connectorId: '', slotStart: '', durationMinutes: 30, customerName: '', paymentMethod: 'ONSITE', userId: '' });
    setConnectors([]);
    setProxyLoading(false);
  };

  const submitProxy = async () => {
    const { connectorId, slotStart, durationMinutes, customerName, paymentMethod, userId } = proxyForm;
    if (!connectorId) return showToast('Please choose a connector', 'error');
    if (!slotStart) return showToast('Please choose slot start', 'error');
    const dur = Number(durationMinutes) || 0;
    if (dur <= 0) return showToast('Duration must be positive', 'error');
    if (!userId && !customerName) return showToast('Customer name is required for walk-in', 'error');
    if (!userId && paymentMethod !== 'ONSITE') return showToast('Walk-in must use ONSITE payment', 'error');

    const payload: Record<string, unknown> = {
      connectorId,
      slotStart: new Date(slotStart).toISOString(),
      durationMinutes: dur,
      paymentMethod,
    };
    if (customerName) payload.customerName = customerName;
    if (userId) payload.userId = userId;

    setProxyLoading(true);
    try {
      await api.post('/staff/bookings/proxy', payload);
      showToast('Proxy booking created', 'success');
      closeProxy();
      fetch(page);
    } catch (err) {
      console.error(err);
      showToast('Failed to create proxy booking', 'error');
    } finally {
      setProxyLoading(false);
    }
  };

  const startFromBooking = async (bookingId?: string) => {
    if (!bookingId) {
      showToast("Missing booking id", "error");
      return;
    }
    const ok = await confirm("Start session from this booking?");
    if (!ok) return;
    api
      .post(`/sessions/start`, { bookingId, paymentMethod: "ONSITE" })
      .then(() => {
        showToast("Session started", "success");
        fetch(page);
      })
      .catch(() => showToast("Failed to start session", "error"));
  };

  return (
  <div className="w-full px-6 py-6">
      {/* Top actions */}
      <div className="flex justify-end mb-4">
        <button
          onClick={openProxy}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          New proxy booking
        </button>
      </div>
      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-between items-center mb-4">
          <button
            disabled={pagination.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`px-4 py-2 rounded-lg transition ${
              pagination.page <= 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Previous
          </button>

          <div className="text-sm text-gray-600">
            Page {pagination.page} / {pagination.pages}
          </div>

          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            className={`px-4 py-2 rounded-lg transition ${
              pagination.page >= pagination.pages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
        {loading ? (
          <div className="p-6 text-center text-gray-500 animate-pulse">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 sticky top-0">
                <tr>
                  <th className="p-3 text-left">Reference</th>
                  <th className="p-3 text-left">Customer</th>
                  <th className="p-3 text-left">Vehicle</th>
                  <th className="p-3 text-left">Station</th>
                  <th className="p-3 text-left">Slot</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((b: Booking, i) => (
                  <tr
                    key={b.id ?? i}
                    className="border-t hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <td className="p-3 font-medium text-gray-800 dark:text-gray-200">
                      {b.reference ?? b.id}
                    </td>
                    <td className="p-3">{b.user?.name ?? b.customerName ?? "-"}</td>
                    <td className="p-3">
                      {b.vehicle
                        ? `${b.vehicle.make ?? ""} ${b.vehicle.model ?? ""}`.trim()
                        : "-"}
                    </td>
                    <td className="p-3">{b.station?.name ?? b.stationName ?? "-"}</td>
                    <td className="p-3">
                      {b.slotStart && b.slotEnd
                        ? `${new Date(b.slotStart).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} - ${new Date(b.slotEnd).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : "-"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          b.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : b.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : b.status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                        onClick={() => startFromBooking(b.id)}
                      >
                        Start
                      </button>
                      <button
                        className="border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium"
                        onClick={() => setSelected(b)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
        {selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[95%] max-w-5xl p-6 relative animate-fadeIn">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              Booking Details
            </h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p><strong>Booking ID:</strong> {selected.id}</p>
              <p><strong>Customer:</strong> {selected.user?.name ?? selected.customerName ?? "-"}</p>
              <p><strong>Vehicle:</strong> {selected.vehicle?.make} {selected.vehicle?.model}</p>
              <p><strong>Station:</strong> {selected.station?.name ?? selected.stationName}</p>
              <p><strong>Connector:</strong> {selected.connector?.code} ({selected.connector?.type})</p>
              <p><strong>Slot Start:</strong> {selected.slotStart ? new Date(selected.slotStart).toLocaleString() : "-"}</p>
              <p><strong>Slot End:</strong> {selected.slotEnd ? new Date(selected.slotEnd).toLocaleString() : "-"}</p>
              <p><strong>Session ID:</strong> {selected.session?.id ?? "-"}</p>
              <p><strong>Session Status:</strong> {selected.session?.status ?? "-"}</p>
              <p><strong>Created At:</strong> {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : "-"}</p>
              <p><strong>Updated At:</strong> {selected.updatedAt ? new Date(selected.updatedAt).toLocaleString() : "-"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Proxy Booking Modal */}
      {proxyOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-lg p-6 relative animate-fadeIn">
            <button
              onClick={closeProxy}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4">Create proxy booking</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700">Connector</label>
                <select
                  value={proxyForm.connectorId}
                  onChange={(e) => setProxyForm({ ...proxyForm, connectorId: e.target.value })}
                  className="w-full border rounded-md p-2 text-sm"
                >
                  <option value="">-- choose connector --</option>
                  {connectors.map((c: any) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.code || c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700">Slot start</label>
                <input
                  type="datetime-local"
                  value={proxyForm.slotStart}
                  onChange={(e) => setProxyForm({ ...proxyForm, slotStart: e.target.value })}
                  className="w-full border rounded-md p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700">Duration (minutes)</label>
                <input
                  type="number"
                  min={1}
                  value={proxyForm.durationMinutes}
                  onChange={(e) => setProxyForm({ ...proxyForm, durationMinutes: Number(e.target.value) })}
                  className="w-full border rounded-md p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700">Customer name (if walk-in)</label>
                <input
                  type="text"
                  value={proxyForm.customerName}
                  onChange={(e) => setProxyForm({ ...proxyForm, customerName: e.target.value })}
                  className="w-full border rounded-md p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700">User ID (optional)</label>
                <input
                  type="text"
                  value={proxyForm.userId}
                  onChange={(e) => setProxyForm({ ...proxyForm, userId: e.target.value })}
                  className="w-full border rounded-md p-2 text-sm"
                  placeholder="Existing user id (optional)"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700">Payment method</label>
                <select
                  value={proxyForm.paymentMethod}
                  onChange={(e) => setProxyForm({ ...proxyForm, paymentMethod: e.target.value })}
                  className="w-full border rounded-md p-2 text-sm"
                >
                  <option value="ONSITE">ONSITE</option>
                  <option value="WALLET">WALLET</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={closeProxy} className="px-4 py-2 rounded-lg border">Cancel</button>
                <button onClick={submitProxy} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">
                  {proxyLoading ? 'Creating...' : 'Create booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
