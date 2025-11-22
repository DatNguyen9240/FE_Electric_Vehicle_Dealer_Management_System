import React, { useEffect } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
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
  
  const { showToast } = useUi();
  
    const { setTitle } = useTitle();
  
    useEffect(() => {
      setTitle("Staff Bookings");
    }, [setTitle]);

    // Filters
    const [statusFilter, setStatusFilter] = React.useState<string>("");
    const [fromFilter, setFromFilter] = React.useState<string>("");
    const [toFilter, setToFilter] = React.useState<string>("");
    const [search, setSearch] = React.useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = React.useState<string>("");
    const [stationFilter, setStationFilter] = React.useState<string>("");
    const [stations, setStations] = React.useState<Array<any>>([]);

    // debounce search
    React.useEffect(() => {
      const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
      return () => clearTimeout(t);
    }, [search]);

    // fetch stations for station filter
    React.useEffect(() => {
      api
        .get('/stations', { params: { status: 'ONLINE', limit: 200 } })
        .then((res) => {
          const d: any = res.data;
          const list = d?.items || d?.data || d?.stations || d || [];
          if (Array.isArray(list)) setStations(list);
        })
        .catch((err) => {
          console.error('Failed to fetch stations', err);
        });
    }, []);

  const toIsoStartOfDay = (d: string) => {
    try {
      const dt = new Date(d);
      dt.setHours(0, 0, 0, 0);
      return dt.toISOString();
    } catch (e) {
      return undefined;
    }
  };

  const toIsoEndOfDay = (d: string) => {
    try {
      const dt = new Date(d);
      dt.setHours(23, 59, 59, 999);
      return dt.toISOString();
    } catch (e) {
      return undefined;
    }
  };

  const fetch = React.useCallback((p: number) => {
    setLoading(true);
    const params: Record<string, unknown> = { page: p, limit, sort: "-createdAt" };
    if (statusFilter) params.status = statusFilter;
    if (fromFilter) params.from = toIsoStartOfDay(fromFilter);
    if (toFilter) params.to = toIsoEndOfDay(toFilter);
    if (debouncedSearch) params.search = debouncedSearch;
    if (stationFilter) params.stationId = stationFilter;

    api
      .get("/staff/bookings", { params })
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
  }, [limit, showToast, statusFilter, fromFilter, toFilter, debouncedSearch, stationFilter]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setPage(1);
  }, [statusFilter, fromFilter, toFilter, debouncedSearch, stationFilter]);

  // Fetch data when page or filters change
  React.useEffect(() => {
    fetch(page);
  }, [fetch, page]);

  // Proxy booking feature removed


  const STATUS_OPTIONS = [
    { key: "RESERVED", label: "Reserved" },
    { key: "CHECKED_IN", label: "Checked In" },
    { key: "COMPLETED", label: "Completed" },
    { key: "CANCELLED", label: "Cancelled" },
    { key: "NO_SHOW", label: "No Show" },
  ] as const;

  const toggleStatusTab = (statusKey: string) => {
    setPage(1);
    if (statusKey === "ALL") {
      setStatusFilter("");
    } else {
      setStatusFilter(statusKey);
    }
  };

  const badgeClass = (status?: string | null) => {
    const s = String(status || "").toUpperCase();
    switch (s) {
      case "COMPLETED":
        return "bg-green-50 text-green-700";
      case "CHECKED_IN":
        return "bg-yellow-50 text-yellow-700";
      case "CANCELLED":
        return "bg-red-50 text-red-700";
      case "NO_SHOW":
        return "bg-orange-50 text-orange-700";
      case "RESERVED":
        return "bg-blue-50 text-blue-700";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

 

  const formatTime = (value?: string | null) => {
    if (!value) return "—";
    try {
      const d = new Date(value);
      return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return value;
    }
  };

  const formatSlot = (start?: string | null, end?: string | null) => {
    if (!start || !end) return "—";
    try {
      const startDate = new Date(start);
      const dateStr = new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(startDate);
      const startTime = formatTime(start);
      const endTime = formatTime(end);
      return `${dateStr} ${startTime} - ${endTime}`;
    } catch {
      return "—";
    }
  };

  return (
    <div>
      {/* Search and Filters */}
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
              placeholder="Search reference, vehicle, phone..."
              className="border border-[#333333] rounded-lg px-7 py-1 w-72 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333]"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fromFilter}
              onChange={(e) => {
                setPage(1);
                setFromFilter(e.target.value);
              }}
              className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
            />
            <span className="text-sm text-gray-500">to</span>
            <input
              type="date"
              value={toFilter}
              onChange={(e) => {
                setPage(1);
                setToFilter(e.target.value);
              }}
              className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Station</label>
            <select
              value={stationFilter}
              onChange={(e) => {
                setPage(1);
                setStationFilter(e.target.value);
              }}
              className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
            >
              <option value="">All</option>
              {stations.map((s) => (
                <option key={s._id || s.id} value={s._id || s.id}>
                  {s.name || s.title || s.code}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-6 border-b mb-4">
        <button
          className={`py-2 px-2 text-sm font-medium border-b-2 transition-all ${
            !statusFilter
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
              statusFilter === t.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-blue-600"
            }`}
            onClick={() => toggleStatusTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Booking Table */}
      <div className="bg-white rounded-xl border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Booking List</h2>
            <span className="text-sm text-gray-500">{pagination.total} results</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading data...</td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No bookings found</td>
                </tr>
              ) : (
                list.map((b: Booking) => {
                  const bookingId = b.id || b._id;
                  return (
                    <tr key={bookingId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {b.reference ?? bookingId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {b.user?.name ?? b.customerName ?? "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {b.vehicle
                          ? `${b.vehicle.make ?? ""} ${b.vehicle.model ?? ""}`.trim()
                          : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {b.station?.name ?? b.stationName ?? "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatSlot(b.slotStart, b.slotEnd)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass(b.status)}`}>
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          {b.status || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/staff/bookings/${b.id || b._id}`}
                          className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-xs transition"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page {pagination.page} / {Math.max(1, pagination.pages)}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 inline-flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                disabled={pagination.page >= pagination.pages || loading}
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

export default Bookings;
