import React from "react";
import api from "@libs/axios";
import { Loader2, Play, Square, ChevronLeft, ChevronRight, Eye, RefreshCw } from "lucide-react";
import { useUi } from "../../contexts/uiContextCore";
import { useTitle } from "../../contexts";

type Session = {
  id?: string;
  _id?: string;
  user?: { name?: string; fullName?: string } | null;
  customerName?: string | null;
  bookingRef?: string | null;
  bookingId?: string | null;
  booking?: { id?: string } | null;
  station?: { name?: string } | null;
  stationName?: string | null;
  connector?: { code?: string; name?: string } | null;
  startedAt?: string | null;
  status?: string | null;
};

const ChargingSessions: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [page, setPage] = React.useState<number>(1);
  const [limit] = React.useState<number>(20);
  const [pagination, setPagination] = React.useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [connectors, setConnectors] = React.useState<Array<{ id?: string; code?: string }>>([]);
  const [stations, setStations] = React.useState<Array<{ id?: string; name?: string }>>([]);
  const [filters, setFilters] = React.useState({ connectorId: '', stationId: '', status: '', search: '', sort: '-startedAt' });
  const [paymentFilter, setPaymentFilter] = React.useState<string>('');

  const { showToast, confirm } = useUi();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [preview, setPreview] = React.useState<any | null>(null);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [note, setNote] = React.useState<string>('');
  const [invoiceStatusMap, setInvoiceStatusMap] = React.useState<Record<string, string>>({});

    const { setTitle } = useTitle();
    React.useEffect(() => {
      setTitle("Charging Sessions");
    }, [setTitle]);

  const fetch = React.useCallback((p: number) => {
    setLoading(true);
    const params: Record<string, unknown> = { page: p, limit };
    if (filters.connectorId) params.connectorId = filters.connectorId;
    if (filters.stationId) params.stationId = filters.stationId;
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    if (filters.sort) params.sort = filters.sort;
    api
      .get("/staff/sessions", { params })
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

          const tryArrays = ["items", "data", "sessions"] as const;
          for (const key of tryArrays) {
            const val = rec[key];
            if (Array.isArray(val)) {
              const arr = val as Session[];
              setSessions(arr);
              // fetch invoice statuses for completed sessions
              const completedIds = arr
                .filter((s) => s.status === 'COMPLETED')
                .map((s) => s.id ?? s._id)
                .filter(Boolean) as string[];
              if (completedIds.length) fetchInvoiceStatuses(completedIds);
              return;
            }
          }
        }
        if (Array.isArray(d)) {
          const arr = d as Session[];
          setSessions(arr);
          const completedIds = arr
            .filter((s) => s.status === 'COMPLETED')
            .map((s) => s.id ?? s._id)
            .filter(Boolean) as string[];
          if (completedIds.length) fetchInvoiceStatuses(completedIds);
          return;
        }
        setSessions([]);
      })
      .catch((err: unknown) => {
        console.error(err);
        setSessions([]);
      })
      .finally(() => setLoading(false));
  }, [limit]);

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

  // load connectors and stations for filters
  React.useEffect(() => {
    api
      .get('/connectors', { params: { status: 'IDLE', limit: 200 } })
      .then((res) => {
        const d = res.data as any;
        const list = Array.isArray(d) ? d : d?.items ?? d?.connectors ?? d?.data ?? [];
        if (Array.isArray(list)) setConnectors(list.map((c: any) => ({ id: c._id ?? c.id, code: c.code })));
      })
      .catch(() => {});

    api
      .get('/stations', { params: { status: 'ONLINE', limit: 200 } })
      .then((res) => {
        const d = res.data as any;
        const list = Array.isArray(d) ? d : d?.stations ?? d?.items ?? d?.data ?? [];
        if (Array.isArray(list)) setStations(list.map((s: any) => ({ id: s._id ?? s.id, name: s.name })));
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    fetch(page);
  }, [fetch, page]);

  // debounce search input into filters.search
  React.useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchTerm }));
      fetch(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const applyFilters = () => {
    setPage(1);
    fetch(1);
  };

  const getDisplayedSessions = () => {
    if (!paymentFilter) return sessions;
    return sessions.filter((s) => {
      const sid = s.id ?? s._id;
      if (!sid) return false;
      return invoiceStatusMap[sid] === paymentFilter;
    });
  };

  const stopSession = async (id?: string) => {
    if (!id) return showToast("Missing session id", "error");
    const ok = await confirm("Stop this session?");
    if (!ok) return;
    api
      .post(`/sessions/${id}/stop`)
      .then(() => {
        showToast("Session stopped", "success");
        fetch(page);
      })
      .catch(() => showToast("Failed to stop session", "error"));
  };

  

  const startSession = async (bookingId?: string) => {
    const payload = { bookingId, paymentMethod: "ONSITE" };
    api
      .post(`/sessions/start`, payload)
      .then(() => {
        showToast("Session started", "success");
        fetch(page);
      })
      .catch(() => showToast("Failed to start session", "error"));
  };

  const openInvoicePreview = async (sessionId?: string) => {
    if (!sessionId) return showToast('Missing session id', 'error');
    setPreviewLoading(true);
    try {
      const res = await api.get(`/staff/sessions/${sessionId}/invoice`);
      const d = res.data as any;
      setPreview({ session: d.session, invoice: d.invoice, sessionId });
      setNote('');
    } catch (err) {
      console.error(err);
      showToast('Failed to load invoice preview', 'error');
    } finally {
      setPreviewLoading(false);
    }
  };

  const recordFromPreview = async () => {
    if (!preview?.sessionId) return showToast('Missing session id', 'error');
    try {
      await api.post('/staff/payments/onsite', { sessionId: preview.sessionId, method: 'CASH', note: note || undefined });
      showToast('Onsite payment recorded', 'success');
      // mark invoice as paid in local map so UI updates
      setInvoiceStatusMap((m) => ({ ...(m || {}), [preview.sessionId]: 'PAID' }));
      setPreview(null);
      fetch(page);
    } catch (err) {
      console.error(err);
      showToast('Failed to record payment', 'error');
    }
  };

  const getStatusBadge = (status?: string | null) => {
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

  const formatCurrency = (amt?: number | null, cur?: string | null) => {
    if (amt == null) return '-';
    try {
      return `${Number(amt).toLocaleString()} ${cur || ''}`.trim();
    } catch {
      return `${amt} ${cur || ''}`.trim();
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
        <div className="mb-4 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Connector</label>
            <select
              value={filters.connectorId}
              onChange={(e) => setFilters(f => ({ ...f, connectorId: e.target.value }))}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
            >
              <option value="">All</option>
              {connectors.map(c => (
                <option key={c.id} value={c.id}>{c.code}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Station</label>
            <select
              value={filters.stationId}
              onChange={(e) => setFilters(f => ({ ...f, stationId: e.target.value }))}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
            >
              <option value="">All</option>
              {stations.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
            >
              <option value="">Any</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="FAILED">FAILED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Payment</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
            >
              <option value="">All</option>
              <option value="UNPAID">UNPAID</option>
              <option value="PAID">PAID</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sort</label>
            <select
              value={filters.sort}
              onChange={(e) => setFilters(f => ({ ...f, sort: e.target.value }))}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
            >
              <option value="-startedAt">Newest</option>
              <option value="startedAt">Oldest</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { fetch(page); showToast('Refreshed', 'success'); }}
              className="px-3 py-1 border rounded text-sm inline-flex items-center gap-2"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          <div>
            <button onClick={applyFilters} className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">Apply</button>
          </div>
        </div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">
          Total: {pagination.total.toLocaleString()} sessions
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Customer</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">BookingID</th>
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
              getDisplayedSessions().map((s: Session, i: number) => (
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
                    ) : s.status === "COMPLETED" ? (
                      (() => {
                        const sid = s.id ?? s._id;
                        const isUnpaid = sid ? invoiceStatusMap[sid] === 'UNPAID' : false;
                        return isUnpaid ? (
                          <button
                            onClick={() => openInvoicePreview(sid)}
                            className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-xs transition"
                          >
                            <Eye size={14} />
                            Record payment
                          </button>
                        ) : (
                          <span className="text-gray-500 text-xs">{sid && invoiceStatusMap[sid] ? invoiceStatusMap[sid] : '—'}</span>
                        );
                      })()
                    ) : (s.booking?.id || s.bookingId) ? (
                      <button
                        onClick={() => startSession(s.booking?.id ?? s.bookingId ?? undefined)}
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
      {/* Invoice preview / record modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[92%] max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Invoice Preview</h3>
              <button onClick={() => setPreview(null)} className="text-gray-500">Close</button>
            </div>

            {previewLoading ? (
              <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Loading...</div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500">Session</div>
                    <div>{preview.session?.id ?? preview.session?._id ?? '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Invoice</div>
                    <div>{preview.invoice?.id ?? preview.invoice?._id ?? '-'}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">Billing</div>
                  <div className="flex gap-4">
                    <div>Charging: {formatCurrency(preview.invoice?.meta?.billing?.chargingAmount, preview.invoice?.currency)}</div>
                    <div>Idle: {formatCurrency(preview.invoice?.meta?.billing?.idleAmount, preview.invoice?.currency)}</div>
                    <div className="font-medium">Total: {formatCurrency(preview.invoice?.meta?.billing?.totalAmount ?? preview.invoice?.total, preview.invoice?.currency)}</div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Note (optional)</label>
                  <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 mt-1 text-sm" />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => setPreview(null)} className="px-3 py-1 border rounded">Close</button>
                  <button onClick={recordFromPreview} className="px-3 py-1 bg-indigo-600 text-white rounded">Record payment</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChargingSessions;
