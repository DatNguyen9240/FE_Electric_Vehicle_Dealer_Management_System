import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { fetchWalletThunk } from "../redux/slice/Payment/PaymentThunks";
import type { RootState, AppDispatch } from "../redux/store/store";
import { Link } from "react-router-dom";
import api from "@libs/axios";

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

  return (
    <div className="max-w-md mx-auto mt-12 bg-white shadow rounded-lg p-6">
      <h1 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
        <img src="/icon/01.png" alt="Wallet" className="w-7 h-7" />
        Ví của tôi
      </h1>
      <div className="flex flex-col items-center mb-6">
        <span className="text-3xl font-bold text-green-600">
          {loading
            ? "Đang tải..."
            : wallet?.balance !== undefined
            ? `${wallet.balance.toLocaleString()}₫`
            : "Không lấy được số dư"}
        </span>
        <Link
          to="/topup"
          className="mt-4 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
        >
          Nạp tiền
        </Link>
      </div>
      <div>
        <h2 className="text-base font-semibold mb-2 text-gray-700">Lịch sử giao dịch</h2>
        {txLoading ? (
          <div className="text-gray-500 text-sm">Đang tải lịch sử...</div>
        ) : transactions.length === 0 ? (
          <div className="text-gray-400 text-sm italic">Chưa có giao dịch nào.</div>
        ) : (
          <ul className="space-y-3">
            {transactions.map((t, i) => {
              const id = t._id || t.id || i;
              const amount = t.amount ?? t.value ?? 0;
              const type = t.type || t.kind || t.description || (t.meta && t.meta.description) || '-';
              const status = t.status || '-';
              const dateRaw = t.createdAt || t.created_at || t.timestamp || t.date;
              const date = dateRaw ? new Date(dateRaw).toLocaleString() : '-';
              return (
                <li key={id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{type}</div>
                    <div className="text-xs text-gray-500">{date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-800">{Number(amount).toLocaleString()}₫</div>
                    <div className="text-xs text-gray-500">{status}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Wallet;
