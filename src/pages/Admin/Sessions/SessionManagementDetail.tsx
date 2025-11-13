import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@libs/axios";
import { useTitle } from "@contexts";

type SessionDetail = {
  _id?: string;
  id?: string;
  status?: string | null;
  startedAt?: string | null;
  stoppedAt?: string | null;
  createdAt?: string | null;
  user?: { id?: string; name?: string; email?: string; phone?: string } | null;
  station?: { id?: string; name?: string; code?: string; address?: string; province?: string } | null;
  connector?: { id?: string; code?: string; type?: string; powerKw?: number } | null;
  booking?: { id?: string; _id?: string; vehicle?: { licensePlate?: string } } | null;
  invoice?: { id?: string; _id?: string; total?: number; payment_status?: string } | null;
  billing?: {
    chargingAmount?: number;
    idleAmount?: number;
    totalAmount?: number;
    currency?: string;
    breakdown?: {
      chargingRatePerMin?: number;
      chargingRatePerKwh?: number;
      chargingBillableMinutes?: number;
      energyKwh?: number;
      pricingMode?: string;
      idleRatePerMin?: number;
      idleBillableMinutes?: number;
    };
  } | null;
};

type GetResponse = { session: SessionDetail } | SessionDetail;

const fmt = (value?: string | null) => {
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
    return value ?? "—";
  }
};

const badgeClass = (status?: string | null) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-50 text-green-700";
    case "COMPLETED":
      return "bg-blue-50 text-blue-700";
    case "FAILED":
      return "bg-red-50 text-red-600";
    case "CANCELLED":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-50 text-gray-600";
  }
};

const SessionManagementDetail: React.FC = () => {
  const { setTitle } = useTitle();
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<SessionDetail | null>(null);
  const [invoiceId, setInvoiceId] = React.useState<string | null>(null);
  const [invoiceLoading, setInvoiceLoading] = React.useState(false);

  React.useEffect(() => {
    setTitle("Session Details");
  }, [setTitle]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!sessionId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<GetResponse>(`/admin/sessions/${sessionId}`);
        const payload = (res.data as GetResponse);
        const session = (payload && typeof payload === "object" && "session" in payload)
          ? (payload as { session: SessionDetail }).session
          : (payload as SessionDetail);
        if (!mounted) return;
        setData(session || null);
        if (session?.invoice) {
          const inv = session.invoice.id || session.invoice._id || null;
          setInvoiceId(inv);
        }
      } catch (err: unknown) {
        if (!mounted) return;
        const getErrorMessage = (e: unknown) => {
          try {
            const ae = e as { response?: { data?: { message?: string } }; message?: string };
            return ae?.response?.data?.message || ae?.message || "Unable to load session details";
          } catch {
            return "Unable to load session details";
          }
        };
        setError(getErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [sessionId]);

  React.useEffect(() => {
    if (!data) return;
    if (invoiceId) return;
    const lookup = data.invoice?.id || data.invoice?._id || data.id || data._id;
    if (!lookup) return;
    setInvoiceLoading(true);
    api
      .get<{ invoice?: { id?: string; _id?: string } } | { id?: string; _id?: string }>(`/admin/invoices/${lookup}`)
      .then((res) => {
        const payload = res.data;
        const inv =
          payload && typeof payload === "object" && "invoice" in payload
            ? (payload as { invoice?: { id?: string; _id?: string } }).invoice
            : (payload as { id?: string; _id?: string } | null);
        const id = inv?.id || inv?._id || null;
        if (id) setInvoiceId(id);
      })
      .catch(() => {
        setInvoiceId((prev) => prev);
      })
      .finally(() => setInvoiceLoading(false));
  }, [data, invoiceId]);

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
            <h2 className="text-lg font-semibold text-gray-900">Session Information</h2>
            {data?.status && (
              <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass(data.status)}`}>
                <span className="w-2 h-2 rounded-full bg-current"></span>
                {data.status}
              </span>
            )}
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-500">Session ID</div>
            <div className="font-medium">{data?.id || data?._id || "—"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">User</div>
            <div className="font-medium">{data?.user?.name || data?.user?.email || data?.user?.id || "—"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Station</div>
            <div className="font-medium">{data?.station?.name || data?.station?.code || "—"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Connector</div>
            <div className="font-medium">{data?.connector?.code || data?.connector?.type || "—"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Started At</div>
            <div className="font-medium">{fmt(data?.startedAt || data?.createdAt)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Stopped At</div>
            <div className="font-medium">{fmt(data?.stoppedAt)}</div>
          </div>
         
          <div className="md:col-span-2">
            {typeof data?.billing?.totalAmount === "number" ? (
              <div className="text-sm text-gray-500">
                Total Amount: <span className="font-bold text-2xl text-green-600">{data.billing.totalAmount.toLocaleString("vi-VN")} {data.billing.currency || "VND"}</span>
              </div>
            ) : (
              <div className="font-medium">—</div>
            )}
          </div>
          <div className="md:col-span-2">
            {invoiceId ? (
              <a
                href={`/admin/invoices/view/${invoiceId}`}
                className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                View Invoice
              </a>
            ) : invoiceLoading ? (
              <span className="text-sm text-gray-500">Checking invoice...</span>
            ) : null}
          </div>
          
        </div>
        {error && (
          <div className="px-6 pb-6 text-red-600 text-sm">{error}</div>
        )}
        {loading && (
          <div className="px-6 pb-6 text-gray-500 text-sm">Loading data...</div>
        )}
      </div>
    </div>
  );
};

export default SessionManagementDetail;


