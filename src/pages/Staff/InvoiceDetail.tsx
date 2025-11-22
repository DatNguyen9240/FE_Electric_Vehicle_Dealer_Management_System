import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@libs/axios";
import { useTitle } from "../../contexts";

type InvoiceDetail = {
  _id?: string;
  id?: string;
  session_id?: string;
  user_id?: string;
  total?: number;
  currency?: string;
  issued_at?: string;
  due_at?: string;
  paid_at?: string;
  paid_total?: number;
  payment_status?: string;
  status?: string;
  meta?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
};

type SessionDetail = {
  id?: string;
  _id?: string;
  userId?: string;
  user?: { id?: string; name?: string; email?: string; phone?: string } | null;
};

type GetResponse = {
  invoice: InvoiceDetail;
  session: SessionDetail;
};

const fmtDateTime = (value?: string) => {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const fmtCurrency = (value?: number, currency = "VND") => {
  if (typeof value !== "number") return "—";
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

const StaffInvoiceDetail: React.FC = () => {
  const { setTitle } = useTitle();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [invoice, setInvoice] = React.useState<InvoiceDetail | null>(null);
  const [session, setSession] = React.useState<SessionDetail | null>(null);

  React.useEffect(() => {
    setTitle("Invoice Details");
  }, [setTitle]);

  const loadInvoice = React.useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<GetResponse>(`/staff/sessions/${sessionId}/invoice`);
      setInvoice(res.data.invoice);
      setSession(res.data.session);
    } catch (err: unknown) {
      const getErrorMessage = (e: unknown) => {
        try {
          const ae = e as { response?: { data?: { message?: string } }; message?: string };
          return ae?.response?.data?.message || ae?.message || "Unable to load invoice";
        } catch {
          return "Unable to load invoice";
        }
      };
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  React.useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  return (
    <div className="">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 mb-4 hover:text-blue-600"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="bg-white rounded-xl border">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Invoice Information</h2>
            {invoice?.payment_status && (
              <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                invoice.payment_status === "PAID" 
                  ? "bg-green-50 text-green-700"
                  : invoice.payment_status === "UNPAID"
                  ? "bg-yellow-50 text-yellow-700"
                  : "bg-red-50 text-red-600"
              }`}>
                <span className="w-2 h-2 rounded-full bg-current"></span>
                {invoice.payment_status}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center text-gray-500">Loading data...</div>
        ) : error ? (
          <div className="px-6 py-10 text-center text-red-600">{error}</div>
        ) : !invoice ? (
          <div className="px-6 py-10 text-center text-gray-500">No data</div>
        ) : (
          <>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500">Invoice ID</div>
                <div className="font-medium">{invoice.id || invoice._id || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Session</div>
                <div className="font-medium">{session?.id || session?._id || sessionId || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">User</div>
                <div className="font-medium">
                  {session?.user?.name || session?.user?.email || session?.userId || "—"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Created At</div>
                <div className="font-medium">{fmtDateTime(invoice.createdAt || invoice.issued_at)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Amount</div>
                <div className="font-bold text-xl text-green-600">
                  {fmtCurrency(
                    (invoice.meta as any)?.billing?.totalAmount ?? invoice.total,
                    invoice.currency
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Paid Amount</div>
                <div className="font-medium">
                  {typeof invoice.paid_total === "number"
                    ? fmtCurrency(invoice.paid_total, invoice.currency)
                    : "—"}
                </div>
              </div>
              {(invoice.meta as any)?.billing && (
                <>
                  <div>
                    <div className="text-sm text-gray-500">Charging Amount</div>
                    <div className="font-medium">
                      {fmtCurrency((invoice.meta as any).billing.chargingAmount, invoice.currency)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Idle Amount</div>
                    <div className="font-medium">
                      {fmtCurrency((invoice.meta as any).billing.idleAmount, invoice.currency)}
                    </div>
                  </div>
                </>
              )}
              <div>
                <div className="text-sm text-gray-500">Due Date</div>
                <div className="font-medium">{fmtDateTime(invoice.due_at)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Paid At</div>
                <div className="font-medium">{fmtDateTime(invoice.paid_at)}</div>
              </div>
            </div>

            {(invoice.meta as any)?.onsitePayment && (
              <div className="border-t px-6 py-4">
                <div className="text-sm font-medium mb-3">Onsite Payment</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-gray-500">Method</div>
                    <div className="font-medium">{(invoice.meta as any).onsitePayment.method || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Staff ID</div>
                    <div className="font-medium">{(invoice.meta as any).onsitePayment.staffId || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Recorded At</div>
                    <div className="font-medium">
                      {(invoice.meta as any).onsitePayment.recordedAt
                        ? fmtDateTime((invoice.meta as any).onsitePayment.recordedAt)
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {sessionId && (
              <div className="border-t px-6 py-4">
                <Link
                  to={`/staff/sessions`}
                  className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50 inline-block"
                >
                  Back to Sessions
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StaffInvoiceDetail;

