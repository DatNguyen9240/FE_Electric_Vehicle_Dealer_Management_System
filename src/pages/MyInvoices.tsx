import React from 'react';
import api from '@libs/axios';
import { useTitle } from '@contexts';
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Download, Search } from 'lucide-react';

type InvoiceItem = {
  _id?: string;
  id?: string;
  session_id?: string;
  total?: number;
  currency?: string;
  payment_status?: string;
  createdAt?: string;
  pdf_url?: string | null;
};

const fmtDate = (v?: string) => {
  if (!v) return '—';
  try { return new Intl.DateTimeFormat('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(v)); }
  catch { return v; }
};

const fmtCurrency = (value?: number, currency = 'VND') => {
  if (typeof value !== 'number') return '—';
  try { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(value); } catch { return String(value) + ' ' + currency; }
};

const badgeClass = (status?: string) => {
  switch ((status || '').toUpperCase()) {
    case 'PAID': return 'bg-green-50 text-green-700';
    case 'UNPAID': return 'bg-yellow-50 text-yellow-700';
    case 'EXPIRED': return 'bg-red-50 text-red-600';
    default: return 'bg-gray-50 text-gray-700';
  }
};

const MyInvoices: React.FC = () => {
  const { setTitle } = useTitle();
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pages, setPages] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => { setTitle('My Invoices'); }, [setTitle]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/invoices/me', { params: { page, limit, search: query || undefined } });
      const body = res.data || {};
      setInvoices(body.items || []);
      setPages(body.pagination?.pages || 0);
    } catch (err: unknown) {
      setError((err as any)?.response?.data?.message || (err as any)?.message || 'Failed to load invoices');
    } finally { setLoading(false); }
  }, [page, limit, query]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-semibold">Hóa đơn của tôi</h1>
        <span className="text-sm text-gray-500">Danh sách các hoá đơn/sổ tiền bạn đã thanh toán</span>
      </div>
      <div className="bg-white rounded-xl border p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              className="pl-9 pr-3 py-1 border rounded-lg"
              placeholder="Tìm kiếm theo invoice id hoặc session id"
              value={query}
              onChange={(e) => { setPage(1); setQuery(e.target.value); }}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm text-gray-500">Mã hóa đơn</th>
                <th className="px-4 py-2 text-left text-sm text-gray-500">Phiên</th>
                <th className="px-4 py-2 text-left text-sm text-gray-500">Tổng</th>
                <th className="px-4 py-2 text-left text-sm text-gray-500">Trạng thái</th>
                <th className="px-4 py-2 text-left text-sm text-gray-500">Ngày tạo</th>
                <th className="px-4 py-2 text-left text-sm text-gray-500">Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">Đang tải...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-red-600">{error}</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">Không tìm thấy hóa đơn</td></tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv._id || inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm"><Link to={`/my-invoices/view/${inv.id || inv._id}`} className="text-blue-600 hover:underline">{inv.id || inv._id}</Link></td>
                    <td className="px-4 py-3 text-sm">{inv.session_id || '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{fmtCurrency(inv.total, inv.currency)}</td>
                    <td className="px-4 py-3 text-sm"><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${badgeClass(inv.payment_status)}`}>{inv.payment_status || '—'}</span></td>
                    <td className="px-4 py-3 text-sm">{fmtDate(inv.createdAt)}</td>
                    <td className="px-4 py-3 text-sm">
                      {inv.pdf_url ? (
                        <a href={inv.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100">
                          <Download size={16} /> Tải
                        </a>
                      ) : (
                        <Link to={`/my-invoices/view/${inv.id || inv._id}`} className="text-blue-600 hover:underline">Xem</Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="pt-4 flex items-center justify-between">
          <div></div>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded">Prev</button>
            <span className="px-3 py-1">Page {page} / {Math.max(1, pages)}</span>
            <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyInvoices;
