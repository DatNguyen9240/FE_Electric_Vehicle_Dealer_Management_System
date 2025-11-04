import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@libs/axios";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@redux/store/store"; // Đảm bảo đã export AppDispatch từ store
import { fetchWalletThunk } from "@redux/slice/Payment/PaymentThunks";

const featureIcons = [
  "⚡", // Discount on electricity price
  "⏱️", // Discount on minute price
  "🕒", // Discount on idle fee
  "🎁", // Extra free minutes
  "💰", // Discount on minimum balance
  "🚀", // Queue priority
];

const PurchaseMembership: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [months, setMonths] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [plan, setPlan] = useState<{
    name: string;
    monthly_fee_vnd: number;
    mods: {
      pricePerKwhPctOff: number;
      pricePerMinPctOff: number;
      idleFeePerMinPctOff: number;
      graceMinBonus: number;
      minBalancePctOff: number;
      queueBoost: number;
    };
  } | null>(null);
  const [planLoading, setPlanLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    setPlanLoading(true);
    api.get(`/memberships/plans/${code}`)
      .then(res => setPlan(res.data))
      .catch(() => setPlan(null))
      .finally(() => setPlanLoading(false));
  }, [code]);

  const handlePurchase = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await api.post("/memberships/purchase", {
        planCode: code,
        months,
      });
      setMessage("🎉 Purchase successful!");
      dispatch(fetchWalletThunk());
      setTimeout(() => navigate("/"), 1500);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { msg?: string } } })?.response?.data?.msg ||
        "Purchase failed.";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!code) {
    return <div className="p-8 text-center text-red-500">Invalid plan code.</div>;
  }

  if (planLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <span className="text-gray-500">Loading plan details...</span>
      </div>
    );
  }

  if (!plan) {
    return <div className="p-8 text-center text-red-500">Plan not found.</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg border border-blue-100">
      <h2 className="text-3xl font-extrabold mb-2 text-blue-700 flex items-center gap-2">
        <span>🌟</span> {plan.name} Membership
      </h2>
      <p className="mb-4 text-lg text-gray-700 font-medium">
        Monthly Fee: <span className="text-blue-600 font-bold">{plan.monthly_fee_vnd}đ</span>
      </p>
      <ul className="mb-8 text-gray-700 space-y-2">
        <li className="flex items-center gap-2">
          <span>{featureIcons[0]}</span>
          Discount {plan.mods.pricePerKwhPctOff}% on electricity price
        </li>
        <li className="flex items-center gap-2">
          <span>{featureIcons[1]}</span>
          Discount {plan.mods.pricePerMinPctOff}% on minute price
        </li>
        <li className="flex items-center gap-2">
          <span>{featureIcons[2]}</span>
          Discount {plan.mods.idleFeePerMinPctOff}% on idle fee
        </li>
        <li className="flex items-center gap-2">
          <span>{featureIcons[3]}</span>
          Extra {plan.mods.graceMinBonus} free minutes
        </li>
        <li className="flex items-center gap-2">
          <span>{featureIcons[4]}</span>
          Discount {plan.mods.minBalancePctOff}% on minimum balance
        </li>
        <li className="flex items-center gap-2">
          <span>{featureIcons[5]}</span>
          Queue priority x{plan.mods.queueBoost}
        </li>
      </ul>
      <label className="block mb-6">
        <span className="font-semibold text-gray-700">Months to purchase:</span>
        <input
          type="number"
          min={1}
          value={months}
          onChange={e => setMonths(Number(e.target.value))}
          className="ml-2 border border-blue-300 rounded px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </label>
      <button
        onClick={handlePurchase}
        disabled={loading}
        className={`w-full py-3 rounded-lg font-bold text-lg transition
          ${loading
            ? "bg-blue-300 text-white cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700 shadow"
          }`}
      >
        {loading ? "Processing..." : `Purchase ${plan.name}`}
      </button>
      {message && (
        <div className={`mt-6 text-center font-semibold ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default PurchaseMembership;