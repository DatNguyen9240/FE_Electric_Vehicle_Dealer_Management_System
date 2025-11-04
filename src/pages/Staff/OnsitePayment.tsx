import React from "react";
import api from "@libs/axios";

const OnsitePayment: React.FC = () => {
  const [sessionId, setSessionId] = React.useState("");
  const [invoiceId, setInvoiceId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [method, setMethod] = React.useState("CASH");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { amount: parseFloat(amount), method };
    if (sessionId) payload.sessionId = sessionId;
    if (invoiceId) payload.invoiceId = invoiceId;

    api
      .post("/staff/payments/onsite", payload)
      .then(() => {
        alert("Payment recorded");
        setSessionId("");
        setInvoiceId("");
        setAmount("");
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to record payment");
      });
  };

  return (
    <div className="max-w-md bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-3">Onsite Payment</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-sm">Session ID</label>
          <input value={sessionId} onChange={(e) => setSessionId(e.target.value)} className="w-full border p-2 rounded mt-1" />
        </div>
        <div>
          <label className="text-sm">Invoice ID</label>
          <input value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} className="w-full border p-2 rounded mt-1" />
        </div>
        <div>
          <label className="text-sm">Amount</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border p-2 rounded mt-1" />
        </div>
        <div>
          <label className="text-sm">Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full border p-2 rounded mt-1">
            <option value="CASH">Cash</option>
            <option value="QR">QR</option>
            <option value="POS">POS</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default OnsitePayment;
