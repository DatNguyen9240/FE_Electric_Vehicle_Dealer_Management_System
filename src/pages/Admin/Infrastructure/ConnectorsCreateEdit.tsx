import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save, X } from "lucide-react";
import api from "@libs/axios";
import { useTitle } from "@contexts";

type ConnectorPayload = { chargerId: string; status: string; code: string };

const ConnectorsCreateEdit: React.FC = () => {
  const { setTitle } = useTitle();
  const { connectorId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(connectorId);

  type Station = { _id: string; name?: string; code?: string };
  type Charger = { _id: string; stationId?: string; name?: string; code?: string; connectorType?: string; powerKw?: number };

  const [stations, setStations] = React.useState<Station[]>([]);
  const [chargers, setChargers] = React.useState<Charger[]>([]);
  const [selectedStationId, setSelectedStationId] = React.useState<string>("");
  const [form, setForm] = React.useState<ConnectorPayload>({ chargerId: "", status: "IDLE", code: "" });
  const [connectorData, setConnectorData] = React.useState<{ type?: string; powerKw?: number; stationId?: string }>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => { setTitle(isEdit ? "Edit Connector" : "Add Connector"); }, [isEdit, setTitle]);

  const asRecord = (v: unknown): Record<string, unknown> | null =>
    v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;

  React.useEffect(() => {
    (async () => {
      try {
        const [s, ch] = await Promise.all([
          api.get("/stations", { params: { limit: 1000 } }),
          api.get("/chargers", { params: { limit: 1000 } }),
        ]);
        const sd: unknown = s.data;
        const cd: unknown = ch.data;
        const sl = (Array.isArray(sd) ? sd : (asRecord(sd)?.items ?? asRecord(sd)?.data ?? [])) as Station[];
        const cl = (Array.isArray(cd) ? cd : (asRecord(cd)?.items ?? asRecord(cd)?.data ?? [])) as Charger[];
        setStations(sl);
        setChargers(cl);
        if (!selectedStationId && sl[0]?._id) setSelectedStationId(sl[0]._id);
        if (!form.chargerId && cl[0]?._id) setForm((f) => ({ ...f, chargerId: cl[0]._id }));
      } catch (e: any) {
        toast.error("Failed to load station/charger list");
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (!isEdit) return;
      try {
        setLoading(true);
        const r = await api.get(`/connectors/${connectorId}`);
        const c = r.data;
        setForm({ 
          chargerId: c.chargerId, 
          status: (c.status || "IDLE").toUpperCase(), 
          code: c.code 
        });
        setConnectorData({
          type: c.type,
          powerKw: c.powerKw,
          stationId: c.stationId
        });
        setSelectedStationId(c.stationId);
      } catch (e: any) {
        const errorMsg = e?.response?.data?.message || e?.message || "Failed to load connector";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally { setLoading(false); }
    })();
  }, [isEdit, connectorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.chargerId) {
      toast.error("Please select a charger");
      return;
    }

    if (!isEdit && !form.code?.trim()) {
      toast.error("Please enter connector code");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (isEdit) {
        // Update: Send code and status (backend auto-syncs type and powerKw from charger)
        await api.put(`/connectors/${connectorId}`, { code: form.code });
        // Update status separately using PATCH endpoint
        if (form.status) {
          await api.patch(`/connectors/${connectorId}/status`, { status: form.status.toUpperCase() });
        }
        toast.success("Connector updated successfully!");
      } else {
        // Create: Only send chargerId, status, code (backend auto-sets stationId, type, powerKw from charger)
        const payload = {
          chargerId: form.chargerId,
          status: (form.status || "IDLE").toUpperCase(),
          code: form.code,
        };
        await api.post(`/connectors`, payload);
        toast.success("Connector created successfully!");
      }
      navigate("/admin/infrastructure/connectors");
    } catch (e: any) {
      const errorMsg = e?.response?.data?.message || e?.message || "Error saving connector";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally { setLoading(false); }
  };

  // Filter chargers by selected station (for create) or connector's station (for edit)
  const filteredChargers = React.useMemo(() => {
    if (isEdit && connectorData.stationId) {
      // In edit mode, show chargers from the connector's station
      return chargers.filter((ch) => ch.stationId === connectorData.stationId);
    }
    if (!selectedStationId) return chargers;
    return chargers.filter((ch) => ch.stationId === selectedStationId);
  }, [chargers, selectedStationId, isEdit, connectorData.stationId]);

  // Update chargerId when station changes (if current charger is not in new station) - only for create mode
  React.useEffect(() => {
    if (!isEdit && selectedStationId && filteredChargers.length > 0) {
      const currentCharger = chargers.find((ch) => ch._id === form.chargerId);
      if (!currentCharger || currentCharger.stationId !== selectedStationId) {
        const newCharger = filteredChargers[0];
        setForm((f) => ({ ...f, chargerId: newCharger._id }));
        // Auto-fill type and powerKw from charger
        if (newCharger.connectorType && newCharger.powerKw !== undefined) {
          setConnectorData({
            type: newCharger.connectorType,
            powerKw: newCharger.powerKw,
            stationId: selectedStationId
          });
        }
      }
    }
  }, [selectedStationId, filteredChargers, isEdit, form.chargerId, chargers]);

  // Auto-fill type and powerKw when charger is selected in create mode
  React.useEffect(() => {
    if (!isEdit && form.chargerId) {
      const selectedCharger = chargers.find((ch) => ch._id === form.chargerId);
      if (selectedCharger) {
        setConnectorData({
          type: selectedCharger.connectorType || "",
          powerKw: selectedCharger.powerKw,
          stationId: selectedCharger.stationId
        });
      }
    }
  }, [form.chargerId, chargers, isEdit]);

  const handleCancel = () => {
    navigate("/admin/infrastructure/connectors");
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
              {isEdit ? "Edit Connector" : "Create New Connector"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit ? "Update connector information" : "Fill in information to create a new connector"}
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
              {/* Station - Only for create, read-only for edit */}
              {!isEdit ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Station <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedStationId}
                    onChange={(e) => setSelectedStationId(e.target.value)}
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
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Station
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                    {stations.find((s) => s._id === connectorData.stationId)?.name || connectorData.stationId || "—"}
                  </div>
                </div>
              )}

              {/* Charger */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Charger <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.chargerId}
                  onChange={(e) => setForm({ ...form, chargerId: e.target.value })}
                  disabled={isEdit}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select charger</option>
                  {filteredChargers.map((ch) => (
                    <option key={ch._id} value={ch._id}>
                      {ch.name || ch.code || ch._id}
                    </option>
                  ))}
                </select>
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
                  Connector Code {!isEdit && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  required={!isEdit}
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
                  <option value="RESERVED">RESERVED</option>
                  <option value="CHARGING">CHARGING</option>
                  <option value="FINISHED">FINISHED</option>
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
                {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Connector"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectorsCreateEdit;



