import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save, X } from "lucide-react";
import { createTariff } from "../../../redux/slice/Tariff/TariffThunks";
import { clearError } from "../../../redux/slice/Tariff/TariffSlice";
import type { RootState, AppDispatch } from "../../../redux/store/store";
import { useTitle } from "../../../contexts";
import api from "../../../libs/axios";

interface Station {
  _id: string;
  name: string;
}

const CreateTariff: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.tariff);
  const { setTitle } = useTitle();

  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    stationId: "",
    connectorType: "DC_CCS2",
    mode: "hybrid",
    pricePerKwh: 0,
    graceMin: 0,
    active: true,
    effectiveFrom: new Date().toISOString().slice(0, 16),
  });

  const asRecord = (v: unknown): Record<string, unknown> => (typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {});
  const getErrorMessage = (eVal: unknown, fallback = "An error occurred") => {
    if (!eVal) return fallback;
    if (typeof eVal === "string") return eVal;
    if (eVal instanceof Error) return eVal.message;
    const r = asRecord(eVal);
    if (typeof r.message === "string") return r.message;
    const response = asRecord(r.response);
    const data = asRecord(response.data);
    if (typeof data.message === "string") return data.message;
    return fallback;
  };

  useEffect(() => {
    setTitle("Create New Tariff");
    fetchStations();
  }, [setTitle]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const fetchStations = async () => {
    try {
      const res = await api.get("/stations");
      setStations(res.data || []);
    } catch (error) {
      console.error("Failed to fetch stations:", error);
      toast.error("Failed to load station list");
    }
  };

  const handleCreateTariff = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.stationId) {
      toast.error("Please select a station");
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(
        createTariff({
          ...formData,
          effectiveFrom: new Date(formData.effectiveFrom).toISOString(),
        })
      ).unwrap();

      toast.success("Tariff created successfully!");
      navigate("/admin/tariffs");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "An error occurred while creating tariff!"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/tariffs");
  };

  if (loading) {
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
              Create New Tariff
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Fill in information to create a new tariff
            </p>
          </div>
        </div>
      </div>

      {/* Create Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Tariff Information</h2>
        </div>

        <form onSubmit={handleCreateTariff}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Station */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Station <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.stationId}
                  onChange={(e) =>
                    setFormData({ ...formData, stationId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select station</option>
                  {stations.map((station) => (
                    <option key={station._id} value={station._id}>
                      {station.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Connector Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connector Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.connectorType}
                  onChange={(e) =>
                    setFormData({ ...formData, connectorType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="DC_CCS2">DC_CCS2</option>
                  <option value="CHAdeMO">CHAdeMO</option>
                </select>
              </div>

              {/* Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.mode}
                  onChange={(e) =>
                    setFormData({ ...formData, mode: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="energy">Energy</option>
                  <option value="time">Time</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {/* Effective From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective From <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.effectiveFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, effectiveFrom: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Price per kWh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price/kWh (VND) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={formData.pricePerKwh || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricePerKwh: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter price/kWh"
                />
              </div>

              {/* Grace Min */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grace Period (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.graceMin || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      graceMin: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter grace period"
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="mt-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                The tariff will be applied immediately after creation if enabled
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {isLoading ? "Creating..." : "Create Tariff"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          Notes when creating tariff
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>The tariff will be effective from the selected time in "Effective From"</li>
          <li>Only one active tariff can exist for each station and connector type</li>
          <li>Please check the information carefully before creating</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateTariff;

