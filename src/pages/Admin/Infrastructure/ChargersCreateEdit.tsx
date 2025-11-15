import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save, X } from "lucide-react";
import api from "@libs/axios";
import { useTitle } from "@contexts";

type ChargerPayload = { stationId: string; name: string; code: string; connectorType: string; powerKw: number; status: string };

type Station = { _id: string; name?: string; code?: string };

const ChargersCreateEdit: React.FC = () => {
  const { setTitle } = useTitle();
  const { chargerId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(chargerId);

  const [stations, setStations] = React.useState<Station[]>([]);
  const [form, setForm] = React.useState<ChargerPayload>({ stationId: "", name: "", code: "", connectorType: "DC_CCS2", powerKw: 7.2, status: "ONLINE" });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => { setTitle(isEdit ? "Edit Charger" : "Create Charger"); }, [isEdit, setTitle]);

  React.useEffect(() => {
    (async () => {
      try {
        const s = await api.get("/stations", { params: { limit: 1000 } });
        const d: unknown = s.data;
        const list = (Array.isArray(d)
          ? (d as Station[])
          : (d && typeof d === "object"
            ? ((d as Record<string, unknown>).items ?? (d as Record<string, unknown>).data ?? (d as Record<string, unknown>).stations ?? [])
            : [])) as Station[];
        setStations(list);
        if (!form.stationId && list[0]?._id) setForm((f) => ({ ...f, stationId: list[0]._id }));
      } catch (e: any) {
        toast.error("Failed to load station list");
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (!isEdit) return;
      try {
        setLoading(true);
        const r = await api.get(`/chargers/${chargerId}`);
        const c = r.data;
        setForm({ stationId: c.stationId, name: c.name, code: c.code, connectorType: c.connectorType, powerKw: c.powerKw, status: c.status });
      } catch (e: any) {
        const errorMsg = e?.response?.data?.message || e?.message || "Failed to load charger";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, chargerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.stationId) {
      toast.error("Please select a station");
      return;
    }

    if (!form.name.trim()) {
      toast.error("Please enter charger name");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (isEdit) {
        await api.put(`/chargers/${chargerId}`, form);
        toast.success("Charger updated successfully!");
      } else {
        await api.post(`/chargers`, form);
        toast.success("Charger created successfully!");
      }
      navigate("/admin/infrastructure/chargers");
    } catch (e: any) {
      const errorMsg = e?.response?.data?.message || e?.message || "Error saving charger";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/infrastructure/chargers");
  };

  if (loading && isEdit) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? "Edit Charger" : "Create New Charger"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit ? "Update charger information" : "Fill in information to create a new charger"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Charger Information</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Station */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Station <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.stationId}
                  onChange={(e) => setForm({ ...form, stationId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select station</option>
                  {stations.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name || s.code || s._id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Charger Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter charger name"
                />
              </div>

              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter charger code"
                />
              </div>

              {/* Connector Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connector Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.connectorType}
                  onChange={(e) => setForm({ ...form, connectorType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="DC_CCS2">DC CCS2</option>
                  <option value="CHAdeMO">CHAdeMO</option>
                </select>
              </div>

              {/* Power */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Power (kW) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={form.powerKw || ""}
                  onChange={(e) => setForm({ ...form, powerKw: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter power"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ONLINE">ONLINE</option>
                  <option value="OFFLINE">OFFLINE</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 text-red-600 text-sm">{error}</div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Charger"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChargersCreateEdit;


