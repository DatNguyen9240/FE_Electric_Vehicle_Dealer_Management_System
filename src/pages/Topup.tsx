import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initiateTopupPayOSThunk } from "../redux/slice/Payment/PaymentThunk";
import type { AppDispatch, RootState } from "../redux/store/store";

const presetAmounts = [50000, 100000, 200000, 500000, 1000000];

const Topup: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [amount, setAmount] = useState<number>(presetAmounts[0]);
  const [custom, setCustom] = useState<string>("");
  const loading = useSelector((state: RootState) => state.payment.loading);
  const result = useSelector((state: RootState) => state.payment.result);
  const error = useSelector((state: RootState) => state.payment.error);

  useEffect(() => {
    if (result?.checkoutUrl) {
      window.location.href = result.checkoutUrl;
    }
  }, [result?.checkoutUrl]);

  const handleTopup = () => {
    if (amount >= 1000) {
      dispatch(initiateTopupPayOSThunk(amount));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white shadow rounded-lg p-6">
      <h1 className="text-xl font-bold text-blue-700 mb-6 flex items-center gap-2">
        <img src="/icon/01.png" alt="Wallet" className="w-7 h-7" />
        Nạp tiền vào ví
      </h1>
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {presetAmounts.map((amt) => (
            <button
              key={amt}
              className={`px-4 py-2 rounded border ${
                amount === amt
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => {
                setAmount(amt);
                setCustom("");
              }}
            >
              {amt.toLocaleString()}₫
            </button>
          ))}
        </div>
        <input
          type="number"
          min={1000}
          placeholder="Nhập số tiền khác (>= 1.000₫)"
          className="w-full px-3 py-2 border rounded mb-2"
          value={custom}
          onChange={(e) => {
            setCustom(e.target.value);
            setAmount(Number(e.target.value));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && amount >= 1000 && !loading) {
              handleTopup();
            }
          }}
        />
      </div>
      <button
        className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
        onClick={handleTopup}
        disabled={loading || amount < 1000}
      >
        {loading ? "Đang xử lý..." : "Nạp tiền"}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default Topup;
