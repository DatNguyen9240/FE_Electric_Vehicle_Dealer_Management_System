import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchWalletThunk } from "../redux/slice/Payment/PaymentThunks";
import type { RootState, AppDispatch } from "../redux/store/store";
import { Link } from "react-router-dom";

const Wallet: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const wallet = useSelector((state: RootState) => state.payment.wallet);
  const loading = useSelector((state: RootState) => state.payment.loading);

  useEffect(() => {
    dispatch(fetchWalletThunk());
  }, [dispatch]);

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
        <h2 className="text-base font-semibold mb-2 text-gray-700">
          Lịch sử giao dịch
        </h2>
        {/* TODO: Hiển thị lịch sử giao dịch ví nếu có */}
        <div className="text-gray-400 text-sm italic">
          Chưa có giao dịch nào.
        </div>
      </div>
    </div>
  );
};

export default Wallet;
