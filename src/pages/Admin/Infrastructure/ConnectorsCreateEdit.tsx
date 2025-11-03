import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@libs/axios";
import { useTitle } from "@contexts";

type ConnectorPayload = { stationId: string; chargerId: string; type: string; powerKw: number; status: string; code: string };

const ConnectorsCreateEdit: React.FC = () => {
  const { setTitle } = useTitle();
  const { connectorId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(connectorId);

  const [stations, setStations] = React.useState<any[]>([]);
  const [chargers, setChargers] = React.useState<any[]>([]);
  const [form, setForm] = React.useState<ConnectorPayload>({ stationId: "", chargerId: "", type: "AC", powerKw: 7.2, status: "IDLE", code: "" });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => { setTitle(isEdit ? "Sửa đầu sạc" : "Thêm đầu sạc"); }, [isEdit, setTitle]);

  React.useEffect(() => {
    (async () => {
      try {
        const [s, ch] = await Promise.all([
          api.get("/stations", { params: { limit: 1000 } }),
          api.get("/chargers", { params: { limit: 1000 } }),
        ]);
        const sl = Array.isArray(s.data) ? s.data : (s.data?.items || []);
        const cl = Array.isArray(ch.data) ? ch.data : (ch.data?.items || []);
        setStations(sl);
        setChargers(cl);
        if (!form.stationId && sl[0]?._id) setForm((f) => ({ ...f, stationId: sl[0]._id }));
        if (!form.chargerId && cl[0]?._id) setForm((f) => ({ ...f, chargerId: cl[0]._id }));
      } catch {}
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
        setError(e?.response?.data?.message || e?.message || "Không tải được đầu sạc");
      } finally { setLoading(false); }
    })();
  }, [isEdit, connectorId]);

  const submit = async () => {
    try {
      setLoading(true); setError(null);
      if (isEdit) await api.put(`/connectors/${connectorId}`, form);
      else await api.post(`/connectors`, form);
      navigate("/admin/infrastructure/connectors");
    } catch (e: any) { setError(e?.response?.data?.message || e?.message || "Lỗi lưu đầu sạc"); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border max-w-2xl">
        <div className="px-6 py-4 border-b font-semibold">{isEdit ? "Sửa đầu sạc" : "Thêm đầu sạc"}</div>
        <div className="p-6 grid grid-cols-1 gap-4">
          <label className="text-sm">
            <span className="text-gray-600">Trạm</span>
            <select value={form.stationId} onChange={(e) => setForm({ ...form, stationId: e.target.value })} className="mt-1 w-full border rounded px-3 py-2">
              {stations.map((s) => (<option key={s._id} value={s._id}>{s.name || s.code || s._id}</option>))}
            </select>
          </label>
          <label className="text-sm">
            <span className="text-gray-600">Trụ</span>
            <select value={form.chargerId} onChange={(e) => setForm({ ...form, chargerId: e.target.value })} className="mt-1 w-full border rounded px-3 py-2">
              {chargers.map((ch) => (<option key={ch._id} value={ch._id}>{ch.name || ch.code || ch._id}</option>))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="text-gray-600">Loại</span>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 w-full border rounded px-3 py-2">
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
            <span className="text-gray-600">Mã</span>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="text-gray-600">Trạng thái</span>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full border rounded px-3 py-2">
              <option value="IDLE">IDLE</option>
              <option value="OFFLINE">OFFLINE</option>
              <option value="RESERVED">RESERVED</option>
              <option value="FINISHED">FINISHED</option>
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

export default ConnectorsCreateEdit;


