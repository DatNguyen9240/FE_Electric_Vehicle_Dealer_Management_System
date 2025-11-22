import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { fetchWalletThunk } from "../redux/slice/Payment/PaymentThunks";
import type { RootState, AppDispatch } from "../redux/store/store";
import { Link } from "react-router-dom";
import api from "@libs/axios";
import { CreditCard, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft } from "lucide-react";

const Wallet: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const wallet = useSelector((state: RootState) => state.payment.wallet);
  const loading = useSelector((state: RootState) => state.payment.loading);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchWalletThunk());
  }, [dispatch]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setTxLoading(true);
        try {
        // backend mounts wallet routes under /api/v1/wallets (note the plural)
        // the controller returns { page, limit, total, pages, items }
        const res = await api.get('/wallets/transactions');
        if (!mounted) return;
        const items = res.data?.items ?? res.data?.data ?? res.data;
        setTransactions(Array.isArray(items) ? items : []);
      } catch (err) {
        console.error('Failed to fetch transactions', err);
        if (mounted) setTransactions([]);
      } finally {
        if (mounted) setTxLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const formatAmount = (value?: number) => {
    if (value == null) return "0₫";
    return `${Number(value).toLocaleString()}₫`;
  };

  const renderTransactionStatus = (status?: string) => {
    const normalized = String(status || "").toUpperCase();
    if (normalized === "SUCCEEDED" || normalized === "COMPLETED")
      return <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Completed</span>;
    if (normalized === "PENDING")
      return <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pending</span>;
    if (normalized === "FAILED")
      return <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Failed</span>;
    return <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{status || "Unknown"}</span>;
  };

  return (
    <div className="px-6 py-10">
      <div className=" mx-20 space-y-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-500 uppercase tracking-wide">E-Wallet</p>
          <h1 className="text-3xl font-semibold text-gray-900">Your Balance and Transactions</h1>
          <p className="text-sm text-gray-500">
            Track your current balance, top-up history, and recent transactions.
          </p>
        </div>

        <div className="bg-white rounded-2xl border px-6 py-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-gray-500 font-medium">Current Balance</p>
              <p className="text-4xl font-semibold text-gray-900 mt-2">
                {loading
                  ? "Loading..."
                  : wallet?.balance !== undefined
                  ? formatAmount(wallet.balance)
                  : "Unable to retrieve balance"}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <WalletIcon className="w-8 h-8" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/topup"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
            >
              <CreditCard size={16} />
              Top Up
            </Link>
            <Link
              to="/charging-history"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 transition"
            >
              View Charging History
            </Link>
            <Link
              to="/my-invoices"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-300 transition"
            >
              View Invoices
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900">Transaction History</p>
              <p className="text-sm text-gray-500">
                Recent top-up and payment transactions.
              </p>
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase">
              {transactions.length} transactions
            </span>
          </div>
          <div className="p-6">
            {txLoading ? (
              <div className="text-sm text-gray-500">Loading history...</div>
            ) : transactions.length === 0 ? (
              <div className="text-sm text-gray-400 italic">You have no transactions yet.</div>
            ) : (
              <div className="space-y-3">
                {transactions.map((t, i) => {
                  const id = t._id || t.id || i;
                  const amount = t.amount ?? t.value ?? 0;
                  const type =
                    t.type ||
                    t.kind ||
                    t.description ||
                    (t.meta && t.meta.description) ||
                    "Giao dịch ví";
                  const status = t.status || "-";
                  const dateRaw = t.createdAt || t.created_at || t.timestamp || t.date;
                  const date = dateRaw ? new Date(dateRaw).toLocaleString() : "-";
                  const positive = Number(amount) >= 0;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl ${
                            positive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                          }`}
                        >
                          {positive ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{type}</p>
                          <p className="text-xs text-gray-500">{date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${
                            positive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {positive ? "+" : "-"}
                          {formatAmount(Math.abs(Number(amount)))}
                        </p>
                        {renderTransactionStatus(status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
