import React, { useEffect } from "react";
import api from "@libs/axios";
import { useUi } from "../../contexts/uiContextCore";
import { useTitle } from "../../contexts";

type OnsitePaymentPayload = {
  amount: number;
  method: string;
  sessionId?: string;
  invoiceId?: string;
};

const OnsitePayment: React.FC = () => {
  const [sessionId, setSessionId] = React.useState("");
  const [invoiceId, setInvoiceId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [method, setMethod] = React.useState("CASH");
  const [loading, setLoading] = React.useState(false);

  const { showToast } = useUi();

  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle("Staff Payments");
  }, [setTitle]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload: OnsitePaymentPayload = { amount: parseFloat(amount || "0"), method };
    if (sessionId) payload.sessionId = sessionId;
    if (invoiceId) payload.invoiceId = invoiceId;

    try {
      setLoading(true);
      await api.post("/staff/payments/onsite", payload);
      showToast("Payment recorded successfully", "success");
      setSessionId("");
      setInvoiceId("");
      setAmount("");
    } catch (err) {
      console.error(err);
      showToast("Failed to record payment", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-gray-100 transition-all hover:shadow-xl mt-6">
      <h2 className="text-xl font-semibold mb-5 text-gray-800 flex items-center gap-2">
        💳 Onsite Payment
      </h2>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600">Session ID</label>
          <input
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="Enter Session ID"
            className="w-full border border-gray-200 rounded-lg p-2.5 mt-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Invoice ID</label>
          <input
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            placeholder="Enter Invoice ID"
            className="w-full border border-gray-200 rounded-lg p-2.5 mt-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Amount (VND)</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            type="number"
            min="0"
            step="0.01"
            className="w-full border border-gray-200 rounded-lg p-2.5 mt-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Payment Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-2.5 mt-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
          >
            <option value="CASH">💵 Cash</option>
            <option value="QR">📱 QR Code</option>
            <option value="POS">💳 POS Terminal</option>
          </select>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={loading}
            className={`px-5 py-2.5 text-white rounded-lg font-medium text-sm transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 shadow-md hover:shadow-lg"
            }`}
          >
            {loading ? "Processing..." : "Confirm Payment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OnsitePayment;
