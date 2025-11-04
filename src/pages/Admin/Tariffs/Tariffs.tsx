import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import {
  fetchTariffs,
  deleteTariff,
} from "../../../redux/slice/Tariff/TariffThunks";
import { clearError } from "../../../redux/slice/Tariff/TariffSlice";
import type { RootState, AppDispatch } from "../../../redux/store/store";
import type { Tariff } from "../../../redux/slice/Tariff/TariffSlice";
import { useTitle } from "../../../contexts";
import api from "../../../libs/axios";

interface Station {
  _id: string;
  name: string;
}

const TariffManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { data: tariffs, loading, error } = useSelector(
    (state: RootState) => state.tariff
  );
  const { setTitle } = useTitle();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<string>("all");
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    setTitle("Quản lý biểu giá sạc");
    dispatch(fetchTariffs());
    fetchStations();
  }, [dispatch, setTitle]);

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

  const handleEdit = (tariff: Tariff) => {
    navigate(`/admin/tariffs/edit/${tariff._id}`);
  };

  const handleCreate = () => {
    navigate("/admin/tariffs/create");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa biểu giá này?")) {
      return;
    }
    try {
      await dispatch(deleteTariff(id)).unwrap();
      toast.success("Xóa biểu giá thành công!");
      dispatch(fetchTariffs());
    } catch (error: any) {
      toast.error(error || "Có lỗi xảy ra khi xóa!");
    }
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

  const filteredTariffs = tariffs.filter((tariff) => {
    const station = stations.find((s) => s._id === tariff.stationId);
    const stationName = station?.name || "";
    const matchesSearch =
      tariff.mode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tariff.connectorType || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterActive === "all" ||
      (filterActive === "active" && tariff.active) ||
      (filterActive === "inactive" && !tariff.active);
    return matchesSearch && matchesFilter;
  });

  // Nhóm tariffs theo stationId
  const groupedTariffs = filteredTariffs.reduce((acc, tariff) => {
    const stationId = tariff.stationId;
    if (!acc[stationId]) {
      acc[stationId] = [];
    }
    acc[stationId].push(tariff);
    return acc;
  }, {} as Record<string, Tariff[]>);

  if (loading && tariffs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm biểu giá..."
              value={searchTerm}
              className="border border-[#333333] rounded-lg pl-10 pr-7 py-1 w-72 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333]"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
          
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="border border-[#333333] rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#333333]"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang áp dụng</option>
              <option value="inactive">Không hiệu lực</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Tạo biểu giá mới
        </button>
      </div>

      {/* Grouped by Stations */}
      {Object.keys(groupedTariffs).length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
          Không có dữ liệu biểu giá
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTariffs).map(([stationId, stationTariffs]) => {
            const station = stations.find((s) => s._id === stationId);
            const stationName = station?.name || stationId;

            return (
              <div key={stationId} className="bg-white rounded-xl border overflow-hidden">
                {/* Station Header */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b">
                  <h3 className="text-lg font-bold text-gray-800">{stationName}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {stationTariffs.length} biểu giá
                  </p>
                </div>

                {/* Tariffs Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b bg-gray-50">
                        <th className="px-4 py-3 text-left font-semibold">Loại kết nối</th>
                        <th className="px-4 py-3 text-left font-semibold">Chế độ</th>
                        <th className="px-4 py-3 text-left font-semibold">Giá/kWh</th>
                        <th className="px-4 py-3 text-left font-semibold">Giá/phút</th>
                        <th className="px-4 py-3 text-left font-semibold">Phí chờ/phút</th>
                        <th className="px-4 py-3 text-left font-semibold">Thời gian miễn phí (phút)</th>
                        <th className="px-4 py-3 text-left font-semibold">Hiệu lực từ</th>
                        <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                        <th className="px-4 py-3 text-center font-semibold">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stationTariffs.map((tariff) => (
                        <tr
                          key={tariff._id}
                          className="border-b last:border-b-0 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">{tariff.connectorType || "N/A"}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                              {tariff.mode}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {formatVND(tariff.pricePerKwh)}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {formatVND(tariff.pricePerMin)}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {formatVND(tariff.idleFeePerMin)}
                          </td>
                          <td className="px-4 py-3">{tariff.graceMin} phút</td>
                          <td className="px-4 py-3">{formatDate(tariff.effectiveFrom)}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                tariff.active
                                  ? "bg-green-50 text-green-600"
                                  : "bg-gray-50 text-gray-600"
                              }`}
                            >
                              {tariff.active ? "Đang áp dụng" : "Không hiệu lực"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEdit(tariff)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(tariff._id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Xóa"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TariffManager;
