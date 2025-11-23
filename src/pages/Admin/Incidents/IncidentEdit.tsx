import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save } from "lucide-react";
import { getIncident, updateIncidentStatus, markIncidentInProgress } from "@redux/slice/Incident/IncidentThunks";
import { clearError } from "@redux/slice/Incident/IncidentSlice";
import type { RootState, AppDispatch } from "@redux/store/store";
import { useTitle } from "../../../contexts";

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
] as const;

const IncidentEdit: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();
  const { loading, error, selectedIncident } = useSelector((state: RootState) => state.incident);
  const { setTitle } = useTitle();

  const [status, setStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle("Edit Incident");
  }, [setTitle]);

  useEffect(() => {
    if (incidentId) {
      dispatch(getIncident(incidentId));
    }
  }, [dispatch, incidentId]);

  useEffect(() => {
    if (selectedIncident) {
      setStatus(selectedIncident.status);
    }
  }, [selectedIncident]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentId || !status) return;

    setIsSubmitting(true);
    try {
      if (status === "IN_PROGRESS") {
        // Admin can use the special endpoint
        await dispatch(markIncidentInProgress(incidentId)).unwrap();
        toast.success("Incident marked as IN_PROGRESS");
      } else {
        // Use staff endpoint for OPEN/RESOLVED
        await dispatch(updateIncidentStatus({ incidentId, status })).unwrap();
        toast.success("Incident status updated successfully");
      }
      navigate(`/admin/incidents/view/${incidentId}`);
    } catch (err) {
      toast.error(err as string);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (incidentId) {
      navigate(`/admin/incidents/view/${incidentId}`);
    } else {
      navigate("/admin/incidents");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading data...</div>
      </div>
    );
  }

  if (!selectedIncident) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-500">Incident not found</div>
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
          <h1 className="text-2xl font-bold text-gray-900">
            Incident {selectedIncident.id.slice(0, 8)}
          </h1>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Update Incident Status</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Status (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Status
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                {selectedIncident.status.replace("_", " ")}
              </div>
            </div>

            {/* New Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Incident Info (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                {selectedIncident.severity}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Station ID
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                {selectedIncident.stationId || "—"}
              </div>
            </div>

            {/* Description (Read-only) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 min-h-[80px] whitespace-pre-wrap">
                {selectedIncident.description}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || status === selectedIncident.status}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {isSubmitting ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentEdit;

