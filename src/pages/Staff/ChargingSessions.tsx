import React from "react";
import { Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@libs/axios";
import { useTitle } from "../../contexts";

type SessionItem = {
  _id?: string;
  id?: string;
  status?: string | null;
  startedAt?: string | null;
  stoppedAt?: string | null;
  createdAt?: string | null;
  user?: { id?: string; name?: string; email?: string; phone?: string } | null;
  station?: { id?: string; name?: string; code?: string } | null;
  connector?: { id?: string; code?: string; type?: string } | null;
  booking?: { id?: string; bookingRef?: string } | null;
  bookingRef?: string | null;
};

type ListResponse = {
  pagination: { page: number; limit: number; total: number; pages: number };
  items: SessionItem[];
};

const STATUS_OPTIONS = [
  { key: "PENDING", label: "Pending" },
  { key: "CHARGING", label: "Charging" },
  { key: "COMPLETED", label: "Completed" },
  { key: "STOPPED", label: "Stopped" },
] as const;

const badgeClass = (status?: string | null) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-50 text-yellow-700";
    case "CHARGING":
      return "bg-green-50 text-green-700";
    case "COMPLETED":
      return "bg-blue-50 text-blue-700";
    case "STOPPED":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-50 text-gray-600";
  }
};

const ChargingSessions: React.FC = () => {
  const { setTitle } = useTitle();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Filters & query state
  const [search, setSearch] = React.useState("");
  const [statuses, setStatuses] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(20);
  const [sort] = React.useState<string>("-startedAt");

  // Time range filters
  const [from, setFrom] = React.useState<string>("");
  const [to, setTo] = React.useState<string>("");

  const [rows, setRows] = React.useState<SessionItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [pages, setPages] = React.useState(0);
  const [invoiceStatusMap, setInvoiceStatusMap] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    setTitle("Charging Sessions");
  }, [setTitle]);

  const fetchInvoiceStatuses = async (sessionIds: string[]) => {
    try {
      const pairs = await Promise.all(
        sessionIds.map(async (sid) => {
          try {
            const res = await api.get(`/staff/sessions/${sid}/invoice`);
            const d = res.data as any;
            const invoice = d?.invoice;
            return [sid, invoice?.payment_status ?? null] as [string, string | null];
          } catch (e) {
            return [sid, null] as [string, string | null];
          }
        })
      );
      setInvoiceStatusMap((m) => {
        const copy = { ...m };
        for (const [sid, status] of pairs) {
          if (status) copy[sid] = status;
        }
        return copy;
      });
    } catch (e) {
      // ignore
    }
  };

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ListResponse>("/staff/sessions", {
        params: {
          search: search || undefined,
          status: statuses.length ? statuses.join(",") : undefined,
          from: from || undefined,
          to: to || undefined,
          page,
          limit,
          sort,
        },
      });
      setRows(res.data.items);
      setTotal(res.data.pagination.total);
      setPages(res.data.pagination.pages);

      // Fetch invoice statuses for completed sessions
      const completedIds = res.data.items
        .filter((s) => s.status === "COMPLETED")
        .map((s) => s.id || s._id)
        .filter(Boolean) as string[];
      if (completedIds.length) {
        fetchInvoiceStatuses(completedIds);
      }
    } catch (err: unknown) {
      const getErrorMessage = (e: unknown) => {
        try {
          const ae = e as { response?: { data?: { message?: string } }; message?: string };
          return ae?.response?.data?.message || ae?.message || "Error loading data";
        } catch {
          return "Error loading data";
        }
      };
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, statuses, from, to, page, limit, sort]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleStatusTab = (statusKey: string) => {
    setPage(1);
    if (statusKey === "ALL") {
      setStatuses([]);
    } else {
      setStatuses((prev) => {
        if (prev.includes(statusKey)) {
          return [];
        } else {
          return [statusKey];
        }
      });
    }
  };


  return (
    <div >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search user/booking"
              className="border border-[#333333] rounded-lg px-7 py-1 w-72 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333]"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              value={from}
              onChange={(e) => {
                setPage(1);
                setFrom(e.target.value);
              }}
              className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
            />
            <span className="text-sm text-gray-500">to</span>
            <input
              type="datetime-local"
              value={to}
              onChange={(e) => {
                setPage(1);
                setTo(e.target.value);
              }}
              className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-6 border-b mb-4">
        <button
          className={`py-2 px-2 text-sm font-medium border-b-2 transition-all ${
            statuses.length === 0
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-600"
          }`}
          onClick={() => toggleStatusTab("ALL")}
        >
          All
        </button>
        {STATUS_OPTIONS.map((t) => (
          <button
            key={t.key}
            className={`py-2 px-2 text-sm font-medium border-b-2 transition-all ${
              statuses.includes(t.key)
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-blue-600"
            }`}
            onClick={() => toggleStatusTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Session List</h2>
            <span className="text-sm text-gray-500">{total} results</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connector</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading data...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-red-600">{error}</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No sessions</td>
                </tr>
              ) : (
                rows.map((s) => {
                  const sessionId = s.id || s._id;
                  const hasInvoice = sessionId ? Boolean(invoiceStatusMap[sessionId]) : false;
                  return (
                    <tr key={sessionId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {sessionId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {s.user?.name || s.user?.email || s.user?.id || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {s.station?.name || s.station?.code || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {s.connector?.code || s.connector?.type || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass(s.status)}`}>
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          {s.status || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          {s.status === "COMPLETED" && hasInvoice ? (
                            <Link
                              to={`/staff/sessions/${sessionId}/invoice`}
                              className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-xs transition"
                            >
                              <Eye size={14} />
                              View invoice
                            </Link>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page {page} / {Math.max(1, pages)}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 inline-flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                disabled={page >= pages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 inline-flex items-center gap-1"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ChargingSessions;
