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
    pricePerMin: 0,
    idleFeePerMin: 0,
    graceMin: 0,
    active: true,
    effectiveFrom: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    setTitle("Tạo biểu giá sạc mới");
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
      toast.error("Không thể tải danh sách trạm sạc");
    }
  };

  const handleCreateTariff = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.stationId) {
      toast.error("Vui lòng chọn trạm sạc");
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

      toast.success("Tạo biểu giá thành công!");
      navigate("/admin/tariffs");
    } catch (err: any) {
      toast.error(err || "Có lỗi xảy ra khi tạo biểu giá!");
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
        <div className="text-lg">Đang tải dữ liệu...</div>
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
            Quay lại
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tạo biểu giá sạc mới
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Điền thông tin để tạo biểu giá mới
            </p>
          </div>
        </div>
      </div>

      {/* Create Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Thông tin biểu giá</h2>
        </div>

        <form onSubmit={handleCreateTariff}>
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
                  value={formData.pricePerKwh || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricePerKwh: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập giá/kWh"
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
                  value={formData.pricePerMin || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricePerMin: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập giá/phút"
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
                  value={formData.idleFeePerMin || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      idleFeePerMin: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập phí chờ/phút"
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
                  value={formData.graceMin || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      graceMin: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập thời gian miễn phí"
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
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Biểu giá sẽ được áp dụng ngay sau khi tạo nếu được bật
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
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {isLoading ? "Đang tạo..." : "Tạo biểu giá"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          Lưu ý khi tạo biểu giá
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Biểu giá sẽ có hiệu lực từ thời điểm được chọn trong "Hiệu lực từ"</li>
          <li>Chỉ có thể có một biểu giá đang áp dụng cho mỗi trạm và loại kết nối</li>
          <li>Vui lòng kiểm tra kỹ thông tin trước khi tạo</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateTariff;

