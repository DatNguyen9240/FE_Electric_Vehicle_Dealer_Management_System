import React from "react";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Eye } from "lucide-react";
import api from "@libs/axios";
import { useTitle } from "@contexts";

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
  booking?: { id?: string } | null;
  invoice?: { id?: string; amount?: number; status?: string } | null;
};

type ListResponse = {
  pagination: { page: number; limit: number; total: number; pages: number };
  items: SessionItem[];
};

type Station = {
  _id: string;
  name?: string;
  code?: string;
};

const STATUS_OPTIONS = [
  { key: "PENDING", label: "Pending" },
  { key: "CHARGING", label: "Charging" },
  { key: "COMPLETED", label: "Completed" },
  { key: "STOPPED", label: "Stopped" },
] as const;

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  try {
    const d = new Date(value);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return value ?? "—";
  }
};

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

const SessionManagement: React.FC = () => {
  const { setTitle } = useTitle();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Filters & query state
  const [search, setSearch] = React.useState("");
  const [statuses, setStatuses] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(20);
  const [sort, setSort] = React.useState<string>("-startedAt");

  // Station filter
  const [stations, setStations] = React.useState<Station[]>([]);
  const [stationId, setStationId] = React.useState<string>("");

  // Time range filters
  const [from, setFrom] = React.useState<string>("");
  const [to, setTo] = React.useState<string>("");

  const [rows, setRows] = React.useState<SessionItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [pages, setPages] = React.useState(0);

  React.useEffect(() => {
    setTitle("Quản lí phiên sạc");
  }, [setTitle]);

  // Load stations for filter
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/stations", { params: { limit: 1000 } });
        const d: unknown = res.data;
        const list = (() => {
          if (Array.isArray(d)) return d as Station[];
          if (d && typeof d === "object" && !Array.isArray(d)) {
            const obj = d as Record<string, unknown>;
            const maybe = obj.items ?? obj.data ?? obj.stations;
            if (Array.isArray(maybe)) return maybe as Station[];
          }
          return [] as Station[];
        })();
        if (mounted) setStations(list);
      } catch {
        if (mounted) setStations([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ListResponse>("/admin/sessions", {
        params: {
          search: search || undefined,
          status: statuses.length ? statuses.join(",") : undefined,
          stationId: stationId || undefined,
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
    } catch (err: unknown) {
      const getErrorMessage = (e: unknown) => {
        try {
          const ae = e as { response?: { data?: { message?: string } }; message?: string };
          return ae?.response?.data?.message || ae?.message || "Lỗi khi tải dữ liệu";
        } catch {
          return "Lỗi khi tải dữ liệu";
        }
      };
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, statuses, stationId, from, to, page, limit, sort]);

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

  const onSortToggle = (field: string) => {
    setPage(1);
    setSort((prev) => {
      if (prev === field) return "-" + field;
      if (prev === "-" + field) return field;
      return "-" + field;
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
              placeholder="Search user/booking"
              className="border border-[#333333] rounded-lg px-7 py-1 w-72 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333]"
            />
          </div>
          <div>
            <select
              value={stationId}
              onChange={(e) => { setPage(1); setStationId(e.target.value); }}
              className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
            >
              <option value="">All stations</option>
              {stations.map((s) => (
                <option key={s._id} value={s._id}>{s.name || s.code || s._id}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              value={from}
              onChange={(e) => { setPage(1); setFrom(e.target.value); }}
              className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
            />
            <span className="text-sm text-gray-500">đến</span>
            <input
              type="datetime-local"
              value={to}
              onChange={(e) => { setPage(1); setTo(e.target.value); }}
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
            <h2 className="text-lg font-medium text-gray-900">Danh sách phiên sạc</h2>
            <span className="text-sm text-gray-500">{total} kết quả</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connector</th>
                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-red-600">{error}</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Không có phiên sạc nào</td>
                </tr>
              ) : (
                rows.map((s) => (
                  <tr key={s._id || s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a
                        href={`/admin/sessions/view/${s.id || s._id}`}
                        className="text-blue-600 hover:underline"
                        title="Xem chi tiết"
                      >
                        {s.id || s._id}
                      </a>
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
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                      <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass(s.status)}`}>
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        {s.status || "—"}
                      </span>
                      <a
                        href={`/admin/sessions/view/${s.id || s._id}`}
                        className="text-gray-400 hover:text-blue-600"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Trang {page} / {Math.max(1, pages)}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 inline-flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Trước
              </button>
              <button
                disabled={page >= pages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 inline-flex items-center gap-1"
              >
                Sau <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionManagement;


