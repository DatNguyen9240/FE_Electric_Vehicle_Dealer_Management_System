import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Power, PowerOff, Trash2 } from "lucide-react";
import api from "@libs/axios";
import { useTitle } from "@contexts";

type MembershipPlanDetail = {
  _id?: string;
  id?: string;
  code?: string;
  name?: string;
  monthly_fee_vnd?: number;
  status?: string;
  mods?: {
    pricePerKwhPctOff?: number;
    pricePerMinPctOff?: number;
    idleFeePerMinPctOff?: number;
    graceMinBonus?: number;
    minBalancePctOff?: number;
    queueBoost?: number;
  };
  created_at?: string;
};

const formatCurrency = (value?: number) => {
  if (typeof value !== "number") return "—";
  return `${value.toLocaleString("en-US")} VND`;
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  try {
    const d = new Date(value);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return value;
  }
};

const badgeClass = (status?: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-50 text-green-700";
    case "INACTIVE":
      return "bg-gray-50 text-gray-600";
    default:
      return "bg-gray-50 text-gray-600";
  }
};

const MembershipPlanDetail: React.FC = () => {
  const { setTitle } = useTitle();
  const { planId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<MembershipPlanDetail | null>(null);

  React.useEffect(() => {
    setTitle("Membership Plan Details");
  }, [setTitle]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!planId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<MembershipPlanDetail>(`/admin/membership-plans/${planId}`);
        if (!mounted) return;
        setData(res.data || null);
      } catch (err: unknown) {
        if (!mounted) return;
        const getErrorMessage = (e: unknown) => {
          try {
            const ae = e as { response?: { data?: { message?: string } }; message?: string };
            return ae?.response?.data?.message || ae?.message || "Failed to load plan details";
          } catch {
            return "Failed to load plan details";
          }
        };
        setError(getErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [planId]);

  const handleActivate = async () => {
    if (!planId) return;
    try {
      await api.patch(`/admin/membership-plans/${planId}/activate`);
      if (data) setData({ ...data, status: "ACTIVE" });
    } catch (err: unknown) {
      const getErrorMessage = (e: unknown) => {
        try {
          const ae = e as { response?: { data?: { message?: string } }; message?: string };
          return ae?.response?.data?.message || ae?.message || "Cannot activate plan";
        } catch {
          return "Cannot activate plan";
        }
      };
      alert(getErrorMessage(err));
    }
  };

  const handleDeactivate = async () => {
    if (!planId) return;
    if (!confirm("Are you sure you want to deactivate this plan?")) return;
    try {
      await api.patch(`/admin/membership-plans/${planId}/deactivate`);
      if (data) setData({ ...data, status: "INACTIVE" });
    } catch (err: unknown) {
      const getErrorMessage = (e: unknown) => {
        try {
          const ae = e as { response?: { data?: { message?: string } }; message?: string };
          return ae?.response?.data?.message || ae?.message || "Cannot deactivate plan";
        } catch {
          return "Cannot deactivate plan";
        }
      };
      alert(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!planId) return;
    if (!confirm("Are you sure you want to delete this plan? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/membership-plans/${planId}`);
      navigate("/admin/membership-plans");
    } catch (err: unknown) {
      const getErrorMessage = (e: unknown) => {
        try {
          const ae = e as { response?: { data?: { message?: string } }; message?: string };
          return ae?.response?.data?.message || ae?.message || "Cannot delete plan";
        } catch {
          return "Cannot delete plan";
        }
      };
      alert(getErrorMessage(err));
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
            <h2 className="text-lg font-semibold text-gray-900">Membership Plan Information</h2>
            <div className="flex items-center gap-3">
              {data?.status && (
                <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass(data.status)}`}>
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {data.status}
                </span>
              )}
              <button
                onClick={() => navigate(`/admin/membership-plans/edit/${planId}`)}
                className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
              >
                <Edit size={16} /> Edit
              </button>
              {data?.status === "ACTIVE" ? (
                <button
                  onClick={handleDeactivate}
                  className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm hover:bg-orange-50 text-orange-600"
                >
                  <PowerOff size={16} /> Deactivate
                </button>
              ) : (
                <button
                  onClick={handleActivate}
                  className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm hover:bg-green-50 text-green-600"
                >
                  <Power size={16} /> Activate
                </button>
              )}
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm hover:bg-red-50 text-red-600"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-500">Plan Code</div>
            <div className="font-medium">{data?.code || "—"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Plan Name</div>
            <div className="font-medium">{data?.name || "—"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Monthly Fee</div>
            <div className="font-medium">{formatCurrency(data?.monthly_fee_vnd)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Created At</div>
            <div className="font-medium">{formatDateTime(data?.created_at)}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-sm text-gray-500 mb-2">Benefits (Modifiers)</div>
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Price per kWh Discount (%)</div>
                <div className="font-medium">{data?.mods?.pricePerKwhPctOff ?? 0}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Price per Minute Discount (%)</div>
                <div className="font-medium">{data?.mods?.pricePerMinPctOff ?? 0}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Idle Fee Discount (%)</div>
                <div className="font-medium">{data?.mods?.idleFeePerMinPctOff ?? 0}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Grace Period Bonus (minutes)</div>
                <div className="font-medium">{data?.mods?.graceMinBonus ?? 0}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Minimum Balance Discount (%)</div>
                <div className="font-medium">{data?.mods?.minBalancePctOff ?? 0}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Queue Priority</div>
                <div className="font-medium">{data?.mods?.queueBoost ?? 0}</div>
              </div>
            </div>
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

export default MembershipPlanDetail;

