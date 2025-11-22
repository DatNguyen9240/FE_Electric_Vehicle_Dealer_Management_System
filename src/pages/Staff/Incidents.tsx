import React, { useEffect } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@libs/axios";
import { useUi } from "../../contexts/uiContextCore";
import { useTitle } from "../../contexts";

type Incident = {
  id?: string;
  _id?: string;
  station?: { id?: string; name?: string } | null;
  stationId?: string | null;
  description?: string | null;
  severity?: string | null;
  level?: string | null; // Keep for backward compatibility
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const STATUS_OPTIONS = [
  { key: "OPEN", label: "Open" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "RESOLVED", label: "Resolved" },
] as const;

const LEVEL_OPTIONS = [
  { key: "LOW", label: "Low" },
  { key: "MEDIUM", label: "Medium" },
  { key: "HIGH", label: "High" },
] as const;

const Incidents: React.FC = () => {
  const [list, setList] = React.useState<Incident[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState<number>(1);
  const [limit] = React.useState<number>(20);
  const [pagination, setPagination] = React.useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [stationsMap, setStationsMap] = React.useState<Record<string, { name?: string; code?: string }>>({});
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);
  const [levelFilter, setLevelFilter] = React.useState<string>("");
  const [refreshKey, setRefreshKey] = React.useState(0);

  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle("Incident Management");
  }, [setTitle]);

  const fetch = React.useCallback(
    (p: number = page) => {
      setLoading(true);
      const params: Record<string, any> = { page: p, limit };
      if (search) params.search = search;
      if (statusFilter.length) params.status = statusFilter.join(",");
      if (levelFilter) params.severity = levelFilter;

      api
        .get("/staff/incidents", { params })
        .then((res) => {
          const d = res.data as unknown;

          const asRecord = (v: unknown): Record<string, unknown> | null =>
            v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;

          const obj = asRecord(d);

          if (obj && obj.pagination && typeof obj.pagination === "object") {
            const pag = obj.pagination as Record<string, unknown>;
            setPagination({
              page: typeof pag.page === "number" ? (pag.page as number) : Number(pag.page as unknown) || p,
              limit: typeof pag.limit === "number" ? (pag.limit as number) : Number(pag.limit as unknown) || limit,
              total: typeof pag.total === "number" ? (pag.total as number) : Number(pag.total as unknown) || 0,
              pages: typeof pag.pages === "number" ? (pag.pages as number) : Number(pag.pages as unknown) || 0,
            });
          }

          const items = (() => {
            if (Array.isArray(d)) return d as Incident[];
            if (obj) {
              const maybe = obj.items ?? obj.data ?? obj.incidents;
              if (Array.isArray(maybe)) return maybe as Incident[];
            }
            return [] as Incident[];
          })();

          setList(items);
        })
        .catch((err) => {
          console.error(err);
          setList([]);
        })
        .finally(() => setLoading(false));
    },
    [limit, page, search, statusFilter, levelFilter]
  );

  React.useEffect(() => {
    fetch(page);
  }, [fetch, page, refreshKey]);

  const { showToast } = useUi();

  // load stations for map
  React.useEffect(() => {
    api
      .get('/stations')
      .then((res) => {
        const d = res.data as any;
        const list = Array.isArray(d) ? d : d?.stations ?? d?.items ?? d?.data ?? [];
        if (Array.isArray(list)) {
          // Create map for station names
          const map: Record<string, { name?: string; code?: string }> = {};
          list.forEach((s: any) => {
            const id = s._id ?? s.id;
            if (id) {
              map[id] = { name: s.name, code: s.code };
            }
          });
          setStationsMap(map);
        }
      })
      .catch((err) => {
        console.error(err);
        showToast('Failed to load stations', 'error');
      });
  }, [showToast]);


  const toggleStatusTab = (statusKey: string) => {
    setPage(1);
    if (statusKey === "ALL") {
      setStatusFilter([]);
    } else {
      setStatusFilter((prev) => {
        if (prev.includes(statusKey)) {
          return [];
        } else {
          return [statusKey];
        }
      });
    }
  };

  const badgeClass = (status?: string | null) => {
    const s = String(status || "OPEN").toUpperCase();
    switch (s) {
      case "RESOLVED":
        return "bg-green-50 text-green-700";
      case "IN_PROGRESS":
        return "bg-yellow-50 text-yellow-700";
      case "OPEN":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const levelBadgeClass = (severity?: string | null) => {
    const s = String(severity || "LOW").toUpperCase();
    switch (s) {
      case "HIGH":
        return "bg-red-50 text-red-700";
      case "MEDIUM":
        return "bg-yellow-50 text-yellow-700";
      case "LOW":
        return "bg-green-50 text-green-700";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const getStationName = (stationId?: string | null) => {
    if (!stationId) return "—";
    const station = stationsMap[stationId];
    return station?.name || station?.code || stationId || "—";
  };

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
      return value;
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/staff/incidents/${id}/status`, { status });
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      showToast("Failed to update status", "error");
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
              placeholder="Search incidents..."
              className="border border-[#333333] rounded-lg px-7 py-1 w-72 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Level</label>
            <select
              value={levelFilter}
              onChange={(e) => {
                setPage(1);
                setLevelFilter(e.target.value);
              }}
              className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
            >
              <option value="">All</option>
              {LEVEL_OPTIONS.map((l) => (
                <option key={l.key} value={l.key}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Link
          to="/staff/incidents/create"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all inline-block"
        >
          + Report Incident
        </Link>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-6 border-b mb-4">
        <button
          className={`py-2 px-2 text-sm font-medium border-b-2 transition-all ${
            statusFilter.length === 0
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
              statusFilter.includes(t.key)
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-blue-600"
            }`}
            onClick={() => toggleStatusTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Incident Table */}
      <div className="bg-white rounded-xl border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Incident List</h2>
            <span className="text-sm text-gray-500">{pagination.total} results</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
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
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No incidents found</td>
                </tr>
              ) : (
                list.map((it) => {
                  const incidentId = it.id || it._id;
                  const status = String(it.status || "OPEN").toUpperCase();
                  return (
                    <tr key={incidentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {incidentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {getStationName(it.stationId)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-md">
                        <div className="truncate" title={it.description || undefined}>
                          {it.description || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${levelBadgeClass(it.severity || it.level)}`}>
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          {it.severity || it.level || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass(it.status)}`}>
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDateTime(it.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {status === "IN_PROGRESS" && (
                          <button
                            onClick={() => updateStatus(incidentId || "", "RESOLVED")}
                            className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs transition"
                          >
                            Resolve
                          </button>
                        )}
                        {status !== "IN_PROGRESS" && <span className="text-gray-400">—</span>}
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

export default Incidents;
