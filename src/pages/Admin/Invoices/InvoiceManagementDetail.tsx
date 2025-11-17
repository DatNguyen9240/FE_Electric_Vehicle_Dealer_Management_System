import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@libs/axios";
import { useTitle } from "@contexts";

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

type GetResponse = { invoice: InvoiceDetail } | InvoiceDetail;

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

const InvoiceManagementDetail: React.FC = () => {
  const { setTitle } = useTitle();
  const { invoiceId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<InvoiceDetail | null>(null);

  // No edit form on detail page; edits are done in InvoiceUpdate

  React.useEffect(() => {
    setTitle("Invoice Details");
  }, [setTitle]);

  const loadInvoice = React.useCallback(async () => {
    if (!invoiceId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<GetResponse>(`/admin/invoices/${invoiceId}`);
      const payload = res.data;
      const invoice =
        payload && typeof payload === "object" && "invoice" in payload
          ? (payload as { invoice: InvoiceDetail }).invoice
          : (payload as InvoiceDetail);
      setData(invoice);
      // nothing else
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
  }, [invoiceId]);

  React.useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  // No submit handler here

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 mb-4"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="bg-white rounded-xl border">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Invoice Information</h2>
            {data?.payment_status && (
              <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {data.payment_status}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center text-gray-500">Loading data...</div>
        ) : error ? (
          <div className="px-6 py-10 text-center text-red-600">{error}</div>
        ) : !data ? (
          <div className="px-6 py-10 text-center text-gray-500">No data</div>
        ) : (
          <>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500">Invoice ID</div>
                <div className="font-medium">{data.id || data._id || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Session</div>
                <div className="font-medium">{data.session_id || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">User</div>
                <div className="font-medium">{data.user_id || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Created At</div>
                <div className="font-medium">{fmtDateTime(data.createdAt || data.issued_at)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Amount</div>
                <div className="font-bold text-xl text-green-600">{fmtCurrency(data.total, data.currency)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Paid Amount</div>
                <div className="font-medium">
                  {typeof data.paid_total === "number" ? fmtCurrency(data.paid_total, data.currency) : "—"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Due Date</div>
                <div className="font-medium">{fmtDateTime(data.due_at)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Paid At</div>
                <div className="font-medium">{fmtDateTime(data.paid_at)}</div>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex items-center gap-3">
              <a
                href={`/admin/invoices/update/${data.id || data._id}`}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                Update Invoice
              </a>
              {data.session_id && (
                <a
                  href={`/admin/sessions/view/${data.session_id}`}
                  className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
                >
                  View Session
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InvoiceManagementDetail;


