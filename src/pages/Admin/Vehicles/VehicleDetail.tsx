import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Pencil, Trash2, RotateCcw } from "lucide-react";
import api from "@libs/axios";
import { useTitle } from "@contexts";

type VehicleOwner = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
};

type VehicleAttachment = {
  id?: string;
  _id?: string;
  url?: string;
  type?: string;
  name?: string;
};

type VehicleVerification = {
  status?: string;
  reviewer?: string;
  reviewerId?: string;
  reviewedAt?: string;
  comment?: string;
};

type VehicleDetailModel = {
  id?: string;
  _id?: string;
  vin?: string;
  licensePlate?: string;
  brand?: string;
  model?: string;
  type?: string;
  variant?: string;
  year?: number;
  color?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  owner?: VehicleOwner | null;
  notes?: string;
  note?: string;
  adminNote?: string;
  attachments?: VehicleAttachment[];
  images?: VehicleAttachment[];
  metadata?: Record<string, unknown>;
  verification?: VehicleVerification;
  isDeleted?: boolean;
  deletedAt?: string | null;
};

type VehicleDetailResponse =
  | VehicleDetailModel
  | {
      vehicle?: VehicleDetailModel;
      data?: VehicleDetailModel;
      message?: string;
    };

const normalizeVehicle = (payload: VehicleDetailResponse | null): VehicleDetailModel | null => {
  if (!payload) return null;
  if (payload && typeof payload === "object" && "vehicle" in payload) {
    return (payload as { vehicle?: VehicleDetailModel }).vehicle ?? null;
  }
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data?: VehicleDetailModel }).data ?? null;
  }
  return payload as VehicleDetailModel;
};

const badgeClasses = (status?: string, deleted?: boolean) => {
  if (deleted) return "bg-red-50 text-red-600";
  switch ((status || "").toUpperCase()) {
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

const fmtDate = (value?: string) => {
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

const VehicleDetail: React.FC = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { setTitle } = useTitle();

  const [loading, setLoading] = React.useState(false);
  const [vehicle, setVehicle] = React.useState<VehicleDetailModel | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setTitle("Chi tiết xe");
  }, [setTitle]);

  const extractMessage = (err: unknown, fallback: string) => {
    try {
      const errorLike = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return (
        errorLike?.response?.data?.message ||
        errorLike?.message ||
        fallback
      );
    } catch {
      return fallback;
    }
  };

  const fetchDetail = React.useCallback(async () => {
    if (!vehicleId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<VehicleDetailResponse>(`/admin/vehicles/${vehicleId}`);
      const data = normalizeVehicle(res.data);
      setVehicle(data);
    } catch (err) {
      const message = extractMessage(err, "Không thể tải chi tiết xe");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  React.useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const isDeleted =
    !!vehicle?.isDeleted ||
    !!vehicle?.deletedAt ||
    (vehicle?.status || "").toUpperCase() === "DELETED";

  const handleDelete = async () => {
    if (!vehicleId || !vehicle) return;
    const name = vehicle.licensePlate || vehicle.vin || vehicleId;
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xoá (ẩn) xe "${name}" khỏi hệ thống?`
      )
    ) {
      return;
    }
    try {
      await api.delete(`/admin/vehicles/${vehicleId}`);
      toast.success("Đã xoá xe thành công");
      fetchDetail();
    } catch (err) {
      toast.error(extractMessage(err, "Không thể xoá xe"));
    }
  };

  const handleRestore = async () => {
    if (!vehicleId) return;
    try {
      await api.post(`/admin/vehicles/${vehicleId}/restore`);
      toast.success("Đã khôi phục xe thành công");
      fetchDetail();
    } catch (err) {
      toast.error(extractMessage(err, "Không thể khôi phục xe"));
    }
  };

  const handleEdit = () => {
    if (!vehicleId) return;
    navigate(`/admin/vehicles/edit/${vehicleId}`);
  };

  const metadataEntries = React.useMemo(() => {
    if (!vehicle?.metadata || typeof vehicle.metadata !== "object") return [];
    return Object.entries(vehicle.metadata).filter(
      ([, value]) => value !== null && value !== undefined && value !== ""
    );
  }, [vehicle]);

  const attachments =
    vehicle?.attachments && Array.isArray(vehicle.attachments)
      ? vehicle.attachments
      : vehicle?.images && Array.isArray(vehicle.images)
      ? vehicle.images
      : [];

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={16} />
        Quay lại
      </button>

      <div className="bg-white rounded-xl border shadow-sm">
        <div className="px-6 py-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {vehicle?.licensePlate || vehicle?.vin || "Chi tiết xe"}
            </h1>
            <p className="text-sm text-gray-500">
              Mã xe: {vehicle?.id || vehicle?._id || vehicleId || "—"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${badgeClasses(vehicle?.status, isDeleted)}`}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              {isDeleted ? "ĐÃ XOÁ" : vehicle?.status || "—"}
            </span>
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isDeleted}
            >
              <Pencil size={16} /> Chỉnh sửa
            </button>
            {isDeleted ? (
              <button
                onClick={handleRestore}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-500 text-sm text-emerald-600 hover:bg-emerald-50 transition"
              >
                <RotateCcw size={16} /> Khôi phục
              </button>
            ) : (
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <Trash2 size={16} /> Xoá (ẩn)
              </button>
            )}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Thông tin xe</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Biển số</div>
                <div className="font-medium">{vehicle?.licensePlate || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">VIN</div>
                <div className="font-medium">{vehicle?.vin || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Hãng xe</div>
                <div className="font-medium">{vehicle?.brand || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Dòng xe</div>
                <div className="font-medium">{vehicle?.model || vehicle?.type || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Phiên bản</div>
                <div className="font-medium">{vehicle?.variant || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Màu sắc</div>
                <div className="font-medium">{vehicle?.color || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Năm sản xuất</div>
                <div className="font-medium">{vehicle?.year || "—"}</div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Trạng thái & quản trị</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Trạng thái hiện tại</div>
                <div className="font-medium">{vehicle?.status || (isDeleted ? "ĐÃ XOÁ" : "—")}</div>
              </div>
              <div>
                <div className="text-gray-500">Ngày tạo</div>
                <div className="font-medium">{fmtDate(vehicle?.createdAt)}</div>
              </div>
              <div>
                <div className="text-gray-500">Cập nhật gần nhất</div>
                <div className="font-medium">{fmtDate(vehicle?.updatedAt)}</div>
              </div>
              {vehicle?.verification ? (
                <>
                  <div>
                    <div className="text-gray-500">Trạng thái xác thực</div>
                    <div className="font-medium">{vehicle.verification.status || "—"}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Người duyệt</div>
                    <div className="font-medium">
                      {vehicle.verification.reviewer || vehicle.verification.reviewerId || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Thời gian duyệt</div>
                    <div className="font-medium">{fmtDate(vehicle.verification.reviewedAt)}</div>
                  </div>
                </>
              ) : null}
            </div>
            {(vehicle?.notes || vehicle?.note || vehicle?.adminNote || vehicle?.verification?.comment) && (
              <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
                <div className="font-semibold mb-1">Ghi chú</div>
                <div>{vehicle?.adminNote || vehicle?.verification?.comment || vehicle?.notes || vehicle?.note}</div>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Chủ sở hữu</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Tên chủ xe</div>
                <div className="font-medium">{vehicle?.owner?.name || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Email</div>
                <div className="font-medium">{vehicle?.owner?.email || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Số điện thoại</div>
                <div className="font-medium">{vehicle?.owner?.phone || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500">Mã người dùng</div>
                <div className="font-medium">{vehicle?.owner?.id || vehicle?.owner?._id || "—"}</div>
              </div>
            </div>
          </section>

          {metadataEntries.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Thông tin bổ sung</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {metadataEntries.map(([key, value]) => (
                  <div key={key}>
                    <div className="text-gray-500 uppercase text-xs tracking-wide">
                      {key}
                    </div>
                    <div className="font-medium text-gray-800">
                      {typeof value === "string" || typeof value === "number"
                        ? value.toString()
                        : JSON.stringify(value)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {attachments.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Tài liệu đính kèm</h2>
              <ul className="space-y-2 text-sm">
                {attachments.map((item) => (
                  <li key={item.id || item._id || item.url}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {item.name || item.type || item.url || "Tệp đính kèm"}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {loading && (
          <div className="px-6 pb-6 text-sm text-gray-500">Đang tải dữ liệu...</div>
        )}
        {error && (
          <div className="px-6 pb-6 text-sm text-red-600">{error}</div>
        )}
      </div>
    </div>
  );
};

export default VehicleDetail;

