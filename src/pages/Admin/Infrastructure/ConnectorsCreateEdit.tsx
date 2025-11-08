import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save, X } from "lucide-react";
import api from "@libs/axios";
import { useTitle } from "@contexts";

type ConnectorPayload = { stationId: string; chargerId: string; type: string; powerKw: number; status: string; code: string };

const ConnectorsCreateEdit: React.FC = () => {
  const { setTitle } = useTitle();
  const { connectorId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(connectorId);

  type Station = { _id: string; name?: string; code?: string };
  type Charger = { _id: string; stationId?: string; name?: string; code?: string };

  const [stations, setStations] = React.useState<Station[]>([]);
  const [chargers, setChargers] = React.useState<Charger[]>([]);
  const [form, setForm] = React.useState<ConnectorPayload>({ stationId: "", chargerId: "", type: "AC", powerKw: 7.2, status: "IDLE", code: "" });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => { setTitle(isEdit ? "Sửa đầu sạc" : "Thêm đầu sạc"); }, [isEdit, setTitle]);

  const asRecord = (v: unknown): Record<string, unknown> | null =>
    v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;

 ;

  React.useEffect(() => {
    (async () => {
      try {
        const [s, ch] = await Promise.all([
          api.get("/stations", { params: { limit: 1000 } }),
          api.get("/chargers", { params: { limit: 1000 } }),
        ]);
        const sd: unknown = s.data;
        const cd: unknown = ch.data;
        const sl = (Array.isArray(sd) ? sd : (asRecord(sd)?.items ?? asRecord(sd)?.data ?? [])) as Station[];
        const cl = (Array.isArray(cd) ? cd : (asRecord(cd)?.items ?? asRecord(cd)?.data ?? [])) as Charger[];
        setStations(sl);
        setChargers(cl);
        if (!form.stationId && sl[0]?._id) setForm((f) => ({ ...f, stationId: sl[0]._id }));
        if (!form.chargerId && cl[0]?._id) setForm((f) => ({ ...f, chargerId: cl[0]._id }));
      } catch (e: any) {
        toast.error("Không thể tải danh sách trạm/trụ sạc");
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (!isEdit) return;
      try {
        setLoading(true);
        const r = await api.get(`/connectors/${connectorId}`);
        const c = r.data;
        setForm({ stationId: c.stationId, chargerId: c.chargerId, type: c.type, powerKw: c.powerKw, status: c.status, code: c.code });
      } catch (e: any) {
        const errorMsg = e?.response?.data?.message || e?.message || "Không tải được đầu sạc";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally { setLoading(false); }
    })();
  }, [isEdit, connectorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.stationId) {
      toast.error("Vui lòng chọn trạm sạc");
      return;
    }

    if (!form.chargerId) {
      toast.error("Vui lòng chọn trụ sạc");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (isEdit) {
        await api.put(`/connectors/${connectorId}`, form);
        toast.success("Cập nhật đầu sạc thành công!");
      } else {
        await api.post(`/connectors`, form);
        toast.success("Tạo đầu sạc thành công!");
      }
      navigate("/admin/infrastructure/connectors");
    } catch (e: any) {
      const errorMsg = e?.response?.data?.message || e?.message || "Lỗi lưu đầu sạc";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally { setLoading(false); }
  };

  const handleCancel = () => {
    navigate("/admin/infrastructure/connectors");
  };

  if (loading && isEdit) {
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
              {isEdit ? "Chỉnh sửa đầu sạc" : "Tạo đầu sạc mới"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit ? "Cập nhật thông tin đầu sạc" : "Điền thông tin để tạo đầu sạc mới"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Thông tin đầu sạc</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Station */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạm sạc <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.stationId}
                  onChange={(e) => setForm({ ...form, stationId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn trạm</option>
                  {stations.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name || s.code || s._id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Charger */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trụ sạc <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.chargerId}
                  onChange={(e) => setForm({ ...form, chargerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Chọn trụ</option>
                  {chargers.map((ch) => (
                    <option key={ch._id} value={ch._id}>
                      {ch.name || ch.code || ch._id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="AC">AC</option>
                  <option value="DC">DC</option>
                </select>
              </div>

              {/* Power */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Công suất (kW) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  value={form.powerKw || ""}
                  onChange={(e) => setForm({ ...form, powerKw: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập công suất"
                />
              </div>

              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã đầu sạc
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập mã đầu sạc"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="IDLE">IDLE</option>
                  <option value="OFFLINE">OFFLINE</option>
                  <option value="RESERVED">RESERVED</option>
                  <option value="FINISHED">FINISHED</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 text-red-600 text-sm">{error}</div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={16} />
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo đầu sạc"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectorsCreateEdit;


