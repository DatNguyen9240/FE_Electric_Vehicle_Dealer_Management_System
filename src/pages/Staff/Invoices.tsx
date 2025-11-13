import React from 'react';
import api from '@libs/axios';
import { Loader2, ChevronLeft, ChevronRight, Eye, Download, RefreshCw } from 'lucide-react';
import { useUi } from '../../contexts/uiContextCore';
import { useTitle } from '../../contexts';

type InvoiceItem = {
  id?: string;
  _id?: string;
  session_id?: string | null;
  user_id?: string | null;
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

  const { showToast, confirm } = useUi();
  const [selected, setSelected] = React.useState<InvoiceItem | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const { setTitle } = useTitle();

  React.useEffect(() => setTitle('Invoices'), [setTitle]);

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

  const applyFilters = () => {
    setPage(1);
    fetch(1);
  };

  const formatCurrency = (amt?: number | null, cur?: string | null) => {
    if (amt == null) return '-';
    try {
      return `${Number(amt).toLocaleString()} ${cur || ''}`.trim();
    } catch {
      return `${amt} ${cur || ''}`.trim();
    }
  };

  const renderPaymentBadge = (status?: string | null) => {
    const s = (status || '').toUpperCase();
    if (s === 'PAID') return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">PAID</span>;
    if (s === 'UNPAID') return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">UNPAID</span>;
    if (s === 'EXPIRED') return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">EXPIRED</span>;
    return <span className="px-2 py-1 rounded-full text-xs bg-gray-50 text-gray-700">{status || '-'}</span>;
  };

  const renderStatusBadge = (status?: string | null) => {
    const s = (status || '').toUpperCase();
    if (s === 'ISSUED') return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">ISSUED</span>;
    if (s === 'VOID') return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">VOID</span>;
    return <span className="px-2 py-1 rounded-full text-xs bg-gray-50 text-gray-700">{status || '-'}</span>;
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Loading invoices...
      </div>
    );

  return (
    <div className="p-5">
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
          >
            <option value="">Any</option>
            <option value="ISSUED">ISSUED</option>
            <option value="VOID">VOID</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Payment</label>
          <select
            value={filters.paymentStatus}
            onChange={(e) => setFilters(f => ({ ...f, paymentStatus: e.target.value }))}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
          >
            <option value="">Any</option>
            <option value="UNPAID">UNPAID</option>
            <option value="PAID">PAID</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">User</label>
          <input
            type="text"
            placeholder="user id"
            value={filters.userId}
            onChange={(e) => setFilters(f => ({ ...f, userId: e.target.value }))}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Session</label>
          <input
            type="text"
            placeholder="session id/ref"
            value={filters.sessionId}
            onChange={(e) => setFilters(f => ({ ...f, sessionId: e.target.value }))}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">From</label>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters(f => ({ ...f, from: e.target.value }))}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">To</label>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters(f => ({ ...f, to: e.target.value }))}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Search... (invoice id, session id)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-64"
          />
        </div>

        <div>
          <button onClick={applyFilters} className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">Apply</button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetch(page); showToast('Refreshed', 'success'); }}
            className="inline-flex items-center gap-2 px-3 py-1 border rounded text-sm"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            onClick={() => {
              // export CSV of current invoices
              try {
                const rows = invoices.map(i => ({
                  id: i.id ?? i._id,
                  session: i.session_id,
                  user: i.user_id,
                  amount: (i.meta?.billing?.totalAmount ?? i.total) ?? '',
                  currency: i.currency ?? '',
                  payment_status: i.payment_status ?? '',
                  status: i.status ?? '',
                  createdAt: i.createdAt ?? '',
                }));
                const csv = [Object.keys(rows[0] || {}).join(','), ...rows.map(r => Object.values(r).map(v => `"${String(v ?? '').replace(/"/g,'""')}"`).join(','))].join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `invoices-page-${pagination.page}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              } catch (err) {
                console.error(err);
                showToast('Failed to export CSV', 'error');
              }
            }}
            className="inline-flex items-center gap-2 px-3 py-1 border rounded text-sm"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
        <span className="text-sm text-gray-500">Total: {pagination.total.toLocaleString()} invoices</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Invoice</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Session</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">User</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Amount</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Payment</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Status</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium">Created</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">No invoices found.</td>
              </tr>
            ) : (
              invoices.map((inv, i) => (
                <tr key={inv.id ?? inv._id ?? i} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2">{inv.id ?? inv._id ?? '-'}</td>
                  <td className="px-4 py-2">{inv.session_id ?? '-'}</td>
                  <td className="px-4 py-2">{inv.user_id ?? '-'}</td>
                  <td className="px-4 py-2 text-right font-medium">{formatCurrency(inv?.meta?.billing?.totalAmount ?? inv.total, inv.currency)}</td>
                  <td className="px-4 py-2">{renderPaymentBadge(inv.payment_status)}</td>
                  <td className="px-4 py-2">{renderStatusBadge(inv.status)}</td>
                  <td className="px-4 py-2">{inv.createdAt ? new Date(inv.createdAt).toLocaleString() : '-'}</td>
                  <td className="px-4 py-2 text-center space-x-2">
                            <button
                              onClick={() => setSelected(inv)}
                              className="px-2 py-1 border rounded text-xs"
                            >
                      <span className="inline-flex items-center gap-2"><Eye size={14} />View</span>
                            </button>
                            {inv.payment_status === 'UNPAID' && (
                              <button
                                onClick={async () => {
                                  const ok = await confirm('Record onsite payment for this invoice?');
                                  if (!ok) return;
                                  try {
                                    await api.post('/staff/payments/onsite', { invoiceId: inv.id ?? inv._id, method: 'CASH' });
                                    showToast('Onsite payment recorded', 'success');
                                    fetch(page);
                                  } catch (err) {
                                    console.error(err);
                                    showToast('Failed to record payment', 'error');
                                  }
                                }}
                                className="px-2 py-1 bg-indigo-600 text-white rounded text-xs"
                              >
                                Record payment
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
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            disabled={pagination.page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="flex items-center gap-1 px-3 py-1 border rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span className="text-sm text-gray-600">Page {pagination.page} / {pagination.pages}</span>
          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            className="flex items-center gap-1 px-3 py-1 border rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Modal: invoice details */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">Invoice {selected.id ?? selected._id}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-500">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-gray-500">Session</div>
                <div>{selected.session_id ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">User</div>
                <div>{selected.user_id ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Amount</div>
                <div>{formatCurrency(selected?.meta?.billing?.totalAmount ?? selected.total, selected.currency)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Payment</div>
                <div>{selected.payment_status ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <div>{selected.status ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Created</div>
                <div>{selected.createdAt ? new Date(selected.createdAt).toLocaleString() : '-'}</div>
              </div>
            </div>

            {selected.meta?.billing && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Billing</div>
                <div className="text-xs text-gray-500">Charging</div>
                <div>{formatCurrency(selected.meta.billing.chargingAmount, selected.currency)}</div>
                <div className="text-xs text-gray-500">Idle</div>
                <div>{formatCurrency(selected.meta.billing.idleAmount, selected.currency)}</div>
                <div className="text-xs text-gray-500">Total</div>
                <div>{formatCurrency(selected.meta.billing.totalAmount, selected.currency)}</div>
              </div>
            )}

            {selected.meta?.onsitePayment && (
              <div className="mt-4 text-sm">
                <div className="font-medium">Onsite payment</div>
                <div>Method: {selected.meta.onsitePayment.method}</div>
                <div>Staff: {selected.meta.onsitePayment.staffId}</div>
                <div>Recorded: {selected.meta.onsitePayment.recordedAt ? new Date(selected.meta.onsitePayment.recordedAt).toLocaleString() : '-'}</div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2">
              {selected.payment_status === 'UNPAID' && (
                <button
                  onClick={async () => {
                    const ok = await confirm('Record onsite payment for this invoice?');
                    if (!ok) return;
                    try {
                      await api.post('/staff/payments/onsite', { invoiceId: selected.id ?? selected._id, method: 'CASH' });
                      showToast('Onsite payment recorded', 'success');
                      setSelected(null);
                      fetch(page);
                    } catch (err) {
                      console.error(err);
                      showToast('Failed to record payment', 'error');
                    }
                  }}
                  className="px-3 py-1 bg-indigo-600 text-white rounded"
                >
                  Record payment
                </button>
              )}
              {selected.pdf_url && (
                <a href={selected.pdf_url} target="_blank" rel="noreferrer" className="px-3 py-1 border rounded">PDF</a>
              )}
              <button onClick={() => setSelected(null)} className="px-3 py-1 border rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffInvoices;

