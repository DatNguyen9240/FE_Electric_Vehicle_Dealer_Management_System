import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Edit, AlertCircle, AlertTriangle, CheckCircle, AlertCircle as AlertCircleIcon } from "lucide-react";
import { getIncident } from "@redux/slice/Incident/IncidentThunks";
import { clearError } from "@redux/slice/Incident/IncidentSlice";
import type { RootState, AppDispatch } from "@redux/store/store";
import { useTitle } from "../../../contexts";
import api from "../../../libs/axios";

type Station = {
  _id: string;
  name: string;
};

const IncidentDetail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();
  const { loading, error, selectedIncident } = useSelector((state: RootState) => state.incident);
  const { setTitle } = useTitle();
  const [station, setStation] = React.useState<Station | null>(null);
  const [loadingStation, setLoadingStation] = React.useState(false);

  useEffect(() => {
    setTitle("Incident Details");
  }, [setTitle]);

  useEffect(() => {
    if (incidentId) {
      dispatch(getIncident(incidentId));
    }
  }, [dispatch, incidentId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Fetch station info
  useEffect(() => {
    const fetchStation = async () => {
      if (!selectedIncident?.stationId) return;
      try {
        setLoadingStation(true);
        const res = await api.get(`/stations/${selectedIncident.stationId}`);
        const stationData = res.data?.station || res.data;
        if (stationData) {
          setStation({
            _id: stationData._id || selectedIncident.stationId,
            name: stationData.name || "Unknown Station",
          });
        }
      } catch (err) {
        console.error("Error fetching station:", err);
      } finally {
        setLoadingStation(false);
      }
    };
    fetchStation();
  }, [selectedIncident?.stationId]);

  const handleEdit = () => {
    if (selectedIncident) {
      navigate(`/admin/incidents/edit/${selectedIncident.id}`);
    }
  };

  const handleBack = () => {
    navigate("/admin/incidents");
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <AlertCircleIcon size={20} className="text-red-600" />;
      case "HIGH":
        return <AlertTriangle size={20} className="text-orange-600" />;
      case "MEDIUM":
        return <AlertCircle size={20} className="text-yellow-600" />;
      case "LOW":
        return <CheckCircle size={20} className="text-blue-600" />;
      default:
        return null;
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-50 text-red-700 border-red-200";
      case "HIGH":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "MEDIUM":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "LOW":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-yellow-50 text-yellow-700";
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700";
      case "RESOLVED":
        return "bg-green-50 text-green-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </div>

      {/* Incident Info */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Incident Information</h2>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getSeverityStyle(selectedIncident.severity)}`}>
                {getSeverityIcon(selectedIncident.severity)}
                {selectedIncident.severity}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(selectedIncident.status)}`}>
                {selectedIncident.status.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Incident ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incident ID
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm">
                {selectedIncident.id}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {selectedIncident.title || "No title"}
              </div>
            </div>

            {/* Station */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Station
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {loadingStation ? "Loading..." : (station?.name || selectedIncident.stationId || "—")}
              </div>
            </div>

            {/* Connector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connector
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {selectedIncident.connectorId || "—"}
              </div>
            </div>

            {/* Reported By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reported By
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {selectedIncident.reportedBy}
              </div>
            </div>

            {/* Created At */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reported At
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {formatDate(selectedIncident.createdAt)}
              </div>
            </div>

            {/* Resolved By */}
            {selectedIncident.resolvedBy && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolved By
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                  {selectedIncident.resolvedBy}
                </div>
              </div>
            )}

            {/* Resolved At */}
            {selectedIncident.resolvedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolved At
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                  {formatDate(selectedIncident.resolvedAt)}
                </div>
              </div>
            )}

            {/* Description - Full Width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 min-h-[100px] whitespace-pre-wrap">
                {selectedIncident.description}
              </div>
            </div>

            {/* Attachments */}
            {selectedIncident.attachments && selectedIncident.attachments.length > 0 && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedIncident.attachments.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50"
                    >
                      Attachment {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end mt-4">
        <button
          onClick={handleEdit}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit size={16} />
          Edit Status
        </button>
      </div>
    </div>
  );
};

export default IncidentDetail;

