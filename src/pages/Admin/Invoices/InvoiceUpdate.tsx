import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@libs/axios";
import { useTitle } from "@contexts";

const InvoiceUpdate: React.FC = () => {
  const { setTitle } = useTitle();
  const { invoiceId } = useParams();
  const navigate = useNavigate();

  const [id, setId] = React.useState<string>(invoiceId || "");
  const [status, setStatus] = React.useState<string>("");
  const [paymentStatus, setPaymentStatus] = React.useState<string>("");
  const [dueAt, setDueAt] = React.useState<string>("");
  const [paidAt, setPaidAt] = React.useState<string>("");
  const [paidTotal, setPaidTotal] = React.useState<string>("");
  const [currency, setCurrency] = React.useState<string>("VND");
  const [meta, setMeta] = React.useState<string>("");
  const [submitting, setSubmitting] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setTitle("Update Invoice");
  }, [setTitle]);

  const hydrateFromInvoice = (invoice: Record<string, unknown>) => {
    setStatus((invoice.status as string) || "");
    setPaymentStatus((invoice.payment_status as string) || "");
    setCurrency((invoice.currency as string) || "VND");
    const due = invoice.due_at as string | undefined;
    setDueAt(due ? due.slice(0, 16) : "");
    const paidAtValue = invoice.paid_at as string | undefined;
    setPaidAt(paidAtValue ? paidAtValue.slice(0, 16) : "");
    const paid = invoice.paid_total;
    setPaidTotal(typeof paid === "number" ? String(paid) : "");
    setMeta(
      invoice.meta ? JSON.stringify(invoice.meta, null, 2) : ""
    );
  };

  const loadInvoice = React.useCallback(
    async (targetId?: string) => {
      const lookupId = targetId || id;
      if (!lookupId.trim()) {
        setMessage("Please enter invoice ID to load data.");
        return;
      }
      setLoading(true);
      setMessage(null);
      try {
        const res = await api.get<{ invoice: Record<string, unknown> } | Record<string, unknown>>(
          `/admin/invoices/${encodeURIComponent(lookupId)}`
        );
        const payload = res.data;
        const invoice =
          payload && typeof payload === "object" && "invoice" in payload
            ? (payload as { invoice: Record<string, unknown> }).invoice
            : (payload as Record<string, unknown>);
        hydrateFromInvoice(invoice);
        setMessage("Invoice data loaded.");
      } catch (err: unknown) {
        const getErrorMessage = (e: unknown) => {
          try {
            const ae = e as { response?: { data?: { message?: string } }; message?: string };
            return ae?.response?.data?.message || ae?.message || "Unable to load invoice";
          } catch {
            return "Unable to load invoice";
          }
        };
        setMessage(getErrorMessage(err));
      } finally {
        setLoading(false);
        setTimeout(() => setMessage(null), 3000);
      }
    },
    [id]
  );

  React.useEffect(() => {
    if (invoiceId) {
      setId(invoiceId);
      loadInvoice(invoiceId);
    }
  }, [invoiceId, loadInvoice]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim()) {
      setMessage("Please enter invoice ID (id/_id/session_id)");
      return;
    }
    const payload: Record<string, unknown> = {};
    if (status) payload.status = status;
    if (paymentStatus) payload.paymentStatus = paymentStatus;
    if (dueAt) payload.dueAt = new Date(dueAt).toISOString();
    if (paidAt) payload.paidAt = new Date(paidAt).toISOString();
    if (paidTotal) payload.paidTotal = Number(paidTotal);
    if (currency) payload.currency = currency;
    if (meta) {
      try {
        payload.meta = JSON.parse(meta);
      } catch {
        setMessage("Invalid meta, please enter valid JSON.");
        return;
      }
    }
    if (Object.keys(payload).length === 0) {
      setMessage("No fields to update.");
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      await api.patch(`/admin/invoices/${encodeURIComponent(id)}`, payload);
      setMessage("Update successful");
      await loadInvoice(id);
    } catch (err: unknown) {
      const getErrorMessage = (e: unknown) => {
        try {
          const ae = e as { response?: { data?: { message?: string } }; message?: string };
          return ae?.response?.data?.message || ae?.message || "Update failed";
        } catch {
          return "Update failed";
        }
      };
      setMessage(getErrorMessage(err));
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

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
            <h2 className="text-lg font-semibold text-gray-900">Update Invoice</h2>
          </div>
        </div>

        <form className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col md:col-span-2">
            <label className="text-xs text-gray-500 mb-1">Invoice ID or session_id</label>
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
              placeholder="invoice id / _id / session_id"
            />
          </div>
          <div className="flex items-center gap-3 md:col-span-2">
            <button
              type="button"
              onClick={() => loadInvoice()}
              disabled={loading || !id.trim()}
              className="px-4 py-2 rounded-lg border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              {loading ? "Loading..." : "Load Invoice Data"}
            </button>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">—</option>
              <option value="ISSUED">Issued</option>
              <option value="VOID">Void</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">—</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PAID">Paid</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Due Date</label>
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Paid At</label>
            <input
              type="datetime-local"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Paid Amount</label>
            <input
              type="number"
              min={0}
              value={paidTotal}
              onChange={(e) => setPaidTotal(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
              placeholder="VND (integer)"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Currency</label>
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          
          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
            >
              {submitting ? "Updating..." : "Update"}
            </button>
            {message && <span className="text-sm text-gray-600">{message}</span>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceUpdate;


