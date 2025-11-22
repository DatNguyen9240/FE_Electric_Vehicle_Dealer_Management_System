import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@libs/axios";
import { useUi } from "../../contexts/uiContextCore";
import { useTitle } from "../../contexts";

const CreateIncident: React.FC = () => {
  const navigate = useNavigate();
  const { setTitle } = useTitle();
  const { showToast } = useUi();
  
  const [form, setForm] = React.useState({ stationId: "", description: "", level: "LOW" });
  const [submitting, setSubmitting] = React.useState(false);
  const [stations, setStations] = React.useState<Array<any>>([]);
  const [stationsLoading, setStationsLoading] = React.useState(false);

  useEffect(() => {
    setTitle("Report New Incident");
  }, [setTitle]);

  // Load stations
  React.useEffect(() => {
    setStationsLoading(true);
    api
      .get('/stations')
      .then((res) => {
        const d = res.data as any;
        const list = Array.isArray(d) ? d : d?.stations ?? d?.items ?? d?.data ?? [];
        if (Array.isArray(list)) {
          setStations(list);
          // Auto-fill stationId if only one station
          if (list.length === 1) {
            const id = list[0]._id ?? list[0].id ?? "";
            if (id) {
              setForm((f) => ({ ...f, stationId: id }));
            }
          }
        }
      })
      .catch((err) => {
        console.error(err);
        showToast('Failed to load stations', 'error');
      })
      .finally(() => setStationsLoading(false));
  }, [showToast]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Ensure stationId is set if only one station
    let stationId = form.stationId;
    if (!stationId && stations.length === 1) {
      stationId = stations[0]._id ?? stations[0].id ?? "";
      if (stationId) {
        setForm((f) => ({ ...f, stationId }));
      }
    }
    
    if (!stationId || !form.description.trim()) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    
    setSubmitting(true);
    try {
      // Map level to severity for API
      const payload = {
        stationId: stationId,
        description: form.description.trim(),
        severity: form.level, // API expects 'severity', not 'level'
      };
      await api.post("/staff/incidents", payload);
      showToast("Incident reported successfully", "success");
      // Navigate back to incidents list
      navigate("/staff/incidents");
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to report incident";
      showToast(errorMessage, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate("/staff/incidents")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Incidents</span>
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Report New Incident</h1>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Station</label>
            {stations.length === 1 ? (
              <div className="w-full rounded-lg p-3 text-sm bg-gray-50 text-gray-700 border border-gray-200">
                {stations[0].name ?? stations[0].code ?? stations[0].id}
              </div>
            ) : (
              <div>
                <select
                  value={form.stationId}
                  onChange={(e) => setForm((f) => ({ ...f, stationId: e.target.value }))}
                  className="w-full border border-[#333333] rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333]"
                  required
                >
                  <option value="">-- choose station --</option>
                  {stations.map((s) => (
                    <option key={s._id ?? s.id} value={s._id ?? s.id}>
                      {s.name ?? s.id}
                    </option>
                  ))}
                </select>
                {stationsLoading && <div className="text-xs text-gray-500 mt-1">Loading stations...</div>}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              placeholder="Describe the issue..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full border border-[#333333] rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333] min-h-[120px]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity Level</label>
            <select
              value={form.level}
              onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
              className="w-full border border-[#333333] rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333]"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate("/staff/incidents")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-all ${
                submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {submitting ? "Submitting..." : "Report Incident"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIncident;

