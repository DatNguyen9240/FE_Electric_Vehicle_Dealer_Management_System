import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@libs/axios';
import { Link } from 'react-router-dom';
import { useTitle } from '@contexts';
import { ArrowLeft, Download, Printer, MapPin, Hash, Zap } from 'lucide-react';

type Invoice = {
  _id?: string;
  id?: string;
  session_id?: string;
  total?: number;
  currency?: string;
  paid_total?: number;
  payment_status?: string;
  meta?: any | null;
  user_id?: string;
  pdf_url?: string;
  issued_at?: string;
  createdAt?: string;
  due_at?: string;
  paid_at?: string;
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

const InvoiceDetail: React.FC = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { setTitle } = useTitle();
  const [data, setData] = React.useState<Invoice | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => { setTitle('Invoice'); }, [setTitle]);

  const load = React.useCallback(async () => {
    if (!invoiceId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/invoices/me/${invoiceId}`);
      // server returns { invoice: { ... } } or a flat object
      const payload = res.data;
      const invoice = payload?.invoice ? payload.invoice : payload;
      setData(invoice || null);
    } catch (err: unknown) {
      setError((err as any)?.response?.data?.message || (err as any).message || 'Unable to load invoice');
    } finally { setLoading(false); }
  }, [invoiceId]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6">
      <button className="inline-flex items-center gap-2 mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Quay lại
      </button>

      <div className="bg-white rounded-xl border p-4">
        {loading ? (
          <div className="py-8 text-center text-gray-500">Đang tải...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-600">{error}</div>
        ) : !data ? (
          <div className="py-8 text-center text-gray-500">Không tìm thấy hóa đơn</div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 items-start">
              <div>
                <div className="text-sm text-gray-500">Invoice ID</div>
                <div className="font-medium text-lg break-all">{data.id || data._id}</div>
                <div className="mt-1 text-xs text-gray-400">Issued: {fmtDate(data.issued_at || data.createdAt)}</div>
                {data.due_at && <div className="text-xs text-gray-400">Due: {fmtDate(data.due_at)}</div>}
              </div>

              <div className="text-sm text-gray-600">
                <div className="mb-1">Session</div>
                <div className="font-medium mb-2">{data.session_id ? <Link to={`/sessions/view/${data.session_id}`} className="text-blue-600 hover:underline">{data.session_id}</Link> : '—'}</div>
                <div className="text-sm text-gray-500">Receiver</div>
                <div className="font-medium break-all">{data.user_id || '—'}</div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-3xl font-extrabold text-green-600 flex items-center justify-end">
                  {fmtCurrency(data.total, data.currency)}
                </div>
                {typeof data.paid_total === 'number' && <div className="text-sm text-gray-500">Paid: <span className="font-medium text-gray-900">{fmtCurrency(data.paid_total, data.currency)}</span></div>}
                <div className="mt-3 flex items-center justify-end gap-2">
                  {data.pdf_url && (
                    <a href={data.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
                      <Download size={14} /> Tải
                    </a>
                  )}
                  <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-3 py-2 rounded border hover:bg-gray-50">
                    <Printer size={14} /> In
                  </button>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-gray-50 text-xs text-gray-700 mt-2">{data.payment_status || '—'}</div>
              </div>
            </div>

            
            {/* Extra details from meta/billing */}
            {data.meta && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-semibold mb-2">Chi tiết thanh toán</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Station / Connector</div>
                    <div className="font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400"/>
                      <span>{data.meta.stationId || '—'}</span>
                      <Hash className="w-4 h-4 text-gray-400"/>
                      <span>{data.meta.connectorId || '—'}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Wallet settlement</div>
                    <div className="font-medium">{data.meta?.walletSettlement?.status || '—'}</div>
                    {data.meta?.walletSettlement?.transactionId && (
                      <div className="text-xs text-gray-500">Txn: {data.meta.walletSettlement.transactionId}</div>
                    )}
                  </div>
                </div>

                {/* Billing breakdown */}
                {data.meta?.billing && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium">Billing breakdown</h4>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-gray-500">Charging</div>
                        <div className="font-semibold">{fmtCurrency(data.meta.billing.chargingAmount, data.currency)}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-gray-500">Idle</div>
                        <div className="font-semibold">{fmtCurrency(data.meta.billing.idleAmount, data.currency)}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-gray-500 flex items-center gap-1"><Zap className="w-4 h-4 text-yellow-500" /> Energy</div>
                        <div className="font-semibold">{data.meta.billing.breakdown?.energyKwh ?? '—'} kWh</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-gray-500">Total</div>
                        <div className="font-semibold">{fmtCurrency(data.meta.billing.totalAmount, data.currency)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Membership comparison */}
                {data.meta?.membership && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium">Membership</h4>
                    <div className="text-sm text-gray-600">{data.meta.membership.planName} · {String(data.meta.membership.pricingMode || '').toUpperCase()}</div>
                    {data.meta.membership.savings && (
                      <div className="mt-2 text-sm text-green-700">Tiết kiệm: {fmtCurrency(data.meta.membership.savings.total, data.currency)}</div>
                    )}
                    {Array.isArray(data.meta.membership.adjustments) && (
                      <div className="mt-2">
                        <h5 className="text-sm font-medium">Adjustments</h5>
                        <ul className="text-sm list-disc list-inside text-gray-600">
                          {data.meta.membership.adjustments.map((a: any) => (
                            <li key={a._id || a.key}>{a.label}: {a.unit?.includes('VND') ? fmtCurrency(a.discountedValue ?? a.baseValue, data.currency) : (a.discountedValue ?? a.baseValue)} {a.unit?.includes('VND') ? '' : ` ${a.unit}`}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetail;
