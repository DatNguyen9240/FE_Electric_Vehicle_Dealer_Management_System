import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save } from "lucide-react";
import api from "@libs/axios";
import { useTitle } from "@contexts";

type VehicleOwner = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
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
  status?: string;
  year?: number;
  color?: string;
  adminNote?: string;
  note?: string;
  notes?: string;
  owner?: VehicleOwner | null;
};

type VehicleDetailResponse =
  | VehicleDetailModel
  | {
      vehicle?: VehicleDetailModel;
      data?: VehicleDetailModel;
    };

const DEFAULT_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
  "ACTIVE",
  "VERIFIED",
];

const normalizeVehicle = (
  payload: VehicleDetailResponse | null
): VehicleDetailModel | null => {
  if (!payload) return null;
  if (payload && typeof payload === "object" && "vehicle" in payload) {
    return (payload as { vehicle?: VehicleDetailModel }).vehicle ?? null;
  }
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data?: VehicleDetailModel }).data ?? null;
  }
  return payload as VehicleDetailModel;
};

const VehicleEdit: React.FC = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { setTitle } = useTitle();

  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [vehicle, setVehicle] = React.useState<VehicleDetailModel | null>(null);
  const [status, setStatus] = React.useState("");
  const [note, setNote] = React.useState("");
  const [statusOptions, setStatusOptions] = React.useState<string[]>(DEFAULT_STATUSES);

  React.useEffect(() => {
    setTitle("Cập nhật thông tin xe");
  }, [setTitle]);

  const extractMessage = (err: unknown, fallback: string) => {
    try {
      const errorLike = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return (
        errorLike?.response?.data?.message || errorLike?.message || fallback
      );
    } catch {
      return fallback;
    }
  };

  const fetchVehicle = React.useCallback(async () => {
    if (!vehicleId) return;
    try {
      setLoading(true);
      const res = await api.get<VehicleDetailResponse>(
        `/admin/vehicles/${vehicleId}`
      );
      const data = normalizeVehicle(res.data);
      setVehicle(data);
      if (data?.status) {
        setStatus(data.status);
        setStatusOptions((prev) =>
          Array.from(
            new Set([
              ...prev,
              data.status.toUpperCase(),
            ])
          )
        );
      }
      const adminNote = data?.adminNote || data?.note || data?.notes || "";
      setNote(adminNote);
    } catch (err) {
      const message = extractMessage(err, "Không thể tải thông tin xe");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  React.useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vehicleId) return;
    const payload: Record<string, unknown> = {};
    if (status) payload.status = status;
    payload.adminNote = note;

    try {
      setSaving(true);
      await api.patch(`/admin/vehicles/${vehicleId}`, payload);
      toast.success("Cập nhật thông tin xe thành công");
      navigate(`/admin/vehicles/view/${vehicleId}`);
    } catch (err) {
      toast.error(extractMessage(err, "Không thể cập nhật thông tin xe"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={16} />
        Quay lại
      </button>

      <div className="bg-white border rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-semibold text-gray-900">
            Cập nhật thông tin xe
          </h1>
          <p className="text-sm text-gray-500">
            {vehicle?.licensePlate || vehicle?.vin || vehicleId || "—"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <div className="text-gray-500">Biển số</div>
              <div className="font-medium">
                {vehicle?.licensePlate || "—"}
              </div>
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
              <div className="text-gray-500">Năm sản xuất</div>
              <div className="font-medium">{vehicle?.year || "—"}</div>
            </div>
            <div>
              <div className="text-gray-500">Chủ sở hữu</div>
              <div className="font-medium">
                {vehicle?.owner?.name || vehicle?.owner?.email || "—"}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="status" className="text-sm font-medium text-gray-700">
                Trạng thái xác thực
              </label>
              <select
                id="status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">-- Chọn trạng thái --</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="note" className="text-sm font-medium text-gray-700">
                Ghi chú quản trị
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={6}
                placeholder="Nhập ghi chú nội bộ cho xe..."
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(`/admin/vehicles/view/${vehicleId}`)}
              className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>

          {loading && (
            <div className="text-sm text-gray-500">Đang tải dữ liệu xe...</div>
          )}
        </form>
      </div>
    </div>
  );
};

export default VehicleEdit;

