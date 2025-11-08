import React, { useEffect } from "react";
import api from "@libs/axios";
import { useUi } from "../../contexts/uiContextCore";
import { useTitle } from "../../contexts";

type Incident = {
  id?: string;
  _id?: string;
  station?: { id?: string; name?: string } | null;
  stationId?: string | null;
  description?: string | null;
  level?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const Incidents: React.FC = () => {
  const [list, setList] = React.useState<Incident[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState<number>(1);
  const [limit] = React.useState<number>(20);
  const [pagination, setPagination] = React.useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [form, setForm] = React.useState({ stationId: "", description: "", level: "LOW" });
  const [submitting, setSubmitting] = React.useState(false);

    const { setTitle } = useTitle();
  
    useEffect(() => {
      setTitle("Incident Management");
    }, [setTitle]);

  const fetch = React.useCallback(
    (p: number = page) => {
      setLoading(true);
      api
        .get("/staff/incidents", { params: { page: p, limit } })
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
    [limit, page]
  );

  React.useEffect(() => {
    fetch(page);
  }, [fetch, page]);

  const { showToast } = useUi();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/staff/incidents", form);
      showToast("Incident reported successfully", "success");
      setForm({ stationId: "", description: "", level: "LOW" });
      fetch(page);
    } catch (err) {
      console.error(err);
      showToast("Failed to report incident", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/staff/incidents/${id}/status`, { status });
      fetch(page);
    } catch (err) {
      console.error(err);
      showToast("Failed to update status", "error");
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-inner">
      <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
        ⚠️ Incident Management
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* --- Report Form --- */}
        <div className="bg-white/80 backdrop-blur-lg border border-gray-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
          <h3 className="font-semibold text-lg mb-4 text-gray-700">📋 Report New Incident</h3>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Station ID</label>
              <input
                placeholder="Enter station ID"
                value={form.stationId}
                onChange={(e) => setForm((f) => ({ ...f, stationId: e.target.value }))}
                className="w-full mt-1 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Description</label>
              <textarea
                placeholder="Describe the issue..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full mt-1 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Severity Level</label>
              <select
                value={form.level}
                onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                className="w-full mt-1 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="LOW">🟢 Low</option>
                <option value="MEDIUM">🟠 Medium</option>
                <option value="HIGH">🔴 High</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className={`px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-all ${
                  submitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 shadow-md hover:shadow-lg"
                }`}
              >
                {submitting ? "Submitting..." : "Report Incident"}
              </button>
            </div>
          </form>
        </div>

        {/* --- Incident List --- */}
        <div className="bg-white/80 backdrop-blur-lg border border-gray-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
          <h3 className="font-semibold text-lg mb-3 text-gray-700">📄 Incident List</h3>

          {loading ? (
            <div className="text-sm text-gray-500 animate-pulse">Loading incidents...</div>
          ) : list.length === 0 ? (
            <div className="text-sm text-gray-500">No incidents found.</div>
          ) : (
            <ul className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
              {list.map((it) => (
                <li
                  key={it.id ?? it._id}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-800">
                        {it.station?.name || it.stationId || "Unknown"}{" "}
                        <span
                          className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            it.level === "HIGH"
                              ? "bg-red-100 text-red-600"
                              : it.level === "MEDIUM"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {it.level}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{it.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Status: {it.status || "NEW"}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => updateStatus(it.id ?? it._id ?? "", "IN_PROGRESS")}
                        className="text-sm px-3 py-1.5 bg-yellow-400 text-gray-800 rounded-md font-medium hover:bg-yellow-500 transition-all"
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => updateStatus(it.id ?? it._id ?? "", "RESOLVED")}
                        className="text-sm px-3 py-1.5 bg-green-500 text-white rounded-md font-medium hover:bg-green-600 transition-all"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                ← Prev
              </button>
              <span>
                Page {pagination.page} / {pagination.pages}
              </span>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Incidents;
