import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import api from "@libs/axios";
import { useTitle } from "@contexts";

type VehicleOwner = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
};

type VehicleListItem = {
  id?: string;
  _id?: string;
  vin?: string;
  licensePlate?: string;
  brand?: string;
  model?: string;
  type?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  year?: number;
  color?: string;
  owner?: VehicleOwner | null;
  isDeleted?: boolean;
  deletedAt?: string | null;
  metadata?: Record<string, unknown>;
};

type VehiclesListPayload = {
  data?: VehicleListItem[];
  vehicles?: VehicleListItem[];
  items?: VehicleListItem[];
  results?: VehicleListItem[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    pageSize?: number;
    totalPages?: number;
    totalPage?: number;
    totalCount?: number;
  };
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    pageSize?: number;
    totalPages?: number;
    totalPage?: number;
    totalCount?: number;
  };
  filters?: {
    brands?: string[];
    statuses?: string[];
  };
  message?: string;
};

type VehiclesResponse = VehiclesListPayload | VehicleListItem[] | null;

const getFirstNonEmpty = <T,>(...values: (T | undefined)[]) => {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
};

const buildStatusBadge = (status?: string, isDeleted?: boolean) => {
  const normalized = (status || "").toUpperCase();
  if (isDeleted || normalized === "DELETED") {
    return "bg-red-50 text-red-600";
  }
  switch (normalized) {
    case "APPROVED":
    case "ACTIVE":
    case "VERIFIED":
      return "bg-emerald-50 text-emerald-600";
    case "PENDING":
    case "SUBMITTED":
      return "bg-amber-50 text-amber-600";
    case "REJECTED":
    case "SUSPENDED":
      return "bg-orange-50 text-orange-600";
    default:
      return "bg-gray-50 text-gray-600";
  }
};

const inferId = (vehicle: VehicleListItem) => vehicle.id || vehicle._id || "";

const VehicleManager: React.FC = () => {
  const navigate = useNavigate();
  const { setTitle } = useTitle();

  const [loading, setLoading] = React.useState(false);
  const [vehicles, setVehicles] = React.useState<VehicleListItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [brandFilter, setBrandFilter] = React.useState<string>("all");
  const [statusOptions, setStatusOptions] = React.useState<string[]>([]);
  const [brandOptions, setBrandOptions] = React.useState<string[]>([]);

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [totalItems, setTotalItems] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);

  React.useEffect(() => {
    setTitle("Quản lý xe người dùng");
  }, [setTitle]);

  React.useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);
    return () => window.clearTimeout(handle);
  }, [searchTerm]);

  const parseVehicles = React.useCallback((payload: VehiclesResponse) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (payload.data && Array.isArray(payload.data)) return payload.data;
    if (payload.vehicles && Array.isArray(payload.vehicles)) return payload.vehicles;
    if (payload.items && Array.isArray(payload.items)) return payload.items;
    if (payload.results && Array.isArray(payload.results)) return payload.results;
    return [];
  }, []);

  const extractErrorMessage = (err: unknown) => {
    const fallback = "Không thể tải danh sách xe";
    try {
      const errorLike = err as {
        response?: { data?: { message?: string; error?: string } };
        message?: string;
      };
      return (
        errorLike?.response?.data?.message ||
        errorLike?.response?.data?.error ||
        errorLike?.message ||
        fallback
      );
    } catch {
      return fallback;
    }
  };

  const fetchVehicles = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string | number | undefined> = {
        page,
        limit: pageSize,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter !== "all") params.status = statusFilter;
      if (brandFilter !== "all") params.brand = brandFilter;

      const res = await api.get<VehiclesResponse>("/admin/vehicles", {
        params,
      });
      const payload = res.data;
      const list = parseVehicles(payload);
      setVehicles(list);

      const meta = (payload && typeof payload === "object" && "meta" in payload
        ? (payload as VehiclesListPayload).meta
        : undefined) ||
        (payload && typeof payload === "object" && "pagination" in payload
          ? (payload as VehiclesListPayload).pagination
          : undefined) ||
        undefined;

      const total = getFirstNonEmpty(
        meta?.total,
        meta?.totalCount,
        list.length
      );
      setTotalItems(typeof total === "number" ? total : list.length);

      const limit = getFirstNonEmpty(meta?.limit, meta?.pageSize);
      if (typeof limit === "number" && limit > 0 && limit !== pageSize) {
        setPageSize(limit);
      }

      const totalPagesFromMeta = getFirstNonEmpty(
        meta?.totalPages,
        meta?.totalPage
      );
      if (typeof totalPagesFromMeta === "number" && totalPagesFromMeta > 0) {
        setTotalPages(totalPagesFromMeta);
      } else {
        const computed = Math.max(
          1,
          Math.ceil((typeof total === "number" ? total : list.length) / pageSize)
        );
        setTotalPages(computed);
      }

      const brandsFromPayload =
        (payload &&
          typeof payload === "object" &&
          "filters" in payload &&
          Array.isArray(
            (payload as VehiclesListPayload).filters?.brands
          ) &&
          (payload as VehiclesListPayload).filters?.brands) ||
        null;
      const statusesFromPayload =
        (payload &&
          typeof payload === "object" &&
          "filters" in payload &&
          Array.isArray(
            (payload as VehiclesListPayload).filters?.statuses
          ) &&
          (payload as VehiclesListPayload).filters?.statuses) ||
        null;

      if (Array.isArray(brandsFromPayload)) {
        setBrandOptions(brandsFromPayload.filter(Boolean));
      } else {
        const inferredBrands = Array.from(
          new Set(
            list
              .map((item) => item.brand?.trim())
              .filter((v): v is string => !!v)
          )
        );
        setBrandOptions(inferredBrands);
      }

      if (Array.isArray(statusesFromPayload)) {
        setStatusOptions(
          statusesFromPayload
            .filter((status): status is string => typeof status === "string" && status.length > 0)
            .map((status) => status.toUpperCase())
        );
      } else {
        const inferredStatuses = Array.from(
          new Set(
            list
              .map((item) => item.status?.toUpperCase().trim())
              .filter((v): v is string => !!v)
          )
        );
        setStatusOptions(inferredStatuses);
      }
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    pageSize,
    debouncedSearch,
    statusFilter,
    brandFilter,
    parseVehicles,
  ]);

  React.useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleReload = () => {
    fetchVehicles();
  };

  const handleViewDetail = (vehicle: VehicleListItem) => {
    const vehicleId = inferId(vehicle);
    if (!vehicleId) {
      toast.error("Không xác định được mã xe");
      return;
    }
    navigate(`/admin/vehicles/view/${vehicleId}`);
  };

  const handleEdit = (vehicle: VehicleListItem) => {
    const vehicleId = inferId(vehicle);
    if (!vehicleId) {
      toast.error("Không xác định được mã xe");
      return;
    }
    navigate(`/admin/vehicles/edit/${vehicleId}`);
  };

  const handleDelete = async (vehicle: VehicleListItem) => {
    const vehicleId = inferId(vehicle);
    if (!vehicleId) {
      toast.error("Không xác định được mã xe");
      return;
    }
    const plate = vehicle.licensePlate || vehicle.vin || vehicleId;
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xoá (ẩn) xe "${plate}" khỏi hệ thống?`
      )
    ) {
      return;
    }
    try {
      await api.delete(`/admin/vehicles/${vehicleId}`);
      toast.success("Đã xoá xe thành công");
      fetchVehicles();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleRestore = async (vehicle: VehicleListItem) => {
    const vehicleId = inferId(vehicle);
    if (!vehicleId) {
      toast.error("Không xác định được mã xe");
      return;
    }
    try {
      await api.post(`/admin/vehicles/${vehicleId}/restore`);
      toast.success("Đã khôi phục xe thành công");
      fetchVehicles();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const isVehicleDeleted = (vehicle: VehicleListItem) =>
    !!vehicle.isDeleted ||
    !!vehicle.deletedAt ||
    (vehicle.status || "").toUpperCase() === "DELETED";

  const formatDateTime = (value?: string) => {
    if (!value) return "—";
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value));
    } catch {
      return value;
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý xe người dùng</h1>
          <p className="text-sm text-gray-500">
            Theo dõi trạng thái xác thực và quản lý toàn bộ xe đã đăng ký trong hệ thống.
          </p>
        </div>
        <button
          onClick={handleReload}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition"
        >
          <RefreshCw size={16} /> Tải lại
        </button>
      </div>

      <div className="bg-white border rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tìm theo biển số, VIN, hoặc tên chủ xe..."
            />
          </div>
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <select
              value={brandFilter}
              onChange={(event) => {
                setBrandFilter(event.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Tất cả hãng xe</option>
              {brandOptions.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Danh sách xe</h2>
            <p className="text-sm text-gray-500">
              {totalItems} xe • Trang {page} / {totalPages}
            </p>
          </div>
          {loading && (
            <span className="inline-flex items-center text-sm text-gray-500">
              Đang tải dữ liệu...
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Biển số / VIN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Hãng / Dòng xe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Chủ sở hữu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!loading && vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                    Không có xe nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => {
                  const deleted = isVehicleDeleted(vehicle);
                  return (
                    <tr key={inferId(vehicle) || Math.random()}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-semibold">
                          {vehicle.licensePlate || "—"}
                        </div>
                        <div className="text-gray-500 text-xs">
                          VIN: {vehicle.vin || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="font-medium text-gray-900">
                          {vehicle.brand || "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {vehicle.model || vehicle.type || "Chưa cập nhật"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="font-medium text-gray-900">
                          {vehicle.owner?.name || "Chưa có tên"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {vehicle.owner?.email || vehicle.owner?.phone || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${buildStatusBadge(vehicle.status, deleted)}`}
                        >
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          {deleted ? "ĐÃ XOÁ" : vehicle.status || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(vehicle.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(vehicle)}
                            className="text-gray-400 hover:text-blue-500 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(vehicle)}
                            className="text-gray-400 hover:text-blue-500 transition-colors"
                            title="Chỉnh sửa"
                            disabled={deleted}
                          >
                            <Pencil size={16} />
                          </button>
                          {deleted ? (
                            <button
                              onClick={() => handleRestore(vehicle)}
                              className="text-gray-400 hover:text-emerald-500 transition-colors"
                              title="Khôi phục xe"
                            >
                              <RotateCcw size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDelete(vehicle)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              title="Xoá (ẩn) xe"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Hiển thị</span>
            <select
              value={pageSize}
              onChange={(event) => {
                const newSize = Number(event.target.value) || 20;
                setPageSize(newSize);
                setPage(1);
              }}
              className="border border-gray-300 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} / trang
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Trước
            </button>
            <span className="px-3 py-1.5 text-sm text-gray-600">
              Trang {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() =>
                setPage((prev) => Math.min(totalPages, prev + 1))
              }
              className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManager;

