import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@libs/axios";
import { useTitle } from "@contexts";

type ChargerPayload = { stationId: string; name: string; code: string; connectorType: string; powerKw: number; status: string };

const ChargersCreateEdit: React.FC = () => {
  const { setTitle } = useTitle();
  const { chargerId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(chargerId);

  const [stations, setStations] = React.useState<any[]>([]);
  const [form, setForm] = React.useState<ChargerPayload>({ stationId: "", name: "", code: "", connectorType: "AC", powerKw: 7.2, status: "ONLINE" });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => { setTitle(isEdit ? "Sửa trụ" : "Tạo trụ"); }, [isEdit, setTitle]);

  React.useEffect(() => {
    (async () => {
      try {
        const s = await api.get("/stations", { params: { limit: 1000 } });
        const list = Array.isArray(s.data) ? s.data : (s.data?.items || []);
        setStations(list);
        if (!form.stationId && list[0]?._id) setForm((f) => ({ ...f, stationId: list[0]._id }));
      } catch {}
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (!isEdit) return;
      try {
        setLoading(true);
        const r = await api.get(`/chargers/${chargerId}`);
        const c = r.data;
        setForm({ stationId: c.stationId, name: c.name, code: c.code, connectorType: c.connectorType, powerKw: c.powerKw, status: c.status });
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || "Không tải được trụ");
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, chargerId]);

  const submit = async () => {
    try {
      setLoading(true);
      setError(null);
      if (isEdit) await api.put(`/chargers/${chargerId}`, form);
      else await api.post(`/chargers`, form);
      navigate("/admin/infrastructure/chargers");
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Lỗi lưu trụ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border max-w-2xl">
        <div className="px-6 py-4 border-b font-semibold">{isEdit ? "Sửa trụ" : "Tạo trụ"}</div>
        <div className="p-6 grid grid-cols-1 gap-4">
          <label className="text-sm">
            <span className="text-gray-600">Trạm</span>
            <select value={form.stationId} onChange={(e) => setForm({ ...form, stationId: e.target.value })} className="mt-1 w-full border rounded px-3 py-2">
              {stations.map((s) => (<option key={s._id} value={s._id}>{s.name || s.code || s._id}</option>))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-gray-600">Tên</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="text-gray-600">Mã</span>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="text-gray-600">Loại</span>
              <select value={form.connectorType} onChange={(e) => setForm({ ...form, connectorType: e.target.value })} className="mt-1 w-full border rounded px-3 py-2">
                <option value="AC">AC</option>
                <option value="DC">DC</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="text-gray-600">Công suất (kW)</span>
              <input type="number" value={form.powerKw} onChange={(e) => setForm({ ...form, powerKw: Number(e.target.value) })} className="mt-1 w-full border rounded px-3 py-2" />
            </label>
          </div>
          <label className="text-sm">
            <span className="text-gray-600">Trạng thái</span>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full border rounded px-3 py-2">
              <option value="ONLINE">ONLINE</option>
              <option value="OFFLINE">OFFLINE</option>
            </select>
          </label>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {loading && <div className="text-gray-500 text-sm">Đang xử lý...</div>}
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button onClick={() => navigate(-1)} className="px-3 py-2 border rounded">Huỷ</button>
          <button onClick={submit} className="px-3 py-2 border rounded bg-blue-600 text-white hover:bg-blue-700">Lưu</button>
        </div>
      </div>
    </div>
  );
};

export default ChargersCreateEdit;


