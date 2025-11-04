import React from "react";
import api from "@libs/axios";

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

  const fetch = React.useCallback((p: number = page) => {
    setLoading(true);
    api
      .get("/staff/incidents", { params: { page: p, limit } })
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

          const tryArrays = ["items", "data", "incidents"] as const;
          for (const key of tryArrays) {
            const val = rec[key];
            if (Array.isArray(val)) return setList(val as Incident[]);
          }
        }
        if (Array.isArray(d)) return setList(d as Incident[]);
        setList([]);
      })
      .catch((err: unknown) => {
        console.error(err);
        setList([]);
      })
      .finally(() => setLoading(false));
  }, [limit, page]);

  React.useEffect(() => {
    fetch(page);
  }, [fetch, page]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form };
    api
      .post("/staff/incidents", payload)
      .then(() => {
        alert("Incident reported");
        setForm({ stationId: "", description: "", level: "LOW" });
        fetch(page);
      })
      .catch((err: unknown) => {
        console.error(err);
        alert("Failed to report");
      });
  };

  const updateStatus = (id: string, status: string) => {
    api
      .patch(`/staff/incidents/${id}/status`, { status })
      .then(() => fetch(page))
      .catch((err: unknown) => {
        console.error(err);
        alert("Failed to update");
      });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Incidents</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-medium mb-2">Report Incident</h3>
          <form onSubmit={submit} className="space-y-2">
            <input placeholder="stationId" value={form.stationId} onChange={(e) => setForm(f => ({...f, stationId: e.target.value}))} className="w-full border p-2 rounded" />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm(f => ({...f, description: e.target.value}))} className="w-full border p-2 rounded" />
            <select value={form.level} onChange={(e) => setForm(f => ({...f, level: e.target.value}))} className="w-full border p-2 rounded">
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
            <div className="flex justify-end">
              <button className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
            </div>
          </form>
        </div>

        <div>
          <div className="bg-white p-4 rounded shadow mb-2">
            <h3 className="font-medium">Incident List</h3>
              {loading ? (
                <div>Loading...</div>
              ) : !Array.isArray(list) || list.length === 0 ? (
                <div>
                  <div className="p-2 text-sm text-gray-500">No incidents found.</div>
                  {pagination.pages > 1 && (
                    <div className="mt-2 flex items-center gap-2">
                      <button disabled={pagination.page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded">Previous</button>
                      <div className="text-sm text-gray-600">Page {pagination.page} / {pagination.pages}</div>
                      <button disabled={pagination.page >= pagination.pages} onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} className="px-3 py-1 border rounded">Next</button>
                    </div>
                  )}
                </div>
              ) : (
                <ul className="space-y-2 mt-2">
                  {list.map((it: Incident) => (
                    <li key={it.id ?? it._id} className="p-2 border rounded flex justify-between items-start">
                      <div>
                        <div className="font-medium">{it.station?.id ?? it.stationId} — {it.level}</div>
                        <div className="text-sm text-gray-600">{it.description}</div>
                        <div className="text-xs text-gray-400">{it.status}</div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button className="text-sm bg-yellow-400 px-2 py-1 rounded" onClick={() => updateStatus(it.id ?? it._id ?? "", 'IN_PROGRESS')}>In Progress</button>
                        <button className="text-sm bg-green-500 text-white px-2 py-1 rounded" onClick={() => updateStatus(it.id ?? it._id ?? "", 'RESOLVED')}>Resolve</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Incidents;
