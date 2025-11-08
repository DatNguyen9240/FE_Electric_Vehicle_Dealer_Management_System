import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save, X } from "lucide-react";
import { updateTariff, getTariff } from "../../../redux/slice/Tariff/TariffThunks";
import { clearError } from "../../../redux/slice/Tariff/TariffSlice";
import type { RootState, AppDispatch } from "../../../redux/store/store";
import { useTitle } from "../../../contexts";
import api from "../../../libs/axios";

const asRecord = (v: unknown): Record<string, unknown> => (typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {});
const getErrorMessage = (eVal: unknown, fallback = "Có lỗi xảy ra") => {
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

interface Station {
  _id: string;
  name: string;
}

const EditTariff: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tariffId } = useParams<{ tariffId: string }>();
  const navigate = useNavigate();
  const { loading, error, selectedTariff } = useSelector(
    (state: RootState) => state.tariff
  );
  const { setTitle } = useTitle();

  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    stationId: "",
    connectorType: "DC_CCS2",
    mode: "hybrid",
    pricePerKwh: 0,
    pricePerMin: 0,
    idleFeePerMin: 0,
    graceMin: 0,
    active: true,
    effectiveFrom: "",
  });

  useEffect(() => {
    setTitle("Chỉnh sửa biểu giá sạc");
    fetchStations();
  }, [setTitle]);

  useEffect(() => {
    if (tariffId) {
      dispatch(getTariff(tariffId));
    }
  }, [dispatch, tariffId]);

  useEffect(() => {
    if (selectedTariff) {
      setFormData({
        stationId: selectedTariff.stationId,
        connectorType: selectedTariff.connectorType || "DC_CCS2",
        mode: selectedTariff.mode,
        pricePerKwh: selectedTariff.pricePerKwh,
        pricePerMin: selectedTariff.pricePerMin,
        idleFeePerMin: selectedTariff.idleFeePerMin,
        graceMin: selectedTariff.graceMin,
        active: selectedTariff.active,
        effectiveFrom: new Date(selectedTariff.effectiveFrom)
          .toISOString()
          .slice(0, 16),
      });
    }
  }, [selectedTariff]);

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
    }
  };

  const handleUpdateTariff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tariffId) return;

    setIsLoading(true);
    try {
      await dispatch(
        updateTariff({
          id: tariffId,
          payload: {
            ...formData,
            effectiveFrom: new Date(formData.effectiveFrom).toISOString(),
          },
        })
      ).unwrap();

      toast.success("Cập nhật biểu giá thành công!");
      navigate("/admin/tariffs");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Có lỗi xảy ra khi cập nhật!"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/tariffs");
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!selectedTariff) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-500">Không tìm thấy biểu giá</div>
      </div>
    );
  }

  const stationName =
    stations.find((s) => s._id === selectedTariff.stationId)?.name ||
    selectedTariff.stationId;

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
            Quay lại
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chỉnh sửa biểu giá sạc
            </h1>
            <p className="text-sm text-gray-500 mt-1">Trạm: {stationName}</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Thông tin biểu giá</h2>
        </div>

        <form onSubmit={handleUpdateTariff}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Station */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạm sạc <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.stationId}
                  onChange={(e) =>
                    setFormData({ ...formData, stationId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn trạm</option>
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
                  Loại kết nối <span className="text-red-500">*</span>
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
                  Chế độ <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.mode}
                  onChange={(e) =>
                    setFormData({ ...formData, mode: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="energy">Energy (Theo năng lượng)</option>
                  <option value="time">Time (Theo thời gian)</option>
                  <option value="hybrid">Hybrid (Hỗn hợp)</option>
                </select>
              </div>

              {/* Effective From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hiệu lực từ <span className="text-red-500">*</span>
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
                  Giá/kWh (VND) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={formData.pricePerKwh}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricePerKwh: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Price per Min */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá/phút (VND) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="100"
                  value={formData.pricePerMin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricePerMin: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Idle Fee per Min */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phí chờ/phút (VND) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="100"
                  value={formData.idleFeePerMin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      idleFeePerMin: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Grace Min */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian miễn phí (phút) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.graceMin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      graceMin: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  Đang áp dụng
                </span>
              </label>
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
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Current Info Summary */}
      <div className="mt-6 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Thông tin hiện tại
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <div className="text-sm text-gray-500">Trạm</div>
            <div className="text-lg font-medium text-gray-900">{stationName}</div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-sm text-gray-500">Chế độ</div>
            <div className="text-lg font-medium text-blue-600">
              {selectedTariff.mode}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-sm text-gray-500">Giá/kWh</div>
            <div className="text-lg font-medium text-gray-900">
              {formatVND(selectedTariff.pricePerKwh)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-sm text-gray-500">Loại kết nối</div>
            <div className="text-lg font-medium text-gray-900">
              {selectedTariff.connectorType || "N/A"}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-sm text-gray-500">Hiệu lực từ</div>
            <div className="text-lg font-medium text-gray-900">
              {formatDate(selectedTariff.effectiveFrom)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-sm text-gray-500">Trạng thái</div>
            <div
              className={`text-lg font-medium ${
                selectedTariff.active ? "text-green-600" : "text-gray-600"
              }`}
            >
              {selectedTariff.active ? "Đang áp dụng" : "Không hiệu lực"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTariff;

