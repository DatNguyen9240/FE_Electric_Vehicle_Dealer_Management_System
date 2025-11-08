import React from "react";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Eye } from "lucide-react";
import api from "@libs/axios";
import { useTitle } from "@contexts";

type BookingItem = {
  _id: string;
  id?: string;
  status: string;
  slotStart: string;
  slotEnd: string;
  createdAt?: string;
  updatedAt?: string;
  user?: { id?: string; name?: string; email?: string; phone?: string } | null;
  station?: { id?: string; name?: string; code?: string; address?: string; province?: string } | null;
  connector?: { id?: string; code?: string; type?: string; powerKw?: number } | null;
};

type ListResponse = {
  pagination: { page: number; limit: number; total: number; pages: number };
  items: BookingItem[];
};

type Station = {
  _id: string;
  name?: string;
  code?: string;
};

const STATUS_OPTIONS = [
  { key: "RESERVED", label: "Reserved" },
  { key: "CHECKED_IN", label: "Check-in" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "NO_SHOW", label: "No-show" },
  { key: "COMPLETED", label: "Completed" },
] as const;

const formatDateTime = (value?: string) => {
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
    return value;
  }
};

const badgeClass = (status: string) => {
  switch (status) {
    case "RESERVED":
      return "bg-blue-50 text-blue-700";
    case "CHECKED_IN":
      return "bg-yellow-50 text-yellow-700";
    case "CANCELLED":
      return "bg-red-50 text-red-600";
    case "NO_SHOW":
      return "bg-orange-50 text-orange-700";
    case "COMPLETED":
      return "bg-green-50 text-green-700";
    default:
      return "bg-gray-50 text-gray-600";
  }
};

const BookingManagement: React.FC = () => {
  const { setTitle } = useTitle();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Filters & query state
  const [search, setSearch] = React.useState("");
  const [statuses, setStatuses] = React.useState<string[]>([]);
  // date range not required in simplified UI
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(20);
  const [sort, setSort] = React.useState<string>("-slotStart");

  // Station filter
  const [stations, setStations] = React.useState<Station[]>([]);
  const [stationId, setStationId] = React.useState<string>("");

  const [rows, setRows] = React.useState<BookingItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [pages, setPages] = React.useState(0);

  React.useEffect(() => {
    setTitle("Quản lí đặt chỗ");
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
      const res = await api.get<ListResponse>("/admin/bookings", {
        params: {
          search: search || undefined,
          status: statuses.length ? statuses.join(",") : undefined,
          // date filters omitted in simplified UI
          stationId: stationId || undefined,
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
          // axios shape
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
  }, [search, statuses, stationId, page, limit, sort]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleStatusTab = (statusKey: string) => {
    setPage(1);
    if (statusKey === "ALL") {
      // Chọn "ALL" thì bỏ tất cả filter
      setStatuses([]);
    } else {
      // Chọn status khác - nếu đã chọn rồi thì bỏ chọn (về ALL), nếu chưa thì chỉ chọn status đó
      setStatuses((prev) => {
        if (prev.includes(statusKey)) {
          // Đang chọn rồi, bỏ chọn về ALL
          return [];
        } else {
          // Chọn status mới, chỉ giữ status này
          return [statusKey];
        }
      });
    }
  };

  const onSortToggle = (field: string) => {
    setPage(1);
    setSort((prev) => {
      if (prev === field) return "-" + field;
      if (prev === "-" + field) return field; // toggle desc -> asc
      return "-" + field; // default to desc
    });
  };

  

  return (
    <div className="p-6">
      {/* Toolbar (match Payment layout) */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
              placeholder="Search user"
              className="border border-[#333333] rounded-lg px-7 py-1 w-72 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333]"
            />
          </div>
          {/* Station filter */}
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
        </div>
      </div>

      {/* Status Tabs (multi-select -> CSV) */}
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

      {/* Table */}
      <div className="bg-white rounded-xl border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Danh sách đặt chỗ</h2>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => onSortToggle("slotStart")} className="inline-flex items-center gap-1">
                    Slot bắt đầu <ArrowUpDown size={14} className="text-gray-400" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot kết thúc</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => onSortToggle("createdAt")} className="inline-flex items-center gap-1">
                    Tạo lúc <ArrowUpDown size={14} className="text-gray-400" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-red-600">{error}</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">Không có đặt chỗ nào</td>
                </tr>
              ) : (
                rows.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a
                        href={`/admin/bookings/view/${b.id || b._id}`}
                        className="text-blue-600 hover:underline"
                        title="Xem chi tiết"
                      >
                        {b.id || b._id}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {b.user?.name || b.user?.email || b.user?.id || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {b.station?.name || b.station?.code || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {b.connector?.code || b.connector?.type || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDateTime(b.slotStart)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDateTime(b.slotEnd)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDateTime(b.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                      <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass(b.status)}`}>
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        {b.status}
                      </span>
                      <a
                        href={`/admin/bookings/view/${b.id || b._id}`}
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
        {/* Pagination */}
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

export default BookingManagement;


