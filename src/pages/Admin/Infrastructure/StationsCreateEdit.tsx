import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save, X } from "lucide-react";
import api from "@libs/axios";
import { useTitle } from "@contexts";

type StationPayload = { name: string; lat: number; lng: number; status: string };

const StationsCreateEdit: React.FC = () => {
  const { setTitle } = useTitle();
  const { stationId } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(stationId);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<StationPayload>({ name: "", lat: 0, lng: 0, status: "ONLINE" });

  React.useEffect(() => {
    setTitle(isEdit ? "Edit Station" : "Create Station");
  }, [isEdit, setTitle]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isEdit) return;
      try {
        setLoading(true);
        const res = await api.get(`/stations/${stationId}`);
        if (!mounted) return;
        const s = res.data;
        setForm({ name: s.name, lat: s.lat, lng: s.lng, status: s.status });
      } catch (err: unknown) {
        if (!mounted) return;
        const e = err as any;
        setError(e?.response?.data?.message || e?.message || "Failed to load station");
        toast.error(e?.response?.data?.message || e?.message || "Failed to load station");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [isEdit, stationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      toast.error("Please enter station name");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (isEdit) {
        await api.put(`/stations/${stationId}`, form);
        toast.success("Station updated successfully!");
      } else {
        await api.post(`/stations`, form);
        toast.success("Station created successfully!");
      }
      navigate("/admin/infrastructure/stations");
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Error saving station");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/infrastructure/stations");
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
              {isEdit ? "Edit Charging Station" : "Create New Charging Station"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit ? "Update charging station information" : "Fill in information to create a new charging station"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Charging Station Information</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Station Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter station name"
                />
              </div>

              {/* Latitude */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude (Lat) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  value={form.lat || ""}
                  onChange={(e) => setForm({ ...form, lat: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter latitude"
                />
              </div>

              {/* Longitude */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude (Lng) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  value={form.lng || ""}
                  onChange={(e) => setForm({ ...form, lng: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter longitude"
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
                  <option value="MAINTENANCE">MAINTENANCE</option>
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
                {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Station"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StationsCreateEdit;


