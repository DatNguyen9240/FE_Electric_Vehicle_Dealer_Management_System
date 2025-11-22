import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@libs/axios";
import { useTitle } from "@contexts";

type MembershipPlanFormData = {
  code: string;
  name: string;
  monthly_fee_vnd: number;
  status: string;
  mods: {
    pricePerKwhPctOff: number;
    pricePerMinPctOff: number;
    idleFeePerMinPctOff: number;
    graceMinBonus: number;
    minBalancePctOff: number;
    queueBoost: number;
  };
};

const MembershipPlanForm: React.FC = () => {
  const { setTitle } = useTitle();
  const { planId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!planId;

  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<MembershipPlanFormData>({
    code: "",
    name: "",
    monthly_fee_vnd: 0,
    status: "ACTIVE",
    mods: {
      pricePerKwhPctOff: 0,
      pricePerMinPctOff: 0,
      idleFeePerMinPctOff: 0,
      graceMinBonus: 0,
      minBalancePctOff: 0,
      queueBoost: 0,
    },
  });

  React.useEffect(() => {
    setTitle(isEdit ? "Edit Membership Plan" : "Create New Membership Plan");
  }, [setTitle, isEdit]);

  React.useEffect(() => {
    if (!isEdit) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/admin/membership-plans/${planId}`);
        if (!mounted) return;
        const data = res.data;
        setFormData({
          code: data.code || "",
          name: data.name || "",
          monthly_fee_vnd: data.monthly_fee_vnd ?? 0,
          status: data.status || "ACTIVE",
          mods: {
            pricePerKwhPctOff: data.mods?.pricePerKwhPctOff ?? 0,
            pricePerMinPctOff: data.mods?.pricePerMinPctOff ?? 0,
            idleFeePerMinPctOff: data.mods?.idleFeePerMinPctOff ?? 0,
            graceMinBonus: data.mods?.graceMinBonus ?? 0,
            minBalancePctOff: data.mods?.minBalancePctOff ?? 0,
            queueBoost: data.mods?.queueBoost ?? 0,
          },
        });
      } catch (err: unknown) {
        if (!mounted) return;
        const getErrorMessage = (e: unknown) => {
          try {
            const ae = e as { response?: { data?: { message?: string } }; message?: string };
            return ae?.response?.data?.message || ae?.message || "Failed to load data";
          } catch {
            return "Failed to load data";
          }
        };
        setError(getErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [planId, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit) {
        await api.patch(`/admin/membership-plans/${planId}`, {
          name: formData.name,
          monthly_fee_vnd: formData.monthly_fee_vnd,
          status: formData.status,
          mods: formData.mods,
        });
      } else {
        await api.post("/admin/membership-plans", formData);
      }
      navigate("/admin/membership-plans");
    } catch (err: unknown) {
      const getErrorMessage = (e: unknown) => {
        try {
          const ae = e as { response?: { data?: { message?: string } }; message?: string };
          return ae?.response?.data?.message || ae?.message || "Cannot save plan";
        } catch {
          return "Cannot save plan";
        }
      };
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const updateMod = (key: keyof MembershipPlanFormData["mods"], value: number) => {
    setFormData((prev) => ({
      ...prev,
      mods: { ...prev.mods, [key]: value },
    }));
  };

  const isFormValid = React.useMemo(() => {
    if (!formData.code.trim()) return false;
    if (!formData.name.trim()) return false;
    if (!Number.isFinite(formData.monthly_fee_vnd) || formData.monthly_fee_vnd < 0) return false;
    if (!formData.status) return false;
    const numericFields: number[] = [
      formData.mods.pricePerKwhPctOff,
      formData.mods.idleFeePerMinPctOff,
      formData.mods.graceMinBonus,
      formData.mods.minBalancePctOff,
      formData.mods.queueBoost,
    ];
    return numericFields.every((value) => Number.isFinite(value) && value >= 0);
  }, [formData]);

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
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Membership Plan" : "Create New Membership Plan"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading data...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Code {!isEdit && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    disabled={isEdit}
                    required={!isEdit}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-100"
                    placeholder="e.g., BASIC, PRO"
                  />
                  {isEdit && <p className="text-xs text-gray-500 mt-1">Plan code cannot be changed</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g., Basic Plan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Fee (VND)
                  </label>
                  <input
                    type="number"
                    value={formData.monthly_fee_vnd}
                    onChange={(e) => setFormData({ ...formData, monthly_fee_vnd: Number(e.target.value) || 0 })}
                    min="0"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">Benefits (Modifiers)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price per kWh Discount (%)
                    </label>
                    <input
                      type="number"
                      value={formData.mods.pricePerKwhPctOff}
                      onChange={(e) => updateMod("pricePerKwhPctOff", Number(e.target.value) || 0)}
                      min="0"
                      max="100"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Idle Fee Discount (%)
                    </label>
                    <input
                      type="number"
                      value={formData.mods.idleFeePerMinPctOff}
                      onChange={(e) => updateMod("idleFeePerMinPctOff", Number(e.target.value) || 0)}
                      min="0"
                      max="100"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grace Period Bonus (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.mods.graceMinBonus}
                      onChange={(e) => updateMod("graceMinBonus", Number(e.target.value) || 0)}
                      min="0"
                      max="60"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Balance Discount (%)
                    </label>
                    <input
                      type="number"
                      value={formData.mods.minBalancePctOff}
                      onChange={(e) => updateMod("minBalancePctOff", Number(e.target.value) || 0)}
                      min="0"
                      max="100"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Queue Priority
                    </label>
                    <input
                      type="number"
                      value={formData.mods.queueBoost}
                      onChange={(e) => updateMod("queueBoost", Number(e.target.value) || 0)}
                      min="0"
                      max="10"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 text-red-600 text-sm">{error}</div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting || !isFormValid}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default MembershipPlanForm;

