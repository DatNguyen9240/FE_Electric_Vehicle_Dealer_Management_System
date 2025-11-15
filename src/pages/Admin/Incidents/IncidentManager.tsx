import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Search, Eye, AlertCircle, AlertTriangle, AlertCircle as AlertCircleIcon, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchIncidents } from "@redux/slice/Incident/IncidentThunks";
import { clearError } from "@redux/slice/Incident/IncidentSlice";
import type { RootState, AppDispatch } from "@redux/store/store";
import type { Incident } from "@redux/slice/Incident/IncidentSlice";
import { useTitle } from "../../../contexts";
import api from "../../../libs/axios";

type Station = {
  _id: string;
  name: string;
};

const STATUS_OPTIONS = [
  { key: "OPEN", label: "Open" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "RESOLVED", label: "Resolved" },
] as const;

const SEVERITY_OPTIONS = [
  { key: "LOW", label: "Low" },
  { key: "MEDIUM", label: "Medium" },
  { key: "HIGH", label: "High" },
  { key: "CRITICAL", label: "Critical" },
] as const;

const IncidentManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { data: incidents, loading, error, pagination } = useSelector((state: RootState) => state.incident);
  const { setTitle } = useTitle();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [stationFilter, setStationFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [stations, setStations] = useState<Station[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);

  useEffect(() => {
    setTitle("Incident Management");
  }, [setTitle]);

  // Fetch stations
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoadingStations(true);
        const res = await api.get("/stations", { params: { limit: 1000 } });
        const stationsData = Array.isArray(res.data) 
          ? res.data 
          : (res.data?.stations || []);
        setStations(stationsData);
      } catch (err) {
        console.error("Error fetching stations:", err);
      } finally {
        setLoadingStations(false);
      }
    };
    fetchStations();
  }, []);

  // Fetch incidents
  const fetchIncidentsWithFilters = React.useCallback(() => {
    const params: any = {
      page: 1,
      limit: 20,
    };
    if (statusFilter) params.status = statusFilter;
    if (severityFilter) params.severity = severityFilter;
    if (stationFilter) params.stationId = stationFilter;
    if (fromDate) params.from = fromDate;
    if (toDate) params.to = toDate;

    dispatch(fetchIncidents(params));
  }, [dispatch, statusFilter, severityFilter, stationFilter, fromDate, toDate]);

  useEffect(() => {
    fetchIncidentsWithFilters();
  }, [fetchIncidentsWithFilters]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleViewIncident = (incidentId: string) => {
    navigate(`/admin/incidents/view/${incidentId}`);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <AlertCircleIcon size={16} className="text-red-600" />;
      case "HIGH":
        return <AlertTriangle size={16} className="text-orange-600" />;
      case "MEDIUM":
        return <AlertCircle size={16} className="text-yellow-600" />;
      case "LOW":
        return <CheckCircle size={16} className="text-blue-600" />;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter incidents based on search term
  const filteredIncidents = incidents.filter((incident: Incident) => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return true;
    const title = (incident.title || "").toLowerCase();
    const description = (incident.description || "").toLowerCase();
    const id = (incident.id || "").toLowerCase();
    return title.includes(needle) || description.includes(needle) || id.includes(needle);
  });

  const getStationName = (stationId: string | null): string => {
    if (!stationId) return "—";
    const station = stations.find((s) => s._id === stationId);
    return station?.name || stationId;
  };

  if (loading && incidents.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search incident..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-[#333333] rounded-lg px-7 py-1 w-72 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333]"
            />
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
            />
            <span className="text-sm text-gray-500">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
          >
            <option value="">Status: All</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="border border-[#333333] rounded-lg px-3 py-1 text-sm"
          >
            <option value="">Severity: All</option>
            {SEVERITY_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Station Filter */}
          <select
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            disabled={loadingStations}
            className="border border-[#333333] rounded-lg px-3 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed min-w-[200px]"
          >
            <option value="">Station: All</option>
            {stations.map((station) => (
              <option key={station._id} value={station._id}>
                {station.name || `Station ${station._id}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-b mb-4" />

      {/* Incident List */}
      <div className="bg-white rounded-xl border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Incident List</h2>
            <span className="text-sm text-gray-500">{pagination.total} results</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Station
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reported At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || statusFilter || severityFilter || stationFilter
                      ? "No incidents found matching the search criteria"
                      : "No incidents yet"}
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident: Incident) => (
                  <tr key={incident.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      {incident.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">
                        {incident.title || "No title"}
                      </div>
                      <div className="text-gray-500 text-xs mt-1 line-clamp-1">
                        {incident.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getStationName(incident.stationId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityStyle(incident.severity)}`}>
                        {getSeverityIcon(incident.severity)}
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(incident.status)}`}>
                        {incident.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(incident.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewIncident(incident.id)}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page {pagination.page} / {Math.max(1, pagination.pages)}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1 || loading}
                onClick={() => dispatch(fetchIncidents({ page: pagination.page - 1, limit: pagination.limit }))}
                className="px-3 py-1.5 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 inline-flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                disabled={pagination.page >= pagination.pages || loading}
                onClick={() => dispatch(fetchIncidents({ page: pagination.page + 1, limit: pagination.limit }))}
                className="px-3 py-1.5 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 inline-flex items-center gap-1"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentManager;

