import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initiateTopupPayOSThunk } from "../redux/slice/Payment/PaymentThunks";
import type { AppDispatch, RootState } from "../redux/store/store";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, ShieldCheck } from "lucide-react";

const presetAmounts = [50000, 100000, 200000, 500000, 1000000];

const Topup: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
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
    <div className="px-6 py-10">
      <div className=" mx-20 space-y-6">
        <button
          onClick={() => navigate("/wallet")}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition"
        >
          <ArrowLeft size={16} />
          Quay lại ví của tôi
        </button>

        <div className="bg-white rounded-2xl border p-6 shadow-sm flex flex-col gap-2">
          <p className="text-sm text-gray-500 uppercase tracking-wide">Nạp tiền vào ví</p>
          <h1 className="text-3xl font-semibold text-gray-900">Chọn số tiền bạn muốn nạp</h1>
          <p className="text-sm text-gray-500">
            Hệ thống hỗ trợ thanh toán qua PayOS. Số tiền tối thiểu 1.000₫.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-2xl border p-6 shadow-sm space-y-5">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Số tiền nhanh</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      amount === amt
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-gray-200 hover:border-blue-300 text-gray-700"
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="customAmount">
                Hoặc nhập số tiền khác
              </label>
              <input
                id="customAmount"
                type="number"
                min={1000}
                placeholder="Nhập số tiền (>= 1.000₫)"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                {error}
              </div>
            )}

            <button
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white py-3 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              onClick={handleTopup}
              disabled={loading || amount < 1000}
            >
              <CreditCard size={16} />
              {loading ? "Đang xử lý..." : `Nạp ${amount.toLocaleString()}₫`}
            </button>
          </div>

          <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Thông tin bảo mật</h2>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-green-50 text-green-600">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Thanh toán an toàn</p>
                <p className="text-xs text-gray-500">
                  Giao dịch được bảo vệ bởi PayOS và mã hóa theo tiêu chuẩn PCI DSS.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <CreditCard size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Hỗ trợ nhiều phương thức</p>
                <p className="text-xs text-gray-500">
                  Visa, MasterCard, chuyển khoản ngân hàng, ví điện tử và hơn thế nữa.
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 border-t pt-4">
              Sau khi nạp thành công, hệ thống sẽ chuyển bạn đến trang xác nhận và ghi nhận giao dịch trong ví.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topup;
