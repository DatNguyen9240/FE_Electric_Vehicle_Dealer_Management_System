import React from 'react';
import { Link } from 'react-router-dom';
import api from '@libs/axios';
import { Loader2, ChevronLeft, ChevronRight, Search, ArrowUpDown } from 'lucide-react';
import { useUi } from '../../contexts/uiContextCore';
import { useTitle } from '../../contexts';

type InvoiceItem = {
  id?: string;
  _id?: string;
  session_id?: string | null;
  user_id?: string | null;
  user?: { id?: string; name?: string; fullName?: string; email?: string; phone?: string } | null;
  total?: number | null;
  currency?: string | null;
  payment_status?: string | null;
  status?: string | null;
  createdAt?: string | null;
  paid_at?: string | null;
  paid_total?: number | null;
  pdf_url?: string | null;
  meta?: any;
};

const StaffInvoices: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [invoices, setInvoices] = React.useState<InvoiceItem[]>([]);
  const [page, setPage] = React.useState<number>(1);
  const [limit] = React.useState<number>(20);
  const [pagination, setPagination] = React.useState({ page: 1, limit: 20, total: 0, pages: 0 });

  const [filters, setFilters] = React.useState({
    status: '',
    paymentStatus: '',
    userId: '',
    sessionId: '',
    from: '',
    to: '',
    search: '',
    sort: '-createdAt',
  });

  const { showToast } = useUi();
  const [selected, setSelected] = React.useState<InvoiceItem | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const { setTitle } = useTitle();
  React.useEffect(() => setTitle('Invoices'), [setTitle]);

  const getUserName = React.useCallback((invoice: InvoiceItem) => {
    // Use user object from API
    if (invoice.user) {
      return invoice.user.name || invoice.user.fullName || invoice.user.email || "—";
    }
    // Fallback to user_id if user object not available
    return invoice.user_id || "—";
  }, []);

  const fetch = React.useCallback((p: number) => {
    setLoading(true);
    const params: Record<string, unknown> = { page: p, limit };
    if (filters.status) params.status = filters.status;
    if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
    if (filters.userId) params.userId = filters.userId;
    if (filters.sessionId) params.sessionId = filters.sessionId;
    if (filters.search) params.search = filters.search;
    if (filters.sort) params.sort = filters.sort;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;

    api
      .get('/staff/invoices', { params })
      .then((res) => {
        const d = res.data as any;
        if (d && typeof d === 'object') {
          const pag = d.pagination;
          if (pag) {
            setPagination({
              page: Number(pag.page) || p,
              limit: Number(pag.limit) || limit,
              total: Number(pag.total) || 0,
              pages: Number(pag.pages) || 0,
            });
          }
          const items = Array.isArray(d.items) ? d.items : d.data ?? d.invoices ?? [];
          setInvoices(items || []);
          return;
        }
        if (Array.isArray(d)) setInvoices(d);
        else setInvoices([]);
      })
      .catch((err: unknown) => {
        console.error(err);
        showToast('Failed to load invoices', 'error');
        setInvoices([]);
      })
      .finally(() => setLoading(false));
  }, [filters, limit, showToast]);

  React.useEffect(() => {
    fetch(page);
  }, [fetch, page]);

  // debounce search input into filters.search
  React.useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchTerm }));
    }, 450);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const formatCurrency = (value?: number | null, currency = "VND") => {
    if (typeof value !== "number" || value == null) return "—";
    try {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(value);
    } catch {
      return `${value.toLocaleString("vi-VN")} ${currency}`;
    }
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

  const badgeClass = (paymentStatus?: string | null) => {
    switch (paymentStatus) {
      case "PAID":
        return "bg-green-50 text-green-700";
      case "UNPAID":
        return "bg-yellow-50 text-yellow-700";
      case "EXPIRED":
        return "bg-red-50 text-red-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Loading invoices...
      </div>
    );

  return (
    <div className="">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              placeholder="Search invoice/session/user"
              className="border border-[#333333] rounded-lg px-7 py-1 w-72 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333]"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters(f => ({ ...f, from: e.target.value }))}
              className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
            />
            <span className="text-sm text-gray-500">to</span>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters(f => ({ ...f, to: e.target.value }))}
              className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Payment status</label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => {
                setFilters(f => ({ ...f, paymentStatus: e.target.value }));
              }}
              className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
            >
              <option value="">All</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PAID">Paid</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>
      </div>
      <div className="border-b mb-4" />

      <div className="bg-white rounded-xl border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Invoice List</h2>
            <span className="text-sm text-gray-500">{pagination.total} results</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => {
                    const newSort = filters.sort === "total" ? "-total" : filters.sort === "-total" ? "total" : "-total";
                    setFilters(f => ({ ...f, sort: newSort }));
                  }} className="inline-flex items-center gap-1">
                    Total Amount <ArrowUpDown size={14} className="text-gray-400" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => {
                    const newSort = filters.sort === "createdAt" ? "-createdAt" : filters.sort === "-createdAt" ? "createdAt" : "-createdAt";
                    setFilters(f => ({ ...f, sort: newSort }));
                  }} className="inline-flex items-center gap-1">
                    Created At <ArrowUpDown size={14} className="text-gray-400" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading data...</td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No invoices</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id || inv._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {inv.session_id ? (
                        <Link
                          to={`/staff/sessions/${inv.session_id}/invoice`}
                          className="text-blue-600 hover:underline"
                          title="View details"
                        >
                          {inv.id || inv._id}
                        </Link>
                      ) : (
                        <span className="text-gray-700">{inv.id || inv._id}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {inv.session_id || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {getUserName(inv)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatCurrency(inv?.meta?.billing?.totalAmount ?? inv.total, inv.currency || "VND")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                      <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass(inv.payment_status)}`}>
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        {inv.payment_status || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDateTime(inv.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {inv.session_id ? (
                        <Link
                          to={`/staff/sessions/${inv.session_id}/invoice`}
                          className="text-blue-600 hover:underline"
                          title="View details"
                        >
                          View
                        </Link>
                      ) : (
                        <button
                          onClick={() => setSelected(inv)}
                          className="text-blue-600 hover:underline"
                          title="View details"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))
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

      {/* Modal: invoice details */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Invoice Information</h2>
                {selected.payment_status && (
                  <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                    selected.payment_status === "PAID" 
                      ? "bg-green-50 text-green-700"
                      : selected.payment_status === "UNPAID"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-red-50 text-red-600"
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    {selected.payment_status}
                  </span>
                )}
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500">Invoice ID</div>
                <div className="font-medium">{selected.id || selected._id || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Session</div>
                <div className="font-medium">{selected.session_id || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">User</div>
                <div className="font-medium">{selected ? getUserName(selected) : "—"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Created At</div>
                <div className="font-medium">{formatDateTime(selected.createdAt ?? undefined)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Amount</div>
                <div className="font-bold text-xl text-green-600">
                  {formatCurrency(selected?.meta?.billing?.totalAmount ?? selected.total ?? null, selected.currency ?? "VND")}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Paid Amount</div>
                <div className="font-medium">
                  {typeof selected.paid_total === "number"
                    ? formatCurrency(selected.paid_total, selected.currency ?? "VND")
                    : "—"}
                </div>
              </div>
              {selected.meta?.billing && (
                <>
                  <div>
                    <div className="text-sm text-gray-500">Charging Amount</div>
                    <div className="font-medium">
                      {formatCurrency(selected.meta.billing.chargingAmount ?? null, selected.currency ?? "VND")}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Idle Amount</div>
                    <div className="font-medium">
                      {formatCurrency(selected.meta.billing.idleAmount ?? null, selected.currency ?? "VND")}
                    </div>
                  </div>
                </>
              )}
              <div>
                <div className="text-sm text-gray-500">Due Date</div>
                <div className="font-medium">
                  {selected.meta?.due_at
                    ? formatDateTime(selected.meta.due_at)
                    : "—"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Paid At</div>
                <div className="font-medium">
                  {selected.paid_at ? formatDateTime(selected.paid_at) : "—"}
                </div>
              </div>
            </div>

            {selected.meta?.onsitePayment && (
              <div className="border-t px-6 py-4">
                <div className="text-sm font-medium mb-3">Onsite Payment</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-gray-500">Method</div>
                    <div className="font-medium">{selected.meta.onsitePayment.method || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Staff ID</div>
                    <div className="font-medium">{selected.meta.onsitePayment.staffId || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Recorded At</div>
                    <div className="font-medium">
                      {selected.meta.onsitePayment.recordedAt
                        ? formatDateTime(selected.meta.onsitePayment.recordedAt)
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selected.pdf_url && (
              <div className="border-t px-6 py-4">
                <a
                  href={selected.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
                >
                  View PDF
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffInvoices;

