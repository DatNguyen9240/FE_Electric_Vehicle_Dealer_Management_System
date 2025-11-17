import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save, X } from "lucide-react";
import api from "@libs/axios";
import { useTitle } from "@contexts";

type ConnectorPayload = { chargerId: string; status: string; code: string };

const ConnectorsCreate: React.FC = () => {
  const { setTitle } = useTitle();
  const { stationId, chargerId } = useParams<{ stationId?: string; chargerId?: string }>();
  const navigate = useNavigate();

  type Station = { _id: string; name?: string; code?: string };
  type Charger = { _id: string; stationId?: string; name?: string; code?: string; connectorType?: string; powerKw?: number };

  const [chargerInfo, setChargerInfo] = React.useState<Charger | null>(null);
  const [stationInfo, setStationInfo] = React.useState<Station | null>(null);
  const [form, setForm] = React.useState<ConnectorPayload>({ chargerId: chargerId || "", status: "IDLE", code: "" });
  const [connectorData, setConnectorData] = React.useState<{ type?: string; powerKw?: number; stationId?: string }>({});
  const [loading, setLoading] = React.useState(false);
  const [loadingCharger, setLoadingCharger] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => { setTitle("Add Connector"); }, [setTitle]);

  // Load charger and station info when chargerId is available
  React.useEffect(() => {
    if (!chargerId) {
      setError("Charger ID is required");
      setLoadingCharger(false);
      return;
    }

    (async () => {
      try {
        setLoadingCharger(true);
        const chargerRes = await api.get(`/chargers/${chargerId}`);
        const charger: Charger = chargerRes.data;
        setChargerInfo(charger);
        setForm((f) => ({ ...f, chargerId: charger._id }));
        
        // Auto-fill connector data from charger
        setConnectorData({
          type: charger.connectorType,
          powerKw: charger.powerKw,
          stationId: charger.stationId
        });

        // Load station info if stationId is available
        if (charger.stationId) {
          try {
            const stationRes = await api.get(`/stations/${charger.stationId}`);
            setStationInfo(stationRes.data);
          } catch (e) {
            // Station might not be found, but continue
          }
        }
      } catch (e: any) {
        const errorMsg = e?.response?.data?.message || e?.message || "Failed to load charger";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoadingCharger(false);
      }
    })();
  }, [chargerId]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.chargerId) {
      toast.error("Please select a charger");
      return;
    }

    if (!form.code?.trim()) {
      toast.error("Please enter connector code");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Create: Only send chargerId, status, code (backend auto-sets stationId, type, powerKw from charger)
      const payload = {
        chargerId: form.chargerId,
        status: (form.status || "IDLE").toUpperCase(),
        code: form.code,
      };
      await api.post(`/connectors`, payload);
      toast.success("Connector created successfully!");
      // Navigate back to appropriate route based on context
      if (stationId && chargerId) {
        navigate(`/admin/infrastructure/stations/${stationId}/chargers/${chargerId}/connectors`);
      } else {
        navigate("/admin/infrastructure/connectors");
      }
    } catch (e: any) {
      const errorMsg = e?.response?.data?.message || e?.message || "Error saving connector";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally { setLoading(false); }
  };


  const handleCancel = () => {
    // Navigate back to appropriate route based on context
    if (stationId && chargerId) {
      navigate(`/admin/infrastructure/stations/${stationId}/chargers/${chargerId}/connectors`);
    } else {
      navigate("/admin/infrastructure/connectors");
    }
  };

  if (loadingCharger) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading charger information...</div>
      </div>
    );
  }

  if (!chargerId) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Charger ID is required. Please navigate from a charger page.
        </div>
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
              Create New Connector
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Fill in information to create a new connector
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Connector Information</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Station - Read-only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Station
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {stationInfo?.name || stationInfo?.code || chargerInfo?.stationId || "—"}
                </div>
              </div>

              {/* Charger - Read-only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Charger
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {chargerInfo?.name || chargerInfo?.code || chargerId || "—"}
                </div>
              </div>

              {/* Type - Read-only (auto-synced from charger) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  {connectorData.type || "—"}
                </div>
              </div>

              {/* Power - Read-only (auto-synced from charger) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Power (kW)
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  {connectorData.powerKw !== undefined ? `${connectorData.powerKw} kW` : "—"}
                </div>
              </div>

              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connector Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter connector code"
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
                  onChange={(e) => setForm({ ...form, status: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="IDLE">IDLE</option>
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
                {loading ? "Saving..." : "Create Connector"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectorsCreate;

