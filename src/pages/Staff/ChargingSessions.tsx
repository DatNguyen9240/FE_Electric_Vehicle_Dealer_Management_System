import React from "react";
import api from "@libs/axios";
import { Loader2, Play, Square, ChevronLeft, ChevronRight } from "lucide-react";
import { useUi } from "../../contexts/UiContext";

type Session = any;

const ChargingSessions: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [page, setPage] = React.useState<number>(1);
  const [limit] = React.useState<number>(20);
  const [pagination, setPagination] = React.useState({ page: 1, limit: 20, total: 0, pages: 0 });

  const { showToast, confirm } = useUi();

  const fetch = React.useCallback((p: number = page) => {
    setLoading(true);
    api
      .get("/staff/sessions", { params: { page: p, limit } })
      .then((res) => {
        const d = res.data as any;
        if (d?.pagination) {
          setPagination({
            page: d.pagination.page || p,
            limit: d.pagination.limit || limit,
            total: d.pagination.total || 0,
            pages: d.pagination.pages || 0,
          });
        }
        if (Array.isArray(d)) return setSessions(d);
        if (Array.isArray(d?.items)) return setSessions(d.items);
        if (Array.isArray(d?.sessions)) return setSessions(d.sessions);
        if (Array.isArray(d?.data)) return setSessions(d.data);
        setSessions([]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [limit, page]);

  React.useEffect(() => {
    fetch();
  }, [fetch]);

  React.useEffect(() => {
    fetch(page);
  }, [page]);

  const stopSession = async (id: string) => {
    const ok = await confirm("Stop this session?");
    if (!ok) return;
    api
      .post(`/sessions/${id}/stop`)
      .then(() => {
        showToast("Session stopped", "success");
        fetch();
      })
      .catch(() => showToast("Failed to stop session", "error"));
  };

  const startSession = async (bookingId?: string) => {
    // showToast available from top-level useUi
    const payload = { bookingId, paymentMethod: "ONSITE" };
    api
      .post(`/sessions/start`, payload)
      .then(() => {
        showToast("Session started", "success");
        fetch();
      })
      .catch(() => showToast("Failed to start session", "error"));
  };

  const getStatusBadge = (status: string) => {
    const base = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "ACTIVE":
        return <span className={`${base} bg-green-100 text-green-700`}>Active</span>;
      case "COMPLETED":
        return <span className={`${base} bg-blue-100 text-blue-700`}>Completed</span>;
      case "FAILED":
      case "CANCELLED":
        return <span className={`${base} bg-red-100 text-red-700`}>Cancelled</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-700`}>{status || "Unknown"}</span>;
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Loading sessions...
      </div>
    );

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">⚡ Charging Sessions</h2>
        <span className="text-sm text-gray-500">
          Total: {pagination.total.toLocaleString()} sessions
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Customer</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Plate</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Station</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Connector</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Started</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Status</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  No sessions found.
                </td>
              </tr>
            ) : (
              sessions.map((s: any, i: number) => (
                <tr
                  key={s.id ?? s._id ?? i}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2">
                    {s.user?.name ?? s.user?.fullName ?? s.customerName ?? s.bookingRef ?? "-"}
                  </td>
                  <td className="px-4 py-2">{s.bookingRef ?? "-"}</td>
                  <td className="px-4 py-2">{s.station?.name ?? s.stationName ?? "-"}</td>
                  <td className="px-4 py-2">{s.connector?.code ?? s.connector?.name ?? "-"}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {s.startedAt ? new Date(s.startedAt).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-2">{getStatusBadge(s.status)}</td>
                  <td className="px-4 py-2 text-center">
                    {s.status === "ACTIVE" ? (
                      <button
                        onClick={() => stopSession(s.id ?? s._id)}
                        className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs transition"
                      >
                        <Square size={14} />
                        Stop
                      </button>
                    ) : (s.booking?.id || s.bookingId) ? (
                      <button
                        onClick={() => startSession(s.booking?.id ?? s.bookingId)}
                        className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs transition"
                      >
                        <Play size={14} />
                        Start
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            disabled={pagination.page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="flex items-center gap-1 px-3 py-1 border rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} / {pagination.pages}
          </span>
          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            className="flex items-center gap-1 px-3 py-1 border rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChargingSessions;
